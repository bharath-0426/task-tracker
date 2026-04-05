import { useState } from 'react'
import { useApp } from '../../store/AppContext'

const PERM_LABELS = {
  view: 'View tasks', add: 'Add tasks', edit: 'Edit tasks',
  create: 'Create categories', delete: 'Delete tasks/categories', viewOthers: "View others' tasks",
}

const DEFAULT_PERMS = { view: true, add: false, edit: false, create: false, delete: false, viewOthers: true }

function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange}
      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${checked ? 'bg-black' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </div>
  )
}

export default function UserManagementModal({ tracker, onClose }) {
  const { users, members, currentUser, addMember, updateMember, removeMember } = useApp()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [error, setError] = useState('')
  const [editingPerms, setEditingPerms] = useState(null)
  const [newPerms, setNewPerms] = useState({})

  // Users already in this tracker
  const trackerMemberIds = new Set(members.filter(m => m.trackerId === tracker.id).map(m => m.userId))
  const trackerMembers = members.filter(m => m.trackerId === tracker.id && m.userId !== tracker.managerId)

  // Available users to add (in system, not yet in tracker, not the manager)
  const availableUsers = users.filter(u => !trackerMemberIds.has(u.id) && u.id !== tracker.managerId)

  const handleAdd = (e) => {
    e.preventDefault()
    setError('')
    if (!selectedUserId) { setError('Please select a user.'); return }
    addMember(tracker.id, selectedUserId, { ...DEFAULT_PERMS })
    setSelectedUserId('')
  }

  const startEdit = (userId, perms) => { setEditingPerms(userId); setNewPerms({ ...perms }) }
  const toggle = (key) => setNewPerms(p => ({ ...p, [key]: !p[key] }))
  const savePerms = (userId) => { updateMember(tracker.id, userId, newPerms); setEditingPerms(null) }
  const getUserById = (id) => users.find(u => u.id === id)

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-black">Manage Users</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Add member */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Add member from directory</label>
            <form onSubmit={handleAdd} className="flex gap-2">
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-black transition-colors bg-white">
                <option value="">Select a user...</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                ))}
              </select>
              <button type="submit"
                className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Add
              </button>
            </form>
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
            {availableUsers.length === 0 && (
              <p className="text-xs text-gray-400 mt-1.5">All users in the system are already members.</p>
            )}
          </div>

          {/* Manager */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Manager</p>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-black">{getUserById(tracker.managerId)?.name}</p>
                <p className="text-xs text-gray-400">{getUserById(tracker.managerId)?.email}</p>
              </div>
              <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">Manager</span>
            </div>
          </div>

          {/* Members */}
          {trackerMembers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Members ({trackerMembers.length})</p>
              <div className="space-y-2">
                {trackerMembers.map(member => {
                  const user = getUserById(member.userId)
                  if (!user) return null
                  return (
                    <div key={member.userId} className="border border-gray-100 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-3">
                        <div>
                          <p className="text-sm font-medium text-black">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => editingPerms === member.userId ? setEditingPerms(null) : startEdit(member.userId, member.permissions)}
                            className="text-xs text-gray-500 hover:text-black transition-colors">
                            {editingPerms === member.userId ? 'Cancel' : 'Permissions'}
                          </button>
                          <button onClick={() => removeMember(tracker.id, member.userId)}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
                        </div>
                      </div>

                      {editingPerms === member.userId && (
                        <div className="border-t border-gray-50 px-3 pb-3 pt-1">
                          {Object.entries(PERM_LABELS).map(([key, label]) => (
                            <label key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer">
                              <span className="text-sm text-gray-700">{label}</span>
                              <Toggle checked={!!newPerms[key]} onChange={() => toggle(key)} />
                            </label>
                          ))}
                          <button onClick={() => savePerms(member.userId)}
                            className="w-full mt-3 py-2 text-xs bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                            Save permissions
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {trackerMembers.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">No members yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
