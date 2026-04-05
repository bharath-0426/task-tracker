import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../store/AppContext'
import { formatDate, getDuration, sortTasks } from '../../utils/helpers'
import CommentPopup from './CommentPopup'
import TaskAuditPanel from './TaskAuditPanel'

const STATUS_OPTIONS = ['Open', 'In-Progress', 'Done', 'Review', 'Cancelled']
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low']

const STATUS_STYLE = {
  'Open':        'bg-gray-100 text-gray-700',
  'In-Progress': 'bg-blue-50 text-blue-600',
  'Done':        'bg-green-50 text-green-700',
  'Review':      'bg-purple-50 text-purple-700',
  'Cancelled':   'bg-gray-100 text-gray-400',
}
const PRIORITY_STYLE = {
  'High':   'bg-red-50 text-red-600',
  'Medium': 'bg-gray-100 text-gray-800',
  'Low':    'bg-gray-50 text-gray-400',
}

function DateCell({ value, onChange, disabled }) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.showPicker?.()
      inputRef.current.focus()
    }
  }, [editing])

  if (disabled) return <span className="text-xs text-gray-500">{formatDate(value)}</span>
  if (editing) return (
    <input ref={inputRef} type="date" value={value || ''}
      onChange={e => { onChange(e.target.value); setEditing(false) }}
      onBlur={() => setEditing(false)}
      className="cell-input text-xs text-gray-600" style={{ width: 110 }} />
  )
  return (
    <span onClick={() => setEditing(true)}
      className="text-xs text-gray-600 cursor-pointer hover:text-black hover:underline decoration-dotted">
      {value ? formatDate(value) : <span className="text-gray-300">Set date</span>}
    </span>
  )
}

function SelectCell({ value, options, styleMap, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => !disabled && setOpen(o => !o)}
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${styleMap[value]} ${!disabled ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>
        {value}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1 min-w-max">
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false) }}
              className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors">
              <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${styleMap[opt]}`}>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProgressCell({ value, taskId, trackerId, onChange, disabled }) {
  const { tasks, trackers } = useApp()
  const isAuto = trackers.find(t => t.id === trackerId)?.settings?.progressMode === 'auto'
  const children = tasks.filter(t => t.parentId === taskId)
  let displayVal = value
  if (isAuto && children.length > 0)
    displayVal = Math.round(children.reduce((s, c) => s + (c.progress || 0), 0) / children.length)
  const pct = Math.min(100, Math.max(0, displayVal || 0))
  const editable = !disabled && !(isAuto && children.length > 0)
  return (
    <div className="flex items-center gap-2" style={{ minWidth: 80 }}>
      <div className="progress-track flex-1"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      {editable
        ? <input type="number" min={0} max={100} value={pct}
            onChange={e => onChange(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="w-9 text-xs text-right border-b border-gray-200 outline-none focus:border-black bg-transparent" />
        : <span className="text-xs text-gray-500 w-9 text-right">{pct}%</span>
      }
    </div>
  )
}

function OwnerCell({ value, trackerId, onChange, disabled }) {
  const { getTrackerMembers } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef()
  const members = getTrackerMembers(trackerId)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const selected = members.find(u => u.id === value)

  if (disabled) return (
    <span className="text-xs text-gray-600">{selected?.name || <span className="text-gray-300">—</span>}</span>
  )

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="text-xs text-gray-600 hover:text-black transition-colors flex items-center gap-1 max-w-[120px] truncate">
        {selected
          ? <><div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-[9px] font-semibold text-gray-600">{selected.name[0]}</div><span className="truncate">{selected.name}</span></>
          : <span className="text-gray-300">Assign</span>
        }
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1 min-w-max max-h-40 overflow-y-auto">
          <button onClick={() => { onChange(null); setOpen(false) }}
            className="block w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-50 transition-colors">
            Unassigned
          </button>
          {members.map(u => (
            <button key={u.id} onClick={() => { onChange(u.id); setOpen(false) }}
              className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${value === u.id ? 'font-semibold' : ''}`}>
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600 flex-shrink-0">{u.name[0]}</div>
              {u.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TaskRow({ task, trackerId, permissions, depth = 0, columns, expandSignal, sortConfig }) {
  const { updateTask, deleteTask, createTask, getCategoryTasks, getTaskComments, isManager, users } = useApp()
  const [titleEditing, setTitleEditing] = useState(task.title === '')
  const [title, setTitle] = useState(task.title)
  const [localExpanded, setLocalExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showAudit, setShowAudit] = useState(false)
  const titleRef = useRef()

  useEffect(() => {
    if (expandSignal !== null) setLocalExpanded(expandSignal.expanded)
  }, [expandSignal?.ts])

  const subtasks = sortTasks(getCategoryTasks(task.categoryId, task.id), sortConfig, users)
  const hasSubtasks = subtasks.length > 0
  const canEdit = permissions?.edit
  const canDelete = permissions?.delete
  const canAdd = permissions?.add
  const isManagerUser = isManager(trackerId)
  const INDENT = depth * 20

  const comments = getTaskComments(task.id)
  const hasComments = comments.length > 0

  // Overdue: due date in the past and task not finished
  const isOverdue = task.dueDate &&
    new Date(task.dueDate + 'T00:00:00') < new Date() &&
    !['Done', 'Cancelled'].includes(task.status)

  useEffect(() => { if (titleEditing && titleRef.current) titleRef.current.focus() }, [titleEditing])

  const saveTitle = () => {
    if (!title.trim()) { deleteTask(task.id); return }
    updateTask(task.id, { title: title.trim() })
    setTitleEditing(false)
  }

  const handleAddSubtask = () => {
    if (depth >= 2) return
    if (!localExpanded) setLocalExpanded(true)
    createTask(trackerId, task.categoryId, task.id, depth + 1)
  }

  const renderCell = (col) => {
    switch (col.id) {
      case 'task':
        return (
          <td key="task"
            className="py-2 pr-2 sticky left-0 bg-white group-hover:bg-gray-50 transition-colors z-10 relative"
            style={{ paddingLeft: `${INDENT + 12}px`, minWidth: 220 }}>

            {/* Tree hierarchy lines — vertical line for each ancestor level */}
            {depth > 0 && Array.from({ length: depth }, (_, i) => (
              <div key={i}
                className="absolute top-0 bottom-0 w-px bg-gray-200"
                style={{ left: `${i * 20 + 20}px` }}
              />
            ))}
            {/* Horizontal connector from the immediate parent's vertical line to content */}
            {depth > 0 && (
              <div className="absolute h-px bg-gray-200"
                style={{ left: `${(depth - 1) * 20 + 20}px`, width: '12px', top: '50%' }}
              />
            )}

            <div className="flex items-center gap-1.5">
              {/* Expand arrow */}
              <button onClick={() => setLocalExpanded(e => !e)}
                className={`w-4 h-4 flex items-center justify-center flex-shrink-0 transition-colors ${hasSubtasks ? 'text-gray-300 hover:text-gray-600' : 'opacity-0 pointer-events-none'}`}>
                <svg className={`w-3 h-3 transition-transform ${localExpanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Subtask count badge when collapsed */}
              {hasSubtasks && !localExpanded && (
                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 rounded px-1 leading-4 flex-shrink-0">
                  {subtasks.length}
                </span>
              )}

              {titleEditing && canEdit
                ? <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { if (!task.title) deleteTask(task.id); else { setTitle(task.title); setTitleEditing(false) } } }}
                    className="cell-input flex-1 text-sm" placeholder="Task name..." />
                : <span onClick={() => canEdit && setTitleEditing(true)}
                    className={`text-sm flex-1 leading-snug select-none ${canEdit ? 'cursor-text' : ''} ${task.status === 'Cancelled' ? 'line-through text-gray-400' : 'text-black'}`}>
                    {task.title || <span className="text-gray-300 italic">Untitled</span>}
                  </span>
              }

              {/* + sub — hover only, darker text */}
              {canAdd && depth < 2 && hovered && !titleEditing && (
                <button onClick={handleAddSubtask}
                  className="flex-shrink-0 text-xs text-gray-500 hover:text-black transition-colors whitespace-nowrap ml-1">
                  + sub
                </button>
              )}

              {/* Comment icon — always visible if has comments, else on row hover */}
              <button
                onClick={e => { e.stopPropagation(); setShowComments(true) }}
                title="Comments"
                className={`flex-shrink-0 p-0.5 rounded transition-colors ${hasComments ? 'text-blue-500 hover:text-blue-700' : 'text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100'}`}>
                <svg className="w-3.5 h-3.5" fill={hasComments ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>
          </td>
        )
      case 'startDate':
        return <td key="startDate" className="py-2 px-2" style={{ width: col.width }}>
          <DateCell value={task.startDate} onChange={v => updateTask(task.id, { startDate: v })} disabled={!canEdit} />
        </td>
      case 'dueDate':
        return (
          <td key="dueDate" className="py-2 px-2" style={{ width: col.width }}>
            <span className={isOverdue && !titleEditing ? 'text-red-500' : ''}>
              <DateCell value={task.dueDate} onChange={v => updateTask(task.id, { dueDate: v })} disabled={!canEdit} />
            </span>
          </td>
        )
      case 'duration':
        return <td key="duration" className="py-2 px-2" style={{ width: col.width }}>
          {(() => { const info = getDuration(task.dueDate); return info ? <span className={`text-xs font-medium ${info.past ? 'text-red-500' : 'text-gray-500'}`}>{info.text}</span> : <span className="text-xs text-gray-300">—</span> })()}
        </td>
      case 'progress':
        return <td key="progress" className="py-2 px-2" style={{ width: col.width }}>
          <ProgressCell value={task.progress} taskId={task.id} trackerId={trackerId}
            onChange={v => updateTask(task.id, { progress: v })} disabled={!canEdit} />
        </td>
      case 'status':
        return <td key="status" className="py-2 px-2" style={{ width: col.width }}>
          <SelectCell value={task.status} options={STATUS_OPTIONS} styleMap={STATUS_STYLE}
            onChange={v => updateTask(task.id, { status: v })} disabled={!canEdit} />
        </td>
      case 'priority':
        return <td key="priority" className="py-2 px-2" style={{ width: col.width }}>
          <SelectCell value={task.priority} options={PRIORITY_OPTIONS} styleMap={PRIORITY_STYLE}
            onChange={v => updateTask(task.id, { priority: v })} disabled={!canEdit} />
        </td>
      case 'owner':
        return <td key="owner" className="py-2 px-2" style={{ width: col.width }}>
          <OwnerCell value={task.assigneeId} trackerId={trackerId}
            onChange={v => updateTask(task.id, { assigneeId: v })} disabled={!canEdit} />
        </td>
      case 'actions':
        return (
          <td key="actions" className="py-2 px-2" style={{ width: col.width }}>
            <div className="flex items-center justify-end gap-1">
              {/* Audit — always visible, subtle */}
              <button onClick={() => setShowAudit(true)} title="Activity history"
                className="p-1 rounded transition-colors text-gray-300 hover:text-black hover:bg-gray-100">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Delete — always visible with inline confirmation */}
              {canDelete && (
                deleteConfirm
                  ? <div className="flex items-center gap-0.5">
                      <span className="text-[10px] text-red-400 whitespace-nowrap">Delete?</span>
                      <button onClick={() => deleteTask(task.id)}
                        className="text-[10px] text-red-500 hover:text-red-700 font-semibold px-1 py-0.5 rounded hover:bg-red-50 transition-colors">
                        Yes
                      </button>
                      <button onClick={() => setDeleteConfirm(false)}
                        className="text-[10px] text-gray-400 hover:text-gray-600 px-1 py-0.5 rounded hover:bg-gray-100 transition-colors">
                        No
                      </button>
                    </div>
                  : <button onClick={() => setDeleteConfirm(true)}
                      className="p-1 rounded hover:bg-gray-100 transition-colors">
                      <svg className="w-3.5 h-3.5 text-gray-300 hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
              )}
            </div>
          </td>
        )
      default: return null
    }
  }

  return (
    <>
      <tr className="border-b border-gray-50 group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setDeleteConfirm(false) }}>
        {columns.map(col => renderCell(col))}
      </tr>
      {localExpanded && subtasks.map(st => (
        <TaskRow key={st.id} task={st} trackerId={trackerId} permissions={permissions}
          depth={depth + 1} columns={columns} expandSignal={expandSignal} sortConfig={sortConfig} />
      ))}
      {showComments && (
        <CommentPopup task={task} trackerId={trackerId} permissions={permissions}
          isManagerUser={isManagerUser} onClose={() => setShowComments(false)} />
      )}
      {showAudit && (
        <TaskAuditPanel task={task} onClose={() => setShowAudit(false)} />
      )}
    </>
  )
}
