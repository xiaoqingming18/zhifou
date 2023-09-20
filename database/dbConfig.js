const mysql = require('mysql');
module.exports = {
    // 数据库配置
    config: {
        host: '127.0.0.1',
        port: 3306,
        user: 'zhifou',
        password: 't6SHifKxwPTRirdk',
        database: 'zhifou'
    },
    sqlConnect: function(sql,sqlArr,callback) {
        const pool = mysql.createPool(this.config);
        pool.getConnection((err,conn) => {
            console.log("正在连接数据库...");
            if(err) {
                console.log("数据库连接失败！");
                return;
            }
            console.log("正在向数据库发起请求...");
            conn.query(sql,sqlArr,callback);
            console.log("请求结束");
            conn.release();
        });
    },
    testConnect: function() {
        const pool = mysql.createPool(this.config);
        pool.getConnection((err,conn) => {
            console.log("正在连接数据库...");
            if(err) {
                console.log("数据库连接失败！");
                return;
            }
            console.log("数据库连接成功");
        });
    }
}