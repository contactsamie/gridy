describe('MOCK-NG : basicTypes', function () {
    var  basicTypes;

    beforeEach(function () {
        module('mockngApp');
        injection = function ($injector) {
            basicTypes = $injector.get('basicTypes');
        };
        inject(injection);
    });
    it('Should exist', function () {
        expect(basicTypes).toBeTruthy();
    });
    it('Should have the required properties with correct convention', function () {
        expect(basicTypes['controller']).toBe('$controller');
        expect(basicTypes['directive']).toBe('$directive');
        expect(basicTypes['value']).toBe('$value');
        expect(basicTypes['constant']).toBe('$constant');
        expect(basicTypes['factory']).toBe('$factory');
        expect(basicTypes['service']).toBe('$service');
    });
});
