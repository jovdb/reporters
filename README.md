# reporters

> Extracts information from csslint, jshint, ... reporters and allows you to handle them all in the same way.

## Introduction
Don't you find it very frustrating that each package logs errors/warnings in it's own format. This package is an attempt to collect the error/warning information of node packages and log/handle them in your favorite way.

The default output format is in a Visual Studio friendly way (you can double click to go to the problem line):

    C:/Users/JoVdB/MyProject/css/index.css(5,9): warning: Unknown property 'colour'. (rule: known-properties)

The application has a list of built-in reporters that can be used (gulp-csslint, gulp-jshint, gulp-typescript, gulp--sass, gulp-jasmine), or you can also create your own.

As output you can use one of the built-in outputs (Visual Studio style, notifier, beep) or create your own

All built-in reporters collect error/warning information (messages) that is passed to the output, it can contain following items:

- **sourceName**: 'gulp-csslint'
- **type**: 'warning' // 'info' or 'error'
- **filePath**: c:/Users/JoVdB/MyProject/css/index.css
- **lineNbr**: 5
- **colNbr**: 9
- **description**: Unknown property 'colour'. (rule: known-properties)
- **code**: 'known-properties'

## Installation
    npm install gulp-csslint --save-dev

## Samples
Examples are for gulp

### jshint example:
    var jshint = require('gulp-jshint');
    var reporters = require('reporters');

    gulp.task('jshint', function () {
      return gulp.src(['./**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(reporters('gulp-jshint')));
    });

### csslint example:
    var csslint = require('gulp-csslint');
    var reporters = require('reporters');

    gulp.task('csslint', function () {
    return gulp.src(['./**/*.css'])
      .pipe(csslint())
      .pipe(csslint.reporter(reporters('gulp-csslint')));
  });

### tslint/typescript example:
    var typescript = require('gulp-typescript');
    var tslint = require('gulp-tslint');
    var reporters = require('reporters');

    gulp.task('typescript', function () {
    var tsResult = gulp.src(['./**/*.ts', '!./**/*.d.ts'])
      .pipe(tslint())
      .pipe(tslint.report(reporters('gulp-tslint')))
      .pipe(typescript({}, {}, reporters('gulp-typescript')));
    tsResult.js
      .pipe(gulp.dest('js/')):
  });
### sass example:
    var sass = require('gulp-sass');
    var reporters = require('reporters');

    gulp.task('csslint', function () {
    return gulp.src(['./**/*.scss'])
      .pipe(sass({
        onError: reporters('gulp-sass')
      }))
  });

### jasmine example:
    var jasmine = require('gulp-jasmine');
    var reporters = require('reporters');

    gulp.src('./**/*Spec.js')
      .pipe(jasmine({
        reporter: reporters('gulp-jasmine')
      }));


## Configuration

### getAvailable()
Returns a list of available built-in reporters.
You can use one of the available reporters by calling `reporters()` with the reporter name:

    var reporters = require('reporters');
    reporters('gulp-jshint'); // returns reporter that can be used with the gulp-jshint package

Some reporters accept configuration properties:

    var reporters = require('reporters');
    reporters('gulp-jshint', {
      debug: true // log reporter information
    });

### debug = false
Enable to logs detailed information of what is done.

    var reporters = require('reporters');
    reporters.debug = true;


### filterOrUpdate(messages)
This is your chance to remove or update messages before they are handled.

    var reporters = require('reporters');
    reporters.filterOrUpdate = function(messages) {
      return messages.filter(function(message) {
        return message.filePath.indexOf('/3rdParty/') === -1;
      });
    };

### output
A function (or array of functions) that can handle messages.

    var reporters = require('reporters');
    reporters.output = function(messages) {
      messages && messages.forEach(function(message) {
        console.log(message.description);
      })
    };

There is a built-in list of output handlers. you can get it with `reporters.getOutputs()`

You can use one of the built-in output handlers with `reporters.getOutput('name')(options)`:

    reporters.output = [
       reporters.getOutput('vs-console')();
       reporters.getOutput('notify')();
    ];

### report(messages)
This method will the handle the messages.
`report()` will first use `filterOrUpdate` and then check if sourcemaps are available to update error locations.
It will then send the results to the `output` handlers.

You can log messages in this way:

    var reporters = require('reporters');
    var message = {
      filePath: 'index.html',
      type: 'warning',
      description: 'HTML should be minified.'
    }
    reporters.report([message]);

If you write your own reporter you can manually call this method to handle messages in the same way:

    var unsupportedModule = required('unsupportedModule');
    var reporters = require('reporters');
    
    gulp.src('scripts/**/*.js')
      .pipe(unsupportedModule({
        reporter: function (errors) {
          var messages = errors.map(function (error) {
            return {
              description: error.reason,
              sourceName: 'unsupportedModule'
            };
          });
          reporters.report(messages);
        }
      });
