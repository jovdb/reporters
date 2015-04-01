/// <reference path='../interfaces.ts' />

module.exports = function () {

  return function (messages: IMessage[]) {

    'use strict';

    if (messages && Array.isArray(messages)) {
      var hasError = messages.some(m => m.type === 'error');
      if (hasError) {
        process.stdout.write('\x07');
      }
    }
  };
};
