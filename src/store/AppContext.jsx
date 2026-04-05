import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { storage, uid } from '../utils/storage'

const AppContext = createContext(null)

const AUDIT_FIELDS = {
  title: 'Title', status: 'Status', priority: 'Priority',
  startDate: 'Start Date', dueDate: 'Due Date',
  progress: 'Progress', assigneeId: 'Owner',
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(() => {
    const saved = storage.getCurrentUser()
    if (!saved) return null
    const all = storage.getUsers()
    return all.find(u => u.id === saved.id) || saved
  })
  const [users, setUsers] = useState(() => storage.getUsers())
  const [trackers, setTrackers] = useState(() => storage.getTrackers())
  const [members, setMembers] = useState(() => storage.getMembers())
  const [categories, setCategories] = useState(() => storage.getCategories())
  const [tasks, setTasks] = useState(() => storage.getTasks())
  const tasksRef = useRef(tasks)
  useEffect(() => { tasksRef.current = tasks }, [tasks])
  const [allViews, setAllViews] = useState(() => storage.getAllViews())
  const [userDefaults, setUserDefaults] = useState(() => storage.getUserDefaults())
  const [comments, setComments] = useState(() => storage.getComments())
  const [systemViews, setSystemViews] = useState(() => storage.getSystemViews())

  useEffect(() => { storage.saveUsers(users) }, [users])
  useEffect(() => { storage.saveTrackers(trackers) }, [trackers])
  useEffect(() => { storage.saveMembers(members) }, [members])
  useEffect(() => { storage.saveCategories(categories) }, [categories])
  useEffect(() => { storage.saveTasks(tasks) }, [tasks])
  useEffect(() => { storage.saveAllViews(allViews) }, [allViews])
  useEffect(() => { storage.saveUserDefaults(userDefaults) }, [userDefaults])
  useEffect(() => { storage.saveComments(comments) }, [comments])
  useEffect(() => { storage.saveSystemViews(systemViews) }, [systemViews])

  // ── Auth ──────────────────────────────────────────────
  const login = useCallback((email, password) => {
    const all = storage.getUsers()
    const user = all.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!user) return { error: 'Invalid email or password' }
    storage.setCurrentUser(user)
    setCurrentUserState(user)
    return { user }
  }, [])

  const logout = useCallback(() => {
    storage.clearCurrentUser()
    setCurrentUserState(null)
  }, [])

  // Always derive from fresh users array
  const isSystemAdmin = !!users.find(u => u.id === currentUser?.id)?.isAdmin

  // ── Admin: User Management ────────────────────────────
  const addUser = useCallback((name, email, password, employeeCode = '', isAdmin = false) => {
    const current = storage.getUsers()
    if (current.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return { error: 'Email already in use' }
    const user = { id: uid(), name, email, password, employeeCode, isAdmin, createdAt: new Date().toISOString() }
    setUsers(prev => [...prev, user])
    return { user }
  }, [])

  const updateUser = useCallback((id, updates) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u))
    if (currentUser?.id === id) {
      const updated = { ...currentUser, ...updates }
      storage.setCurrentUser(updated)
      setCurrentUserState(updated)
    }
  }, [currentUser])

  const deleteUser = useCallback((id) => {
    if (id === currentUser?.id) return
    setUsers(prev => prev.filter(u => u.id !== id))
    setMembers(prev => prev.filter(m => m.userId !== id))
  }, [currentUser])

  // ── Trackers ──────────────────────────────────────────
  const createTracker = useCallback((name) => {
    const tracker = {
      id: uid(), name, managerId: currentUser.id,
      settings: { progressMode: 'manual' },
      createdAt: new Date().toISOString(),
    }
    setTrackers(prev => [...prev, tracker])
    setMembers(prev => [...prev, {
      trackerId: tracker.id, userId: currentUser.id,
      permissions: { view: true, add: true, edit: true, create: true, delete: true, viewOthers: true },
    }])
    return tracker
  }, [currentUser])

  const updateTracker = useCallback((id, updates) => {
    setTrackers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  const deleteTracker = useCallback((id) => {
    setTrackers(prev => prev.filter(t => t.id !== id))
    setMembers(prev => prev.filter(m => m.trackerId !== id))
    setCategories(prev => prev.filter(c => c.trackerId !== id))
    setTasks(prev => prev.filter(t => t.trackerId !== id))
  }, [])

  // ── Members ───────────────────────────────────────────
  const addMember = useCallback((trackerId, userId, permissions) => {
    if (members.find(m => m.trackerId === trackerId && m.userId === userId)) return
    setMembers(prev => [...prev, { trackerId, userId, permissions }])
  }, [members])

  const updateMember = useCallback((trackerId, userId, permissions) => {
    setMembers(prev => prev.map(m =>
      m.trackerId === trackerId && m.userId === userId ? { ...m, permissions } : m
    ))
  }, [])

  const removeMember = useCallback((trackerId, userId) => {
    setMembers(prev => prev.filter(m => !(m.trackerId === trackerId && m.userId === userId)))
  }, [])

  // ── Categories ────────────────────────────────────────
  const createCategory = useCallback((trackerId, name) => {
    const cat = {
      id: uid(), trackerId, name,
      order: categories.filter(c => c.trackerId === trackerId).length,
      collapsed: false,
    }
    setCategories(prev => [...prev, cat])
    return cat
  }, [categories])

  const updateCategory = useCallback((id, updates) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  const deleteCategory = useCallback((id) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    setTasks(prev => prev.filter(t => t.categoryId !== id))
  }, [])

  // ── Tasks ─────────────────────────────────────────────
  const createTask = useCallback((trackerId, categoryId, parentId = null, level = 0) => {
    const task = {
      id: uid(), trackerId, categoryId, parentId, level,
      title: '', startDate: '', dueDate: '', progress: 0,
      status: 'Open', priority: 'Medium', assigneeId: null,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: tasks.filter(t => t.categoryId === categoryId && t.parentId === parentId).length,
    }
    setTasks(prev => [...prev, task])
    // record creation
    storage.appendTaskHistory(task.id, [{
      id: uid(), field: 'created', label: 'Task created',
      oldValue: null, newValue: task.title || 'Untitled',
      userId: currentUser.id, ts: task.createdAt,
    }])
    return task
  }, [tasks, currentUser])

  const updateTask = useCallback((id, updates) => {
    const task = tasksRef.current.find(t => t.id === id)
    if (task && currentUser) {
      const events = []
      for (const [field, newVal] of Object.entries(updates)) {
        if (!AUDIT_FIELDS[field]) continue
        const oldVal = task[field]
        if (String(oldVal ?? '') !== String(newVal ?? '')) {
          events.push({
            id: uid(), field, label: AUDIT_FIELDS[field],
            oldValue: oldVal, newValue: newVal,
            userId: currentUser.id, ts: new Date().toISOString(),
          })
        }
      }
      if (events.length) storage.appendTaskHistory(id, events)
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
  }, [currentUser])

  const deleteTask = useCallback((id) => {
    const getAllDesc = (tid, all) => {
      const kids = all.filter(t => t.parentId === tid)
      return kids.reduce((acc, k) => [...acc, k.id, ...getAllDesc(k.id, all)], [])
    }
    setTasks(prev => {
      const toDelete = new Set([id, ...getAllDesc(id, prev)])
      return prev.filter(t => !toDelete.has(t.id))
    })
  }, [])

  // ── System Views (admin-managed, visible in all trackers) ─
  const createSystemView = useCallback((name, filters) => {
    setSystemViews(prev => [...prev, { id: uid(), name, filters }])
  }, [])

  const updateSystemView = useCallback((id, updates) => {
    setSystemViews(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v))
  }, [])

  const deleteSystemView = useCallback((id) => {
    setSystemViews(prev => prev.filter(v => v.id !== id))
  }, [])

  // ── Comments ──────────────────────────────────────────
  const addComment = useCallback((taskId, text) => {
    const comment = {
      id: uid(), taskId, text: text.trim(),
      userId: currentUser.id, ts: new Date().toISOString(),
    }
    setComments(prev => ({ ...prev, [taskId]: [comment, ...(prev[taskId] || [])] }))
    storage.appendTaskHistory(taskId, [{
      id: uid(), field: 'comment', label: 'Comment',
      oldValue: null, newValue: text.trim(),
      userId: currentUser.id, ts: comment.ts,
    }])
  }, [currentUser])

  const deleteComment = useCallback((taskId, commentId) => {
    setComments(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || []).filter(c => c.id !== commentId),
    }))
  }, [])

  const getTaskComments = useCallback((taskId) => comments[taskId] || [], [comments])

  // ── Views ─────────────────────────────────────────────
  // Structure: allViews[trackerId] = { published: [...], private: { [userId]: [...] }, trackerDefault: viewId|null }
  const getTrackerViewStore = useCallback((trackerId) => {
    const store = allViews[trackerId]
    if (!store) return { published: [], private: {}, trackerDefault: null }
    return {
      published: store.published || [],
      private: store.private || {},
      trackerDefault: store.trackerDefault ?? null,
    }
  }, [allViews])

  const getMyViews = useCallback((trackerId) => {
    const store = getTrackerViewStore(trackerId)
    return store.private[currentUser?.id] || []
  }, [getTrackerViewStore, currentUser])

  const getPublishedViews = useCallback((trackerId) =>
    getTrackerViewStore(trackerId).published || []
  , [getTrackerViewStore])

  const createView = useCallback((trackerId, name, filters, published = false) => {
    const isAdmin = !!users.find(u => u.id === currentUser?.id)?.isAdmin
    const isPublished = isAdmin ? true : published
    const view = { id: uid(), name, filters, createdBy: currentUser.id, published: isPublished, adminCreated: isAdmin }
    setAllViews(prev => {
      const store = prev[trackerId] || { published: [], private: {}, trackerDefault: null }
      if (isPublished) {
        return { ...prev, [trackerId]: { ...store, published: [...store.published, view] } }
      } else {
        const userViews = store.private[currentUser.id] || []
        return { ...prev, [trackerId]: { ...store, private: { ...store.private, [currentUser.id]: [...userViews, view] } } }
      }
    })
    return view
  }, [currentUser, users])

  const updateView = useCallback((trackerId, viewId, updates) => {
    setAllViews(prev => {
      const store = prev[trackerId] || { published: [], private: {}, trackerDefault: null }
      // check published
      if (store.published.find(v => v.id === viewId)) {
        return { ...prev, [trackerId]: { ...store, published: store.published.map(v => v.id === viewId ? { ...v, ...updates } : v) } }
      }
      // check private
      const userViews = store.private[currentUser.id] || []
      return { ...prev, [trackerId]: { ...store, private: { ...store.private, [currentUser.id]: userViews.map(v => v.id === viewId ? { ...v, ...updates } : v) } } }
    })
  }, [currentUser])

  const deleteView = useCallback((trackerId, viewId) => {
    setAllViews(prev => {
      const store = prev[trackerId] || { published: [], private: {}, trackerDefault: null }
      const userViews = store.private[currentUser.id] || []
      return {
        ...prev,
        [trackerId]: {
          ...store,
          published: store.published.filter(v => v.id !== viewId),
          private: { ...store.private, [currentUser.id]: userViews.filter(v => v.id !== viewId) },
        },
      }
    })
  }, [currentUser])

  const publishView = useCallback((trackerId, viewId, shouldPublish) => {
    setAllViews(prev => {
      const store = prev[trackerId] || { published: [], private: {}, trackerDefault: null }
      const userViews = store.private[currentUser.id] || []
      if (shouldPublish) {
        const view = userViews.find(v => v.id === viewId)
        if (!view) return prev
        return {
          ...prev,
          [trackerId]: {
            ...store,
            published: [...store.published, { ...view, published: true }],
            private: { ...store.private, [currentUser.id]: userViews.filter(v => v.id !== viewId) },
          },
        }
      } else {
        const view = store.published.find(v => v.id === viewId)
        if (!view) return prev
        return {
          ...prev,
          [trackerId]: {
            ...store,
            published: store.published.filter(v => v.id !== viewId),
            private: { ...store.private, [currentUser.id]: [...userViews, { ...view, published: false }] },
          },
        }
      }
    })
  }, [currentUser])

  // Tracker-wide default (manager sets)
  const setTrackerDefault = useCallback((trackerId, viewId) => {
    setAllViews(prev => {
      const store = prev[trackerId] || { published: [], private: {}, trackerDefault: null }
      return { ...prev, [trackerId]: { ...store, trackerDefault: viewId } }
    })
  }, [])

  // Per-user default (overrides tracker default)
  const setUserDefault = useCallback((trackerId, viewId) => {
    const key = `${trackerId}_${currentUser.id}`
    setUserDefaults(prev => ({ ...prev, [key]: viewId }))
  }, [currentUser])

  const getDefaultViewId = useCallback((trackerId) => {
    const key = `${trackerId}_${currentUser?.id}`
    if (userDefaults[key]) return userDefaults[key]
    const store = allViews[trackerId]
    return store?.trackerDefault || 'open'
  }, [userDefaults, allViews, currentUser])

  // ── Helpers ───────────────────────────────────────────
  const getUserTrackers = useCallback(() => {
    if (!currentUser) return []
    if (isSystemAdmin) return trackers
    return trackers.filter(t =>
      t.managerId === currentUser.id ||
      members.some(m => m.trackerId === t.id && m.userId === currentUser.id)
    )
  }, [trackers, members, currentUser, isSystemAdmin])

  const getMemberPermissions = useCallback((trackerId) => {
    if (!currentUser) return null
    if (isSystemAdmin) return { view: true, add: true, edit: true, create: true, delete: true, viewOthers: true }
    const tracker = trackers.find(t => t.id === trackerId)
    if (tracker?.managerId === currentUser.id)
      return { view: true, add: true, edit: true, create: true, delete: true, viewOthers: true }
    return members.find(m => m.trackerId === trackerId && m.userId === currentUser.id)?.permissions || null
  }, [trackers, members, currentUser, isSystemAdmin])

  const getTrackerCategories = useCallback((trackerId) =>
    categories.filter(c => c.trackerId === trackerId).sort((a, b) => a.order - b.order)
  , [categories])

  const getCategoryTasks = useCallback((categoryId, parentId = null) =>
    tasks.filter(t => t.categoryId === categoryId && t.parentId === parentId).sort((a, b) => a.order - b.order)
  , [tasks])

  const isManager = useCallback((trackerId) => {
    if (isSystemAdmin) return true
    return trackers.find(t => t.id === trackerId)?.managerId === currentUser?.id
  }, [trackers, currentUser, isSystemAdmin])

  const getTrackerMembers = useCallback((trackerId) =>
    members.filter(m => m.trackerId === trackerId)
      .map(m => users.find(u => u.id === m.userId))
      .filter(Boolean)
  , [members, users])

  return (
    <AppContext.Provider value={{
      currentUser, users, trackers, members, categories, tasks,
      isSystemAdmin, systemViews,
      login, logout,
      addUser, updateUser, deleteUser,
      createSystemView, updateSystemView, deleteSystemView,
      createTracker, updateTracker, deleteTracker,
      addMember, updateMember, removeMember,
      createCategory, updateCategory, deleteCategory,
      createTask, updateTask, deleteTask,
      addComment, deleteComment, getTaskComments,
      getMyViews, getPublishedViews, getTrackerViewStore,
      createView, updateView, deleteView, publishView,
      setTrackerDefault, setUserDefault, getDefaultViewId,
      getUserTrackers, getMemberPermissions,
      getTrackerCategories, getCategoryTasks, isManager, getTrackerMembers,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
