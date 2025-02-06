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

function haveDate(obj) {
    return !!obj.date
}

function checkFile(obj) {
    return !haveDate(obj) &&
        !(obj.status == "🟡blocked" &&
                !obj.file?.tasks.fullyCompleted.includes(false) &&
                obj.file?.inlinks.length != 0)

    // if (haveDate(obj))
    //   return false
    
    // if (obj.file?.inlinks.length == 0)
    //   return true

    // if (obj.file?.tasks.fullyCompleted.includes(false))
    //   return true

    // const child = obj.file.inlinks.array()
    // for (let children of child) {
    //   const tmp = dv.page(children.path).status

    //   if (!tmp)
    //       continue
    //   // NOTE Если есть дети не Done
    //   if (!tmp.includes("done"))
    //       return false
    // }

    // return true
}

const currentDv = dv.current()
let pages = dv.pages()
.where(
    page => page.file.path.startsWith(currentDv.file.folder)
    && page.status
    && !page.status?.contains("done")
)
.sort(p => p.deadline)
.sort(p => p.impact)
.sort(p => p.confidence)
.sort(p => p.effort)
.sort(p => p.status)
.array()

const result = []

// status, parent, replace(progress, "current()", PROG) AS progress
for (let page of pages) {
    if (checkFile(page)) {
        result.push(
            [
                page.file.link,
                page.status,
                page.progress?.replace("current()", "page('" + page.file.path + "')"),
                !!page.deadline||null, // note чтобы показывались "...", а не "false"
                !!page.impact||null, // note чтобы показывались "...", а не "false"
                !!page.confidence||null, // note чтобы показывались "...", а не "false"
                !!page.effort||null, // note чтобы показывались "...", а не "false"
                page.parent
            ]
        )
    }
    if (page.t) {
        const tmp = convertDvToTarr(page.t)
        .filter(a => !haveDate(a))

        for (let i of tmp) {
            result.push(
                ["("+page.file.link+")"+i.name, page.status, "", ""]
            )
        }
    }
}

dv.table(
    ["File", "status", "progress", ..."dice", "parent"],
    result
)
