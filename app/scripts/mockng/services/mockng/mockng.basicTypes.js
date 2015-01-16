(function (app) {
    app.value('basicTypes',
        {
            controller: '$controller',
            directive: '$directive',
            value: '$value',
            constant: '$constant',
            factory: '$factory',
            service: '$service'
        });
})(angular.module('mockngApp'));