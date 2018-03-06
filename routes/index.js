var express = require('express');
var router = express.Router();

var paths = require( 'vsvg-paths' );

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Main holst' });
});

/**
 * POST - запрос на все path
 * @type {*|Function}
 */
router.post('/', function(req, res) {
    // получаем ответ от клиента
    var item = req.body.data;
    // декодируем JSON-ответ
    var items = JSON.parse(item);

    var path = [];
    var data = [];

    for(var i = 0; i < items.length; i++)
    {
        // извлекаем каждый "путь" из аттрибутов d
        path.push(items[i]["path"]);
        // декодируем каждый "путь"
        data.push(paths.decode(path[i]));
    }

    // res.send(item);
});

module.exports = router;
