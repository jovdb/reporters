/// <reference path='../interfaces.ts' />
var chalk = require('chalk');
/** Creates the method/object that the reporter wants */
module.exports = function (done, options) {
    'use strict';
    options = options || {};
    var succesSpecs = 0;
    var skippedSpecs = 0;
    var failedSpecs = 0;
    var messages = [];
    var logSpecs = options && options.logSpecs;
    return {
        specStarted: function (result) {
            if (logSpecs) {
                console.log('unit test: ' + chalk.cyan(result.fullName));
            }
        },
        specDone: function (result) {
            if (result.status === 'passed') {
                succesSpecs++;
            }
            else if (result.status === 'skipped') {
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
                        }
                        else {
                            messages.push({
                                specName: result.description,
                                specFullName: result.fullName,
                                description: result.fullName + ': ' + stackLines.join('\n'),
                                sourceName: 'gulp-jasmine',
                                type: 'error'
                            });
                        }
                    }
                    else {
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
            }
            else if (skippedSpecs > 0 && succesSpecs > 0) {
                description = succesSpecs + ' tests executed successful, ' + skippedSpecs + ' skipped.';
            }
            else if (succesSpecs > 0) {
                description = 'All ' + succesSpecs + ' tests completed successful.';
            }
            else {
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
        filterStackTraces: function (traces) {
            var lines = traces.split('\n');
            var filtered = [];
            for (var i = 1; i < lines.length; i++) {
                if (!/(jasmine[^\/]*\.js|Timer\.listOnTimeout)/.test(lines[i])) {
                    filtered.push(lines[i]);
                }
            }
            return filtered;
        },
        getFileAtLineFromStack: function (stackLine) {
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

//# sourceMappingURL=data:application/json;base64,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RCxBQUVBLDhDQUY4QztZQUM5Qyw2RkFBNkY7Z0JBQ3pGLEtBQUssR0FBRyx5QkFBeUIsQ0FBQztZQUN0QyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ1YsTUFBTSxDQUFDO29CQUNMLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNsQixPQUFPLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQy9CLE1BQU0sRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztpQkFDL0IsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUMsQ0FBQyIsImZpbGUiOiJpbnB1dC9ndWxwLWphc21pbmUuanMiLCJzb3VyY2VSb290IjoiQzpcXFVzZXJzXFxqb192ZF8wMDBcXERyb3Bib3hcXDIwMTVcXHJlcG9ydGVycy1naXRcXHNyYyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uL2ludGVyZmFjZXMudHMnIC8+XHJcblxyXG52YXIgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpO1xyXG5cclxuLyoqIENyZWF0ZXMgdGhlIG1ldGhvZC9vYmplY3QgdGhhdCB0aGUgcmVwb3J0ZXIgd2FudHMgKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkb25lOiAobWVzc3NhZ2VzOiBJTWVzc2FnZVtdKSA9PiB2b2lkLCBvcHRpb25zPzogYW55KSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuXHJcbiAgdmFyIHN1Y2Nlc1NwZWNzID0gMDtcclxuICB2YXIgc2tpcHBlZFNwZWNzID0gMDtcclxuICB2YXIgZmFpbGVkU3BlY3MgPSAwO1xyXG4gIHZhciBtZXNzYWdlczogSU1lc3NhZ2VbXSA9IFtdO1xyXG5cclxuICB2YXIgbG9nU3BlY3MgPSBvcHRpb25zICYmIG9wdGlvbnMubG9nU3BlY3M7XHJcblxyXG4gIHJldHVybiB7XHJcblxyXG4gICAgc3BlY1N0YXJ0ZWQ6IGZ1bmN0aW9uIChyZXN1bHQ6IGFueSkge1xyXG4gICAgICBpZiAobG9nU3BlY3MpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygndW5pdCB0ZXN0OiAnICsgY2hhbGsuY3lhbihyZXN1bHQuZnVsbE5hbWUpKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzcGVjRG9uZTogZnVuY3Rpb24gKHJlc3VsdDogYW55KSB7XHJcbiAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAncGFzc2VkJykge1xyXG4gICAgICAgIHN1Y2Nlc1NwZWNzKys7XHJcbiAgICAgIH0gZWxzZSBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ3NraXBwZWQnKSB7XHJcbiAgICAgICAgc2tpcHBlZFNwZWNzKys7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XHJcbiAgICAgICAgZmFpbGVkU3BlY3MrKztcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHQuZmFpbGVkRXhwZWN0YXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgZmFpbGVkRXhwZWN0YXRpb24gPSByZXN1bHQuZmFpbGVkRXhwZWN0YXRpb25zW2ldO1xyXG4gICAgICAgICAgdmFyIHN0YWNrTGluZXMgPSB0aGlzLmZpbHRlclN0YWNrVHJhY2VzKGZhaWxlZEV4cGVjdGF0aW9uLnN0YWNrKTtcclxuXHJcbiAgICAgICAgICBpZiAoc3RhY2tMaW5lcyAmJiBzdGFja0xpbmVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgbG9jYXRpb24gPSB0aGlzLmdldEZpbGVBdExpbmVGcm9tU3RhY2soc3RhY2tMaW5lc1swXSk7XHJcbiAgICAgICAgICAgIGlmIChsb2NhdGlvbikge1xyXG4gICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgc3BlY05hbWU6IHJlc3VsdC5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgIHNwZWNGdWxsTmFtZTogcmVzdWx0LmZ1bGxOYW1lLFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHJlc3VsdC5mdWxsTmFtZSArICc6ICcgKyBmYWlsZWRFeHBlY3RhdGlvbi5tZXNzYWdlLFxyXG4gICAgICAgICAgICAgICAgZmlsZVBhdGg6IGxvY2F0aW9uLmZpbGVQYXRoLFxyXG4gICAgICAgICAgICAgICAgbGluZU5icjogbG9jYXRpb24ubGluZU5icixcclxuICAgICAgICAgICAgICAgIGNvbE5icjogbG9jYXRpb24uY29sTmJyLFxyXG4gICAgICAgICAgICAgICAgc291cmNlTmFtZTogJ2d1bHAtamFzbWluZScsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBzcGVjTmFtZTogcmVzdWx0LmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgc3BlY0Z1bGxOYW1lOiByZXN1bHQuZnVsbE5hbWUsXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogcmVzdWx0LmZ1bGxOYW1lICsgJzogJyArIHN0YWNrTGluZXMuam9pbignXFxuJyksXHJcbiAgICAgICAgICAgICAgICBzb3VyY2VOYW1lOiAnZ3VscC1qYXNtaW5lJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcidcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goe1xyXG4gICAgICAgICAgICAgIHNwZWNOYW1lOiByZXN1bHQuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgc3BlY0Z1bGxOYW1lOiByZXN1bHQuZnVsbE5hbWUsXHJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHJlc3VsdC5mdWxsTmFtZSArICc6ICcgKyAoZmFpbGVkRXhwZWN0YXRpb24uc3RhY2sgfHwgZmFpbGVkRXhwZWN0YXRpb24ubWVzc2FnZSksXHJcbiAgICAgICAgICAgICAgc291cmNlTmFtZTogJ2d1bHAtamFzbWluZScsXHJcbiAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJ1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGphc21pbmVEb25lOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB2YXIgZGVzY3JpcHRpb24gPSAnJztcclxuICAgICAgdmFyIHR5cGUgPSAnaW5mbyc7XHJcblxyXG4gICAgICBpZiAoZmFpbGVkU3BlY3MgPiAwKSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSBmYWlsZWRTcGVjcyArICcgb2YgJyArIChmYWlsZWRTcGVjcyArIHN1Y2Nlc1NwZWNzKSArICcgdGVzdHMgZmFpbGVkJyArIChza2lwcGVkU3BlY3MgPiAwID8gKCcsICcgKyBza2lwcGVkU3BlY3MgKyAnIHNraXBwZWQuJykgOiAnLicpO1xyXG4gICAgICAgIHR5cGUgPSAnZXJyb3InO1xyXG4gICAgICB9IGVsc2UgaWYgKHNraXBwZWRTcGVjcyA+IDAgJiYgc3VjY2VzU3BlY3MgPiAwKSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSBzdWNjZXNTcGVjcyArICcgdGVzdHMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bCwgJyArIHNraXBwZWRTcGVjcyArICcgc2tpcHBlZC4nO1xyXG4gICAgICB9IGVsc2UgaWYgKHN1Y2Nlc1NwZWNzID4gMCkge1xyXG4gICAgICAgIGRlc2NyaXB0aW9uID0gJ0FsbCAnICsgc3VjY2VzU3BlY3MgKyAnIHRlc3RzIGNvbXBsZXRlZCBzdWNjZXNzZnVsLic7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSAnTm8gdGVzdHMgZXhlY3V0ZWQuJztcclxuICAgICAgfVxyXG5cclxuICAgICAgbWVzc2FnZXMucHVzaCh7XHJcbiAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxyXG4gICAgICAgIHNvdXJjZU5hbWU6ICdndWxwLWphc21pbmUnLFxyXG4gICAgICAgIHR5cGU6IHR5cGVcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBkb25lKG1lc3NhZ2VzKTtcclxuXHJcbiAgICAgIC8vIFJlc2V0IHZhbHVlc1xyXG4gICAgICBzdWNjZXNTcGVjcyA9IDA7XHJcbiAgICAgIHNraXBwZWRTcGVjcyA9IDA7XHJcbiAgICAgIGZhaWxlZFNwZWNzID0gMDtcclxuICAgICAgbWVzc2FnZXMgPSBbXTtcclxuICAgIH0sXHJcblxyXG4gICAgZmlsdGVyU3RhY2tUcmFjZXM6IGZ1bmN0aW9uICh0cmFjZXM6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuICAgICAgdmFyIGxpbmVzID0gdHJhY2VzLnNwbGl0KCdcXG4nKTtcclxuICAgICAgdmFyIGZpbHRlcmVkOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKCEvKGphc21pbmVbXlxcL10qXFwuanN8VGltZXJcXC5saXN0T25UaW1lb3V0KS8udGVzdChsaW5lc1tpXSkpIHtcclxuICAgICAgICAgIGZpbHRlcmVkLnB1c2gobGluZXNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmlsdGVyZWQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEZpbGVBdExpbmVGcm9tU3RhY2s6IGZ1bmN0aW9uIChzdGFja0xpbmU6IHN0cmluZyk6IHtmaWxlUGF0aDogc3RyaW5nOyBsaW5lTmJyOiBudW1iZXI7IGNvbE5icjogbnVtYmVyOyB9IHtcclxuICAgICAgLy8gVHJ5IHRvIGV4dHJhY3QgZmlsZW5hbWUgYW5kIGxpbmUvY29sIG51bWJlclxyXG4gICAgICAvLyAnICAgIGF0IE9iamVjdC48YW5vbnltb3VzPiAoQzpcXFxcVXNlcnNcXFxcam9fdmRiXFxcXHJlcG9ydGVyc1xcXFxzcmNcXFxcc3BlY3NcXFxcaW5kZXhTcGVjLmpzOjExOjI3KSdcclxuICAgICAgdmFyIHJlZ0V4ID0gLy4qXFwoKC4qKTooLiopOiguKilcXCkuKi9nO1xyXG4gICAgICB2YXIgbWF0Y2ggPSByZWdFeC5leGVjKHN0YWNrTGluZSk7XHJcbiAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBmaWxlUGF0aDogbWF0Y2hbMV0sXHJcbiAgICAgICAgICBsaW5lTmJyOiBwYXJzZUludChtYXRjaFsyXSwgMTApLFxyXG4gICAgICAgICAgY29sTmJyOiBwYXJzZUludChtYXRjaFszXSwgMTApXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbn07XHJcbiJdfQ==