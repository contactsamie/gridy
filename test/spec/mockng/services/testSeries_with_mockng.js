

describe('WITH MOCK-NG : Testing mockng with simple case', function () {

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
    //#################################################################################################>
    var mockng;
    beforeEach(function () {
        //module('mockngApp');
        inject(function (_mockng_) {
            mockng = _mockng_;
        });
    });
    //#################################################################################################>
    it('Should test the correct value', function () {
        expect(mockng.mock.value('tValue')).toBe('value');
    });
    it('Should test the correct factory', function () {
        expect(mockng.mock.factory('tFactory')().getName()).toBe('tDirective');
        expect(mockng.mock.factory('tFactory2')().getName()).toBe('factory');
    });
    it('Should test the correct service', function () {
        expect(mockng.mock.service('tService')().getName()).toBe('service');
    });
    it('Should test the correct controller', function () {
        var dependency = mockng.mock.controller('tCtrl').dependency;
        var $scope = dependency.$scope;
        expect($scope.tValue).toBe('value');
        expect($scope.tFactory.getName()).toBe('tDirective');
        expect($scope.tFactory2.getName()).toBe('factory');
        expect($scope.tService.getName()).toBe('service'); //EXTRA ****
        expect(dependency.tValue).toBe('value');
        expect(dependency.tFactory.getName()).toBe('tDirective');
        expect(dependency.tFactory2.getName()).toBe('factory');
        expect(dependency.tService.getName()).toBe('service');
    });
    it('Should test the correct controller with dependency mocking', function () {
        var mocks={
            tValue:'mValue',
            tFactory:{getName:function(){return 'mFactoryForDirective';}},
            tFactory2:{getName:function(){return 'mFactory';}},
            tService:{getName:function(){return 'mService';}}
        };
        var dependency = mockng.mock.controller('tCtrl',mocks).dependency;

        var $scope = dependency.$scope;
        expect($scope.tValue).toBe(mocks.tValue);
        expect($scope.tFactory.getName()).toBe(mocks.tFactory.getName());
        expect($scope.tFactory2.getName()).toBe(mocks.tFactory2.getName());
        expect($scope.tService.getName()).toBe(mocks.tService.getName());
    });
    it('Should set the text of the element to whatever was passed.', function () {
        var directive = mockng.mock.directive('tDirective', { dom: '<div t-directive="foo"></div>'  });
        directive.definition.$scope.foo = 'bar';
        expect(directive.definition.$element.text()).toBe('');
        directive.definition.$element[0].click();
        expect(directive.definition.$element.text()).toBe('bar,and I called : tDirective');
    });
});
