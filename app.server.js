var http = require('http'),
    fs = require('fs');
    cr = require('cheerio');
	filepath = '/home/pi/myhome/';		// real path
	//filepath = '';					// dev path

http.createServer(function (req, res) {

	var template = fs.readFileSync(filepath+'template.html','utf8');
	var json = fs.readFileSync(filepath+'favor.json','utf8');

	var $ = cr.load(template);

	$('head').append('<script>json = eval('+json+');</script>');

	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end($.html());

}).listen(8080, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8080/');

