function formatText(text) {
    return $('<div/>').html(text).text().trim();
}

function recalcPositions(Components) {
    var separators = angular.element('.separator'),
        components = angular.element('[data-component-type]');

    angular.forEach(separators, function(separator, index) {
        separator = angular.element(separator);
        separator.attr('id', 'separator_' + index);
    });

    angular.forEach(components, function(component, index) {
        var type,
            id;

        component = angular.element(component);
        type = component.data('componentType');
        id = component.attr('id').split(type + '_')[1];
        position = component.prev().attr('id').split('separator_')[1];

        Components.setPosition.query({
            id: id,
            type: type,
            position: position
        })
    });
}

function setSeparatorStyle(add) {
    var separators = angular.element('.separator');

    angular.forEach(separators, function(separator, index) {
        separator = angular.element(separator);
        add ? separator.addClass('active')
            : separator.removeClass('active')
    });
}


var manageDirectives = angular.module('manageDirectives', []);

manageDirectives.directive('editableText', [
    'Components',
    function (Components) {
        return {
            restrict: 'A',
            transclude: true,
            scope: true,
            template: '<div class="editable-wrapper">' +
                        '<div class="editable-container">' +
                            '<span class="to-edit" ng-transclude ng-keydown="change()"></span>' +
                            '<div class="edit-icons">' +
                            '<i class="material-icons edit-icon" ng-click="edit()" ng-if="!compEditing">edit</i>' +
                            '<i class="material-icons done-icon" ng-click="delete()" ng-if="compEditing ">delete</i>' +
                            '<i class="material-icons done-icon" ng-click="done()" ng-if="compEditing ">done</i>' +
                            '</div>' +
                        '</div>' +
                      '</div>',
            link: function (scope, element, attrs) {
                scope.compEditing = false;

                scope.change = function() {
                    element.find('.to-edit').addClass('edited');
                };

                scope.edit = function() {
                    var toEditElem = element.find('.to-edit');

                    toEditElem.attr('contenteditable', 'true');
                    toEditElem.focus();

                    scope.compEditing = true;
                };

                scope.delete = function() {
                    var delItem = function() {
                        var type = element.data('componentType'),
                            id = element.attr('id').split(type + '_')[1],
                            deleting;

                        deleting = Components.delete.query({
                            id: id,
                            type: type
                        })
                            .$promise
                            .then(function(result) {
                                element.next().remove();
                                element.remove();
                                recalcPositions(Components);
                            });
                    };
                    openPrompt('Вы уверены что хотите удалить компонент?', delItem);
                };

                scope.done = function() {
                    var toEditElem = element.find('.to-edit'),
                        content,
                        type,
                        id;

                    if (element.find('.to-edit').hasClass('edited')) {
                        type = element.data('componentType');
                        id = element.attr('id').split(type + '_')[1];
                        content = element
                                    .find('.to-edit')
                                    .children()
                                    .html();
                        content = content ? content : element.find('.to-edit').html();
                        content = formatText(content);

                        Components.update.query(
                            {
                                id: id,
                                type: type,
                                content: content
                            });
                    }
                    toEditElem.attr('contenteditable', 'false');
                    scope.compEditing  = false;
                }
            }
        };
}]);

manageDirectives.directive('editableTextRedactor', [
    'Components',
    function (Components) {
        return {
            restrict: 'A',
            transclude: true,
            scope: true,
            template: '<div class="editable-wrapper">' +
                            '<div class="editable-container">' +
                                '<div class="to-edit" ng-transclude></div>' +
                                '<div class="edit-icons">' +
                                    '<i class="material-icons edit-icon" ng-click="edit()" ng-if="!compEditing">edit</i>' +
                                    '<i class="material-icons done-icon" ng-click="delete()" ng-if="compEditing ">delete</i>' +
                                    '<i class="material-icons done-icon" ng-click="done()" ng-if="compEditing ">done</i>' +
                                '</div>' +
                            '</div>' +
                            '<div class="editor-wrapper" ng-class="{\'open\' : compEditing}">' +
                                '<div text-angular ng-model="redactorContent"></div>' +
                            '</div>' +
                        '</div>',
            link: function (scope, element, attrs) {
                var startContent = element.find('.to-edit')
                                    .html();

                scope.compEditing = false;
                scope.redactorContent = startContent;

                scope.edit = function() {
                    //var toEditElem = element.find('.to-edit');
                    scope.compEditing = true;
                };

                scope.delete = function() {
                    var delItem = function() {
                        var type = element.data('componentType'),
                            id = element.attr('id').split(type + '_')[1],
                            deleting;

                        deleting = Components.delete.query({
                            id: id,
                            type: type
                        })
                            .$promise
                            .then(function(result) {
                                element.next().remove();
                                element.remove();
                                recalcPositions(Components);
                            });
                    };
                    openPrompt('Вы уверены что хотите удалить компонент?', delItem);
                };

                scope.done = function() {
                    var toEditElem = element.find('.to-edit'),
                        content,
                        type,
                        id;


                    type = element.data('componentType');
                    id = element.attr('id').split(type + '_')[1];
                    content = scope.redactorContent;

                    element.find('.to-edit').html(content);
                    Components.update.query(
                        {
                            id: id,
                            type: type,
                            content: content
                        });

                    scope.compEditing  = false;
                }
            }
        };
    }]);

manageDirectives.directive('slideBtn', [
    function () {
        return {
            restrict: 'A',
            transclude: true,
            scope: true,
            template: '<i class="material-icons">keyboard_arrow_up</i>',
            link: function (scope, element, attrs) {
                element.bind('click', function () {
                    element.parent().toggleClass('open');
                });
            }
        };
    }]);

manageDirectives.directive('componentCategory', [
    function () {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                text: '@',
                icon: '@'
            },
            template: '<i class="material-icons">{{icon}}</i><span>{{text}}</span>',
            link: function (scope, element, attrs) {
                element.bind('click', function () {
                    var categories = angular.element('.component-items > .component-category');

                    categories.addClass('hide');
                    element.next().addClass('show');
                });
            }
        };
    }]);

manageDirectives.directive('upCategory', [
    function () {
        return {
            restrict: 'A',
            scope: true,
            link: function (scope, element, attrs) {
                element.bind('click', function () {
                    var categories = angular.element('.component-items > .component-category');

                    categories.removeClass('hide');
                    element.parent().removeClass('show');
                });
            }
        };
    }]);

manageDirectives.directive('componentItem', [
    function () {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                text: '@',
                icon: '@',
                type: '@'
            },
            template: '<i class="material-icons">{{icon}}</i><span>{{text}}</span>',
            link: function (scope, element, attrs) {
                element.attr('draggable', 'true');
                element.bind('dragstart', function (event) {
                    event = event.originalEvent;
                    setSeparatorStyle(true);
                    event.dataTransfer.setData("Type", element.data('type'));
                });
                element.bind('dragend', function () {
                    var dragmodeItem = angular.element('#done_drag_mode')[0];

                    setSeparatorStyle(dragmodeItem);
                });
            }
        };
    }]);

manageDirectives.directive('separatorItem', [ 'Components', '$compile',
    function (Components, $compile) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var separartorTempl = '<div class="separator" separator-item></div>';
                var creatingNewComponent = function (type) {
                    var separator,
                        creatingFunc,
                        params,
                        newElem,
                        createTitle;

                    createTitle = function(id) {
                        return '<h1 editable-text data-component-type="title" id="title_' + id + '" >Новый заголовок</h1>';
                    };

                    createSubTitle = function(id) {
                        return '<h4 editable-text data-component-type="subtitle" id="subtitle_' + id + '" >Новый подзаголовок</h4>';
                    };

                    createText = function(id) {
                        return '<p editable-text-redactor data-component-type="text" id="text_' + id + '" >Новый текст</p>';
                    };

                    separator = $(event.target);

                    switch (type) {
                        case 'title':
                            creatingFunc = createTitle;
                            params = {
                                content: 'Новый заголовок'
                            };
                            break;
                        case 'subtitle':
                            creatingFunc = createSubTitle;
                            params = {
                                content: 'Новый подзаголовок'
                            };
                            break;
                        case 'text':
                            creatingFunc = createText;
                            params = {
                                content: 'Новый текст'
                            };
                            break;
                        default:
                            break;
                    }

                    params['type'] = type;
                    params['site_page_id'] = pageId;

                    Components.create.query(params)
                        .$promise
                        .then(function(id){
                            id = id[0];
                            newElem = creatingFunc(id);
                            if (separator.next()[0]) {
                                separator.next().before($compile(newElem + separartorTempl)(scope));
                            } else {
                                separator.parent().append($compile(newElem + separartorTempl)(scope));
                            }
                            recalcPositions(Components);
                            var dragmodeItem = angular.element('#done_drag_mode')[0];

                            setSeparatorStyle(dragmodeItem);
                        });

                };

                element.bind('dragover', function (event) {
                    event.preventDefault();
                    element.addClass('dragover');
                });

                element.bind('dragleave', function () {
                    element.removeClass('dragover');
                });

                element.bind('drop', function (event) {
                    var type,
                        componentId,
                        component;

                    event = event.originalEvent;
                    type = event.dataTransfer.getData('Type');

                    if (type) {
                        creatingNewComponent(type);
                    } else if(event.dataTransfer.getData('ComponentId')) {
                        componentId = event.dataTransfer.getData('ComponentId');
                        component = angular.element('#' + componentId);
                        if (element[0] !== component.next()[0] && element[0] !== component.prev()[0]) {
                            component.next().remove();
                            element.before(component);
                            component.before($compile(separartorTempl)(scope).addClass('active'));
                        }
                    }

                    element.removeClass('dragover');
                });
            }
        };
    }]);

manageDirectives.directive('dragMode', [ 'Components',
    function (Components) {
        return {
            restrict: 'A',
            scope: true,
            template: '<i class="material-icons" ng-if="!dragModeEnable" ng-click="enableDragMode()">open_with</i>' +
                      '<i class="material-icons" id="done_drag_mode" ng-if="dragModeEnable" ng-click="doneDragResult()">done</i>',
            link: function (scope, element, attrs) {
                scope.dragModeEnable = false;

                scope.enableDragMode = function() {
                    var components = angular.element('[data-component-type]');

                    scope.dragModeEnable = true;
                    angular.element('.components-menu').removeClass('open');
                    setSeparatorStyle(true);
                    angular.forEach(components, function(component) {
                        component = angular.element(component);
                        component.attr('draggable', 'true');
                        component.bind('dragstart', function(event) {
                            event = event.originalEvent;
                            component.css('opacity', '0.3');
                            event.dataTransfer.setData('ComponentId', component.attr('id'));
                        });
                        component.bind('dragend', function() {
                            component.css('opacity', '1');
                        });
                    });
                };

                scope.doneDragResult = function() {
                    var components = angular.element('[data-component-type]');

                    scope.dragModeEnable = false;
                    recalcPositions(Components);
                    setSeparatorStyle();
                    angular.forEach(components, function(component) {
                        component = angular.element(component);
                        component.attr('draggable', 'false');
                    });
                }
            }
        };
    }]);