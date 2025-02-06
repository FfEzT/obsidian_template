function parseTextTick(str) {
    const args = str.split(',')
        if (!args)
            return null

        const name = args[0]?.trim()
        const date = dv.date(args[1]?.trim())
        const timeStart = dv.duration(args[2]?.trim())

        const tempDuration = args[3]?.trim()
        const duration = tempDuration == 'x'
        ? 'x'
        : dv.duration(args[3]?.trim())

        if (name == '')
            return null

        return {name, date, timeStart, duration}
}

function parseArrTick(arr) {
    return {
        name: arr[0],
        date: arr[1],
        timeStart: arr[2],
        duration: arr[3]
    }
}

function convertDvToTarr(t) {
    const res = []
    if (typeof t == "string") {
        const tmp = parseTextTick(t)
        tmp && res.push(tmp)
    }
    else if (typeof t[0] == "number") {
        res.push(parseArrTick(t))
    }
    else for (let i of t) {
        res.push(
            ...convertDvToTarr(i)
        )
    }
    return res
}

let pages = dv.pages("[[#]]")
.sort(p => p.status)
.array()

const result = []

let currentPage = dv.current()
if (currentPage.t) {
    const tmp = convertDvToTarr(currentPage.t)

    for (let i of tmp) {
        result.push(
            ["("+currentPage.file.link+")"+i.name, i.date, currentPage.status, "TICK"]
        )
    }
}

// status, parent, replace(progress, "current()", PROG) AS progress
for (let page of pages) {
    result.push(
        [page.file.link, page.date, page.status, page.progress?.replace("current()", "page('" + page.file.path + "')")]
    )
}

result.sort(
    (a,b) => a[1] < b[1]? -1:1
)

dv.table(
    ["File", "date", "status", "progress"],
    result
)
