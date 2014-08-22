var fs = require('fs'),
	http = require('http'),
	request = require('request'),
	cheerio = require('cheerio'),
	socketio = require('socket.io'),
	filepath = '';

var server = http.createServer(function (req, res) {

	var template = fs.readFileSync(filepath+'template.html','utf8');
	var json = fs.readFileSync(filepath+'favor.json','utf8');

	var $ = cheerio.load(template);

	$('head').append('<script>json = eval('+json+');</script>');

	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end($.html());

}).listen(8080, "127.0.0.1");

fs.writeFileSync(filepath+'nohup.out', '', 'utf8');
console.log('Server is running at port 8080.');

var io = socketio.listen(server);

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
		});
	});
});


var mtimer = setInterval(function(){
	getRank();
}, 1000);

function getRank(){
	var date = new Date();

	if (date.getSeconds()%1 == 0) {
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

			if (json.type == 'oclock' && json.time) {
				var fsjson = [];

				if(date.getDate() == 1 && date.getHours() == 0 && date.getMinutes() == 0) {
					fsjson.push(json);
					fs.writeFile(filepath+'favor.json', JSON.stringify(fsjson), 'utf8', function(error){
						if(error)
							console.log(json.time + ': JSON Reset error');
						else
							console.log(json.time + ': JSON Reset');
					});
				} else {
					fs.readFile(filepath+'favor.json', 'utf8', function(err,data){
						fsjson = eval(data);
						fsjson.push(json);
						fs.writeFile(filepath+'favor.json', JSON.stringify(fsjson), 'utf8', function(error){
							if(error)
								console.log(json.time + ': JSON Write error - ' + error);
							else
								console.log(json.time + ': JSON Writing completed');
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

