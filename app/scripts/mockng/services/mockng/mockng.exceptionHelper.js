(function (app) {
    app.factory('exceptionHelper', function () {
        return {
            createException:function(message,context){
                this.name='Error';
                this.message='MOCK-NG :'+message||'';
                this.context=context?context.toString():' "no code"';
                this.description="Exception occured at "+(new Date())+" -  name: "+ this.name+" message: "+ this.message+" in : "+this.context;
            },
            log:[],

            throw:function(message,name,context){
                throw new this.createException(message,name,context);
            }
        };
    });
})(angular.module('mockngApp'));
