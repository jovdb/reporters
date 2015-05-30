/// <reference path='../interfaces.ts' />

/** Creates the method/object that the reporter wants */
module.exports = function(done: (messsages: IMessage[]) => void, options?: any) {
  'use strict';

  // return what the reporter wants
  return function(errors: any): void {
    if (options && options.debug) {
      console.log('gulp-jshint output:');
      console.log(errors);
    }

    // convert to array of messages
    done(errors.map(function (item: any): IMessage {
      var result: IMessage = {
        sourceName: 'gulp-jshint',
        filePath: item.file,
        lineNbr: item.error.line,
        colNbr: item.error.character,
        type: item.error.id ? item.error.id.substring(1, item.error.id.length - 1) : 'info',
        description: item.error.reason,
        line: item.error.evidence, // line
        code: item.error.code
      };

      return result;
    }));
  };
};
