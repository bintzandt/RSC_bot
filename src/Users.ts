import * as Configstore from "configstore";
import Customer from "./Types/Customer";
import Inquirer from "./Inquirer";
import Api from "./Api";
import * as packageJSON from "../package.json"

const conf = new Configstore( packageJSON.name );

/**
 * Class responsible for creating, retrieving and storing the Users of the application.
 */
export default class Users {
    /**
     * Gets an array of stored customers from the config file.
     *
     * @returns {Customer[]} An array of registered customers.
     */
    public static getStored(): Customer[] {
        return conf.get( "users" ) || [];
    }

    /**
     * Stores a new customer in the config file.
     *
     * @param {Customer} customer The customer that will be saved.
     *
     * @returns {Customer} The customer that is saved.
     */
    public static storeNew( customer: Customer ): Customer {
        const storedCustomers = Users.getStored();
        storedCustomers.push( customer );
        conf.set( "users", storedCustomers );
        return customer;
    }

    /**
     * Creates a new customer by asking for their credentials and making an API call.
     *
     * @returns {Customer} The newly created customer.
     */
    public static async createNew(): Promise<Customer> {
        const { username, password } = await Inquirer.askUserCredentials();
        // If an error occurs this means that something has gone wrong with the login attempt. Try again.
        try {
            return Users.storeNew( await Api.logInUser( username, password ) );
        } catch (e) {
            console.error( e );
            this.createNew();
        }
    }

    public static find( klantId: string ): Customer {
        return this.getStored().filter( customer => customer.klantId === klantId )[ 0 ];
    }
}