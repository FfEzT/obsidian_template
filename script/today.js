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

function checkCond(obj) {
    return obj.date &&
    obj.date < dv.date("tomorrow")
}

const currentDv = dv.current()
let pages = dv.pages()
.where(
    page => page.file.path.startsWith(currentDv.file.folder)
         && !page.status?.contains("done")
)
.sort(p => p.status)
.array()

const result = []

for (let page of pages) {
    if (checkCond(page)) {
        result.push(
            [page.file.link, page.status, page.date, page.timeStart, page.frequency]
        )
    }
    if (page.t) {
        const tmp = convertDvToTarr(page.t)
        .filter(a => checkCond(a))

        for (let i of tmp) {
            result.push(
                ["("+page.file.link+")"+i.name, page.status, i.date, i.timeStart,""]
            )
        }
    }
}

result
.sort(
    (a,b) => a[3] < b[3]? -1:1
)
.sort(
    (a,b) => a[2] < b[2]? -1:1
)


dv.table(
    ["File", "status", "date", "timeStart", "frequency"],
    result
)
