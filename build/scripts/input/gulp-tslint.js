/// <reference path='../interfaces.ts' />
/** Creates the method/object that the reporter wants */
module.exports = function (done, options) {
    'use strict';
    // return what the reporter wants
    return function (output, file) {
        if (options && options.debug) {
            console.log('gulp-tslint output:');
            console.log(output);
        }
        // convert to array of messages
        done(output.map(function (item) {
            return {
                sourceName: 'gulp-tslint',
                type: 'error',
                filePath: file.path,
                lineNbr: item.startPosition.line,
                colNbr: item.startPosition.character,
                description: item.failure,
                getFile: function () { return file; },
                code: item.ruleName
            };
        }));
    };
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0L2d1bHAtdHNsaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHlDQUF5QztBQUV6QyxBQUNBLHdEQUR3RDtBQUN4RCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsSUFBcUMsRUFBRSxPQUFhO0lBQzVFLFlBQVksQ0FBQztJQUViLEFBQ0EsaUNBRGlDO0lBQ2pDLE1BQU0sQ0FBQyxVQUFVLE1BQVcsRUFBRSxJQUFnQjtRQUU1QyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUVELEFBQ0EsK0JBRCtCO1FBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBUztZQUNqQyxNQUFNLENBQUM7Z0JBQ0wsVUFBVSxFQUFFLGFBQWE7Z0JBQ3pCLElBQUksRUFBRSxPQUFPO2dCQUNiLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDbkIsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSTtnQkFDaEMsTUFBTSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUztnQkFDcEMsV0FBVyxFQUFFLElBQUksQ0FBQyxPQUFPO2dCQUN6QixPQUFPLEVBQUUsY0FBTSxXQUFJLEVBQUosQ0FBSTtnQkFDbkIsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRO2FBQ3BCLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRU4sQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6ImlucHV0L2d1bHAtdHNsaW50LmpzIiwic291cmNlUm9vdCI6IkM6XFxVc2Vyc1xcam9fdmRfMDAwXFxEcm9wYm94XFwyMDE1XFxyZXBvcnRlcnMtZ2l0XFxzcmMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi9pbnRlcmZhY2VzLnRzJyAvPlxyXG5cclxuLyoqIENyZWF0ZXMgdGhlIG1ldGhvZC9vYmplY3QgdGhhdCB0aGUgcmVwb3J0ZXIgd2FudHMgKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkb25lOiAobWVzc3NhZ2VzOiBJTWVzc2FnZVtdKSA9PiB2b2lkLCBvcHRpb25zPzogYW55KSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyByZXR1cm4gd2hhdCB0aGUgcmVwb3J0ZXIgd2FudHNcclxuICByZXR1cm4gZnVuY3Rpb24gKG91dHB1dDogYW55LCBmaWxlOiBJVmlueWxGaWxlKSB7XHJcblxyXG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5kZWJ1Zykge1xyXG4gICAgICBjb25zb2xlLmxvZygnZ3VscC10c2xpbnQgb3V0cHV0OicpO1xyXG4gICAgICBjb25zb2xlLmxvZyhvdXRwdXQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvbnZlcnQgdG8gYXJyYXkgb2YgbWVzc2FnZXNcclxuICAgIGRvbmUob3V0cHV0Lm1hcChmdW5jdGlvbiAoaXRlbTogYW55KTogSU1lc3NhZ2Uge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHNvdXJjZU5hbWU6ICdndWxwLXRzbGludCcsXHJcbiAgICAgICAgdHlwZTogJ2Vycm9yJyxcclxuICAgICAgICBmaWxlUGF0aDogZmlsZS5wYXRoLFxyXG4gICAgICAgIGxpbmVOYnI6IGl0ZW0uc3RhcnRQb3NpdGlvbi5saW5lLFxyXG4gICAgICAgIGNvbE5icjogaXRlbS5zdGFydFBvc2l0aW9uLmNoYXJhY3RlcixcclxuICAgICAgICBkZXNjcmlwdGlvbjogaXRlbS5mYWlsdXJlLFxyXG4gICAgICAgIGdldEZpbGU6ICgpID0+IGZpbGUsIC8vIENhbiBiZSB1c2VkIHRvIGNoZWNrIGZvciBpbmxpbmUgc291cmNlbWFwIHdoZW4gbm90ICh5ZXQpIHNhdmVkXHJcbiAgICAgICAgY29kZTogaXRlbS5ydWxlTmFtZVxyXG4gICAgICB9O1xyXG4gICAgfSkpO1xyXG5cclxuICB9O1xyXG59O1xyXG4iXX0=