angular.module('gridy').directive('ocList', function(lodash, Utility, $state, $rootScope, EndPoints, Utility) {
    return {
        templateUrl: 'views/oc_list.html',
        restrict: 'E',
        transclude: true,
        //scope: {},
        link: function postLink(scope, element, attrs, ngModelCtrl, $transclude) {

            scope.$tableHeaderStyleClass = scope.$tableHeaderStyleClass || 'panel panel-heading';
            scope.$tableStyleClass = scope.$tableStyleClass || 'table table-striped b-t b-light table-condensed  table-hover table-bordered';
            scope.paginationTemplate = '<ul class="pagination pagination-sm m-t-none m-b-none" >' +
                '<li><a ui-sref="' + scope.routeName + '({page:1,search:searchString})">First</a></li>' +
                ' <li><a ui-sref="' + scope.routeName + '({page:currentPage===1?1:(currentPage-1),search:searchString})"><i class="fa fa-chevron-left"></i></a></li>' +
                '<li><a ui-sref="' + scope.routeName + '({page:currentPage===totalPages?totalPages:(currentPage+1),search:searchString})"><i class="fa fa-chevron-right"></i></a></li>' +
                '<li><a ui-sref="' + scope.routeName + '({page:totalPages,search:searchString})">Last</a></li>' +
                '</ul>';

            var eventArgumentTemplate = '{headerKey:data.headers[$index].key,headerObject:data.headers[$index],$row:$row,rowNumber:$indexRow, columnNumber:$index,$cell:$cell,$event:$event}';

           
            var angularEvents = ['click', 'mouseleave', 'mouseover', 'mouseenter'];
            var rowEventTemplate = '';
            lodash.forEach(angularEvents, function (evName) {
                if (evName === 'click') {
                   
                    rowEventTemplate += 'ng-click=" getDetails($row.model);$row.events.click&&$row.events.click(' + eventArgumentTemplate + ')"';
                } else {

                rowEventTemplate += 'ng-' + evName + '="$row.events.' + evName + '&&$row.events.' + evName + '(' + eventArgumentTemplate + ')"';
                }

            });

            var cellEventTemplate = '';
            lodash.forEach(angularEvents, function (evName) {
                cellEventTemplate += 'ng-' + evName + '="$cell.events&&$cell.events.' + evName + '&&$cell.events.' + evName + '(' + eventArgumentTemplate + ')"';
            });


            scope.tableTemplate =
                '<tr  ' + '' + '   ng-repeat="$row in data.rows track by $index | filter:$searchText:strict" ng-init=" $indexrow=$index"  >' +
                 '<td  style="cursor:pointer"  ' + rowEventTemplate + '    ng-hide="$first&&(!data.actions ||! data.actions.length) "    ng-repeat="$cell in $row  track by $index">' +
                           '<div   ' + cellEventTemplate + '     >' +


  '<label ng-mouseenter="$cell.hasSelectionByEnter=true" ng-show="$first&&data.actions && data.actions.length " class="i-checks m-b-none">' +
                                          '<input type="checkbox" name="post[]" ng-model="$cell.value" ng-click="checkActions(data.rows)">' +
                                          '<i></i>' +
                                 


                                        



                                   '</label>' +
                                    '<div ng-hide="$first">' +
                                            '<element-Transclude attr="$row.linkCellAttr" eltype="\'a\'">' +
                                                    '<div ng-hide="$cell.html">{{$cell.value}}</div>' +'<div ng-show="$cell.html" ng-html-compile="$cell.html">' + '</div>' +
                                            '</element-Transclude>' +
                                   '</div>' +
                           '</div>' +





 //' <div  ng-mouseleave="$cell.hasSelectionByEnter=false"    style="z-index:9999999999;position:fixed"  ng-show="$first&&data.actions && data.actions.length&&$cell. hasSelectionByEnter" class="btn-group" role="group">' +
 //                             '  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
 //                               'Action' +
 //                                '<span class="caret"></span>' +
 //                             ' </button>' +
 //           '<ul class="dropdown-menu" role="menu">' +
 //                              ' <li ng-repeat="action in data.actions"><a href ng-click="actionExecute(action,data.rows)">{{action.name}}</a></li>' +
 //                             ' </ul>' +
 //                         ' </div>' +


                         

                 '</td>'+
              '</tr>';

            scope.hasSelection = false;
    
            scope.actionExecute = function (action, rows) {
                var srows = [];
                lodash.forEach(rows, function (value) {
                 var m= lodash.find(value, { 'value': true, 'key': "$rowselect" });
                 m && srows.push(value);
                });
                console.log('Executing action :'+action.name+' with selected items');
                console.log(srows);
                action.execute(srows, rows);
            };
            scope.searchCheck = function (searchString) {
                searchString || $state.go(scope.routeName, { search: searchString });
            };
            scope.search = function (searchString) {
                $state.go(scope.routeName, { search: searchString,page:1 });
            };
            scope.checkActions = function (rows) {
                
                var srows = [];
                lodash.forEach(rows, function (value) {
                    var m = lodash.find(value, { 'value': true, 'key': "$rowselect" });
                    m && srows.push(value);
                });
                scope.hasSelection = srows.length;

            };

        }
    };
});