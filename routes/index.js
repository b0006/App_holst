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

    /**
     * @path {Array} - path из аттрибута d
     * @data {Array} - декодированные значения координат, полученные из path
     */
    var path = [];
    var data = [];
    /**
     * @arAbsolutePoints {Array} - абсолютные значения координат X и Y
     * @absoluteX {int} - абсолютное значение X в итерации
     * @absoluteY {int} - абсолютное значение Y в итерации
     */
    var arAbsolutePoints = [];
    var absoluteX = 0;
    var absoluteY = 0;

    for(var i = 0; i < items.length; i++)
    {
        // извлекаем каждый "путь" из аттрибутов d
        path.push(items[i]["path"]);
        // декодируем каждый "путь"
        data.push(paths.decode(path[i]));

        // извлекаем абсолютные значения
        for(var t = 0; t < data[i].length; t++)
        {
            if(data[i][t]["rel"] == false)
            {
                if (typeof data[i][t]['x'] !== "undefined")
                {
                    absoluteX = data[i][t]["x"];
                    absoluteY = data[i][t]["y"];
                    arAbsolutePoints.push({ x: absoluteX, y: absoluteY });
                }
            }
            else
            {
                if(typeof data[i][t]['x'] !== "undefined")
                {
                    try {
                        absoluteX = absoluteX + data[i][t]["x"];
                        absoluteY = absoluteY + data[i][t]["y"];
                        arAbsolutePoints.push({ x: absoluteX, y: absoluteY });
                    }
                    catch(e) {}
                }
            }
        }
    }

    console.log(arAbsolutePoints);

    // res.send(item);
});

module.exports = router;
