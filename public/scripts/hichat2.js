/*
 *hichat v0.4.2
 *Wayou Mar 28,2014
 *MIT license
 *view on GitHub:https://github.com/wayou/HiChat
 *see it in action:http://hichat.herokuapp.com/
 */

var HiChat = function() {
    this.socket = null;
};
HiChat.prototype = {
    init: function() {
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function() {
            // document.getElementById('info').textContent = 'get yourself a nickname :)';
            // document.getElementById('nickWrapper').style.display = 'block';
            // document.getElementById('nicknameInput').focus();
            $.get('/username', function(data){
                document.getElementById('nicknameInput').value=data.username;
                // alert(document.getElementById('nicknameInput').value)
                var nickName = document.getElementById('nicknameInput').value;
                that.socket.emit('login2', nickName);
            })
            // document.getElementById('nicknameInput').value=;

        });
        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = '!nickname is taken, choose another pls';
        });
        this.socket.on('loginSuccess2', function() {
            document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper1').style.display = 'none';
            document.getElementById('messageInput1').focus();
        });
        this.socket.on('error', function(err) {
            if (document.getElementById('loginWrapper1').style.display == 'none') {
                document.getElementById('status').textContent = '!fail to connect :(';
            } else {
                document.getElementById('info').textContent = '!fail to connect :(';
            }
        });
        this.socket.on('system2', function(nickName, userCount, type) {
            var msg = nickName + (type == 'login2' ? ' joined' : ' left');
            that._displayNewMsg('system ', msg, 'red');
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
        });
        this.socket.on('newMsg2', function(user, msg, color) {
            that._displayNewMsg(user, msg, color);
        });
        this.socket.on('newImg2', function(user, img, color) {
            that._displayImage(user, img, color);
        });
        // document.getElementById('loginBtn').addEventListener('click', function() {
        //     var nickName = document.getElementById('nicknameInput').value;
        //     if (nickName.trim().length != 0) {
        //         that.socket.emit('login', nickName);
        //     } else {
        //         document.getElementById('nicknameInput').focus();
        //     };
        // }, false);
        // document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
        //     if (e.keyCode == 12) {
        //         var nickName = document.getElementById('nicknameInput').value;
        //         if (nickName.trim().length != 0) {
        //             that.socket.emit('login', nickName);
        //         };
        //     };
        // }, false);
        document.getElementById('sendBtn1').addEventListener('click', function() {
            var messageInput1 = document.getElementById('messageInput1'),
                msg = messageInput1.value,
                color = document.getElementById('colorStyle1').value;
            messageInput1.value = '';
            messageInput1.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg2', msg, color);
                that._displayNewMsg('me', msg, color);
                return;
            };
        }, false);
        document.getElementById('messageInput1').addEventListener('keyup', function(e) {
            var messageInput1 = document.getElementById('messageInput1'),
                msg = messageInput1.value,
                color = document.getElementById('colorStyle1').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput1.value = '';
                that.socket.emit('postMsg2', msg, color);
                that._displayNewMsg('me', msg, color);
            };
        }, false);
        document.getElementById('clearBtn').addEventListener('click', function() {
            document.getElementById('historyMsg1').innerHTML = '';
        }, false);
        document.getElementById('sendImage1').addEventListener('change', function() {
            if (this.files.length != 0) {
                var file = this.files[0],
                    reader = new FileReader(),
                    color = document.getElementById('colorStyle1').value;
                if (!reader) {
                    that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                    this.value = '';
                    return;
                };
                reader.onload = function(e) {
                    this.value = '';
                    that.socket.emit('img2', e.target.result, color);
                    that._displayImage('me', e.target.result, color);
                };
                reader.readAsDataURL(file);
            };
        }, false);
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function(e) {
            var emojiwrapper1 = document.getElementById('emojiWrapper1');
            emojiwrapper1.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function(e) {
            var emojiwrapper1 = document.getElementById('emojiWrapper1');
            if (e.target != emojiwrapper1) {
                emojiwrapper1.style.display = 'none';
            };
        });
        document.getElementById('emojiWrapper1').addEventListener('click', function(e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput1 = document.getElementById('messageInput1');
                messageInput1.focus();
                messageInput1.value = messageInput1.value + '[emoji:' + target.title + ']';
            };
        }, false);
    },
    _initialEmoji: function() {
        var emojiContainer = document.getElementById('emojiWrapper1'),
            docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    },
    _displayNewMsg: function(user, msg, color) {
        var container = document.getElementById('historyMsg1'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8),
            //determine whether the msg contains emoji
            msg = this._showEmoji(msg);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan1">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage: function(user, imgData, color) {
        var container = document.getElementById('historyMsg1'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan1">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _showEmoji: function(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper1').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
            };
        };
        return result;
    }
};
