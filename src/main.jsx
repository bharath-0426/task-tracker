import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './store/AppContext.jsx'
import { getSeedData } from './utils/seedData.js'
import { storage } from './utils/storage.js'

// Seed data on first load (no users in storage yet)
const existingUsers = storage.getUsers()
if (existingUsers.length === 0) {
  const { users, trackers, members, categories, tasks } = getSeedData()
  storage.saveUsers(users)
  storage.saveTrackers(trackers)
  storage.saveMembers(members)
  storage.saveCategories(categories)
  storage.saveTasks(tasks)
} else {
  const seedUsers = getSeedData().users
  let patched = existingUsers

  // Migration: ensure admin@demo.com has isAdmin: true
  if (patched.some(u => u.email.toLowerCase() === 'admin@demo.com' && !u.isAdmin)) {
    patched = patched.map(u =>
      u.email.toLowerCase() === 'admin@demo.com' ? { ...u, isAdmin: true } : u
    )
  }

  // Migration: backfill missing employeeCode from seed data (match by email)
  if (patched.some(u => !u.employeeCode)) {
    patched = patched.map(u => {
      if (u.employeeCode) return u
      const seed = seedUsers.find(s => s.email.toLowerCase() === u.email.toLowerCase())
      return seed?.employeeCode ? { ...u, employeeCode: seed.employeeCode } : u
    })
  }

  storage.saveUsers(patched)
}

// Seed system views if not present
if (storage.getSystemViews().length === 0) {
  storage.saveSystemViews([
    { id: 'all',  name: 'All Tasks',  filters: { statuses: [], priorities: [] } },
    { id: 'open', name: 'Open Tasks', filters: { statuses: ['Open'], priorities: [] } },
  ])
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
