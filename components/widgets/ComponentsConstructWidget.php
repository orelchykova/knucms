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
            $this->renderSeparartor();
            switch ($component) {
                case (isset($component->component_title_id)):
                    $this->renderTitle($component);
                    break;
                case (isset($component->component_subtitle_id)):
                    $this->renderSubTitle($component);
                    break;
                case (isset($component->component_text_id)):
                    $this->renderText($component);
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

    protected function renderSubTitle($title)
    {
        $titleHtml = Html::tag('h4', $title->content, [
            'data-component-type' => 'subtitle',
            'id' => 'subtitle_' . $title->component_subtitle_id,
            'editable-text' => ''
        ]);

        echo $titleHtml;
    }

    protected function renderText($text)
    {
        $html = Html::tag('div', $text->content, [
            'data-component-type' => 'text',
            'id' => 'text_' . $text->component_text_id,
            'editable-text-redactor' => ''
        ]);

        echo $html;
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
