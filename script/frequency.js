dv.execute(`
    TABLE frequency, date

    WHERE contains(file.path, this.file.folder)
    AND frequency
    SORT date, timeStart, frequency DESC
`)
