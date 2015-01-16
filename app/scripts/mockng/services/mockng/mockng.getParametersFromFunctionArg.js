(function (app) {
    app.factory('getParametersFromFunctionArg', function () {
        return function (arg, hasDefinition) {
            var args = Array.prototype.slice.call(arg, 0);
            var name = args[0];
            var definition = hasDefinition ? args[1] : undefined;
            args.shift();
            hasDefinition && args.shift();
            return {
                named: name,
                arg: args,
                definition: definition
            };
        };
    });
})(angular.module('mockngApp'));