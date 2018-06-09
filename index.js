var linebot = require('linebot');
var express = require('express');

var bot = linebot({
  channelId: '1586338101',
  channelSecret: '9e60b5dab4058c2b2665648c9d8beeae',
  channelAccessToken: 'qSN3YcTHfx3vxESD+qaacqSUkUW+RmoY16kREXiILYrsOk5lXKUpuN7orpaYjFBPtYo205jffGk3q1TnO58hUP/Xepb/jNQ9kYRsYghw3a5qRFjhXcSMun+L55Ol6oWnujlP4yDQxGO1eTdSxQ+ycwdB04t89/1O/w1cDnyilFU='
});

//這一段的程式是專門處理當有人傳送文字訊息給LineBot時，我們的處理回應
bot.on('message', function(event) {
  if (event.message.type = 'text') {
    var msg = event.message.text;
  //收到文字訊息時，直接把收到的訊息傳回去
    event.reply(msg).then(function(data) {
      // 傳送訊息成功時，可在此寫程式碼 
      console.log(msg);
    }).catch(function(error) {
      // 傳送訊息失敗時，可在此寫程式碼 
      console.log('錯誤產生，錯誤碼：'+error);
    });
  }
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log('192.168.0.18', port);
});