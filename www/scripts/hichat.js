
window.onload = function () {
    var hichat = new HiChat();
    hichat.init();
};
var HiChat = function () {
    // this.socket = null;
};
HiChat.prototype = {
    lastTime: '',
    init: function () {
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function () {
            document.getElementById('info').textContent = '来个响亮的名字 :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
        this.socket.on('nickExisted', function () {
            document.getElementById('info').textContent = '名字重复啦，换一个吧';
        });
        this.socket.on('loginSuccess', function () {
            document.title = 'WeChat | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';
            document.getElementById('messageInput').focus();
        });
        this.socket.on('error', function (err) {
            if (document.getElementById('loginWrapper').style.display == 'none') {
                document.getElementById('status').textContent = '无法连接 :(';
            } else {
                document.getElementById('info').textContent = '无法连接 :(';
            }
        });
        this.socket.on('system', function (nickName, userCount, type) {
            var msg = nickName + (type == 'login' ? ' 加入聊天室' : ' 离开聊天室');
            that._displayNewMsg('other', '系统消息', msg, 'red');
            document.getElementById('status').textContent = '共 ' + userCount + ' 位在线';
        });
        this.socket.on('newMsg', function (user, msg, color, time) {
            that._displayNewMsg('other', user, msg, color, time);
        });
        this.socket.on('historyMsg', function (dataArr) {
            var reverseArr = dataArr.reverse();
            for (var i = 0; i < reverseArr.length; i++) {
                that._displayNewMsg('other', reverseArr[i].nickname, reverseArr[i].msg, reverseArr[i].color, reverseArr[i].time);
            }

        });
        this.socket.on('newImg', function (user, img, color) {
            that._displayImage(user, img, color);
        });
        var nickname = function () {
            return document.getElementById('nicknameInput').value;
        }
        //改变字体颜色
        document.querySelector('#changeColor').addEventListener('click', function(){
            document.querySelector('#colorStyle').click()
        }, false)
        document.getElementById('loginBtn').addEventListener('click', function () {
            var nickName = document.getElementById('nicknameInput').value;
            if (nickName.trim().length != 0) {
                that.socket.emit('login', nickName);
            } else {
                document.getElementById('nicknameInput').focus();
            };
        }, false);
        document.getElementById('nicknameInput').addEventListener('keyup', function (e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                };
            };
        }, false);
        document.getElementById('sendBtn').addEventListener('click', function () {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', nickname(), msg, color);
                return;
            };
        }, false);
        //获取历史记录
        document.getElementById('getHistoryMsg').addEventListener('click', function () {
            that.socket.emit('gitHistoryMsg');
            return;
        }, false);
        document.getElementById('messageInput').addEventListener('keyup', function (e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', nickname(), msg, color);
            };
        }, false);
        // document.getElementById('clearBtn').addEventListener('click', function() {
        //     document.getElementById('historyMsg').innerHTML = '';
        // }, false);
        document.getElementById('sendImage').addEventListener('change', function () {
            if (this.files.length != 0) {
                var file = this.files[0],
                    reader = new FileReader(),
                    color = document.getElementById('colorStyle').value;
                console.log(file.size / 1024);
                if (!reader) {
                    that._displayNewMsg('other', '系统消息', '您的游览器不支持', 'red');
                    this.value = '';
                    return;
                };
                reader.onload = function (e) {
                    this.value = '';
                    // console.log(this.result);
                    var img = new Image();
                    img.src = this.result;
                    if (file.size / 1024 > 200) {
                        // 图片加载完毕之后进行压缩，然后上传
                        if (img.complete) {
                            callback();
                        } else {
                            img.onload = callback;
                        }
                    } else {
                        that.socket.emit('img', this.result, color);
                        that._displayImage(nickname(), this.result, color);
                    }

                    function callback() {
                        var data = that._compress(img);
                        img = null;
                        that.socket.emit('img', data, color);
                        that._displayImage(nickname(), data, color);
                    }

                };
                reader.readAsDataURL(file);
            };
        }, false);
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function (e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (emojiwrapper.style.display === 'block') {
                emojiwrapper.style.display = 'none'
            } else {
                emojiwrapper.style.display = 'block';
            }
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function (e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });
        document.getElementById('emojiWrapper').addEventListener('click', function (e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            };
        }, false);
    },
    _initialEmoji: function () {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    },
    _displayNewMsg: function (who, user, msg, color, time) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('div'),
            date = time || new Date().toTimeString().substr(0, 8),
            msg = this._showEmoji(msg);
        date = this._formatTime(time)
        
        msgToDisplay.style.color = color || '#000';
        if (who === 'me') {
            msgToDisplay.className = 'me clearfix';
        } else {
            msgToDisplay.className = 'other clearfix';
        }
        if(date.substr(0, 5) === this.lastTime.substr(0,5)){
            msgToDisplay.innerHTML = '<span class="userName">' + user + '</span><span class= "msg">' + msg;
        }else{
            msgToDisplay.innerHTML = '<div class="timespan">' + date + '</div><span class="userName">' + user + '</span><span class= "msg">' + msg;
        }
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
        this.lastTime = date
    },
    _displayImage: function (user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('div'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        setTimeout(function(){
            container.scrollTop = container.scrollHeight;
        }, 0);

    },
    _showEmoji: function (msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />'); //todo:fix this in chrome it will cause a new request for the image
            };
        };
        return result;
    },
    //图片压缩
    _compress: function (img) {
        //    用于压缩图片的canvas
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext('2d');
        //    瓦片canvas
        var tCanvas = document.createElement("canvas");
        var tctx = tCanvas.getContext("2d");
        var maxsize = 100 * 1024;

        var initSize = img.src.length;
        var width = img.width;
        var height = img.height;

        //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
        var ratio;
        if ((ratio = width * height / 4000000) > 1) {
            ratio = Math.sqrt(ratio);
            width /= ratio;
            height /= ratio;
        } else {
            ratio = 1;
        }

        canvas.width = width;
        canvas.height = height;

        //        铺底色
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //如果图片像素大于100万则使用瓦片绘制
        var count;
        if ((count = width * height / 1000000) > 1) {
            count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片

            //            计算每块瓦片的宽和高
            var nw = ~~(width / count);
            var nh = ~~(height / count);

            tCanvas.width = nw;
            tCanvas.height = nh;

            for (var i = 0; i < count; i++) {
                for (var j = 0; j < count; j++) {
                    tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);

                    ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
                }
            }
        } else {
            ctx.drawImage(img, 0, 0, width, height);
        }

        //进行最小压缩
        var ndata = canvas.toDataURL("image/jpeg", 0.1);

        console.log("压缩前：" + initSize);
        console.log("压缩后：" + ndata.length);
        console.log("压缩率：" + ~~(100 * (initSize - ndata.length) / initSize) + "%");

        tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;

        return ndata;
    },
    // 时间展示年月日还是时分秒
    _formatTime: function (time) {
        if (time && new Date().getFullYear() == time.substring(0, 4) && new Date().getMonth() + 1 == time.substring(5, 7) && new Date().getDate() == time.substring(8, 10)) {
            return time.slice(-8)
        } else if (time) {
            return time
        } else {
            return new Date().toTimeString().substr(0, 8)
        }
    }

};