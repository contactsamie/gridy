(function (app) {
    app.service('mockngCore', function (
        $injector,
        getParametersFromFunctionArg,
        createGenericAuto,
        basicTypes,
        currentBasicTypeName,
        globalVariables) {
        var createMock = function (basicType, name, dep, $injector, mockngCore) {
            var dependency = createGenericAuto(basicType, dep || [], name, $injector);
            context = mockngCore.execute(dependency);
            var specificModule = mockngCore.execute(dependency);
            var result;

            if (((basicType === basicTypes.constant) || (basicType === basicTypes.value))) {
                result = specificModule();
            } else {
                result = specificModule;
            }
            return result;
        };
        var contextCurrent = this;
        this.execute = function (dependency) {
            var api = function () {
                api.dependency = api.dependency || {};
                return currentBasicTypeName() ? api.dependency[currentBasicTypeName()] : null;
            };
            var depMgnt = depMgnt || {};
            if (dependency && currentBasicTypeName()) {
                depMgnt[currentBasicTypeName()] = dependency;
            }
            api.dependency = depMgnt[currentBasicTypeName()];
            api.self = api();
            api.mock = function (moduleName) {
                if (typeof moduleName === 'string') {
                    APPNAME = moduleName;
                }
                return this.mock;
            };
            api.mock.ng = function (basicType, argumentsPased) {
                var argObj = getParametersFromFunctionArg(argumentsPased);
                var name = argObj.named;
                var args = argObj.arg;

                if (basicType && name) {
                    currentBasicTypeName(name);

                    var retApi = createMock(basicType, name, args, $injector, contextCurrent);

                    return retApi;
                }
                throw 'Please supply a angular object"s name name';
            };
            api.mock.controller = function () {
                return this.ng(basicTypes.controller, arguments);
            };
            api.mock.service = function () {
                return this.ng(basicTypes.service, arguments);
            };
            api.mock.directive = function () {
                var argObj = getParametersFromFunctionArg(arguments, true);
                var name = argObj.named;

                var resArg = [name].concat(argObj.arg || []);
                //todo - $provide
                //                if (typeof serviceContext.$provide === 'undefined') {
                //                    throw 'Error: Please supply a $provide from angular. use mockng.provide() method after something like  module("orderApp", function ($provide) {    provide = $provide;  });';
                //                }

                //                serviceContext.$provide.provider('testFactory', function () {
                //                    this.$get = function () {
                //                        return {method: function () {
                //                            return ',hello world'
                //                        }
                //                        };
                //                    }
                //                });

                var _api = this.ng(basicTypes.directive, resArg);

                var definition = argObj.definition || {
                    dom: '',
                    $scope: {}
                };

                var $scope = $injector.get(globalVariables.rootScopeStr).$new();

                var $compile = $injector.get('$compile');
                var element = angular.element(definition.dom);
                var compiled = $compile(element);
                compiled($scope);
                $scope.$digest();

                _api.definition = {
                    compiled: compiled,
                    scope: $scope,
                    $scope: $scope,
                    element: element,
                    $element: element
                };
                return _api;
            };
            api.mock.factory = function () {
                return this.ng(basicTypes.factory, arguments);
            };
            api.mock.value = function () {
                return this.ng(basicTypes.value, arguments);
            };
            api.mock.module = function (moduleName) {
                if (typeof moduleName === 'string') {
                    APPNAME = moduleName;
                }
            };
            api.provide = function ($provide) {
                if (typeof $provide === 'undefined') {
                    throw 'Please supply a provide object'
                }
                //   serviceContext.$provide = $provide;
            };
            api.injector = $injector;
            return api;
        };
    });
})(angular.module('mockngApp'));