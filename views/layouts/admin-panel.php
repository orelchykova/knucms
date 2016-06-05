<?php

/* @var $this \yii\web\View */
/* @var $content string */

use yii\helpers\Html;
use yii\bootstrap\Nav;
use yii\bootstrap\NavBar;
use yii\widgets\Breadcrumbs;
use app\assets\AppAsset;

AppAsset::register($this);
?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="<?= Yii::$app->language ?>">
<head>
    <meta charset="<?= Yii::$app->charset ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?= Html::csrfMetaTags() ?>
    <title><?= Html::encode($this->title) ?></title>
    <?php $this->head() ?>
    <link rel="stylesheet" href="http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css">

    <?php
        //$this->registerJsFile('/js/components/trix.js', ['depends' => [\yii\web\JqueryAsset::className()]]);
        $this->registerJsFile('/js/components/angular/angular.min.js', ['depends' => [\yii\web\JqueryAsset::className()]]);
        $this->registerJsFile('/js/components/angular/angular-route.min.js', ['depends' => [\yii\web\JqueryAsset::className()]]);
        $this->registerJsFile('/js/components/angular/angular-resource.min.js', ['depends' => [\yii\web\JqueryAsset::className()]]);

        $this->registerJsFile('/js/components/angular/textAngular-rangy.min.js', ['depends' => [\yii\web\JqueryAsset::className()]]);
        $this->registerJsFile('/js/components/angular/textAngular-sanitize.min.js', ['depends' => [\yii\web\JqueryAsset::className()]]);
        $this->registerJsFile('/js/components/angular/textAngular.min.js', ['depends' => [\yii\web\JqueryAsset::className()]]);
        //$this->registerJsFile('/js/components/angular/angular-trix.js', ['depends' => [\yii\web\JqueryAsset::className()]]);

        $this->registerJsFile('/js/manage/manage-services.js', ['depends' => [\yii\web\JqueryAsset::className()]]);
        $this->registerJsFile('/js/manage/manage-controllers.js', ['depends' => [\yii\web\JqueryAsset::className()]]);
        $this->registerJsFile('/js/manage/manage-directives.js', ['depends' => [\yii\web\JqueryAsset::className()]]);
        $this->registerJsFile('/js/manage/manage-app.js', ['depends' => [\yii\web\JqueryAsset::className()]]);
    ?>

</head>
<body ng-app="manageApp">
<?php $this->beginBody() ?>

<div class="wrap">
    <?php
    NavBar::begin([
        'brandLabel' => 'Administrator',
        'brandUrl' => '/administrator',
        'options' => [
            'class' => 'navbar-inverse',
        ],
    ]);
    echo Nav::widget([
        'options' => ['class' => 'navbar-nav navbar-right'],
        'items' => [
            ['label' => 'Главная', 'url' => '/manage-panel#/'],
            ['label' => 'Конструктор', 'url' => ['manage-panel#/constructor']],
            ['label' => 'Contact', 'url' => ['/site/contact']],
            Yii::$app->user->isGuest ?
                ['label' => 'Login', 'url' => ['/site/login']] :
                [
                    'label' => 'Выход (' . Yii::$app->user->identity->username . ')',
                    'url' => ['/manage/logout'],
                    'linkOptions' => ['data-method' => 'post']
                ],
        ],
    ]);
    NavBar::end();
    ?>

    <div class="container">
        <?= $content ?>
    </div>
</div>


<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
