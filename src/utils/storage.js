const KEYS = {
  USERS: 'tt_users',
  TRACKERS: 'tt_trackers',
  MEMBERS: 'tt_members',
  CATEGORIES: 'tt_categories',
  TASKS: 'tt_tasks',
  CURRENT_USER: 'tt_current_user',
  VIEWS: 'tt_views',           // { [trackerId]: { published: [], private: { [userId]: [] }, trackerDefault: viewId|null } }
  USER_DEFAULTS: 'tt_udefs',   // { [`${trackerId}_${userId}`]: viewId }
  COMMENTS: 'tt_comments',     // { [taskId]: [...comments] }
  SYSTEM_VIEWS: 'tt_system_views', // [...] global views visible in all trackers
}

const get = (key, fallback = []) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const getObj = (key) => { try { return JSON.parse(localStorage.getItem(key)) || null } catch { return null } }
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val))

export const storage = {
  getUsers: () => get(KEYS.USERS),
  saveUsers: (u) => set(KEYS.USERS, u),
  getCurrentUser: () => getObj(KEYS.CURRENT_USER),
  setCurrentUser: (u) => set(KEYS.CURRENT_USER, u),
  clearCurrentUser: () => localStorage.removeItem(KEYS.CURRENT_USER),

  getTrackers: () => get(KEYS.TRACKERS),
  saveTrackers: (t) => set(KEYS.TRACKERS, t),

  getMembers: () => get(KEYS.MEMBERS),
  saveMembers: (m) => set(KEYS.MEMBERS, m),

  getCategories: () => get(KEYS.CATEGORIES),
  saveCategories: (c) => set(KEYS.CATEGORIES, c),

  getTasks: () => get(KEYS.TASKS),
  saveTasks: (t) => set(KEYS.TASKS, t),

  // Views: { [trackerId]: { published: [], private: { [userId]: [] }, trackerDefault: null } }
  getAllViews: () => get(KEYS.VIEWS, {}),
  saveAllViews: (v) => set(KEYS.VIEWS, v),

  // User default views: { [`${trackerId}_${userId}`]: viewId }
  getUserDefaults: () => get(KEYS.USER_DEFAULTS, {}),
  saveUserDefaults: (d) => set(KEYS.USER_DEFAULTS, d),

  // Comments: { [taskId]: [...] }
  getComments: () => get(KEYS.COMMENTS, {}),
  saveComments: (c) => set(KEYS.COMMENTS, c),

  // System views: global, visible in all trackers
  getSystemViews: () => get(KEYS.SYSTEM_VIEWS, []),
  saveSystemViews: (v) => set(KEYS.SYSTEM_VIEWS, v),

  // Audit history: stored per task, appended
  getTaskHistory: (taskId) => { try { return JSON.parse(localStorage.getItem(`tt_hist_${taskId}`)) || [] } catch { return [] } },
  appendTaskHistory: (taskId, events) => {
    const existing = storage.getTaskHistory(taskId)
    localStorage.setItem(`tt_hist_${taskId}`, JSON.stringify([...existing, ...events]))
  },

  getColOrder: (trackerId) => { try { return JSON.parse(localStorage.getItem(`tt_cols_${trackerId}`)) || null } catch { return null } },
  saveColOrder: (trackerId, cols) => localStorage.setItem(`tt_cols_${trackerId}`, JSON.stringify(cols)),
}

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)
