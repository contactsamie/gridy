describe('Service: mockng', function () {
    var mockng;
    beforeEach(function () {
        module('mockngApp');
        injection = function (_mockng_) {
            mockng = _mockng_;
        };
        inject(injection);
    });
    it('should have all the required api', function () {
        expect(mockng).toBeTruthy();
        expect(mockng.mock).toBeTruthy();
        expect(mockng.mock.controller).toBeTruthy();
        expect(mockng.mock.service).toBeTruthy();
        expect(mockng.mock.factory).toBeTruthy();
        expect(mockng.mock.directive).toBeTruthy();
        expect(mockng.mock.value).toBeTruthy();
        expect(typeof mockng.$httpBackend === 'function').toBeTruthy();
        expect(typeof mockng.$templateCache === 'object').toBeTruthy();
    });
});