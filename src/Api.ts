import * as request from "request-promise-native";
import CustomerResponse from "./Types/CustomerResponse";
import Customer from "./Types/Customer";
import LocationItem from "./Types/LocationItem";
import TicketItem from "./Types/TicketItem";
import CalendarItem from "./Types/CalendarItem";

/**
 * Class for handling the interaction with the RSC API.
 */
export default class Api {
    private baseUrl: string = "https://publiek.usc.ru.nl/app/api/v1/?module={module}&method={method}";

    /**
     * Function to format the baseUrl in a valid URL that can be used to send a request.
     *
     * @param {string} module The module for which the request is meant.
     * @param {string} method The method that is called.
     *
     * @returns {string} An formatted URL that can be used in the request.
     */
    private formatUrl( module: string, method: string ): string {
        return this.baseUrl
            .replace( "{module}", module )
            .replace( "{method}", method );
    }

    private checkResponseForErrors( response ) {
        if ( response.hasOwnProperty( "error" ) ){
            throw response.error;
        }
        return response;
    }

    /**
     * Function to send a logIn request to the API server.
     *
     * @param {string} username Name of the user.
     * @param {string} password Password of the user.
     *
     * @returns {Promise<Customer>} A promise for the logged in user.
     */
    public async logInUser( username: string, password: string ): Promise<Customer> {
        const url = this.formatUrl( "user", "logIn" );
        const response: Customer = await request.post( url, {
            form: {
                username,
                password,
            },
            json: true,
        } );
        return this.checkResponseForErrors( response );
    }

    /**
     * Gets the current calendar for the user. This means all the tickets, courses
     * and locations the user has registered for.
     *
     * @param {Customer} customer The customer.
     *
     * @returns {Promise<CalendarItem[]>} An array of current CalendarItems.
     */
    public async getCalendar( customer: Customer ): Promise<CalendarItem> {
        const url = this.formatUrl( "agenda", "getAgenda" );
        return request.post( url, {
            form: {
                klantId: customer.klantId,
                token: customer.token,
            },
        } );
    }

    /**
     * Get all location hours that are currently open for registration.
     *
     * @param {Customer} customer The customer credentials.
     *
     * @returns {Promise<LocationItem[]>} An list of locationItems.
     */
    public async getLocations( customer: Customer ): Promise<LocationItem[]> {
        const url = this.formatUrl( "locatie", "getLocaties" );
        return request.post( url, {
            form: {
                klantId: customer.klantId,
                token: customer.token,
            },
            json: true,
        } );
    }

    /**
     * Register a user for a certain location hour.
     *
     * @param {Customer} customer The credentials of the user.
     * @param {LocationItem} location The location hour to register the user for.
     *
     * @returns {string} The registrationId.
     */
    public async registerLocation( customer: Customer, location: LocationItem ){
        const url = this.formatUrl( "locatie", "addLinschrijving" );
        return request.post( url, {
            form: {
                klantId: customer.klantId,
                token: customer.token,
                inschrijvingId: location.inschrijvingId,
                poolId: location.poolId,
                laanbodId: location.laanbodId,
                start: location.start,
                eind: location.eind,
            }
        } );
    }

}