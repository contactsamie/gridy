describe('MOCK-NG : angularTypes', function () {
  var  angularTypes;
    beforeEach(function () {
        module('mockngApp');
        injection = function ($injector) {
            angularTypes = $injector.get('angularTypes');
        };
        inject(injection);
    });
    it('Should exist', function () {
        expect(angularTypes).toBeTruthy();
    });
    it('Should contain the required values and not more or less', function () {
        expect(angularTypes.length).toBe(6);
        expect(angularTypes.indexOf('$http') > -1).toBe(true);
        expect(angularTypes.indexOf('$timeout') > -1).toBe(true);
        expect(angularTypes.indexOf('$scope') > -1).toBe(true);
        expect(angularTypes.indexOf('$route') > -1).toBe(true);
        expect(angularTypes.indexOf('$httpBackend') > -1).toBe(true);
        expect(angularTypes.indexOf('$templateCache') > -1).toBe(true);
    });
});
