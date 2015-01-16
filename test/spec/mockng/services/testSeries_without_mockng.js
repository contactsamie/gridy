


describe('WITHOUT MOCK-NG : Testing mockng with simple case', function () {
    beforeEach(function () {
        module('mockngApp', function ($provide) {
            $provide.provider('tFactory', function () {
                this.$get = function () {
                    return {getName: function () {
                        return 'tDirective';
                    }
                    };
                };
            });
        });
    });
    var $scope,  tValue,tFactory, tFactory2, tService, createController, scope, elem,compiled, html;// MAINTENANCE REGION 1******
    var   $rootScope;
    beforeEach(function () {
      var  injection = function ($injector) { // MAINTENANCE REGION 2******
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            tValue = $injector.get('tValue');
            tFactory = $injector.get('tFactory');
            tFactory2 = $injector.get('tFactory2');
            tService = $injector.get('tService');
            var $controller = $injector.get('$controller');
            createController = function (o) {
                return $controller('tCtrl', o || {
                    $scope: $scope
                });
            };
            html = '<div t-directive="foo"></div>';
            inject(function ($compile, $rootScope) {
                scope = $rootScope.$new();//DONT FORGET THIS ***
                elem = angular.element(html);
                compiled = $compile(elem);
                compiled(scope);
                scope.$digest();
            });
        };
        inject(injection);
    });
    it('Should test the correct value', function () {
        expect(tValue).toBe('value');
    });
    it('Should test the correct factory', function () {
        expect(tFactory.getName()).toBe('tDirective');
        expect(tFactory2.getName()).toBe('factory');
    });
    it('Should test the correct service', function () {
        expect(tService.getName()).toBe('service');
    });
    it('Should test the correct controller', function () {
         createController();
        expect($scope.tValue).toBe('value');
        expect($scope.tFactory.getName()).toBe('tDirective');
        expect($scope.tFactory2.getName()).toBe('factory');
        expect($scope.tService.getName()).toBe('service');
    });
    it('Should test the correct controller with dependency mocking', function () {
        $scope = $rootScope.$new();
        var mocks = {
            $scope: $scope,
            tValue: 'mValue',
            tFactory: {getName: function () {
                return 'mFactoryForDirective';
            }},
            tFactory2: {getName: function () {
                return 'mFactory';
            }},
            tService: {getName: function () {
                return 'mService';
            }}
        };
       createController(mocks);
        expect($scope.tValue).toBe(mocks.tValue);
        expect($scope.tFactory.getName()).toBe(mocks.tFactory.getName());
        expect($scope.tFactory2.getName()).toBe(mocks.tFactory2.getName());
        expect($scope.tService.getName()).toBe(mocks.tService.getName());
    });
    it('Should set the text of the element to whatever was passed.', function () {
        scope.foo = 'bar';
        expect(elem.text()).toBe('');
        elem[0].click();
        expect(elem.text()).toBe('bar,and I called : tDirective');
    });
});
