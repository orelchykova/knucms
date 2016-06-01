<?php
use app\components\widgets\ComponentsConstructWidget;
use app\models\SitePage;

$route = Yii::$app->controller->getRoute();
$page = SitePage::findOne(['view' => $route]);
Yii::$app->view->registerJs('var pageId = '. $page->site_page_id .';',  \yii\web\View::POS_HEAD);
?>
<div class="drag-mode-btn" drag-mode></div>
<?= ComponentsConstructWidget::widget(['components' => $page->allComponents]); ?>
