/// <reference path='../interfaces.ts' />

/** Creates the method/object that the reporter wants */
module.exports = function(done: (messsages: IMessage[]) => void, options?: any) {
  'use strict';

  // return what the reporter wants
  return {
    error: function (error: any) {
      if (options && options.debug) {
        console.log('gulp-typescript output:');
        console.log(error);
      }

      var message = error && error.diagnostic && error.diagnostic.messageText || '';
      var code = error && error.diagnostic && error.diagnostic.code;
      var category = error && error.diagnostic && error.diagnostic.category;
      var type = 'error';
      if (category === 0) {
        type = 'warning';
      } else if (category === 2) {
        type = 'info';
      } else if (category === 3) {
        type = 'info'; // NoPrefix
      }

      done([{
        sourceName: 'gulp-typescript',
        type: type,
        filePath: error.fullFilename,
        lineNbr: error.startPosition.line,
        colNbr: error.startPosition.character,
        description: message,
        getFile: () => error.file, // Can be used to check for inline sourcemap
        code: code
      }]);
    }
  };
};
