export default class Console {
	/**
	 * Log a text in green to the console.
	 *
	 * @param {string} text The text to log to the console.
	 */
	public static success( text: string ): void {
		console.log( "\x1b[32m%s\x1b[0m", text );
	}

	/**
	 * Log a text in red to the console.
	 *
	 * @param {string} text The text to log to the console.
	 */
	public static error( text: string ): void {
		console.log( "\x1b[31m%s\x1b[0m", text );
	}

	/**
	 * Log a text in yellow to the console.
	 *
	 * @param {string} text The text to log to the console.
	 */
	public static warn( text: string ): void {
		console.log( "\x1b[33m%s\x1b[0m", text );
	}
}