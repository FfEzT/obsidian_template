[[!_jjj]]
---
###### order By deadline
`$= dv.view('script/dlce');`

---
###### order by DICE
`$= dv.view('script/dlce2');`




###### Prioritise other tasks
```dataviewjs
function dice(page) {  
	let dur = (  
				page.deadline  
				? page.deadline.diffNow()  
				: dv.duration("14d")  
		).as("hour")  
	dur = Math.max(dur, 1) || 1
	
	let effort = page.effort
	if (!effort)
		return null
	// NOTE, чтобы из-за effort оценка задачи не сильно падала  
	effort = Math.pow(effort, 0.4)  
	
	let impact = page.impact || 0.5
	let confidence = page.confidence || 50
	let result = impact * confidence /  
		effort / dur  
	result *= 100  
	
	return Math.floor(result * 1000) / 1000
}  
  
const currentDv = dv.current()  
let pages = dv.pages()  
.where(  
	page => page.file.path.startsWith(currentDv.file.folder)  
	&& page.status
	&& !page.status?.contains("done")  
	&& page.status != "🔵in progress"
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
	result.push(  
		[  
			page.file.link,  
			page.status,  
			page.date,  
			page.duration,  
			_dice,  
			page.deadline,  
			page.impact,  
			page.confidence,  
			page.effort,  
		]  
	)  
}  
  
result = result.filter(p => !p[2])
	//.filter(p => p[4])
	.sort(  
		(a, b) => {  
			return a[4] <= b[4]? 1:-1  
		}  
	)
  
dv.table(  
	["File", "status", "date", "duration", "dice", "deadline", "impact", "confidence", "effort"],  
	result  
)
```