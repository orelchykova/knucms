<?php

namespace app\models;

use yii\db\ActiveRecord;
use yii\helpers\Url;

class MenuItem extends ActiveRecord
{

    public function getPageUrl()
    {
        return $this->hasOne(SitePage::className(), ['page_id' => 'page_id']);
    }

    public static function getSubItems($id)
    {
        $item =  MenuItem::findAll(
            ['parent_id' => $id]
        );
        return $item;
    }

    public static function getAllItems()
    {
        $menuItems  = MenuItem::find()->where(['parent_id' => ''])->all();
        $items = [];
        foreach($menuItems as $item):
            $tmpitem = [
                'label' => $item->label,
                'url' => Url::to([$item->url]),
                'options' => ['class' => 'main-menu-item ' . str_replace('/', '_', $item->url) . ' ' . 'mi-id' . $item->item_id]
            ];
            $subitems = MenuItem::getSubItems($item->item_id);
            if ($subitems) {
                $tmpitem['template'] = '<a href="{url}" class="with-submenu">{label}</a><i class="material-icons dropdown-icon">expand_more</i>';
                $tmpitem['items'] = [];
                foreach($subitems as $subitem):
                    $tmpsubitem = [
                        'label' => $subitem->label,
                        'url' => [$subitem->url],
                        'options' => ['class' => 'main-menu-item ' . str_replace('/', '_', $subitem->url) . ' ' . 'mi-id' . $subitem->item_id]
                    ];
                    array_push($tmpitem['items'], $tmpsubitem);
                endforeach;
            }
            array_push($items, $tmpitem);
        endforeach;
        return $items;
    }

}