/// <reference path='../interfaces.ts' />

var chalk = require('chalk');

/** Creates the method/object that the reporter wants */
module.exports = function(done: (messsages: IMessage[]) => void, options?: any) {
  'use strict';

  options = options || {};

  var succesSpecs = 0;
  var skippedSpecs = 0;
  var failedSpecs = 0;
  var messages: IMessage[] = [];

  var logSpecs = options && options.logSpecs;

  return {

    specStarted: function (result: any) {
      if (logSpecs) {
        console.log('unit test: ' + chalk.cyan(result.fullName));
      }
    },

    specDone: function (result: any) {
      if (result.status === 'passed') {
        succesSpecs++;
      } else if (result.status === 'skipped') {
        skippedSpecs++;
      }
      if (result.status === 'failed') {
        failedSpecs++;

        for (var i = 0; i < result.failedExpectations.length; i++) {
          var failedExpectation = result.failedExpectations[i];
          var stackLines = this.filterStackTraces(failedExpectation.stack);

          if (stackLines && stackLines.length) {
            var location = this.getFileAtLineFromStack(stackLines[0]);
            if (location) {
              messages.push({
                specName: result.description,
                specFullName: result.fullName,
                description: result.fullName + ': ' + failedExpectation.message,
                filePath: location.filePath,
                lineNbr: location.lineNbr,
                colNbr: location.colNbr,
                sourceName: 'gulp-jasmine',
                type: 'error'
              });
            } else {
              messages.push({
                specName: result.description,
                specFullName: result.fullName,
                description: result.fullName + ': ' + stackLines.join('\n'),
                sourceName: 'gulp-jasmine',
                type: 'error'
              });
            }
          } else {

            messages.push({
              specName: result.description,
              specFullName: result.fullName,
              description: result.fullName + ': ' + (failedExpectation.stack || failedExpectation.message),
              sourceName: 'gulp-jasmine',
              type: 'error'
            });

          }
        }
      }
    },

    jasmineDone: function () {

      var description = '';
      var type = 'info';

      if (failedSpecs > 0) {
        description = failedSpecs + ' of ' + (failedSpecs + succesSpecs) + ' tests failed' + (skippedSpecs > 0 ? (', ' + skippedSpecs + ' skipped.') : '.');
        type = 'error';
      } else if (skippedSpecs > 0 && succesSpecs > 0) {
        description = succesSpecs + ' tests executed successful, ' + skippedSpecs + ' skipped.';
      } else if (succesSpecs > 0) {
        description = 'All ' + succesSpecs + ' tests completed successful.';
      } else {
        description = 'No tests executed.';
      }

      messages.push({
        description: description,
        sourceName: 'gulp-jasmine',
        type: type
      });

      done(messages);

      // Reset values
      succesSpecs = 0;
      skippedSpecs = 0;
      failedSpecs = 0;
      messages = [];
    },

    filterStackTraces: function (traces: string): string[] {
      var lines = traces.split('\n');
      var filtered: string[] = [];
      for (var i = 1; i < lines.length; i++) {
        if (!/(jasmine[^\/]*\.js|Timer\.listOnTimeout)/.test(lines[i])) {
          filtered.push(lines[i]);
        }
      }
      return filtered;
    },

    getFileAtLineFromStack: function (stackLine: string): {filePath: string; lineNbr: number; colNbr: number; } {
      // Try to extract filename and line/col number
      // '    at Object.<anonymous> (C:\\Users\\jo_vdb\\reporters\\src\\specs\\indexSpec.js:11:27)'
      var regEx = /.*\((.*):(.*):(.*)\).*/g;
      var match = regEx.exec(stackLine);
      if (match) {
        return {
          filePath: match[1],
          lineNbr: parseInt(match[2], 10),
          colNbr: parseInt(match[3], 10)
        };
      }
    }
  };
};
