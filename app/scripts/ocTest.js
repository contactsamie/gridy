angular.module('gridy').directive('ocTest', function(lodash, Utility, $state, $rootScope, EndPoints, Utility) {
    return {
        restrict: 'E',
        link: function postLink(scope, element, attrs, ngModelCtrl) {
            scope.back = function() {
                $rootScope.back();
            };
            scope.routeName = 'payeelist';
            var dataPreProcesssor = function (data) {
                var result = Utility.mapAndPick(data, ['Name', 'Note', 'Id', 'Address'], ['Name', 'Note', 'Id', 'City', 'FirstName']);
                //var result = Utility.mapAndPick(data, ['Name', 'Note', 'Id', 'Address','Actions'], ['Name', 'Note', 'Id', 'City', 'FirstName']);
                return result;
            };
            var tableEvents = {
                linkCell: function (o) {
                    return {
                        route: 'viewpayee',
                        param: { id: o.$row.model.Id.replace('payees/', '') }
                    };
                },
                //click: function (o) {
                // $state.go('viewpayee', { id: o.$row.model.Id.replace('payees/', '') });
                //}
            };
            var excludeColumns = ['Id'];
            var types = {
                //Actions: {
                //    template: " <button class='btn btn-danger'>Delete</button> ",//"{{$cell.value|  amDateFormat:'MMM D/YY, h:mm:ss a'}}",
                //    events: {
                //        click: function (o) {
                           
                //                Utility.saveChanges('Are you sure you want to proceed?',{ payeeId: o.$row.model.Id },EndPoints.deletePayeeFromPayeeStore,false, { success: [reloadViewAfterDelete, goToPreviousStateAfterDelete] }, function () {tableHandler.refresh();});
                           
                //        }
                //    }
                //},
                //Name: {
                //    template: " {{$cell.value}} ",//"{{$cell.value|  amDateFormat:'MMM D/YY, h:mm:ss a'}}",
                //    events: {
                //        //click: function (o) {
                //        //    $state.go('viewpayee', { id: o.$row.model.Id.replace('payees/', '') });
                //        //}
                //    }
                //},
               // Name: {
               //     template: "<img width='200px' src='http://marketdailynews.com/wp-content/uploads/2012/10/google.jpg'><br/>{{$cell.value}}"
               // },
            };
            var reloadViewAfterDelete = false;
            var goToPreviousStateAfterDelete = false;
            var tableHandler = Utility.ocEasyGrid({
                tableId:'payeelisttable',
                //take control of the directive
                scope: scope,
                element: element,
                routeName: scope.routeName,
                //how will it load data
                loadHandler:Utility.loadPayeeList,
                searchHandler:Utility.searchPayeeList,
                dataPreprocessor: dataPreProcesssor,
                //row controlls
                buildHtmlTableEvents:tableEvents,
                excludeColumnsFromView: excludeColumns,
                //embede your templates o angular directive
                types: types,
                //styling stuf
                tableStyleClass: '',
                tableHeaderStyleClass: '',
                // some real time stuff!
                polling:0,
               // actions/operations
                actions: {
                    'View Details': function (srows, rows) {
                        $state.go('viewpayee', { id: srows[0].model.Id.replace('payees/', '') });
                    },
                    'Delete Selected Payee': function (srows, rows) {
                        if (srows.length === 1) {
                           
                        } else {
                            $rootScope.alertError('You can only delete one payee at a time');
                        }
                    }
                }
            });

        }
    };
});