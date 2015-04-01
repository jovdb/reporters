/// <reference path='../interfaces.ts' />
/** Creates the method/object that the reporter wants */
module.exports = function (done, options) {
    'use strict';
    // return what the reporter wants
    return function (output) {
        if (options && options.debug) {
            console.log('gulp-sass output:');
            console.log(output);
        }
        var type = 'error';
        if (output.status === 2) {
            type = 'warning';
        }
        // convert to array of messages
        done([{
            sourceName: 'gulp-sass',
            type: type,
            filePath: output.file,
            lineNbr: output.line,
            colNbr: output.column,
            description: output.message,
            code: output.code
        }]);
    };
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0L2d1bHAtc2Fzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5Q0FBeUM7QUFFekMsQUFDQSx3REFEd0Q7QUFDeEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFTLElBQXFDLEVBQUUsT0FBYTtJQUM1RSxZQUFZLENBQUM7SUFFYixBQUNBLGlDQURpQztJQUNqQyxNQUFNLENBQUMsVUFBVSxNQUFXO1FBRTFCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0QixDQUFDO1FBRUQsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDO1FBQ25CLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLEdBQUcsU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFFRCxBQUNBLCtCQUQrQjtRQUMvQixJQUFJLENBQUMsQ0FBQztZQUNKLFVBQVUsRUFBRSxXQUFXO1lBQ3ZCLElBQUksRUFBRSxJQUFJO1lBQ1YsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ3JCLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSTtZQUNwQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07WUFDckIsV0FBVyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1lBQzNCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtTQUNsQixDQUFDLENBQUMsQ0FBQztJQUNOLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyIsImZpbGUiOiJpbnB1dC9ndWxwLXNhc3MuanMiLCJzb3VyY2VSb290IjoiQzpcXFVzZXJzXFxqb192ZF8wMDBcXERyb3Bib3hcXDIwMTVcXHJlcG9ydGVycy1naXRcXHNyYyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uL2ludGVyZmFjZXMudHMnIC8+XHJcblxyXG4vKiogQ3JlYXRlcyB0aGUgbWV0aG9kL29iamVjdCB0aGF0IHRoZSByZXBvcnRlciB3YW50cyAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvbmU6IChtZXNzc2FnZXM6IElNZXNzYWdlW10pID0+IHZvaWQsIG9wdGlvbnM/OiBhbnkpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIHJldHVybiB3aGF0IHRoZSByZXBvcnRlciB3YW50c1xyXG4gIHJldHVybiBmdW5jdGlvbiAob3V0cHV0OiBhbnkpIHtcclxuXHJcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmRlYnVnKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdndWxwLXNhc3Mgb3V0cHV0OicpO1xyXG4gICAgICBjb25zb2xlLmxvZyhvdXRwdXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0eXBlID0gJ2Vycm9yJztcclxuICAgIGlmIChvdXRwdXQuc3RhdHVzID09PSAyKSB7XHJcbiAgICAgIHR5cGUgPSAnd2FybmluZyc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29udmVydCB0byBhcnJheSBvZiBtZXNzYWdlc1xyXG4gICAgZG9uZShbe1xyXG4gICAgICBzb3VyY2VOYW1lOiAnZ3VscC1zYXNzJyxcclxuICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgZmlsZVBhdGg6IG91dHB1dC5maWxlLFxyXG4gICAgICBsaW5lTmJyOiBvdXRwdXQubGluZSxcclxuICAgICAgY29sTmJyOiBvdXRwdXQuY29sdW1uLFxyXG4gICAgICBkZXNjcmlwdGlvbjogb3V0cHV0Lm1lc3NhZ2UsXHJcbiAgICAgIGNvZGU6IG91dHB1dC5jb2RlXHJcbiAgICB9XSk7XHJcbiAgfTtcclxufTtcclxuIl19