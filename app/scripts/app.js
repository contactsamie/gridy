'use strict';

/**
 * @ngdoc overview
 * @name sampleApp
 * @description
 * # sampleApp
 *
 * Main module of the application.
 */
angular
  .module('gridy', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
	'ui.router',
	'xeditable',
	'ngPrettyJson',
	'ngGrid',
	'ngLodash'
  ])
  .config(function ($stateProvider, $urlRouterProvider,$httpProvider) {
    $urlRouterProvider.otherwise('/');  
  /*
  //a redirect example
  state('order', {
            url: '/order/:orderNumber',
            controller: function($scope, $state) {
                $state.go('orderdetails', $state.params);
            }
        })  
  */
  
  $stateProvider.state('home', {
            url: '/',
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        }).state('about', {
            url: '/about',
            templateUrl: 'views/about.html',
            controller: 'AboutCtrl'
        }).state('contact', {
            url: '/contact',
            templateUrl: 'views/contact.html',
            controller: 'AboutCtrl'
        });
   $httpProvider.defaults.useXDomain = true;

        delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }).run(function(editableOptions, $rootScope) {
    editableOptions.theme = 'bs3';
	$rootScope.$on('$stateChangeStart', function(){ 
   $rootScope.cancelPreviousAlerts();
});
	 $rootScope.uiNotificationsLogs = [];
        var doAlert = function(msg, name) {
           window.toastr[name](msg);
        };
        $rootScope.alertSuccess = function(msg) {
            $rootScope.uiNotificationsLogs.unshift({ message: msg, status: 'success' });
            doAlert(msg, 'success');
        };
        $rootScope.alertError = function(msg) {
            $rootScope.uiNotificationsLogs.unshift({ message: msg, status: 'error' });
            doAlert(msg, 'error');
        };
        $rootScope.alertInfo = function(msg) {
            $rootScope.uiNotificationsLogs.unshift({ message: msg, status: 'info' });
            doAlert(msg, 'info');
        };
        $rootScope.cancelPreviousAlerts = function() {
           window. toastr.clear();
        };
	
  }).
    directive('ngHtmlCompile', function($compile) {
	return {
	    restrict: 'A',
	    link: function(scope, element, attrs) {
		scope.$watch(attrs.ngHtmlCompile, function(newValue, oldValue) {
		    element.html(newValue);
		    $compile(element.contents())(scope);
		});
	    }
	}
    }) .service('Utility', function Utility(lodash,$state,EndPoints, $rootScope,$q,$http, $compile,  $interval,MockEndPoints ) {
        var context = this;
		
    this.POST = function(url, item) {
        var deferred = $q.defer();
        var load = JSON.stringify(item);
        $http.post(url, load, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).
            success(deferred.resolve).
            error(deferred.reject);
        
        return EndPoints.test ? MockEndPoints.resolve(url) : deferred.promise;

    };
    this.GET = function(url) {

        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: url
            }).
            success(deferred.resolve).
            error(deferred.reject);
       
        return EndPoints.test ? MockEndPoints.resolve(url) : deferred.promise;
    };
    
	
	this.loadPayeeList = function(take, skip) {
        var query = EndPoints.getPayeeListFromPayeeStore + "?take=" + (take || 100) + "&skip=" + (skip || 0);
        return context.GET(query);
    };
	
	 this.mapAndPick = function (data, mappedPropertyFromList, pickPropertiesromMapProperty, dontUseMappedPropertyFromList) {
            if (typeof pickPropertiesromMapProperty === "function") {
                return lodash.map(data, function (obj) { return lodash.pick(obj[mappedPropertyFromList], pickPropertiesromMapProperty); });
            } else {
                return lodash.map(data, function (obj) {
                    var finalResult = {};

                    lodash.forEach(mappedPropertyFromList, function (_mappedPropertyFromList) {
                        var result = {};
                        if (!lodash.isObject(obj[_mappedPropertyFromList]) && !dontUseMappedPropertyFromList) {
                            result[_mappedPropertyFromList] = obj[_mappedPropertyFromList];
                        } else {
                            if (!pickPropertiesromMapProperty) {
                                result = obj[_mappedPropertyFromList];
                            } else {
                                var dataArray = obj[_mappedPropertyFromList];
                                var arg = [dataArray].concat(pickPropertiesromMapProperty);
                                result = lodash.pick.apply(lodash, arg);
                            }
                        }

                        finalResult = lodash.merge(result, finalResult);
                    });

                    return finalResult;
                });
            }
        };
         this.prepareType = function (types, value, key) {
            var setType = types[key];

            var setTypeName = setType && setType.type;
            var type = setTypeName || (lodash.isArray(value) ? 'array' : (lodash.isBoolean(value) ? 'bool' : (lodash.isDate(value) ? 'date' : (lodash.isNumber(value) ? 'number' : (lodash.isString(value) ? 'string' : false)))));
            var options = setTypeName ? setType.options : [];

            if (setType) {
                value = value || setType.defaultVal;
            }

            return {
                type: type,
                value: value,
                options: options,
                html: (setType && setType.template),
                events: setType && (setType.events || {})
            };
        };
       
	 this.camelCaseToCamelCase = function (str) {
            var out = str.replace(/^\s*/, ""); // strip leading spaces
            out = out.replace(/^[a-z]|[^\s][A-Z]/g, function (str, offset) {
                if (offset == 0) {
                    return (str.toUpperCase());
                } else {
                    return (str.substr(0, 1) + " " + str.substr(1).toUpperCase());
                }
            });
            return (out);
        };
       
		 this.buildHtmlTable = function (myList, transform, events, excludeColumns, types, actions) {
            types = types || {};
            actions = actions || {};

            excludeColumns = excludeColumns || [];
            myList.unshift({ "$rowselect": false });

            var columns = context.addAllColumnHeaders(myList, excludeColumns);
            var rows = [];
            for (var i = 0; i < myList.length; i++) {
                var row = [];
                for (var colIndex = 0; colIndex < columns.length; colIndex++) {
                    if (!lodash.contains(excludeColumns, columns[colIndex].key)) {
                        var cellValue = myList[i][columns[colIndex].key];
                        if (columns[colIndex].key === '$rowselect') {
                            cellValue = false;
                        } else if (cellValue == null) {
                            cellValue = "";
                        }
                        var typeSetting = context.prepareType(types, cellValue, columns[colIndex].key);
                        var format = {
                            key: columns[colIndex].key,
                            value: typeSetting.value,
                            type: typeSetting.type,
                            options: typeSetting.options,
                            html: typeSetting.html,
                            events: typeSetting.events
                        };

                        format = (typeof transform === 'function' ? transform(format) : format) || {};
                        row.push(format);
                    }
                }
                row.model = myList[i];
                row.warpper = {
                    before: '',
                    after: ''
                };
                events = events || {};
                lodash.forIn(events, function (value, key) {
                    if (typeof value === 'function') {
                        row.events = row.events || {};
                        if (key !== 'linkCell') {
                            row.events[key] = function (o) {
                                console.info(o);
                                o.columnNumber !== 0 && value(o);
                            };
                        } else {
                            try {
                                var wrapper = value({ $row: row });
                                row.linkCellAttr = " ui-sref='" + wrapper.route + "(" + JSON.stringify(wrapper.param) + ")'";
                                var sjgdsd = '';                               
                            } catch (e) {
                            }
                        }
                    } else {
                        console.warn("no evant function defined for table event :" + key);
                    }
                });

                i && rows.push(row);
            }
            var acts = [];
            lodash.forIn(actions, function (av, ak) {
                acts.push({
                    name: ak,
                    execute: av || function (rws) { }
                });
            });

            return {
                rows: rows,
                headers: columns,
                actions: acts
            };
        };

        // Adds a header row to the table and returns the set of columns.
        // Need to do union of keys from all records as some records may not contain
        // all records
        this.addAllColumnHeaders = function (myList, excludeColumns) {
            var cs = [];
            var columnSet = []; // ['$SELECTION'];
            for (var i = 0; i < myList.length; i++) {
                var rowHash = myList[i];
                for (var key in rowHash) {
                    if ($.inArray(key, cs) == -1) {
                        if (!lodash.contains(excludeColumns, key)) {
                            cs.push(key);
                            columnSet.push({ key: key, name: context.camelCaseToCamelCase(key) });
                        }
                    }
                }
            }
            return columnSet;
        };
       
	     this.promiseHandler = function(promise, success, failure,preventProgress) {

        var progressTemplate = '<div id="serviceProgress"><div  id="ajax-loader-progress"></div><div  class="ajax-loader-data-common" id="ajax-loader-data-center"><div  class="text-success">' +
            'Processing ...'
            + '</div><span><i style="font-size:45px" class="fa fa-spinner fa-spin"></i></span>&nbsp;&nbsp;<strong style="color:#fff"></strong></div></div>';

        preventProgress||  $('body').append(progressTemplate);
        promise.then(function(response) {
            preventProgress || $('#serviceProgress').remove();
            console.info("promiseHandler: Request succedded");
            console.log(response);
            (typeof success === 'function') && success(response);

        }, function(response) {
            preventProgress || $('#serviceProgress').remove();
            console.info("promiseHandler: Request failed");
            console.error(response);
            (typeof failure === 'function') && failure(response);

        });
    };
	   
		  this.ocEasyGrid = function(param) {
         
        param = param || {};
        var definition = {
            scope: {},
            polling:0,
            tableId: 'listtable',
            routeName: '',
            loadHandler: function () { },
            searchHandler: function () { },
            dataPreprocessor: function (data) { return data; },
            buildHtmlTableEvents: {},
            excludeColumnsFromView: [],
            types: {},
            tableStyleClass: '',
            tableHeaderStyleClass: '',
            element: {},
            actions: {}
        };
        param = lodash.assign(definition, param);
        param.scope.$tableStyleClass = param.tableStyleClass;
        param.scope.$tableHeaderStyleClass = param.tableHeaderStyleClass;


        var refresh = function (preventProgress,preventForceRefresh) {

            param.scope.currentPage = parseInt($state.params.page || 1, 10);
            param.scope.searchString = $state.params.search;
            param.scope.take = 10;
            param.scope.skip = 0;
            param.scope.totalPages = param.scope.totalPages || 1;
            var take = param.scope.take;
            var skip = (param.scope.currentPage * take) - take;

            var loadPromise = param.scope.searchString ? param.searchHandler(param.scope.searchString, take, skip) : param.loadHandler(take, skip);

            context.promiseHandler(loadPromise, function (response) {
                var shouldRefresh = true;
                if (preventForceRefresh) {
                    shouldRefresh = !lodash.isEqual(response, param.scope.lastResponse);

                }

                if (shouldRefresh) {
                param.scope.lastResponse = response;
                // $rootScope.alertSuccess(' loaded successfully');
                param.scope.totalPages = Math.ceil(response.total / param.scope.take);

                param.scope.paginationText = response.total ? 'Page ' + param.scope.currentPage + ' of ' + param.scope.totalPages + ' [' + (param.scope.take > response.total ? response.total : param.scope.take) + ' of ' + response.total + ']' : '';

                var flat = param.dataPreprocessor(response.data) || response.data;

                var data = context.buildHtmlTable(flat, false, param.buildHtmlTableEvents || {}, param.excludeColumnsFromView, param.types, param.actions);
                param.scope.routeName = param.routeName;
                param.scope.data = data;
                }
               
            }, function (data) {
                $rootScope.alertInfo('Unable to load data');
            }, preventProgress);
        };
        refresh();
        var template = "<oc-list id='" + param.tableId + "'></oc-list>";
        var linkFn = $compile(template);
        var content = linkFn(param.scope);
        param.element.append(content);

        param.polling && $interval(function () { refresh(true,true); }, param.polling);

        return {
            refresh: refresh,
            remove: function() {
                $('oc-list#' + param.tableId).remove();
            }
        };

    };
		}).factory('MockEndPoints', function ($q, lodash) {
    var endpoints = {
        '/api/admin/ShowPayment/GetPayeeListFromPayeeStore': { "total": 47, "data": [{ "Name": "sdgesd", "ID": "payees/10", "AccountDetails": [{ "AccountDetailId": null, "BankName": "vdsvds", "AccountNumber": "vsdv", "IBANNumber": "sdv", "BankTransitNumber": null, "Note": "sdvsdv" }, { "AccountDetailId": null, "BankName": "ddfh", "AccountNumber": "dfhd", "IBANNumber": "fhdf", "BankTransitNumber": null, "Note": "hdfhdh" }], "Address": { "FirstName": "sdgsdg", "LastName": "sd", "Street1": "sdg", "Street2": "sdg", "City": "sdggd", "RegionCode": "kg", "RegionName": "j", "PostalCode": "gj", "CountryCode": "g", "CountryName": "jg", "PhoneNumber": "jg", "EmailAddress": "jg" }, "Note": "jg", "ChangeSets": [{ "Timestamp": "2014-12-16T20:36:19.9907637Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-16T20:36:20.0077637Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": null, "Update": "payees/10" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-16T20:36:19.9907637Z", "Update": "2014-12-16T20:36:20.0067637Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/10" }] }, { "Timestamp": "2014-12-17T18:05:36.3322524Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"vdsvds\",\r\n  \"AccountNumber\": \"vsdv\",\r\n  \"IBANNumber\": \"sdv\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"sdvsdv\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-16T20:36:20.0067637Z", "Update": "2014-12-17T18:05:36.3312523Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/10" }] }, { "Timestamp": "2014-12-19T16:41:33.2014086Z", "User": null, "Changes": [{ "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T18:05:36.3312523Z", "Update": "2014-12-19T16:41:33.2004086Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/10" }] }], "LastUpdated": "2014-12-19T16:41:33.2004086Z", "LastUpdatedBy": null, "Deleted": false, "Id": "payees/10" }, { "Name": "samuel46436436436", "ID": "payees/18", "AccountDetails": [{ "AccountDetailId": null, "BankName": "jdf", "AccountNumber": "fdhfd", "IBANNumber": "dfhdfh", "BankTransitNumber": null, "Note": "hfd" }, { "AccountDetailId": null, "BankName": "gfhgfh", "AccountNumber": "fgfhgfh", "IBANNumber": "gfhfg", "BankTransitNumber": null, "Note": "fghgfh" }], "Address": { "FirstName": "hgg", "LastName": "gkj", "Street1": "jkg", "Street2": "kg", "City": "kj", "RegionCode": "gjk", "RegionName": "gk", "PostalCode": "gk", "CountryCode": "gk", "CountryName": "gg", "PhoneNumber": "kj", "EmailAddress": "gjk" }, "Note": "gj", "ChangeSets": [{ "Timestamp": "2014-12-17T21:14:10.7978871Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-17T21:14:10.8118871Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": null, "Update": "payees/12" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T21:14:10.7978871Z", "Update": "2014-12-17T21:14:10.8118871Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/12" }] }, { "Timestamp": "2014-12-18T18:27:15.1954539Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"ewtwe\",\r\n  \"AccountNumber\": \"ewt\",\r\n  \"IBANNumber\": \"wetwe\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"twet\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T21:14:10.8118871Z", "Update": "2014-12-18T18:27:15.1704514Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/12" }] }, { "Timestamp": "2014-12-18T19:14:19.0788328Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-18T19:14:19.0958345Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": "payees/12", "Update": "payees/18" }, { "Property": "AccountDetails", "ChangeType": 4, "Original": "{\r\n  \"BankName\": \"ewtwe\",\r\n  \"AccountNumber\": \"ewt\",\r\n  \"IBANNumber\": \"wetwe\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"twet\"\r\n}", "Update": null }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-18T19:14:19.0778327Z", "Update": "2014-12-18T19:14:19.0948344Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/18" }] }, { "Timestamp": "2014-12-18T19:15:23.8603103Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"jdf\",\r\n  \"AccountNumber\": \"fdhfd\",\r\n  \"IBANNumber\": \"dfhdfh\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"hfd\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-18T19:14:19.0948344Z", "Update": "2014-12-18T19:15:23.8603103Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/18" }] }, { "Timestamp": "2014-12-19T16:42:27.6144086Z", "User": null, "Changes": [{ "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-18T19:15:23.8603103Z", "Update": "2014-12-19T16:42:27.6114086Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/18" }] }], "LastUpdated": "2014-12-19T16:42:27.6114086Z", "LastUpdatedBy": null, "Deleted": false, "Id": "payees/18" }, { "Name": "fffffffff", "ID": "payees/29", "AccountDetails": [{ "AccountDetailId": null, "BankName": "fffffffff", "AccountNumber": "fffffffff000000", "IBANNumber": "fffffffff", "BankTransitNumber": null, "Note": "fffffffff" }, { "AccountDetailId": null, "BankName": "ghgf", "AccountNumber": "fgh", "IBANNumber": "fghgf", "BankTransitNumber": null, "Note": "hfgfg" }], "Address": { "FirstName": "gj", "LastName": "gj", "Street1": "gg", "Street2": "jg", "City": "jg", "RegionCode": "j", "RegionName": "gjk", "PostalCode": "gj", "CountryCode": "gj", "CountryName": "gj", "PhoneNumber": "gj", "EmailAddress": "j" }, "Note": "gj", "ChangeSets": [{ "Timestamp": "2014-12-15T17:47:55.5407156Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-15T17:47:55.5757191Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": null, "Update": "payees/5" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-15T17:47:55.5317147Z", "Update": "2014-12-15T17:47:55.5697185Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/5" }] }, { "Timestamp": "2014-12-19T15:54:20.845988Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-19T15:54:20.8689903Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": "payees/5", "Update": "payees/29" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-19T15:54:20.8459880Z", "Update": "2014-12-19T15:54:20.8689903Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/29" }] }, { "Timestamp": "2014-12-19T15:54:42.628166Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"fffffffff\",\r\n  \"AccountNumber\": \"fffffffff000000\",\r\n  \"IBANNumber\": \"fffffffff\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"fffffffff\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-19T15:54:20.8689903Z", "Update": "2014-12-19T15:54:42.6281660Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/29" }] }, { "Timestamp": "2014-12-19T16:42:50.5144086Z", "User": null, "Changes": [{ "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-19T15:54:42.6281660Z", "Update": "2014-12-19T16:42:50.5144086Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/29" }] }], "LastUpdated": "2014-12-19T16:42:50.5144086Z", "LastUpdatedBy": null, "Deleted": false, "Id": "payees/29" }, { "Name": "ggg", "ID": "payees/21", "AccountDetails": [{ "AccountDetailId": null, "BankName": "gsdgsd", "AccountNumber": "gsdg", "IBANNumber": "sdgsdg", "BankTransitNumber": null, "Note": "sdgsdg" }], "Address": { "FirstName": "g", "LastName": "gg", "Street1": "g", "Street2": "g", "City": "g", "RegionCode": "g", "RegionName": "g", "PostalCode": "g", "CountryCode": "g", "CountryName": "g", "PhoneNumber": "g", "EmailAddress": "g" }, "Note": "g", "ChangeSets": [{ "Timestamp": "2014-12-18T21:56:22.8811628Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-18T21:56:22.8961643Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": null, "Update": "payees/21" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-18T21:56:22.8811628Z", "Update": "2014-12-18T21:56:22.8961643Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/21" }] }, { "Timestamp": "2014-12-19T17:27:49.0727828Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"gsdgsd\",\r\n  \"AccountNumber\": \"gsdg\",\r\n  \"IBANNumber\": \"sdgsdg\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"sdgsdg\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-18T21:56:22.8961643Z", "Update": "2014-12-19T17:27:49.0727828Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/21" }] }], "LastUpdated": "2014-12-19T17:27:49.0727828Z", "LastUpdatedBy": null, "Deleted": false, "Id": "payees/21" }, { "Name": "vooodooo", "ID": "payees/23", "AccountDetails": [{ "AccountDetailId": null, "BankName": "dssdg", "AccountNumber": "sdgsdgsd", "IBANNumber": "gdsg", "BankTransitNumber": null, "Note": "sdgsdg" }], "Address": { "FirstName": "lg", "LastName": "lkl", "Street1": "kl", "Street2": "kl", "City": "klh", "RegionCode": "lk", "RegionName": "hkl", "PostalCode": "hkl", "CountryCode": "hlh", "CountryName": "kl", "PhoneNumber": "hk", "EmailAddress": "lhlk" }, "Note": "h", "ChangeSets": [{ "Timestamp": "2014-12-17T21:15:53.7638871Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-17T21:15:53.7818871Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": null, "Update": "payees/13" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T21:15:53.7638871Z", "Update": "2014-12-17T21:15:53.7818871Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/13" }] }, { "Timestamp": "2014-12-18T22:21:38.737392Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-18T22:21:38.749392Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": "payees/13", "Update": "payees/23" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-18T22:21:38.7373920Z", "Update": "2014-12-18T22:21:38.7483920Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/23" }] }, { "Timestamp": "2014-12-19T17:29:07.6086356Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"dssdg\",\r\n  \"AccountNumber\": \"sdgsdgsd\",\r\n  \"IBANNumber\": \"gdsg\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"sdgsdg\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-18T22:21:38.7483920Z", "Update": "2014-12-19T17:29:07.6076355Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/23" }] }], "LastUpdated": "2014-12-19T17:29:07.6076355Z", "LastUpdatedBy": null, "Deleted": false, "Id": "payees/23" }, { "Name": "samuel", "ID": "payees/17", "AccountDetails": [{ "AccountDetailId": null, "BankName": "dfvdfv", "AccountNumber": "svsdv", "IBANNumber": "sdsf", "BankTransitNumber": null, "Note": "dsfsdfs" }, { "AccountDetailId": null, "BankName": "gsdgsd", "AccountNumber": "gsdg", "IBANNumber": "sdgsdg", "BankTransitNumber": null, "Note": "sdgsdg" }], "Address": { "FirstName": "hgg", "LastName": "gkj", "Street1": "jkg", "Street2": "kg", "City": "kj", "RegionCode": "gjk", "RegionName": "gk", "PostalCode": "gk", "CountryCode": "gk", "CountryName": "gg", "PhoneNumber": "kj", "EmailAddress": "gjk" }, "Note": "gj", "ChangeSets": [{ "Timestamp": "2014-12-17T21:14:10.7978871Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-17T21:14:10.8118871Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": null, "Update": "payees/12" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T21:14:10.7978871Z", "Update": "2014-12-17T21:14:10.8118871Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/12" }] }, { "Timestamp": "2014-12-18T18:27:15.1954539Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"ewtwe\",\r\n  \"AccountNumber\": \"ewt\",\r\n  \"IBANNumber\": \"wetwe\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"twet\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T21:14:10.8118871Z", "Update": "2014-12-18T18:27:15.1704514Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/12" }] }, { "Timestamp": "2014-12-18T19:13:50.7690021Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-18T19:13:50.7950047Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": "payees/12", "Update": "payees/17" }, { "Property": "AccountDetails", "ChangeType": 4, "Original": "{\r\n  \"BankName\": \"ewtwe\",\r\n  \"AccountNumber\": \"ewt\",\r\n  \"IBANNumber\": \"wetwe\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"twet\"\r\n}", "Update": null }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-18T19:13:50.7690021Z", "Update": "2014-12-18T19:13:50.7940046Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/17" }] }, { "Timestamp": "2014-12-18T22:11:37.905392Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"dfvdfv\",\r\n  \"AccountNumber\": \"svsdv\",\r\n  \"IBANNumber\": \"sdsf\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"dsfsdfs\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-18T19:13:50.7940046Z", "Update": "2014-12-18T22:11:37.9043920Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/17" }] }, { "Timestamp": "2014-12-19T17:29:39.7118456Z", "User": null, "Changes": [{ "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-18T22:11:37.9043920Z", "Update": "2014-12-19T17:29:39.7108455Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/17" }] }], "LastUpdated": "2014-12-19T17:29:39.7108455Z", "LastUpdatedBy": null, "Deleted": false, "Id": "payees/17" }, { "Name": "uuuuu5555555", "ID": "payees/37", "AccountDetails": [{ "AccountDetailId": null, "BankName": "fgdf", "AccountNumber": "gdg", "IBANNumber": "dfgdf", "BankTransitNumber": null, "Note": "gdfgdfg" }], "Address": { "FirstName": "g", "LastName": "j", "Street1": "bb", "Street2": "lb", "City": "klb", "RegionCode": "klb", "RegionName": "l", "PostalCode": "kbk", "CountryCode": "bklb", "CountryName": "lkb", "PhoneNumber": "klb", "EmailAddress": "kl" }, "Note": "b", "ChangeSets": [{ "Timestamp": "2014-12-17T21:21:53.7729398Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-17T21:21:53.7969422Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": null, "Update": "payees/15" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T21:21:53.7729398Z", "Update": "2014-12-17T21:21:53.7959421Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/15" }] }, { "Timestamp": "2014-12-17T21:22:14.9280551Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"uuuuuu\",\r\n  \"AccountNumber\": \"bk\",\r\n  \"IBANNumber\": \"lb\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"lb\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T21:21:53.7959421Z", "Update": "2014-12-17T21:22:14.9280551Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/15" }] }, { "Timestamp": "2014-12-19T17:30:04.9553697Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-19T17:30:04.9693711Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": "payees/15", "Update": "payees/37" }, { "Property": "AccountDetails", "ChangeType": 4, "Original": "{\r\n  \"BankName\": \"uuuuuu\",\r\n  \"AccountNumber\": \"bk\",\r\n  \"IBANNumber\": \"lb\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"lb\"\r\n}", "Update": null }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-19T17:30:04.9543696Z", "Update": "2014-12-19T17:30:04.9683710Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/37" }] }, { "Timestamp": "2014-12-19T17:30:12.689143Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"fgdf\",\r\n  \"AccountNumber\": \"gdg\",\r\n  \"IBANNumber\": \"dfgdf\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"gdfgdfg\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-19T17:30:04.9683710Z", "Update": "2014-12-19T17:30:12.6881429Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/37" }] }], "LastUpdated": "2014-12-19T17:30:12.6881429Z", "LastUpdatedBy": null, "Deleted": false, "Id": "payees/37" }, { "Name": "dfdsfsdfsdf", "ID": "payees/20", "AccountDetails": [{ "AccountDetailId": null, "BankName": "llkh", "AccountNumber": "l", "IBANNumber": "hlh", "BankTransitNumber": null, "Note": "kl" }, { "AccountDetailId": null, "BankName": "uo", "AccountNumber": "uoyu", "IBANNumber": "oyu", "BankTransitNumber": null, "Note": "oyuou" }], "Address": { "FirstName": "VKV", "LastName": "JV", "Street1": "JKV", "Street2": "JKVJ", "City": "V", "RegionCode": "JKV", "RegionName": "JV", "PostalCode": "JV", "CountryCode": "JV", "CountryName": "JV", "PhoneNumber": "J", "EmailAddress": "VJK" }, "Note": "VJ", "ChangeSets": [{ "Timestamp": "2014-12-15T17:26:19.1470892Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-15T17:26:19.1660911Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": null, "Update": "payees/4" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-15T17:26:19.1380883Z", "Update": "2014-12-15T17:26:19.1600905Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/4" }] }, { "Timestamp": "2014-12-15T17:48:13.0194633Z", "User": null, "Changes": [{ "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-15T17:26:19.1600905Z", "Update": "2014-12-15T17:48:13.0174631Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/4" }] }, { "Timestamp": "2014-12-18T21:56:06.6305379Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-18T21:56:06.6425391Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": "payees/4", "Update": "payees/20" }, { "Property": "AccountDetails", "ChangeType": 4, "Original": "{\r\n  \"BankName\": null,\r\n  \"AccountNumber\": null,\r\n  \"IBANNumber\": null,\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": null\r\n}", "Update": null }, { "Property": "AccountDetails", "ChangeType": 4, "Original": "{\r\n  \"BankName\": \"gregre\",\r\n  \"AccountNumber\": \"gerg\",\r\n  \"IBANNumber\": \"ergreg\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"regergerg\"\r\n}", "Update": null }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-18T21:56:06.6305379Z", "Update": "2014-12-18T21:56:06.6425391Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/20" }] }, { "Timestamp": "2014-12-18T22:20:54.988392Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"llkh\",\r\n  \"AccountNumber\": \"l\",\r\n  \"IBANNumber\": \"hlh\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"kl\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-18T21:56:06.6425391Z", "Update": "2014-12-18T22:20:54.9883920Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/20" }] }, { "Timestamp": "2014-12-19T17:52:31.9059862Z", "User": null, "Changes": [{ "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-18T22:20:54.9883920Z", "Update": "2014-12-19T17:52:31.9049862Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/20" }] }], "LastUpdated": "2014-12-19T17:52:31.9049862Z", "LastUpdatedBy": null, "Deleted": false, "Id": "payees/20" }, { "Name": "dgsgsd4334634646", "ID": "payees/38", "AccountDetails": [{ "AccountDetailId": null, "BankName": "tyyi", "AccountNumber": "tity", "IBANNumber": "ityi", "BankTransitNumber": null, "Note": "yititi" }], "Address": { "FirstName": "gsdg", "LastName": "sdg", "Street1": "sdg", "Street2": "sdgsd", "City": "gsdg", "RegionCode": "sdg", "RegionName": "sdg", "PostalCode": "sdg", "CountryCode": "sdg", "CountryName": "sdgsd", "PhoneNumber": "gsdg", "EmailAddress": "ssdgsdg" }, "Note": "sdgsdgsdg", "ChangeSets": [{ "Timestamp": "2014-12-15T21:56:49.2097918Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-15T21:56:49.2327918Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": null, "Update": "payees/6" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-15T21:56:49.2097918Z", "Update": "2014-12-15T21:56:49.2287918Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/6" }] }, { "Timestamp": "2014-12-15T22:46:55.8159112Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"jj\",\r\n  \"AccountNumber\": \"gjg\",\r\n  \"IBANNumber\": \"jg\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"jgjgj\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-15T21:56:49.2287918Z", "Update": "2014-12-15T22:46:55.8149110Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/6" }] }, { "Timestamp": "2014-12-15T22:46:57.5112502Z", "User": null, "Changes": [{ "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-15T22:46:55.8149110Z", "Update": "2014-12-15T22:46:57.5112502Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/6" }] }, { "Timestamp": "2014-12-15T22:49:24.7206862Z", "User": null, "Changes": [{ "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-15T22:46:57.5112502Z", "Update": "2014-12-15T22:49:24.7206862Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/6" }] }, { "Timestamp": "2014-12-15T22:49:28.535449Z", "User": null, "Changes": [{ "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-15T22:49:24.7206862Z", "Update": "2014-12-15T22:49:28.5334486Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/6" }] }, { "Timestamp": "2014-12-16T20:28:28.4207637Z", "User": null, "Changes": [{ "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-15T22:49:28.5334486Z", "Update": "2014-12-16T20:28:28.4207637Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/6" }] }, { "Timestamp": "2014-12-18T19:25:33.9323114Z", "User": null, "Changes": [{ "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-16T20:28:28.4207637Z", "Update": "2014-12-18T19:25:33.9313113Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/6" }] }, { "Timestamp": "2014-12-19T18:06:42.7791442Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-19T18:06:42.8321495Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": "payees/6", "Update": "payees/38" }, { "Property": "AccountDetails", "ChangeType": 4, "Original": "{\r\n  \"BankName\": \"jj\",\r\n  \"AccountNumber\": \"gjg\",\r\n  \"IBANNumber\": \"jg\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"jgjgj\"\r\n}", "Update": null }, { "Property": "AccountDetails", "ChangeType": 4, "Original": "{\r\n  \"BankName\": \"jj\",\r\n  \"AccountNumber\": \"gjg\",\r\n  \"IBANNumber\": \"jg\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"jgjgj\"\r\n}", "Update": null }, { "Property": "AccountDetails", "ChangeType": 4, "Original": "{\r\n  \"BankName\": \"jj\",\r\n  \"AccountNumber\": \"gjg\",\r\n  \"IBANNumber\": \"jg\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"jgjgj\"\r\n}", "Update": null }, { "Property": "AccountDetails", "ChangeType": 4, "Original": "{\r\n  \"BankName\": \"jj\",\r\n  \"AccountNumber\": \"gjg\",\r\n  \"IBANNumber\": \"jg\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"jgjgj\"\r\n}", "Update": null }, { "Property": "AccountDetails", "ChangeType": 4, "Original": "", "Update": null }, { "Property": "AccountDetails", "ChangeType": 4, "Original": "{\r\n  \"BankName\": \"hxcc\",\r\n  \"AccountNumber\": \"nxc\",\r\n  \"IBANNumber\": \"nxcn\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"xcnxcnxc\"\r\n}", "Update": null }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-19T18:06:42.7791442Z", "Update": "2014-12-19T18:06:42.8311494Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/38" }] }, { "Timestamp": "2014-12-19T18:06:55.4964158Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"tyyi\",\r\n  \"AccountNumber\": \"tity\",\r\n  \"IBANNumber\": \"ityi\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"yititi\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-19T18:06:42.8311494Z", "Update": "2014-12-19T18:06:55.4954157Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/38" }] }], "LastUpdated": "2014-12-19T18:06:55.4954157Z", "LastUpdatedBy": null, "Deleted": false, "Id": "payees/38" }, { "Name": "uuuuu443634636", "ID": "payees/39", "AccountDetails": [{ "AccountDetailId": null, "BankName": "trhtrh", "AccountNumber": "rthrt", "IBANNumber": "htr", "BankTransitNumber": null, "Note": "trhrtht" }], "Address": { "FirstName": "g", "LastName": "j", "Street1": "bb", "Street2": "lb", "City": "klb", "RegionCode": "klb", "RegionName": "l", "PostalCode": "kbk", "CountryCode": "bklb", "CountryName": "lkb", "PhoneNumber": "klb", "EmailAddress": "kl" }, "Note": "b", "ChangeSets": [{ "Timestamp": "2014-12-17T21:21:53.7729398Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-17T21:21:53.7969422Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": null, "Update": "payees/15" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T21:21:53.7729398Z", "Update": "2014-12-17T21:21:53.7959421Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/15" }] }, { "Timestamp": "2014-12-17T21:22:14.9280551Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"uuuuuu\",\r\n  \"AccountNumber\": \"bk\",\r\n  \"IBANNumber\": \"lb\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"lb\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T21:21:53.7959421Z", "Update": "2014-12-17T21:22:14.9280551Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/15" }] }, { "Timestamp": "2014-12-19T18:13:25.567419Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-19T18:13:25.7304353Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": "payees/15", "Update": "payees/39" }, { "Property": "AccountDetails", "ChangeType": 4, "Original": "{\r\n  \"BankName\": \"uuuuuu\",\r\n  \"AccountNumber\": \"bk\",\r\n  \"IBANNumber\": \"lb\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"lb\"\r\n}", "Update": null }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-19T18:13:25.5664189Z", "Update": "2014-12-19T18:13:25.7304353Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/39" }] }, { "Timestamp": "2014-12-19T18:13:33.17818Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"trhtrh\",\r\n  \"AccountNumber\": \"rthrt\",\r\n  \"IBANNumber\": \"htr\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"trhrtht\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-19T18:13:25.7304353Z", "Update": "2014-12-19T18:13:33.1781800Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/39" }] }], "LastUpdated": "2014-12-19T18:13:33.17818Z", "LastUpdatedBy": null, "Deleted": false, "Id": "payees/39" }] },
        '/api/admin/ShowPayment/GetShows': { "total": 157, "data": [{ "LiveEvent": { "Payment": null, "Id": "liveevents/148", "ReservationWindowInMinutes": 5.0, "SaleCurrency": "USD", "PropertyName": "RufusWainwright", "PropertyId": "properties/8", "Artist": "Rufus Wainwright", "Venue": "Belly Up Tavern", "VenueUrl": "http://www.bellyup.com", "City": "Solana Beach", "State": "CA", "Country": "United States", "EventDate": "2013-12-01T05:00:00Z", "EventListNote": null, "FacebookEventId": "384768644962464", "ExternalTicketUrl": "http://bellyupsolanabeach.frontgatesolutions.com/choose.php?a=1&lid=82827&eid=93238", "ExternalTicketUrlName": null, "AgeLimit": "21+", "TourName": null, "DoorsOpen": "7:00 pm", "ShowTime": "8:00 pm", "Description": null, "TimeZone": "PDT", "TimeZoneOffset": -7.0, "Cancelled": false, "QuantityRestriction": 8, "DeliveryType": "PickUp", "Visible": true, "VisibleStartDate": "2013-06-17T17:00:00Z", "VisibleEndDate": "2101-01-31T05:00:00Z", "DetailsVisible": false, "DetailsVisibleStartDate": "2013-06-17T17:00:00Z", "DetailsVisibleEndDate": "2013-06-20T19:30:00Z", "TicketDetailsVisible": false, "TicketDetailsVisibleStartDate": null, "TicketDetailsVisibleEndDate": null, "TicketOnSale": true, "TicketSaleStartDate": "2013-06-19T17:00:00Z", "TicketSaleEndDate": "2013-06-20T19:30:00Z", "PublicOnSaleDate": "2013-06-21T17:00:00Z", "ShowType": "Headliner", "ExternalVIPUrl": null, "ExternalVIPUrlText": null, "ImageFileName": "img/ticket.jpg", "SupportingAct": null, "Custom": null, "Subscriptions": null }, "TicketOnSaleInUI": false, "TicketPresaleScheduled": false, "DetailsVisibleInUI": false }, { "LiveEvent": { "Payment": null, "Id": "liveevents/211", "ReservationWindowInMinutes": 5.0, "SaleCurrency": "USD", "PropertyName": "MarkKnopfler", "PropertyId": "properties/11", "Artist": "Mark Knopfler", "Venue": "Pearl Concert Theater at Palms Casino", "VenueUrl": "http://www.palms.com/music-venues/pearl-theater‎", "City": "Las Vegas", "State": "NV", "Country": "United States", "EventDate": "2013-10-25T04:00:00Z", "EventListNote": null, "FacebookEventId": "630880710269125", "ExternalTicketUrl": "http://www.ticketmaster.com/mark-knopfler-las-vegas-nevada-10-25-2013/event/17004AAAD2B9AFB8?artistid=769953&majorcatid=10001&minorcatid=1", "ExternalTicketUrlName": null, "AgeLimit": "5+", "TourName": null, "DoorsOpen": "7:00 pm", "ShowTime": "8:00 pm", "Description": null, "TimeZone": "PDT", "TimeZoneOffset": -7.0, "Cancelled": false, "QuantityRestriction": 4, "DeliveryType": "PickUp", "Visible": true, "VisibleStartDate": "2013-08-12T14:00:00Z", "VisibleEndDate": "2101-01-31T05:00:00Z", "DetailsVisible": false, "DetailsVisibleStartDate": "2013-08-12T21:12:00Z", "DetailsVisibleEndDate": "2013-08-19T14:07:00Z", "TicketDetailsVisible": false, "TicketDetailsVisibleStartDate": null, "TicketDetailsVisibleEndDate": null, "TicketOnSale": true, "TicketSaleStartDate": "2013-08-13T17:00:00Z", "TicketSaleEndDate": "2013-08-19T14:07:00Z", "PublicOnSaleDate": "2013-08-19T17:00:00Z", "ShowType": "Headliner", "ExternalVIPUrl": null, "ExternalVIPUrlText": null, "ImageFileName": "img/ticket.jpg", "SupportingAct": null, "Custom": null, "Subscriptions": null }, "TicketOnSaleInUI": false, "TicketPresaleScheduled": false, "DetailsVisibleInUI": false }, { "LiveEvent": { "Payment": null, "Id": "liveevents/212", "ReservationWindowInMinutes": 5.0, "SaleCurrency": "USD", "PropertyName": "MarkKnopfler", "PropertyId": "properties/11", "Artist": "Mark Knopfler", "Venue": "The Wiltern", "VenueUrl": "http://www.livenation.com/venues/14361/the-wiltern", "City": "Los Angeles", "State": "CA", "Country": "United States", "EventDate": "2013-10-26T04:00:00Z", "EventListNote": null, "FacebookEventId": "629506857082771", "ExternalTicketUrl": "http://concerts.livenation.com/event/09004B08F203C52F?crosssite=TM_US:769953:73790", "ExternalTicketUrlName": null, "AgeLimit": "5+", "TourName": null, "DoorsOpen": "7:00 pm", "ShowTime": "8:00 pm", "Description": null, "TimeZone": "PDT", "TimeZoneOffset": -7.0, "Cancelled": false, "QuantityRestriction": 4, "DeliveryType": "PickUp", "Visible": true, "VisibleStartDate": "2013-08-12T14:00:00Z", "VisibleEndDate": "2101-01-31T05:00:00Z", "DetailsVisible": false, "DetailsVisibleStartDate": "2013-08-12T21:12:00Z", "DetailsVisibleEndDate": "2013-08-19T19:26:00Z", "TicketDetailsVisible": false, "TicketDetailsVisibleStartDate": null, "TicketDetailsVisibleEndDate": null, "TicketOnSale": true, "TicketSaleStartDate": "2013-08-13T17:00:00Z", "TicketSaleEndDate": "2013-08-19T19:26:00Z", "PublicOnSaleDate": "2013-08-16T17:00:00Z", "ShowType": "Headliner", "ExternalVIPUrl": null, "ExternalVIPUrlText": null, "ImageFileName": "img/ticket.jpg", "SupportingAct": null, "Custom": null, "Subscriptions": null }, "TicketOnSaleInUI": false, "TicketPresaleScheduled": false, "DetailsVisibleInUI": false }, { "LiveEvent": { "Payment": null, "Id": "liveevents/213", "ReservationWindowInMinutes": 5.0, "SaleCurrency": "USD", "PropertyName": "MarkKnopfler", "PropertyId": "properties/11", "Artist": "Mark Knopfler", "Venue": "The Fox Theater", "VenueUrl": "http://www.thefoxoakland.com/", "City": "Oakland", "State": "CA", "Country": "United States", "EventDate": "2013-10-27T04:00:00Z", "EventListNote": null, "FacebookEventId": "558641070839131", "ExternalTicketUrl": "http://www.ticketmaster.com/mark-knopfler-oakland-california-10-27-2013/event/1C004B0825B5B361?artistid=769953&majorcatid=10001&minorcatid=1", "ExternalTicketUrlName": null, "AgeLimit": "All Ages", "TourName": null, "DoorsOpen": "6:30 pm", "ShowTime": "7:30 pm", "Description": null, "TimeZone": "PDT", "TimeZoneOffset": -7.0, "Cancelled": false, "QuantityRestriction": 4, "DeliveryType": "PickUp", "Visible": true, "VisibleStartDate": "2013-08-12T14:00:00Z", "VisibleEndDate": "2101-01-31T05:00:00Z", "DetailsVisible": false, "DetailsVisibleStartDate": "2013-08-12T21:12:00Z", "DetailsVisibleEndDate": "2013-08-19T04:00:00Z", "TicketDetailsVisible": false, "TicketDetailsVisibleStartDate": null, "TicketDetailsVisibleEndDate": null, "TicketOnSale": true, "TicketSaleStartDate": "2013-08-13T17:00:00Z", "TicketSaleEndDate": "2013-08-19T04:00:00Z", "PublicOnSaleDate": "2013-08-25T17:00:00Z", "ShowType": "Headliner", "ExternalVIPUrl": null, "ExternalVIPUrlText": null, "ImageFileName": "img/ticket.jpg", "SupportingAct": null, "Custom": null, "Subscriptions": null }, "TicketOnSaleInUI": false, "TicketPresaleScheduled": false, "DetailsVisibleInUI": false }, { "LiveEvent": { "Payment": null, "Id": "liveevents/218", "ReservationWindowInMinutes": 5.0, "SaleCurrency": "CAD", "PropertyName": "StubbyFingers", "PropertyId": "properties/13", "Artist": "Matt Andersen", "Venue": "Massey Hall", "VenueUrl": "http://www.masseyhall.com", "City": "Toronto", "State": "ON", "Country": "Canada", "EventDate": "2014-03-01T05:00:00Z", "EventListNote": null, "FacebookEventId": null, "ExternalTicketUrl": "http://www.masseyhall.com", "ExternalTicketUrlName": null, "AgeLimit": "All Ages", "TourName": null, "DoorsOpen": "7:15 pm", "ShowTime": "8:00 pm", "Description": null, "TimeZone": "EDT", "TimeZoneOffset": -4.0, "Cancelled": false, "QuantityRestriction": 8, "DeliveryType": "Mail", "Visible": true, "VisibleStartDate": "2013-08-12T14:00:00Z", "VisibleEndDate": "2101-01-31T05:00:00Z", "DetailsVisible": false, "DetailsVisibleStartDate": "2013-08-14T14:10:00Z", "DetailsVisibleEndDate": "2013-08-18T19:34:00Z", "TicketDetailsVisible": false, "TicketDetailsVisibleStartDate": null, "TicketDetailsVisibleEndDate": null, "TicketOnSale": true, "TicketSaleStartDate": "2013-08-15T14:00:00Z", "TicketSaleEndDate": "2013-08-18T19:34:00Z", "PublicOnSaleDate": "2013-08-19T14:00:00Z", "ShowType": "Headliner", "ExternalVIPUrl": null, "ExternalVIPUrlText": null, "ImageFileName": "img/ticket.jpg", "SupportingAct": null, "Custom": null, "Subscriptions": null }, "TicketOnSaleInUI": false, "TicketPresaleScheduled": false, "DetailsVisibleInUI": false }, { "LiveEvent": { "Payment": null, "Id": "liveevents/219", "ReservationWindowInMinutes": 5.0, "SaleCurrency": "USD", "PropertyName": "MarkKnopfler", "PropertyId": "properties/11", "Artist": "Mark Knopfler", "Venue": "The Fox Theater", "VenueUrl": "http://www.thefoxoakland.com/", "City": "Oakland", "State": "CA", "Country": "United States", "EventDate": "2013-10-28T04:00:00Z", "EventListNote": null, "FacebookEventId": "431221496996050", "ExternalTicketUrl": "http://www.ticketmaster.com/mark-knopfler-oakland-california-10-28-2013/event/1C004B1B38BBA3D7?artistid=769953&majorcatid=10001&minorcatid=1", "ExternalTicketUrlName": null, "AgeLimit": "All Ages", "TourName": null, "DoorsOpen": "6:30 pm", "ShowTime": "7:30 pm", "Description": null, "TimeZone": "PDT", "TimeZoneOffset": -7.0, "Cancelled": false, "QuantityRestriction": 4, "DeliveryType": "PickUp", "Visible": true, "VisibleStartDate": "2013-08-28T17:00:00Z", "VisibleEndDate": "2101-01-31T05:00:00Z", "DetailsVisible": false, "DetailsVisibleStartDate": "2013-08-30T14:22:00Z", "DetailsVisibleEndDate": "2013-09-03T18:45:00Z", "TicketDetailsVisible": false, "TicketDetailsVisibleStartDate": null, "TicketDetailsVisibleEndDate": null, "TicketOnSale": true, "TicketSaleStartDate": "2013-09-03T17:00:00Z", "TicketSaleEndDate": "2013-09-03T18:45:00Z", "PublicOnSaleDate": "2013-09-08T17:00:00Z", "ShowType": "Headliner", "ExternalVIPUrl": null, "ExternalVIPUrlText": null, "ImageFileName": "img/ticket.jpg", "SupportingAct": null, "Custom": null, "Subscriptions": null }, "TicketOnSaleInUI": false, "TicketPresaleScheduled": false, "DetailsVisibleInUI": false }, { "LiveEvent": { "Payment": null, "Id": "liveevents/220", "ReservationWindowInMinutes": 5.0, "SaleCurrency": "USD", "PropertyName": "GreatBigSea", "PropertyId": "properties/4", "Artist": "Great Big Sea", "Venue": "Capitol Centre for the Arts", "VenueUrl": "http://www.ccanh.com/", "City": "Concord", "State": "NH", "Country": "United States", "EventDate": "2013-11-23T05:00:00Z", "EventListNote": null, "FacebookEventId": "1407434242806829", "ExternalTicketUrl": "http://www.ccanh.com/event/great-big-sea", "ExternalTicketUrlName": null, "AgeLimit": "All Ages", "TourName": null, "DoorsOpen": "7:30 PM", "ShowTime": "8:00 PM", "Description": "", "TimeZone": "EDT", "TimeZoneOffset": -4.0, "Cancelled": false, "QuantityRestriction": 8, "DeliveryType": "PickUp", "Visible": true, "VisibleStartDate": "2013-08-30T14:44:00Z", "VisibleEndDate": "2101-01-31T05:00:00Z", "DetailsVisible": false, "DetailsVisibleStartDate": "2013-09-03T15:11:00Z", "DetailsVisibleEndDate": "2013-09-04T16:00:00Z", "TicketDetailsVisible": false, "TicketDetailsVisibleStartDate": null, "TicketDetailsVisibleEndDate": null, "TicketOnSale": true, "TicketSaleStartDate": "2013-09-04T14:00:00Z", "TicketSaleEndDate": "2013-09-04T16:00:00Z", "PublicOnSaleDate": "2013-09-06T14:00:00Z", "ShowType": "Headliner", "ExternalVIPUrl": null, "ExternalVIPUrlText": null, "ImageFileName": "img/ticket.jpg", "SupportingAct": null, "Custom": null, "Subscriptions": null }, "TicketOnSaleInUI": false, "TicketPresaleScheduled": false, "DetailsVisibleInUI": false }, { "LiveEvent": { "Payment": null, "Id": "liveevents/229", "ReservationWindowInMinutes": 5.0, "SaleCurrency": "USD", "PropertyName": "GreatBigSea", "PropertyId": "properties/4", "Artist": "Great Big Sea", "Venue": "Stone Mountain Arts Center", "VenueUrl": "http://www.stonemountainartscenter.com/ArtsCenter/‎", "City": "Brownfield", "State": "ME", "Country": "United States", "EventDate": "2013-11-20T05:00:00Z", "EventListNote": null, "FacebookEventId": "164186497106489", "ExternalTicketUrl": "http://stonemountainartscenter.com/ArtsCenter/Great-Big-Sea.html", "ExternalTicketUrlName": "", "AgeLimit": null, "TourName": null, "DoorsOpen": "TBC", "ShowTime": "TBC", "Description": null, "TimeZone": "EDT", "TimeZoneOffset": -4.0, "Cancelled": false, "QuantityRestriction": 8, "DeliveryType": "Unknown", "Visible": true, "VisibleStartDate": "2013-09-10T14:00:00Z", "VisibleEndDate": "2101-01-31T05:00:00Z", "DetailsVisible": false, "DetailsVisibleStartDate": null, "DetailsVisibleEndDate": null, "TicketDetailsVisible": false, "TicketDetailsVisibleStartDate": null, "TicketDetailsVisibleEndDate": null, "TicketOnSale": true, "TicketSaleStartDate": null, "TicketSaleEndDate": null, "PublicOnSaleDate": "2013-09-11T14:00:00Z", "ShowType": "Headliner", "ExternalVIPUrl": null, "ExternalVIPUrlText": null, "ImageFileName": "img/ticket.jpg", "SupportingAct": null, "Custom": null, "Subscriptions": null }, "TicketOnSaleInUI": false, "TicketPresaleScheduled": false, "DetailsVisibleInUI": false }, { "LiveEvent": { "Payment": null, "Id": "liveevents/217", "ReservationWindowInMinutes": 5.0, "SaleCurrency": "CAD", "PropertyName": "GreatBigSea", "PropertyId": "properties/4", "Artist": "Great Big Sea", "Venue": "Shaw Millennium Park (w/ The Trews)", "VenueUrl": null, "City": "Calgary", "State": "AB", "Country": "Canada", "EventDate": "2013-08-29T04:00:00Z", "EventListNote": null, "FacebookEventId": "219285708227732", "ExternalTicketUrl": "http://www.greatbigsea.com/news/news_details.aspx?postid=af0bf9a3-a368-42c0-a130-598b59a3b18b", "ExternalTicketUrlName": "Calgary Shaw Retail Locations", "AgeLimit": null, "TourName": null, "DoorsOpen": "TBC", "ShowTime": "TBC", "Description": null, "TimeZone": null, "TimeZoneOffset": null, "Cancelled": false, "QuantityRestriction": 8, "DeliveryType": "Unknown", "Visible": true, "VisibleStartDate": "2013-08-07T14:20:00Z", "VisibleEndDate": "2101-01-31T05:00:00Z", "DetailsVisible": false, "DetailsVisibleStartDate": null, "DetailsVisibleEndDate": null, "TicketDetailsVisible": false, "TicketDetailsVisibleStartDate": null, "TicketDetailsVisibleEndDate": null, "TicketOnSale": true, "TicketSaleStartDate": null, "TicketSaleEndDate": null, "PublicOnSaleDate": null, "ShowType": "Headliner", "ExternalVIPUrl": null, "ExternalVIPUrlText": null, "ImageFileName": "img/ticket.jpg", "SupportingAct": null, "Custom": null, "Subscriptions": null }, "TicketOnSaleInUI": false, "TicketPresaleScheduled": false, "DetailsVisibleInUI": false }, { "LiveEvent": { "Payment": null, "Id": "liveevents/228", "ReservationWindowInMinutes": 5.0, "SaleCurrency": "USD", "PropertyName": "GreatBigSea", "PropertyId": "properties/4", "Artist": "Great Big Sea", "Venue": "Spruce Peak Performing Arts Center", "VenueUrl": "http://www.sprucepeakarts.org", "City": "Stowe", "State": "VT", "Country": "United States", "EventDate": "2013-11-19T05:00:00Z", "EventListNote": null, "FacebookEventId": "575474082517519", "ExternalTicketUrl": "http://www.sprucepeakarts.org/event/an-evening-with-great-big-sea/", "ExternalTicketUrlName": null, "AgeLimit": "All Ages", "TourName": "", "DoorsOpen": "7:00 PM", "ShowTime": "7:30 PM", "Description": null, "TimeZone": "EDT", "TimeZoneOffset": -4.0, "Cancelled": false, "QuantityRestriction": 8, "DeliveryType": "PickUp", "Visible": true, "VisibleStartDate": "2013-09-10T14:00:00Z", "VisibleEndDate": "2101-01-31T05:00:00Z", "DetailsVisible": false, "DetailsVisibleStartDate": "2013-09-10T14:00:00Z", "DetailsVisibleEndDate": "2013-09-12T19:00:00Z", "TicketDetailsVisible": false, "TicketDetailsVisibleStartDate": null, "TicketDetailsVisibleEndDate": null, "TicketOnSale": true, "TicketSaleStartDate": "2013-09-11T15:00:00Z", "TicketSaleEndDate": "2013-09-12T19:00:00Z", "PublicOnSaleDate": "2013-09-13T14:00:00Z", "ShowType": "Headliner", "ExternalVIPUrl": null, "ExternalVIPUrlText": null, "ImageFileName": "img/ticket.jpg", "SupportingAct": null, "Custom": null, "Subscriptions": null }, "TicketOnSaleInUI": false, "TicketPresaleScheduled": false, "DetailsVisibleInUI": false }] },
        '/api/admin/ShowPayment/GetShowPayment': { "Payment": { "PaymentId": null, "ShowPayments": [{ "Id": "cf5c048f-5a5b-4027-bab7-2b8729dcea6e", "Status": null, "PaymentDueDate": null, "PaymentSentDate": null, "Currency": "kg", "PaymentMethod": null, "TicketDeliveryMethod": null, "AdditionalChargeAmount": 0.0, "AdditionalChargeReason": "gj", "TotalPayment": 0.0, "Note": "g" }], "Payee": { "Name": "hhhhhhhhh", "ID": "payees/14", "AccountDetails": [{ "AccountDetailId": "f7195964-a66f-4f18-a26c-7d7d514ee63b", "BankName": "fdf", "AccountNumber": "gdfg", "IBANNumber": "dfgdf", "BankTransitNumber": null, "Note": "gdfgfdg" }], "Address": { "FirstName": "g", "LastName": "g", "Street1": "lg", "Street2": "lgl", "City": "glglg", "RegionCode": "g", "RegionName": "uig", "PostalCode": "og", "CountryCode": "ig", "CountryName": "o", "PhoneNumber": "goig", "EmailAddress": "i" }, "Note": "gio", "ChangeSets": [{ "Timestamp": "2014-12-17T21:19:46.7382376Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-17T21:19:46.7482386Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": null, "Update": "payees/14" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T21:19:46.7382376Z", "Update": "2014-12-17T21:19:46.7482386Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/14" }] }, { "Timestamp": "2014-12-19T17:25:36.4755244Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"gsdgsd\",\r\n  \"AccountNumber\": \"gsdg\",\r\n  \"IBANNumber\": \"sdg\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"sdgsdg\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T21:19:46.7482386Z", "Update": "2014-12-19T17:25:36.4465215Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/14" }] }, { "Timestamp": "2015-01-02T20:32:19.2586013Z", "User": null, "Changes": [{ "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-19T17:25:36.4465215Z", "Update": "2015-01-02T20:32:19.2586013Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/14" }] }], "LastUpdated": "2015-01-02T20:32:19.2586013Z", "LastUpdatedBy": null, "Deleted": false, "Id": "payees/14" } }, "Status": "Complete", "ReservationWindowInMinutes": 5.0, "SaleCurrency": "CAD", "PropertyName": "GreatBigSea", "PropertyId": "properties/4", "Venue": "The WestJet Concert Stage (PNE Amphitheatre)", "VenueUrl": "http://www.pne.ca/thefair/index.html", "City": "Vancouver", "State": "BC", "Country": "Canada", "EventDate": "2013-08-21T04:00:00Z", "EventListNote": null, "FacebookEventId": "525792734135360", "ExternalTicketUrl": "http://www.pne.ca/thefair/index.html", "ExternalTicketUrlName": "", "AgeLimit": "All Ages (19+ to purchase alcohol)", "TourName": null, "DoorsOpen": "7:00 pm", "ShowTime": "8:30 pm", "Description": null, "TimeZone": "PDT", "TimeZoneOffset": -7.0, "Cancelled": false, "QuantityRestriction": 8, "DeliveryType": "PickUp", "Visible": true, "VisibleStartDate": "2013-06-11T17:00:00Z", "VisibleEndDate": "2101-01-31T05:00:00Z", "DetailsVisible": false, "DetailsVisibleStartDate": "2013-06-11T17:00:00Z", "DetailsVisibleEndDate": "2013-06-13T22:00:00Z", "TicketOnSale": true, "TicketSaleStartDate": "2013-06-11T17:00:00Z", "TicketSaleEndDate": "2013-06-13T22:00:00Z", "PublicOnSaleDate": "2013-06-14T17:00:00Z", "ShowType": "Headliner", "ExternalVIPUrl": null, "ExternalVIPUrlText": null, "ImageFileName": "img/ticket.jpg", "SupportingAct": null, "DayOfShowBoxOffice": "4:00 pm - 9:00 pm", "PromoterCompany": "The Pacific National Exhibition", "PromoterContactName": "Colleen Nicholson", "PromoterEmail": "colleen@colleennicholson.com", "PromoterPhoneNumber": "604-908-4210", "TicketSections": ["ticketsections/199"], "Custom": null, "Subscriptions": null, "Products": [], "ChangeSets": [{ "Timestamp": "2015-01-02T20:56:36.4073016Z", "User": "OC\\alanna.uhrich", "Changes": [{ "Property": "ReservationWindowInMinutes", "ChangeType": 5, "Original": "Integer", "Update": "Float" }, { "Property": "TimeZoneOffset", "ChangeType": 5, "Original": "Integer", "Update": "Float" }, { "Property": "Payment", "ChangeType": 2, "Original": null, "Update": "{\r\n  \"PaymentId\": null,\r\n  \"ShowPayments\": [],\r\n  \"Payee\": {\r\n    \"Name\": \"hhhhhhhhh\",\r\n    \"ID\": \"payees/14\",\r\n    \"AccountDetails\": [\r\n      {\r\n        \"AccountDetailId\": \"f7195964-a66f-4f18-a26c-7d7d514ee63b\",\r\n        \"BankName\": \"fdf\",\r\n        \"AccountNumber\": \"gdfg\",\r\n        \"IBANNumber\": \"dfgdf\",\r\n        \"BankTransitNumber\": null,\r\n        \"Note\": \"gdfgfdg\"\r\n      }\r\n    ],\r\n    \"Address\": {\r\n      \"FirstName\": \"g\",\r\n      \"LastName\": \"g\",\r\n      \"Street1\": \"lg\",\r\n      \"Street2\": \"lgl\",\r\n      \"City\": \"glglg\",\r\n      \"RegionCode\": \"g\",\r\n      \"RegionName\": \"uig\",\r\n      \"PostalCode\": \"og\",\r\n      \"CountryCode\": \"ig\",\r\n      \"CountryName\": \"o\",\r\n      \"PhoneNumber\": \"goig\",\r\n      \"EmailAddress\": \"i\"\r\n    },\r\n    \"Note\": \"gio\",\r\n    \"ChangeSets\": [\r\n      {\r\n        \"Timestamp\": \"2014-12-17T21:19:46.7382376Z\",\r\n        \"User\": null,\r\n        \"Changes\": [\r\n          {\r\n            \"Property\": null,\r\n            \"ChangeType\": \"Created\",\r\n            \"Original\": null,\r\n            \"Update\": null\r\n          }\r\n        ]\r\n      },\r\n      {\r\n        \"Timestamp\": \"2014-12-17T21:19:46.7482386Z\",\r\n        \"User\": null,\r\n        \"Changes\": [\r\n          {\r\n            \"Property\": \"ID\",\r\n            \"ChangeType\": \"Changed\",\r\n            \"Original\": null,\r\n            \"Update\": \"payees/14\"\r\n          },\r\n          {\r\n            \"Property\": \"LastUpdated\",\r\n            \"ChangeType\": \"Changed\",\r\n            \"Original\": \"2014-12-17T21:19:46.7382376Z\",\r\n            \"Update\": \"2014-12-17T21:19:46.7482386Z\"\r\n          },\r\n          {\r\n            \"Property\": \"Id\",\r\n            \"ChangeType\": \"Changed\",\r\n            \"Original\": null,\r\n            \"Update\": \"payees/14\"\r\n          }\r\n        ]\r\n      },\r\n      {\r\n        \"Timestamp\": \"2014-12-19T17:25:36.4755244Z\",\r\n        \"User\": null,\r\n        \"Changes\": [\r\n          {\r\n            \"Property\": \"AccountDetails\",\r\n            \"ChangeType\": \"Added\",\r\n            \"Original\": null,\r\n            \"Update\": \"{\\r\\n  \\\"BankName\\\": \\\"gsdgsd\\\",\\r\\n  \\\"AccountNumber\\\": \\\"gsdg\\\",\\r\\n  \\\"IBANNumber\\\": \\\"sdg\\\",\\r\\n  \\\"BankTransitNumber\\\": null,\\r\\n  \\\"Note\\\": \\\"sdgsdg\\\"\\r\\n}\"\r\n          },\r\n          {\r\n            \"Property\": \"LastUpdated\",\r\n            \"ChangeType\": \"Changed\",\r\n            \"Original\": \"2014-12-17T21:19:46.7482386Z\",\r\n            \"Update\": \"2014-12-19T17:25:36.4465215Z\"\r\n          },\r\n          {\r\n            \"Property\": \"Id\",\r\n            \"ChangeType\": \"Changed\",\r\n            \"Original\": null,\r\n            \"Update\": \"payees/14\"\r\n          }\r\n        ]\r\n      },\r\n      {\r\n        \"Timestamp\": \"2015-01-02T20:32:19.2586013Z\",\r\n        \"User\": null,\r\n        \"Changes\": [\r\n          {\r\n            \"Property\": \"LastUpdated\",\r\n            \"ChangeType\": \"Changed\",\r\n            \"Original\": \"2014-12-19T17:25:36.4465215Z\",\r\n            \"Update\": \"2015-01-02T20:32:19.2586013Z\"\r\n          },\r\n          {\r\n            \"Property\": \"Id\",\r\n            \"ChangeType\": \"Changed\",\r\n            \"Original\": null,\r\n            \"Update\": \"payees/14\"\r\n          }\r\n        ]\r\n      }\r\n    ],\r\n    \"LastUpdated\": \"2015-01-02T20:32:19.2586013Z\",\r\n    \"LastUpdatedBy\": null,\r\n    \"Deleted\": false,\r\n    \"Id\": \"payees/14\"\r\n  }\r\n}" }, { "Property": "Products", "ChangeType": 2, "Original": null, "Update": "[]" }] }, { "Timestamp": "2015-01-02T20:56:49.8756483Z", "User": "OC\\alanna.uhrich", "Changes": [{ "Property": "Payment.ShowPayments", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"Id\": \"cf5c048f-5a5b-4027-bab7-2b8729dcea6e\",\r\n  \"Status\": null,\r\n  \"PaymentDueDate\": null,\r\n  \"PaymentSentDate\": null,\r\n  \"Currency\": \"kg\",\r\n  \"PaymentMethod\": null,\r\n  \"TicketDeliveryMethod\": null,\r\n  \"AdditionalChargeAmount\": 0.0,\r\n  \"AdditionalChargeReason\": \"gj\",\r\n  \"TotalPayment\": 0.0,\r\n  \"Note\": \"g\"\r\n}" }] }], "LastUpdated": "2015-01-02T20:56:49.8666474Z", "LastUpdatedBy": "OC\\alanna.uhrich", "Deleted": false, "Id": "liveevents/147" },
        '/api/admin/ShowPayment/GetPayeeFromPayeeStore': { "Name": "hhhhhhhhh", "ID": "payees/14", "AccountDetails": [{ "AccountDetailId": null, "BankName": "gsdgsd", "AccountNumber": "gsdg", "IBANNumber": "sdg", "BankTransitNumber": null, "Note": "sdgsdg" }, { "AccountDetailId": "f7195964-a66f-4f18-a26c-7d7d514ee63b", "BankName": "fdf", "AccountNumber": "gdfg", "IBANNumber": "dfgdf", "BankTransitNumber": null, "Note": "gdfgfdg" }], "Address": { "FirstName": "g", "LastName": "g", "Street1": "lg", "Street2": "lgl", "City": "glglg", "RegionCode": "g", "RegionName": "uig", "PostalCode": "og", "CountryCode": "ig", "CountryName": "o", "PhoneNumber": "goig", "EmailAddress": "i" }, "Note": "gio", "ChangeSets": [{ "Timestamp": "2014-12-17T21:19:46.7382376Z", "User": null, "Changes": [{ "Property": null, "ChangeType": 6, "Original": null, "Update": null }] }, { "Timestamp": "2014-12-17T21:19:46.7482386Z", "User": null, "Changes": [{ "Property": "ID", "ChangeType": 2, "Original": null, "Update": "payees/14" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T21:19:46.7382376Z", "Update": "2014-12-17T21:19:46.7482386Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/14" }] }, { "Timestamp": "2014-12-19T17:25:36.4755244Z", "User": null, "Changes": [{ "Property": "AccountDetails", "ChangeType": 3, "Original": null, "Update": "{\r\n  \"BankName\": \"gsdgsd\",\r\n  \"AccountNumber\": \"gsdg\",\r\n  \"IBANNumber\": \"sdg\",\r\n  \"BankTransitNumber\": null,\r\n  \"Note\": \"sdgsdg\"\r\n}" }, { "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-17T21:19:46.7482386Z", "Update": "2014-12-19T17:25:36.4465215Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/14" }] }, { "Timestamp": "2015-01-02T20:32:19.2586013Z", "User": null, "Changes": [{ "Property": "LastUpdated", "ChangeType": 2, "Original": "2014-12-19T17:25:36.4465215Z", "Update": "2015-01-02T20:32:19.2586013Z" }, { "Property": "Id", "ChangeType": 2, "Original": null, "Update": "payees/14" }] }], "LastUpdated": "2015-01-02T20:32:19.2586013Z", "LastUpdatedBy": null, "Deleted": false, "Id": "payees/14" },
        '/api/admin/ShowPayment/UpdateShowPayment': "N/A",
        '/api/admin/ShowPayment/AddNewShowPayee': "N/A",
        '/api/admin/ShowPayment/UpdateShowPayee': "N/A",
        '/api/admin/ShowPayment/AddNewShowPayment': "N/A",
        '/api/admin/ShowPayment/AddNewPayeeToPayeeStore': "N/A",
        '/api/admin/ShowPayment/AddNewAccountDetailsToPayeeStore': "N/A",
        '/api/admin/ShowPayment/DeletePayeeFromPayeeStore': "N/A",
        '/api/admin/ShowPayment/DeleteAccountDetailsFromPayeeStore': "N/A",
        '/api/admin/ShowPayment/DeleteShowPayment': "N/A",
        '/api/admin/ShowPayment/DeleteShowPayee': "N/A",
        '/api/admin/ShowPayment/DeleteAccountDetailsFromShowPayee': "N/A",
        '/api/admin/ShowPayment/AddAccountToShowPayee': "N/A"
    };
    var resolve = function (url, selector) {
        return $q(function(resolve, reject) {
            setTimeout(function() {
                var found = false;
                lodash.forIn(endpoints, function (value, key) {
                    if ((url.lastIndexOf(key) !== -1) && !found) {
                        resolve(value);
                        found = true;
                    }
                });
            }, 1000);
        });
    };
    return {
        resolve: resolve,
        endpoints: endpoints
    };
}).factory('EndPoints', function (lodash) {
    //var _$BASE_ADDRESS_ = 'https://api.officialcommunity.com';
    var _$BASE_ADDRESS_ = '';
    return {
        test:true,
        baseUrl: _$BASE_ADDRESS_,
        getPayeeListFromPayeeStore: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/GetPayeeListFromPayeeStore',
        getShows: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/GetShows',
        getShowPayment: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/GetShowPayment',
        updateShowPayment: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/UpdateShowPayment',
        addNewShowPayee: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/AddNewShowPayee',
        updateShowPayee: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/UpdateShowPayee',
        addNewShowPayment: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/AddNewShowPayment',
        addNewPayeeToPayeeStore: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/AddNewPayeeToPayeeStore',
        addNewAccountDetailsToPayeeStore: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/AddNewAccountDetailsToPayeeStore',
        getPayeeFromPayeeStore: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/GetPayeeFromPayeeStore',
        deletePayeeFromPayeeStore: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/DeletePayeeFromPayeeStore',
        deleteAccountDetailsFromPayeeStore: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/DeleteAccountDetailsFromPayeeStore',
        deleteShowPayment: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/DeleteShowPayment',
        deleteShowPayee: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/DeleteShowPayee',
        deleteAccountDetailsFromShowPayee: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/DeleteAccountDetailsFromShowPayee',
        addAccountToShowPayee: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/AddAccountToShowPayee',
        updatePayeeInPayeeStore: _$BASE_ADDRESS_ + '/api/admin/ShowPayment/UpdatePayeeInPayeeStore',
        searchPayees: _$BASE_ADDRESS_ + '/api/admin/Search/payees',
        searchPayments: _$BASE_ADDRESS_ + '/api/admin/Search/payments',
        strictSearchPayments: _$BASE_ADDRESS_ + '/api/admin/StrictSearch/payments'
    };
});