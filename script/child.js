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

const currentDv = dv.current()


// GET blocks
let blockers = dv.pages("[[#]]")
.where(
    page => {
        if (page.blocks?.find)
            return page.blocks.find(el => el.path == currentDv.file.path)

        return page.blocks?.path == currentDv.file.path
    }
)
.sort(p => p.status).sort(p => p.date)
.array()

const result_block = []
for (let blocker of blockers) {
    result_block.push(
        [blocker.file.link, blocker.date, blocker.status, blocker.progress?.replace("current()", "page('" + blocker.file.path + "')")]
    )
}
// END GET blocks




// GET others inlinks
let pages = dv.pages("[[#]]")
// .where(
//     page => {
//         console.log(page.parent)
//         if (page.parent?.find)
//             return page.parent.find(el => el.path == currentDv.file.path)

//         return page.parent?.path == currentDv.file.path
//     }
// )
.sort(p => p.status)
.array()

let result = []

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


// END GET other inlinks

// remove blockers from result
let tempResult = []
for (let i of result) {
    index = result_block.find(
        el => el[0].path == i[0].path
    )

    if (index)
        continue

    tempResult.push(i)
}
result = tempResult




// RENDER
dv.table(
    ["children", "date", "status", "progress"],
    result
)

if (result_block.length)
    dv.table(
        ["blocker", "date", "status", "progress"],
        result_block
    )
