/* ProfileWords (c) Anton McConville 2014 */

/* Definitions and globals */

var WARNING_REFRESH = 'Not so fast - nothing to refresh yet - submit a query first!';
var WARNING_RATE_LIMIT = 'You have reached your rate limit. Try again in 15 minutes ...';
var WARNING_INVALID_ID = 'There was no data for that twitter id. Is it an actual id? Please try another';
var WARNING_TWEET = 'Slow down ... there is nothing to upload yet - submit a query first!';

var latestProfileData;
var latestRateData = 15;
var CLOUD_TYPE = 'followers';
var PERSONALITY_PROFILE = false;

var pool = 0;


function watson(state) {
    PERSONALITY_PROFILE = state;
    renderCloud();
    console.log(PERSONALITY_PROFILE);
}

var themes = [
    {
        name: 'Naranja',
        background: '#FFFFFE',
        words: ['#d4806d', '#cbc4ba', '#c2be98', '#e3cb92', '#695d4f'],
        font: 'Varela'
    },
    {
        name: 'Earth',
        background: '#FCFBF8',
        words: ['#F58422', '#FACDA7', '#E47325', '#F4A261', '#F6B989'],
        font: 'Varela'
    },
    {
        name: 'Sueno',
        background: '#FCFBF8',
        words: ['#5C3456', '#6C6263', '#B27F7E', '#A3B1B1', '#A78174'],
        font: 'Varela'
    },
    {
        name: 'Glow',
        background: '#444444',
        words: ['#FF530D', '#E82C0C', '#FF0000', '#E80C7A', '#FF0DFF'],
        font: 'Varela'
    },
    {
        name: 'Frost',
        background: '#FFFFFC',
        words: ['#4B81A5', '#273F5A', '#C6DBF3', '#74A0BF', '#98C4DA'],
        font: 'Varela'
    },
    {
        name: 'Ocean',
        background: '#F7F9F7',
        words: ['#5C8C7E', '#47738c', '#8A9FB0', '#95AA99', '#2f4d57'],
        font: 'Varela'
    },
    {
        name: 'Beach',
        background: '#FCFBF8',
        words: ['#93ADB6', '#b6c6c6 ', '#ec6c52', '#f2b26f', '#ABC5CB'],
        font: 'Varela'
    },
    {
        name: 'Flight',
        background: '#FCFBF8',
        words: ['#DDA26E', '#EACDAD', '#ABC2BD', '#9C8E77', '#CBC4BA'],
        font: 'Varela'
    },
    {
        name: 'Ciruela',
        background: '#FBF6F9',
        words: ['#B37CB5', '#9552A2', '#6E2E7A', '#A895A9', '#773781'],
        font: 'Varela'
    },
    {
        name: 'Broadsheet',
        background: '#FFFFFF',
        words: ['#333333', '#555555', '#777777', '#999999', '#BBBBBB'],
        font: 'Varela'
    },
    {
        name: 'Darksheet',
        background: '#333333',
        words: ['#444444', '#555555', '#777777', '#999999', '#BBBBBB'],
        font: 'Varela'
    }
];


function createThemeList() {

    var dropdown = document.getElementById('dropdownMenu');

    var count = 0;

    themes.forEach(function (theme) {

        var li = document.createElement('li');

        var canvasElement = document.createElement('canvas');
        canvasElement.className = 'themeArea';
        canvasElement.id = theme.name + 'Theme';
        canvasElement.width = '106';
        canvasElement.height = '26';
        canvasElement.style.margin = '5px';

        var spn = document.createElement('span');


        li.appendChild(canvasElement);

        var ctx = canvasElement.getContext("2d");

        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);



        for (var s = 0; s < theme.words.length; s++) {

            var x = 13 + (s * 20);
            swatch(theme.words[s], x, canvasElement);
            canvasElement.style.background = theme.background;

            spn.innerHTML = theme.name;

        }

        li.id = count;

        li.onclick = function (event) {
            selectedTheme = event.srcElement.parentElement.id;
            drawTheme('themeArea');
            refresh();
        };

        count++;

        li.appendChild(spn);

        dropdown.appendChild(li);
    })
}

var selectedTheme = 0;

var spinner;

var MESSAGE_LIMIT = 120;

function drawHelp() {

    var helpElement = document.getElementById("helpInfo");
    var helpContext = helpElement.getContext("2d");

    helpContext.fillStyle = "black";
    helpContext.font = "20pt Ariel";
    helpContext.fillText("Hello World!", 10, 50);

}

function writeTweet() {

    if (latestProfileData) {

        var tweetArea = document.getElementById('tweetarea');
        var idField = document.getElementById('twitterIDfield');

        var content;

        switch (CLOUD_TYPE) {

        case "followers":
            content = 'A word cloud from the profiles of those following @' + idField.value + ' via @ProfileWords';
            break;

        case "following":
            content = 'A word cloud from the profiles of the people @' + idField.value + ' is following via @ProfileWords';
            break;

        case "favorites":
            content = "A word cloud from @" + idField.value + "'s last 25 favorite tweets via @ProfileWords";
            break;

        case "tweets":
            content = "A word cloud from @" + idField.value + "'s last 25 tweets via @ProfileWords";
            break;

        }

        tweetArea.value = content;

        $('#myModal').modal('show');

        var image = createPNG(1 / 6, 100, 100);

        var previewArea = document.getElementById('preview');

        manageTweetArea();

        previewArea.style.background = 'url(' + image + ')';
    } else {
        showWarning(WARNING_TWEET);
    }
}

function submitTweet() {
    console.log('submit tweet');

    var tweetArea = document.getElementById('tweetarea');

    uploadPNG(tweetArea.value);

    $('#myModal').modal('hide');
}

function manageTweetArea(event) {

    var tweetArea = document.getElementById('tweetarea');

    var messageLength = document.getElementById('messageLength');

    var remaining;

    remaining = MESSAGE_LIMIT - tweetArea.value.length;
    messageLength.textContent = remaining;

    if (tweetArea.value.length > 0 && tweetArea.value.length < MESSAGE_LIMIT) {
        messageLength.style.color = '#555';
        $('#tweetButton').prop('disabled', false);
    } else {

        messageLength.style.color = 'red';
        $('#tweetButton').prop('disabled', true);
    }

}

var getParameter = function () {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function (m, key, value) {
            vars[key] = value;
        });
    return vars;
}

function renderCloud() {

    var idField = document.getElementById('twitterIDfield');

    console.log('render: ' + idField.value);

    if (idField.value) {

        var path = '/words/' + idField.value;

        var oauth_token = getParameter()['oauth_token'];

        var parameters;

        if (oauth_token) {
            parameters = 'cloudType=' + CLOUD_TYPE + '&&personality=' + PERSONALITY_PROFILE;
        }


        /* Start a progress spinner */

        var s = document.getElementById('spinner');

        var opts = {
            lines: 9, // The number of lines to draw
            length: 0, // The length of each line
            width: 3, // The line thickness
            radius: 8, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#555', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: 'calc(100% -16px)' // Left position relative to parent
        };

        spinner = new Spinner(opts).spin();
        s.appendChild(spinner.el);


        var xhr = new XMLHttpRequest();

        xhr.open("GET", path, true);
        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var res = JSON.parse(xhr.responseText);

                    if (res.outcome === 'success') {

                        if (res.type === 'cloud') {

                            latestProfileData = res.profiles;

                            pool = res.pool;

                            var wa = document.getElementById("wordle-container");
                            while (wa.firstChild) {
                                wa.removeChild(wa.firstChild);
                            }

                            svg = d3.select("#wordle-container").append("svg").attr("width", w).attr("height", h);

                            background = svg.append("g");
                            visualisation = svg.append("g").attr("transform", "translate(" + [w >> 1, h >> 1] + ")");

                            //                            getAngles();

                            parseProfileData(latestProfileData);
                        } else {
                            drawPersonalityChart(res.profiles);
                        }

                        drawScrollbar(res.budget);
                    } else {

                        if (res.budget === "0") {
                            showError(WARNING_RATE_LIMIT);
                        } else {
                            showWarning(WARNING_INVALID_ID);
                        }
                        drawScrollbar(res.budget);
                    }

                } else {
                    console.error(xhr.statusText);
                }
            }

            spinner.stop();
        };

        //            xhr.setRequestHeader( "oauth_token", oauth_token );
        xhr.setRequestHeader("cloudtype", CLOUD_TYPE);
        xhr.setRequestHeader("personality", PERSONALITY_PROFILE);

        xhr.onerror = function (e) {
            console.error(xhr.statusText);
            showError(WARNING_RATE_LIMIT);
        };
        xhr.send(parameters);
    }
}

function setCloudType(event) {
    CLOUD_TYPE = event;
    renderCloud();
}

function refresh() {
    if (latestProfileData) {
        parseProfileData(latestProfileData);
    } else {
        showWarning(WARNING_REFRESH);
    }
}

document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

function drawScrollbar(remaining) {

    var max = 15;

    var marker = max - remaining;

    var width = 120,
        height = 10,
        val = Math.min(Math.max(marker, 0), max),
        direction = 'horizontal';

    // Draw the background
    ctx.fillStyle = 'white';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, width, height);

    // Draw the fill
    ctx.fillStyle = '#E47325';
    var fillVal = Math.min(Math.max(val / max, 0), 1);
    if (direction === 'vertical') {
        ctx.fillRect(0, 0, width, fillVal * height);
    } else {
        ctx.fillRect(0, 0, fillVal * width, height);
    }
}

drawScrollbar(15);


var sheet = (function () {
    // Create the <style> tag
    var style = document.createElement("style");

    // Add a media (and/or media query) here if you'd like!
    // style.setAttribute("media", "screen")
    // style.setAttribute("media", "@media only screen and (max-width : 1024px)")

    // WebKit hack :(
    style.appendChild(document.createTextNode(""));

    // Add the <style> element to the page
    document.head.appendChild(style);

    return style.sheet;
})();


function swatch(color, x, element) {
    var ctx = element.getContext("2d");
    ctx.beginPath();
    ctx.arc(x, 13, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

var ruleCount = 0;

function drawTheme(element) {

    var c = document.getElementById(element);
    var ctx = c.getContext("2d");

    ctx.clearRect(0, 0, c.width, c.height);

    for (var s = 0; s < themes[selectedTheme].words.length; s++) {
        var x = 13 + (s * 20);
        swatch(themes[selectedTheme].words[s], x, c);
    }

    var body = document.getElementById('wordle-container');
    body.style.background = themes[selectedTheme].background;

    var themeArea = document.getElementById(element);
    themeArea.style.background = themes[selectedTheme].background;

    var body = document.getElementById('body');
    body.style.background = themes[selectedTheme].background;

    var themeName = document.getElementById(element);

    ruleCount++;
}

drawTheme('themeArea');

function nextStyle() {

    var themeCount = themes.length - 1;

    if (selectedTheme < themeCount) {
        selectedTheme = selectedTheme + 1;
    } else {
        selectedTheme = 0;
    }

    drawTheme('themeArea');

    if (latestProfileData) {
        parseProfileData(latestProfileData);
    }
}

function lastStyle() {
    var themeCount = themes.length - 1;

    if (selectedTheme > 0) {
        selectedTheme = selectedTheme - 1;
    } else {
        selectedTheme = themeCount;
    }

    drawTheme('themeArea');

    if (latestProfileData) {
        parseProfileData(latestProfileData);
    }
}


function showError(warning) {
    var warningText = '<div class="alert alert-danger alert-dismissable">' +
        '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
        '<strong>Stop! </strong>' + warning + '</div>';

    var warningArea = document.getElementById('warningArea');

    warningArea.innerHTML = warningText;
}


function showWarning(warning) {
    var warningText = '<div class="alert alert-warning alert-dismissable">' +
        '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
        '<strong>Warning! </strong>' + warning + '</div>';

    var warningArea = document.getElementById('warningArea');

    warningArea.innerHTML = warningText;
}

var fill = d3.scale.category20b();

var words = [],
    max,
    scale = 1,
    complete = 0,
    keyword = "",
    tags,
    fontSize,
    maxLength = 30,
    fetcher,
    statusText = d3.select("#status");

var layout;

d3.select("#download-png").on("click", downloadPNG);

function parseProfileData(data) {
    tags = data;
    tags = tags.sort(function (a, b) {
        return b.value - a.value;
    });
    generate();
}

function generate() {
    layout.font('Varela').spiral('archimedean');
    //    layout.font('love-ya-like-a-sister, fantasy').spiral('archimedean');
    //    layout.font('amatic-sc, sans-serif').spiral('archimedean');

    fontSize = d3.scale['linear']().range([5, 75]);
    if (tags.length) fontSize.domain([+tags[tags.length - 1].value || 1, +tags[0].value]);
    complete = 0;
    statusText.style("display", null);
    words = [];
    layout.stop().words(tags.slice(0, max = 60)).start();
}

function progress(d) {
    statusText.text(++complete + "/" + max);
}

function randomColor(scheme) {
    return scheme[Math.floor((Math.random() * scheme.length))]
}

function customFill(d) {

    fillColor = randomColor(themes[selectedTheme].words);

    return fillColor;
}

var tip;

function draw(data, bounds) {
    statusText.style("display", "none");
    scale = bounds ? Math.min(
        w / Math.abs(bounds[1].x - w / 2),
        w / Math.abs(bounds[0].x - w / 2),
        h / Math.abs(bounds[1].y - h / 2),
        h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;
    words = data;

    var text = visualisation.selectAll("text")
        .data(words, function (d) {
            return d.text.toLowerCase();
        });
    text.transition()
        .duration(1000)
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .style("font-size", function (d) {
            return d.size + "px";
        });
    text.enter().append("text")
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .style("font-size", function (d) {
            return d.size + "px";
        })
        .on("click", function (d) {

            console.log(d);
        })
        .on("mouseexit", function (d) {
            console.log('clicked: ' + d.size);
            console.log(d);
            //        load(d.text);
        })
        .style("opacity", 1e-6)
        .transition()
        .duration(1000)
        .style("opacity", 1);

    text.style("font-family", function (d) {
            return d.font;
        })
        .style("fill", customFill)
        .text(function (d) {
            return d.text;
        });
    var exitGroup = background.append("g")
        .attr("transform", visualisation.attr("transform"));
    var exitGroupNode = exitGroup.node();
    text.exit().each(function () {
        exitGroupNode.appendChild(this);
    });
    exitGroup.transition()
        .duration(1000)
        .style("opacity", 1e-6)
        .remove();
    visualisation.transition()
        .delay(1000)
        .duration(750)
        .attr("transform", "translate(" + [w >> 1, h >> 1] + ")scale(" + scale + ")");
}

function createPNG(pngScale, pngWidth, pngHeight) {

    var canvas = document.createElement("canvas"),
        c = canvas.getContext("2d");
    canvas.width = pngWidth;
    canvas.height = pngHeight;

    c.fillStyle = themes[selectedTheme].background;
    c.rect(0, 0, pngWidth, pngHeight);
    c.fill();

    c.translate(pngWidth >> 1, pngHeight >> 1);
    c.scale(pngScale, pngScale);
    words.forEach(function (word, i) {
        c.save();
        c.translate(word.x, word.y);
        c.rotate(word.rotate * Math.PI / 180);
        c.textAlign = "center";
        c.fillStyle = customFill(); // fill(word.text.toLowerCase());
        c.font = word.size + "px " + word.font;
        c.fillText(word.text, 0, 0);
        c.restore();
    });

    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

    return image;
}

// Converts a given word cloud to image/png.
function downloadPNG() {
    var image = createPNG(1.3, 550, 550);
    window.location.href = image; // it will save locally
}

function uploadPNG(message) {
    var image = createPNG(1, 550, 550);

    if (image) {

        var path = '/tweet/';

        var oauth_token = getParameter()['oauth_token'];

        var parameters;

        if (oauth_token) {
            console.log('read oauth token: ' + oauth_token);
            parameters = 'image=' + encodeURIComponent(image) + 'token=' + oauth_token;
        }

        var formData = new FormData();
        formData.append('image', encodeURIComponent(image));
        formData.append('message', message);

        var xhr = new XMLHttpRequest();

        xhr.open('POST', path, true);
        xhr.setRequestHeader("oauth_token", oauth_token);
        xhr.onload = function (e) {
            console.log('onload')
        };

        xhr.send(formData);
    }
}

function downloadSVG() {
    d3.select(this).attr("href", "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(
        svg.attr("version", "1.1")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML))));
}

function load(f) {

}

d3.select("#random-palette").on("click", function () {
    paletteJSON("http://www.colourlovers.com/api/palettes/random", {}, function (d) {
        fill.range(d[0].colors);
        visualisation.selectAll("text").style("fill", function (d) {
            return fill(d.text.toLowerCase());
        });
    });
    d3.event.preventDefault();
});

function drawPersonalityChart(root) {

    function computeTextRotation(d) {
        return (d.x + (d.dx) / 2) * 180 / Math.PI - 90;
    }

    var width = 720,
        height = 720,
        radius = Math.min(360, 360) / 2,
        color = d3.scale.category20c();

    var wa = document.getElementById("wordle-container");
    while (wa.firstChild) {
        wa.removeChild(wa.firstChild);
    }
    var svg = d3.select(wa).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height * .52 + ")");

    var partition = d3.layout.partition()
        .sort(null)
        .size([2 * Math.PI, radius * radius])
        .value(function (d) {
            return 1;
        });

    var arc = d3.svg.arc()
        .startAngle(function (d) {
            return d.x;
        })
        .endAngle(function (d) {
            return d.x + d.dx;
        })
        .innerRadius(function (d) {
            return Math.sqrt(d.y);
        })
        .outerRadius(function (d) {
            return Math.sqrt(d.y + d.dy);
        });

    var path = svg.datum(root.tree).selectAll("path")
        .data(partition.nodes)
        .enter().append("path")
        .attr("display", function (d) {
            return d.depth ? null : "none";
        }) // hide inner ring
        .attr("d", arc)
        .style("stroke", "#fff")
        .style("fill", function (d) {

            var colorstring = (d.children ? d : d.parent).name;

            console.log(colorstring);

            var fillcolor = color(colorstring);

            console.log(fillcolor);

            return fillcolor;
        })
        .style("fill-rule", "evenodd")
        .each(stash);

    function change() {
        var value = function (d) {
            return d.percentage * 100;
        };

        path.data(partition.value(value).nodes)
            .transition()
            .duration(1500)
            .attrTween("d", arcTween);

        var text = svg.datum(root.tree).selectAll("text")
            .data(partition.nodes(root.tree).slice(1))
            .enter().append("text")
            .attr("font-size", "10px")
            .style("fill", "#777")
            .attr("transform", function (d) {
                return "rotate(" + computeTextRotation(d) + ")";
            })
            .attr("x", function (d) {
                return radius / 3.4 * d.depth;
            })
            .attr("dx", "6") // margin
            .attr("dy", ".35em") // vertical-align
            .html(function (d) {

                var returnString = "";

                if (d.depth !== 2) {
                    var num = d.percentage * 100;
                    num = num.toFixed(0);

                    returnString = d.name;

                    if (num > 0) {
                        returnString = returnString + " - " + num + "%";
                    }
                }

                return returnString;
            });
    }

    change();

    // Stash the old values for transition.
    function stash(d) {
        d.x0 = d.x;
        d.dx0 = d.dx;
    }

    // Interpolate the arcs in data space.
    function arcTween(a) {
        var i = d3.interpolate({
            x: a.x0,
            dx: a.dx0
        }, a);
        return function (t) {
            var b = i(t);
            a.x0 = b.x;
            a.dx0 = b.dx;
            return arc(b);
        };
    }

    d3.select(self.frameElement).style("height", height + "px");
}

(function () {
    var r = 40.5,
        px = 35,
        py = 20;

    var angles = d3.select("#angles").append("svg")
        .attr("width", 2 * (r + px))
        .attr("height", r + 1.5 * py)
        .append("g")
        .attr("transform", "translate(" + [r + px, r + py] + ")");

    angles.append("path")
        .style("fill", "none")
        .attr("d", ["M", -r, 0, "A", r, r, 0, 0, 1, r, 0].join(" "));

    angles.append("line")
        .attr("x1", -r - 7)
        .attr("x2", r + 7);

    angles.append("line")
        .attr("y2", -r - 7);

    angles.selectAll("text")
        .data([-90, 0, 90])
        .enter().append("text")
        .attr("dy", function (d, i) {
            return i === 1 ? null : ".3em";
        })
        .attr("text-anchor", function (d, i) {
            return ["end", "middle", "start"][i];
        })
        .attr("transform", function (d) {
            d += 90;
            return "rotate(" + d + ")translate(" + -(r + 10) + ")rotate(" + -d + ")translate(2)";
        })
        .text(function (d) {
            return d + "°";
        });

    var radians = Math.PI / 180,
        from,
        to,
        count,
        scale = d3.scale.linear(),
        arc = d3.svg.arc().innerRadius(0).outerRadius(r);

    function getAngles() {
        count = 2;
        from = 0;
        to = 90;
        update();
    }

    function update() {
        scale.domain([0, count - 1]).range([from, to]);
        var step = (to - from) / count;

        var path = angles.selectAll("path.angle")
            .data([{
                startAngle: from * radians,
                endAngle: to * radians
            }]);
        path.enter().insert("path", "circle")
            .attr("class", "angle")
            .style("fill", "#fc0");
        path.attr("d", arc);

        var line = angles.selectAll("line.angle")
            .data(d3.range(count).map(scale));
        line.enter().append("line")
            .attr("class", "angle");
        line.exit().remove();
        line.attr("transform", function (d) {
                return "rotate(" + (90 + d) + ")";
            })
            .attr("x2", function (d, i) {
                return !i || i === count - 1 ? -r - 5 : -r;
            });

        var drag = angles.selectAll("path.drag")
            .data([from, to]);
        drag.enter().append("path")
            .attr("class", "drag")
            .attr("d", "M-9.5,0L-3,3.5L-3,-3.5Z")
            .call(d3.behavior.drag()
                .on("drag", function (d, i) {
                    d = (i ? to : from) + 90;
                    var start = [-r * Math.cos(d * radians), -r * Math.sin(d * radians)],
                        m = [d3.event.x, d3.event.y],
                        delta = ~~(Math.atan2(cross(start, m), dot(start, m)) / radians);
                    d = Math.max(-90, Math.min(90, d + delta - 90)); // remove this for 360°
                    delta = to - from;
                    if (i) {
                        to = d;
                        if (delta > 360) from += delta - 360;
                        else if (delta < 0) from = to;
                    } else {
                        from = d;
                        if (delta > 360) to += 360 - delta;
                        else if (delta < 0) to = from;
                    }
                    update();
                })
                .on("dragend", generate));
        drag.attr("transform", function (d) {
            return "rotate(" + (d + 90) + ")translate(-" + r + ")";
        });
        layout.rotate(function () {
            return scale(~~(Math.random() * count));
        });
    }

    function cross(a, b) {
        return a[0] * b[1] - a[1] * b[0];
    }

    function dot(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    }




    $(document).ready(function () {

        if ($(document).width() < 550) {

            w = $(document).width() - 100;
            h = $(document).width() - 100;

            document.getElementById('themeSection').style.display = "none";
            document.getElementById('themeLabel').style.display = "none";
        } else {
            w = 550;
            h = 550;
        }

        layout = d3.layout.cloud()
            .timeInterval(10)
            .size([w, h])
            .fontSize(function (d) {
                return fontSize(+d.value);
            })
            .text(function (d) {
                return d.key;
            })
            .on("word", progress)
            .on("end", draw);

        svg = d3.select("#wordle-container").append("svg").attr("width", w).attr("height", h);

        background = svg.append("g");
        visualisation = svg.append("g").attr("transform", "translate(" + [w >> 1, h >> 1] + ")");

        getAngles();

        /* Initialize popover help tips */

        var classList = ['.glyphicon-upload', '.glyphicon-download', '.glyphicon-refresh', '.themeArea', '.progressLabel', '.btn'];

        classList.forEach(function (element) {
            $(element).popover({
                trigger: 'hover'
            });
        })

        createThemeList();

        //        drawPersonalityChart();
    });

})();