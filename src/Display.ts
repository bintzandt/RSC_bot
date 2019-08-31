import Customer from "./Types/Customer";
import Api from "./Api";
import {Line, LineBuffer } from "clui";
import clear = require("clear");
import clc = require("cli-color");
import CalendarItem from "./Types/CalendarItem";

export default class Display {
    /**
     * The RSC API delivers dates in a very weird format. This function is used for making sense of that format.
     *
     * @param dateString
     */
    public static formatDate( dateString: string ): Date {
        return new Date( parseInt( dateString, 10 ) * 1000 );
    }

    public static async calendar( customer: Customer ){
        clear();
        const calendar = await Api.getCalendar( customer );
        const lineBuffer = new LineBuffer( { x: 0, y: 0, height: "console", width: "console" } );

        // Add headers for the calendar.
        lineBuffer.addLine( new Line()
            .column( "Name", 20, [clc.bold, clc.red] )
            .column( "Date", 20, [clc.bold, clc.red] )
            .column( "From", 20, [clc.bold, clc.red] )
            .column( "Until", 20, [clc.bold, clc.red] )
            .column( "Instructor", 20, [clc.bold, clc.red] )
        );

        calendar.forEach( item => {
            lineBuffer.addLine( new Line()
              .column( item.naam, 20 )
              .column( Display.formatDate( item.start ).toLocaleDateString( "en-GB" ), 20 )
              .column( Display.formatDate( item.start ).toLocaleTimeString( "en-GB" ), 20 )
              .column( Display.formatDate( item.eind ).toLocaleTimeString( "en-GB" ), 20 )
              .column( item.docent, 20 )
            );
        } );

        lineBuffer.output();
    }
}