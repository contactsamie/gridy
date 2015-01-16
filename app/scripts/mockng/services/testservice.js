
(function (app) {
    app.service('testService', function () {
        this.sample = {
            getSamples: function () {
                return [
                    { name: 'john' },
                    { name: 'doe' }
                ];
            }
        };
    });
})(angular.module('mockngApp'));