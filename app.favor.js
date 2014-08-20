var fs = require('fs'),
	request = require('request'),
	cr = require('cheerio');

request('http://www.naver.com', function(err, res, body){
	var $html = cr.load(body);
	var date = new Date();
	var $ = cr.load($html('#realrank').html());
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

	var fsjson = eval(fs.readFileSync('favor.json', 'utf8'));

	fsjson.push(json);

	//console.log(JSON.stringify(fsjson));

	fs.writeFileSync('favor.json', JSON.stringify(fsjson), 'utf8');

});

String.prototype.string = function(len){
	var s = '', i = 0;
	while (i++ < len) { s += this; }
	return s;
};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

