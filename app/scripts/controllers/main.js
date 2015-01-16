'use strict';

/**
 * @ngdoc function
 * @name gridy.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the gridy
 */
angular.module('gridy')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
