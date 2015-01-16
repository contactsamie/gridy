(function (app) {
    app.value('tValue', 'value');
    app.factory('tFactory', function () {
        return {
            getName: function () {
                return 'factory';
            }
        };
    });
    app.factory('tFactory2', function () {
        return {
            getName: function () {
                return 'factory';
            }
        };
    });
    app.service('tService', function () {
        this.getName = function () {
            return 'service';
        };
    });
    app.controller('tCtrl', function ($scope, tValue, tFactory, tFactory2, tService) {
        $scope.tValue = tValue;
        $scope.tFactory = tFactory;
        $scope.tService = tService;
        $scope.tFactory2 = tFactory2;
        $scope.getName = function () {
            return 'tCtrl';
        };
    });
    app.directive('tDirective', function (tFactory) {
        return function (scope, elem, attrs) {
            elem.bind('click', function () {
                elem.text(scope.$eval(attrs.tDirective) + ',and I called : ' + tFactory.getName());
            });
        };
    });
})(angular.module('mockngApp'));