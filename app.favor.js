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
	console.log('%s %s %s', date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+' '+date.getHours().zf(2)+':'+date.getMinutes().zf(2)+':'+date.getSeconds().zf(2), req.method, req.url);
	next();
});

app.use('/favor.json', function(req, res, next){
	mongo.connect('mongodb://127.0.0.1:27017/playsearch', function(err, db) {
		if(err) throw err;

		var collection = db.collection('rank');
		collection.find({}).limit(24).toArray(function(err,result){
            if(err) console.log(err);
			res.writeHead(200, {'Content-Type':'application/json'});
			res.end(JSON.stringify(result));
            db.close();
		});
	})
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
			console.log(json.time + ' normal data send');

			if (json.type == 'oclock' && json.time) {

				mongo.connect('mongodb://127.0.0.1:27017/playsearch', function(err, db) {
					if(err) throw err;

					var collection = db.collection('rank');
					collection.insert(json, function(err, docs) {
						if(err)
							console.log(json.time + ' DB Insert error - ' + err);
						else
							console.log(json.time + ' DB Insert completed');
                        db.close();
					});
				})
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

