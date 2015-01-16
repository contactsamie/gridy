(function (app) {
    app.factory('currentBasicTypeName', function () {
        var currentBasicTypeName = '';
        return function (name) {
            if (name) {
                currentBasicTypeName = name;
            }
            return currentBasicTypeName;
        };
    });
})(angular.module('mockngApp'));