function handleFileSelect(evt) {

    var svg_path = URL.createObjectURL(evt.target.files[0]);
    /**
     * Загружаем внешний SVG файл
     */
    d3.xml(svg_path, "image/svg+xml", function(xml) {
        var importedNode = document.importNode(xml.documentElement, true);
        d3.select("div#vis")
            .append("svg")
            .attr("viewBox", "0 0 1200 1200") // изменяем размер SVG
            .each(function() {
                this.appendChild(importedNode);
            })

        /**
         * Внутри нашего d3.xml вызываем функцию
         */
        getSvgFile(importedNode);
    });
}

function getSvgFile (svg_file) {
    /**
     * Находим нужный тег
     */
    var object = svg_file.lastElementChild.lastElementChild;

    /**
     * Получаем массив всех path
     */
    var paths = object.children;
    var path = [];
    var index = 0;

    for(var i = 0; i < paths.length; i++)
    {

        // "пути-одиночки" (которые не в группе) опускаем
        if(paths[i].children.length == 0) {
            path.push({"path": paths[i].getAttribute("d")});
            path.push({"color": paths[i].getAttribute("fill")});
            path.push({"idColor": index });
            index++;
        }
        // здесь ситуация наоборот
        else {

            var tmp = paths[i].children;

            for (var t = 0; t < tmp.length; t++) {

                if(tmp[t].getAttribute("d") != null){
                    path.push({"path": tmp[t].getAttribute("d")});
                    path.push({"color": tmp[t].getAttribute("fill")});
                    path.push({"idColor": index});
                }
                else {
                    path.push({"polygon": tmp[t].getAttribute("points")});
                    path.push({"color": tmp[t].getAttribute("fill")});
                    path.push({"idColor": index});
                }
            }
            index++;
        }
    }

    // console.log(path);

    $.ajax({
        type: 'POST',
        dataType: 'html',
        data: "data=" + JSON.stringify(path),
        success: function (resp) {
            var target = JSON.parse(resp);
            console.log(JSON.parse(resp));

            var text = "";
            var it = 0;

            // for(var i = 0; i < target.length; i++) {
            //     if(target[i] == null)
            //         continue;
            //     for(var j = 0; j < target[i].length; j++) {
            //         try {
            //             text += "var text" + it + " = document.createElementNS('http://www.w3.org/2000/svg', 'text');\n";
            //             text += "text" + it + ".setAttribute('x', " + target[i][j][0]["x"].x + ");\n";
            //             text += "text" + it + ".setAttribute('y', " + target[i][j][0]["y"].y + ");\n";
            //             text += "text" + it + ".setAttribute('style', 'font-size: 20px;');\n";
            //             text += "text" + it + ".innerHTML = '" + i + "';\n";
            //             text += "var gg" + it + " = svgDocument.getElementById('test');\n";
            //             text += "gg" + it + ".appendChild(text" + it + ");\n";
            //
            //             it++;
            //         }
            //         catch(e) {}
            //     }
            // }
            //
            //
            // document.write(
            //     '<a href="data:text/plain;charset=utf-8,%EF%BB%BF' + encodeURIComponent(text) + '" download="text.txt">text.txt</a>'
            // )

        },
        error: function (xhr, str) {
            alert('Возникла ошибка: ' + xhr.responseCode);
        }
    });
}

/**
 * При имзенении input...
 */
$('body').on('change','#svg_files', function(e){
    e.preventDefault();
    handleFileSelect(e);
});










