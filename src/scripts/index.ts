/// <reference path='../../typings/source-map/source-map.d.ts' />

import fs = require('fs');
import path = require('path');
var sourceMapResolve = require('source-map-resolve');
import sm = require('source-map');
var SourceMapConsumer = sm.SourceMapConsumer;
var stripBom = require('strip-bom');

/** Create a reporter for a specific node module, messages are captured and send to the output.
* @param name name of the internal reporter that captures messages
* @param options Optional options for this reporter
*/
function reporters(name: string, options?: IInputOptions): IInput {

  // name
  reporters.logDebug('Get reporter \'' + name + '\'.');
  var reporterCreator = reporters.getInputCreator(name);
  if (!reporterCreator) {
    throw new Error('No reporter with name \'' + name + '\' available. Available reporters: ' + reporters.getAvailable().join(', '));
  }

  // Wrap Reporter to accept options
  return reporters.wrapReporter(name, reporterCreator, options);

}

/** Collection of reporters the gather information of different node modules in a uniform way to log them all in the same format. */
module reporters {

  /** Enable debug messages */
  export var debug = false;

  /** Function or array of functions that can handle messages.
  * Assign one or more results from getOutput(...)
  */
  export var output: IOutput[] | IOutput = [getOutputCreator('vs-console')()];

  export function logDebug(...args: any[]): void {
    if (reporters.debug) {
      console.log.apply(console, args);
    }
  }

  /** Internal method to load modules from a subdir with a specific name */
  function loadModule<TResult>(subFolder: string, moduleName: string): TResult {
    var relPath = '../scripts/' + subFolder + '/' + moduleName + '.js'; // prefix path is to also work from unit test

    if (fs.existsSync(__dirname + '/' + relPath)) {
      return require('./' + relPath);
    } else {
      return null;
    }
  }

  /** Internal method to list available modules */
  function getModuleNames(subFolder: string): string[] {
    var names: string[] = [];
    fs.readdirSync(__dirname + '/' + subFolder).forEach(function (fileName: string) {
      if (path.extname(fileName) === '.js') { // ends with '.js'
        names.push(fileName.substring(0, fileName.length - path.extname(fileName).length));
      }
    });
    return names;
  }

  /** Get a list of availabe built-in reporters that create messages */
  export function getAvailable(): string[] {
    return getModuleNames('input');
  }

  /** Get function that creates a reporter for a node module 
  * @param name name of the reporter to return a create method for
  */
  export function getInputCreator(name: string): IInputCreator {
    return loadModule<IInputCreator>('input', name);
  }

  /** Get function that creates a function to handle messages 
  * @param name name of the internal output handler to load that will report messages
  */
  function getOutputCreator(name: string): IOutputCreator {
    return loadModule<IOutputCreator>('output', name);
  }

  /** Get a preconfigured function that handles messages by name
  * Use reporters.getOutputs() to get a list of available outputs.
  * @param name name of the internal output handler to load that will report messages
  * @param options Optional options for this output
  */
  export function getOutput(name: string, options?: any): IOutput {
    var creator = getOutputCreator(name);
    if (!creator) {
      throw new Error('No output with name \'' + name + '\' available. Available outputs: ' + reporters.getOutputs().join(', '));
    }
    return creator(options);
  }

  /** Get a list of available functions that can handle messages */
  export function getOutputs(): string[] {
    return getModuleNames('output');
  }

  /** Called before reporting
  * This is your change to filter or update messages
  */
  export function filterOrUpdate(messages: IMessage[]): IMessage[] {
    return messages;
  }

  export function wrapReporter(sourceName: string, reporterCreator: IInputCreator, options?: IInputOptions): IInput {

    logDebug('Creating reporter \'' + sourceName + '\', options: ' + JSON.stringify(options));

    if (reporterCreator) {

      var done = function (messages: IMessage[]) { // For async calls
        logDebug('Extracted messages: ', messages);
        if (messages) {
            reporters.report(messages);
        }
      };

      // Create reporter
      var reporter = reporterCreator(done, options);

      // Delegate to method
      return reporter;

    };
  }

  /** Represents the cache */
  interface ICache {
    [filePath: string]: SourceMap.RawSourceMap;
  }

  /** Get sourcemap of a message */
  function getSourceMap(message: IMessage, cache: ICache = {}): SourceMap.RawSourceMap {

    function addToCache(message: IMessage, sourceMap: SourceMap.RawSourceMap): void {
      if (message && message.filePath) {
        logDebug(message.filePath + ': added sourcemap to cache');
        cache[message.filePath] = sourceMap;
      }
    }

    function getFromCache(message: IMessage): SourceMap.RawSourceMap {
      if (message && message.filePath) {
        if (cache[message.filePath] !== undefined) {
          logDebug(message.filePath + ': found sourcemap in cache');
        }
        return cache[message.filePath];
      }
      return null;
    }

    if (message && (!message.options || message.options && message.options.sourceMaps !== false)) {

      // Get from cache
      var cached = getFromCache(message);
      if (cached !== undefined) {
        return cached;
      }

      var contents: any;

      // Get content from Vinyl file
      if (message.getFile) {
        logDebug(message.filePath + ': a vinyl file is available in message!');
        var file = message.getFile();

        // gulp-sourcemaps
        if (file && file.sourceMap) {
          logDebug(message.filePath + ': sourceMap found in vinyl file');
          addToCache(message, file.sourceMap);
          return file.sourceMap;
        } else {
          logDebug(message.filePath + ': no .sourceMap in vinyl file (gulp-sourcemaps)');
        }

        // find sourcemap comments in contents
        if (file && file.contents) {
          logDebug(message.filePath + ': sourcemap comments in contents of vinyl file?');
          var originalMap = sourceMapResolve.resolveSync(file.contents.toString('utf8'), message.filePath, fs.readFileSync);
          if (originalMap) {
            logDebug(message.filePath + ': sourcemap found in contents of vinyl file!');
            addToCache(message, originalMap.map);
            return originalMap.map;
          } else {
            logDebug(message.filePath + ': no sourcemap found in contents of vinyl file!');
          }
        } else {
          logDebug(message.filePath + ': no .contents in vinyl file, are you sure that you passed a vinyl file?');
        }

        if (!contents) {
          logDebug(message.filePath + ': no sourcemap found in vinyl file.');
        }
      } else {
        logDebug(message.filePath + ': no vinyl file available in message (getFile method)');
      }


      // Find sourcemap inside file
      if (!contents) {
        try {
          logDebug(message.filePath + ': reading file');
          var buffer = fs.readFileSync(message.filePath);
          contents = buffer.toString();

          if (contents) {
            logDebug(message.filePath + ': resolving sourcemap');
            originalMap = sourceMapResolve.resolveSync(contents, message.filePath, fs.readFileSync);
            if (originalMap) {
              logDebug(message.filePath + ': sourcemap found!');
              addToCache(message, originalMap.map);
              return originalMap.map;
            } else {
              logDebug(message.filePath + ': sourcemap not found.');
            }
          }
        } catch (e) {
          logDebug(message.filePath + ': error reading: ' + e.message);
        }
      }

      // Find in .Map file
      try {
        var mapFile = message.filePath + '.map';
        logDebug(mapFile + ': reading file (if exists)');
        var sourceMap = JSON.parse(stripBom(fs.readFileSync(mapFile, 'utf8')));

        if (sourceMap) {
          addToCache(message, sourceMap);
          return sourceMap;
        } else {
          logDebug(mapFile + ': Original location not found.');
        }
      } catch (e) {
        logDebug(mapFile + ': error reading: ' + e.message);
      }
    } else {
      logDebug(message.filePath + ': sourcemaps disabled by options');
    }

    addToCache(message, null); // null means not available
    return null;
  }

  /** Report messages to the configured outputs 
  * @param messages a list of messages that should be handled by the output (list).
  */
  export function report(messages: IMessage[]): void {

    if (!messages) {
      return;
    }

    var cache: ICache = {};

    // Validate or convert output lists
    var outputs: IOutput[] = [];
    if (typeof output === 'function') {
      outputs = <any>[output];
    } else if (Array.isArray(output)) {
      if ((<IOutput[]>output).some(o => typeof o !== 'function')) {
        throw new Error('reporters.output needs a function or array of functions to report messages.');
      }
      outputs = <any>output;
    } else {
      throw new Error('reporters.output needs a function or array of functions to report messages.');
    }

    // check for sourcemap
    messages.forEach((message: IMessage) => {

      /// Add sourcemap information?
      if (!message.options || message.options.sourceMaps !== false) {

        logDebug(message.filePath + ': checking for sourcemaps...');
        var sourceMap = getSourceMap(message, cache);
        if (sourceMap) {

          // Try to get original location
          logDebug(message.filePath + ': get original location of line ' + message.lineNbr + ', col ' + message.colNbr);
          var smc = new SourceMapConsumer(sourceMap);

          var original = smc.originalPositionFor({ line: message.lineNbr - 1, column: message.colNbr - 1});
          logDebug(message.filePath + ': original location result: ' + JSON.stringify(original));

          if (original && original.source) {
            logDebug(message.filePath + ': updating message with sourcemap location');
            message.filePath = original.source;
            message.lineNbr = original.line + 1;
            message.colNbr = original.column + 1;
          } else {
            logDebug('line & column not found in sourceMap');
          }
        }
      }
    });

    // Filter or update messages
    if (reporters.filterOrUpdate) { // use reporters. to prevent closure
      logDebug('Filtering messages: filterOrUpdate');
      messages = reporters.filterOrUpdate(messages);
    }

    // Report
    logDebug('# Outputs: ' + outputs.length);
    outputs.forEach(outputReporter => {
      outputReporter(messages);
    });
  }

}

export = reporters;
