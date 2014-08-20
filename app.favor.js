var jsdom = require('jsdom'),
    fs = require('fs');

jsdom.env("http://www.naver.com", ["http://code.jquery.com/jquery.js"], function(errs, window) {
  var $ = window.$;
  
  var $ol = $('ol#realrank');
  $ol.wrap('<ol class="lst_rank"></ol>');
  $ol.find('#lastrank, .tx, .ic, .rk').remove();

  var html = fs.readFileSync('favor.html', 'utf8');
  var $html = $(html);

  console.log($ol.html());
  console.log(html);
  console.log($html.html());

});
