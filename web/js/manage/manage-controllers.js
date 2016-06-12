    var manageControllers  = angular.module('manageControllers', []);

manageControllers.controller('constructorCtrl',
    [
        '$scope',
        '$rootScope',
        '$route',
        '$templateCache',
        '$compile',
        'MenuItems',
        function($scope, $rootScope, $route, $templateCache, $compile, MenuItems) {

            var menuItems;
            var closeItem = '<i class="material-icons delete-icon">clear</i>';
            var addItem = '<i class="material-icons add-sub-item">add</i>';
            $rootScope.constructPage = '/';
            $scope.editing = false;

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

            function constructorStart() {
                /* menu start*/
                menuItems = angular.element('.main-menu-item');
                angular.forEach(menuItems, function(item) {
                    var menuitem = angular.element(item);

                    menuitem.find('a').removeAttr('href');
                    menuitem.append(closeItem);
                    if (!menuitem.parent('.sub-menu')[0]) {
                        menuitem.append(addItem);
                    }
                    $compile(menuitem)($scope);
                });
                $('.navbar-nav').on('click', '.main-menu-item', function(event) {
                    var targetElem = $(event.target).closest('.sub-menu')[0],
                        selfElem = $(this).find('.sub-menu')[0],
                        partialView;

                    if (targetElem && selfElem) {
                        return;
                    }

                    partialView = $(this).attr('class').split('_site_')[1];
                    partialView = partialView ? partialView.split(' ')[0] : '';
                    if (!$scope.editing) {
                        var currentPageTemplate = $route.current.templateUrl;
                        $templateCache.removeAll();
                        //$route.reload();
                        $rootScope.constructPage = '/site/' + partialView;
                        $scope.$apply();
                    }
                });

                $('.navbar-nav').on('click', '.delete-icon', function() {
                    $scope.deleteMenuItem($(this).parent());
                });

                $('.navbar-nav').on('click', '.add-sub-item', addSubMenuItem);

                $('.navbar-nav').on('keydown', '.main-menu-item > a', function() {
                    if ($scope.editing) {
                        $(this).parent().addClass('edited-menu-item');
                    }
                });

            }

            $scope.$on('$includeContentLoaded', function() {
                constructorStart();
                function changeVisability(menuitem) {
                    var sub = menuitem.find('.sub-menu');
                    if (sub) {
                        sub.toggleClass('open');
                    }
                }
                $('.navbar-nav > li').hover(
                    function() {
                        changeVisability($(this));
                    }
                );
            });


            $scope.editMenu = function() {
                var errorMsg;
                var errMsgBox = angular.element('.error-message');

                var edited,
                    editedItems,
                    created,
                    createdItems,
                    updating,
                    adding;

                if (!$scope.editing) {
                    $scope.editing = !$scope.editing;
                    angular.forEach(menuItems, function(item) {
                        var menuitem = angular.element(item);
                        menuitem.find('a').attr('contenteditable', 'true');
                        menuitem.find('.delete-icon').css('display', 'block');
                        menuitem.find('.add-sub-item').css('display', 'block');
                    });
                    bindPasteEvent();
                }
                else {
                    menuItems = angular.element('.main-menu-item');
                    angular.forEach(menuItems, function(item) {
                        var menuitem = angular.element(item);
                        var txt = menuitem.find('a').html().trim();
                        if (!txt) {
                            errorMsg = 'Заполните названия всех пунктов меню';
                        }
                    });

                    if (!errorMsg) {
                        // for update edited menu items
                        edited = angular.element('.edited-menu-item:not(.new-menu-item)');
                        editedItems = [];
                        created = angular.element('.new-menu-item');
                        createdItems = [];

                        /* update items name */
                        if (edited.length) {
                            angular.forEach(edited, function (item) {
                                var menuitem = angular.element(item),
                                    edItem = {};

                                edItem.id = menuitem.attr('class').split('mi-id')[1].split(' ')[0];
                                edItem.newlabel = menuitem.find('a').html();
                                editedItems.push(edItem)
                            });

                            updating = MenuItems.update.query({editedItems: JSON.stringify(editedItems)}).$promise.then(function (result) {
                                menuItems = angular.element('.main-menu-item');
                            });
                        }
                        /* update items name  END*/

                        /* add new items */
                        if (created.length) {
                            angular.forEach(created, function (item) {
                                var menuitem = angular.element(item),
                                    newItem = {},
                                    subMenu = menuitem.parent('.sub-menu');

                                newItem.label = menuitem.find('a').html();
                                if (subMenu[0]) {
                                    newItem.parentId = subMenu.closest('.main-menu-item').attr('class').split('mi-id')[1].split(' ')[0];
                                }
                                createdItems.push(newItem);
                            });
                            adding = MenuItems.add.query({createdItems: JSON.stringify(createdItems)}).$promise.then(function (result) {
                                result.forEach(function(newClass, i) {
                                    var newItem = angular.element(created[i]);
                                    newItem
                                        .addClass(newClass.itemClass)
                                        .addClass(newClass.idClass);
                                });
                                menuItems = angular.element('.main-menu-item');
                            });
                        }
                        /* add new items END*/

                        $scope.editing = !$scope.editing;
                        angular.forEach(menuItems, function (item) {
                            var menuitem = angular.element(item);
                            errMsgBox.html('');
                            menuitem.find('a').attr('contenteditable', 'false');
                            menuitem.find('.delete-icon').css('display', 'none');
                            menuitem.find('.add-sub-item').css('display', 'none');
                            menuitem.removeClass('edited-menu-item');
                            menuitem.removeClass('new-menu-item');
                        });

                    }
                    else {
                        errMsgBox.html(errorMsg);
                    }

                }
            };

            function addSubMenuItem() {
                var parentItem =$(this).parent(),
                    subMenu = parentItem.find('.sub-menu'),
                    link,
                    menuItem;

                if (!subMenu[0]) {
                    subMenu = angular.element('<ul class="sub-menu open"></ul>');
                    parentItem.append(subMenu);
                }

                if (subMenu.find('.main-menu-item').length < 8) {
                    subMenu = angular.element(subMenu);
                    link = angular.element('<a contenteditable="true"></a>');
                    // link.append(closeItem);
                    menuItem = angular.element('<li class="main-menu-item new-menu-item"></li>')
                        .append(link)
                        .append(closeItem);
                    subMenu.append(menuItem);
                    link[0].focus();
                }
            }

            $scope.addMenuItem = function() {
                var menuWrapp, link, menuItem;

                if (angular.element('.navbar-nav > .main-menu-item').length < 11) {
                    menuWrapp = angular.element(document.querySelectorAll('.construct__preview .navbar-nav'));
                    link = angular.element('<a contenteditable="true"></a>');
                   // link.append(closeItem);
                    menuItem = angular.element('<li class="main-menu-item new-menu-item"></li>')
                        .append(link)
                        .append(closeItem)
                        .append(addItem);
                    menuWrapp.append(menuItem);
                    link[0].focus();
                    bindPasteEvent();
                }
            };

            $scope.deleteMenuItem = function(elem) {
                var delItem = function() {
                    var id = elem.attr('class').split('mi-id')[1].split(' ')[0];
                    var del = MenuItems.delete.query({id: id}).$promise.then(function(result){
                        elem.remove();
                    });
                };
                openPrompt('Вы уверены что хотите удалить пункт меню?', delItem);
            };

}]);