import * as inquirer from "inquirer";
import Customer from "./Types/Customer";
import Users from "./Users";
import Api from "./Api";
import LocationItem from "./Types/LocationItem";
import Display from "./Display";
import TicketItem from "./Types/TicketItem";
import ClassItem from "./Types/ClassItem";

export const CREATE_NEW_USER = "CREATE_NEW_USER";

export enum Action {
    "VIEW_CALENDAR",
    "REGISTER_TICKET",
    "REGISTER_COURSE",
    "REGISTER_LOCATION",
    "EXIT",
}

export enum Location {
    "SWIMMING" = "Zwemmen",
    "SQUASH" = "Squash",
    "TENNIS" = "Tennis",
}

const locations = [{
    name: "Swimming",
    value: Location.SWIMMING,
}, {
    name: "Tennis",
    value: Location.TENNIS,
}, {
    name: "Squash",
    value: Location.SQUASH,
}];

const actions = [{
    name: "View calendar",
    value: Action.VIEW_CALENDAR,
    short: "Calendar",
}, {
    name: "Register ticket",
    value: Action.REGISTER_TICKET,
}, {
    name: "Register course",
    value: Action.REGISTER_COURSE,
}, {
    name: "Register location",
    value: Action.REGISTER_LOCATION,
}, {
    name: "Leave application",
    value: Action.EXIT,
    short: "Exit",
}];

class Choice {
    public readonly name: string;
    public readonly value: string;
    public readonly short?: string;

    constructor(name: string, value, short: string = "") {
        this.name = name;
        this.value = value;
        if (short) this.short = short;
    }
}

export default class Inquirer {
    /**
     * Creates a list of choices that can be used by the inquirer to ask a question.
     *
     * @param {Customer[]} customers An list of customers.
     *
     * @returns {string[]} An formatted array of customers with the option to create a new user.
     */
    private static createUserChoices(customers: Customer[]): Choice[] {
        const choices = customers.map(customer => new Choice(
            `${customer.voornaam} ${customer.voorvoegsels}${customer.achternaam}`,
            customer.klantId,
            customer.voornaam,
        ));
        choices.push(new Choice(
            "Create a new user",
            CREATE_NEW_USER,
            "New",
        ));
        return choices;
    }

    private static async askLocationChoice(): Promise<Location> {
        const question = [{
            name: "location",
            type: "list",
            message: "What kind of location do you want to register?",
            choices: locations,
        }];
        const result: { location: Location } = await inquirer.prompt(question);
        return result.location;
    }

    private static createLocationChoices(locations: LocationItem[]): Choice[] {
        const choices = locations.map(location => new Choice(
            location.datum
            + " | "
            + Display.formatDate(location.start).toLocaleTimeString("nl-NL", {hour12: false,})
            + " | "
            + Display.formatDate(location.eind).toLocaleTimeString("nl-NL", {hour12: false,})
            + " | "
            + (parseInt(location.maxInschrijvingen, 10) - parseInt(location.inschrijvingen, 10)).toString(),
            location.planregelId,
        ));
        choices.unshift(new Choice("Add a block that is in the future", "WAIT", "Future"));
        return choices;
    }

    private static createTicketChoices(tickets: TicketItem[]): Choice[] {
        const maxLength = tickets
            .map( ticket => ticket.naam.length )
            .reduce( (maxLength: number, current: number) => current > maxLength ? current : maxLength );
        return tickets.map(ticket => {
            return new Choice(
                ticket.naam.padEnd( maxLength, " " )
                + "\t | "
                + ticket.datum
                + "\t| "
                + Display.formatDate(ticket.start).toLocaleTimeString("nl-NL", {hour12: false,})
                + "\t| "
                + Display.formatDate(ticket.eind).toLocaleTimeString("nl-NL", {hour12: false,}),
                ticket.planregelId,
                ticket.naam,
            )
        } );
    }

    private static createClassChoices(classes: ClassItem[]): Choice[] {
        const maxLength = classes
            .map( course => course.naam.length )
            .reduce( (maxLength: number, current: number) => current > maxLength ? current : maxLength );
        return classes.map(classItem => new Choice(
            classItem.naam.padEnd( maxLength, " " )
            + "\t| "
            + Display.formatDate(classItem.eersteStart).toLocaleDateString("nl-NL")
            + "\t| "
            + Display.formatDate(classItem.eersteStart).toLocaleTimeString("nl-NL", {hour12: false,}),
            classItem.aanbodId,
            classItem.naam,
        ));
    }

    private static async askDateAndTime(): Promise<{ date: string, time: string }> {
        const questions = [{
            name: "date",
            type: "input",
            message: "Please enter a date (YYYY-mm-dd).",
            validate: date => {
                const [year, month, day] = date.split("-");
                if (!(year && month && day)) return false;
                return !(year < 2019 || month > 12 || month < 1 || day > 31 || day < 1);
            },
        }, {
            name: "time",
            type: "input",
            message: "Please enter a time (HH:ii).",
            validate: time => {
                const [hour, minutes] = time.split(":");
                if (!(hour && minutes)) return false;
                return !(hour < 0 || hour > 24 || minutes < 0 || minutes > 60);

            }
        }];
        return inquirer.prompt(questions);
    }

    /**
     * Ask the user for his or her credentials.
     *
     * @returns {Promise<string, string>} An object containing the entered username and password.
     */
    public static async askUserCredentials(): Promise<{ username: string, password: string }> {
        const questions = [{
            name: "username",
            type: "input",
            message: "Enter your RSC username (sxxxxxxx for RU).",
            validate: value => value.length > 0,
        }, {
            name: "password",
            type: "password",
            message: "Please enter your password.",
            validate: value => value.length > 0,
        }];
        return inquirer.prompt(questions);
    }

    /**
     * Allows the user of the program to select a registered user or create a new one.
     *
     * @param {Customer[]} customers An list of registered customers.
     *
     * @returns {Customer} Either a registered Customer or a new Customer.
     */
    public static async selectUser(customers: Customer[]): Promise<Customer> {
        const question = [{
            type: "list",
            name: "selectUser",
            message: "Select your user or create a new one",
            choices: Inquirer.createUserChoices(customers),
        }];
        const choice: { selectUser: string } = await inquirer.prompt(question);

        // If we don't need to create a new user we simply return the selected customer by filtering the array.
        if (choice.selectUser !== CREATE_NEW_USER) {
            // Return the first element from the filtered array.
            return customers.filter(customer => customer.klantId === choice.selectUser)[0];
        }

        return Users.createNew();
    }

    public static async whatToDo(): Promise<Action> {
        const question = [{
            type: "list",
            name: "action",
            message: "What do you want to do?",
            choices: actions,
        }];
        const result: { action: Action } = await inquirer.prompt(question);
        return result.action;
    }

    public static async addToQueue() {
        const question = [{
            type: "confirm",
            name: "addToQueue",
            message: "Do you want to put the reservation in the queue?",
            default: true,
        }];
        return inquirer.prompt(question);
    }

    public static async registerTicket(customer: Customer): Promise<TicketItem> {
        const tickets = await Api.getTickets(customer);
        const question = [{
            type: "list",
            name: "ticket",
            message: "For which ticket do you want to register?",
            choices: Inquirer.createTicketChoices(tickets),
        }];
        const result: { ticket: string } = await inquirer.prompt(question);
        return tickets.filter(ticket => ticket.planregelId === result.ticket)[0];
    }

    public static async registerClass(customer: Customer): Promise<ClassItem> {
        const classes: ClassItem[] = await Api.getClasses(customer);
        const question = [{
            type: "list",
            name: "classItem",
            message: "For which class do you want to register?",
            choices: Inquirer.createClassChoices(classes),
        }];
        const result: { classItem: string } = await inquirer.prompt(question);
        return classes.filter(classItem => classItem.aanbodId === result.classItem)[0];
    }

    public static async registerLocation(customer: Customer): Promise<LocationItem> {
        const locationOfChoice = await Inquirer.askLocationChoice();
        const locations = await Api.getLocations(customer);
        const filteredLocations = locations.filter(location => location.catalogusId === locationOfChoice);
        const question = [{
            type: "list",
            name: "location",
            message: "For which location do you want to register?",
            choices: Inquirer.createLocationChoices(filteredLocations),
        }];
        const result: { location: string } = await inquirer.prompt(question);

        if (result.location === "WAIT") {
            const {date, time} = await Inquirer.askDateAndTime();
            throw {message: "WAIT", date, time, choice: locationOfChoice};
        }

        return filteredLocations.filter(location => location.planregelId === result.location)[0];
    }
}