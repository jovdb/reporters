/// <reference path='../interfaces.ts' />

/** Creates the method/object that the reporter wants */
module.exports = function(done: (messsages: IMessage[]) => void, options?: any) {
  'use strict';

  // return what the reporter wants
  return function (file: IVinylFile) {

    if (options && options.debug) {
      console.log('gulp-csslint output:');
      console.log(file.csslint.results);
    }

    // convert to array of messages
    done(file.csslint.results.map(function(item: any): IMessage {
      return {
        sourceName: 'gulp-csslint',
        type: item.error.type,
        filePath: file.path,
        lineNbr: item.error.line,
        colNbr: item.error.col,
        description: item.error.message + ' (rule: ' + item.error.rule.id + ')',
        getFile: () => file, // Can be used to check for inline sourcemap
        code: item.error.rule.id
      };
    }));
  };
};
