var manageApp = angular.module('manageApp', [
    'manageServices',
    'manageControllers',
    'manageDirectives',
    'ngRoute',
    'textAngular'
]);

manageApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/', {
               templateUrl: '/manage/start-page'
            }).
            when('/constructor', {
                templateUrl: '/manage/constructor',
                controller: 'constructorCtrl'
            }).
            otherwise({
                templateUrl: '/manage/start-page'
            });
    }]);
