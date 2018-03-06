var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Main holst' });
});

/**
 * POST - запрос на все path
 * @type {*|Function}
 */
router.post('/', function(req, res) {
    var item = req.body.data;
    var items = JSON.parse(item);

    for(var i = 0; i < items.length; i++)
    {
      console.log(items[i]["path"]);
    }

    // console.log(items);

    // res.send(item);
});

module.exports = router;
