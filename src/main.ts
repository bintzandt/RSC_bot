import Api from "./Api";
import Inquirer from "./Inquirer";
import Customers from "./Customers";

const api = new Api();
const inquirer = new Inquirer();
const customers = new Customers();

process.on('unhandledRejection', err => {
    console.log( err );
} );

const run = async () => {
    console.log( customers.getStored() );
    // const { username, password } = await inquirer.askUserCredentials();
    // console.log( username, password );
    // const customer = await api.logInUser( username, password );
    // console.log( customer );
    // customers.storeNew( customer );
    // const calendar =  await api.getCalendar( customer );
    // console.log( calendar );
};

run();