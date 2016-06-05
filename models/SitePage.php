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

    public function getSubTitleComponents()
    {
        return $this->hasMany(ComponentSubTitle::className(), ['site_page_id' => 'site_page_id']);
    }

    public function getTextComponents()
    {
        return $this->hasMany(ComponentText::className(), ['site_page_id' => 'site_page_id']);
    }

    public function getAllComponents()
    {
        $titles = $this->getTitleComponents()->all();
        $subTitles = $this->getSubTitleComponents()->all();
        $texts = $this->getTextComponents()->all();

        $allComponents = array_merge($titles, $subTitles, $texts);
        return $allComponents;
    }

}