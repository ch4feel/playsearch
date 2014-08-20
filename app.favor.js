var fs = require('fs'),
	request = require('request'),
	cheerio = require('cheerio');

request('http://www.naver.com', function(err, res, body){
	var $html = cheerio.load(body);
	var date = new Date();
	var $ul = cheerio.load('<div class="area_rank"><h2 class="h_time">'+date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+'. '+date.getHours()+':'+date.getMinutes()+'</h2><ol class="lst_rank">' + $html('#realrank').html() + '</ol></div>');
	var fshtml = fs.readFileSync('/home/pi/myhome/favor.html', 'utf8');


	$ul('.ic, .tx, .rk, #lastrank').remove();

	var $ = cheerio.load(fshtml);

	$('#wrap').prepend($ul.html());

	fs.writeFileSync('/home/pi/myhome/favor.html', $.html(), 'utf8');

});
