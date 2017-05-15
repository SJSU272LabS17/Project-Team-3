var http = require('http');
var url = require('url');
var fs = require('fs');
var watson = require('watson-developer-cloud');
var client = require('./connection.js');
var moment = require('moment');

var current_date = moment().format("YMMMM Do YYYY, HH:mm:ss.SSS");
var current_time = moment().format("h:mm:ss");

var AWS = require('aws-sdk');
/*AWS.config.update({accessKeyId:"AKIAJYFGMQSSIVNZV2DA",
 secretAccessKey:"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",
 "region":"us-west-2"});;*/
 AWS.config.update({accessKeyId:"AKIA IYWQ UXYQ3 IEH4N3A",
  secretAccessKey:"noG9TI5Tc0l6omz 7ACIi waiOlaxwQbD/jHhGjjlXp",
  "region":"us-west-2"});
  //AWSSecretKey=noG9TI5Tc0l6omz7ACIiwaiOlaxwQD/jHhGjjlXp

var visual_recognition = watson.visual_recognition({
  //api_key: 'c23b8c3f8eb01911834d2c50444f63cea40d56d2',
  //"api_key": "187902a91b81e6327e22fcd1b0366854b7492457",
  "api_key": "124fa79d2f965632f573ab8914f3182680d0aacf",
  version: 'v3',
  version_date: '2016-05-20'
});


var sns = new AWS.SNS();
var sendNotif=function(object){
    var params = {
    Message: 'STRING_VALUE', /* required */
    MessageAttributes: {
      'sampleAlert': {
        DataType: 'String', /* required */
        StringValue: 'Some shit'
      },
      /* '<String>': ... */
    },
    MessageStructure: 'json',
    Message:'{"default":"Some more shit","email":"Something unusual is happening'+object+'"}',
    Subject: 'SmartCams - Be alert!!',
    //TargetArn: 'arn:aws:sns:us-west-2:394476956221:alertQueue',
    TopicArn: 'arn:aws:sns:us-west-2:394476956221:alertQueue'
    };
    sns.publish(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response:Q
    });
}


var server = http.createServer(function(req, res) {
var page = url.parse(req.url).pathname;
console.log(page);

// Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
if (page == '/'){
  console.log("Entered /");
    if (req.method == 'POST') {
            console.log("Entered POST");
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('You\'re at the reception desk. How can I help you?');

            console.log("Waiting a sec");
            setTimeout(function(){
              var params = {
                images_file: fs.createReadStream('/Users/mulumoodi/Downloads/dl.png')
              };

              visual_recognition.detectFaces(params, function(err, res) {
                if (err)
                  console.log(err);
                else{
                  console.log(JSON.stringify(res, null, 2));
                  var jstring=res;//.stringify(res, null, 2);
                  console.log(jstring["images"]);
                    if(jstring["images"][0]["faces"].length){
                      var human_count_val=jstring["images"][0]["faces"].length;
                      console.log(jstring["images"][0]["faces"].length+"ppl found")
                      var obj4=jstring["images"][0]["faces"][0];
                      var obj5=jstring["images"][0]["faces"][0]["age"]["min"];
                      var obj6=jstring["images"][0]["faces"][0]["age"]["max"];
                      var obj7=jstring["images"][0]["faces"][0]["gender"]["gender"];
                      console.log(obj5);
                      console.log(obj6);
                      console.log(obj7);
                      console.log("A "+obj7+" of age "+obj5+"-"+obj6+" found");

                        sendNotif("A " +human_count_val +obj7+" of age "+obj5+"-"+obj6+" found");

                    }
                    client.index({
                      index: 'demographic_index_2',
                      type: 'datetime_score',
                      body: {
                        "current_Time":moment().format("h:mm:ss"),
                        //"current_Date":current_date,
                        "current_Date":moment().format("YMMMM Do YYYY, HH:mm:ss.SSS"),
                        "human_count":human_count_val,
                        "scores":res
                      }
                    },function(err,resp,status) {
                      if(err) {
                        console.log(err);
                      }
                      else {
                        console.log("create",resp);
                      }
                    })
                    //fs.unlinkSync('/Users/mulumoodi/Downloads/dl.png');
                    //console.log("Deletion succesful");
                    if (fs.existsSync('/Users/mulumoodi/Downloads/dl.png')) {
                        console.log('Found file');
                        fs.unlinkSync('/Users/mulumoodi/Downloads/dl.png');
                        //console.log("Deletion succesful");
                    }

                    //fs.unlinkSync('/Users/mulumoodi/Downloads/dl.png');
                    //console.log("Deletion succesful");
                }
                //fs.unlinkSync('/Users/mulumoodi/Downloads/dl.png');
                //console.log("Deletion succesful");

              });

            }, 1000);

            res.write('You\'re at the reception desk. How can I help you?');
            res.end('post received');
        }
      }
});
server.listen(8080);
