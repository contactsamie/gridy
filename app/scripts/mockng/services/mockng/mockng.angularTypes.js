(function (app) {
    app.value('angularTypes',
        [
            '$http',
            '$timeout',
            '$scope',
            '$route',
            '$httpBackend',
            '$templateCache'
        ]);
})(angular.module('mockngApp'));