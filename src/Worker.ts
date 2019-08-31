import Queue from "./Queue";
import Users from "./Users";
import Api from "./Api";
import LocationItem from "./Types/LocationItem";

const getLocation = ( location, listOfLocations: LocationItem[] ): LocationItem => {
    const planRegelId = parseInt( location, 10 );
    if ( isNaN( planRegelId ) ) {
    } else {
        const location = listOfLocations.filter( location => parseInt( location.planregelId, 10 ) === planRegelId )[ 0 ];
        if ( location === undefined ) throw new Error( "expired" );
        return location;
    }
};

const run = async() => {
    // Retrieve the Queue and all possible locations.
    const queue = Queue.get();
    const locations = await Api.getLocations( Users.getStored()[ 0 ] );

    if ( queue.length === 0 ){
        console.log( "\x1b[33m%s\x1b[0m", "Queue is empty, waiting..." );
        return wait5minutes();
    }

    const newQueue = await Promise.all( queue.map( async task => {
        try {
            const customer = Users.find( task.klantId );
            // Handle a location registration request
            if ( task.hasOwnProperty( "location" ) ){
                if ( ! await Api.registerLocation( customer, getLocation( task.location, locations ) ) ){
                    return task;
                }
                return null;
            }
        } catch (e) {
            if ( e.message !== "expired" ){
                return task;
            }
        }
    } ) );

    Queue.save( newQueue.filter( item => item ) );
    return wait5minutes();
};

const wait5minutes = () => {
    setTimeout( () => run(), 300000 );
};

run();