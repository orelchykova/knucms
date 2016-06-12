<?php

namespace app\controllers;

use app\models\ComponentImage;
use app\models\ComponentLink;
use app\models\ComponentSubTitle;
use app\models\ComponentTitle;
use app\models\ComponentText;
use app\models\ComponentVideo;
use app\models\SiteElements;
use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use yii\filters\VerbFilter;
use app\models\MenuItem;
use app\models\SitePage;
use app\models\PageUrl;
use yii\helpers\translitHelper;

class ManageController extends Controller
{
    public $menuItems;

    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'rules' => [
                    [
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ],
        ];
    }

    public function  init()
    {
        $this->layout = 'clear';
    }

    public function actionIndex()
    {
        $this->layout = 'admin-panel';
        return $this->render('/manage/index');
    }

    public function actionStartPage()
    {
        return $this->render('/manage/start-page');
    }

    public function actionConstructor()
    {
        $this->menuItems =  MenuItem::getAllItems();

       // $this->view->registerCssFile('css/manage/manage.css');
        return $this->render('/manage/constructor', ['page' => '//site/index']);
    }

    public function actionUpdateMenu()
    {

        $params = $_GET;
        $menuItems = json_decode($params['editedItems']);

        foreach($menuItems as $newitem) {
            $olditem = MenuItem::findOne($newitem->id);
            $olditem->label = $newitem->newlabel;
            $olditem->save();
        }
        return true;
    }

    public function actionAddToMenu()
    {
        $params = $_GET;
        $menuItems = json_decode($params['createdItems']);
        $classes = [];

        foreach($menuItems as $item) {

            $translitLabel = translitHelper::str2url($item->label);
            $route = 'site/' . $translitLabel;

            if (SitePage::findOne(['view' => $route])) {
                exit();
            }

            //create pretty url for page
            $url = new PageUrl();
            $url->url = '/' . $translitLabel;
            $url->route = $route;
            $url->save();

            //create new page
            $newPage = new SitePage();
            $newPage->view = $route;
            $newPage->page_url_id = $url->page_id;
            $newPage->save();

            $newPageFile = fopen('../views/site/' . $translitLabel . '.php', 'w');
            $newPageTemplate = file_get_contents('../views/templates/new-page-content.php');
            fwrite($newPageFile, $newPageTemplate);
            fclose($newPageFile);

            //create title for new page
            $startTitle = new ComponentTitle();
            $startTitle->content = $item->label;
            $startTitle->position = 0;
            $startTitle->site_page_id = $newPage->site_page_id;
            $startTitle->save();

            //create menu item
            $newItem = new MenuItem();
            $newItem->label = $item->label;
            $newItem->url = '/' . $route;
            $newItem->parent_id = isset($item->parentId) ? $item->parentId : '';
            $newItem->page_id = $newPage->site_page_id;
            $newItem->save();

            //add action to site controller
            $actionTemplate = file_get_contents(dirname(__FILE__) . '/templates/pageAction.php');
            $actionName = translitHelper::urlToActionName($translitLabel);
            $actionTemplate = str_replace('%actionName%', $actionName, $actionTemplate);
            $actionTemplate = str_replace('%viewName%', $translitLabel, $actionTemplate);

            $ctrlCode = file_get_contents(dirname(__FILE__) . '/SiteController.php');
            $lastBracketPos = strrpos($ctrlCode, '}');
            $ctrlCode = substr_replace($ctrlCode, '', $lastBracketPos);
            $ctrlCode = $ctrlCode . "\r\n" . $actionTemplate . "\r\n}";
            file_put_contents(dirname(__FILE__) . '/SiteController.php', $ctrlCode);

            //add class to return
            $classes[$newItem->item_id] = [
                'idClass' => 'mi-id' . $newItem->item_id,
                'itemClass' => '_site_' . $translitLabel . ''
                ];
        }

        header('Content-type: application/json; charset=utf-8');
        echo json_encode($classes, JSON_UNESCAPED_UNICODE);
        exit();
    }

    public function actionDeleteFromMenu()
    {
        $params = $_GET;
        $id = $params['id'];

        $menuItem = MenuItem::findOne($id);
        $pageId = $menuItem->page_id;
        $page = SitePage::findOne($pageId);
        $urlId = $page->page_url_id;
        $url = PageUrl::findOne($urlId);
        $view = $page->view;
        $route = $url->route;

        //delete page components
        foreach ($page->allComponents as $component) {
            $component->delete();
        }

        $menuItem->delete();
        $page->delete();
        $url->delete();

        unlink(dirname(__FILE__) . '/../views/' . $view . '.php');


        $viewName = explode('/', $route)[1];
        $actionTemplate = file_get_contents(dirname(__FILE__) . '/templates/pageAction.php');
        $actionName = translitHelper::urlToActionName($viewName);
        $actionTemplate = str_replace('%actionName%', $actionName, $actionTemplate);
        $actionTemplate = str_replace('%viewName%', $viewName, $actionTemplate);

        $ctrlCode = file_get_contents(dirname(__FILE__) . '/SiteController.php');
        $templateLength = strlen($actionTemplate);
        $templatePos = strrpos($ctrlCode, $actionTemplate);
        $ctrlCode = substr_replace($ctrlCode, '', $templatePos, $templateLength);
        //$ctrlCode = $ctrlCode . "\r\n" . $actionTemplate . "\r\n}";
        file_put_contents(dirname(__FILE__) . '/SiteController.php', $ctrlCode);
    }

    protected function getComponentByType($type, $id)
    {
        switch ($type) {
            case 'title':
                $component = ComponentTitle::findOne($id);
                break;
            case 'subtitle':
                $component = ComponentSubTitle::findOne($id);
                break;
            case 'text':
                $component = ComponentText::findOne($id);
                break;
            case 'link':
                $component = ComponentLink::findOne($id);
                break;
            case 'image':
                $component = ComponentImage::findOne($id);
                break;
            case 'video':
                $component = ComponentVideo::findOne($id);
                break;
            default:
                exit();
        }

        return $component;
    }

    public function actionUpdateComponent()
    {
        $params = $_GET;

        if (!isset($params['id']) || !isset($params['type']))
        {
            exit();
        }

        $id = $params['id'];
        $type = $params['type'];
        unset($params['id']);
        unset($params['type']);

        $component = $this->getComponentByType($type, $id);

        foreach ($params as $paramName=>$paramVal) {
            if (isset($component->$paramName)) {
                $component->$paramName = $paramVal;
            }
        }
        $component->save();
    }

    public function actionCreateComponent()
    {
        $params = $_GET;

        if (!isset($params['type']))
        {
            exit();
        }

        $type = $params['type'];
        unset($params['type']);

        switch ($type) {
            case 'title':
                $component = new ComponentTitle();
                break;
            case 'subtitle':
                $component = new ComponentSubTitle();
                break;
            case 'text':
                $component = new ComponentText();
                break;
            case 'link':
                $component = new ComponentLink();
                break;
            case 'image':
                $component = new ComponentImage();
                break;
            case 'video':
                $component = new ComponentVideo();
                break;
            default:
                exit();
        }
        $idType = 'component_' . $type . '_id';

        foreach ($params as $paramName=>$paramVal) {
            $component->$paramName = $paramVal;
        }
        $component->save();

        $resultId[0] = $component->$idType;
        header('Content-type: application/json; charset=utf-8');
        echo json_encode($resultId, JSON_UNESCAPED_UNICODE);
        exit();
    }

    public function actionDeleteComponent()
    {
        $params = $_GET;

        if (!isset($params['id']) || !isset($params['type']))
        {
            exit();
        }

        $id = $params['id'];
        $type = $params['type'];

        $component = $this->getComponentByType($type, $id);

        $component->delete();
    }

    public function actionSetComponentPosition()
    {
        $params = $_GET;

        if (!isset($params['id']) || !isset($params['type']) || !isset($params['position']))
        {
            exit();
        }

        $id = $params['id'];
        $type = $params['type'];
        $pos = $params['position'];

        $component = $this->getComponentByType($type, $id);

        $component->position = $pos;
        $component->save();
    }

    public function actionUploadImage()
    {
        if (empty( $_FILES )) {
            exit();
        }

        $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];
        $uploadPath = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . '../web/uploads' . DIRECTORY_SEPARATOR . $_FILES[ 'file' ][ 'name' ];
        move_uploaded_file($tempPath, $uploadPath);

        $filePath = '/uploads/' . $_FILES[ 'file' ][ 'name' ];
        echo json_encode($filePath);
    }

    public function actionUpdateSiteElement()
    {
        $params = $_GET;

        if (!isset($params['type']) && !isset($params['content']))
        {
            exit();
        }

        $elem = SiteElements::find()->where(['type' => $params['type']])->one();
        $elem->content = $params['content'];
        $elem->save();
    }

    public function actionLogout()
    {
        Yii::$app->user->logout();
        $this->redirect('/administrator');
    }


}