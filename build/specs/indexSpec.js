/// <reference path='../../typings/jasmine/jasmine.d.ts' />
/// <reference path='../scripts/interfaces.ts' />
var del = require('del');
var gulp = require('gulp');
var tslint = require('gulp-tslint');
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('gulp-typescript');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var csslint = require('gulp-csslint');
var gulpif = require('gulp-if');
var jasmine = require('gulp-jasmine');
(function () {
    'use strict';
    describe('reporters:', function () {
        var reporters;
        beforeEach(function () {
            // Create fresh instance per test
            reporters = require('../scripts/index');
            // reporters.debug = true;
        });
        var messages = [{
            sourceName: 'test-maximum',
            filePath: 'filePath1',
            type: 'warning',
            code: 'CODE51',
            lineNbr: 2,
            colNbr: 3,
            description: 'message1'
        }, {
            sourceName: 'test-medium',
            filePath: 'filePath1',
            lineNbr: 2,
            colNbr: 3,
            description: 'message2'
        }, {
            sourceName: 'test-minimum',
            description: 'message3'
        }];
        describe('output:', function () {
            function validate(name, outputReporter) {
                expect(outputReporter).toBeDefined();
                expect(typeof outputReporter === 'function').toBeTruthy();
                if (reporters.debug) {
                    outputReporter(messages);
                }
            }
            it('getOutputs', function () {
                var outputReporters = reporters.getOutputs();
                expect(outputReporters.length).toBeGreaterThan(0);
                expect(typeof outputReporters[0] === 'string').toBeTruthy();
            });
            it('getOutput(\'vs-console\')', function () {
                var outputReporter = reporters.getOutput('vs-console');
                validate('vs-console', outputReporter);
            });
            it('getOutput(\'notify\')', function () {
                var outputReporter = reporters.getOutput('notify');
                validate('notify', outputReporter);
            });
            it('output = function', function () {
                var loggedMessages = [];
                reporters.output = function (messages) { return loggedMessages = messages; };
                reporters.report(messages);
                expect(messages.length).toBe(loggedMessages.length);
            });
            it('output = function', function () {
                var logCount = 0;
                reporters.output = function () { return logCount++; };
                reporters.report(messages);
                expect(logCount).toBe(1);
            });
            it('output = []', function () {
                var called1 = 0;
                var called2 = 0;
                reporters.output = [function () { return called1++; }, function () { return called2++; }];
                reporters.report(messages);
                expect(called1).toBe(1);
                expect(called2).toBe(1);
            });
        });
        it('filterOrUpdate: null', function (done) {
            // change description
            reporters.filterOrUpdate = null;
            reporters.output = function (filteredMessages) {
                expect(filteredMessages[0].code).toBe(messages[0].code);
                expect(filteredMessages.length).toBe(messages.length);
                done();
            };
            reporters.report(messages);
        });
        it('filterOrUpdate: filter', function (done) {
            // allow 1 message
            reporters.filterOrUpdate = function (messages) { return [messages[0]]; };
            reporters.output = function (filteredMessages) {
                expect(filteredMessages.length).toBe(1);
                reporters.filterOrUpdate = null;
                done();
            };
            reporters.report(messages);
        });
        it('filterOrUpdate: update', function (done) {
            // change description
            reporters.filterOrUpdate = function (messages) { return messages.map(function (m) {
                m.code = 'changed';
                return m;
            }); };
            reporters.output = function (filteredMessages) {
                expect(filteredMessages[0].code).toBe('changed');
                expect(filteredMessages.length).toBe(messages.length);
                reporters.filterOrUpdate = null;
                done();
            };
            reporters.report(messages);
        });
        describe('input:', function () {
            function validateMessages(messages) {
                expect(messages.some(function (message) { return !message.sourceName; })).toBeFalsy();
                expect(messages.some(function (message) { return !message.description; })).toBeFalsy();
            }
            it('getAvailable', function () {
                var availableInputs = reporters.getAvailable();
                expect(availableInputs.length).toBeGreaterThan(3);
            });
            it('unknown', function () {
                try {
                    reporters('unknown');
                }
                catch (e) {
                    expect(e.message).toContain('gulp-jshint');
                }
            });
            it('gulp-jshint', function (done) {
                var reporter = reporters('gulp-jshint');
                reporters.output = function (messages) {
                    expect(messages.length).toBe(2);
                    validateMessages(messages);
                    expect(messages[0].sourceName).toBe('gulp-jshint');
                    expect(messages[0].code).toBe('W033');
                    expect(messages[1].code).toBe('W098');
                    done();
                };
                gulp.src(__dirname + '/../../src/specs/testfiles/js/fail.js').pipe(jshint()).pipe(jshint.reporter(reporter));
            });
            it('gulp-tslint', function (done) {
                var reporter = reporters('gulp-tslint');
                reporters.output = function (messages) {
                    expect(messages.length).toBe(2);
                    validateMessages(messages);
                    expect(messages[0].sourceName).toBe('gulp-tslint');
                    expect(messages[0].code).toBe('eofline');
                    expect(messages[1].code).toBe('semicolon');
                    done();
                };
                gulp.src(__dirname + '/../../src/specs/testfiles/ts/lint.ts').pipe(tslint()).pipe(tslint.report(reporter, { emitError: false }));
            });
            it('gulp-sass', function (done) {
                var reporter = reporters('gulp-sass');
                reporters.output = function (messages) {
                    expect(messages.length).toBe(1);
                    validateMessages(messages);
                    expect(messages[0].sourceName).toBe('gulp-sass');
                    expect(messages[0].lineNbr).toBe(5);
                    done();
                };
                gulp.src(__dirname + '/../../src/specs/testfiles/scss/fail.scss').pipe(sass({
                    onError: reporters('gulp-sass')
                }));
            });
            it('gulp-typescript', function (done) {
                var reporter = reporters('gulp-typescript');
                reporters.output = function (messages) {
                    expect(messages.length).toBe(1);
                    validateMessages(messages);
                    expect(messages[0].sourceName).toBe('gulp-typescript');
                    expect(messages[0].lineNbr).toBe(5);
                    done();
                };
                gulp.src(__dirname + '/../../src/specs/testfiles/ts/fail.ts').pipe(typescript({}, {}, reporters('gulp-typescript')));
            });
            it('gulp-csslint', function (done) {
                var reporter = reporters('gulp-csslint');
                reporters.output = function (messages) {
                    expect(messages.length).toBe(2);
                    validateMessages(messages);
                    expect(messages[1].sourceName).toBe('gulp-csslint');
                    expect(messages[1].lineNbr).toBe(5);
                    done();
                };
                gulp.src(__dirname + '/../../src/specs/testfiles/css/fail.css').pipe(csslint()).pipe(csslint.reporter(reporters('gulp-csslint')));
            });
            // xit because problem nesting jasmine tests
            xit('gulp-jasmine', function (done) {
                var reporter = reporters('gulp-jasmine');
                reporters.output = function (messages) {
                    expect(messages.length).toBe(2);
                    validateMessages(messages);
                    expect(messages[0].sourceName).toBe('gulp-jasmine');
                    expect(messages[0].lineNbr).toBe('3');
                    done();
                };
                gulp.src(__dirname + '/../../src/specs/testfiles/test/fail.js').pipe(jasmine({
                    reporter: reporter
                }));
            });
            it('gulp-jshint with inline sourcemap', function (done) {
                reporters.output = function (messages) {
                    expect(messages[0].filePath).toContain('lint.ts');
                    expect(messages[0].lineNbr).toBe(5);
                    del([
                        'build/specs/lint.js'
                    ], done);
                };
                gulp.src(__dirname + '/../../src/specs/testfiles/ts/lint.ts').pipe(sourcemaps.init()).pipe(typescript()).js.pipe(sourcemaps.write()).pipe(gulp.dest('build/specs/')).pipe(jshint()).pipe(jshint.reporter(reporters('gulp-jshint')));
            });
            it('gulp-jshint with external sourcemap with comment to map file', function (done) {
                reporters.output = function (messages) {
                    expect(messages[0].filePath).toContain('lint.ts');
                    expect(messages[0].lineNbr).toBe(5);
                    del([
                        'build/specs/lint.js',
                        'build/specs/lint.js.map'
                    ], done);
                };
                gulp.src(__dirname + '/../../src/specs/testfiles/ts/lint.ts').pipe(sourcemaps.init()).pipe(typescript()).js.pipe(sourcemaps.write('.')).pipe(gulp.dest('build/specs/')).pipe(jshint()).pipe(jshint.reporter(reporters('gulp-jshint')));
            });
            it('gulp-jshint with external sourcemap without comment to map file', function (done) {
                reporters.output = function (messages) {
                    expect(messages[0].filePath).toContain('lint.ts');
                    expect(messages[0].lineNbr).toBe(5);
                    del([
                        'build/specs/lint.js',
                        'build/specs/lint.js.map'
                    ], done);
                };
                gulp.src(__dirname + '/../../src/specs/testfiles/ts/lint.ts').pipe(sourcemaps.init()).pipe(typescript()).js.pipe(sourcemaps.write('.', { addComment: false })).pipe(gulp.dest('build/specs/')).pipe(jshint()).pipe(jshint.reporter(reporters('gulp-jshint')));
            });
            it('gulp-csslint with .sourceMap property in Vinyl file (gulp)', function (done) {
                reporters.output = function (messages) {
                    expect(messages[0].filePath).toContain('test.scss');
                    expect(messages[0].lineNbr).toBe(5);
                    done();
                };
                gulp.src(__dirname + '/../../src/specs/testfiles/scss/test.scss').pipe(sourcemaps.init()).pipe(sass()).pipe(sourcemaps.write({ addComment: false })).pipe(csslint({
                    'zero-units': true
                })).pipe(csslint.reporter(reporters('gulp-csslint')));
            });
            it('gulp-csslint with sourcemap in .contents of Vinyl file (gulp)', function (done) {
                reporters.output = function (messages) {
                    expect(messages[0].filePath).toContain('test.scss');
                    expect(messages[0].lineNbr).toBe(5);
                    done();
                };
                gulp.src(__dirname + '/../../src/specs/testfiles/scss/test.scss').pipe(sourcemaps.init()).pipe(sass()).pipe(sourcemaps.write({ addComment: true })).pipe(gulpif(function (file) {
                    // Mis-used gulp-if to remove sourceMap member variable
                    delete file.sourceMap;
                    return true;
                }, csslint({
                    'zero-units': true
                }))).pipe(csslint.reporter(reporters('gulp-csslint')));
            });
            it('custom reporter', function (done) {
                reporters.output = function (messages) {
                    expect(messages.length).toBe(2);
                    done();
                };
                gulp.src(__dirname + '/../../src/specs/testfiles/js/fail.js').pipe(jshint()).pipe(jshint.reporter(function (errors) {
                    reporters.report(errors.map(function (item) {
                        return {
                            description: item.error.reason,
                            sourceName: 'custom'
                        };
                    }));
                }));
            });
        });
    });
}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNwZWNzL2luZGV4U3BlYy50cyJdLCJuYW1lcyI6WyJ2YWxpZGF0ZSIsInZhbGlkYXRlTWVzc2FnZXMiXSwibWFwcGluZ3MiOiJBQUFBLDJEQUEyRDtBQUMzRCxpREFBaUQ7QUFJakQsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDcEMsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDNUMsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDNUMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3BDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNoQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDdEMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUV0QyxDQUFDO0lBQ0MsWUFBWSxDQUFDO0lBRWIsUUFBUSxDQUFDLFlBQVksRUFBRTtRQUVyQixJQUFJLFNBQStCLENBQUM7UUFDcEMsVUFBVSxDQUFDO1lBQ1QsQUFDQSxpQ0FEaUM7WUFDakMsU0FBUyxHQUF5QixPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUM5RCwwQkFBMEI7UUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLFFBQVEsR0FBZSxDQUFDO1lBQzFCLFVBQVUsRUFBRSxjQUFjO1lBQzFCLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLElBQUksRUFBRSxTQUFTO1lBQ2YsSUFBSSxFQUFFLFFBQVE7WUFDZCxPQUFPLEVBQUUsQ0FBQztZQUNWLE1BQU0sRUFBRSxDQUFDO1lBQ1QsV0FBVyxFQUFFLFVBQVU7U0FDeEIsRUFBRTtZQUNELFVBQVUsRUFBRSxhQUFhO1lBQ3pCLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLE9BQU8sRUFBRSxDQUFDO1lBQ1YsTUFBTSxFQUFFLENBQUM7WUFDVCxXQUFXLEVBQUUsVUFBVTtTQUN4QixFQUFFO1lBQ0QsVUFBVSxFQUFFLGNBQWM7WUFDMUIsV0FBVyxFQUFFLFVBQVU7U0FDeEIsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLFNBQVMsRUFBRTtZQUVsQixTQUFTLFFBQVEsQ0FBQyxJQUFZLEVBQUUsY0FBdUI7Z0JBQ3JEQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtnQkFDckNBLE1BQU1BLENBQUNBLE9BQU9BLGNBQWNBLEtBQUtBLFVBQVVBLENBQUNBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO2dCQUMxREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3BCQSxjQUFjQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtnQkFDM0JBLENBQUNBO1lBQ0hBLENBQUNBO1lBRUQsRUFBRSxDQUFDLFlBQVksRUFBRTtnQkFDZixJQUFJLGVBQWUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQzdDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRCxNQUFNLENBQUMsT0FBTyxlQUFlLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDOUQsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsMkJBQTJCLEVBQUU7Z0JBQzlCLElBQUksY0FBYyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3ZELFFBQVEsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsdUJBQXVCLEVBQUU7Z0JBQzFCLElBQUksY0FBYyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ25ELFFBQVEsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDckMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ3RCLElBQUksY0FBYyxHQUFlLEVBQUUsQ0FBQztnQkFDcEMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFDLFFBQW9CLElBQUssT0FBQSxjQUFjLEdBQUcsUUFBUSxFQUF6QixDQUF5QixDQUFDO2dCQUN2RSxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMzQixNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdEQsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ3RCLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztnQkFDakIsU0FBUyxDQUFDLE1BQU0sR0FBRyxjQUFNLE9BQUEsUUFBUSxFQUFFLEVBQVYsQ0FBVSxDQUFDO2dCQUNwQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMzQixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLGFBQWEsRUFBRTtnQkFDaEIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7Z0JBQ2hCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxjQUFNLE9BQUEsT0FBTyxFQUFFLEVBQVQsQ0FBUyxFQUFFLGNBQU0sT0FBQSxPQUFPLEVBQUUsRUFBVCxDQUFTLENBQUMsQ0FBQztnQkFDdEQsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDM0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHNCQUFzQixFQUFFLFVBQVUsSUFBSTtZQUV2QyxBQUNBLHFCQURxQjtZQUNyQixTQUFTLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztZQUNoQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQUMsZ0JBQTRCO2dCQUM5QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3RELElBQUksRUFBRSxDQUFDO1lBQ1QsQ0FBQyxDQUFDO1lBQ0YsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU3QixDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxVQUFVLElBQUk7WUFFekMsQUFDQSxrQkFEa0I7WUFDbEIsU0FBUyxDQUFDLGNBQWMsR0FBRyxVQUFDLFFBQW9CLElBQUssUUFBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBYixDQUFhLENBQUM7WUFFbkUsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFDLGdCQUE0QjtnQkFDOUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEMsU0FBUyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQ2hDLElBQUksRUFBRSxDQUFDO1lBQ1QsQ0FBQyxDQUFDO1lBRUYsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU3QixDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxVQUFVLElBQUk7WUFFekMsQUFDQSxxQkFEcUI7WUFDckIsU0FBUyxDQUFDLGNBQWMsR0FBRyxVQUFDLFFBQW9CLElBQUssT0FBQSxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQztnQkFDakUsQ0FBQyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWCxDQUFDLENBQUMsRUFIbUQsQ0FHbkQsQ0FBQztZQUVILFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBQyxnQkFBNEI7Z0JBQzlDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2pELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN0RCxTQUFTLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztnQkFDaEMsSUFBSSxFQUFFLENBQUM7WUFDVCxDQUFDLENBQUM7WUFFRixTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTdCLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLFFBQVEsRUFBRTtZQUVqQixTQUFTLGdCQUFnQixDQUFDLFFBQW9CO2dCQUM1Q0MsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBQUEsT0FBT0EsSUFBSUEsUUFBQ0EsT0FBT0EsQ0FBQ0EsVUFBVUEsRUFBbkJBLENBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtnQkFDbEVBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFVBQUFBLE9BQU9BLElBQUlBLFFBQUNBLE9BQU9BLENBQUNBLFdBQVdBLEVBQXBCQSxDQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7WUFDckVBLENBQUNBO1lBRUQsRUFBRSxDQUFDLGNBQWMsRUFBRTtnQkFDakIsSUFBSSxlQUFlLEdBQUcsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxTQUFTLEVBQUU7Z0JBQ1osSUFBQSxDQUFDO29CQUNDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDdkIsQ0FBRTtnQkFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNYLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUM3QyxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsYUFBYSxFQUFFLFVBQVUsSUFBSTtnQkFDOUIsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUV4QyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsUUFBb0I7b0JBQy9DLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDM0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ25ELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN0QyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDdEMsSUFBSSxFQUFFLENBQUM7Z0JBQ1QsQ0FBQyxDQUFDO2dCQUVGLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLHVDQUF1QyxDQUFDLENBQzFELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDckMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsYUFBYSxFQUFFLFVBQVUsSUFBSTtnQkFDOUIsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUV4QyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsUUFBb0I7b0JBQy9DLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDM0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ25ELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUN6QyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDM0MsSUFBSSxFQUFFLENBQUM7Z0JBQ1QsQ0FBQyxDQUFDO2dCQUVGLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLHVDQUF1QyxDQUFDLENBQzFELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekQsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQVUsSUFBSTtnQkFDNUIsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUV0QyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsUUFBb0I7b0JBQy9DLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDM0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ2pELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxJQUFJLEVBQUUsQ0FBQztnQkFDVCxDQUFDLENBQUM7Z0JBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsMkNBQTJDLENBQUMsQ0FDOUQsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDVCxPQUFPLEVBQUUsU0FBUyxDQUFDLFdBQVcsQ0FBQztpQkFDaEMsQ0FBQyxDQUFDLENBQUM7WUFDUixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLElBQUk7Z0JBQ2xDLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUU1QyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsUUFBb0I7b0JBQy9DLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDM0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztvQkFDdkQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BDLElBQUksRUFBRSxDQUFDO2dCQUNULENBQUMsQ0FBQztnQkFFRixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyx1Q0FBdUMsQ0FBQyxDQUMxRCxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTVELENBQUMsQ0FBQyxDQUFDO1lBR0gsRUFBRSxDQUFDLGNBQWMsRUFBRSxVQUFVLElBQUk7Z0JBQy9CLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFFekMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVLFFBQW9CO29CQUMvQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDaEMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzNCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNwRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDcEMsSUFBSSxFQUFFLENBQUM7Z0JBQ1QsQ0FBQyxDQUFDO2dCQUVGLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLHlDQUF5QyxDQUFDLENBQzVELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdkQsQ0FBQyxDQUFDLENBQUM7WUFFSCxBQUNBLDRDQUQ0QztZQUM1QyxHQUFHLENBQUMsY0FBYyxFQUFFLFVBQVUsSUFBSTtnQkFDaEMsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUV6QyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsUUFBb0I7b0JBQy9DLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDM0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ3BELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN0QyxJQUFJLEVBQUUsQ0FBQztnQkFDVCxDQUFDLENBQUM7Z0JBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcseUNBQXlDLENBQUMsQ0FDNUQsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFDWixRQUFRLEVBQUUsUUFBUTtpQkFDbkIsQ0FBQyxDQUFDLENBQUM7WUFFUixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxtQ0FBbUMsRUFBRSxVQUFVLElBQUk7Z0JBRXBELFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxRQUFvQjtvQkFDL0MsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2xELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxHQUFHLENBQUM7d0JBQ0YscUJBQXFCO3FCQUN0QixFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNYLENBQUMsQ0FBQztnQkFFRixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyx1Q0FBdUMsQ0FBQyxDQUMxRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQ3ZCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUMvQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FDZCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JELENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDhEQUE4RCxFQUFFLFVBQVUsSUFBSTtnQkFFL0UsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVLFFBQW9CO29CQUMvQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDbEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BDLEdBQUcsQ0FBQzt3QkFDRixxQkFBcUI7d0JBQ3JCLHlCQUF5QjtxQkFDMUIsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDWCxDQUFDLENBQUM7Z0JBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsdUNBQXVDLENBQUMsQ0FDMUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUN2QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQy9CLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckQsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsaUVBQWlFLEVBQUUsVUFBVSxJQUFJO2dCQUVsRixTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsUUFBb0I7b0JBQy9DLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNsRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDcEMsR0FBRyxDQUFDO3dCQUNGLHFCQUFxQjt3QkFDckIseUJBQXlCO3FCQUMxQixFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNYLENBQUMsQ0FBQztnQkFFRixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyx1Q0FBdUMsQ0FBQyxDQUMxRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQ3ZCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FDbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FDL0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw0REFBNEQsRUFBRSxVQUFVLElBQUk7Z0JBRTdFLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxRQUFvQjtvQkFDL0MsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ3BELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxJQUFJLEVBQUUsQ0FBQztnQkFDVCxDQUFDLENBQUM7Z0JBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsMkNBQTJDLENBQUMsQ0FDOUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUN2QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FDWixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQzdDLElBQUksQ0FBQyxPQUFPLENBQUM7b0JBQ1osWUFBWSxFQUFFLElBQUk7aUJBQ25CLENBQUMsQ0FBQyxDQUNGLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsK0RBQStELEVBQUUsVUFBVSxJQUFJO2dCQUVoRixTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsUUFBb0I7b0JBQy9DLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUNwRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDcEMsSUFBSSxFQUFFLENBQUM7Z0JBQ1QsQ0FBQyxDQUFDO2dCQUVGLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLDJDQUEyQyxDQUFDLENBQzlELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FDdkIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQ1osSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBZ0I7b0JBQ3JDLEFBQ0EsdURBRHVEO29CQUN2RCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQyxFQUFFLE9BQU8sQ0FBQztvQkFDVCxZQUFZLEVBQUUsSUFBSTtpQkFDbkIsQ0FBQyxDQUFDLENBQUMsQ0FDSCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsSUFBSTtnQkFFbEMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVLFFBQW9CO29CQUMvQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDaEMsSUFBSSxFQUFFLENBQUM7Z0JBQ1QsQ0FBQyxDQUFDO2dCQUVGLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLHVDQUF1QyxDQUFDLENBQzFELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsTUFBYztvQkFDNUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSTt3QkFDeEMsTUFBTSxDQUFDOzRCQUNMLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07NEJBQzlCLFVBQVUsRUFBRSxRQUFRO3lCQUNyQixDQUFDO29CQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNSLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsRUFBRSxDQUFDLENBQUMiLCJmaWxlIjoiaW5kZXhTcGVjLmpzIiwic291cmNlUm9vdCI6IkM6XFxVc2Vyc1xcam9fdmRfMDAwXFxEcm9wYm94XFwyMDE1XFxyZXBvcnRlcnMtZ2l0XFxzcmMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi90eXBpbmdzL2phc21pbmUvamFzbWluZS5kLnRzJyAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPScuLi9zY3JpcHRzL2ludGVyZmFjZXMudHMnIC8+XHJcblxyXG5pbXBvcnQgcmVwb3J0ZXJzVHlwZSA9IHJlcXVpcmUoJy4uL3NjcmlwdHMvaW5kZXgnKTtcclxuXHJcbnZhciBkZWwgPSByZXF1aXJlKCdkZWwnKTtcclxudmFyIGd1bHAgPSByZXF1aXJlKCdndWxwJyk7XHJcbnZhciB0c2xpbnQgPSByZXF1aXJlKCdndWxwLXRzbGludCcpO1xyXG52YXIgc291cmNlbWFwcyA9IHJlcXVpcmUoJ2d1bHAtc291cmNlbWFwcycpO1xyXG52YXIgdHlwZXNjcmlwdCA9IHJlcXVpcmUoJ2d1bHAtdHlwZXNjcmlwdCcpO1xyXG52YXIganNoaW50ID0gcmVxdWlyZSgnZ3VscC1qc2hpbnQnKTtcclxudmFyIHNhc3MgPSByZXF1aXJlKCdndWxwLXNhc3MnKTtcclxudmFyIGNzc2xpbnQgPSByZXF1aXJlKCdndWxwLWNzc2xpbnQnKTtcclxudmFyIGd1bHBpZiA9IHJlcXVpcmUoJ2d1bHAtaWYnKTtcclxudmFyIGphc21pbmUgPSByZXF1aXJlKCdndWxwLWphc21pbmUnKTtcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBkZXNjcmliZSgncmVwb3J0ZXJzOicsIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB2YXIgcmVwb3J0ZXJzOiB0eXBlb2YgcmVwb3J0ZXJzVHlwZTtcclxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xyXG4gICAgICAvLyBDcmVhdGUgZnJlc2ggaW5zdGFuY2UgcGVyIHRlc3RcclxuICAgICAgcmVwb3J0ZXJzID0gPHR5cGVvZiByZXBvcnRlcnNUeXBlPnJlcXVpcmUoJy4uL3NjcmlwdHMvaW5kZXgnKTtcclxuICAgICAgLy8gcmVwb3J0ZXJzLmRlYnVnID0gdHJ1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBtZXNzYWdlczogSU1lc3NhZ2VbXSA9IFt7XHJcbiAgICAgIHNvdXJjZU5hbWU6ICd0ZXN0LW1heGltdW0nLFxyXG4gICAgICBmaWxlUGF0aDogJ2ZpbGVQYXRoMScsXHJcbiAgICAgIHR5cGU6ICd3YXJuaW5nJyxcclxuICAgICAgY29kZTogJ0NPREU1MScsXHJcbiAgICAgIGxpbmVOYnI6IDIsXHJcbiAgICAgIGNvbE5icjogMyxcclxuICAgICAgZGVzY3JpcHRpb246ICdtZXNzYWdlMSdcclxuICAgIH0sIHtcclxuICAgICAgc291cmNlTmFtZTogJ3Rlc3QtbWVkaXVtJyxcclxuICAgICAgZmlsZVBhdGg6ICdmaWxlUGF0aDEnLFxyXG4gICAgICBsaW5lTmJyOiAyLFxyXG4gICAgICBjb2xOYnI6IDMsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnbWVzc2FnZTInXHJcbiAgICB9LCB7XHJcbiAgICAgIHNvdXJjZU5hbWU6ICd0ZXN0LW1pbmltdW0nLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ21lc3NhZ2UzJ1xyXG4gICAgfV07XHJcblxyXG4gICAgZGVzY3JpYmUoJ291dHB1dDonLCBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICBmdW5jdGlvbiB2YWxpZGF0ZShuYW1lOiBzdHJpbmcsIG91dHB1dFJlcG9ydGVyOiBJT3V0cHV0KSB7XHJcbiAgICAgICAgZXhwZWN0KG91dHB1dFJlcG9ydGVyKS50b0JlRGVmaW5lZCgpO1xyXG4gICAgICAgIGV4cGVjdCh0eXBlb2Ygb3V0cHV0UmVwb3J0ZXIgPT09ICdmdW5jdGlvbicpLnRvQmVUcnV0aHkoKTtcclxuICAgICAgICBpZiAocmVwb3J0ZXJzLmRlYnVnKSB7XHJcbiAgICAgICAgICBvdXRwdXRSZXBvcnRlcihtZXNzYWdlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpdCgnZ2V0T3V0cHV0cycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3V0cHV0UmVwb3J0ZXJzID0gcmVwb3J0ZXJzLmdldE91dHB1dHMoKTtcclxuICAgICAgICBleHBlY3Qob3V0cHV0UmVwb3J0ZXJzLmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuKDApO1xyXG4gICAgICAgIGV4cGVjdCh0eXBlb2Ygb3V0cHV0UmVwb3J0ZXJzWzBdID09PSAnc3RyaW5nJykudG9CZVRydXRoeSgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGl0KCdnZXRPdXRwdXQoXFwndnMtY29uc29sZVxcJyknLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG91dHB1dFJlcG9ydGVyID0gcmVwb3J0ZXJzLmdldE91dHB1dCgndnMtY29uc29sZScpO1xyXG4gICAgICAgIHZhbGlkYXRlKCd2cy1jb25zb2xlJywgb3V0cHV0UmVwb3J0ZXIpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGl0KCdnZXRPdXRwdXQoXFwnbm90aWZ5XFwnKScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3V0cHV0UmVwb3J0ZXIgPSByZXBvcnRlcnMuZ2V0T3V0cHV0KCdub3RpZnknKTtcclxuICAgICAgICB2YWxpZGF0ZSgnbm90aWZ5Jywgb3V0cHV0UmVwb3J0ZXIpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGl0KCdvdXRwdXQgPSBmdW5jdGlvbicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbG9nZ2VkTWVzc2FnZXM6IElNZXNzYWdlW10gPSBbXTtcclxuICAgICAgICByZXBvcnRlcnMub3V0cHV0ID0gKG1lc3NhZ2VzOiBJTWVzc2FnZVtdKSA9PiBsb2dnZWRNZXNzYWdlcyA9IG1lc3NhZ2VzO1xyXG4gICAgICAgIHJlcG9ydGVycy5yZXBvcnQobWVzc2FnZXMpO1xyXG4gICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUobG9nZ2VkTWVzc2FnZXMubGVuZ3RoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpdCgnb3V0cHV0ID0gZnVuY3Rpb24nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGxvZ0NvdW50ID0gMDtcclxuICAgICAgICByZXBvcnRlcnMub3V0cHV0ID0gKCkgPT4gbG9nQ291bnQrKztcclxuICAgICAgICByZXBvcnRlcnMucmVwb3J0KG1lc3NhZ2VzKTtcclxuICAgICAgICBleHBlY3QobG9nQ291bnQpLnRvQmUoMSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaXQoJ291dHB1dCA9IFtdJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBjYWxsZWQxID0gMDtcclxuICAgICAgICB2YXIgY2FsbGVkMiA9IDA7XHJcbiAgICAgICAgcmVwb3J0ZXJzLm91dHB1dCA9IFsoKSA9PiBjYWxsZWQxKyssICgpID0+IGNhbGxlZDIrK107XHJcbiAgICAgICAgcmVwb3J0ZXJzLnJlcG9ydChtZXNzYWdlcyk7XHJcbiAgICAgICAgZXhwZWN0KGNhbGxlZDEpLnRvQmUoMSk7XHJcbiAgICAgICAgZXhwZWN0KGNhbGxlZDIpLnRvQmUoMSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ2ZpbHRlck9yVXBkYXRlOiBudWxsJywgZnVuY3Rpb24gKGRvbmUpIHtcclxuXHJcbiAgICAgIC8vIGNoYW5nZSBkZXNjcmlwdGlvblxyXG4gICAgICByZXBvcnRlcnMuZmlsdGVyT3JVcGRhdGUgPSBudWxsO1xyXG4gICAgICByZXBvcnRlcnMub3V0cHV0ID0gKGZpbHRlcmVkTWVzc2FnZXM6IElNZXNzYWdlW10pID0+IHtcclxuICAgICAgICBleHBlY3QoZmlsdGVyZWRNZXNzYWdlc1swXS5jb2RlKS50b0JlKG1lc3NhZ2VzWzBdLmNvZGUpO1xyXG4gICAgICAgIGV4cGVjdChmaWx0ZXJlZE1lc3NhZ2VzLmxlbmd0aCkudG9CZShtZXNzYWdlcy5sZW5ndGgpO1xyXG4gICAgICAgIGRvbmUoKTtcclxuICAgICAgfTtcclxuICAgICAgcmVwb3J0ZXJzLnJlcG9ydChtZXNzYWdlcyk7XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ2ZpbHRlck9yVXBkYXRlOiBmaWx0ZXInLCBmdW5jdGlvbiAoZG9uZSkge1xyXG5cclxuICAgICAgLy8gYWxsb3cgMSBtZXNzYWdlXHJcbiAgICAgIHJlcG9ydGVycy5maWx0ZXJPclVwZGF0ZSA9IChtZXNzYWdlczogSU1lc3NhZ2VbXSkgPT4gW21lc3NhZ2VzWzBdXTtcclxuXHJcbiAgICAgIHJlcG9ydGVycy5vdXRwdXQgPSAoZmlsdGVyZWRNZXNzYWdlczogSU1lc3NhZ2VbXSkgPT4ge1xyXG4gICAgICAgIGV4cGVjdChmaWx0ZXJlZE1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKTtcclxuICAgICAgICByZXBvcnRlcnMuZmlsdGVyT3JVcGRhdGUgPSBudWxsO1xyXG4gICAgICAgIGRvbmUoKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHJlcG9ydGVycy5yZXBvcnQobWVzc2FnZXMpO1xyXG5cclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdmaWx0ZXJPclVwZGF0ZTogdXBkYXRlJywgZnVuY3Rpb24gKGRvbmUpIHtcclxuXHJcbiAgICAgIC8vIGNoYW5nZSBkZXNjcmlwdGlvblxyXG4gICAgICByZXBvcnRlcnMuZmlsdGVyT3JVcGRhdGUgPSAobWVzc2FnZXM6IElNZXNzYWdlW10pID0+IG1lc3NhZ2VzLm1hcChtID0+IHtcclxuICAgICAgICBtLmNvZGUgPSAnY2hhbmdlZCc7XHJcbiAgICAgICAgcmV0dXJuIG07XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmVwb3J0ZXJzLm91dHB1dCA9IChmaWx0ZXJlZE1lc3NhZ2VzOiBJTWVzc2FnZVtdKSA9PiB7XHJcbiAgICAgICAgZXhwZWN0KGZpbHRlcmVkTWVzc2FnZXNbMF0uY29kZSkudG9CZSgnY2hhbmdlZCcpO1xyXG4gICAgICAgIGV4cGVjdChmaWx0ZXJlZE1lc3NhZ2VzLmxlbmd0aCkudG9CZShtZXNzYWdlcy5sZW5ndGgpO1xyXG4gICAgICAgIHJlcG9ydGVycy5maWx0ZXJPclVwZGF0ZSA9IG51bGw7XHJcbiAgICAgICAgZG9uZSgpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgcmVwb3J0ZXJzLnJlcG9ydChtZXNzYWdlcyk7XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJ2lucHV0OicsIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIHZhbGlkYXRlTWVzc2FnZXMobWVzc2FnZXM6IElNZXNzYWdlW10pIHtcclxuICAgICAgICBleHBlY3QobWVzc2FnZXMuc29tZShtZXNzYWdlID0+ICFtZXNzYWdlLnNvdXJjZU5hbWUpKS50b0JlRmFsc3koKTtcclxuICAgICAgICBleHBlY3QobWVzc2FnZXMuc29tZShtZXNzYWdlID0+ICFtZXNzYWdlLmRlc2NyaXB0aW9uKSkudG9CZUZhbHN5KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGl0KCdnZXRBdmFpbGFibGUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGF2YWlsYWJsZUlucHV0cyA9IHJlcG9ydGVycy5nZXRBdmFpbGFibGUoKTtcclxuICAgICAgICBleHBlY3QoYXZhaWxhYmxlSW5wdXRzLmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuKDMpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGl0KCd1bmtub3duJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICByZXBvcnRlcnMoJ3Vua25vd24nKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICBleHBlY3QoZS5tZXNzYWdlKS50b0NvbnRhaW4oJ2d1bHAtanNoaW50Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGl0KCdndWxwLWpzaGludCcsIGZ1bmN0aW9uIChkb25lKSB7XHJcbiAgICAgICAgdmFyIHJlcG9ydGVyID0gcmVwb3J0ZXJzKCdndWxwLWpzaGludCcpO1xyXG5cclxuICAgICAgICByZXBvcnRlcnMub3V0cHV0ID0gZnVuY3Rpb24gKG1lc3NhZ2VzOiBJTWVzc2FnZVtdKSB7XHJcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDIpO1xyXG4gICAgICAgICAgdmFsaWRhdGVNZXNzYWdlcyhtZXNzYWdlcyk7XHJcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0uc291cmNlTmFtZSkudG9CZSgnZ3VscC1qc2hpbnQnKTtcclxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5jb2RlKS50b0JlKCdXMDMzJyk7XHJcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMV0uY29kZSkudG9CZSgnVzA5OCcpO1xyXG4gICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGd1bHAuc3JjKF9fZGlybmFtZSArICcvLi4vLi4vc3JjL3NwZWNzL3Rlc3RmaWxlcy9qcy9mYWlsLmpzJylcclxuICAgICAgICAgIC5waXBlKGpzaGludCgpKVxyXG4gICAgICAgICAgLnBpcGUoanNoaW50LnJlcG9ydGVyKHJlcG9ydGVyKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaXQoJ2d1bHAtdHNsaW50JywgZnVuY3Rpb24gKGRvbmUpIHtcclxuICAgICAgICB2YXIgcmVwb3J0ZXIgPSByZXBvcnRlcnMoJ2d1bHAtdHNsaW50Jyk7XHJcblxyXG4gICAgICAgIHJlcG9ydGVycy5vdXRwdXQgPSBmdW5jdGlvbiAobWVzc2FnZXM6IElNZXNzYWdlW10pIHtcclxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMik7XHJcbiAgICAgICAgICB2YWxpZGF0ZU1lc3NhZ2VzKG1lc3NhZ2VzKTtcclxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5zb3VyY2VOYW1lKS50b0JlKCdndWxwLXRzbGludCcpO1xyXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmNvZGUpLnRvQmUoJ2VvZmxpbmUnKTtcclxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5jb2RlKS50b0JlKCdzZW1pY29sb24nKTtcclxuICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBndWxwLnNyYyhfX2Rpcm5hbWUgKyAnLy4uLy4uL3NyYy9zcGVjcy90ZXN0ZmlsZXMvdHMvbGludC50cycpXHJcbiAgICAgICAgICAucGlwZSh0c2xpbnQoKSlcclxuICAgICAgICAgIC5waXBlKHRzbGludC5yZXBvcnQocmVwb3J0ZXIsIHsgZW1pdEVycm9yOiBmYWxzZSB9KSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaXQoJ2d1bHAtc2FzcycsIGZ1bmN0aW9uIChkb25lKSB7XHJcbiAgICAgICAgdmFyIHJlcG9ydGVyID0gcmVwb3J0ZXJzKCdndWxwLXNhc3MnKTtcclxuXHJcbiAgICAgICAgcmVwb3J0ZXJzLm91dHB1dCA9IGZ1bmN0aW9uIChtZXNzYWdlczogSU1lc3NhZ2VbXSkge1xyXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKTtcclxuICAgICAgICAgIHZhbGlkYXRlTWVzc2FnZXMobWVzc2FnZXMpO1xyXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNvdXJjZU5hbWUpLnRvQmUoJ2d1bHAtc2FzcycpO1xyXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxpbmVOYnIpLnRvQmUoNSk7XHJcbiAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZ3VscC5zcmMoX19kaXJuYW1lICsgJy8uLi8uLi9zcmMvc3BlY3MvdGVzdGZpbGVzL3Njc3MvZmFpbC5zY3NzJylcclxuICAgICAgICAgIC5waXBlKHNhc3Moe1xyXG4gICAgICAgICAgICBvbkVycm9yOiByZXBvcnRlcnMoJ2d1bHAtc2FzcycpXHJcbiAgICAgICAgICB9KSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaXQoJ2d1bHAtdHlwZXNjcmlwdCcsIGZ1bmN0aW9uIChkb25lKSB7XHJcbiAgICAgICAgdmFyIHJlcG9ydGVyID0gcmVwb3J0ZXJzKCdndWxwLXR5cGVzY3JpcHQnKTtcclxuXHJcbiAgICAgICAgcmVwb3J0ZXJzLm91dHB1dCA9IGZ1bmN0aW9uIChtZXNzYWdlczogSU1lc3NhZ2VbXSkge1xyXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKTtcclxuICAgICAgICAgIHZhbGlkYXRlTWVzc2FnZXMobWVzc2FnZXMpO1xyXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNvdXJjZU5hbWUpLnRvQmUoJ2d1bHAtdHlwZXNjcmlwdCcpO1xyXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxpbmVOYnIpLnRvQmUoNSk7XHJcbiAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZ3VscC5zcmMoX19kaXJuYW1lICsgJy8uLi8uLi9zcmMvc3BlY3MvdGVzdGZpbGVzL3RzL2ZhaWwudHMnKVxyXG4gICAgICAgICAgLnBpcGUodHlwZXNjcmlwdCh7fSwge30sIHJlcG9ydGVycygnZ3VscC10eXBlc2NyaXB0JykpKTtcclxuXHJcbiAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgIGl0KCdndWxwLWNzc2xpbnQnLCBmdW5jdGlvbiAoZG9uZSkge1xyXG4gICAgICAgIHZhciByZXBvcnRlciA9IHJlcG9ydGVycygnZ3VscC1jc3NsaW50Jyk7XHJcblxyXG4gICAgICAgIHJlcG9ydGVycy5vdXRwdXQgPSBmdW5jdGlvbiAobWVzc2FnZXM6IElNZXNzYWdlW10pIHtcclxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMik7XHJcbiAgICAgICAgICB2YWxpZGF0ZU1lc3NhZ2VzKG1lc3NhZ2VzKTtcclxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5zb3VyY2VOYW1lKS50b0JlKCdndWxwLWNzc2xpbnQnKTtcclxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5saW5lTmJyKS50b0JlKDUpO1xyXG4gICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGd1bHAuc3JjKF9fZGlybmFtZSArICcvLi4vLi4vc3JjL3NwZWNzL3Rlc3RmaWxlcy9jc3MvZmFpbC5jc3MnKVxyXG4gICAgICAgICAgLnBpcGUoY3NzbGludCgpKVxyXG4gICAgICAgICAgLnBpcGUoY3NzbGludC5yZXBvcnRlcihyZXBvcnRlcnMoJ2d1bHAtY3NzbGludCcpKSk7XHJcblxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIHhpdCBiZWNhdXNlIHByb2JsZW0gbmVzdGluZyBqYXNtaW5lIHRlc3RzXHJcbiAgICAgIHhpdCgnZ3VscC1qYXNtaW5lJywgZnVuY3Rpb24gKGRvbmUpIHtcclxuICAgICAgICB2YXIgcmVwb3J0ZXIgPSByZXBvcnRlcnMoJ2d1bHAtamFzbWluZScpO1xyXG5cclxuICAgICAgICByZXBvcnRlcnMub3V0cHV0ID0gZnVuY3Rpb24gKG1lc3NhZ2VzOiBJTWVzc2FnZVtdKSB7XHJcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDIpO1xyXG4gICAgICAgICAgdmFsaWRhdGVNZXNzYWdlcyhtZXNzYWdlcyk7XHJcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0uc291cmNlTmFtZSkudG9CZSgnZ3VscC1qYXNtaW5lJyk7XHJcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0ubGluZU5icikudG9CZSgnMycpO1xyXG4gICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGd1bHAuc3JjKF9fZGlybmFtZSArICcvLi4vLi4vc3JjL3NwZWNzL3Rlc3RmaWxlcy90ZXN0L2ZhaWwuanMnKVxyXG4gICAgICAgICAgLnBpcGUoamFzbWluZSh7XHJcbiAgICAgICAgICAgIHJlcG9ydGVyOiByZXBvcnRlclxyXG4gICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpdCgnZ3VscC1qc2hpbnQgd2l0aCBpbmxpbmUgc291cmNlbWFwJywgZnVuY3Rpb24gKGRvbmUpIHtcclxuXHJcbiAgICAgICAgcmVwb3J0ZXJzLm91dHB1dCA9IGZ1bmN0aW9uIChtZXNzYWdlczogSU1lc3NhZ2VbXSkge1xyXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmZpbGVQYXRoKS50b0NvbnRhaW4oJ2xpbnQudHMnKTtcclxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5saW5lTmJyKS50b0JlKDUpO1xyXG4gICAgICAgICAgZGVsKFtcclxuICAgICAgICAgICAgJ2J1aWxkL3NwZWNzL2xpbnQuanMnXHJcbiAgICAgICAgICBdLCBkb25lKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBndWxwLnNyYyhfX2Rpcm5hbWUgKyAnLy4uLy4uL3NyYy9zcGVjcy90ZXN0ZmlsZXMvdHMvbGludC50cycpXHJcbiAgICAgICAgICAucGlwZShzb3VyY2VtYXBzLmluaXQoKSlcclxuICAgICAgICAgIC5waXBlKHR5cGVzY3JpcHQoKSkuanNcclxuICAgICAgICAgIC5waXBlKHNvdXJjZW1hcHMud3JpdGUoKSlcclxuICAgICAgICAgIC5waXBlKGd1bHAuZGVzdCgnYnVpbGQvc3BlY3MvJykpIC8vIFdlIG5lZWQgdG8gc2F2ZSBiZWNhdXNlIHdlIGRvbid0IGhhdmUgdmlueWwgZmlsZSBpbiBqc2hpbnQgcmVwb3J0ZXJcclxuICAgICAgICAgIC5waXBlKGpzaGludCgpKVxyXG4gICAgICAgICAgLnBpcGUoanNoaW50LnJlcG9ydGVyKHJlcG9ydGVycygnZ3VscC1qc2hpbnQnKSkpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGl0KCdndWxwLWpzaGludCB3aXRoIGV4dGVybmFsIHNvdXJjZW1hcCB3aXRoIGNvbW1lbnQgdG8gbWFwIGZpbGUnLCBmdW5jdGlvbiAoZG9uZSkge1xyXG5cclxuICAgICAgICByZXBvcnRlcnMub3V0cHV0ID0gZnVuY3Rpb24gKG1lc3NhZ2VzOiBJTWVzc2FnZVtdKSB7XHJcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0uZmlsZVBhdGgpLnRvQ29udGFpbignbGludC50cycpO1xyXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxpbmVOYnIpLnRvQmUoNSk7XHJcbiAgICAgICAgICBkZWwoW1xyXG4gICAgICAgICAgICAnYnVpbGQvc3BlY3MvbGludC5qcycsXHJcbiAgICAgICAgICAgICdidWlsZC9zcGVjcy9saW50LmpzLm1hcCdcclxuICAgICAgICAgIF0sIGRvbmUpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGd1bHAuc3JjKF9fZGlybmFtZSArICcvLi4vLi4vc3JjL3NwZWNzL3Rlc3RmaWxlcy90cy9saW50LnRzJylcclxuICAgICAgICAgIC5waXBlKHNvdXJjZW1hcHMuaW5pdCgpKVxyXG4gICAgICAgICAgLnBpcGUodHlwZXNjcmlwdCgpKS5qc1xyXG4gICAgICAgICAgLnBpcGUoc291cmNlbWFwcy53cml0ZSgnLicpKVxyXG4gICAgICAgICAgLnBpcGUoZ3VscC5kZXN0KCdidWlsZC9zcGVjcy8nKSkgLy8gV2UgbmVlZCB0byBzYXZlIGJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSB2aW55bCBmaWxlIGluIGpzaGludCByZXBvcnRlclxyXG4gICAgICAgICAgLnBpcGUoanNoaW50KCkpXHJcbiAgICAgICAgICAucGlwZShqc2hpbnQucmVwb3J0ZXIocmVwb3J0ZXJzKCdndWxwLWpzaGludCcpKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaXQoJ2d1bHAtanNoaW50IHdpdGggZXh0ZXJuYWwgc291cmNlbWFwIHdpdGhvdXQgY29tbWVudCB0byBtYXAgZmlsZScsIGZ1bmN0aW9uIChkb25lKSB7XHJcblxyXG4gICAgICAgIHJlcG9ydGVycy5vdXRwdXQgPSBmdW5jdGlvbiAobWVzc2FnZXM6IElNZXNzYWdlW10pIHtcclxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5maWxlUGF0aCkudG9Db250YWluKCdsaW50LnRzJyk7XHJcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0ubGluZU5icikudG9CZSg1KTtcclxuICAgICAgICAgIGRlbChbXHJcbiAgICAgICAgICAgICdidWlsZC9zcGVjcy9saW50LmpzJyxcclxuICAgICAgICAgICAgJ2J1aWxkL3NwZWNzL2xpbnQuanMubWFwJ1xyXG4gICAgICAgICAgXSwgZG9uZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZ3VscC5zcmMoX19kaXJuYW1lICsgJy8uLi8uLi9zcmMvc3BlY3MvdGVzdGZpbGVzL3RzL2xpbnQudHMnKVxyXG4gICAgICAgICAgLnBpcGUoc291cmNlbWFwcy5pbml0KCkpXHJcbiAgICAgICAgICAucGlwZSh0eXBlc2NyaXB0KCkpLmpzXHJcbiAgICAgICAgICAucGlwZShzb3VyY2VtYXBzLndyaXRlKCcuJywgeyBhZGRDb21tZW50OiBmYWxzZSB9KSlcclxuICAgICAgICAgIC5waXBlKGd1bHAuZGVzdCgnYnVpbGQvc3BlY3MvJykpIC8vIFdlIG5lZWQgdG8gc2F2ZSBiZWNhdXNlIHdlIGRvbid0IGhhdmUgdmlueWwgZmlsZSBpbiBqc2hpbnQgcmVwb3J0ZXJcclxuICAgICAgICAgIC5waXBlKGpzaGludCgpKVxyXG4gICAgICAgICAgLnBpcGUoanNoaW50LnJlcG9ydGVyKHJlcG9ydGVycygnZ3VscC1qc2hpbnQnKSkpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGl0KCdndWxwLWNzc2xpbnQgd2l0aCAuc291cmNlTWFwIHByb3BlcnR5IGluIFZpbnlsIGZpbGUgKGd1bHApJywgZnVuY3Rpb24gKGRvbmUpIHtcclxuXHJcbiAgICAgICAgcmVwb3J0ZXJzLm91dHB1dCA9IGZ1bmN0aW9uIChtZXNzYWdlczogSU1lc3NhZ2VbXSkge1xyXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmZpbGVQYXRoKS50b0NvbnRhaW4oJ3Rlc3Quc2NzcycpO1xyXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxpbmVOYnIpLnRvQmUoNSk7XHJcbiAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZ3VscC5zcmMoX19kaXJuYW1lICsgJy8uLi8uLi9zcmMvc3BlY3MvdGVzdGZpbGVzL3Njc3MvdGVzdC5zY3NzJylcclxuICAgICAgICAgIC5waXBlKHNvdXJjZW1hcHMuaW5pdCgpKVxyXG4gICAgICAgICAgLnBpcGUoc2FzcygpKVxyXG4gICAgICAgICAgLnBpcGUoc291cmNlbWFwcy53cml0ZSh7IGFkZENvbW1lbnQ6IGZhbHNlIH0pKVxyXG4gICAgICAgICAgLnBpcGUoY3NzbGludCh7XHJcbiAgICAgICAgICAgICd6ZXJvLXVuaXRzJzogdHJ1ZVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgICAucGlwZShjc3NsaW50LnJlcG9ydGVyKHJlcG9ydGVycygnZ3VscC1jc3NsaW50JykpKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpdCgnZ3VscC1jc3NsaW50IHdpdGggc291cmNlbWFwIGluIC5jb250ZW50cyBvZiBWaW55bCBmaWxlIChndWxwKScsIGZ1bmN0aW9uIChkb25lKSB7XHJcblxyXG4gICAgICAgIHJlcG9ydGVycy5vdXRwdXQgPSBmdW5jdGlvbiAobWVzc2FnZXM6IElNZXNzYWdlW10pIHtcclxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5maWxlUGF0aCkudG9Db250YWluKCd0ZXN0LnNjc3MnKTtcclxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5saW5lTmJyKS50b0JlKDUpO1xyXG4gICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGd1bHAuc3JjKF9fZGlybmFtZSArICcvLi4vLi4vc3JjL3NwZWNzL3Rlc3RmaWxlcy9zY3NzL3Rlc3Quc2NzcycpXHJcbiAgICAgICAgICAucGlwZShzb3VyY2VtYXBzLmluaXQoKSlcclxuICAgICAgICAgIC5waXBlKHNhc3MoKSlcclxuICAgICAgICAgIC5waXBlKHNvdXJjZW1hcHMud3JpdGUoeyBhZGRDb21tZW50OiB0cnVlIH0pKVxyXG4gICAgICAgICAgLnBpcGUoZ3VscGlmKGZ1bmN0aW9uIChmaWxlOiBJVmlueWxGaWxlKSB7XHJcbiAgICAgICAgICAgIC8vIE1pcy11c2VkIGd1bHAtaWYgdG8gcmVtb3ZlIHNvdXJjZU1hcCBtZW1iZXIgdmFyaWFibGVcclxuICAgICAgICAgICAgZGVsZXRlIGZpbGUuc291cmNlTWFwO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH0sIGNzc2xpbnQoe1xyXG4gICAgICAgICAgICAnemVyby11bml0cyc6IHRydWVcclxuICAgICAgICAgIH0pKSlcclxuICAgICAgICAgIC5waXBlKGNzc2xpbnQucmVwb3J0ZXIocmVwb3J0ZXJzKCdndWxwLWNzc2xpbnQnKSkpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGl0KCdjdXN0b20gcmVwb3J0ZXInLCBmdW5jdGlvbiAoZG9uZSkge1xyXG5cclxuICAgICAgICByZXBvcnRlcnMub3V0cHV0ID0gZnVuY3Rpb24gKG1lc3NhZ2VzOiBJTWVzc2FnZVtdKSB7XHJcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDIpO1xyXG4gICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGd1bHAuc3JjKF9fZGlybmFtZSArICcvLi4vLi4vc3JjL3NwZWNzL3Rlc3RmaWxlcy9qcy9mYWlsLmpzJylcclxuICAgICAgICAgIC5waXBlKGpzaGludCgpKVxyXG4gICAgICAgICAgLnBpcGUoanNoaW50LnJlcG9ydGVyKGZ1bmN0aW9uIChlcnJvcnM6IGFueSBbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICByZXBvcnRlcnMucmVwb3J0KGVycm9ycy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGl0ZW0uZXJyb3IucmVhc29uLFxyXG4gICAgICAgICAgICAgICAgc291cmNlTmFtZTogJ2N1c3RvbSdcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICB9KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn0oKSk7XHJcbiJdfQ==