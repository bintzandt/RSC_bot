import * as Configstore from "configstore";
import Customer from "./Types/Customer";

const conf = new Configstore( "zwembot" );

export default class Customers {
    public getStored(): Customer[] {
        return conf.get( "users" ) || [];
    }

    public storeNew( customer: Customer ){
        const storedCustomers = this.getStored();
        storedCustomers.push( customer );
        conf.set( "users", storedCustomers );
    }
}