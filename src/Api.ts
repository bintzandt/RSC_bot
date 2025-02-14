import * as request from "request-promise-native";
import Customer from "./Types/Customer";
import LocationItem from "./Types/LocationItem";
import TicketItem from "./Types/TicketItem";
import CalendarItem from "./Types/CalendarItem";
import ClassItem from "./Types/ClassItem";
import RegisterLocationResponse from "./Types/RegisterLocationResponse";
import RegisterTicketResponse from "./Types/RegisterTicketResponse";
import RegisterClassResponse from "./Types/RegisterClassResponse";
import Console from "./Console";
import Inquirer from "./Inquirer";
import Queue from "./Queue";

const baseUrl: string = "https://publiek.usc.ru.nl/app/api/v1/?module={module}&method={method}";

/**
 * Class for handling the interaction with the RSC API.
 */
export default class Api {
	/**
	 * Function to send a logIn request to the API server.
	 *
	 * @param {string} username Name of the user.
	 * @param {string} password Password of the user.
	 *
	 * @returns {Promise<Customer>} A promise for the logged in user.
	 */
	public static async logInUser( username: string, password: string ): Promise<Customer> {
		const url = Api.formatUrl( "user", "logIn" );
		const response: Customer = await request.post( url, {
			form: {
				username,
				password,
			},
			json: true,
		} );
		return Api.checkResponseForErrors( response );
	}

	/**
	 * Gets the current calendar for the user. This means all the tickets, courses
	 * and locations the user has registered for.
	 *
	 * @param {Customer} customer The customer.
	 *
	 * @returns {Promise<CalendarItem[]>} An array of current CalendarItems.
	 */
	public static async getCalendar( customer: Customer ): Promise<CalendarItem[]> {
		const url = Api.formatUrl( "agenda", "getAgenda" );
		const response: CalendarItem[] = await request.post( url, {
			form: {
				klantId: customer.klantId,
				token: customer.token,
			},
			json: true,
		} );
		return Api.checkResponseForErrors( response );
	}

	/**
	 * Get all location hours that are currently open for registration.
	 *
	 * @param {Customer} customer The customer credentials.
	 *
	 * @returns {Promise<LocationItem[]>} An list of locationItems.
	 */
	public static async getLocations( customer: Customer ): Promise<LocationItem[]> {
		const url = Api.formatUrl( "locatie", "getLocaties" );
		const result = await request.post( url, {
			form: {
				klantId: customer.klantId,
				token: customer.token,
			},
			json: true,
		} );
		return Api.checkResponseForErrors( result );
	}

	/**
	 * Get an overview of all possible tickets for a customer.
	 *
	 * @param {Customer} customer The customer credentials.
	 *
	 * @returns {Promise<TicketItem[]>} A list of TicketItems.
	 */
	public static async getTickets( customer: Customer ): Promise<TicketItem[]> {
		const url = Api.formatUrl( "ticketuur", "getTicketuren" );
		const result = await request.post( url, {
			form: {
				klantId: customer.klantId,
				token: customer.token,
			},
			json: true,
		} );
		return Api.checkResponseForErrors( result );
	}

	/**
	 * Get an overview of all possible classes for a customer.
	 *
	 * @param {Customer} customer The customer credentials.
	 *
	 * @returns {Promise<ClassItem[]>} A list of ClassItems.
	 */
	public static async getClasses( customer: Customer ): Promise<ClassItem[]> {
		const url = Api.formatUrl( "cursus", "getCursussen" );
		const result = await request.post( url, {
			form: {
				klantId: customer.klantId,
				token: customer.token,
			},
			json: true,
		} );
		return Api.checkResponseForErrors( result );
	}

	/**
	 * Register a user for a certain location hour.
	 *
	 * @param {Customer} customer The credentials of the user.
	 * @param {LocationItem} location The location hour to register the user for.
	 *
	 * @returns {RegisterLocationResponse} The response from the API.
	 */
	public static async registerLocation( customer: Customer, location: LocationItem ): Promise<RegisterLocationResponse> {
		const url = Api.formatUrl( "locatie", "addLinschrijving" );
		const result: RegisterLocationResponse = await request.post( url, {
			form: {
				klantId: customer.klantId,
				token: customer.token,
				inschrijvingId: location.inschrijvingId,
				poolId: location.poolId,
				laanbodId: location.laanbodId,
				start: location.start,
				eind: location.eind,
			},
			json: true,
		} );
		return Api.checkResponseForErrors( result );
	}

	/**
	 * Register a user for a certain ticket hour.
	 *
	 * @param {Customer} customer The customer to register.
	 * @param {TicketItem} ticket The TicketHour to register.
	 *
	 * @returns {RegisterTicketResponse} The response from the API.
	 */
	public static async registerTicket( customer: Customer, ticket: TicketItem ): Promise<RegisterTicketResponse> {
		const url = this.formatUrl( "ticketuur", "addTinschrijving" );
		const result: RegisterTicketResponse = await request.post( url, {
			form: {
				klantId: customer.klantId,
				token: customer.token,
				inschrijvingId: ticket.inschrijvingId,
				poolId: ticket.poolId,
				planregelId: ticket.planregelId,
			},
			json: true,
		} );
		return Api.checkResponseForErrors( result );
	}

	/**
	 * Register a user for a class.
	 *
	 * @param {Customer} customer The customer to register.
	 * @param {ClassItem} classItem The class to register the customer for.
	 *
	 * @returns {RegisterClassResponse} The response from the API.
	 */
	public static async registerClass( customer: Customer, classItem: ClassItem ): Promise<RegisterClassResponse> {
		const url = this.formatUrl( "cursus", "addInschrijving" );
		const result: RegisterClassResponse = await request.post( url, {
			form: {
				klantId: customer.klantId,
				token: customer.token,
				aanbodId: classItem.aanbodId,
			},
			json: true,
		} );
		return Api.checkResponseForErrors( result );
	}

	public static async handleReservation<T>( customer: Customer, toReserve: T ){
		if ( toReserve instanceof ClassItem ){
			Console.success( "ClassItem" );
		}
		if ( toReserve instanceof CalendarItem ){
			Console.success( "CalendarItem" );
		}
		if ( toReserve instanceof TicketItem ){
			Console.success( "TicketItem" );
		}
		// if ( await Api.registerClass( user, classItem ) ) {
		// 	Console.success( `The reservation for ${ classItem.naam } was successful.` );
		// 	break;
		// }
		// if ( ! await Inquirer.addToQueue() ) {
		// 	break;
		// }

		// Add the registration to the queue.
		// Queue.add( { klantId: user.klantId, classItem: classItem.aanbodId } );
		// break;
	}

	/**
	 * Function to format the baseUrl in a valid URL that can be used to send a request.
	 *
	 * @param {string} module The module for which the request is meant.
	 * @param {string} method The method that is called.
	 *
	 * @returns {string} An formatted URL that can be used in the request.
	 */
	private static formatUrl( module: string, method: string ): string {
		return baseUrl
			.replace( "{module}", module )
			.replace( "{method}", method );
	}

	/**
	 * The RSC API does not use the default HTTP status codes to display errors. Since all requests come back with a
	 * 200 code (success), we manually have to verify whether the request succeeded. This is done by checking for the
	 * existence of an "error" property in the response.
	 *
	 * This method can be extended when other ways of communicating errors are discovered.
	 *
	 * @param {object} response The response object.
	 *
	 * @throws An error when there is an "error" property in the response object.
	 *
	 * @returns {object} The unaltered response object when no error is discovered.
	 */
	private static checkResponseForErrors<T>( response: T ): T {
		if ( response.hasOwnProperty( "error" ) ) {
			throw response[ "error" ];
		}
		return response;
	}

}