import { useState } from 'react'
import { useApp } from '../../store/AppContext'

export default function AdminUsersModal({ onClose }) {
  const { users, currentUser, addUser, updateUser, deleteUser } = useApp()
  const [tab, setTab] = useState('list')
  const [form, setForm] = useState({ name: '', email: '', password: '', employeeCode: '', isAdmin: false })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleAdd = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) { setError('Name, email and password are required.'); return }
    const result = addUser(form.name.trim(), form.email.trim(), form.password.trim(), form.employeeCode.trim(), form.isAdmin)
    if (result.error) { setError(result.error); return }
    setSuccess(`User "${form.name}" added.`)
    setForm({ name: '', email: '', password: '', employeeCode: '', isAdmin: false })
    setTimeout(() => setSuccess(''), 3000)
    setTab('list')
  }

  const startEdit = (user) => {
    setEditingId(user.id)
    setEditForm({ name: user.name, email: user.email, employeeCode: user.employeeCode || '', isAdmin: !!user.isAdmin })
  }

  const saveEdit = (id) => { updateUser(id, editForm); setEditingId(null) }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-black">User Management</h2>
            <p className="text-xs text-gray-400 mt-0.5">{users.length} users in system</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setTab(tab === 'add' ? 'list' : 'add'); setError('') }}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${tab === 'add' ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'}`}>
              {tab === 'add' ? 'View list' : '+ Add user'}
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {success && <div className="mb-4 px-3 py-2 bg-green-50 border border-green-100 text-green-700 text-xs rounded-lg">{success}</div>}

          {tab === 'add' && (
            <form onSubmit={handleAdd} className="space-y-3">
              <h3 className="text-sm font-medium text-black mb-3">Add new user</h3>
              {[
                { label: 'Full name', field: 'name', type: 'text', ph: 'Jane Smith' },
                { label: 'Email', field: 'email', type: 'email', ph: 'jane@company.com' },
                { label: 'Password', field: 'password', type: 'text', ph: 'Temporary password' },
                { label: 'Employee code', field: 'employeeCode', type: 'text', ph: 'EMP001' },
              ].map(({ label, field, type, ph }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <input type={type} value={form[field]} onChange={set(field)} placeholder={ph}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-black transition-colors" />
                </div>
              ))}
              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <div onClick={() => setForm(p => ({ ...p, isAdmin: !p.isAdmin }))}
                  className={`w-9 h-5 rounded-full relative transition-colors ${form.isAdmin ? 'bg-black' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isAdmin ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700">Admin privileges</span>
              </label>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button type="submit" className="w-full py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                Add user
              </button>
            </form>
          )}

          {tab === 'list' && (
            <div className="space-y-2">
              {users.map(user => (
                <div key={user.id} className="border border-gray-100 rounded-lg overflow-hidden">
                  {editingId === user.id ? (
                    <div className="p-3 space-y-2">
                      {[
                        { label: 'Name', field: 'name' },
                        { label: 'Email', field: 'email' },
                        { label: 'Employee code', field: 'employeeCode' },
                      ].map(({ label, field }) => (
                        <div key={field}>
                          <label className="block text-xs text-gray-400 mb-0.5">{label}</label>
                          <input value={editForm[field] || ''} onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value }))}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-black" />
                        </div>
                      ))}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div onClick={() => setEditForm(p => ({ ...p, isAdmin: !p.isAdmin }))}
                          className={`w-8 h-4 rounded-full relative transition-colors ${editForm.isAdmin ? 'bg-black' : 'bg-gray-200'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${editForm.isAdmin ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-xs text-gray-600">Admin</span>
                      </label>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(user.id)} className="flex-1 py-1.5 text-xs bg-black text-white rounded-lg">Save</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-black">{user.name}</span>
                          {user.employeeCode && <span className="text-xs font-mono text-gray-400">{user.employeeCode}</span>}
                          {user.isAdmin && <span className="text-xs bg-black text-white px-1.5 py-0.5 rounded-full">Admin</span>}
                          {user.id === currentUser.id && <span className="text-xs text-gray-400">(you)</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(user)} className="text-xs text-gray-500 hover:text-black transition-colors">Edit</button>
                        {user.id !== currentUser.id && (
                          <button onClick={() => deleteUser(user.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
