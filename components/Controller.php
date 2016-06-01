<?php
namespace app\components;
use app\models\MenuItem;

class Controller extends \yii\web\Controller
{
    public $menuItems;
    public function init()
    {
        $this->menuItems =  MenuItem::getAllItems();
        parent::init();
    }
}
