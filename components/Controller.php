<?php
namespace app\components;
use app\models\MenuItem;
use app\models\SiteElements;

class Controller extends \yii\web\Controller
{
    public $menuItems;
    public $logo;

    public function init()
    {
        $this->menuItems =  MenuItem::getAllItems();
        $this->logo = SiteElements::find()->where(['type' => 'logo'])->one();
        parent::init();
    }
}
