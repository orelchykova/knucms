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

function bindPasteEvent() {
    $('[contenteditable]').on('paste', function(e) {
        var currentTxt;

        e.stopPropagation();
        e.preventDefault();
        e = e.originalEvent;
        clipboardData = e.clipboardData || window.clipboardData;
        pastedData = clipboardData.getData('Text');

        currentTxt = $(this).html();
        $(this).html(currentTxt + ' ' + pastedData);
    });
}

var manageDirectives = angular.module('manageDirectives', []);

manageDirectives.directive('editableText', [
    'Components',
    '$compile',
    function (Components, $compile) {
        return {
            restrict: 'A',
            transclude: true,
            scope: true,
            template: '<div class="editable-wrapper">' +
                        '<div class="editable-container">' +
                            '<span class="to-edit" ng-transclude ng-keydown="change()"></span>' +
                            '<div class="edit-icons">' +
                            '<i class="material-icons edit-icon" ng-click="edit()" ng-if="!compEditing">edit</i>' +
                            '<i class="material-icons done-icon" ng-click="delete()" ng-if="compEditing">delete</i>' +
                            '<i class="material-icons done-icon" ng-click="done()" ng-if="compEditing">done</i>' +
                            '</div>' +
                        '</div>' +
                      '</div>',
            link: function (scope, element, attrs) {
                var href,
                    linkInput;

                scope.compEditing = false;

                /* for link component*/
                if (attrs.componentType === 'link') {
                    href = element.attr('href');
                    element.removeAttr('href');
                    linkInput = '<div class="href-wrap" ng-show="compEditing">' +
                        '<input ng-keydown="change()" class="href-input" type="text" value="' + href + '"></div>';
                    element.find('.edit-icons').append($compile(linkInput)(scope));
                }

                scope.change = function() {
                    element.find('.to-edit').addClass('edited');
                };

                scope.edit = function() {
                    var toEditElem = element.find('.to-edit');

                    toEditElem.attr('contenteditable', 'true');
                    bindPasteEvent();
                    toEditElem.focus();

                    scope.compEditing = true;
                    element.find('.href-input').val(href);
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
                        id,
                        updateParams;

                    if (element.find('.to-edit').hasClass('edited')) {
                        type = element.data('componentType');
                        id = element.attr('id').split(type + '_')[1];
                        content = element
                                    .find('.to-edit')
                                    .children()
                                    .html();
                        content = content ? content : element.find('.to-edit').html();
                        content = formatText(content);
                        updateParams = {
                            id: id,
                            type: type,
                            content: content
                        };
                        if (attrs.componentType === 'link') {
                            updateParams.href = element.find('.href-input').val();
                            href = updateParams.href;
                        }
                        Components.update.query(updateParams);
                    }
                    toEditElem.attr('contenteditable', 'false');
                    scope.compEditing  = false;
                }
            }
        };
}])

.directive('editableTextRedactor', [
    'Components',
    function (Components) {
        return {
            restrict: 'A',
            transclude: true,
            scope: true,
            template: '<div class="editable-wrapper">' +
                            '<div class="editable-container">' +
                                '<div class="to-edit m-top-16" ng-transclude></div>' +
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
    }])

.directive('editableImage', [
    'Components',
    '$compile',
    'FileUploader',
    function (Components, $compile, FileUploader) {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                image: '@',
                id: '@',
                class: '@'
            },
            template:
            '<div class="editable-wrapper" ng-class="class">' +
                '<div class="editable-container">' +
                    '<div ng-if="!image">' +
                        '<div class="well drop-zone" nv-file-drop="" nv-file-over="" over-class="dragover-img" uploader="uploader">Перетащите изображение </div>' +
                        '<div class="fileUpload btn btn-primary">' +
                            '<span>Загрузить</span>' +
                            '<input type="file" nv-file-select="" uploader="uploader" />' +
                        '</div>' +
                        '<div ng-repeat="item in uploader.queue" class="m-top-16">' +
                            '<div ng-show="uploader.isHTML5" ng-thumb="{ file: item._file, width: imgWidth }"></div>' +
                            '<button type="button" class="btn btn-success btn-xs" ng-click="item.upload()" ng-disabled="item.isReady || item.isUploading || item.isSuccess">' +
                            '<span class="glyphicon glyphicon-upload"></span> Загрузить  </button>' +
                            '<button type="button" class="btn btn-danger btn-xs m-left-16" ng-click="item.remove()">'  +
                            '<span class="glyphicon glyphicon-trash"></span> Удалить' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<img ng-src="{{image}}" ng-if="image" width="{{imgWidthStyle}}">' +
                    '<div class="edit-icons edit-icons-image" ng-if="image">' +
                        '<i class="material-icons edit-icon" ng-click="edit()" ng-if="!compEditing">edit</i>' +
                        '<i class="material-icons done-icon" ng-click="delete()" ng-if="compEditing">delete</i>' +
                        '<i class="material-icons done-icon" ng-click="done()" ng-if="compEditing">done</i>' +
                    '</div>' +
                    '<div class="image-edit-panel" ng-if="compEditing">' +
                        '<i class="material-icons" ng-click="addImgClass(\'align-left\')">format_align_left</i>' +
                        '<i class="material-icons" ng-click="addImgClass(\'align-center\')">format_align_center</i>' +
                        '<i class="material-icons" ng-click="addImgClass(\'align-right\')">format_align_right</i><br><br>' +
                        '<i class="material-icons" ng-click="changeWidth(50)">add_circle_outline</i>' +
                        '<i class="material-icons" ng-click="changeWidth(-50)">remove_circle_outline</i>' +
                    '</div>' +
                '</div>' +
            '</div>',
            link: function (scope, element, attrs) {
                var START_IMG_WIDTH = 300;
                var uploader = scope.uploader = new FileUploader({
                    url: 'manage/upload-image'
                });

                scope.imgWidth = 200;
                scope.compEditing = false;
                scope.imgWidthStyle = element.data('width');

                uploader.filters.push({
                    name: 'imageFilter',
                    fn: function(item, options) {
                        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                    }
                });

                uploader.onSuccessItem = function(item, responce, status, headers) {
                    scope.image = JSON.parse(responce);
                    type = 'image';
                    id = scope.id.split(type + '_')[1];
                    src = scope.image;
                    scope.imgWidthStyle = START_IMG_WIDTH;

                    Components.update.query({
                        type: type,
                        id: id,
                        src: src,
                        width: START_IMG_WIDTH
                    });
                };

                uploader.onAfterAddingFile = function(item) {
                    uploader.queue = [item];
                };

                scope.addImgClass = function(imgNewClass) {
                    var classes = scope.class.split(' '),
                        toFind = 'align',
                        clearClasses = '';

                    classes.forEach(function(imgClass) {
                        if (imgClass.indexOf(toFind) === -1) {
                            clearClasses += imgClass + ' ';
                        }
                    });
                    clearClasses += imgNewClass;

                    scope.class = clearClasses;
                };

                scope.changeWidth = function(dwidth) {
                    if ((scope.imgWidthStyle <= 250 && dwidth < 0) ||
                        (scope.imgWidthStyle >= 1200 && dwidth > 0)){
                        return;
                    }

                        scope.imgWidthStyle += dwidth;
                };

                scope.edit = function() {
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
                    var type,
                        id,
                        width,
                        classes;

                    type = 'image';
                    id = element.attr('id').split(type + '_')[1];
                    classes = scope.class.trim();
                    width = scope.imgWidthStyle;

                    Components.update.query({
                        type: type,
                        id: id,
                        classes: classes,
                        width: width
                    });
                    scope.compEditing  = false;
                }
            }
        };
    }])

.directive('ngThumb', ['$window', function($window) {
    var helper = {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        isFile: function(item) {
            return angular.isObject(item) && item instanceof $window.File;
        },
        isImage: function(file) {
            var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    };

    return {
        restrict: 'A',
        template: '<canvas/>',
        link: function(scope, element, attributes) {
            if (!helper.support) return;

            var params = scope.$eval(attributes.ngThumb);

            if (!helper.isFile(params.file)) return;
            if (!helper.isImage(params.file)) return;

            var canvas = element.find('canvas');
            var reader = new FileReader();

            reader.onload = onLoadFile;
            reader.readAsDataURL(params.file);

            function onLoadFile(event) {
                var img = new Image();
                img.onload = onLoadImage;
                img.src = event.target.result;
            }

            function onLoadImage() {
                var width = params.width || this.width / this.height * params.height;
                var height = params.height || this.height / this.width * params.width;
                    canvas.attr({ width: width, height: height });
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
        };
    }])

.directive('slideBtn', [
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
    }])

.directive('componentCategory', [
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
    }])

.directive('upCategory', [
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
    }])

.directive('componentItem', [
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
    }])

.directive('separatorItem', [ 'Components', '$compile',
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
                        createTitle,
                        createSubTitle,
                        createText,
                        createLink,
                        createImage;

                    createTitle = function(id) {
                        return '<h1 editable-text data-component-type="title" id="title_' + id + '" >Новый заголовок</h1>';
                    };

                    createSubTitle = function(id) {
                        return '<h4 editable-text data-component-type="subtitle" id="subtitle_' + id + '" >Новый подзаголовок</h4>';
                    };

                    createText = function(id) {
                        return '<p editable-text-redactor data-component-type="text" id="text_' + id + '" >Новый текст</p>';
                    };

                    createLink = function(id) {
                        return '<a editable-text href="#" data-component-type="link" id="link_' + id + '" >Новая ссылка</a>';
                    };

                    createImage = function(id) {
                        return '<div editable-image data-component-type="image" class="" id="image_' + id + '" ></div>';
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
                        case 'link':
                            creatingFunc = createLink;
                            params = {
                                content: 'Новая ссылка',
                                href: '#'
                            };
                            break;
                        case 'image':
                            creatingFunc = createImage;
                            params = {

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
    }])

.directive('dragMode', [ 'Components',
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
    }])

.directive('logo', [
        'SiteElements',
        '$compile',
        function (SiteElements, $compile) {
            return {
                restrict: 'A',
                transclude: true,
                scope: true,
                template: '<div class="editable-wrapper">' +
                '<div class="editable-container">' +
                '<span class="to-edit" ng-transclude ng-keydown="change()"></span>' +
                '<div class="edit-icons white-icons">' +
                '<i class="material-icons edit-icon" ng-click="edit()" ng-if="!compEditing">edit</i>' +
                '<i class="material-icons done-icon" ng-click="done()" ng-if="compEditing">done</i>' +
                '</div>' +
                '</div>' +
                '</div>',
                link: function (scope, element, attrs) {
                    var href,
                        linkInput;

                    scope.compEditing = false;

                    /* for link component*/
                    if (attrs.componentType === 'link') {
                        href = element.attr('href');
                        element.removeAttr('href');
                        linkInput = '<div class="href-wrap" ng-show="compEditing">' +
                            '<input ng-keydown="change()" class="href-input" type="text" value="' + href + '"></div>';
                        element.find('.edit-icons').append($compile(linkInput)(scope));
                    }

                    scope.change = function() {
                        element.find('.to-edit').addClass('edited');
                    };

                    scope.edit = function() {
                        var toEditElem = element.find('.to-edit');


                        toEditElem.attr('contenteditable', 'true');
                        bindPasteEvent();
                        toEditElem.focus();

                        scope.compEditing = true;
                        element.find('.href-input').val(href);
                    };

                    scope.done = function() {
                        var toEditElem = element.find('.to-edit'),
                            content,
                            type,
                            id,
                            updateParams;

                        if (element.find('.to-edit').hasClass('edited')) {
                            type = 'logo';
                            content = element
                                .find('.to-edit')
                                .children()
                                .html();
                            content = content ? content : element.find('.to-edit').html();
                            content = formatText(content);
                            SiteElements.update.query({
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