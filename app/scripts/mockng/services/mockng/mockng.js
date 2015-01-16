(function (app) {
    app.service('mockng', function (
        $injector,
        $httpBackend,
        $rootScope,
        $templateCache,
        mockngCore) {
        this.mockng = mockngCore.execute();
        this.mock = this.mockng.mock;
        this.module = this.mockng.module;
        this.provide = this.mockng.provide;
        this.$httpBackend = $httpBackend;
        this.$templateCache = $templateCache;
        this.$rootScope = $rootScope;
    });
})(angular.module('mockngApp'));