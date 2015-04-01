/// <reference path='../interfaces.ts' />

interface INotityOptions {

  /** filter or adjust messages to notify, eg: only errors */
  filter?: (messages: IMessage[]) => IMessage[];

  // Adjust notify options
  notifyOptions?: (options: any, message: IMessage) => any;

  // true to remove path, string to remove base path
  shortPath?: boolean | string;
}

module.exports = function (options: INotityOptions) {

  var notifier = require('node-notifier');
  var path = require('path');

  options = options || {};

  return function (messages: IMessage[]) {

    'use strict';

    if (messages && Array.isArray(messages)) {

      var beep = messages.some(m => m.type === 'error');

      // Filter
      if (options.filter) {
        messages = options.filter(messages);
      }

      messages.forEach((message) => {
        if (message) {

          var title = (message.type || 'error') + ': ' + (message.sourceName || '') + ' ' + (message.code || '');

          // Build file-line-char string
          var location = '';
          var filePath = message.filePath;
          if (options.shortPath === true) {
            filePath = path.basename(filePath);
          } else if (typeof options.shortPath === 'string') {
            var basePath = (<string>options.shortPath).toUpperCase();
            if (filePath.toUpperCase().substring(0, basePath.length) === basePath) {
              filePath = filePath.substring(basePath.length);
            }
          }
          var lineNbr = message.lineNbr;
          var colNbr = message.colNbr;
          if (filePath) { location += filePath; }
          if (lineNbr) {
            location += '(' + lineNbr;
            if (colNbr) { location += ',' + colNbr; }
            location += ')';
          }

          // Add URL
          var url: string;
          if (message.sourceName && message.code) {
            if (message.sourceName.indexOf('jslint') > -1 || message.sourceName.indexOf('jshint') > -1 || message.sourceName.indexOf('eslint') > -1) {
              url = 'https://jslinterrors.com/?q=' + message.code;
            }
          }

          // Make toast!
          var notifyOptions = {
            title: title,
            message: message.description + '\n' + location,
            open: url,
            time: 15000,
            beep: beep
          };

          // Callback to allow changing notify options
          if (options && options.notifyOptions) {
            notifyOptions = options.notifyOptions(notifyOptions, message);
          }

          notifier.notify(notifyOptions);

          beep = false; // Beep once

        }
      });
    }
  };
};
