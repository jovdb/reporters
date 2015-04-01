/// <reference path='../interfaces.ts' />

/** Creates the method/object that the reporter wants */
module.exports = function(done: (messsages: IMessage[]) => void, options?: any) {
  'use strict';

  // return what the reporter wants
  return function (output: any) {

    if (options && options.debug) {
      console.log('gulp-sass output:');
      console.log(output);
    }

    var type = 'error';
    if (output.status === 2) {
      type = 'warning';
    }

    // convert to array of messages
    done([{
      sourceName: 'gulp-sass',
      type: type,
      filePath: output.file,
      lineNbr: output.line,
      colNbr: output.column,
      description: output.message,
      code: output.code
    }]);
  };
};
