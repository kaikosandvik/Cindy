//以下的四列require裡的內容，請確認是否已經用npm裝進node.js
var linebot = require('linebot');
var express = require('express');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

//以下的引號內請輸入申請LineBot取得的各項資料，逗號及引號都不能刪掉
var bot = linebot({
  channelId: '1586338101',
  channelSecret: '9e60b5dab4058c2b2665648c9d8beeae',
  channelAccessToken: 'qSN3YcTHfx3vxESD+qaacqSUkUW+RmoY16kREXiILYrsOk5lXKUpuN7orpaYjFBPtYo205jffGk3q1TnO58hUP/Xepb/jNQ9kYRsYghw3a5qRFjhXcSMun+L55Ol6oWnujlP4yDQxGO1eTdSxQ+ycwdB04t89/1O/w1cDnyilFU='
});

//底下輸入client_secret.json檔案的內容
var myClientSecret={"installed":{"client_id":"999457019361-l3qactc2rq708jplcbu5cd6is0qudnet.apps.googleusercontent.com","project_id":"sylvan-chess-206714","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://accounts.google.com/o/oauth2/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"WAZsKtPd2JS9sWL6l2cgC5cW","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}

var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(myClientSecret.installed.client_id,myClientSecret.installed.client_secret, myClientSecret.installed.redirect_uris[0]);

//底下輸入sheetsapi.json檔案的內容
oauth2Client.credentials ={"access_token":"ya29.GlvZBRotgoP_9BKID8IMFwFTGc6rkI2gamE3F0qNEKfcEcKdpVf_mLPecSBRl-HqpvSKsMCnRgVZWoXp9eNhwfHuZxagJyXolkgBI38S2FbyFgaFG0sfYRM8eNOl","token_type":"Bearer","refresh_token":"1/XzH4IM_3HgBrgbmWpINGboHujdXFvj9LP-7G7IwjGT8","expiry_date":1528904784519}

//試算表的ID，引號不能刪掉
var mySheetId='1zk7x52AfrlhDlWsROWhVPZwU2ppDd31okpf8dACb0hc';

var myQuestions=[];
var users=[];
var totalSteps=0;
var myReplies=[];

//程式啟動後會去讀取試算表內的問題
getQuestions();


//這是讀取問題的函式
function getQuestions() {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
     auth: oauth2Client,
     spreadsheetId: mySheetId,
     range:encodeURI('問題'),
  }, function(err, response) {
     if (err) {
        console.log('讀取問題檔的API產生問題：' + err);
        return;
     }
     var rows = response.values;
     if (rows.length == 0) {
        console.log('No data found.');
     } else {
       myQuestions=rows;
       totalSteps=myQuestions[0].length;
       console.log('要問的問題已下載完畢！');
     }
  });
}

//這是將取得的資料儲存進試算表的函式
function appendMyRow(userId) {
   var request = {
      auth: oauth2Client,
      spreadsheetId: mySheetId,
      range:encodeURI('表單回應 1'),
      insertDataOption: 'INSERT_ROWS',
      valueInputOption: 'RAW',
      resource: {
        "values": [
          users[userId].replies
        ]
      }
   };
   var sheets = google.sheets('v4');
   sheets.spreadsheets.values.append(request, function(err, response) {
      if (err) {
         console.log('The API returned an error: ' + err);
         return;
      }
   });
}

//LineBot收到user的文字訊息時的處理函式
bot.on('message', function(event) {
   if (event.message.type === 'text') {
      var myId=event.source.userId;
      if (users[myId]==undefined){
         users[myId]=[];
         users[myId].userId=myId;
         users[myId].step=-1;
         users[myId].replies=[];
      }
      var myStep=users[myId].step;
      if (myStep===-1)
         sendMessage(event,myQuestions[0][0]);
      else{
         if (myStep==(totalSteps-1))
            sendMessage(event,myQuestions[1][myStep]);
         else
            sendMessage(event,myQuestions[1][myStep]+'\n'+myQuestions[0][myStep+1]);
         users[myId].replies[myStep+1]=event.message.text;
      }
      myStep++;
      users[myId].step=myStep;
      if (myStep>=totalSteps){
         myStep=-1;
         users[myId].step=myStep;
         users[myId].replies[0]=new Date();
         appendMyRow(myId);
      }
   }
});


//這是發送訊息給user的函式
function sendMessage(eve,msg){
   eve.reply(msg).then(function(data) {
      // success 
      return true;
   }).catch(function(error) {
      // error 
      return false;
   });
}


const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});