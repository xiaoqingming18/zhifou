// 用户相关控制器
const dbConfig = require('../database/dbConfig');

// -*-*-*-*下面是此控制器内所用函数 无需暴露-*-*-*-*
//  1.判断用户是否存在
function isUserExist(username) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE username = ?";
        const sqlArr = [username];
        const callBack = (err, data) => {
            if (err) {
                reject(err);// 请求数据库出错，返回错误信息
            } else {
                if (!data[0]) {
                    resolve(200); // 用户不存在
                } else {
                    resolve(400); // 用户已存在
                }
            }
        }
        // 向数据库发起sql查询请求
        dbConfig.sqlConnect(sql, sqlArr, callBack);
    });
}

// 2.根据username返回用户资料
function returnUserProfile(username) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE username = ?";
        const sqlArr = [username];
        const callBack = (err, data) => {
            if (err) {
                reject(err);// 请求数据库出错，返回错误信息
            } else {
                if (!data[0]) {
                    resolve(400); // 用户不存在
                } else {
                    resolve(data[0]); // 用户已存在
                }
            }
        }
        // 向数据库发起sql查询请求
        dbConfig.sqlConnect(sql, sqlArr, callBack);
    });
}

//-*-*-*-* 下面是接口函数 需要暴露 -*-*-*-*
// 用户注册
const userRegister = async (req, res) => {
    // 接收请求中的用户注册信息
    const userInfo = {
        username: req.query.username,
        password: req.query.password,
        nickname: req.query.nickname,
        avatar_url: req.query.avatar_url,
        email: req.query.email,
        headline: req.query.headline
    };

    // 创建slq查询语句以及参数
    const sql = "INSERT INTO users (username, password, nickname, avatar_url, email, headline, create_time) VALUES (?, ?, ?, ?, ?, ?, NOW())";
    const sqlArr = [userInfo.username, userInfo.password, userInfo.nickname, userInfo.avatar_url, userInfo.email, userInfo.headline];

    // 判断用户名是否已存在并发送sql查询请求
    try {
        const userStatus = await isUserExist(userInfo.username);
        if (userStatus === 200) {// 用户名不存在，可以注册，向数据库发送sql查询请求
            dbConfig.sqlConnect(sql, sqlArr, (err, data) => {
                if (err) {// 向数据库发送请求出错
                    console.log(err);
                    res.send({
                        code: '500',
                        msg: '请求数据库出错'
                    });
                } else {// 注册成功
                    res.send({
                        code: '200',
                        msg: '注册成功'
                    });
                }
            });
        } else {// 用户名已存在，不允许重复注册
            res.send({
                code: '400',
                msg: '用户名已存在'
            });
        }
    } catch (error) {// 服务器错误导致无法判断用户名是否已存在
        res.send({
            code: '500',
            msg: '服务器内部错误'
        });
    }
}

// 用户登录
const userLogin = async (req,res) => {
    // 获取请求体中的登录用户信息
    const userInfo = {
        username: req.query.username,
        password: req.query.password,
    };

    // 定义数据库请求相关参数
    const sql = "SELECT * FROM users WHERE username = ?";
    const sqlArr = [userInfo.username];

    // 判断用户名是否已存在并发送sql查询请求
    try {
        const userStatus = await isUserExist(userInfo.username);
        if(userStatus === 200) {// 用户名不存在，登录失败
            res.send({
                code: '404',
                msg: '用户名不存在'
            });
        } else {// 用户名存在，可以登录，向数据库发送sql查询请求
            dbConfig.sqlConnect(sql, sqlArr, (err, data) => {
                if(data[0].password != userInfo.password) {// 密码错误，登录失败
                    res.send({
                        code: '400',
                        msg: '密码错误'
                    })
                }else {// 密码正确，登录成功
                    res.send({
                        code: '200',
                        msg: '登录成功'
                    })
                }
            })
            
        }
    } catch(error) {
        res.send({
            code: '500',
            msg: '服务器内部错误'
        });
    }

}

// 修改资料
const updateUserProfie = async (req,res) => {
    // 接收用户需要修改的新资料
    const newProfile = req.query;
    try {
        // 获取用户名对应的旧资料
        const oldProfile = await returnUserProfile(newProfile.username);
        // 判断用户名是否存在
        if(oldProfile == 400) {// 用户不存在
            res.send({
                code: '400',
                msg: '用户不存在'
            });
        } else {// 用户存在，发送sql查询请求，提交用户新资料
            // 定义数据库请求相关参数
            const sql = "UPDATE users SET password = ?, nickname = ?,  avatar_url = ?, email = ?, headline = ? WHERE username = ?;";
            const sqlArr = [newProfile.password,newProfile.nickname,newProfile.avatar_url,newProfile.email,newProfile.headline,newProfile.username];
            dbConfig.sqlConnect(sql,sqlArr,(err,data) => {
                if(err) {// 向数据库提交sql出错
                    res.send({
                        code: '500',
                        msg: '向数据库提交sql语句失败！'
                    });
                } else {// 判断sql语句是否成功执行
                    if(data.affectedRows < 1) {// 未成功执行
                        res.send({
                            code: '500',
                            msg: '向数据库提交sql语句失败！'
                        });
                    } else {// 成功执行，用户资料修改成功
                        res.send({
                            code: '200',
                            msg: '修改数据成功！'
                        });
                    }
                }
            });
        }
    } catch(err) {
        res.send(
            {
                code: '500',
                msg: '服务器内部错误'
            }
        );
        console.log(err);
    }
}

module.exports = {
    userRegister,
    userLogin,
    updateUserProfie
}