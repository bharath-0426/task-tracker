import { useEffect, useState } from 'react'
import { useApp } from '../../store/AppContext'
import { storage } from '../../utils/storage'

const FIELD_ICONS = {
  created:   '✦',
  title:     'T',
  status:    '◉',
  priority:  '▲',
  startDate: '▷',
  dueDate:   '⏱',
  progress:  '%',
  assigneeId:'👤',
  comment:   '💬',
}

export default function TaskAuditPanel({ task, onClose }) {
  const taskId = task.id
  const taskTitle = task.title
  const { users } = useApp()
  const [history, setHistory] = useState([])

  useEffect(() => {
    setHistory(storage.getTaskHistory(taskId).slice().reverse())
  }, [taskId])

  const getUserById = (id) => users.find(u => u.id === id)

  const formatTs = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  const formatValue = (field, val, allUsers) => {
    if (val === null || val === undefined || val === '') return <span className="text-gray-300">—</span>
    if (field === 'assigneeId') {
      const u = allUsers.find(u => u.id === val)
      return u ? u.name : val
    }
    return String(val)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-black">Activity</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{taskTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">No activity recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((event, i) => {
                const author = getUserById(event.userId)
                return (
                  <div key={event.id || i} className="flex gap-3">
                    {/* Icon */}
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-mono text-gray-500">
                      {FIELD_ICONS[event.field] || '·'}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-black">{author?.name || 'Unknown'}</span>
                        {author?.employeeCode && (
                          <span className="text-xs text-gray-400 font-mono">{author.employeeCode}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {event.field === 'created' ? (
                          'Created this task'
                        ) : event.field === 'comment' ? (
                          <>Added a comment: "<span className="font-medium text-black">{event.newValue}</span>"</>
                        ) : (
                          <>
                            Changed <span className="font-medium text-black">{event.label}</span>
                            {event.oldValue !== null && event.oldValue !== undefined && event.oldValue !== '' && (
                              <> from <span className="line-through text-gray-400">{formatValue(event.field, event.oldValue, users)}</span></>
                            )}
                            {' '}to <span className="font-medium text-black">{formatValue(event.field, event.newValue, users)}</span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatTs(event.ts)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
