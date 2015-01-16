
(function (app) {
app.factory('testFactoryUnused', function () {
    var sample = ['the testFactoryUnused'];
    return sample;
});
})(angular.module('mockngApp'));