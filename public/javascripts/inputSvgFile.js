function handleFileSelect(evt) {

    var svg_path = URL.createObjectURL(evt.target.files[0]);
    /**
     * Загружаем внешний SVG файл
     */
    d3.xml(svg_path, "image/svg+xml", function(xml) {
        var importedNode = document.importNode(xml.documentElement, true);
        d3.select("div#vis")
            .append("svg")
            .attr("viewBox", "0 0 300 150") // изменяем размер SVG
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

    for(var i = 0; i < paths.length; i++)
    {
        path.push({ "path" : paths[i].getAttribute("d")});
    }

    // console.log(path);

    $.ajax({
        type: 'POST',
        dataType: 'html',
        data: "data=" + JSON.stringify(path),
        success: function (resp) {
            alert(resp);
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










