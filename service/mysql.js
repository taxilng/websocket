"use strict";

const mysql = require('mysql');
//设置要连接的数据库服务器和数据库
//连接池
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1111',
    database: 'wechat'
});

module.exports = {
    record: (post) => {
        pool.query('INSERT INTO chatRecord SET ?', post, function (error, results, fields) {
            if (error) throw error;
        });
    },
    query: (index, size, recall) => {
        var index = index || 0;
        var size = size || 1;
        pool.query('SELECT * from chatRecord order by id desc limit '+ index + ","+ size, function (error, results, fields) {
            if (error) throw error;
            // console.log(results);
            recall(results)
        });
    }
}