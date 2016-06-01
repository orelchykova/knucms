<?php
use yii\web\View;
?>

<h1>Конструктор страниц</h1>
<div class="row m-top-36">
    <div class="col-md-12 construct__wrapp">
        <div class="construct__preview preview__menu">
            <div class="preview__controls controls__menu">
                    <i class="material-icons" ng-class="{'hide' : editing}" ng-click="editMenu()">edit</i>
                    <i class="material-icons" ng-class="{'hide' : !editing}" ng-click="addMenuItem()">add</i>
                    <i class="material-icons" ng-class="{'hide' : !editing}" ng-click="editMenu()">done</i>
            </div>
            <div class="error-message"></div>
        </div>
        <div class="construct__preview preview__content">
            <div ng-include="constructPage"></div>
        </div>
    </div>
</div>

<div class="push-bottom"></div>
<?= $this->render('//blocks/components-menu');?>