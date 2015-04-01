/// <reference path='../interfaces.ts' />
/** Creates the method/object that the reporter wants */
module.exports = function (done, options) {
    'use strict';
    // return what the reporter wants
    return {
        error: function (error) {
            if (options && options.debug) {
                console.log('gulp-typescript output:');
                console.log(error);
            }
            var message = error && error.diagnostic && error.diagnostic.messageText || '';
            var code = error && error.diagnostic && error.diagnostic.code;
            var category = error && error.diagnostic && error.diagnostic.category;
            var type = 'error';
            if (category === 0) {
                type = 'warning';
            }
            else if (category === 2) {
                type = 'info';
            }
            else if (category === 3) {
                type = 'info'; // NoPrefix
            }
            done([{
                sourceName: 'gulp-typescript',
                type: type,
                filePath: error.fullFilename,
                lineNbr: error.startPosition.line,
                colNbr: error.startPosition.character,
                description: message,
                getFile: function () { return error.file; },
                code: code
            }]);
        }
    };
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0L2d1bHAtdHlwZXNjcmlwdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5Q0FBeUM7QUFFekMsQUFDQSx3REFEd0Q7QUFDeEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFTLElBQXFDLEVBQUUsT0FBYTtJQUM1RSxZQUFZLENBQUM7SUFFYixBQUNBLGlDQURpQztJQUNqQyxNQUFNLENBQUM7UUFDTCxLQUFLLEVBQUUsVUFBVSxLQUFVO1lBQ3pCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JCLENBQUM7WUFFRCxJQUFJLE9BQU8sR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUM7WUFDOUUsSUFBSSxJQUFJLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7WUFDOUQsSUFBSSxRQUFRLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7WUFDdEUsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLEdBQUcsU0FBUyxDQUFDO1lBQ25CLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksR0FBRyxNQUFNLENBQUM7WUFDaEIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsSUFBSSxHQUFHLE1BQU0sRUFBRSxXQUFXO1lBQzVCLENBQUMsR0FEZTtZQUdoQixJQUFJLENBQUMsQ0FBQztnQkFDSixVQUFVLEVBQUUsaUJBQWlCO2dCQUM3QixJQUFJLEVBQUUsSUFBSTtnQkFDVixRQUFRLEVBQUUsS0FBSyxDQUFDLFlBQVk7Z0JBQzVCLE9BQU8sRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUk7Z0JBQ2pDLE1BQU0sRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVM7Z0JBQ3JDLFdBQVcsRUFBRSxPQUFPO2dCQUNwQixPQUFPLEVBQUUsY0FBTSxPQUFBLEtBQUssQ0FBQyxJQUFJLEVBQVYsQ0FBVTtnQkFDekIsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFDLENBQUMsQ0FBQztRQUNOLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6ImlucHV0L2d1bHAtdHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiJDOlxcVXNlcnNcXGpvX3ZkXzAwMFxcRHJvcGJveFxcMjAxNVxccmVwb3J0ZXJzLWdpdFxcc3JjIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vaW50ZXJmYWNlcy50cycgLz5cclxuXHJcbi8qKiBDcmVhdGVzIHRoZSBtZXRob2Qvb2JqZWN0IHRoYXQgdGhlIHJlcG9ydGVyIHdhbnRzICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZG9uZTogKG1lc3NzYWdlczogSU1lc3NhZ2VbXSkgPT4gdm9pZCwgb3B0aW9ucz86IGFueSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gcmV0dXJuIHdoYXQgdGhlIHJlcG9ydGVyIHdhbnRzXHJcbiAgcmV0dXJuIHtcclxuICAgIGVycm9yOiBmdW5jdGlvbiAoZXJyb3I6IGFueSkge1xyXG4gICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmRlYnVnKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2d1bHAtdHlwZXNjcmlwdCBvdXRwdXQ6Jyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgbWVzc2FnZSA9IGVycm9yICYmIGVycm9yLmRpYWdub3N0aWMgJiYgZXJyb3IuZGlhZ25vc3RpYy5tZXNzYWdlVGV4dCB8fCAnJztcclxuICAgICAgdmFyIGNvZGUgPSBlcnJvciAmJiBlcnJvci5kaWFnbm9zdGljICYmIGVycm9yLmRpYWdub3N0aWMuY29kZTtcclxuICAgICAgdmFyIGNhdGVnb3J5ID0gZXJyb3IgJiYgZXJyb3IuZGlhZ25vc3RpYyAmJiBlcnJvci5kaWFnbm9zdGljLmNhdGVnb3J5O1xyXG4gICAgICB2YXIgdHlwZSA9ICdlcnJvcic7XHJcbiAgICAgIGlmIChjYXRlZ29yeSA9PT0gMCkge1xyXG4gICAgICAgIHR5cGUgPSAnd2FybmluZyc7XHJcbiAgICAgIH0gZWxzZSBpZiAoY2F0ZWdvcnkgPT09IDIpIHtcclxuICAgICAgICB0eXBlID0gJ2luZm8nO1xyXG4gICAgICB9IGVsc2UgaWYgKGNhdGVnb3J5ID09PSAzKSB7XHJcbiAgICAgICAgdHlwZSA9ICdpbmZvJzsgLy8gTm9QcmVmaXhcclxuICAgICAgfVxyXG5cclxuICAgICAgZG9uZShbe1xyXG4gICAgICAgIHNvdXJjZU5hbWU6ICdndWxwLXR5cGVzY3JpcHQnLFxyXG4gICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgZmlsZVBhdGg6IGVycm9yLmZ1bGxGaWxlbmFtZSxcclxuICAgICAgICBsaW5lTmJyOiBlcnJvci5zdGFydFBvc2l0aW9uLmxpbmUsXHJcbiAgICAgICAgY29sTmJyOiBlcnJvci5zdGFydFBvc2l0aW9uLmNoYXJhY3RlcixcclxuICAgICAgICBkZXNjcmlwdGlvbjogbWVzc2FnZSxcclxuICAgICAgICBnZXRGaWxlOiAoKSA9PiBlcnJvci5maWxlLCAvLyBDYW4gYmUgdXNlZCB0byBjaGVjayBmb3IgaW5saW5lIHNvdXJjZW1hcFxyXG4gICAgICAgIGNvZGU6IGNvZGVcclxuICAgICAgfV0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn07XHJcbiJdfQ==