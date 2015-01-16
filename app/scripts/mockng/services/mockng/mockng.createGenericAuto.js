(function (app) {
    app.factory('createGenericAuto', function (
        $injector,
        createControllerType,
        createDependencies,
        basicTypes, angularTypes,
        currentBasicTypeName,
        globalVariables) {
        return function (basicType, dep, cName) {
            var d = angular.module(globalVariables.APPNAME).controller()._invokeQueue;
            var depend = [];
            for (var i = 0; i < d.length; i++) {
                var queueSubLength = d[i].length;
                var queueSub = d[i];
                for (var k = 0; k < queueSubLength; k++) {
                    var subk = queueSub[k];
                    if (subk === '$provide') {
                        for (var j = 0; j < queueSubLength; j++) {
                            var subj = queueSub[j];
                            if (subj !== '$provide' && typeof subj !== 'string') {
                                if (subj[0] !== globalVariables.serviceName) {
                                    depend.push(subj[0]);
                                }
                            }
                        }
                        break;
                    }
                }
            }

            var finalDep = depend.concat(dep).concat(angularTypes);

            var dependency = createDependencies(cName, finalDep, $injector);

            if (basicType === basicTypes.controller) {
                createControllerType(basicType, dependency, currentBasicTypeName());
            }

            return dependency;
        };
    });
})(angular.module('mockngApp'));