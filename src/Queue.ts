import * as Configstore from "configstore";
import * as packageJSON from "../package.json";

const conf = new Configstore( packageJSON.name );
const key = "queue";

export default class Queue {
	public static get() {
		return conf.get( key ) || [];
	}

	public static add( request ) {
		const requests = this.get();
		requests.push( request );
		conf.set( key, requests );
	}

	public static save( queue ) {
		conf.set( key, queue );
	}
}