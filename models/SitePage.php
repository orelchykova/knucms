<?php

namespace app\models;

use yii\db\ActiveRecord;

class SitePage extends ActiveRecord {

    public function getMenuItem()
    {
        return $this->hasMany(MenuItem::className(), ['site_page_id' => 'page_id']);
    }

    public function getTitleComponents()
    {
        return $this->hasMany(ComponentTitle::className(), ['site_page_id' => 'site_page_id']);
    }

    public function getAllComponents()
    {
        $allComponents = $this->getTitleComponents();
        return $allComponents;
    }

}