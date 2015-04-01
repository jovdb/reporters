(function () {
  "use strict";

  var pkg = require("./package.json");
  var gulp = require("gulp");
  var gutil = require("gulp-util");
  var jshint = require("gulp-jshint");
  var typescript = require("gulp-typescript");
  var sourcemaps = require("gulp-sourcemaps");
  var eventStream = require("event-stream");
  var tslint = require("gulp-tslint");
  var uglify = require("gulp-uglify");
  var gulpif = require("gulp-if");
  var path = require("path");
  var jasmine = require("gulp-jasmine");
  var rimraf = require("rimraf");
  var typedoc = require("gulp-typedoc");

  var outputPath = "./build";
  var watching = false;
  var deploy = false;

  function logError(message) {
    console.error(gutil.colors.red(message));
  }

  function logVsError(file, line, col, message) {
    var errorLine = file;
    if (line) {
      errorLine += "(" + line;
      if (col) {errorLine += "," + col;}
      errorLine += ")";
    }
    errorLine += ": error";
    if (message) {errorLine += ": " + message;}
    logError(errorLine);
  }

  var jshintVsReporter = function (errors) {
    errors.forEach(function (item) {
      logVsError(item.file, item.error.line, item.error.character, item.error.id.substring(1, item.error.id.length - 1) + ": " + item.error.reason + " (code:" + item.error.code + ")");
    });
  };

  gulp.task("gulpfile", function () {
    return gulp.src(["./gulpfile.js"])
      .pipe(jshint())
      .pipe(jshint.reporter(jshintVsReporter));
  });

  gulp.task("javascript", function () {
    return gulp.src(["src/scripts/**/*.js", "src/specs/**/*.js", "!src/specs/testfiles/**/*"])
      .pipe(jshint())
      .pipe(jshint.reporter(jshintVsReporter))
      .pipe(gulp.dest(outputPath + "/scripts/"));
  });

  gulp.task("typescript", function () {

    var tscReporter = function() {
      return {
        error: function (error) {
          var message = error && error.diagnostic && error.diagnostic.messageText || "";
          logVsError(error.fullFilename, error.startPosition.line, error.startPosition.character, message);
        }
      };
    };

    var tsLintReporter = function() {
      return function (output, file) {
        if (output) {
          output.forEach(function (item) {
            logVsError(file.path, item.startPosition.line + 1, item.startPosition.character + 1, item.ruleName + ": " + item.failure + " (tslint: " + item.ruleName + ")");
          });
        }
      };
    };

    // Compile Project
    var tsResult = gulp.src(["./src/scripts/**/*.ts", "!./src/scripts/**/*.d.ts"])

    // TS Lint
    .pipe(tslint())
    .pipe(tslint.report(tsLintReporter(), {emitError: !watching}))

    // Start SourceMaps
    .pipe(gulpif(!deploy, sourcemaps.init())) // This means sourcemaps will be generated

    // Compile TypeScript
    .pipe(typescript({
      noExternalResolve: false,
      noImplicitAny: true,
      declarationFiles: true,
      module: "commonjs"
    }, {}, tscReporter()));


    // Compile Unit tests
    var specsResult = gulp.src(["./src/specs/*Spec.ts", "!./src/specs/*Spec.d.ts"])

    // TS Lint
    .pipe(tslint())
    .pipe(tslint.report(tsLintReporter(), { emitError: !watching }))

    // Start SourceMaps
    .pipe(sourcemaps.init()) // This means sourcemaps will be generated

    // Compile TypeScript
    .pipe(typescript({
      noExternalResolve: false,
      noImplicitAny: true,
      module: "commonjs"
    }, {}, tscReporter()));

    return eventStream.merge( // Merge the two output streams, so this task is finished when the IO of both operations are done.
      tsResult.js
        .pipe(gulpif(deploy, uglify()))
        .pipe(gulpif(!deploy, sourcemaps.write({
          sourceRoot: path.resolve("./src"),
        })))
        .pipe(gulp.dest(outputPath + "/scripts/")),

      tsResult.dts
        .pipe(gulp.dest(outputPath + "/scripts/")),

      specsResult.js
        .pipe(sourcemaps.write({
          sourceRoot: path.resolve("./src"),
        }))
        .pipe(gulp.dest(outputPath + "/specs/"))

    );
  });

  gulp.task("build", ["gulpfile", "clearAndBuild"], function () { });

  gulp.task("init-deploy", function () {
    deploy = true;
  });

  gulp.task("deploy", ["init-deploy", "gulpfile", "javascript", "typescript"], function () {});

  gulp.task("watch", function() {
    watching = true;
    gulp.watch("gulpFile.js", ["gulpfile"]);
    gulp.watch("src/**/*.js", ["javascript", "test"]);
    gulp.watch("src/**/*.ts", ["typescript", "test"]);
    gulp.watch(outputPath + "/specs/**/*Spec.js", ["test"]);
  });

  gulp.task("clearAndBuild", ["clearBuild"], function () {
    return gulp.start("buildAndTest");
  });

  gulp.task("clearBuild", [], function (done) {
    var deleted = function () {
      // Ignore error
      done();
    };
    
    rimraf("./build/**", deleted);
  });

  /** Create task to enforce dependency */
  gulp.task("buildAndTest", ["javascript", "typescript"], function () {
    return gulp.start("test");
  });

  gulp.task("doc", function () {
    // TS Doc
    return gulp.src([
      outputPath + "/scripts/index.d.ts",
      outputPath + "/scripts/interfaces.d.ts"
    ])
    .pipe(typedoc({
      excludeExternals: true,
      module: "commonjs",
      out: outputPath + "/doc",
      name: pkg.name,
      target: "es5",
      theme: "default",
      includeDeclarations: true
    }));
  });

  gulp.task("test", function () {

    var jasmineReporter = function (options) {

      options = options || {};

      var succesSpecs = 0;
      var skippedSpecs = 0;
      var failedSpecs = 0;
      var logSpec = options && options.logSpec;
      return {
        specStarted: function (result) {
          if (logSpec) {
            console.log("unit test: " + gutil.colors.cyan(result.fullName));
          }
        },
        specDone: function (result) {
          if (result.status === "passed") {
            succesSpecs++;
          } else if (result.status === "skipped") {
            skippedSpecs++;
          }
          if (result.status === "failed") {
            failedSpecs++;
            
            for (var i = 0; i < result.failedExpectations.length; i++) {
              var failedExpectation = result.failedExpectations[i];
              var stackLines = this.filterStackTraces(failedExpectation.stack);


              if (stackLines && stackLines.length) {
                var location = this.getFileAtLineFromStack(stackLines[0]);
                if (location) {
                  logVsError(location.filePath, location.lineNbr, location.colNbr, result.fullName + ": " + failedExpectation.message);
                } else {
                  console.log(result.fullName + ": " + stackLines.join("\n"));
                }
              } else {
                console.log(result.fullName + ": " + (failedExpectation.stack || failedExpectation.message));
              }
            }
          }
        },
        jasmineDone: function () {
          if (failedSpecs > 0) {
            console.log(failedSpecs + " of " + (failedSpecs + succesSpecs) + " tests failed" + (skippedSpecs > 0 ? (", " + skippedSpecs + " skipped.") : "."));
          } else if (skippedSpecs > 0 && succesSpecs > 0) {
            console.log(succesSpecs + " tests executed successful, " + skippedSpecs + " skipped.");
          } else if (succesSpecs > 0) {
            console.log("All " + succesSpecs + " tests completed successful.");
          } else {
            console.log("No tests executed.");
          }
        },
        filterStackTraces: function (traces) {
          var lines = traces.split("\n");
          var filtered = [];
          for (var i = 1 ; i < lines.length ; i++) {
            if (!/(jasmine[^\/]*\.js|Timer\.listOnTimeout)/.test(lines[i])) {
              filtered.push(lines[i]);
            }
          }
          return filtered;
        },
        getFileAtLineFromStack: function (stackLine) {
          // Try to extract filename
          // '    at Object.<anonymous> (C:\\Users\\jo_vd_000\\Dropbox\\2015\\reporters\\src\\specs\\indexSpec.js:11:27)'
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

    return gulp.src([outputPath + "/specs/**/*Spec.js"])
      .pipe(jasmine({
        verbose: !deploy,
        reporter: jasmineReporter({logSpec: true})
      }));
  });

  gulp.task("default", function () {
    console.log("");
    console.log("-----");
    console.log("Usage");
    console.log("- gulp build  : Build once");
    console.log("- gulp watch  : Watch and build");
    console.log("- gulp deploy : Minify");
    console.log("- gulp doc    : Create/Update Documentation");
    console.log("");
  });
}());
