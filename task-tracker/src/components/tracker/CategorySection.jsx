import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../store/AppContext'
import { sortTasks } from '../../utils/helpers'
import TaskRow from './TaskRow'

export default function CategorySection({ category, trackerId, permissions, columns, expandSignal, filterFn, sortConfig, onClearFilter }) {
  const { updateCategory, deleteCategory, createTask, getCategoryTasks, users } = useApp()
  const [nameEditing, setNameEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef()

  const collapsed = category.collapsed
  const allTasks = getCategoryTasks(category.id, null)
  let topTasks = filterFn ? allTasks.filter(filterFn) : allTasks
  topTasks = sortTasks(topTasks, sortConfig, users)
  const filteredOut = filterFn ? allTasks.length - topTasks.length : 0

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const saveName = () => {
    if (!name.trim()) { setName(category.name); setNameEditing(false); return }
    updateCategory(category.id, { name: name.trim() })
    setNameEditing(false)
  }

  const handleAddTask = (e) => {
    e.stopPropagation()
    if (collapsed) updateCategory(category.id, { collapsed: false })
    createTask(trackerId, category.id, null, 0)
  }

  const handleRowClick = () => {
    if (!nameEditing) updateCategory(category.id, { collapsed: !collapsed })
  }

  const colSpan = columns.length

  return (
    <>
      <tr className="bg-gray-50 border-b border-gray-100 group cursor-pointer select-none" onClick={handleRowClick}>
        <td colSpan={colSpan} className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${collapsed ? '' : 'rotate-90'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>

            {nameEditing && permissions?.edit
              ? <input autoFocus value={name} onChange={e => setName(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  onBlur={saveName}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setName(category.name); setNameEditing(false) } }}
                  className="text-xs font-semibold bg-white border border-gray-200 rounded px-2 py-0.5 outline-none focus:border-black" />
              : <span
                  onClick={e => { if (permissions?.edit) { e.stopPropagation(); setNameEditing(true) } }}
                  className={`text-xs font-semibold text-black tracking-wide uppercase ${permissions?.edit ? 'hover:underline decoration-dotted' : ''}`}>
                  {category.name}
                </span>
            }

            <span className="text-xs text-gray-400 font-normal">
              {topTasks.length} task{topTasks.length !== 1 ? 's' : ''}
              {filteredOut > 0 && (
                <span className="ml-1 text-gray-300">· {filteredOut} hidden</span>
              )}
            </span>

            {permissions?.add && (
              <button onClick={handleAddTask}
                className="opacity-0 group-hover:opacity-100 ml-1 text-xs text-gray-400 hover:text-black transition-all flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add task
              </button>
            )}

            {permissions?.delete && (
              <div ref={menuRef} className="ml-auto relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowMenu(o => !o)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1 min-w-max">
                    <button onClick={() => { deleteCategory(category.id); setShowMenu(false) }}
                      className="block w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-gray-50 transition-colors">
                      Delete category
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>

      {!collapsed && topTasks.map(task => (
        <TaskRow key={task.id} task={task} trackerId={trackerId} permissions={permissions}
          depth={0} columns={columns} expandSignal={expandSignal} sortConfig={sortConfig} />
      ))}

      {/* Empty state when filter hides all tasks */}
      {!collapsed && filterFn && topTasks.length === 0 && (
        <tr className="border-b border-gray-50">
          <td colSpan={colSpan} className="py-4 px-8">
            <span className="text-xs text-gray-400">
              All tasks hidden by active filter.{' '}
              {onClearFilter && (
                <button onClick={onClearFilter}
                  className="underline hover:text-black transition-colors">
                  Show all tasks
                </button>
              )}
            </span>
          </td>
        </tr>
      )}

      {/* Add task row — always visible, more prominent when category is empty */}
      {!collapsed && permissions?.add && (
        <tr className="border-b border-gray-50">
          <td colSpan={colSpan} className="px-3 py-1.5">
            <button onClick={e => { e.stopPropagation(); handleAddTask(e) }}
              className={`flex items-center gap-1 pl-5 text-xs transition-colors hover:text-black ${topTasks.length === 0 && !filterFn ? 'text-gray-400' : 'text-gray-300'}`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add task
            </button>
          </td>
        </tr>
      )}
    </>
  )
}
