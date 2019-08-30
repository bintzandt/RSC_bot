import * as inquirer from "inquirer";

export default class Inquirer {
    public async askUserCredentials() {
        const questions = [ {
            name: "username",
            type: "input",
            message: "Enter your RSC username (sxxxxxxx for RU).",
            validate: value => value.length > 0,
        }, {
            name: "password",
            type: "password",
            message: "Please enter your password.",
            validate: value => value.length > 0,
        } ];
        const result = await inquirer.prompt( questions );
        return result as { username: string, password: string };
    }
}