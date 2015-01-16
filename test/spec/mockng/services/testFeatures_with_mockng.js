describe('TEST FEATURES: mockng', function () {

var _testController,
    _testValue,
    _testFactory,
    _testService,
    _testDirective,
    _testFactoryUnused,
    mockng,
    fakeTimeout,
    fake$http,
    $timeoutSpy,
    $httpSpy,
    fakeTimeout2,
    fake$http2,
    $timeoutSpy2,
    $httpSpy2,
    injection,directiveMock;

beforeEach(function () {
    $timeoutSpy = false;
    $httpSpy = false;
    fakeTimeout = {
        $timeout: function () {
            $timeoutSpy = true;
        }
    };
    fake$http = {
        $http: {

            get: function () {
                $httpSpy = true;
            }
        }
    };
    fakeTimeout2 = {
        $timeout: function () {
            $timeoutSpy2 = true;
        }
    };
    fake$http2 = {
        $http: {

            get: function () {
                $httpSpy2 = true;
            }
        }
    };
    directiveMock={
        dom: '<div sample-one="foo"></div>'
    };
});
beforeEach(function () {
    module('mockngApp', function ($provide) {

        $provide.provider('testFactoryForDirective', function () {
            this.$get = function () {
                return {method: function () {
                    return ',hello world';
                }
                };
            };
        });

    });
});
beforeEach(function () {

        injection = function (_mockng_) {
            mockng = _mockng_;
            _testController = mockng.mock.controller('TestCtrl', fakeTimeout, fake$http);
            _testValue = mockng.mock.value('testValue');
            _testFactory = mockng.mock.factory('testFactory')();
            _testFactoryUnused = mockng.mock.factory('testFactoryUnused')();
            _testService = mockng.mock.service('testService')();
            _testDirective = mockng.mock.directive('testDirective', directiveMock, {});
        };
        inject(injection);
    }
);
//todo : retest this when you figure out provide
//    it('Should set the text of the element to whatever was passed.', function () {
//        //set a value (the same one we had in the html)
//        _testDirective.definition.$scope.foo = 'bar';
//
//        //check to see if it's blank first.
//        expect(_testDirective.definition.$element.text()).toBe('');
//
//        //click the element.
//        _testDirective.definition.$element[0].click();
//
//        //test to see if it was updated.
//        expect(_testDirective.definition.$element.text()).toBe('bar987');
//    });

it('Should set the text of the element to whatever was passed.', function () {
    _testDirective = mockng.mock.directive('testDirective', {
        dom: '<div sample-one="foo"></div>'
    }, {
        testFactory: {method: function () {
            return ',hello world';
        }
        }});

    //set a value (the same one we had in the html)
    _testDirective.definition.$scope.foo = 'bar';

    //check to see if it's blank first.
    expect(_testDirective.definition.$element.text()).toBe('');

    //click the element.
    _testDirective.definition.$element[0].click();

    //test to see if it was updated.
    expect(_testDirective.definition.$element.text()).toBe('bar,hello world');

});




it('should be able to return a directive', function () {
    //   expect(_testDirective).toBeTruthy();
});

/*
 var element, $scope;
 it('directive should create element with test ', inject(function ($rootScope, $compile) {
 $scope = $rootScope.$new();
 $scope.data = {
 text    : 'AngularJS is [[1]]',
 choices : [{
 "val1": "[[1]]",
 "val2": "awesome,powerful"
 }]
 };
 element = angular.element('<div parse-bracket="{{data}}"></div>');
 element = $compile(element)($scope);
 $rootScope.$digest();

 expect(element.html()).toBe('<div class="ng-scope">AngularJS is <span class="control-group" ng-class="setClass(input_0_valid)"><input type="text" class="input-medium ng-pristine ng-invalid ng-invalid-required" autocorrect="off" autocapitalize="off" autocomplete="off" ng-change="validate(frmFIB.$valid)" ng-readonly="input_0_readonly" ng-model="input_0" required=""></span></div>');
 }));
 */
//  it('directive should create element with test ', function () {

//  expect(_testDirective.definition.element.text()).toBe('Hello World 987');
//});

it('should return an object when mock.controller is referenced', function () {
    expect(_testController).toBeTruthy();
});
it('should return an object with a dependency property', function () {
    expect(_testController.dependency).toBeTruthy();
});
it('should have a $scope as one of its dependencies ', function () {
    expect(_testController.dependency.$scope).toBeTruthy();
});
it('should be able to access a $scope method as a function', function () {
    expect(typeof _testController.dependency.$scope.testMethod === 'function').toBeTruthy();
});
it('should be able to invoke the $scope method defined', function () {
    expect(_testController.dependency.$scope.testMethod()).toBe(123 * 2);
});
it('should be able to invoke the $scope property defined', function () {
    expect(_testController.dependency.$scope.testproperty).toBe(456);
});
it('should be able to provide value dependencies', function () {
    expect(_testValue.b).toBe(123);
});
it('should be able to return a factory', function () {
    expect(_testFactory.method()).toBe(987);
});

it('should return the value of a factory when factory is injected', function () {
    expect(_testController.dependency.$scope.factoryResult).toBe(990);
});

it('should be able to return a service', function () {
    expect(_testService.sample.getSamples()).toEqual([
        { name: 'john' },
        { name: 'doe' }
    ]);
});

it('should be able to get value of a factory dependent on a service returning that value', function () {
    expect(_testFactory.service()).toEqual([
        { name: 'john' },
        { name: 'doe' }
    ]);
});

it('should be able to return a service injected into a factory', function () {
    expect(mockng.mock.factory('testFactory').dependency.testService.sample.getSamples()).toEqual([
        { name: 'john' },
        { name: 'doe' }
    ]);
});

it('should be able to return a service injected into a factory - where a fake service is supplied - compared with when its not', function () {

    expect(mockng.mock.factory('testFactory', {
        testService: {
            sample: {
                getSamples: function () {
                    return ['John Doe'];
                }
            }
        }
    }).dependency.testService.sample.getSamples()).toEqual(['John Doe']);


    expect(mockng.mock.factory('testFactory', {
        testService: {
            sample: function () {
                return [
                    { a: 'John Doe' }
                ];
            }
        }
    }).dependency.testService.sample()).toEqual([
        { a: 'John Doe' }
    ]);

    expect(_testFactory.service()).not.toEqual(['John Doe']);
    expect(_testFactory.service()).not.toEqual([
        { a: 'John Doe' }
    ]);
    expect(_testFactory.service()).toEqual([
        { name: 'john' },
        { name: 'doe' }
    ]);
    expect(mockng.mock.factory('testFactory').dependency.testService.sample.getSamples()).not.toEqual(['John Doe']);
    expect(mockng.mock.factory('testFactory').dependency.testService.sample.getSamples()).not.toEqual([
        { a: 'John Doe' }
    ]);
    expect(mockng.mock.factory('testFactory').dependency.testService.sample.getSamples()).toEqual([
        { name: 'john' },
        { name: 'doe' }
    ]);
});

it('should be that testController has $scope, testValue and testFactory dependencies', function () {
    expect(_testController.dependency.$scope.used).toBeTruthy();
    expect(_testController.dependency.testValue.used).toBeTruthy();
    expect(_testController.dependency.testFactory.used).toBeTruthy();
    expect(_testController.dependency.testService.used).toBeTruthy();
    expect(_testController.dependency.testFactoryUnused.used).not.toBeTruthy();
    expect(_testFactoryUnused.used).not.toBeTruthy();
});

it('should call the fake $timeout and $http instead', function () {
    expect($timeoutSpy).toBe(true);
    expect($httpSpy).toBe(true);
    expect($timeoutSpy2).not.toBe(true);
    expect($httpSpy2).not.toBe(true);
});

it('should call the fake $timeout2 and $http2 when specified instead even though it was originally specified to fake  $timeout and $http (should be able to test controller at point of need) ', function () {
    expect($timeoutSpy).toBe(true);
    expect($httpSpy).toBe(true);
    expect($timeoutSpy2).not.toBe(true);
    expect($httpSpy2).not.toBe(true);
    $timeoutSpy = false;
    $httpSpy = false;
    $timeoutSpy2 = false;
    $httpSpy2 = false;
    mockng.mock.controller('TestCtrl', fakeTimeout2, fake$http2);
    expect($timeoutSpy).not.toBe(true);
    expect($httpSpy).not.toBe(true);
    expect($timeoutSpy2).toBe(true);
    expect($httpSpy2).toBe(true);

});

});

