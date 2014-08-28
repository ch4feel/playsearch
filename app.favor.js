var fs = require('fs'),
	http = require('http'),
	express = require('express'),
	socketio = require('socket.io'),
	request = require('request'),
	cheerio = require('cheerio'),
	filepath = '';

var app = express();
var server = http.createServer(app).listen(8080);
var io = socketio.listen(server);

app.use(function(req, res, next){
	var date = new Date();
	console.log('%s %s %s', date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+' '+date.getHours().zf(2)+':'+date.getMinutes().zf(2)+':'+date.getSeconds().zf(2), req.method, req.url);
	next();
});

app.use(express.static(__dirname+'/'));

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
			json.idx = 0;
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
			console.log(json.time + ' init data send.');
		});
	});
});

fs.writeFileSync(filepath+'nohup.out', '', 'utf8');
console.log('Express server listening on port 8080');

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
			if(date.getSeconds() == 0)
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
			console.log(json.time + ' normal data send');

			if (json.type == 'oclock' && json.time) {
				var fsjson = [];

				if(date.getDate() == 1 && date.getHours() == 0 && date.getMinutes() == 0) {
					json.idx = 1;
					fsjson.push(json);
					fs.writeFile(filepath+'favor.json', JSON.stringify(fsjson), 'utf8', function(error){
						if(error)
							console.log(json.time + ' JSON Reset error');
						else
							console.log(json.time + ' JSON Reset');
					});
				} else {
					fs.readFile(filepath+'favor.json', 'utf8', function(err,data){
						fsjson = eval(data);
						json.idx = fsjson.length+1;
						fsjson.push(json);
						fs.writeFile(filepath+'favor.json', JSON.stringify(fsjson), 'utf8', function(error){
							if(error)
								console.log(json.time + ' JSON Write error - ' + error);
							else
								console.log(json.time + ' JSON Writing completed');
						});
					});
				}
			}
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

