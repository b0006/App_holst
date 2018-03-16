'use strict';

var express = require('express');
var router = express.Router();

var paths = require( 'vsvg-paths' );
var earcut = require("earcut");


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
    // var path = [];
    var data = [];
    /**
     * @arAbsolutePoints {Array} - абсолютные значения координат X и Y
     * @absoluteX {int} - абсолютное значение X в итерации
     * @absoluteY {int} - абсолютное значение Y в итерации
     */
    var arAbsolutePoints = [];

    for (var i = 0; i < items.length / 3; i++) {
        arAbsolutePoints.push([]);
    }

    var absoluteX = 0;
    var absoluteY = 0;

    // var trianglesData;
    var trianglesResult = [];
    var triangles = [];

    var arPointsCenters = new Array(items.length / 3);
    var resultCenters = new Array(items.length / 3);

    for (var i = 0, indexData = 0; i < items.length; i = i + 3) {

        arPointsCenters[indexData] = [];
        trianglesResult[indexData] = [];

        // извлекаем каждый "путь" из аттрибутов d
        var path = items[i]["path"];

        // если null, то это polygon, а не path
        if(path != null)
        {
            // декодируем каждый "путь"
            data.push(paths.decode(path));

            // извлекаем абсолютные значения
            for (var t = 0; t < data[indexData].length; t++) {
                if (data[indexData][t]["rel"] == false) {
                    if (typeof data[indexData][t]['x'] !== "undefined") {
                        absoluteX = data[indexData][t]["x"];
                        absoluteY = data[indexData][t]["y"];
                        arAbsolutePoints[indexData].push([absoluteX, absoluteY]);
                    }
                }
                else {
                    if (typeof data[indexData][t]['x'] !== "undefined") {
                        try {
                            absoluteX = absoluteX + data[indexData][t]["x"];
                            absoluteY = absoluteY + data[indexData][t]["y"];
                            arAbsolutePoints[indexData].push([absoluteX, absoluteY]);
                        }
                        catch (e) {
                        }
                    }
                }
            }

            /**
             * ТРИАНГУЛЯЦИЯ
             */

            // ВЫЗЫВАЕМ ФУНКЦИЮ ТРИАНГУЛЯЦИИ
            var trianglesData = earcut.flatten([arAbsolutePoints[indexData]]);
            // ЧЕРЕЗ ЭТУ ФУНКЦИЮ ПОЛУЧАЕМ КООРДИАНТЫ ТОЧЕК ТРЕУГОЛЬНИКОВ в arPointsTriangles
            trianglesResult[indexData] = earcut(trianglesData.vertices, trianglesData.holes, trianglesData.dimensions);

            triangles[indexData] = [];

            for (var u = 0; u < trianglesResult[indexData].length; u++) {
                var index = trianglesResult[indexData][u];
                triangles[indexData].push([trianglesData.vertices[index * trianglesData.dimensions], trianglesData.vertices[index * trianglesData.dimensions + 1]]);
            }

            /**
             * ФОРМИРУЕМ МАССИВ ИЗ КООРДИНАТ ЦЕНТРОВ КАЖДОГО ТРЕУГОЛЬНИКА
             */

            for(var a = 0, b = 1, c = 2, iter = 0; a < triangles[indexData].length; a = a + 3, b = b + 3, c = c + 3, iter++) {
                arPointsCenters[indexData][iter] = [];

                arPointsCenters[indexData][iter].push(
                    { x: getMediumX(
                        triangles[indexData][a][0],
                        triangles[indexData][b][0],
                        triangles[indexData][c][0]
                )});

                arPointsCenters[indexData][iter].push(
                    { y: getMediumY(
                        triangles[indexData][a][1],
                        triangles[indexData][b][1],
                        triangles[indexData][c][1]
                )});

                arPointsCenters[indexData][iter].push(
                    { square: getSquare(
                            triangles[indexData][a][0], triangles[indexData][a][1],
                            triangles[indexData][b][0], triangles[indexData][b][1],
                            triangles[indexData][c][0], triangles[indexData][c][1]
                )});
            }

            var item_i = arPointsCenters[indexData];

            item_i.sort(function (a, b) {
                return b[2].square - a[2].square;
            });

            resultCenters[indexData] = [];
            /**
             * @target_percent - необходимый процент
             * получить процент количества треугольников от числа всех треугольников
             */
            var target_percent = 9;
            var countPercentCenters = Math.round((target_percent * arPointsCenters[indexData].length) / 100);

            for(var m = 0; m < countPercentCenters; m++){
                resultCenters[indexData][m] = [];
                resultCenters[indexData][m].push(
                    {
                        x : arPointsCenters[indexData][m][0],
                        y : arPointsCenters[indexData][m][1],
                        square : arPointsCenters[indexData][m][2]
                    });
            }


            indexData++;
        }
    }

    /***
     * СОРТИРОВКА ПО УБЫВАНИЮ
     */

    for (var i = 0; i < arPointsCenters.length - 1; i++) {
        var item_i = arPointsCenters[i];

        item_i.sort(function (a, b) {
            return b[2].square - a[2].square;
        });
    }
    //
    var resultCenters = new Array((items.length / 3) - 1);

    for(var r = 0; r < arPointsCenters.length - 1; r++)
    {
        resultCenters[r] = [];
        /**
         * @target_percent - необходимый процент
         * получить процент количества треугольников от числа всех треугольников
         */
        var target_percent = 9;
        var countPercentCenters = Math.round((target_percent * arPointsCenters[r].length) / 100);

        if(countPercentCenters < 0) {
            countPercentCenters = 1;
        }

        for(var m = 0; m < 1; m++){

            try {
                resultCenters[r][m] = [];
                resultCenters[r][m].push(
                    {
                        x: arPointsCenters[r][m][0],
                        y: arPointsCenters[r][m][1],
                        square: arPointsCenters[r][m][2]
                    });
            }
            catch(e){}

        }

    }

    // иногда появляются в конце null и на сортировке программа крашится, надо разобраться
    res.send(JSON.stringify(resultCenters));
});

module.exports = router;

function getMediumX(x1, x2, x3) {
    return parseInt((x1 + x2 + x3) / 3);
}

function getMediumY(y1, y2, y3) {
    return  parseInt((y1 + y2 + y3) / 3);
}

function getSquare(x1, y1, x2, y2, x3, y3) {
    var points = [(x1 - x3), (x2 - x3), (y1 - y3), (y2 - y3)];
    return parseInt( ((points[0] * points[3]) - (points[1] * points[2])) / 2);
}
