/// <reference path="../../typings/source-map/source-map.d.ts" />
/** Create a reporter for a specific node module, messages are captured and send to the output.
* @param name name of the internal reporter that captures messages
* @param options Optional options for this reporter
*/
declare function reporters(name: string, options?: IInputOptions): IInput;
/** Collection of reporters the gather information of different node modules in a uniform way to log them all in the same format. */
declare module reporters {
    /** Enable debug messages */
    var debug: boolean;
    /** Function or array of functions that can handle messages.
    * Assign one or more results from getOutput(...)
    */
    var output: IOutput[] | IOutput;
    function logDebug(...args: any[]): void;
    /** Get a list of availabe built-in reporters that create messages */
    function getAvailable(): string[];
    /** Get function that creates a reporter for a node module
    * @param name name of the reporter to return a create method for
    */
    function getInputCreator(name: string): IInputCreator;
    /** Get a preconfigured function that handles messages by name
    * Use reporters.getOutputs() to get a list of available outputs.
    * @param name name of the internal output handler to load that will report messages
    * @param options Optional options for this output
    */
    function getOutput(name: string, options?: any): IOutput;
    /** Get a list of available functions that can handle messages */
    function getOutputs(): string[];
    /** Called before reporting
    * This is your change to filter or update messages
    */
    function filterOrUpdate(messages: IMessage[]): IMessage[];
    function wrapReporter(sourceName: string, reporterCreator: IInputCreator, options?: IInputOptions): IInput;
    /** Report messages to the configured outputs
    * @param messages a list of messages that should be handled by the output (list).
    */
    function report(messages: IMessage[]): void;
}
export = reporters;
