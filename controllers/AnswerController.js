// 回答相关控制器
var dbConfig = require('../database/dbConfig');

// -*-*-*-*下面是此控制器内所用函数 无需暴露-*-*-*-*
//  1.判断问题是否存在
function isQuestionExist(questionId) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM questions WHERE id = ?";
        const sqlArr = [questionId];
        const callBack = (err, data) => {
            if (err) {
                reject(err);// 请求数据库出错，返回错误信息
            } else {
                if (!data[0]) {
                    resolve(400); // 问题不存在
                } else {
                    resolve(200); // 问题存在
                }
            }
        }
        // 向数据库发起sql查询请求
        dbConfig.sqlConnect(sql, sqlArr, callBack);
    });
}

// 2.判断用户是否已回答某个问题
function isHaveAnswered(userId,questionId) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM answers WHERE creator_id = ? AND question_id = ?";
        const sqlArr = [userId,questionId];
        const callBack = (err, data) => {
            if (err) {
                reject(err);// 请求数据库出错，返回错误信息
            } else {
                console.log("data",data);
                if (!data[0]) {
                    resolve(200); // 用户没有回答过该问题
                } else {
                    resolve(400); // 用户已经回答过该问题
                }
            }
        }
        // 向数据库发起sql查询请求
        dbConfig.sqlConnect(sql, sqlArr, callBack);
    });
}

// 3.获取首页推荐回答的回答id
function getAllRecommendAnswerIds() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT answer_id FROM RecommendAnswers";
        const callBack = (err, data) => {
            if (err) {
                reject(err); // 请求数据库出错，返回错误信息
            } else {
                const answerIds = data.map(row => row.answer_id);
                resolve(answerIds);
            }
        };
        // 向数据库发起sql查询请求
        dbConfig.sqlConnect(sql, [], callBack);
    });
}

// 4.获取回答对应的问题题目
function getQuestionsForIds(idArray) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(idArray) || idArray.length === 0) {
            reject(new Error("question_id数组为空"));
            return;
        }

        // 构建一个形如 "?, ?, ?" 的占位符字符串
        const placeholders = idArray.map(() => "?").join(", ");

        // 构建 SQL 查询
        const sql = `SELECT * FROM questions WHERE id IN (${placeholders})`;

        // 使用 idArray 作为参数
        const sqlArr = idArray;

        // 执行查询
        dbConfig.sqlConnect(sql, sqlArr, (err, data) => {
            if (err) {
                reject(400); // 请求数据库出错，返回错误信息
            } else {
                resolve(data); // 返回查询结果数组
            }
        });
    });
}



//-*-*-*-* 下面是接口函数 需要暴露 -*-*-*-*
// 提交回答
const submitAnswer = async (req,res) => {
    const answerInfo = req.body;
    try {
        const questionStatus = await isQuestionExist(answerInfo.question_id);
        const answerStatus = await isHaveAnswered(answerInfo.creator_id,answerInfo.question_id);
        if(questionStatus != 200) {
            res.send({
                code: '400',
                msg: '问题不存在！'
            });
        } else if(answerStatus != 200) {
            res.send({
                code: '402',
                msg: '用户已回答该问题'
            });
        } else {
            const sql = "INSERT INTO answers (content, excerpt, creator_id, create_time, question_id) VALUES (?, ?, ?, NOW(), ?)";
            const sqlArr = [answerInfo.content,answerInfo.excerpt,answerInfo.creator_id,answerInfo.question_id];
            dbConfig.sqlConnect(sql, sqlArr, (err, data) => {
                if (err) {// 向数据库发送请求出错
                    console.log(err);
                    res.send({
                        code: '500',
                        msg: '请求数据库出错'
                    });
                } else {// 回答提交成功
                    res.send({
                        code: '200',
                        msg: '回答提交成功！'
                    });
                }
            });
        }
    } catch(err) {
        res.send({
            code: '500',
            msg: '服务器内部错误'
        });
    }
}

// 获取首页推荐回答
const getAllRecommendAnswers = async (req,res) => {
    // 返回数据页数相关信息
    const pageInfo = {
        everPageCount: 6, //每页回答数目
        pageCount: 0, //总页数
        currentPage: req.body.currentPage, // 获取当前请求页数
    };   
    console.log(req.body)
    // 先获取首页推荐回答对应的回答id
    const recommendAnswerIds = await getAllRecommendAnswerIds();
    // 构建占位符字符串
    const placeholders = recommendAnswerIds.map(() => "?").join(", ");
    // 构建sql查询参数，通过id获取具体的回答数据
    const sql = `SELECT a.id, a.content, a.excerpt, a.creator_id, a.create_time, q.title AS question_title FROM answers a JOIN questions q ON a.question_id = q.id WHERE a.id IN (${placeholders})`;
    // const sql = `SELECT * FROM answers WHERE id IN (${placeholders})`;
    const sqlArr = recommendAnswerIds;

    const callBack = (err, data) => {
        if (err) {
            console.log(err); // 请求数据库出错，返回错误信息
            res.send({
                code: '500',
                msg: '查询出错'
            });
        } else {
            pageInfo.pageCount = data.length;
            const startIndex = (pageInfo.currentPage - 1) * pageInfo.everPageCount;
            const endIndex = startIndex + pageInfo.everPageCount;
            const returnData = data.slice(startIndex, endIndex);
            if(returnData.length === 0) {
                res.send({
                    code: '400',
                    data: "没有更多数据"
                }); 
            } else {
                res.send({
                    code: '200',
                    data: returnData
                }); 
            }             
        }
    };
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}

// 获取首页关注用户回答
const getFollowUserAnswers = async (req,res) => {
    // 返回数据页数相关信息
    const pageInfo = {
        everPageCount: 6, //每页回答数目
        pageCount: 0, //总页数
        currentPage: req.body.currentPage, // 获取当前请求页数
    };   
    console.log(req.body)
    // 先获取首页推荐回答对应的回答id
    const recommendAnswerIds = await getAllRecommendAnswerIds();
    // 构建占位符字符串
    const placeholders = recommendAnswerIds.map(() => "?").join(", ");
    // 构建sql查询参数，通过id获取具体的回答数据
    const sql = `SELECT a.id, a.content, a.excerpt, a.creator_id, a.create_time, q.title AS question_title FROM answers a JOIN questions q ON a.question_id = q.id WHERE a.id IN (${placeholders})`;
    // const sql = `SELECT * FROM answers WHERE id IN (${placeholders})`;
    const sqlArr = recommendAnswerIds;

    const callBack = (err, data) => {
        if (err) {
            console.log(err); // 请求数据库出错，返回错误信息
            res.send({
                code: '500',
                msg: '查询出错'
            });
        } else {
            pageInfo.pageCount = data.length;
            const startIndex = (pageInfo.currentPage - 1) * pageInfo.everPageCount;
            const endIndex = startIndex + pageInfo.everPageCount;
            const returnData = data.slice(startIndex, endIndex);
            if(returnData.length === 0) {
                res.send({
                    code: '400',
                    data: "没有更多数据"
                }); 
            } else {
                res.send({
                    code: '200',
                    data: returnData
                }); 
            }             
        }
    };
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}

module.exports = {
    submitAnswer,
    getAllRecommendAnswers,
    getFollowUserAnswers
}