"use strict";

const mysql = require('mysql');
const express = require('express')
const app = express();
let id = 1;
//设置要连接的数据库服务器和数据库
//连接池
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1111',
    database: 'wechat'
});
app.listen(8000)

app.get('/users', (req, res) => {
    //执行sql语句
    pool.query('SELECT * from chatRecord', function (error, results, fields) {
        if (error) throw error;
        console.log(results);
        res.send(results);
    });
})
app.get('/insert', (req, res) => {
    var post = {
        nickname: "孙权",
        msg: "我也觉得啊\n",
        color: "#000000",
        time: "2018-02-14 11:32:27"
    };
    var query = pool.query('INSERT INTO chatRecord SET ?', post, function (error, results, fields) {
        if (error) throw error;
        // Neat!
        res.send(results);
    });

    console.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'
})
app.get('/users/:id', (req, res) => {
    const id = req.params.id
    pool.query('SELECT * from chatRecord', id, function (error, results, fields) {
        console.log(results);
        if (error) throw error;
        res.send(results);
    });
})



module.exports = {
    record: (post) => {
        // var post = {
        //     nickname: "孙权",
        //     msg: "我也觉得啊\n",
        //     color: "#000000",
        //     time: "2018-02-14 11:32:27"
        // };
        pool.query('INSERT INTO chatRecord SET ?', post, function (error, results, fields) {
            if (error) throw error;
        });
    },
    query: (index, size, recall) => {
        // select * from msg order by id desc limit n ; 
        var index = index || 0;
        var size = size || 1;
        pool.query('SELECT * from chatRecord order by id desc limit '+ index + ","+ size, function (error, results, fields) {
            if (error) throw error;
            console.log(results);
            recall(results)
        });
    }
}