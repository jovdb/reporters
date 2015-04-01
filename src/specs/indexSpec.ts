/// <reference path='../../typings/jasmine/jasmine.d.ts' />
/// <reference path='../scripts/interfaces.ts' />

import reportersType = require('../scripts/index');

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

    var reporters: typeof reportersType;
    beforeEach(() => {
      // Create fresh instance per test
      reporters = <typeof reportersType>require('../scripts/index');
      // reporters.debug = true;
    });

    var messages: IMessage[] = [{
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

      function validate(name: string, outputReporter: IOutput) {
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
        var loggedMessages: IMessage[] = [];
        reporters.output = (messages: IMessage[]) => loggedMessages = messages;
        reporters.report(messages);
        expect(messages.length).toBe(loggedMessages.length);
      });

      it('output = function', function () {
        var logCount = 0;
        reporters.output = () => logCount++;
        reporters.report(messages);
        expect(logCount).toBe(1);
      });

      it('output = []', function () {
        var called1 = 0;
        var called2 = 0;
        reporters.output = [() => called1++, () => called2++];
        reporters.report(messages);
        expect(called1).toBe(1);
        expect(called2).toBe(1);
      });
    });

    it('filterOrUpdate: null', function (done) {

      // change description
      reporters.filterOrUpdate = null;
      reporters.output = (filteredMessages: IMessage[]) => {
        expect(filteredMessages[0].code).toBe(messages[0].code);
        expect(filteredMessages.length).toBe(messages.length);
        done();
      };
      reporters.report(messages);

    });

    it('filterOrUpdate: filter', function (done) {

      // allow 1 message
      reporters.filterOrUpdate = (messages: IMessage[]) => [messages[0]];

      reporters.output = (filteredMessages: IMessage[]) => {
        expect(filteredMessages.length).toBe(1);
        reporters.filterOrUpdate = null;
        done();
      };

      reporters.report(messages);

    });

    it('filterOrUpdate: update', function (done) {

      // change description
      reporters.filterOrUpdate = (messages: IMessage[]) => messages.map(m => {
        m.code = 'changed';
        return m;
      });

      reporters.output = (filteredMessages: IMessage[]) => {
        expect(filteredMessages[0].code).toBe('changed');
        expect(filteredMessages.length).toBe(messages.length);
        reporters.filterOrUpdate = null;
        done();
      };

      reporters.report(messages);

    });

    describe('input:', function () {

      function validateMessages(messages: IMessage[]) {
        expect(messages.some(message => !message.sourceName)).toBeFalsy();
        expect(messages.some(message => !message.description)).toBeFalsy();
      }

      it('getAvailable', function () {
        var availableInputs = reporters.getAvailable();
        expect(availableInputs.length).toBeGreaterThan(3);
      });

      it('unknown', function () {
        try {
          reporters('unknown');
        } catch (e) {
          expect(e.message).toContain('gulp-jshint');
        }
      });

      it('gulp-jshint', function (done) {
        var reporter = reporters('gulp-jshint');

        reporters.output = function (messages: IMessage[]) {
          expect(messages.length).toBe(2);
          validateMessages(messages);
          expect(messages[0].sourceName).toBe('gulp-jshint');
          expect(messages[0].code).toBe('W033');
          expect(messages[1].code).toBe('W098');
          done();
        };

        gulp.src(__dirname + '/../../src/specs/testfiles/js/fail.js')
          .pipe(jshint())
          .pipe(jshint.reporter(reporter));
      });

      it('gulp-tslint', function (done) {
        var reporter = reporters('gulp-tslint');

        reporters.output = function (messages: IMessage[]) {
          expect(messages.length).toBe(2);
          validateMessages(messages);
          expect(messages[0].sourceName).toBe('gulp-tslint');
          expect(messages[0].code).toBe('eofline');
          expect(messages[1].code).toBe('semicolon');
          done();
        };

        gulp.src(__dirname + '/../../src/specs/testfiles/ts/lint.ts')
          .pipe(tslint())
          .pipe(tslint.report(reporter, { emitError: false }));
      });

      it('gulp-sass', function (done) {
        var reporter = reporters('gulp-sass');

        reporters.output = function (messages: IMessage[]) {
          expect(messages.length).toBe(1);
          validateMessages(messages);
          expect(messages[0].sourceName).toBe('gulp-sass');
          expect(messages[0].lineNbr).toBe(5);
          done();
        };

        gulp.src(__dirname + '/../../src/specs/testfiles/scss/fail.scss')
          .pipe(sass({
            onError: reporters('gulp-sass')
          }));
      });

      it('gulp-typescript', function (done) {
        var reporter = reporters('gulp-typescript');

        reporters.output = function (messages: IMessage[]) {
          expect(messages.length).toBe(1);
          validateMessages(messages);
          expect(messages[0].sourceName).toBe('gulp-typescript');
          expect(messages[0].lineNbr).toBe(5);
          done();
        };

        gulp.src(__dirname + '/../../src/specs/testfiles/ts/fail.ts')
          .pipe(typescript({}, {}, reporters('gulp-typescript')));

      });


      it('gulp-csslint', function (done) {
        var reporter = reporters('gulp-csslint');

        reporters.output = function (messages: IMessage[]) {
          expect(messages.length).toBe(2);
          validateMessages(messages);
          expect(messages[1].sourceName).toBe('gulp-csslint');
          expect(messages[1].lineNbr).toBe(5);
          done();
        };

        gulp.src(__dirname + '/../../src/specs/testfiles/css/fail.css')
          .pipe(csslint())
          .pipe(csslint.reporter(reporters('gulp-csslint')));

      });

      // xit because problem nesting jasmine tests
      xit('gulp-jasmine', function (done) {
        var reporter = reporters('gulp-jasmine');

        reporters.output = function (messages: IMessage[]) {
          expect(messages.length).toBe(2);
          validateMessages(messages);
          expect(messages[0].sourceName).toBe('gulp-jasmine');
          expect(messages[0].lineNbr).toBe('3');
          done();
        };

        gulp.src(__dirname + '/../../src/specs/testfiles/test/fail.js')
          .pipe(jasmine({
            reporter: reporter
          }));

      });

      it('gulp-jshint with inline sourcemap', function (done) {

        reporters.output = function (messages: IMessage[]) {
          expect(messages[0].filePath).toContain('lint.ts');
          expect(messages[0].lineNbr).toBe(5);
          del([
            'build/specs/lint.js'
          ], done);
        };

        gulp.src(__dirname + '/../../src/specs/testfiles/ts/lint.ts')
          .pipe(sourcemaps.init())
          .pipe(typescript()).js
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('build/specs/')) // We need to save because we don't have vinyl file in jshint reporter
          .pipe(jshint())
          .pipe(jshint.reporter(reporters('gulp-jshint')));
      });

      it('gulp-jshint with external sourcemap with comment to map file', function (done) {

        reporters.output = function (messages: IMessage[]) {
          expect(messages[0].filePath).toContain('lint.ts');
          expect(messages[0].lineNbr).toBe(5);
          del([
            'build/specs/lint.js',
            'build/specs/lint.js.map'
          ], done);
        };

        gulp.src(__dirname + '/../../src/specs/testfiles/ts/lint.ts')
          .pipe(sourcemaps.init())
          .pipe(typescript()).js
          .pipe(sourcemaps.write('.'))
          .pipe(gulp.dest('build/specs/')) // We need to save because we don't have vinyl file in jshint reporter
          .pipe(jshint())
          .pipe(jshint.reporter(reporters('gulp-jshint')));
      });

      it('gulp-jshint with external sourcemap without comment to map file', function (done) {

        reporters.output = function (messages: IMessage[]) {
          expect(messages[0].filePath).toContain('lint.ts');
          expect(messages[0].lineNbr).toBe(5);
          del([
            'build/specs/lint.js',
            'build/specs/lint.js.map'
          ], done);
        };

        gulp.src(__dirname + '/../../src/specs/testfiles/ts/lint.ts')
          .pipe(sourcemaps.init())
          .pipe(typescript()).js
          .pipe(sourcemaps.write('.', { addComment: false }))
          .pipe(gulp.dest('build/specs/')) // We need to save because we don't have vinyl file in jshint reporter
          .pipe(jshint())
          .pipe(jshint.reporter(reporters('gulp-jshint')));
      });

      it('gulp-csslint with .sourceMap property in Vinyl file (gulp)', function (done) {

        reporters.output = function (messages: IMessage[]) {
          expect(messages[0].filePath).toContain('test.scss');
          expect(messages[0].lineNbr).toBe(5);
          done();
        };

        gulp.src(__dirname + '/../../src/specs/testfiles/scss/test.scss')
          .pipe(sourcemaps.init())
          .pipe(sass())
          .pipe(sourcemaps.write({ addComment: false }))
          .pipe(csslint({
            'zero-units': true
          }))
          .pipe(csslint.reporter(reporters('gulp-csslint')));
      });

      it('gulp-csslint with sourcemap in .contents of Vinyl file (gulp)', function (done) {

        reporters.output = function (messages: IMessage[]) {
          expect(messages[0].filePath).toContain('test.scss');
          expect(messages[0].lineNbr).toBe(5);
          done();
        };

        gulp.src(__dirname + '/../../src/specs/testfiles/scss/test.scss')
          .pipe(sourcemaps.init())
          .pipe(sass())
          .pipe(sourcemaps.write({ addComment: true }))
          .pipe(gulpif(function (file: IVinylFile) {
            // Mis-used gulp-if to remove sourceMap member variable
            delete file.sourceMap;
            return true;
          }, csslint({
            'zero-units': true
          })))
          .pipe(csslint.reporter(reporters('gulp-csslint')));
      });

      it('custom reporter', function (done) {

        reporters.output = function (messages: IMessage[]) {
          expect(messages.length).toBe(2);
          done();
        };

        gulp.src(__dirname + '/../../src/specs/testfiles/js/fail.js')
          .pipe(jshint())
          .pipe(jshint.reporter(function (errors: any []): void {
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
