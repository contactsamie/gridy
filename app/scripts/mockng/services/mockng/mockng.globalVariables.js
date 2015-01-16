(function (app) {
    app.value('globalVariables',
        {
            APPNAME: 'mockngApp',
            serviceName: 'mockng',
            scopeStr: '$scope',
            rootScopeStr: '$rootScope'
        });
})(angular.module('mockngApp'));