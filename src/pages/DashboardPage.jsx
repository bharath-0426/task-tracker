import { useState } from 'react'
import { useApp } from '../store/AppContext'
import AdminUsersModal from '../components/admin/AdminUsersModal'
import { formatDate } from '../utils/helpers'

const STATUS_OPTIONS = ['Open', 'In-Progress', 'Done', 'Review', 'Cancelled']
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low']
const STATUS_STYLE = { 'Open': 'bg-gray-100 text-gray-700', 'In-Progress': 'bg-blue-50 text-blue-600', 'Done': 'bg-green-50 text-green-700', 'Review': 'bg-purple-50 text-purple-700', 'Cancelled': 'bg-gray-100 text-gray-400' }
const PRIORITY_STYLE = { 'High': 'bg-red-50 text-red-600', 'Medium': 'bg-gray-100 text-gray-800', 'Low': 'bg-gray-50 text-gray-400' }

function SystemViewsModal({ onClose }) {
  const { systemViews, createSystemView, updateSystemView, deleteSystemView } = useApp()
  const [editingId, setEditingId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-black">System Views</h2>
            <p className="text-xs text-gray-400 mt-0.5">Visible to all users across every tracker</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-2">
          {systemViews.map(v => (
            <div key={v.id}>
              {editingId === v.id
                ? <SystemViewForm
                    initial={v}
                    onSave={(name, filters) => { updateSystemView(v.id, { name, filters }); setEditingId(null) }}
                    onCancel={() => setEditingId(null)}
                  />
                : (
                  <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg group/sv">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black">{v.name}</p>
                      <p className="text-xs text-gray-400">
                        {[...(v.filters?.statuses || []), ...(v.filters?.priorities || [])].join(', ') || 'All tasks'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover/sv:opacity-100 transition-all">
                      <button onClick={() => setEditingId(v.id)} className="text-xs text-gray-500 hover:text-black transition-colors">Edit</button>
                      <button onClick={() => deleteSystemView(v.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
                    </div>
                  </div>
                )
              }
            </div>
          ))}

          {showCreate
            ? <SystemViewForm
                onSave={(name, filters) => { createSystemView(name, filters); setShowCreate(false) }}
                onCancel={() => setShowCreate(false)}
              />
            : (
              <button onClick={() => setShowCreate(true)}
                className="w-full py-2 text-xs text-gray-400 hover:text-black border border-dashed border-gray-200 rounded-lg transition-colors">
                + Add system view
              </button>
            )
          }
        </div>
      </div>
    </div>
  )
}

function SystemViewForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [statuses, setStatuses] = useState(initial?.filters?.statuses || [])
  const [priorities, setPriorities] = useState(initial?.filters?.priorities || [])
  const toggle = (arr, setArr, val) => setArr(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val])

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">View name</label>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My open tasks"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-black bg-white transition-colors" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Status filter <span className="text-gray-300 font-normal">(empty = all)</span></label>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map(s => (
            <button type="button" key={s} onClick={() => toggle(statuses, setStatuses, s)}
              className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${statuses.includes(s) ? STATUS_STYLE[s] + ' border-current' : 'border-gray-200 text-gray-400'}`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Priority filter <span className="text-gray-300 font-normal">(empty = all)</span></label>
        <div className="flex flex-wrap gap-1.5">
          {PRIORITY_OPTIONS.map(p => (
            <button type="button" key={p} onClick={() => toggle(priorities, setPriorities, p)}
              className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${priorities.includes(p) ? PRIORITY_STYLE[p] + ' border-current' : 'border-gray-200 text-gray-400'}`}>{p}</button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-white transition-colors">Cancel</button>
        <button type="button" onClick={() => { if (!name.trim()) return; onSave(name.trim(), { statuses, priorities }) }}
          className="px-3 py-1.5 text-xs bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">Save</button>
      </div>
    </div>
  )
}

function CreateTrackerModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const handleSubmit = (e) => { e.preventDefault(); if (!name.trim()) return; onCreate(name.trim()) }
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-black mb-4">New Tracker</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Tracker name</label>
            <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. HR Operations, Q3 Roadmap..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-black transition-colors" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">Create</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DashboardPage({ onOpenTracker }) {
  const { currentUser, getUserTrackers, createTracker, deleteTracker, members, users, tasks, isSystemAdmin, logout } = useApp()
  const [showCreate, setShowCreate] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showSystemViews, setShowSystemViews] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const userTrackers = getUserTrackers()

  const handleCreate = (name) => {
    const tracker = createTracker(name)
    setShowCreate(false)
    onOpenTracker(tracker.id)
  }

  const isManager = (tracker) => tracker.managerId === currentUser.id || currentUser.isAdmin

  const getMemberCount = (trackerId) => members.filter(m => m.trackerId === trackerId).length

  const getManagerName = (managerId) => users.find(u => u.id === managerId)?.name || 'Unknown'

  const getTrackerStats = (trackerId) => {
    const t = tasks.filter(t => t.trackerId === trackerId)
    const total = t.length
    if (total === 0) return null
    const done = t.filter(t => t.status === 'Done').length
    const inProgress = t.filter(t => t.status === 'In-Progress').length
    return { total, done, inProgress, donePct: (done / total) * 100, inProgressPct: (inProgress / total) * 100 }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-black">Task Tracker</span>
        </div>
        <div className="flex items-center gap-3">
          {isSystemAdmin && (
            <>
              <button onClick={() => setShowSystemViews(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:border-black transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                System Views
              </button>
              <button onClick={() => setShowAdmin(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:border-black transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Manage Users
              </button>
            </>
          )}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-600">{currentUser.name.charAt(0)}</span>
            </div>
            <span className="text-xs text-gray-500 hidden sm:block">
              {currentUser.name}
              {currentUser.employeeCode && <span className="text-xs text-gray-400 font-mono ml-1">{currentUser.employeeCode}</span>}
            </span>
            {currentUser.isAdmin && <span className="text-xs bg-black text-white px-1.5 py-0.5 rounded-full">Admin</span>}
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-black transition-colors">Sign out</button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-black">My Trackers</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {userTrackers.length === 0 ? 'No trackers yet' : `${userTrackers.length} tracker${userTrackers.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Tracker
          </button>
        </div>

        {/* List */}
        {userTrackers.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-gray-200 rounded-xl">
            <p className="text-sm text-gray-400 mb-4">No trackers assigned to you yet</p>
            <button onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
              Create a tracker
            </button>
          </div>
        ) : (
          <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
            {/* List header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-gray-50">
              <div className="col-span-5 text-xs font-medium text-gray-400">Name</div>
              <div className="col-span-3 text-xs font-medium text-gray-400">Manager</div>
              <div className="col-span-2 text-xs font-medium text-gray-400">Members</div>
              <div className="col-span-2 text-xs font-medium text-gray-400">Created</div>
            </div>

            {userTrackers.map(tracker => (
              <div key={tracker.id}
                className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center hover:bg-gray-50 transition-colors group cursor-pointer"
                onClick={() => onOpenTracker(tracker.id)}>
                {/* Name */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h12M3 18h8" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-black truncate">{tracker.name}</p>
                    <p className="text-xs text-gray-400 mb-1">{isManager(tracker) ? 'Manager' : 'Member'}</p>
                    {(() => {
                      const stats = getTrackerStats(tracker.id)
                      if (!stats) return null
                      return (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden flex">
                            <div style={{ width: `${stats.donePct}%` }} className="bg-green-400 h-full transition-all" />
                            <div style={{ width: `${stats.inProgressPct}%` }} className="bg-blue-300 h-full transition-all" />
                          </div>
                          <span className="text-[10px] text-gray-400 flex-shrink-0 tabular-nums">
                            {stats.done}/{stats.total}
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Manager */}
                <div className="col-span-3 flex items-center gap-1.5 min-w-0">
                  {(() => {
                    const mgr = users.find(u => u.id === tracker.managerId)
                    return mgr ? (
                      <>
                        <span className="text-sm text-gray-500 truncate">{mgr.name}</span>
                        {mgr.employeeCode && <span className="text-xs text-gray-400 font-mono flex-shrink-0">{mgr.employeeCode}</span>}
                      </>
                    ) : <span className="text-sm text-gray-400">Unknown</span>
                  })()}
                </div>

                {/* Members */}
                <div className="col-span-2 text-sm text-gray-500">
                  {getMemberCount(tracker.id)} member{getMemberCount(tracker.id) !== 1 ? 's' : ''}
                </div>

                {/* Created */}
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {formatDate(tracker.createdAt.slice(0, 10))}
                  </span>
                  {isManager(tracker) && (
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteConfirm(tracker.id) }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all ml-2">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateTrackerModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {showAdmin && <AdminUsersModal onClose={() => setShowAdmin(false)} />}
      {showSystemViews && <SystemViewsModal onClose={() => setShowSystemViews(false)} />}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-black mb-2">Delete tracker?</h2>
            <p className="text-sm text-gray-500 mb-5">This will permanently delete the tracker and all its tasks.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { deleteTracker(deleteConfirm); setDeleteConfirm(null) }}
                className="flex-1 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
