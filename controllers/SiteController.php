<?php

namespace app\controllers;

use Yii;
use yii\filters\AccessControl;

use yii\filters\VerbFilter;
use app\models\LoginForm;
use app\models\ContactForm;
use app\components\Controller;

class SiteController extends Controller
{
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['logout'],
                'rules' => [
                    [
                        'actions' => ['logout'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ],
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'logout' => ['post'],
                ],
            ],
        ];
    }

    public function actions()
    {
        return [
            'error' => [
                'class' => 'yii\web\ErrorAction',
            ],
            'captcha' => [
                'class' => 'yii\captcha\CaptchaAction',
                'fixedVerifyCode' => YII_ENV_TEST ? 'testme' : null,
            ],
        ];
    }




    public function actionIndex()
    {
        return $this->render('index');
    }

    public function actionManage()
    {
        $this->layout = 'clear';
        if (!\Yii::$app->user->isGuest) {
            $this->layout = 'admin-panel';
             return $this->redirect('/manage-panel');
        }

        $model = new LoginForm();
        if ($model->load(Yii::$app->request->post()) && $model->login()) {
            $this->layout = 'admin-panel';
            return $this->redirect('/manage-panel');
        }
        return $this->render('/manage/login', [
            'model' => $model,
        ]);
    }

    public function actionContact()
    {
        $model = new ContactForm();
        if ($model->load(Yii::$app->request->post()) && $model->contact(Yii::$app->params['adminEmail'])) {
            Yii::$app->session->setFlash('contactFormSubmitted');

            return $this->refresh();
        }
        return $this->render('contact', [
            'model' => $model,
        ]);
    }

    public function actionWw()
    {
        return $this->render('ww');
    }


    public function actionPunkt()
    {
        return $this->render('punkt');
    }

    public function actionPod()
    {
        return $this->render('pod');
    }

    public function actionE()
    {
        return $this->render('e');
    }

    public function actionTy()
    {
        return $this->render('ty');
    }
















    public function actionAsx()
    {
        return $this->render('asx');
    }





    public function actionKoko()
    {
        return $this->render('koko');
    }


}