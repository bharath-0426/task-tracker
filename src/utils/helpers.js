const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const STATUS_ORDER  = ['Open', 'In-Progress', 'Review', 'Done', 'Cancelled']
const PRIORITY_ORDER = ['High', 'Medium', 'Low']

export const sortTasks = (tasks, sortConfig, users = []) => {
  if (!sortConfig?.colId) return tasks
  const { colId, dir } = sortConfig
  const mult = dir === 'asc' ? 1 : -1
  return [...tasks].sort((a, b) => {
    let av, bv
    switch (colId) {
      case 'task':
        av = (a.title || '').toLowerCase(); bv = (b.title || '').toLowerCase(); break
      case 'startDate':
        av = a.startDate || ''; bv = b.startDate || ''; break
      case 'dueDate':
      case 'duration':
        av = a.dueDate || ''; bv = b.dueDate || ''; break
      case 'progress':
        av = a.progress || 0; bv = b.progress || 0; break
      case 'status':
        av = STATUS_ORDER.indexOf(a.status); bv = STATUS_ORDER.indexOf(b.status); break
      case 'priority':
        av = PRIORITY_ORDER.indexOf(a.priority); bv = PRIORITY_ORDER.indexOf(b.priority); break
      case 'owner':
        av = (users.find(u => u.id === a.assigneeId)?.name || '').toLowerCase()
        bv = (users.find(u => u.id === b.assigneeId)?.name || '').toLowerCase(); break
      default: return 0
    }
    if (av < bv) return -1 * mult
    if (av > bv) return 1 * mult
    return 0
  })
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export const getDuration = (dueDate) => {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const diff = Math.round((due - today) / 86400000)
  if (diff === 0) return { text: 'Due today', past: false }
  if (diff > 0) return { text: `${diff}d to go`, past: false }
  return { text: `${Math.abs(diff)}d overdue`, past: true }
}
