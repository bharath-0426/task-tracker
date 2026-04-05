import { useState, useRef, useEffect } from 'react'
import { useApp } from '../store/AppContext'
import { storage } from '../utils/storage'
import CategorySection from '../components/tracker/CategorySection'
import TrackerSettingsModal from '../components/settings/TrackerSettingsModal'

function ViewMenuItem({ v, activeViewId, onSelect }) {
  return (
    <button onClick={onSelect}
      className={`flex items-center gap-2 w-full px-4 py-2 text-xs hover:bg-gray-50 transition-colors ${activeViewId === v.id ? 'font-semibold text-black' : 'text-gray-600'}`}>
      {activeViewId === v.id
        ? <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        : <span className="w-3" />
      }
      {v.name}
    </button>
  )
}

const SORT_LABELS = {
  task: 'Task', startDate: 'Start Date', dueDate: 'Due Date',
  duration: 'Duration', progress: 'Progress', status: 'Status',
  priority: 'Priority', owner: 'Owner',
}

const DEFAULT_COLUMNS = [
  { id: 'task',      label: 'Task',       fixed: true,  width: null },
  { id: 'startDate', label: 'Start Date', fixed: false, width: 130  },
  { id: 'dueDate',   label: 'Due Date',   fixed: false, width: 130  },
  { id: 'duration',  label: 'Duration',   fixed: false, width: 120  },
  { id: 'progress',  label: 'Progress',   fixed: false, width: 140  },
  { id: 'status',    label: 'Status',     fixed: false, width: 120  },
  { id: 'priority',  label: 'Priority',   fixed: false, width: 100  },
  { id: 'owner',     label: 'Owner',      fixed: false, width: 140  },
  { id: 'actions',   label: '',           fixed: true,  width: 80   },
]

export default function TrackerPage({ trackerId, onBack }) {
  const {
    trackers, getTrackerCategories, getMemberPermissions, createCategory,
    isManager, updateCategory,
    getMyViews, getPublishedViews, getDefaultViewId,
    systemViews,
  } = useApp()

  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  const [addingCat, setAddingCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  // Expand/collapse subtasks — signal pattern: { expanded: bool, ts: timestamp }
  const [expandSignal, setExpandSignal] = useState(null)
  const [subtasksExpanded, setSubtasksExpanded] = useState(false)
  const [categoriesExpanded, setCategoriesExpanded] = useState(true)

  // View filter — initialize from user/tracker default
  const [activeViewId, setActiveViewId] = useState(() => getDefaultViewId(trackerId))
  const [showViewMenu, setShowViewMenu] = useState(false)
  const viewMenuRef = useRef()

  // Sort: { colId, dir: 'asc'|'desc' } or null for default insertion order
  const [sortConfig, setSortConfig] = useState(null)

  const handleColSort = (colId) => {
    setSortConfig(prev => {
      if (!prev || prev.colId !== colId) return { colId, dir: 'asc' }
      if (prev.dir === 'asc') return { colId, dir: 'desc' }
      return null // third click → back to default
    })
  }

  // Column drag-and-drop
  const [columns, setColumns] = useState(() => {
    const saved = storage.getColOrder(trackerId)
    if (saved) {
      const savedIds = saved.map(c => c.id)
      const missing = DEFAULT_COLUMNS.filter(c => !savedIds.includes(c.id))
      return [...saved, ...missing]
    }
    return DEFAULT_COLUMNS
  })
  const dragColIdx = useRef(null)
  const dragOverIdx = useRef(null)

  const tracker = trackers.find(t => t.id === trackerId)
  const cats = getTrackerCategories(trackerId)
  const permissions = getMemberPermissions(trackerId)
  const manager = isManager(trackerId)

  // Close view menu on outside click
  useEffect(() => {
    const h = (e) => { if (viewMenuRef.current && !viewMenuRef.current.contains(e.target)) setShowViewMenu(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  if (!tracker || !permissions) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      Tracker not found or no access.
      <button onClick={onBack} className="ml-2 underline">Go back</button>
    </div>
  )

  const myViews = getMyViews(trackerId)
  const publishedViews = getPublishedViews(trackerId)
  // admin-created tracker views are in publishedViews with adminCreated:true
  const adminTrackerViews = publishedViews.filter(v => v.adminCreated)
  const sharedViews = publishedViews.filter(v => !v.adminCreated)
  const getAllViews = () => [...systemViews, ...adminTrackerViews, ...sharedViews, ...myViews]

  const _rawView = getAllViews().find(v => v.id === activeViewId) || systemViews[0] || {}
  const activeView = {
    id: activeViewId,
    name: 'All Tasks',
    ..._rawView,
    filters: { statuses: [], priorities: [], ...(_rawView.filters || {}) },
  }
  const filterFn = (activeView.filters.statuses.length > 0 || activeView.filters.priorities.length > 0)
    ? (task) => {
        const { statuses, priorities } = activeView.filters
        if (statuses.length > 0 && !statuses.includes(task.status)) return false
        if (priorities.length > 0 && !priorities.includes(task.priority)) return false
        return true
      }
    : null

  const handleToggleSubtasks = () => {
    const next = !subtasksExpanded
    setSubtasksExpanded(next)
    setExpandSignal({ expanded: next, ts: Date.now() })
  }

  const dragMoved = useRef(false)
  const onColDragStart = (i) => { dragColIdx.current = i; dragMoved.current = false }
  const onColDragOver = (e, i) => { e.preventDefault(); dragOverIdx.current = i; dragMoved.current = true }
  const onColDrop = () => {
    const from = dragColIdx.current, to = dragOverIdx.current
    if (from === null || to === null || from === to) return
    const newCols = [...columns]
    if (newCols[from].fixed || newCols[to].fixed) return
    const [moved] = newCols.splice(from, 1)
    newCols.splice(to, 0, moved)
    setColumns(newCols)
    storage.saveColOrder(trackerId, newCols)
    dragColIdx.current = null; dragOverIdx.current = null
  }

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    createCategory(trackerId, newCatName.trim())
    setNewCatName('')
    setAddingCat(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between flex-shrink-0 gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-black transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Trackers
          </button>
          <span className="text-gray-200">/</span>
          <h1 className="text-sm font-semibold text-black">{tracker.name}</h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Expand / collapse subtasks only */}
          <button onClick={handleToggleSubtasks}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:border-black transition-colors whitespace-nowrap">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h8" />
            </svg>
            {subtasksExpanded ? 'Collapse Sub-tasks' : 'Expand Sub-tasks'}
          </button>

          {/* View filter */}
          <div className="relative" ref={viewMenuRef}>
            <button onClick={() => setShowViewMenu(o => !o)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition-colors whitespace-nowrap ${activeViewId !== 'all' ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              {activeView.name}
              <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showViewMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-1.5 min-w-[210px]">
                {/* System views (global, admin-managed) */}
                {systemViews.map(v => (
                  <ViewMenuItem key={v.id} v={v} activeViewId={activeViewId} onSelect={() => { setActiveViewId(v.id); setShowViewMenu(false) }} />
                ))}

                {/* Admin-created tracker built-ins */}
                {adminTrackerViews.length > 0 && (
                  <>
                    <div className="border-t border-gray-50 mt-1 pt-1 px-4 pb-0.5">
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Built-in</span>
                    </div>
                    {adminTrackerViews.map(v => (
                      <ViewMenuItem key={v.id} v={v} activeViewId={activeViewId} onSelect={() => { setActiveViewId(v.id); setShowViewMenu(false) }} />
                    ))}
                  </>
                )}

                {/* Shared views */}
                {sharedViews.length > 0 && (
                  <>
                    <div className="border-t border-gray-50 mt-1 pt-1 px-4 pb-0.5">
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Shared</span>
                    </div>
                    {sharedViews.map(v => (
                      <ViewMenuItem key={v.id} v={v} activeViewId={activeViewId} onSelect={() => { setActiveViewId(v.id); setShowViewMenu(false) }} />
                    ))}
                  </>
                )}

                {/* My private views */}
                {myViews.length > 0 && (
                  <>
                    <div className="border-t border-gray-50 mt-1 pt-1 px-4 pb-0.5">
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">My Views</span>
                    </div>
                    {myViews.map(v => (
                      <ViewMenuItem key={v.id} v={v} activeViewId={activeViewId} onSelect={() => { setActiveViewId(v.id); setShowViewMenu(false) }} />
                    ))}
                  </>
                )}

                <div className="border-t border-gray-50 mt-1 pt-1">
                  <button onClick={() => { setShowViewMenu(false); setSettingsTab('views'); setShowSettings(true) }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 hover:text-black transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Manage views
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add category */}
          {permissions.create && (
            <button onClick={() => setAddingCat(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:border-black transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Category
            </button>
          )}

          {/* Settings — visible to all members */}
          <button onClick={() => { setSettingsTab('general'); setShowSettings(true) }}
            className="p-1.5 border border-gray-200 rounded-lg hover:border-black transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add category bar */}
      {addingCat && (
        <div className="border-b border-gray-100 px-5 py-3 bg-gray-50 flex-shrink-0">
          <form onSubmit={handleAddCategory} className="flex items-center gap-2 max-w-sm">
            <input autoFocus type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)}
              placeholder="Category name..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-black transition-colors" />
            <button type="submit"
              className="px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">Add</button>
            <button type="button" onClick={() => { setAddingCat(false); setNewCatName('') }}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {cats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-sm text-gray-400 mb-3">No categories yet</p>
            {permissions.create && (
              <button onClick={() => setAddingCat(true)}
                className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                Add your first category
              </button>
            )}
          </div>
        ) : (
          <table className="w-full border-collapse text-sm" style={{ minWidth: 960 }}>
            <thead>
              <tr className="border-b border-gray-100 bg-white sticky top-0 z-10">
                {columns.map((col, i) => {
                  const isActive = sortConfig?.colId === col.id
                  const isSortable = !!col.label // all labeled columns are sortable
                  return (
                    <th key={col.id}
                      draggable={!col.fixed}
                      onDragStart={() => onColDragStart(i)}
                      onDragOver={(e) => onColDragOver(e, i)}
                      onDrop={onColDrop}
                      onClick={() => { if (isSortable && !dragMoved.current) handleColSort(col.id) }}
                      className={`text-left py-2.5 px-2 text-xs font-medium whitespace-nowrap select-none transition-colors
                        ${isActive ? 'text-black' : 'text-gray-400'}
                        ${isSortable ? 'cursor-pointer hover:text-gray-600 hover:bg-gray-50' : ''}`}
                      style={col.id === 'task' ? { paddingLeft: 12 } : { width: col.width }}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {isSortable && (
                          <span className="inline-flex flex-col ml-0.5" style={{ gap: 1 }}>
                            {/* Up arrow — highlighted when asc */}
                            <svg className={`w-2.5 h-2.5 transition-colors ${isActive && sortConfig.dir === 'asc' ? 'text-black' : 'text-gray-300'}`}
                              viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 4l-8 8h16z" />
                            </svg>
                            {/* Down arrow — highlighted when desc */}
                            <svg className={`w-2.5 h-2.5 transition-colors ${isActive && sortConfig.dir === 'desc' ? 'text-black' : 'text-gray-300'}`}
                              viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 20l8-8H4z" />
                            </svg>
                          </span>
                        )}
                        {/* Reset — only shown when this column is actively sorted */}
                        {isActive && (
                          <button
                            onClick={e => { e.stopPropagation(); setSortConfig(null) }}
                            className="ml-1 text-[10px] font-normal text-gray-400 hover:text-black transition-colors"
                          >
                            Reset
                          </button>
                        )}
                      </span>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {cats.map(cat => (
                <CategorySection key={cat.id} category={cat} trackerId={trackerId}
                  permissions={permissions} columns={columns}
                  expandSignal={expandSignal} filterFn={filterFn} sortConfig={sortConfig}
                  onClearFilter={() => setActiveViewId('all')} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showSettings && (
        <TrackerSettingsModal
          tracker={tracker}
          isManagerUser={manager}
          initialTab={settingsTab}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
