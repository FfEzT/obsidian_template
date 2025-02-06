function dice(page) {
        let dur = (
                        page.deadline
                        ? page.deadline.diffNow()
                        : dv.duration("14d")
                ).as("hour")
        dur = Math.max(dur, 1)

        // NOTE, чтобы из-за effort оценка задачи не сильно падала
        const effort = Math.pow(page.effort, 0.4)

        let result = page.impact * page.confidence /
                effort / dur
        result *= 100

        return result
                ? Math.floor(result * 1000) / 1000
                : null
}

const currentDv = dv.current()
let pages = dv.pages()
.where(
                page => page.file.path.startsWith(currentDv.file.folder)
        && page.status
        && !page.status?.contains("done")
        && page.status == "🔵in progress"
)
.sort(p => p.status)
.sort(p => p.deadline)
.sort(p => p.impact)
.sort(p => p.confidence)
.sort(p => p.effort)
.array()

let result = []

// status, parent, replace(progress, "current()", PROG) AS progress
for (let page of pages) {
        const _dice = dice(page)
        
        if (!_dice)
                continue

        result.push(
                [
                        page.file.link,
                        page.status,
                        page.date,
                        _dice,
                        page.deadline,
                        page.impact,
                        page.confidence,
                        page.effort,
                ]
        )
}

result = result.filter(p => p[2] != null)
.sort(
        (a, b) => {
                if (!a[4] && b[4])
                        return 1
                if (!b[4] && a[4])
                        return -1
                if (a[4]?.ts == b[4]?.ts && a[3] <= b[3]) {
                        return 1
                }
                if (a[4]?.ts == b[4]?.ts && a[3] > b[3]) {
                        return -1
                }
                return a[4] > b[4]? 1:-1
        }
)

dv.table(
                ["File", "status", "date", "dice", "deadline", "impact", "confidence", "effort"],
                result
)
