var fs = require('fs'),
	http = require('http'),
	request = require('request'),
	cheerio = require('cheerio'),
	socketio = require('socket.io');
	filepath = '';

var server = http.createServer(function (req, res) {

	var template = fs.readFileSync(filepath+'template.html','utf8');
	var json = fs.readFileSync(filepath+'favor.json','utf8');

	var $ = cheerio.load(template);

	$('head').append('<script>json = eval('+json+');</script>');

	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end($.html());

}).listen(8080, "127.0.0.1");

console.log('Server running at port 8080');

var io = socketio.listen(server);

console.log('Sockets are on');

var mtimer = setInterval(getRank, 1000);

function getRank(){
	request('http://www.naver.com', function(err, res, body){
		var $html = cheerio.load(body);
		var date = new Date();
		var $ = cheerio.load($html('#realrank').html());
		$('.ic, .tx, .rk, #lastrank').remove();

		var json = {};
		json.time = date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+' '+date.getHours().zf(2)+':'+date.getMinutes().zf(2)+':'+date.getSeconds().zf(2);
		//if(date.getMinutes() == 0 && date.getSeconds() == 0)
		if(date.getSeconds()%10 == 0)
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

		if (json.type == 'oclock') {
			var fsjson = eval(fs.readFileSync(filepath+'favor.json', 'utf8'));
			fsjson.push(json);
			fs.writeFileSync(filepath+'favor.json', JSON.stringify(fsjson), 'utf8');
		} else if(json.type == 'oclock' && date.getHours() == 6) {
			fs.writeFileSync(filepath+'favor.json', '[]', 'utf8');
		}

	});
}
/*
request('http://www.naver.com', function(err, res, body){
	var $html = cheerio.load(body);
	var date = new Date();
	var $ = cheerio.load($html('#realrank').html());
	$('.ic, .tx, .rk, #lastrank').remove();

	var json = {};
	json.time = date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+' '+date.getHours().zf(2)+':'+date.getMinutes().zf(2);
	json.data = [];

	$('li').each(function(){
		json.data.push({
			rank: $(this).attr('value'),
			keyword: $(this).find('a').text(),
			url: $(this).find('a').attr('href'),
			type: $(this).attr('class')
		});
	})

	var fsjson = eval(fs.readFileSync(filepath+'favor.json', 'utf8'));

	fsjson.push(json);

	fs.writeFileSync(filepath+'favor.json', JSON.stringify(fsjson), 'utf8');

});*/

String.prototype.string = function(len){
	var s = '', i = 0;
	while (i++ < len) { s += this; }
	return s;
};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

