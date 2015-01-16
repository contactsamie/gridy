describe('MOCK-NG : createControllerType', function () {
    var  createControllerType;
    beforeEach(function () {
        module('mockngApp');
        injection = function ($injector) {
            createControllerType = $injector.get('createControllerType');
        };
        inject(injection);

    });
    it('Should exist and be a function', function () {
        expect(createControllerType).toBeTruthy();
        expect(typeof createControllerType ==='function').toBeTruthy();
    });

    xit('Should throw and exception when basicType is not defined', function () {
        expect(function(){
            createControllerType();
        }).toThrow(new Error('MOCK-NG :'+'Please supply a basic type'));
    });
});
