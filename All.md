# без in/out ссылок
```
TABLE date, status
FROM !"templates"
WHERE !file.inlinks
AND !parent
AND status
SORT status, date
```

---

# корень и done
```
TABLE file.inlinks
WHERE !parent
AND contains(status, "🟢done")
AND status
```

---
# Тики
```
TABLE t
WHERE t
```

---
# All

```dataview
TABLE status, date, frequency, parent,
	file.inlinks AS Дети
FROM "databases"
WHERE contains(status, "in progress")
SORT status ASC, date ASC, timeStart
```
---