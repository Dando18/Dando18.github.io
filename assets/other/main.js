const TITLE_COL = "Document Title";
const AUTHORS_COL = "Authors";
const INSTITUTION_COL = "Author Affiliations";
const VENUE_COL = "Publication Title";
const YEAR_COL = "Publication Year";
const CITATION_COL = "Article Citation Count";
const ABSTRACT_COL = "Abstract";
const KEYWORDS_COL = "Author Keywords";

const COLOR_PALETTE = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
const VENUE_COLORS = {SC: COLOR_PALETTE[0], IPDPS: COLOR_PALETTE[1], TPDS: COLOR_PALETTE[2]};

const KEYWORD_FILTER = ["edge server", "cloud-edge computing", "federated learning", "edge computing", "cloud", "cloud computing", 
    "blockchain", "mobile edge computing", "pervasive edge computing", "multi-access edge computing"];

let plots = {};

d3.csv("all.csv").then((data) => {

    /* fix data issues */
    data = data.map(x => {
        x[VENUE_COL] = normalizeVenueNames(x[VENUE_COL]);
        if (x[CITATION_COL] == "") x[CITATION_COL] = 0;
        x[CITATION_COL] = Number(x[CITATION_COL]);
        x[INSTITUTION_COL] = x[INSTITUTION_COL].split(';').map(x => x.split(',').slice(0,2)).join(';');
        x[KEYWORDS_COL] = x[KEYWORDS_COL].toLowerCase();
        return x; 
    });

    /* pass data thru filter */
    data = data.filter(d => !d[KEYWORDS_COL].split(';').some(x => KEYWORD_FILTER.includes(x)));

    /* create settings ui */
    createSettings(data);

    /* list top papers */
    listTopPapers(data, 25);

    /* draw plots */
    drawTotalCitationsByVenue(data);
    drawAverageCitationsByVenue(data);
    drawCitationsByVenue(data);
    drawByColumn(data);
    drawByColumn(data, 50, INSTITUTION_COL);
    drawByColumn(data, 50, KEYWORDS_COL);

    // not working
    //drawAbstractWordCloud(data);
    //updateAbstractWordCloud(data);

});

function normalizeVenueNames(name) {
    if (name.endsWith("(IPDPS)")) {
        return "IPDPS";
    } else if (name.endsWith("International Conference for High Performance Computing, Networking, Storage and Analysis")) {
        return "SC";
    } else if (name.endsWith("Transactions on Parallel and Distributed Systems")) {
        return "TPDS";
    } else {
        console.log("Unknown venue: " + name);
        return "Unknown Venue";
    }
}

function getColumn(data, columnName) {
    return Array.from( data.map(d => d[columnName]) );
}

function createSettings(data) {
    const allVenues = getColumn(data, VENUE_COL);
    const venues = [...new Set(allVenues)];
    const allYears = getColumn(data, YEAR_COL);
    const years = [...new Set(allYears)];

    let venueForm = $("#settings__venues > fieldset");
    for (venue of venues) {
        let checkbox = $("<div>").append(
            $("<input>")
                .addClass("settings-checkbox")
                .attr("type", "checkbox")
                .attr("id", `venues__${venue}`)
                .attr("name", "venue")
                .attr("value", venue)
                .prop('checked', true)
        ).append(
            $("<label>")
                .attr("for", `venues__${venue}`)
                .text(venue)
        );
        venueForm.append(checkbox);
    }

    let yearForm = $("#settings__years > fieldset");
    for (year of years) {
        let checkbox = $("<div>").append(
            $("<input>")
                .addClass("settings-checkbox")
                .attr("type", "checkbox")
                .attr("id", `year__${year}`)
                .attr("name", "year")
                .attr("value", year)
                .prop('checked', true)
        ).append(
            $("<label>")
                .attr("for", `year__${year}`)
                .text(year)
        );
        yearForm.append(checkbox);
    }

    $('#settings input').change(function() {
        update(data);
    });

    $('#settings__papers-count__selection').change(function() {
        //const N = $("#settings__papers-count__selection option:selected").val();
        update(data);
    });

    $('#settings__authors__selection').change(function() {
        update(data);   // have to update since we need data filtering
    });
}

function getSelectedCheckboxes(name) {
    let values = [];
    $(`#settings input[name="${name}"]:checked`).each(function() { values.push($(this).val()); });
    return values;
}

function update(data) {
    const years = getSelectedCheckboxes('year');
    const venues = getSelectedCheckboxes('venue');

    /* filter years */
    data = data.filter((val, idx, arr) => years.includes(val[YEAR_COL]));

    /* filter venues */
    data = data.filter((val, idx, arr) => venues.includes(val[VENUE_COL]));

    /* update list */
    const N = $("#settings__papers-count__selection option:selected").val();
    listTopPapers(data, N);

    /* update plots */
    updateTotalCitationsByVenue(data);
    updateAverageCitationsByVenue(data);
    updateCitationsByVenue(data);
    updateByColumn(data, 50, AUTHORS_COL, $('#settings__authors__selection option:selected').val());
    updateByColumn(data, 50, INSTITUTION_COL, $('#settings__authors__selection option:selected').val());
    updateByColumn(data, 50, KEYWORDS_COL, $('#settings__authors__selection option:selected').val());
}

function listTopPapers(data, N) {
    data = data.slice(0); // shallow copy
    data.sort((a,b) => b[CITATION_COL] - a[CITATION_COL]);
    let topN = data.slice(0, N);

    function getPaper(citations, title, authors, venue, year) {
        return $("<div>").addClass("paper-item")
                .append($("<div>").addClass("paper-item__citation-count").text(citations))
                .append($("<div>").addClass("paper-item__title").text(title))
                .append($("<div>").addClass("paper-item__author-list").html(`<i>Authors:</i> ${authors}`))
                .append($("<div>").addClass("paper-item__venue").html(`<i>Venue:</i> ${venue} ${year}`))
    }

    let listRoot = $(".paper-list").first();
    listRoot = listRoot.empty();    // clear out first
    listRoot = listRoot.append($("<div>").addClass("paper-header")
                        .append($("<div>").addClass("paper-item__citation-count").text("Citations"))
                        .append($("<div>").addClass("paper-item__title").text("Paper"))
                    );
    for (paper of topN) {
        listRoot = listRoot.append(
            getPaper(paper[CITATION_COL], paper[TITLE_COL], paper[AUTHORS_COL], paper[VENUE_COL], paper[YEAR_COL])
        );
    }
    $(".paper-item:odd").css("background-color", "#eee");   // alternating colors
}

function drawTotalCitationsByVenue(data) {
    let X = getSelectedCheckboxes("venue");
    let y = X.map(x => data.reduce((acc, val) => acc + ((val[VENUE_COL] == x) ? val[CITATION_COL] : 0), 0));
    const margins = {left: 50, right: 25, top: 40, bottom: 25};
    drawBarPlot("#total-citations-by-venue", X, y, margins, 800, 600, "Total Citations by Venue", 0, VENUE_COLORS);
}

function updateTotalCitationsByVenue(data) {
    let X = getSelectedCheckboxes("venue");
    let y = X.map(x => data.reduce((acc, val) => acc + ((val[VENUE_COL] == x) ? val[CITATION_COL] : 0), 0));
    updateBarPlot("#total-citations-by-venue", X, y);
}

function drawAverageCitationsByVenue(data) {
    let bins = {};
    for (venue of getSelectedCheckboxes("venue")) bins[venue] = [];
    for (row of data) {
        bins[row[VENUE_COL]].push(row[CITATION_COL]);
    }
    for (venue in bins) {
        bins[venue] = bins[venue].reduce((acc, val) => acc + val) / bins[venue].length;
    }
    let X = Object.keys(bins), y = Object.values(bins);
    const margins = {left: 50, right: 25, top: 40, bottom: 25};
    drawBarPlot("#average-citations-by-venue", X, y, margins, 800, 600, "Average Citations by Venue", 0, VENUE_COLORS);
}

function updateAverageCitationsByVenue(data) {
    let bins = {};
    for (venue of getSelectedCheckboxes("venue")) bins[venue] = [];
    for (row of data) {
        bins[row[VENUE_COL]].push(row[CITATION_COL]);
    }
    for (venue in bins) {
        bins[venue] = bins[venue].reduce((acc, val) => acc + val) / bins[venue].length;
    }
    let X = Object.keys(bins), y = Object.values(bins);
    updateBarPlot("#average-citations-by-venue", X, y);
}

function drawCitationsByVenue(data) {
    const venues = getSelectedCheckboxes('venue');

    let bins = {};
    for (venue of venues) bins[venue] = [];
    for (idx in data) {
        const row = data[idx];
        bins[row[VENUE_COL]].push(row[CITATION_COL]);
    }
    let X = Object.keys(bins);
    let y = Object.values(bins);

    const margins = {left: 30, right: 25, top: 40, bottom: 25};
    drawViolinPlot("#citations-by-venue", X, y, margins, 800, 600, "Citations by Venue", VENUE_COLORS);
}

function updateCitationsByVenue(data) {
    const venues = getSelectedCheckboxes('venue');

    let bins = {};
    for (venue of venues) bins[venue] = [];
    for (idx in data) {
        const row = data[idx];
        bins[row[VENUE_COL]].push(row[CITATION_COL]);
    }
    let X = Object.keys(bins);
    let y = Object.values(bins);
    updateViolinPlot("#citations-by-venue", X, y);
}

function getSplitColumnUnique(data, column) {
    let raw = getColumn(data, column);
    let all = raw.map(a => a.split(";")).flat();
    return [...new Set(all)];
}

function countByColumn(data, column=AUTHORS_COL) {
    let vals = getSplitColumnUnique(data, column);
    let bin = {};
    for (val of vals) bin[val] = {citations: 0, papers: 0};
    for (row of data) {
        for (col of row[column].split(';')) {
            if (col == "") continue;
            bin[col].papers += 1;
            bin[col].citations += row[CITATION_COL];
        }
    }
    for (col in bin) {
        bin[col]['average citations'] = bin[col].citations / bin[col].papers;
    }
    return bin;
}

function drawByColumn(data, N=50, column=AUTHORS_COL, by="citations") {
    let counts = Object.entries(countByColumn(data, column)).map(d => [d[0], d[1][by]]);
    counts.sort((a,b) => b[1] - a[1]);
    counts = counts.splice(0, N);
    let X = [], y = [];
    counts.forEach(a => {X.push(a[0]); y.push(a[1])});
    const margins = {left: 30, right: 25, top: 40, bottom: 80};
    if (column == INSTITUTION_COL) { margins.bottom = 180; margins.left = 120; }
    const title = by.split().map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") + ` By ${column}`;
    const id = {"Authors": "#by-author", "Author Affiliations": '#by-institution', "Author Keywords": "#by-keyword"}[column];
    drawBarPlot(id, X, y, margins, 1200, 600, title, 45, null);
}

function updateByColumn(data, N=50, column=AUTHORS_COL, by="citations") {
    let counts = Object.entries(countByColumn(data, column)).map(d => [d[0], d[1][by]]);
    counts.sort((a,b) => b[1] - a[1]);
    counts = counts.splice(0, N);
    let X = [], y = [];
    counts.forEach(a => {X.push(a[0]); y.push(a[1])});
    const title = by.split().map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") + ` By ${column}`;
    const id = {"Authors": "#by-author", "Author Affiliations": '#by-institution', "Author Keywords": "#by-keyword"}[column];
    updateBarPlot(id, X, y, title);
}

function drawAbstractWordCloud(data) {
    const abstracts = getColumn(data, ABSTRACT_COL);
    let words = abstracts.flat();
    drawWordCloud("#abstract-word-cloud", words, 800, 600, "test");
}

function updateAbstractWordCloud(data) {
    const abstracts = getColumn(data, ABSTRACT_COL);
    let words = abstracts.flat();
    updateWordCloud("#abstract-word-cloud", words);
}

function drawBarPlot(id, X, y, margins, width, height, title, xAxisRotation, colorMap) {
    const realWidth = width - margins.left - margins.right;
    const realHeight = height - margins.top - margins.bottom;

    let svg = d3.select(id)
                .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                .append("g")
                    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");
    
    let xScale = d3.scaleBand()
                   .range([0, realWidth])
                   .padding(0.2);
    let xAxis = svg.append("g")
                   .attr("transform", `translate(0,${realHeight})`)
                   .style("font-family", "Sans Serif");

    let yScale = d3.scaleLinear()
                   .range([realHeight, 0]);
    let yAxis = svg.append("g")
                   .style("font-family", "Sans Serif");

    addTitle(svg, title, margins, realWidth, realHeight);
    
    plots[id] = {svg: svg, xScale: xScale, xAxis: xAxis, yScale: yScale, yAxis: yAxis, realWidth: realWidth,
                realHeight: realHeight, margins: margins, xAxisRotation: xAxisRotation, colorMap: colorMap};

    updateBarPlot(id, X, y);
}

function updateBarPlot(id, X, y, newTitle=null) {
    let xScale = plots[id].xScale, xAxis = plots[id].xAxis;
    let yScale = plots[id].yScale, yAxis = plots[id].yAxis;
    let xAxisRotation = plots[id].xAxisRotation;
    let colorMap = plots[id].colorMap;

    xScale.domain(X);
    xAxis.transition()
        .duration(1000)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", (xAxisRotation == 0) ? "center" : "end")
        .attr("transform", `rotate(-${plots[id].xAxisRotation})`);

    yScale.domain([0, d3.max(y)]);
    yAxis.transition().duration(1000).call(d3.axisLeft(yScale));

    let bars = [];
    for (idx in X) {
        bars.push({key: X[idx], value: y[idx]});
    }

    let u = plots[id].svg.selectAll("rect")
                         .data(bars);

    u.exit()
        .transition()
        .duration(500)
        .style('opacity', 0)
        .remove();

    u.enter()
        .append("rect")
        .merge(u)
        .transition()
        .duration(1000)
            .attr("x", d => xScale(d.key))
            .attr("y", d => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", d => plots[id].realHeight - yScale(d.value))
            .attr("fill", d => (colorMap == null) ? "#9467bd" : colorMap[d.key]);
            
    if (newTitle != null) {
        addTitle(plots[id].svg, newTitle, plots[id].margins, plots[id].realWidth, plots[id].realHeight);
    }
}

function drawViolinPlot(id, X, y, margins, width, height, title, colorMap) {
    const realWidth = width - margins.left - margins.right;
    const realHeight = height - margins.top - margins.bottom;

    let svg = d3.select(id)
                .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                .append("g")
                    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");
    
    let yScale = d3.scaleLinear()
              .domain( d3.extent(y.flat()) )
              .range([realHeight, 0]);
    let yAxis = svg.append("g")
                   .style("font-family", "Sans Serif");

    let xScale = d3.scaleBand()
              .range([0, realWidth])
              .padding(0.05);
    let xAxis = svg.append("g")
                   .attr("transform", "translate(0," + realHeight + ")")
                   .style("font-family", "Sans Serif");

    addTitle(svg, title, margins, realWidth, realHeight);

    plots[id] = {svg: svg, xScale: xScale, xAxis: xAxis, yScale: yScale, yAxis: yAxis, realHeight: realHeight,
                colorMap: colorMap};

    updateViolinPlot(id, X, y);
}

function updateViolinPlot(id, X, y) {
    let xScale = plots[id].xScale, xAxis = plots[id].xAxis;
    let yScale = plots[id].yScale, yAxis = plots[id].yAxis;

    xScale.domain(X);
    xAxis.transition().duration(1000).call( d3.axisBottom(xScale) );

    yScale.domain(d3.extent(y.flat()));
    yAxis.transition().duration(1000).call( d3.axisLeft(yScale) );

    let histogram = d3.histogram()
                      .domain(yScale.domain())
                      .thresholds(yScale.ticks(20))
                      .value(d => d);

    let bins = X.map((e, idx) => ({key: e, value: y[idx]}));

    /* calculate max width */
    let maxWidth = 0;
    for (bin of y) {
        let maxLength = d3.max(histogram(bin).map(a => a.length));
        if (maxLength > maxWidth) maxWidth = maxLength;
    }
    let xNum = d3.scaleLinear()
                 .range([0, xScale.bandwidth()])
                 .domain([-maxWidth,maxWidth]);

    let area = d3.area()
                 .x0(d => xNum(-d.length))
                 .x1(d => xNum(d.length))
                 .y(d => yScale(d.x0))
                 .curve(d3.curveCatmullRom);

    let u = plots[id].svg.selectAll("g.violin")
                     .data(bins);
    
    u.enter()
        .append("g")
            .attr("class", "violin")
        .append("path")
            .style("stroke", "none")
            .style("fill", d => plots[id].colorMap[d.key])
            .attr("d", d => area(histogram(d.value)))
        .select(function() { return this.parentNode; })
        .merge(u)
        .transition()
        .duration(1000)
        .attr("transform", d => "translate(" + xScale(d.key) + ",0)");
    
    let paths = plots[id].svg.selectAll("g.violin path").data(bins);
    paths.enter()
        .merge(paths)
        .transition()
        .duration(1000)
        .attr("d", d => area(histogram(d.value)));

    u.exit()
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();

}

function drawWordCloud(id, words, width, height, title) {
    let fill = d3.scaleOrdinal(d3.schemeCategory10);
    let svg = d3.select(id)
        .append("svg")
            .attr("width", width)
            .attr("height", height)
        .append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

    function draw() {
        let cloud = svg.selectAll("g text")
                        .data(words, function(d) { return d.text; });
        
        cloud.enter()
                .append("text")
                .style("font-family", "Impact")
                .style("fill", function(d,i) { return fill(i); })
                .attr("text-anchor", "middle")
                .attr('font-size', 1)
                .text(function(d) { return d.text; });

        cloud.transition()
            .duration(600)
            .style("font-size", function(d) { return d.size + "px"; })
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("fill-opacity", 1);

        cloud.exit()
            .transition()
            .duration(200)
            .style('fill-opacity', 1e-6)
            .attr('font-size', 1)
            .remove();
    }

    plots[id] = {height: height, width: width, svg: svg, draw: draw};
}

function updateWordCloud(id, words) {
    d3.layout.cloud().size([plots[id].width, plots[id].height])
        .words(words)
        .padding(5)
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .font("Impact")
        .fontSize(function(d) { return d.size; })
        .on("end", plots[id].draw)
        .start();
}

function addTitle(svg, title, margins, width, height) {
    svg.selectAll("text.title").remove();

    svg.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", 0 - margins.top/2)
        .attr("text-anchor", "middle")
        .style("font-size", "16pt")
        .style("font-family", "Sans Serif")
        .text(title);
}