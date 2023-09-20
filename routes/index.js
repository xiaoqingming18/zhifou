var express = require('express');
var router = express.Router();
const answerController = require('../controllers/AnswerController');
const usersController = require('../controllers/UsersController');
const questionController = require ('../controllers/QuestionController');
const articleController = require('../controllers/ArticleController');

// 获取首页推荐回答

// --------用户相关路由-----------------------------------

// 用户注册
router.post('/register',usersController.userRegister);

// 用户登录
router.post('/login',usersController.userLogin);

// 修改用户资料
router.post('/update-user-profile',usersController.updateUserProfie);

// --------回答相关路由-----------------------------------

// 获取首页推荐回答
router.post('/get-recommendAnswer',answerController.getAllRecommendAnswers);

// 获取首页关注用户回答
router.post('/get-followUserAnswer',answerController.getFollowUserAnswers);

// 提交回答
router.post('/submit-answer',answerController.submitAnswer);

// --------问题相关路由-----------------------------------

// 提交问题
router.post('/submit-question',questionController.submitQuestion);

// 修改问题
router.post('/edit-question',questionController.editQuestion);

// --------wenzhang1相关路由-----------------------------------
// 发布文章
router.post('/publish-article',articleController.publishArticle);
module.exports = router;
