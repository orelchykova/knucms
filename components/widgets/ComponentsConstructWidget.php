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
                case (isset($component->component_link_id)):
                    $this->renderLink($component);
                    break;
                case (isset($component->component_image_id)):
                    $this->renderImage($component);
                    break;
                case (isset($component->component_video_id)):
                    $this->renderVideo($component);
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

    protected function renderLink($link)
    {
        $html = Html::tag('a', $link->content, [
            'href' => $link->href,
            'data-component-type' => 'link',
            'id' => 'link_' . $link->component_link_id,
            'editable-text' => ''
        ]);

        echo $html;
    }

    protected function renderImage($img)
    {
        if (empty($img->src)) {
            $img->delete();
            exit();
        }
        $imageHtml = Html::tag('img', '', [
            'src' => $img->src,
            'width' => $img->width,
        ]);

        echo Html::tag('div', $imageHtml, [
            'id' => 'image_' . $img->component_image_id,
            'editable-image' => '',
            'image' => $img->src,
            'class' => $img->classes,
            'data-width' => $img->width,
            'data-component-type' => 'image',
        ]);
    }

    protected function renderVideo($video)
    {
        if (empty($video->link)) {
            $video->delete();
            exit();
        }

        $videoHtml = Html::tag('iframe', '', [
            'width' => '560',
            'height' => '315',
            'src' => $video->link,
            'frameborder' => '0',
            'allowfullscreen' => ''
        ]);

        echo Html::tag('div', $videoHtml, [
            'id' => 'video_' . $video->component_video_id,
            'editable-video' => '',
            'data-component-type' => 'video',
            'link' => $video->link
        ]);
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
