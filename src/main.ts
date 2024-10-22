import Api from "./Api";
import Inquirer, { Action } from "./Inquirer";
import Users from "./Users";
import Customer from "./Types/Customer";
import Display from "./Display";
import Queue from "./Queue";
import Console from "./Console";

process.on( "unhandledRejection", err => {
	console.log( err );
} );

const setup = async () => {
	const customerList: Customer[] = Users.getStored();
	const user = await Inquirer.selectUser( customerList );
	while ( true ) {
		await run( user );
	}
};

const run = async ( user ) => {
	const choice = await Inquirer.whatToDo();
	switch ( choice ) {
		case Action.EXIT:
			process.exit( 0 );
			break;
		case Action.REGISTER_COURSE:
			const classItem = await Inquirer.registerClass( user );
			await Api.handleReservation( user, classItem );
			break;
		case Action.REGISTER_TICKET:
			const ticket = await Inquirer.registerTicket( user );
			await Api.registerTicket( user, ticket );
			break;
		case Action.REGISTER_LOCATION:
			let location;
			try {
				location = await Inquirer.registerLocation( user );
			} catch ( e ) {
				Queue.add( { klantId: user.klantId, location: { date: e.date, time: e.time, type: e.choice } } );
				Console.success( "Reservation for " + e.choice + " has been added to the Queue." );
				break;
			}
			if ( await Api.registerLocation( user, location ) ) {
				break;
			}
			if ( ! await Inquirer.addToQueue() ) {
				break;
			}
			// Add the registration to the queue.
			Queue.add( { klantId: user.klantId, location: location.planregelId } );
			break;
		case Action.VIEW_CALENDAR:
			await Display.calendar( user );
			break;
	}
};

setup();