
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { Dataset, Filter } from './dataset.js';

const NUMERIC_COLUMNS = ["year", "referenceCount", "citationCount", "influentialCitationCount"];
const BOOL_COLUMNS = ["isOpenAccess", "is_retracted"];
const OBJECT_COLUMNS = ["authors", "authorships", "counts_by_year", "venue_acronym"];
const DISPLAY_COLUMNS = ["citationCount", "influentialCitationCount", "selfCitations", "isOpenAccess", "count", "hIndex"];
const READABLE_COLUMN_NAME_MAP = {
    Position: "Position",
    Name: "Name", 
    citationCount: "Citations",
    influentialCitationCount: "Influential Citations",
    selfCitations: "Self Citations",
    isOpenAccess: "No. Open Access",
    is_retracted: "No. Retractions",
    count: "No. Papers",
    hIndex: "H-Index",
};

let dataset = null;
let datatable = null;

$(document).ready(function () {
    $("#load").show();

    d3.csv("/data/site-data.csv", function(d) {
        for (const col of NUMERIC_COLUMNS) d[col] = +d[col];
        for (const col of BOOL_COLUMNS) d[col] = +(d[col] === "True");
        for (const col of OBJECT_COLUMNS) {
            if (d[col]) {
                d[col] = JSON.parse(d[col]);
            }
        }
        d["venue_acronym"] = d["venue_acronym"]["acronym"];
        return d;
    }).then(data => {
        /* create global dataset */
        dataset = new Dataset(data);

        /* create UI elements */
        const uniqueYears = dataset.getUnique("year").filter(d => d != 0);
        const uniqueVenues = dataset.getUnique("venue_acronym");
        initializeFilterUI(uniqueYears, uniqueVenues);

        /* create table */
        updateAuthorList();
    });
});

function shouldShowMedianPerPaper() {
    return $("#columns-filter__median").is(":checked");
}

function updateAuthorList(filter = null, newColumns = false) {
    $("#load").show();

    if (datatable && newColumns) {
        datatable.destroy();
        $("#list-view__table").empty();
        datatable = null;
    }

    /* remove "count" and "hIndex" columns if showing median per paper */
    let columns = Array.from(DISPLAY_COLUMNS);
    const showMedians = shouldShowMedianPerPaper();
    if (showMedians) {
        columns.splice(columns.indexOf("count"), 1);
        columns.splice(columns.indexOf("hIndex"), 1);
    }

    /* preprocess author data */
    let byAuthor = dataset.getColumnsByAuthor(columns, filter);

    /* compute totals for each author; also create JSONL style array with data */
    const KEY_COL_NAME = "Name";
    let authorTable = [];
    for (const [authorName, metricObj] of Object.entries(byAuthor)) {
        let numValues = 0;
        let hIndex = 0;
        if ("citationCount" in metricObj) {
            hIndex = getHIndex(metricObj["citationCount"]);
        }
        for (const [metricName, metricValues] of Object.entries(metricObj)) {
            numValues = metricValues.length;
            if (showMedians) {
                metricObj[metricName] = computeMedian(metricValues);
            } else {
                metricObj[metricName] = metricValues.reduce((partial, cur) => partial + cur, 0);
            }
        }
        /* add paper count */
        metricObj["count"] = numValues;
        metricObj["hIndex"] = hIndex;

        let row = [0, authorName];
        for (const c of columns) {
            row.push(metricObj[c]);
        }
        authorTable.push(row);
    }

    /* style table */
    const INITIAL_SORTED_COL = "citationCount";
    const FULL_COLUMNS = ["Position", KEY_COL_NAME].concat(columns);
    console.log(FULL_COLUMNS);
    console.log(authorTable);
    if (datatable) {
        datatable.clear();
        datatable.rows.add(authorTable);
        datatable.draw();
    } else {
        datatable = $("#list-view__table").DataTable({
            data: authorTable,
            columns: FULL_COLUMNS.map(c => ({ title: READABLE_COLUMN_NAME_MAP[c] })),
            order: [[FULL_COLUMNS.indexOf(INITIAL_SORTED_COL), 'desc']],
            fnRowCallback: function (nRow, aData, iDisplayIndex) {
                let info = $(this).DataTable().page.info();
                $("td:nth-child(1)", nRow).html(info.start + iDisplayIndex + 1);
                return nRow;
            },
            drawCallback: function () { $("#load").hide(); }
        });
    }   
}

function getHIndex(citations) {
    citations.sort(function(a,b) { return b - a; });

    let hIndex = 0;
    for (let i = 0; i < citations.length; i++) {
        if (citations[i] >= i+1) {
            hIndex = i+1;
        } else {
            break;
        }
    }
    return hIndex;
}


function computeMedian(values) {
    values.sort(function(a,b) { return a - b; });
    const mid = Math.floor(values.length / 2);
    if (values.length % 2 === 0) {
        return (values[mid] + values[mid - 1]) / 2;
    } else {
        return values[mid];
    }
}


function initializeFilterUI(availableYears, availableVenues) {
    /* years */
    availableYears.sort();
    let yearStartSelect = $("#years-filter-start");
    let yearEndSelect = $("#years-filter-end");
    for (const year of availableYears) {
        yearStartSelect.append($("<option>").val(year).text(year));
        yearEndSelect.append($("<option>").val(year).text(year));
    }
    yearStartSelect.find("option:first").prop("selected", true);
    yearEndSelect.find("option:last").prop("selected", true);
    yearStartSelect.on("change", updateYears);
    yearEndSelect.on("change", updateYears);

    /* venues */
    let venueForm = $("#venues-filter-fieldset");
    for (const venue of availableVenues) {
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
    $("#venues-filter-form input").on("change", function() { updateAuthorList(getFilter(), false); });
    $("#columns-filter-form input").on("change", function() { updateAuthorList(getFilter(), true); });
}

function getAllSelectValues(selector) {
    let values = [];
    $(`${selector} option`).each(function() {
        values.push($(this).val());
    });
    return values;
}

function getFilter() {
    /* get selected years */
    const startYear = +$("#years-filter-start").find(":selected").val();
    const endYear = +$("#years-filter-end").find(":selected").val();
    const allYears = getAllSelectValues("#years-filter-start").map(y => +y);
    let validYears = allYears.filter(y => y>=startYear && y<=endYear);

    /* get selected venues */
    let validVenues = [];
    $("#filter input[type='checkbox']:checked").each(function () {
        validVenues.push($(this).val());
    });
    return new Filter(validYears, validVenues);
}

function updateYears() {
    /* ensure valid years */
    const startYear = +$("#years-filter-start").find(":selected").val();
    const endYear = +$("#years-filter-end").find(":selected").val();
    if (startYear > endYear) {
        console.log(`Start year (${startYear}) cannot be later than end year (${endYear}).`);
        $("#years-filter-start").val(endYear).change();
        return;
    }

    /* disable invalid years in start and end */
    $("#years-filter-start option").each(function() {
        let option = $(this);
        option.prop("disabled", (+option.val()) > endYear);
    });
    $("#years-filter-end option").each(function() {
        let option = $(this);
        option.prop("disabled", (+option.val()) < startYear);
    });

    /* update table */
    updateAuthorList(getFilter());
}
