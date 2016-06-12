var manageApp = angular.module('manageApp', [
    'manageServices',
    'manageControllers',
    'manageDirectives',
    'ngRoute',
    'textAngular',
    'angularFileUpload'
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
    }])
    .config(function($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain.  Notice the difference between * and **.
            'http://www.youtube.com/**',
            'https://www.youtube.com/**'
        ]);

    });
