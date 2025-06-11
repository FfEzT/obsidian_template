dv.execute(`
    TABLE status, date, file.inlinks, replace(progress, "current()", PROG) AS progress
    WHERE contains(file.path, this.file.folder)
        AND !parent

    SORT status ASC, file.outlinks ASC, date ASC
    FLATTEN "page('" + file.path + "')" AS PROG
`)
