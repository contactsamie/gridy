(function (app) {
    app.factory('testFactory', function (testService) {
        var sample = {
            service: testService.sample.getSamples,
            method: function () {
                return 987;
            }
        };
        return sample;
    });
})(angular.module('mockngApp'));