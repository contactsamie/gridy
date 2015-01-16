(function (app) {
    app.factory('createDependencies', function (
        $injector,
        currentBasicTypeName,
        globalVariables) {
        return function (ctrlname, dep) {
            if (typeof ctrlname !== 'string') {
                throw 'Please supply a  string name in order to create dependencies ';
            }
            var depend = {};
            currentBasicTypeName(ctrlname);
            for (var i = 0; i < dep.length; i++) {
                var tmpDep = dep[i];
                if (typeof tmpDep !== 'string') {
                    for (var prop in tmpDep) {
                        if (tmpDep.hasOwnProperty(prop)) {
                            depend[prop] = tmpDep[prop];
                        }
                    }
                } else {
                    if (typeof depend[tmpDep] === 'undefined') {
                        depend[tmpDep] = tmpDep === globalVariables.scopeStr ?
                            $injector.get(globalVariables.rootScopeStr).$new() :
                            $injector.get(tmpDep);
                    }
                }
            }
            return depend;
        };
    });
})(angular.module('mockngApp'));