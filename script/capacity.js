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
let pages = dv.pages()
.where(
    page => page.file.path.startsWith(currentDv.file.folder)
        && !page.status?.contains("done")
)
.sort(p => p.status)
.array()

// let startDay = Math.max(dv.date("today"), currentDv.startDay)
let startDay = currentDv.startDay
function checkCond(obj) {
    if (!obj.timeStart)
        return false

    return obj.date &&
    obj.date < currentDv.endRange + dv.duration("1d") &&
    obj.date >= startDay
}

const rootHours = {}

function getRoots(page) {
    const pages = new Set()
    const stack = [page.file.path]

    const roots = []
    while (stack.length > 0) {
        const meta = dv.page(stack.pop())

        if (!meta)
            continue

        const isInTheSameRootFolder = (page) => {
            return page.path.startsWith(currentDv.file.folder)
        }

        const outlinks = meta.file.outlinks.array()
        if (outlinks.length == 0 || !outlinks.some(isInTheSameRootFolder)) {
            roots.push(meta)
            continue
        }

        const outlink = outlinks.find(isInTheSameRootFolder)
        if (outlink != undefined) {
            if (pages.has(outlink.path))
                continue

            pages.add(outlink.path)
            stack.push(outlink.path)
        }
    }

    const result = []
    for (let root of roots) {
        if (root.file.path.startsWith(currentDv.file.folder))
            result.push(root)
    }

    return result
}

function addStatistic(map, page, hours) {
    const roots = getRoots(page)

    for (let root of roots) {
        addToMapNumber(map, root.file.path, hours)
    }
}

function addToMapNumber(map, key, num) {
    let value = map[key] || 0
    value += num

    map[key] = value

}

const dayHours = {}
// console.log(dv.date("today").toISODate())

let result = 0
for (let page of pages) {
    if (checkCond(page) && page.duration) {
        if (page.duration == "x")
            page.duration = dv.duration("1h30m")

        const hours = page.duration.as("hour")

        result += hours

        addStatistic(rootHours, page, hours)

        addToMapNumber(
            dayHours,
            dv.date(page.date).toISODate(),
            hours
        )
    }
    if (page.t) {
        const tmp = convertDvToTarr(page.t)
        .filter(a => checkCond(a))

        for (let i of tmp) {
            if (!i.duration) {
                continue
            }

            if (i.duration == "x")
                i.duration = dv.duration("1h30m")

            const hours = i.duration.as("hour")

            result += hours
            addStatistic(rootHours, page, hours)

            addToMapNumber(
                dayHours,
                dv.date(i.date).toISODate(),
                hours
            )
        }
    }
}
result -= currentDv.offset

const getProgress = (countDone, countAll) => {
    const fraction = countDone/countAll
    const percent  = fraction * 100
    const progress = Math.floor( percent * 10) / 10

    return progress
}

const containerEl = createDiv();
Object.assign(containerEl.style, {
    'display': 'flex',
    'flex-direction': 'column',
    'align-items': 'center',
    'justify-content': 'center',
    'width':'100%'
});

const progressBar = containerEl.createEl('progress');
Object.assign(progressBar, {max: currentDv.targetCapacity, value: result});
Object.assign(progressBar.style, {"width":"100%", "height":"10px"});

const progressText = containerEl.createEl('div');
Object.assign(progressText, {
    'textContent': `${getProgress(result, currentDv.targetCapacity)}% ${result}/${currentDv.targetCapacity}`,
});

dv.paragraph(containerEl)

// RENDER dayToHours
const dayToHours = []
let summ = 0
for (let key in dayHours) {
    let hour = dayHours[key]
    summ += hour

    dayToHours.push(
        [key, hour]
    )
}
dayToHours.sort((a,b) => a[0] < b[0]? -1 : 1)
dayToHours.push(["all", summ])
dv.table(
    ["date", "hours"],
    dayToHours
)

// RENDER noteToHours
const rootAndHours = []
summ = 0
for (let key in rootHours) {
    let hour = rootHours[key]
    summ += hour
    rootAndHours.push(
        [dv.page(key).file.link, hour]
    )
}
rootAndHours.sort((a,b) => a[1] > b[1]? -1 : 1)
rootAndHours.push(["all", summ])

dv.table(
    ["root", "hours"],
    rootAndHours
)
