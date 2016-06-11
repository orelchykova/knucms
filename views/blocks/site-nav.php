<?php
use yii\widgets\Menu;
use app\models\MenuItem;
?>


<nav class="navbar-inverse navbar">
    <div class="container">
        <div class="navbar-header"><button type="button" class="navbar-toggle"><span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span></button><a class="navbar-brand" logo><?=Yii::$app->controller->logo->content?></a>
        </div>
        <div class="collapse navbar-collapse">
            <?=Menu::widget([
                'options' => ['class' => 'navbar-nav navbar-right nav'],
                'items' => Yii::$app->controller->menuItems,
                'submenuTemplate' => "\n<ul class='sub-menu'>\n{items}\n</ul>\n",
                'encodeLabels' => false,
                'activateParents' => true,]);  ?>
        </div>
    </div>
</nav>