(function (app) {
    app.factory('createControllerType', function ($injector, currentBasicTypeName,exceptionHelper) {
        return function (basicType, injectObj) {
            if (!basicType) {
                exceptionHelper.throw('Please supply a basic type');
            }
            try {
                $injector.get(basicType)(currentBasicTypeName(), injectObj);
                return true;
            } catch (exception) {
                exceptionHelper.throw(exception);
            }
        };
    })
})(angular.module('mockngApp'));