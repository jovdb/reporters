/// <reference path="../interfaces.d.ts" />
interface INotityOptions {
    /** filter or adjust messages to notify, eg: only errors */
    filter?: (messages: IMessage[]) => IMessage[];
    notifyOptions?: (options: any, message: IMessage) => any;
    shortPath?: boolean | string;
}
