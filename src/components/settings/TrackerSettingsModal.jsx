import { useState } from 'react'
import { useApp } from '../../store/AppContext'
// Note: BUILTIN_VIEWS are now dynamic systemViews from context

const STATUS_OPTIONS = ['Open', 'In-Progress', 'Done', 'Review', 'Cancelled']
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low']
const STATUS_STYLE = { 'Open': 'bg-gray-100 text-gray-700', 'In-Progress': 'bg-blue-50 text-blue-600', 'Done': 'bg-green-50 text-green-700', 'Review': 'bg-purple-50 text-purple-700', 'Cancelled': 'bg-gray-100 text-gray-400' }
const PRIORITY_STYLE = { 'High': 'bg-red-50 text-red-600', 'Medium': 'bg-gray-100 text-gray-800', 'Low': 'bg-gray-50 text-gray-400' }
const PERM_LABELS = { view: 'View tasks', add: 'Add tasks', edit: 'Edit tasks', create: 'Create categories', delete: 'Delete', viewOthers: "View others' tasks" }
const DEFAULT_PERMS = { view: true, add: false, edit: false, create: false, delete: false, viewOthers: true }


function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${checked ? 'bg-black' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </div>
  )
}

// Inline edit/settings form for a view (gear popout or create)
function ViewForm({ initial, isManagerUser, onSave, onDelete, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [statuses, setStatuses] = useState(initial?.filters?.statuses || [])
  const [priorities, setPriorities] = useState(initial?.filters?.priorities || [])
  const [published, setPublished] = useState(!!initial?.shared)
  const toggle = (arr, setArr, val) => setArr(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val])

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50 mt-1">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">View name</label>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. High priority tasks"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-black bg-white transition-colors" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Status filter <span className="text-gray-300 font-normal">(empty = all)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map(s => (
            <button type="button" key={s} onClick={() => toggle(statuses, setStatuses, s)}
              className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${statuses.includes(s) ? STATUS_STYLE[s] + ' border-current' : 'border-gray-200 text-gray-400'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Priority filter <span className="text-gray-300 font-normal">(empty = all)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRIORITY_OPTIONS.map(p => (
            <button type="button" key={p} onClick={() => toggle(priorities, setPriorities, p)}
              className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${priorities.includes(p) ? PRIORITY_STYLE[p] + ' border-current' : 'border-gray-200 text-gray-400'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      {isManagerUser && (
        <label className="flex items-center gap-3 cursor-pointer">
          <Toggle checked={published} onChange={() => setPublished(p => !p)} />
          <span className="text-xs text-gray-700">Publish to all tracker members</span>
        </label>
      )}
      <div className="flex gap-2 pt-1">
        {onDelete && (
          <button type="button" onClick={onDelete}
            className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 border border-red-100 hover:border-red-300 rounded-lg transition-colors">
            Delete
          </button>
        )}
        <div className="flex gap-2 flex-1 justify-end">
          <button type="button" onClick={onCancel}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-white transition-colors">
            Cancel
          </button>
          <button type="button"
            onClick={() => { if (!name.trim()) return; onSave(name.trim(), { statuses, priorities }, published) }}
            className="px-3 py-1.5 text-xs bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ── General Tab ───────────────────────────────────────
function GeneralTab({ tracker }) {
  const { updateTracker } = useApp()
  const [name, setName] = useState(tracker.name)
  const [progressMode, setProgressMode] = useState(tracker.settings?.progressMode || 'manual')

  const handleSave = () => {
    updateTracker(tracker.id, { name: name.trim() || tracker.name, settings: { ...tracker.settings, progressMode } })
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Tracker name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-black transition-colors" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Progress calculation</label>
        <div className="space-y-2">
          {[{ value: 'manual', label: 'Manual', desc: 'Set progress manually for each task' },
            { value: 'auto', label: 'Auto', desc: 'Auto-calculate from sub-task progress' }].map(opt => (
            <label key={opt.value}
              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${progressMode === opt.value ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <input type="radio" name="progressMode" value={opt.value} checked={progressMode === opt.value}
                onChange={() => setProgressMode(opt.value)} className="mt-0.5 accent-black" />
              <div>
                <p className="text-sm font-medium text-black">{opt.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
      <button onClick={handleSave}
        className="w-full py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
        Save changes
      </button>
    </div>
  )
}

// ── Users Tab ─────────────────────────────────────────
function UsersTab({ tracker }) {
  const { users, members, addMember, updateMember, removeMember } = useApp()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [error, setError] = useState('')
  const [editingPerms, setEditingPerms] = useState(null)
  const [newPerms, setNewPerms] = useState({})

  const trackerMemberIds = new Set(members.filter(m => m.trackerId === tracker.id).map(m => m.userId))
  const trackerMembers = members.filter(m => m.trackerId === tracker.id && m.userId !== tracker.managerId)
  const availableUsers = users.filter(u => !trackerMemberIds.has(u.id) && u.id !== tracker.managerId)
  const getUserById = (id) => users.find(u => u.id === id)

  const handleAdd = (e) => {
    e.preventDefault()
    setError('')
    if (!selectedUserId) { setError('Please select a user.'); return }
    addMember(tracker.id, selectedUserId, { ...DEFAULT_PERMS })
    setSelectedUserId('')
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Add member</label>
        <form onSubmit={handleAdd} className="flex gap-2">
          <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-black bg-white transition-colors">
            <option value="">Select a user...</option>
            {availableUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name}{u.employeeCode ? ` · ${u.employeeCode}` : ''}
              </option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">Add</button>
        </form>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {availableUsers.length === 0 && <p className="text-xs text-gray-400 mt-1">All users are already members.</p>}
      </div>

      {/* Manager */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-black">{getUserById(tracker.managerId)?.name}</span>
            {getUserById(tracker.managerId)?.employeeCode && (
              <span className="text-xs font-mono text-gray-400">{getUserById(tracker.managerId).employeeCode}</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{getUserById(tracker.managerId)?.email}</p>
        </div>
        <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">Manager</span>
      </div>

      {trackerMembers.map(member => {
        const user = getUserById(member.userId)
        if (!user) return null
        return (
          <div key={member.userId} className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-black">{user.name}</span>
                  {user.employeeCode && <span className="text-xs font-mono text-gray-400">{user.employeeCode}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => editingPerms === member.userId ? setEditingPerms(null) : (setEditingPerms(member.userId), setNewPerms({ ...member.permissions }))}
                  className="text-xs text-gray-500 hover:text-black transition-colors">
                  {editingPerms === member.userId ? 'Cancel' : 'Permissions'}
                </button>
                <button onClick={() => removeMember(tracker.id, member.userId)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
              </div>
            </div>
            {editingPerms === member.userId && (
              <div className="border-t border-gray-50 px-3 pb-3 pt-1">
                {Object.entries(PERM_LABELS).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer">
                    <span className="text-sm text-gray-700">{label}</span>
                    <Toggle checked={!!newPerms[key]} onChange={() => setNewPerms(p => ({ ...p, [key]: !p[key] }))} />
                  </label>
                ))}
                <button onClick={() => { updateMember(tracker.id, member.userId, newPerms); setEditingPerms(null) }}
                  className="w-full mt-3 py-2 text-xs bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">Save permissions</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Views Tab ─────────────────────────────────────────
function ViewsTab({ tracker, isManagerUser }) {
  const {
    getMyViews, getPublishedViews, getTrackerViewStore,
    createView, updateView, deleteView, publishView,
    setTrackerDefault, setUserDefault, getDefaultViewId,
    systemViews, isSystemAdmin,
  } = useApp()

  const myViews = getMyViews(tracker.id)
  const publishedViews = getPublishedViews(tracker.id)
  const store = getTrackerViewStore(tracker.id)
  const myDefaultId = getDefaultViewId(tracker.id)
  const trackerDefaultId = store.trackerDefault ?? null

  const [openGear, setOpenGear] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  // Flat list: system views → admin-created tracker built-ins → shared → private
  const adminTrackerViews = publishedViews.filter(v => v.adminCreated)
  const sharedViews = publishedViews.filter(v => !v.adminCreated)

  const allViews = [
    ...systemViews.map(v => ({ ...v, system: true })),
    ...adminTrackerViews.map(v => ({ ...v, builtinTracker: true })),
    ...sharedViews.map(v => ({ ...v, shared: true })),
    ...myViews.map(v => ({ ...v, private: true })),
  ]

  const handleUserDefault = (viewId) => {
    setUserDefault(tracker.id, myDefaultId === viewId ? 'all' : viewId)
  }

  const handleTrackerDefault = (viewId) => {
    setTrackerDefault(tracker.id, trackerDefaultId === viewId ? null : viewId)
  }

  const handleCreate = (name, filters, published) => {
    createView(tracker.id, name, filters, published)
    setShowCreate(false)
  }

  const handleSave = (v, name, filters, newPublished) => {
    const wasShared = !!v.shared
    if (wasShared && !newPublished) {
      publishView(tracker.id, v.id, false)
      updateView(tracker.id, v.id, { name, filters })
    } else if (!wasShared && newPublished) {
      updateView(tracker.id, v.id, { name, filters })
      publishView(tracker.id, v.id, true)
    } else {
      updateView(tracker.id, v.id, { name, filters })
    }
    setOpenGear(null)
  }

  const handleDelete = (v) => {
    deleteView(tracker.id, v.id)
    setOpenGear(null)
  }

  // Can the current user manage this view's gear settings?
  const canManage = (v) => {
    if (v.system) return false           // managed from dashboard by admin only
    if (v.adminCreated) return isSystemAdmin  // locked for non-admins
    if (v.shared) return isManagerUser   // manager can manage shared views
    return true                          // own private view
  }

  return (
    <div className="space-y-2">
      {/* Flat view list */}
      {allViews.map(v => (
        <div key={v.id}>
          <div className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg transition-colors ${openGear === v.id ? 'border-gray-300 bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
            {/* Name + badges */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-medium text-black truncate">{v.name}</span>
              {v.system && (
                <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full flex-shrink-0">System</span>
              )}
              {v.builtinTracker && (
                <span className="text-[10px] font-medium bg-purple-50 text-purple-500 px-1.5 py-0.5 rounded-full flex-shrink-0">Built-in</span>
              )}
              {v.shared && (
                <span className="text-[10px] font-medium bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full flex-shrink-0">Shared</span>
              )}
            </div>

            {/* Gear icon — only for manageable views */}
            {canManage(v) && (
              <button
                onClick={() => setOpenGear(openGear === v.id ? null : v.id)}
                title="View settings"
                className={`p-1 rounded transition-colors flex-shrink-0 ${openGear === v.id ? 'text-black bg-gray-200' : 'text-gray-400 hover:text-black hover:bg-gray-100'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}

            {/* Default View toggle */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-gray-400 whitespace-nowrap">Default</span>
              <Toggle checked={myDefaultId === v.id} onChange={() => handleUserDefault(v.id)} />
            </div>

            {/* Default for all toggle — managers only */}
            {isManagerUser && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px] text-gray-400 whitespace-nowrap">Default for all</span>
                <Toggle checked={trackerDefaultId === v.id} onChange={() => handleTrackerDefault(v.id)} />
              </div>
            )}
          </div>

          {/* Inline settings popout */}
          {openGear === v.id && (
            <ViewForm
              initial={v}
              isManagerUser={isManagerUser}
              onSave={(name, filters, pub) => handleSave(v, name, filters, pub)}
              onDelete={() => handleDelete(v)}
              onCancel={() => setOpenGear(null)}
            />
          )}
        </div>
      ))}

      {/* Create new view */}
      <div className="pt-1">
        {showCreate ? (
          <ViewForm
            isManagerUser={isManagerUser}
            onSave={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        ) : (
          <button onClick={() => setShowCreate(true)}
            className="w-full py-2 text-xs text-gray-400 hover:text-black border border-dashed border-gray-200 rounded-lg transition-colors">
            + Create new view
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main Modal ────────────────────────────────────────
export default function TrackerSettingsModal({ tracker, isManagerUser, onClose, initialTab = 'general' }) {
  const [tab, setTab] = useState(initialTab)
  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'users',   label: 'Users' },
    { id: 'views',   label: 'Views' },
  ]

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <h2 className="text-base font-semibold text-black">Settings · {tracker.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 mt-4">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`pb-3 pr-6 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.id ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {tab === 'general' && <GeneralTab tracker={tracker} />}
          {tab === 'users'   && <UsersTab tracker={tracker} />}
          {tab === 'views'   && <ViewsTab tracker={tracker} isManagerUser={isManagerUser} />}
        </div>
      </div>
    </div>
  )
}
