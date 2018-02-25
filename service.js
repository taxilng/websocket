const express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    optfile = require('./service/optfile'),
    mysql = require('./service/mysql'),
    users = [];

app.use('/', express.static(__dirname + '/www'))
server.listen(process.env.PORT || 3010, () => console.log('listen to me'))

io.sockets.on('connection', (socket) => {
    //用户登录
    socket.on('login', (nickname) => {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted')
        } else {
            socket.nickname = nickname
            users.push(nickname)
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        }
    })

    //用户离开
    socket.on('disconnect', () => {
        if (socket.nickname != null) {
            users.splice(users.indexOf(socket.nickname), 1)
            socket.broadcast.emit('system', socket.nickname, users.length, 'logout')
        }
    })
    //发送消息
    socket.on('postMsg', (msg, color) => {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color, getTimeNow())
        let getMsg = {
            nickname: socket.nickname,
            msg: msg,
            color: color,
            time: getTimeNow()
        }
        optfile.readFile('./views/one.txt', recall)

        function recall(data) {
            let dataArr = JSON.parse(data || "[]")
            dataArr.unshift(getMsg)
            let dataArrJSON = JSON.stringify(dataArr)
            optfile.writeFile('./views/one.txt', dataArrJSON)
        }

        //存储数据到数据库
        mysql.record(getMsg)

    })
    //历史数据
    socket.on('gitHistoryMsg', () => {
        loadHistoryMsg();
    })
    //获取图片
    socket.on('img', (imgData, color) => {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color)
    })

    function loadHistoryMsg() {
        optfile.readFile('./views/one.txt', recall)

        function recall(data) {
            let dataArr = JSON.parse(data || "[]")
            dataArr = dataArr.slice(0, 10)
            socket.emit('historyMsg', dataArr)
        }
    }
    // 获取当前时间
    function getTimeNow() {
        return new Date(+new Date() + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
    }
    loadHistoryMsg();
})