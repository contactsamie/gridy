(function (app) {
    app.factory('testFactoryForDirective', function (testService) {
        var sample = {
            service: testService.sample.getSamples,
            method: function () {
                return 987;
            }
        };

        return sample;
    });

    app.directive('testDirective2', function () {
        return {
            template: '<div class="testClass">Hello World 987</div>',
            link: function (scope, element) {
                scope.$apply(function () {
                    element.find('.testClass').addClass('newTestClass');
                });
            }
            //  template: 'Hello World '+testFactory.method(),
            //link:function(scope, iElement, iAttrs, ctrl){
            //   iElement.html('Hello World '+testFactory.method());
            // },
            //  transclude: true,
            // replace: true
        };
    });
    app.directive('testDirective', function () {
        // this is an attribute with no required controllers,
        // and no isolated scope, so we're going to use all the
        // defaults, and just providing a linking function.

        return function (scope, elem, attrs) {
            elem.bind('click', function () {
                elem.text(scope.$eval(attrs.sample));
            });
        };
    });

    app.directive('sampleOne', function (testFactoryForDirective) {
        // this is an attribute with no required controllers,
        // and no isolated scope, so we're going to use all the
        // defaults, and just providing a linking function.

        return function (scope, elem, attrs) {
            elem.bind('click', function () {
                elem.text(scope.$eval(attrs.sampleOne) + testFactoryForDirective.method());
            });
        };
    });
    app.directive('sampleTwo', function () {
        return {
            restrict: 'E',
            template: '<div>{{value}}</div>',
            scope: {
                value: '='
            }
        };
    });
})(angular.module('mockngApp'));