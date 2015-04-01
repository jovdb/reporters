/// <reference path='../interfaces.ts' />
/** Creates the method/object that the reporter wants */
module.exports = function (done, options) {
    'use strict';
    // return what the reporter wants
    return function (file) {
        if (options && options.debug) {
            console.log('gulp-csslint output:');
            console.log(file.csslint.results);
        }
        // convert to array of messages
        done(file.csslint.results.map(function (item) {
            return {
                sourceName: 'gulp-csslint',
                type: item.error.type,
                filePath: file.path,
                lineNbr: item.error.line,
                colNbr: item.error.col,
                description: item.error.message + ' (rule: ' + item.error.rule.id + ')',
                getFile: function () { return file; },
                code: item.error.rule.id
            };
        }));
    };
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0L2d1bHAtY3NzbGludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5Q0FBeUM7QUFFekMsQUFDQSx3REFEd0Q7QUFDeEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFTLElBQXFDLEVBQUUsT0FBYTtJQUM1RSxZQUFZLENBQUM7SUFFYixBQUNBLGlDQURpQztJQUNqQyxNQUFNLENBQUMsVUFBVSxJQUFnQjtRQUUvQixFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRUQsQUFDQSwrQkFEK0I7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFTLElBQVM7WUFDOUMsTUFBTSxDQUFDO2dCQUNMLFVBQVUsRUFBRSxjQUFjO2dCQUMxQixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJO2dCQUNyQixRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ25CLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUk7Z0JBQ3hCLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUc7Z0JBQ3RCLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUc7Z0JBQ3ZFLE9BQU8sRUFBRSxjQUFNLFdBQUksRUFBSixDQUFJO2dCQUNuQixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTthQUN6QixDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNOLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyIsImZpbGUiOiJpbnB1dC9ndWxwLWNzc2xpbnQuanMiLCJzb3VyY2VSb290IjoiQzpcXFVzZXJzXFxqb192ZF8wMDBcXERyb3Bib3hcXDIwMTVcXHJlcG9ydGVycy1naXRcXHNyYyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uL2ludGVyZmFjZXMudHMnIC8+XHJcblxyXG4vKiogQ3JlYXRlcyB0aGUgbWV0aG9kL29iamVjdCB0aGF0IHRoZSByZXBvcnRlciB3YW50cyAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvbmU6IChtZXNzc2FnZXM6IElNZXNzYWdlW10pID0+IHZvaWQsIG9wdGlvbnM/OiBhbnkpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIHJldHVybiB3aGF0IHRoZSByZXBvcnRlciB3YW50c1xyXG4gIHJldHVybiBmdW5jdGlvbiAoZmlsZTogSVZpbnlsRmlsZSkge1xyXG5cclxuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZGVidWcpIHtcclxuICAgICAgY29uc29sZS5sb2coJ2d1bHAtY3NzbGludCBvdXRwdXQ6Jyk7XHJcbiAgICAgIGNvbnNvbGUubG9nKGZpbGUuY3NzbGludC5yZXN1bHRzKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjb252ZXJ0IHRvIGFycmF5IG9mIG1lc3NhZ2VzXHJcbiAgICBkb25lKGZpbGUuY3NzbGludC5yZXN1bHRzLm1hcChmdW5jdGlvbihpdGVtOiBhbnkpOiBJTWVzc2FnZSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc291cmNlTmFtZTogJ2d1bHAtY3NzbGludCcsXHJcbiAgICAgICAgdHlwZTogaXRlbS5lcnJvci50eXBlLFxyXG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLnBhdGgsXHJcbiAgICAgICAgbGluZU5icjogaXRlbS5lcnJvci5saW5lLFxyXG4gICAgICAgIGNvbE5icjogaXRlbS5lcnJvci5jb2wsXHJcbiAgICAgICAgZGVzY3JpcHRpb246IGl0ZW0uZXJyb3IubWVzc2FnZSArICcgKHJ1bGU6ICcgKyBpdGVtLmVycm9yLnJ1bGUuaWQgKyAnKScsXHJcbiAgICAgICAgZ2V0RmlsZTogKCkgPT4gZmlsZSwgLy8gQ2FuIGJlIHVzZWQgdG8gY2hlY2sgZm9yIGlubGluZSBzb3VyY2VtYXBcclxuICAgICAgICBjb2RlOiBpdGVtLmVycm9yLnJ1bGUuaWRcclxuICAgICAgfTtcclxuICAgIH0pKTtcclxuICB9O1xyXG59O1xyXG4iXX0=