import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../store/AppContext'

export default function CommentPopup({ task, onClose }) {
  const { getTaskComments, addComment, deleteComment, currentUser, users, isManager } = useApp()
  const [text, setText] = useState('')
  const inputRef = useRef()

  const taskId = task.id
  const comments = getTaskComments(taskId)
  const canDeleteAll = isManager(task.trackerId)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addComment(taskId, text)
    setText('')
  }

  const getUserById = (id) => users.find(u => u.id === id)

  const canDelete = (comment) => {
    if (canDeleteAll) return true
    return comment.userId === currentUser.id
  }

  const formatTs = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-black">Comments</h3>
            {task.title && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{task.title}</p>}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comment list */}
        <div className="max-h-64 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No comments yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {comments.map(c => {
                const author = getUserById(c.userId)
                return (
                  <div key={c.id} className="px-4 py-3 group/c">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600 flex-shrink-0">
                            {author?.name?.[0] || '?'}
                          </div>
                          <span className="text-xs font-semibold text-black">{author?.name || 'Unknown'}</span>
                          {author?.employeeCode && (
                            <span className="text-xs text-gray-400 font-mono">{author.employeeCode}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed">{c.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTs(c.ts)}</p>
                      </div>
                      {canDelete(c) && (
                        <button onClick={() => deleteComment(taskId, c.id)}
                          className="opacity-0 group-hover/c:opacity-100 p-1 hover:bg-gray-100 rounded transition-all flex-shrink-0">
                          <svg className="w-3 h-3 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input ref={inputRef} value={text} onChange={e => setText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-black transition-colors" />
            <button type="submit" disabled={!text.trim()}
              className="px-3 py-2 text-xs bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-30">
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
