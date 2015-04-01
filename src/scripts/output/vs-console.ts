/// <reference path='../interfaces.ts' />

var chalk = require('chalk');

module.exports = function () {

  return function (messages: IMessage[]) {

    'use strict';

    function logIt(messageType: string, line: string): void {
      if (line) {
        /* tslint:disable:no-console */
        messageType = (messageType || 'error').toLowerCase();
        if (messageType === 'debug') {
          console.log(chalk.gray(line));
        } else if (messageType === 'info') {
          console.info(line);
        } else if (messageType === 'warning') {
          console.warn(chalk.yellow(line));
        } else {
          console.error(chalk.red(line));
        }
        /* tslint:enable:no-console */
      }
    }

    if (messages && Array.isArray(messages)) {
      messages.forEach(function (message) {
        if (message) {
          var line = '';

          // http://blogs.msdn.com/b/msbuild/archive/2006/11/03/msbuild-visual-studio-aware-error-messages-and-message-formats.aspx
          var filePath = message.filePath;
          var lineNbr = message.lineNbr;
          var colNbr = message.colNbr;

          if (filePath) { line += filePath; }
          if (lineNbr) {
            line += '(' + lineNbr;
            if (colNbr) { line += ',' + colNbr; }
            line += ')';
          }

          if (line) { line += ': '; }
          line += (message.type || 'error');

          if (message.code) {
            line += ' ' + message.code;
          }

          line += ': ' + (message.description || 'No error message specified');

          if (message.sourceName) {
            line += ' (' + message.sourceName + ')';
          }

          logIt(message.type, line);

        }
      });
    }
  };
};
