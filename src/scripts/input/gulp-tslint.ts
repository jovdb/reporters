/// <reference path='../interfaces.ts' />

/** Creates the method/object that the reporter wants */
module.exports = function(done: (messages: IMessage[]) => void, options?: any) {
  'use strict';

  // return what the reporter wants
  return function (output: any, file: IVinylFile) {

    if (options && options.debug) {
      console.log('gulp-tslint output:');
      console.log(output);
    }

    // convert to array of messages
    done(output.map(function (item: any): IMessage {
      return {
        sourceName: 'gulp-tslint',
        type: (options && options.warning) ? 'warning' : 'error',
        filePath: file.path,
        lineNbr: item.startPosition.line,
        colNbr: item.startPosition.character,
        description: item.failure,
        getFile: () => file, // Can be used to check for inline sourcemap when not (yet) saved
        code: item.ruleName
      };
    }));

  };
};
