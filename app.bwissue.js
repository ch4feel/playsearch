var fs = require('fs'),
    http = require('http'),
    express = require('express')
    request = require('request'),
    cheerio = require('cheerio');
    filepath = '';

var app = express();
var server = http.createServer(app).listen(8080);

app.use(function(req, res, next){
    var date = new Date();
    console.log('%s %s %s from %s', date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+' '+date.getHours().zf(2)+':'+date.getMinutes().zf(2)+':'+date.getSeconds().zf(2), req.method, req.url, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    next();
});

app.use('/bwissue.json', function(req, res, next){
    request('http://bwissue.com/index.php?mid=timeline&page=1', function(err, re, body){
        var $html = cheerio.load(body),
                $ = cheerio.load($html('.boardList').html()),
                date = new Date(),
                json = {};

        $('.replyNum').remove();

        json.time = date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+' '+date.getHours().zf(2)+':'+date.getMinutes().zf(2)+':'+date.getSeconds().zf(2);
        json.data = [];

        $('.title').each(function(){
            json.data.push({
                keyword: $(this).find('a').text(),
                url: 'http://bwissue.com' + $(this).find('a').attr('href')
            });
        });

        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify(json));
    });
});

app.use(express.static(__dirname+'/'),function(req,res,next){
    res.writeHead(404, {'Content-Type':'text/plain'});
    res.end('Get out!!!');
});

//app.use(express.static(__dirname+'/'));

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
