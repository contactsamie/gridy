'use strict';

/**
 * @ngdoc function
 * @name gridy.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the gridy
 */
angular.module('gridy')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
