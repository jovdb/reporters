/// <reference path='../interfaces.ts' />
/** Creates the method/object that the reporter wants */
module.exports = function (done, options) {
    'use strict';
    // return what the reporter wants
    return function (errors) {
        if (options && options.debug) {
            console.log('gulp-jshint output:');
            console.log(errors);
        }
        // convert to array of messages
        done(errors.map(function (item) {
            var result = {
                sourceName: 'gulp-jshint',
                filePath: item.file,
                lineNbr: item.error.line,
                colNbr: item.error.character,
                type: item.error.id.substring(1, item.error.id.length - 1),
                description: item.error.reason,
                line: item.error.evidence,
                code: item.error.code
            };
            return result;
        }));
    };
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0L2d1bHAtanNoaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHlDQUF5QztBQUV6QyxBQUNBLHdEQUR3RDtBQUN4RCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsSUFBcUMsRUFBRSxPQUFhO0lBQzVFLFlBQVksQ0FBQztJQUViLEFBQ0EsaUNBRGlDO0lBQ2pDLE1BQU0sQ0FBQyxVQUFTLE1BQVc7UUFDekIsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFFRCxBQUNBLCtCQUQrQjtRQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQVM7WUFDakMsSUFBSSxNQUFNLEdBQWE7Z0JBQ3JCLFVBQVUsRUFBRSxhQUFhO2dCQUN6QixRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ25CLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUk7Z0JBQ3hCLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVM7Z0JBQzVCLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQzFELFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07Z0JBQzlCLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7Z0JBQ3pCLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUk7YUFDdEIsQ0FBQztZQUVGLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNOLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyIsImZpbGUiOiJpbnB1dC9ndWxwLWpzaGludC5qcyIsInNvdXJjZVJvb3QiOiJDOlxcVXNlcnNcXGpvX3ZkXzAwMFxcRHJvcGJveFxcMjAxNVxccmVwb3J0ZXJzLWdpdFxcc3JjIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vaW50ZXJmYWNlcy50cycgLz5cclxuXHJcbi8qKiBDcmVhdGVzIHRoZSBtZXRob2Qvb2JqZWN0IHRoYXQgdGhlIHJlcG9ydGVyIHdhbnRzICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZG9uZTogKG1lc3NzYWdlczogSU1lc3NhZ2VbXSkgPT4gdm9pZCwgb3B0aW9ucz86IGFueSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gcmV0dXJuIHdoYXQgdGhlIHJlcG9ydGVyIHdhbnRzXHJcbiAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yczogYW55KTogdm9pZCB7XHJcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmRlYnVnKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdndWxwLWpzaGludCBvdXRwdXQ6Jyk7XHJcbiAgICAgIGNvbnNvbGUubG9nKGVycm9ycyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29udmVydCB0byBhcnJheSBvZiBtZXNzYWdlc1xyXG4gICAgZG9uZShlcnJvcnMubWFwKGZ1bmN0aW9uIChpdGVtOiBhbnkpOiBJTWVzc2FnZSB7XHJcbiAgICAgIHZhciByZXN1bHQ6IElNZXNzYWdlID0ge1xyXG4gICAgICAgIHNvdXJjZU5hbWU6ICdndWxwLWpzaGludCcsXHJcbiAgICAgICAgZmlsZVBhdGg6IGl0ZW0uZmlsZSxcclxuICAgICAgICBsaW5lTmJyOiBpdGVtLmVycm9yLmxpbmUsXHJcbiAgICAgICAgY29sTmJyOiBpdGVtLmVycm9yLmNoYXJhY3RlcixcclxuICAgICAgICB0eXBlOiBpdGVtLmVycm9yLmlkLnN1YnN0cmluZygxLCBpdGVtLmVycm9yLmlkLmxlbmd0aCAtIDEpLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiBpdGVtLmVycm9yLnJlYXNvbixcclxuICAgICAgICBsaW5lOiBpdGVtLmVycm9yLmV2aWRlbmNlLCAvLyBsaW5lXHJcbiAgICAgICAgY29kZTogaXRlbS5lcnJvci5jb2RlXHJcbiAgICAgIH07XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfSkpO1xyXG4gIH07XHJcbn07XHJcbiJdfQ==