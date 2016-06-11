var manageServices = angular.module('manageServices', ['ngResource']);

function objToArray(data) {
    var arr = [];
    if (data) {
        data = JSON.parse(data);
        if (data[Object.keys(data)[0]]) {
            for (var id in data) {
                arr.push(data[id]);
            }
        }
    }
    return arr;
}

manageServices.factory('MenuItems', ['$resource',
    function($resource) {
        return {
            update: $resource(
                '/manage/update-menu',
                {}, {
                    query: {
                        method: 'GET',
                        params: {
                            'editedItems': '@editedItems'
                        }
                    }
                }),
            add: $resource(
                '/manage/add-to-menu',
                {}, {
                    query: {
                        method: 'GET',
                        params: {
                            'createdItems': '@createdItems'
                        },
                        isArray: true,
                        transformResponse: objToArray
                    }
                }),
            delete: $resource(
                '/manage/delete-from-menu',
                {}, {
                    query: {
                        method: 'GET',
                        params: {
                            'id': '@id'
                        }
                    }
                })

        }
    }
]);

manageServices.factory('Components', [
    '$resource',
    function($resource) {
        return {
            update: $resource(
                'manage/update-component',
                {
                    query: {
                        method: 'GET',
                        params: {
                            'id': '@id',
                            'type': '@type',
                            'content': '@content'
                        }
                    }
                }),
            create: $resource(
                'manage/create-component',
                {},
                {
                    query: {
                        method: 'GET',
                        isArray: true,
                        params: {
                            'type': '@type',
                            'site_page_id': '@site_page_id'
                        }
                    }
                }),
            delete: $resource(
                'manage/delete-component',
                {
                    query: {
                        method: 'GET',
                        params: {
                            'id': '@id',
                            'type': '@type'
                        }
                    }
                }),
            setPosition: $resource(
                'manage/set-component-position',
                {
                    query: {
                        method: 'GET',
                        params: {
                            'id': '@id',
                            'type': '@type',
                            'position': '@position'
                        }
                    }
                })
        }
    }
]);

manageServices.factory('SiteElements', [
    '$resource',
    function($resource) {
        return {
            update: $resource(
                'manage/update-site-element',
                {
                    query: {
                        method: 'GET',
                        params: {
                            'type': '@type',
                            'content': '@content'
                        }
                    }
                })
        }
    }
]);
