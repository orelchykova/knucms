<?php

namespace app\components\widgets;

use Yii;
use yii\base\Widget;
use yii\helpers\Html;

class ComponentsConstructWidget extends Widget
{
    public $components = [];

    protected $separatorNum = 0;

    public function run()
    {
        $components = $this->sortComponents($this->components);
        $this->renderComponents($components);
        $this->renderSeparartor();
    }

    protected function sortComponents($components)
    {
        $length = count($components);
        for($i = 0; $i < $length; $i++) {
            for ($j = 0; $j < $length - 1; $j++) {
                if ($components[$j]->position > $components[$j + 1]->position) {
                    $temp = $components[$j];
                    $components[$j] = $components[$j + 1];
                    $components[$j + 1] = $temp;
                }
            }
        }

        return $components;
    }

    protected function renderComponents($components)
    {
        foreach ($components as $component) {
            switch ($component) {
                case (isset($component->component_title_id)):
                    $this->renderSeparartor();
                    $this->renderTitle($component);
                    break;
            }
        }
    }

    protected function renderTitle($title)
    {
        $titleHtml = Html::tag('h1', $title->content, [
            'data-component-type' => 'title',
            'id' => 'title_' . $title->component_title_id,
            'editable-text' => ''
        ]);

        echo $titleHtml;
    }

    protected function renderSeparartor()
    {
        echo Html::tag('div', '', [
            'class' => 'separator',
            'id' => 'separator_' . $this->separatorNum,
            'separator-item' => ''
        ]);
        $this->separatorNum++;
    }
}
