

class Filter {
    constructor(years, venues, yearColumn = "year", venueColumn = "venue_acronym") {
        this.years_ = years;
        this.venues_ = venues;
        this.yearColumn_ = yearColumn;
        this.venueColumn_ = venueColumn;
    }

    isValid(dataElement) {
        return this.years_.includes(dataElement[this.yearColumn_]) &&
            this.venues_.includes(dataElement[this.venueColumn_]);
    }
}

class Dataset {

    constructor(dataObj) {
        this.data_ = dataObj;
    }

    getUnique(column, removeEmptyStr = true) {
        const uniq = new Set(this.data_.map(d => d[column]));
        if (removeEmptyStr) {
            uniq.delete('');
        }
        return Array.from(uniq);
    }

    groupBy(by, agg) {
        d3.group(this.data_, d => d[by]);
    }

    getFilteredData(filter) {
        if (filter)
            return this.data_.filter(d => filter.isValid(d));
        else
            return this.data_;
    }

    /**
     * Returns a table of data grouped by author.
     * @param {Array} columns - The columns to group by author.
     * @param {Filter} filter - The filter to apply to the data.
     * @returns {Object} - A table of data grouped by author.
     *      The keys are the author names, and the values are objects
     *      with the columns as keys and the values are arrays of the
     *      values for that column.
     *      For example, if columns = ["citationCount", "year"],
     *      then the value for the key "John Smith" would be:
     *      {
     *          citationCount: [1, 2, 3],
     *          year: [2010, 2011, 2012]
     *      }
    */
    getColumnsByAuthor(columns, filter = null) {
        let data = this.getFilteredData(filter);

        let byAuthorTable = {};
        for (let row of data) {
            const venueName = row["venue_acronym"];

            for (let author of row["authors"]) {
                const authorName = author["name"];

                /* create new entry for author if it doesn't exist */
                if (!(authorName in byAuthorTable)) {
                    byAuthorTable[authorName] = Object.fromEntries(columns.map(k => [k, []]));
                    if (columns.includes("coAuthors")) {
                        byAuthorTable[authorName]["coAuthors"] = new Set();
                    }
                }

                /* create new counter for venue in this author if it doesn't exist */
                if (!(venueName in byAuthorTable[authorName])) {
                    byAuthorTable[authorName][venueName] = 0;
                }
                byAuthorTable[authorName][venueName] += 1;

                /* add self-citations */
                row["selfCitations"] = +author["selfCitations"] || 0;
                if (("referenceCount" in row) && row["referenceCount"] > 0) {
                    row["selfCitationPercent"] = row["selfCitations"] / row["referenceCount"] * 100.0;
                } else {
                    row["selfCitationPercent"] = 0.0;
                }

                if (columns.includes("coAuthors")) {
                    for (let coAuthor of row["authors"]) {
                        if (coAuthor["name"] != authorName) {
                            byAuthorTable[authorName]["coAuthors"].add(coAuthor["name"]);
                        }
                    }
                }

                /* add data to table */
                for (let col of columns) {
                    if (col !== "coAuthors")
                        byAuthorTable[authorName][col].push(row[col]);
                }
            }
        }
        return byAuthorTable;
    }
}


export { Dataset, Filter };