import Api from "./Api";
import Inquirer, {Action} from "./Inquirer";
import Users from "./Users";
import Customer from "./Types/Customer";
import Display from "./Display";
import Queue from "./Queue";

process.on('unhandledRejection', err => {
    console.log( err );
} );

const setup = async () => {
    const customerList: Customer[] = Users.getStored();
    const user = await Inquirer.selectUser( customerList );
    while( true ){
        await run( user );
    }
};

const run = async ( user ) => {
    const choice = await Inquirer.whatToDo();
    switch (choice) {
        case Action.EXIT: process.exit( 0 );  break;
        case Action.REGISTER_COURSE: console.log( "Register for courses" ); break;
        case Action.REGISTER_TICKET: console.log( "Register for ticket" ); break;
        case Action.REGISTER_LOCATION:
            const location = await Inquirer.registerLocation( user );
            if ( await Api.registerLocation( user, location ) ){
                break;
            }
            if ( ! await Inquirer.addToQueue() ){
                break;
            }
            // Add the registration to the queue.
            Queue.add( { klantId: user.klantId, location: location.planregelId } );
            break;
        case Action.VIEW_CALENDAR: await Display.calendar( user ); break;
    }
};

setup();