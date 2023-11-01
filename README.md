# reporters

Extracts information from csslint, jshint, ... reporters and allows you to handle them all in the same way.

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
    npm install reporters --save-dev

## Samples
Examples are for gulp

### jshint example:
    const jshint = require('gulp-jshint');
    const reporters = require('reporters');

    gulp.task('jshint', () => {
      return gulp.src(['./**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(reporters('gulp-jshint')));
    });

### csslint example:
    const csslint = require('gulp-csslint');
    const reporters = require('reporters');

    gulp.task('csslint', () => {
    return gulp.src(['./**/*.css'])
      .pipe(csslint())
      .pipe(csslint.reporter(reporters('gulp-csslint')));
  });

### tslint/typescript example:
    const typescript = require('gulp-typescript');
    const tslint = require('gulp-tslint');
    const reporters = require('reporters');

    gulp.task('typescript', () => {
    const tsResult = gulp.src(['./**/*.ts', '!./**/*.d.ts'])
      .pipe(tslint())
      .pipe(tslint.report(reporters('gulp-tslint', {warning: true})))
      .pipe(typescript({}, {}, reporters('gulp-typescript')));
    tsResult.js
      .pipe(gulp.dest('js/')):
  });
### sass example:
    const sass = require('gulp-sass');
    const reporters = require('reporters');

    gulp.task('csslint', () => {
    return gulp.src(['./**/*.scss'])
      .pipe(sass({
        onError: reporters('gulp-sass')
      }))
  });

### jasmine example:
    const jasmine = require('gulp-jasmine');
    const reporters = require('reporters');

    gulp.src('./**/*Spec.js')
      .pipe(jasmine({
        reporter: reporters('gulp-jasmine')
      }));


## Configuration

### getAvailable()
Returns a list of available built-in reporters.
You can use one of the available reporters by calling `reporters()` with the reporter name:

    const reporters = require('reporters');
    reporters('gulp-jshint'); // returns reporter that can be used with the gulp-jshint package

Some reporters accept configuration properties:

    const reporters = require('reporters');
    reporters('gulp-jshint', {
      debug: true // log reporter information
    });

### debug = false
Enable to log detailed information of what is done.

    const reporters = require('reporters');
    reporters.debug = true;


### filterOrUpdate(messages)
This is your chance to remove or update messages before they are handled.
You can use this for example to limit the number of messages handled:

    const reporters = require('reporters');
    const logCount = 0;
    reporters.filterOrUpdate = (messages) => {
      return messages.filter((message) => {
        logCount++;
        return (message.filePath.indexOf('/3rdParty/') === -1) && (logCount <= 100);
      });
    };

### output
A function (or array of functions) that can handle messages.

    const reporters = require('reporters');
    reporters.output = (messages) => {
      messages && messages.forEach((message) => {
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
This method will handle the messages.
`report()` will first use `filterOrUpdate` and then check if sourcemaps are available to update error locations.
It will then send the results to the `output` handlers.

You can log messages in this way:

    const reporters = require('reporters');
    const message = {
      filePath: 'index.html',
      type: 'warning',
      description: 'HTML should be minified.'
    }
    reporters.report([message]);

If you write your own reporter you can manually call this method to handle messages in the same way:

    const unsupportedModule = required('unsupportedModule');
    const reporters = require('reporters');
    
    gulp.src('scripts/**/*.js')
      .pipe(unsupportedModule({
        reporter: (errors) => {
          const messages = errors.map((error) => {
            return {
              description: error.reason,
              sourceName: 'unsupportedModule'
            };
          });
          reporters.report(messages);
        }
      });
