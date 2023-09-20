// 问题相关控制器
const dbConfig = require('../database/dbConfig');

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


//-*-*-*-* 下面是接口函数 需要暴露 -*-*-*-*
// 提交问题
const submitQuestion = async (req,res) => {
    const questionInfo = req.body;
    if(!questionInfo.categorie_id){
        questionInfo.categorie_id = 0; // 0代表未指定类型
    }
    try {
        const sql = "INSERT INTO questions (title, discription, excerpt, creator_id, categorie_id, create_time) VALUES (?, ?, ?, ?, ?, NOW())";
        const sqlArr = [questionInfo.title,questionInfo.discription,questionInfo.excerpt,questionInfo.creator_id,questionInfo.categorie_id];
        dbConfig.sqlConnect(sql, sqlArr, (err, data) => {
            if (err) {// 向数据库发送请求出错
                console.log(err);
                res.send({
                    code: '500',
                    msg: '请求数据库出错'
                });
            } else {// 问题提交成功
                res.send({
                    code: '200',
                    msg: '问题提交成功！'
                });
            }
        });
    } catch(err) {
        res.send({
            code: '500',
            msg: '服务器内部错误'
        });
    }
}

// 编辑问题
const editQuestion = async (req,res) => {
    // 获取原始问题信息
    const newQuestionInfo = req.body;
    newQuestionInfo.categorie_id = Number(newQuestionInfo.categorie_id);
    console.log(newQuestionInfo)
    try {
        // 查找对应问题是否存在
        const questionStatus = await(isQuestionExist(newQuestionInfo.id));
        if(questionStatus != 200) { // 问题不存在
            res.send({
                code: '406',
                msg: '问题不存在！'
            });
        } else {
            const sql = "UPDATE questions SET title = ?, discription = ?,  excerpt = ?, categorie_id = ? WHERE id = ?;";
            const sqlArr = [newQuestionInfo.title,newQuestionInfo.discription,newQuestionInfo.excerpt,newQuestionInfo.categorie_id,newQuestionInfo.id];
            dbConfig.sqlConnect(sql, sqlArr, (err, data) => {
                if (err) {// 向数据库发送请求出错
                    console.log(err);
                    res.send({
                        code: '500',
                        msg: '请求数据库出错'
                    });
                } else {// 问题提交成功
                    res.send({
                        code: '200',
                        msg: '问题修改成功！'
                    });
                }
            });
        }
    } catch(err) {
        console.log(err);
        res.send({
            code: '500',
            msg: '服务器内部错误！'
        });
    }

};

module.exports = {
    submitQuestion,
    editQuestion
};