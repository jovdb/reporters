/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/source-map/source-map.d.ts" />
interface IReporters {
    /** Returns a function to create a reporter */
    (inputName: string, options?: IInputOptions): IInput;
    /** Logs detailed information of what is done. */
    debug: boolean;
    /** This is your change to remove or update messages before they are logged. */
    /**
    * This method is used to handle messages.
    * This method is usefull to call when you write your own reporter and you want to log them in the same way as the other reporters.
    */
    report(messages: IMessage[]): void;
    /**
    * Returns a list of available reporters.
    * You can use one of the available reporters by calling `reporters(sourceName)`:
    */
    sources: string[];
}
/** Represents a Reporter, can be anything: function, object, ... */
interface IInput {
}
/** Options that can be passed when creating a reporter */
interface IInputOptions {
    /** log input of reporter */
    debug?: boolean;
    /** Default: autodetect, false: don't use sourceMap, or relative path to sourcemap */
    sourceMaps?: boolean | string;
}
interface IInputCreator {
    /** Internal function that returns a reporter
    * @param done call with extracted messages
    * @param options set of options that reprorter can use
    */
    (done: (messages: IMessage[]) => void, options?: IInputOptions): IInput;
}
/** Minimum interface of a message to log */
interface IMessage {
    /** input reporter name (eg: jshint)*/
    sourceName: string;
    /** File location where error/warning/info is located */
    filePath?: string;
    /** Line number where error/warning/info is located, starting from 1 */
    lineNbr?: number;
    /** Column number where error/warning/info is located, starting from 1 */
    colNbr?: number;
    /** message type: error, warning, info */
    type?: string;
    /** warning/error/info code of this message */
    code?: string;
    /** Description of the error/warning/info */
    description: string;
    /** Options used at input */
    options?: IInputOptions;
    /** when file is not yet saved, you can pass a Vinyl File (eg: from gulp stream)
    * This can be used to extract inline sourcemap information
    */
    getFile?: () => IVinylFile;
}
/** Vinyl File */
interface IVinylFile {
    /**
    * Default: process.cwd()
    */
    cwd: string;
    /**
    * Used for relative pathing. Typically where a glob starts.
    */
    base: string;
    /**
    * Full path to the file.
    */
    path: string;
    /**
    * Type: Buffer|Stream|null (Default: null)
    */
    contents: any;
    /**
    * Returns path.relative for the file base and file path.
    * Example:
    *  var file = new File({
    *    cwd: "/",
    *    base: "/test/",
    *    path: "/test/file.js"
    *  });
    *  console.log(file.relative); // file.js
    */
    relative: string;
    isBuffer(): boolean;
    isStream(): boolean;
    isNull(): boolean;
    isDirectory(): boolean;
    /**
    * Returns a new File object with all attributes cloned. Custom attributes are deep-cloned.
    */
    clone(opts?: {
        contents?: boolean;
    }): File;
    /**
    * If file.contents is a Buffer, it will write it to the stream.
    * If file.contents is a Stream, it will pipe it to the stream.
    * If file.contents is null, it will do nothing.
    */
    pipe<T extends NodeJS.ReadWriteStream>(stream: T, opts?: {
        end?: boolean;
    }): T;
    /**
    * Returns a pretty String interpretation of the File. Useful for console.log.
    */
    inspect(): string;
}
interface IVinylFile {
    /** gulp-sourcemaps adds sourceMap property */
    sourceMap?: SourceMap.RawSourceMap;
    /** gulp-csslint */
    csslint: any;
}
/** Minimum interface of a message to log */
interface IGetSourceMap {
    filePath?: string;
    getFile?: () => IVinylFile;
}
/** Function that returns a fucntion that can report messages */
interface IOutputCreator {
    (options?: any): IOutput;
}
/**
* Function that can report messages
* You can use reporters.getOutput to get predefined output functions
*/
interface IOutput {
    (messages: IMessage[]): void;
}
