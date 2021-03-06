var fs = require('fs'),
    http = require('http'),
    express = require('express'),
    socketio = require('socket.io'),
    request = require('request'),
    cheerio = require('cheerio'),
    mongo = require('mongodb').MongoClient;
    filepath = '';

var app = express();
var server = http.createServer(app).listen(8080);
var io = socketio.listen(server);

app.use(function(req, res, next){
    var date = new Date();
    console.log('%s %s %s from %s', date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+' '+date.getHours().zf(2)+':'+date.getMinutes().zf(2)+':'+date.getSeconds().zf(2), req.method, req.url, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    next();
});

app.use(express.static(__dirname+'/'),function(req,res,next){
    res.writeHead(404, {'Content-Type':'text/plain'});
    res.end('Get out!!!');
});

//app.use(express.static(__dirname+'/'));

io.sockets.on('connection', function(socket){
    socket.on('first', function(){
        request('http://www.naver.com', function(err, res, body){
            var $html = cheerio.load(body),
                $ = cheerio.load($html('#realrank').html()),
                date = new Date(),
                json = {};

            $('.ic, .tx, .rk, #lastrank').remove();

            json.time = date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+' '+date.getHours().zf(2)+':'+date.getMinutes().zf(2)+':'+date.getSeconds().zf(2);
            json.type = 'init';
            json.data = [];

            $('li').each(function(){
                json.data.push({
                    rank: $(this).attr('value'),
                    keyword: $(this).find('a').text(),
                    url: $(this).find('a').attr('href'),
                    type: $(this).attr('class')
                });
            })
            socket.emit('init', json);
            //console.log(json.time + ' NAVER init data send.');
        });
        request('http://www.daum.net', function(err, res, body){
            var $html = cheerio.load(body),
                $ = cheerio.load($html('#realTimeSearchWord').html()),
                date = new Date(),
                json = {};

            $('.rank_dummy').remove();

            json.time = date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+' '+date.getHours().zf(2)+':'+date.getMinutes().zf(2)+':'+date.getSeconds().zf(2);
            json.type = 'init';
            json.data = [];

            $('li').each(function(){
                json.data.push({
                    rank: $(this).find('rank_issue').text().replace('위',''),
                    keyword: $(this).find('.txt_issue a').text(),
                    url: $(this).find('.txt_issue a').attr('href'),
                    type: $(this).find('.txt_num').attr('class').replace('img_vert ','').replace('txt_num ','').replace('ico_','')
                });
            });
            socket.emit('init2', json);
            //console.log(json.time + ' DAUM init data send.');
        });
    });
});

var mtimer = setInterval(getRank, 1000);

function getRank(){
    var date = new Date();

    if (date.getSeconds() == 0) {
        request('http://www.naver.com', function(err, res, body){
            var $html = cheerio.load(body),
                $ = cheerio.load($html('#realrank').html()),
                json = {};

            $('.ic, .tx, .rk, #lastrank').remove();

            json.time = date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+' '+date.getHours().zf(2)+':'+date.getMinutes().zf(2)+':'+date.getSeconds().zf(2);
            if(date.getMinutes() == 0)
                json.type = 'oclock';
            else
                json.type = 'normal';
            json.data = [];

            $('li').each(function(){
                json.data.push({
                    rank: $(this).attr('value'),
                    keyword: $(this).find('a').text(),
                    url: $(this).find('a').attr('href'),
                    type: $(this).attr('class')
                });
            })

            io.emit('realrank', json);
            //console.log(json.time + ' NAVER normal data send');

        });
        request('http://www.daum.net', function(err, res, body){
            var $html = cheerio.load(body),
                $ = cheerio.load($html('#realTimeSearchWord').html()),
                json = {};

            $('.rank_dummy').remove();

            json.time = date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+' '+date.getHours().zf(2)+':'+date.getMinutes().zf(2)+':'+date.getSeconds().zf(2);
            if(date.getMinutes() == 0)
                json.type = 'oclock';
            else
                json.type = 'normal';
            json.data = [];

            $('li').each(function(){
                json.data.push({
                    rank: $(this).find('rank_issue').text().replace('위',''),
                    keyword: $(this).find('.txt_issue a').text(),
                    url: $(this).find('.txt_issue a').attr('href'),
                    type: $(this).find('.txt_num').attr('class').replace('img_vert ','').replace('txt_num ','').replace('ico_','')
                });
            });

            io.emit('realrank2', json);
            //console.log(json.time + ' DAUM normal data send');

        });
    }
}

String.prototype.string = function(len){
    var s = '', i = 0;
    while (i++ < len) { s += this; }
    return s;
};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

//fs.writeFileSync(filepath+'nohup.out', '', 'utf8');
var tmp_date = new Date();
console.log('%s %s', tmp_date.getFullYear()+'.'+(tmp_date.getMonth()+1)+'.'+tmp_date.getDate()+' '+tmp_date.getHours().zf(2)+':'+tmp_date.getMinutes().zf(2)+':'+tmp_date.getSeconds().zf(2), 'Express server listening on port 8080');
