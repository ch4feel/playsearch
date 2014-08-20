var fs = require('fs'),
	request = require('request'),
	cheerio = require('cheerio');

var html = '';

request('http://www.naver.com', function(err, res, body){
	var $html = cheerio.load(body);
	var date = new Date();
	var $ul = cheerio.load('<div class="area_rank"><h2 class="h_time">'+date.getFullYear()+'년'+(date.getMonth()+1)+'월'+date.getDay()+'일 '+date.getHours()+'시'+date.getMinutes()+'분</h2><ol class="lst_rank">' + $html('#realrank').html() + '</ol></div>');
	var fshtml = fs.readFileSync('favor.html', 'utf8');


	$ul('.ic, .tx, .rk, #lastrank').remove();

	var $ = cheerio.load(fshtml);

	$('#wrap').prepend($ul.html());

	fs.writeFileSync('favor.html', $.html(), 'utf8');

});
