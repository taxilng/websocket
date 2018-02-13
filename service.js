const express = require('express'),
        app = express(),
        server = require('http').createServer(app),
        io = require('socket.io').listen(server),
        users = [];

app.use('/', express.static(__dirname + '/www'))
server.listen(process.env.PORT || 3010, () => console.log('listen to me: ' + process.env.PORT))

io.sockets.on('connection', (socket) => {
    //用户登录
    socket.on('login', (nickname) => {
        if(users.indexOf(nickname) > -1){
            socket.emit('nickExisted')
        } else{
            socket.nickname = nickname
            users.push(nickname)
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        }
    })

    //用户离开
    socket.on('disconnect', ()=>{
        if(socket.nickname != null){
            users.splice(users.indexOf(socket.nickname), 1)
            socket.broadcast.emit('system', socket.nickname, users.length, 'logout')
        }
    })
    //发送消息
    socket.on('postMsg', (msg, color) => {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color)
    })
    //获取图片
    socket.on('img', (imgData, color)=>{
        socket.broadcast.emit('newImg', socket.nickname, imgData, color)
        
    })
})