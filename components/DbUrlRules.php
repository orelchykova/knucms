<?php

namespace app\components;

use Yii;
use yii\web\UrlRuleInterface;
use yii\base\Object;
use app\models\PageUrl;


class DbUrlRules extends Object implements UrlRuleInterface
{
    public function parseRequest($manager, $request)
    {
        $url = '/' . urldecode($request->pathInfo);
        $pageurl = PageUrl::findOne(
            ['url' => $url]
        );

        if (!$pageurl) {
            return false;
        }

        $params = [];
        if (!empty($pageurl->params)) {
            $paramsArr = explode('&', $pageurl->params);
            foreach ($paramsArr as $param) {
                $tmpArr = explode('=', $param);
                $params[$tmpArr[0]] = $tmpArr[1];
            }
        }

        return [$pageurl->route, $params];
    }

    public function createUrl($manager, $route, $params)
    {
        $routeParams = [];
        $interfacePageParams = ['route' => $route];
        if (!empty($params)) {
            foreach ($params as $key => $value) {
                    $routeParams[] = $key . '=' . $params[$key];
            }
            $routeParamsString = implode('&', $routeParams);
            $interfacePageParams['params'] = $routeParamsString;
        }

        $interfacePage = PageUrl::findOne(
            $interfacePageParams
        );
        if (!$interfacePage) {
            return false;
        }

        return (string)substr($interfacePage->url, 1);
    }
}