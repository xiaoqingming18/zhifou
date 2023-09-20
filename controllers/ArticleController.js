var dbConfig = require('../database/dbConfig');

// 发布文章接口
const publishArticle = (req,res) => {
    try {
        const sql = "INSERT INTO articles (title, content, creator_id) VALUES (?, ?, ?);"
        const sqlArr = [req.body.title,req.body.content,req.body.creator_id];
        console.log(sqlArr);
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
                    msg: '文章发布成功！'
                });
            }
        });
    } catch(err) {
        console.log(err);
        res.send({
            code: '500',
            msg: '服务器内部错误'
        });
    }
}

module.exports = {
    publishArticle,
}