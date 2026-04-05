const d = (offsetDays) => {
  const dt = new Date('2026-03-22')
  dt.setDate(dt.getDate() + offsetDays)
  return dt.toISOString().slice(0, 10)
}
const ts = (offsetDays = 0) => {
  const dt = new Date('2026-03-22')
  dt.setDate(dt.getDate() + offsetDays)
  return dt.toISOString()
}

export function getSeedData() {
  // ── Users ──────────────────────────────────────────────
  const users = [
    { id: 'u0',  name: 'Admin User',         email: 'admin@demo.com',       password: 'demo', isAdmin: true, employeeCode: 'ADM001', createdAt: ts(-60) },
    { id: 'u1',  name: 'Sarah Johnson',      email: 'sarah@demo.com',       password: 'demo', employeeCode: 'EMP001', createdAt: ts(-55) },
    { id: 'u2',  name: 'Alex Chen',          email: 'alex@demo.com',        password: 'demo', employeeCode: 'EMP002', createdAt: ts(-54) },
    { id: 'u3',  name: 'Maria Garcia',       email: 'maria@demo.com',       password: 'demo', employeeCode: 'EMP003', createdAt: ts(-53) },
    { id: 'u4',  name: 'James Williams',     email: 'james@demo.com',       password: 'demo', employeeCode: 'EMP004', createdAt: ts(-52) },
    { id: 'u5',  name: 'Emily Davis',        email: 'emily@demo.com',       password: 'demo', employeeCode: 'EMP005', createdAt: ts(-51) },
    { id: 'u6',  name: 'Michael Brown',      email: 'michael@demo.com',     password: 'demo', employeeCode: 'EMP006', createdAt: ts(-50) },
    { id: 'u7',  name: 'Jessica Wilson',     email: 'jessica@demo.com',     password: 'demo', employeeCode: 'EMP007', createdAt: ts(-49) },
    { id: 'u8',  name: 'David Martinez',     email: 'david@demo.com',       password: 'demo', employeeCode: 'EMP008', createdAt: ts(-48) },
    { id: 'u9',  name: 'Lisa Anderson',      email: 'lisa@demo.com',        password: 'demo', employeeCode: 'EMP009', createdAt: ts(-47) },
    { id: 'u10', name: 'Robert Taylor',      email: 'robert@demo.com',      password: 'demo', employeeCode: 'EMP010', createdAt: ts(-46) },
    { id: 'u11', name: 'Jennifer Thomas',    email: 'jennifer@demo.com',    password: 'demo', employeeCode: 'EMP011', createdAt: ts(-45) },
    { id: 'u12', name: 'William Jackson',    email: 'william@demo.com',     password: 'demo', employeeCode: 'EMP012', createdAt: ts(-44) },
    { id: 'u13', name: 'Amanda White',       email: 'amanda@demo.com',      password: 'demo', employeeCode: 'EMP013', createdAt: ts(-43) },
    { id: 'u14', name: 'Christopher Harris', email: 'chris@demo.com',       password: 'demo', employeeCode: 'EMP014', createdAt: ts(-42) },
    { id: 'u15', name: 'Stephanie Lee',      email: 'stephanie@demo.com',   password: 'demo', employeeCode: 'EMP015', createdAt: ts(-41) },
  ]

  // ── Trackers ───────────────────────────────────────────
  const trackers = [
    { id: 't1', name: 'HR Operations',         managerId: 'u0', settings: { progressMode: 'auto' },   createdAt: ts(-50) },
    { id: 't2', name: 'Engineering Roadmap Q2', managerId: 'u2', settings: { progressMode: 'auto' },   createdAt: ts(-45) },
    { id: 't3', name: 'Marketing Campaigns',   managerId: 'u1', settings: { progressMode: 'manual' }, createdAt: ts(-40) },
    { id: 't4', name: 'Sales Pipeline',        managerId: 'u4', settings: { progressMode: 'manual' }, createdAt: ts(-35) },
    { id: 't5', name: 'Product Design',        managerId: 'u3', settings: { progressMode: 'auto' },   createdAt: ts(-30) },
  ]

  const allPerms  = { view: true, add: true, edit: true, create: true, delete: true, viewOthers: true }
  const editPerms = { view: true, add: true, edit: true, create: false, delete: false, viewOthers: true }
  const viewPerms = { view: true, add: false, edit: false, create: false, delete: false, viewOthers: false }

  // ── Members ────────────────────────────────────────────
  const members = [
    // admin – access to all trackers
    { trackerId: 't1', userId: 'u0',  permissions: allPerms },
    { trackerId: 't2', userId: 'u0',  permissions: allPerms },
    { trackerId: 't3', userId: 'u0',  permissions: allPerms },
    { trackerId: 't4', userId: 'u0',  permissions: allPerms },
    { trackerId: 't5', userId: 'u0',  permissions: allPerms },
    // t1 HR – manager u0
    { trackerId: 't1', userId: 'u1',  permissions: allPerms },
    { trackerId: 't1', userId: 'u5',  permissions: editPerms },
    { trackerId: 't1', userId: 'u9',  permissions: editPerms },
    { trackerId: 't1', userId: 'u13', permissions: viewPerms },
    // t2 Engineering – manager u2
    { trackerId: 't2', userId: 'u2',  permissions: allPerms },
    { trackerId: 't2', userId: 'u6',  permissions: allPerms },
    { trackerId: 't2', userId: 'u7',  permissions: editPerms },
    { trackerId: 't2', userId: 'u10', permissions: editPerms },
    { trackerId: 't2', userId: 'u14', permissions: viewPerms },
    // t3 Marketing – manager u1
    { trackerId: 't3', userId: 'u1',  permissions: allPerms },
    { trackerId: 't3', userId: 'u8',  permissions: allPerms },
    { trackerId: 't3', userId: 'u11', permissions: editPerms },
    { trackerId: 't3', userId: 'u15', permissions: editPerms },
    { trackerId: 't3', userId: 'u4',  permissions: viewPerms },
    // t4 Sales – manager u4
    { trackerId: 't4', userId: 'u4',  permissions: allPerms },
    { trackerId: 't4', userId: 'u12', permissions: allPerms },
    { trackerId: 't4', userId: 'u3',  permissions: editPerms },
    { trackerId: 't4', userId: 'u9',  permissions: editPerms },
    // t5 Design – manager u3
    { trackerId: 't5', userId: 'u3',  permissions: allPerms },
    { trackerId: 't5', userId: 'u13', permissions: allPerms },
    { trackerId: 't5', userId: 'u5',  permissions: editPerms },
    { trackerId: 't5', userId: 'u15', permissions: editPerms },
    { trackerId: 't5', userId: 'u2',  permissions: viewPerms },
  ]

  // ── Categories ─────────────────────────────────────────
  const categories = [
    // t1 HR Operations
    { id: 'c1a', trackerId: 't1', name: 'Recruitment',   order: 0, collapsed: false },
    { id: 'c1b', trackerId: 't1', name: 'Onboarding',    order: 1, collapsed: false },
    { id: 'c1c', trackerId: 't1', name: 'Training',      order: 2, collapsed: false },
    { id: 'c1d', trackerId: 't1', name: 'Performance',   order: 3, collapsed: true  },
    // t2 Engineering
    { id: 'c2a', trackerId: 't2', name: 'Backend',       order: 0, collapsed: false },
    { id: 'c2b', trackerId: 't2', name: 'Frontend',      order: 1, collapsed: false },
    { id: 'c2c', trackerId: 't2', name: 'Infrastructure',order: 2, collapsed: false },
    { id: 'c2d', trackerId: 't2', name: 'QA & Testing',  order: 3, collapsed: false },
    // t3 Marketing
    { id: 'c3a', trackerId: 't3', name: 'Social Media',  order: 0, collapsed: false },
    { id: 'c3b', trackerId: 't3', name: 'Content',       order: 1, collapsed: false },
    { id: 'c3c', trackerId: 't3', name: 'Email',         order: 2, collapsed: false },
    // t4 Sales
    { id: 'c4a', trackerId: 't4', name: 'Leads',         order: 0, collapsed: false },
    { id: 'c4b', trackerId: 't4', name: 'Qualified',     order: 1, collapsed: false },
    { id: 'c4c', trackerId: 't4', name: 'Proposals',     order: 2, collapsed: false },
    { id: 'c4d', trackerId: 't4', name: 'Closed Won',    order: 3, collapsed: true  },
    // t5 Product Design
    { id: 'c5a', trackerId: 't5', name: 'Research',      order: 0, collapsed: false },
    { id: 'c5b', trackerId: 't5', name: 'Wireframes',    order: 1, collapsed: false },
    { id: 'c5c', trackerId: 't5', name: 'UI Design',     order: 2, collapsed: false },
  ]

  // ── Tasks ──────────────────────────────────────────────
  const tasks = [
    // ── t1 HR: Recruitment ──
    { id: 'tk1',  trackerId: 't1', categoryId: 'c1a', parentId: null, level: 0, title: 'Post senior engineer openings',     startDate: d(-10), dueDate: d(5),   progress: 80, status: 'In-Progress', priority: 'High',   assigneeId: 'u1',  createdBy: 'u0', createdAt: ts(-10), updatedAt: ts(-1), order: 0 },
    { id: 'tk1a', trackerId: 't1', categoryId: 'c1a', parentId: 'tk1', level: 1, title: 'Write job descriptions',            startDate: d(-10), dueDate: d(-3),  progress: 100,status: 'Done',       priority: 'High',   assigneeId: 'u5',  createdBy: 'u0', createdAt: ts(-10), updatedAt: ts(-4), order: 0 },
    { id: 'tk1b', trackerId: 't1', categoryId: 'c1a', parentId: 'tk1', level: 1, title: 'Post on LinkedIn & job boards',    startDate: d(-3),  dueDate: d(1),   progress: 60, status: 'In-Progress', priority: 'Medium', assigneeId: 'u1',  createdBy: 'u0', createdAt: ts(-10), updatedAt: ts(-1), order: 1 },
    { id: 'tk2',  trackerId: 't1', categoryId: 'c1a', parentId: null, level: 0, title: 'Screen & shortlist candidates',     startDate: d(0),   dueDate: d(14),  progress: 30, status: 'In-Progress', priority: 'High',   assigneeId: 'u9',  createdBy: 'u0', createdAt: ts(-8),  updatedAt: ts(-1), order: 1 },
    { id: 'tk2a', trackerId: 't1', categoryId: 'c1a', parentId: 'tk2', level: 1, title: 'Review 50+ applications',          startDate: d(0),   dueDate: d(7),   progress: 40, status: 'In-Progress', priority: 'High',   assigneeId: 'u9',  createdBy: 'u0', createdAt: ts(-8),  updatedAt: ts(-1), order: 0 },
    { id: 'tk2b', trackerId: 't1', categoryId: 'c1a', parentId: 'tk2', level: 1, title: 'Schedule interviews',              startDate: d(7),   dueDate: d(14),  progress: 0,  status: 'Open',        priority: 'Medium', assigneeId: 'u1',  createdBy: 'u0', createdAt: ts(-8),  updatedAt: ts(-8), order: 1 },
    { id: 'tk3',  trackerId: 't1', categoryId: 'c1a', parentId: null, level: 0, title: 'Intern hiring campaign',            startDate: d(-5),  dueDate: d(20),  progress: 20, status: 'In-Progress', priority: 'Medium', assigneeId: 'u5',  createdBy: 'u0', createdAt: ts(-5),  updatedAt: ts(-2), order: 2 },

    // ── t1 HR: Onboarding ──
    { id: 'tk4',  trackerId: 't1', categoryId: 'c1b', parentId: null, level: 0, title: 'Onboard 3 new hires – April batch', startDate: d(5),   dueDate: d(15),  progress: 0,  status: 'Open',        priority: 'High',   assigneeId: 'u1',  createdBy: 'u0', createdAt: ts(-3),  updatedAt: ts(-3), order: 0 },
    { id: 'tk4a', trackerId: 't1', categoryId: 'c1b', parentId: 'tk4', level: 1, title: 'Prepare onboarding kits',          startDate: d(5),   dueDate: d(8),   progress: 0,  status: 'Open',        priority: 'Medium', assigneeId: 'u9',  createdBy: 'u0', createdAt: ts(-3),  updatedAt: ts(-3), order: 0 },
    { id: 'tk4b', trackerId: 't1', categoryId: 'c1b', parentId: 'tk4', level: 1, title: 'IT setup & access provisioning',   startDate: d(5),   dueDate: d(10),  progress: 0,  status: 'Open',        priority: 'High',   assigneeId: 'u13', createdBy: 'u0', createdAt: ts(-3),  updatedAt: ts(-3), order: 1 },
    { id: 'tk5',  trackerId: 't1', categoryId: 'c1b', parentId: null, level: 0, title: 'Update onboarding documentation',   startDate: d(-15), dueDate: d(-5),  progress: 100,status: 'Done',        priority: 'Low',    assigneeId: 'u5',  createdBy: 'u0', createdAt: ts(-15), updatedAt: ts(-5), order: 1 },

    // ── t1 HR: Training ──
    { id: 'tk6',  trackerId: 't1', categoryId: 'c1c', parentId: null, level: 0, title: 'Q2 Leadership training program',   startDate: d(10),  dueDate: d(40),  progress: 10, status: 'In-Progress', priority: 'Medium', assigneeId: 'u1',  createdBy: 'u0', createdAt: ts(-5),  updatedAt: ts(-1), order: 0 },
    { id: 'tk6a', trackerId: 't1', categoryId: 'c1c', parentId: 'tk6', level: 1, title: 'Select training vendor',           startDate: d(10),  dueDate: d(15),  progress: 50, status: 'In-Progress', priority: 'Medium', assigneeId: 'u9',  createdBy: 'u0', createdAt: ts(-5),  updatedAt: ts(-2), order: 0 },
    { id: 'tk6b', trackerId: 't1', categoryId: 'c1c', parentId: 'tk6', level: 1, title: 'Book venue / virtual setup',       startDate: d(15),  dueDate: d(25),  progress: 0,  status: 'Open',        priority: 'Low',    assigneeId: 'u1',  createdBy: 'u0', createdAt: ts(-5),  updatedAt: ts(-5), order: 1 },
    { id: 'tk7',  trackerId: 't1', categoryId: 'c1c', parentId: null, level: 0, title: 'Compliance training rollout',       startDate: d(-5),  dueDate: d(10),  progress: 70, status: 'In-Progress', priority: 'High',   assigneeId: 'u13', createdBy: 'u0', createdAt: ts(-5),  updatedAt: ts(-1), order: 1 },

    // ── t2 Engineering: Backend ──
    { id: 'tk8',  trackerId: 't2', categoryId: 'c2a', parentId: null, level: 0, title: 'Migrate auth to OAuth 2.0',         startDate: d(-20), dueDate: d(10),  progress: 65, status: 'In-Progress', priority: 'High',   assigneeId: 'u6',  createdBy: 'u2', createdAt: ts(-20), updatedAt: ts(-1), order: 0 },
    { id: 'tk8a', trackerId: 't2', categoryId: 'c2a', parentId: 'tk8', level: 1, title: 'Design token refresh flow',        startDate: d(-20), dueDate: d(-10), progress: 100,status: 'Done',        priority: 'High',   assigneeId: 'u6',  createdBy: 'u2', createdAt: ts(-20), updatedAt: ts(-10),order: 0 },
    { id: 'tk8b', trackerId: 't2', categoryId: 'c2a', parentId: 'tk8', level: 1, title: 'Implement JWT validation',         startDate: d(-10), dueDate: d(0),   progress: 80, status: 'In-Progress', priority: 'High',   assigneeId: 'u10', createdBy: 'u2', createdAt: ts(-10), updatedAt: ts(-1), order: 1 },
    { id: 'tk8c', trackerId: 't2', categoryId: 'c2a', parentId: 'tk8', level: 1, title: 'Write auth unit tests',            startDate: d(0),   dueDate: d(5),   progress: 20, status: 'In-Progress', priority: 'Medium', assigneeId: 'u14', createdBy: 'u2', createdAt: ts(-5),  updatedAt: ts(-1), order: 2 },
    { id: 'tk9',  trackerId: 't2', categoryId: 'c2a', parentId: null, level: 0, title: 'REST API rate limiting',            startDate: d(-5),  dueDate: d(8),   progress: 40, status: 'In-Progress', priority: 'Medium', assigneeId: 'u10', createdBy: 'u2', createdAt: ts(-5),  updatedAt: ts(-2), order: 1 },
    { id: 'tk9a', trackerId: 't2', categoryId: 'c2a', parentId: 'tk9', level: 1, title: 'Evaluate Redis vs in-memory',      startDate: d(-5),  dueDate: d(-2),  progress: 100,status: 'Done',        priority: 'Medium', assigneeId: 'u6',  createdBy: 'u2', createdAt: ts(-5),  updatedAt: ts(-2), order: 0 },
    { id: 'tk10', trackerId: 't2', categoryId: 'c2a', parentId: null, level: 0, title: 'Database query optimisation',       startDate: d(0),   dueDate: d(20),  progress: 10, status: 'Open',        priority: 'Medium', assigneeId: 'u6',  createdBy: 'u2', createdAt: ts(-2),  updatedAt: ts(-1), order: 2 },

    // ── t2 Engineering: Frontend ──
    { id: 'tk11', trackerId: 't2', categoryId: 'c2b', parentId: null, level: 0, title: 'Dashboard redesign',                startDate: d(-15), dueDate: d(15),  progress: 55, status: 'In-Progress', priority: 'High',   assigneeId: 'u7',  createdBy: 'u2', createdAt: ts(-15), updatedAt: ts(-1), order: 0 },
    { id: 'tk11a',trackerId: 't2', categoryId: 'c2b', parentId: 'tk11',level: 1, title: 'Figma mockup review',              startDate: d(-15), dueDate: d(-8),  progress: 100,status: 'Done',        priority: 'High',   assigneeId: 'u7',  createdBy: 'u2', createdAt: ts(-15), updatedAt: ts(-8), order: 0 },
    { id: 'tk11b',trackerId: 't2', categoryId: 'c2b', parentId: 'tk11',level: 1, title: 'Build reusable component library', startDate: d(-8),  dueDate: d(10),  progress: 60, status: 'In-Progress', priority: 'High',   assigneeId: 'u7',  createdBy: 'u2', createdAt: ts(-8),  updatedAt: ts(-1), order: 1 },
    { id: 'tk12', trackerId: 't2', categoryId: 'c2b', parentId: null, level: 0, title: 'Mobile responsiveness pass',        startDate: d(5),   dueDate: d(25),  progress: 0,  status: 'Open',        priority: 'Medium', assigneeId: 'u14', createdBy: 'u2', createdAt: ts(-2),  updatedAt: ts(-2), order: 1 },

    // ── t2 Engineering: Infrastructure ──
    { id: 'tk13', trackerId: 't2', categoryId: 'c2c', parentId: null, level: 0, title: 'Set up CI/CD pipeline',             startDate: d(-30), dueDate: d(-10), progress: 100,status: 'Done',        priority: 'High',   assigneeId: 'u10', createdBy: 'u2', createdAt: ts(-30), updatedAt: ts(-10),order: 0 },
    { id: 'tk14', trackerId: 't2', categoryId: 'c2c', parentId: null, level: 0, title: 'Kubernetes cluster migration',      startDate: d(-5),  dueDate: d(30),  progress: 25, status: 'In-Progress', priority: 'High',   assigneeId: 'u6',  createdBy: 'u2', createdAt: ts(-5),  updatedAt: ts(-1), order: 1 },
    { id: 'tk14a',trackerId: 't2', categoryId: 'c2c', parentId: 'tk14',level: 1, title: 'Provision staging cluster',        startDate: d(-5),  dueDate: d(5),   progress: 60, status: 'In-Progress', priority: 'High',   assigneeId: 'u10', createdBy: 'u2', createdAt: ts(-5),  updatedAt: ts(-1), order: 0 },
    { id: 'tk14b',trackerId: 't2', categoryId: 'c2c', parentId: 'tk14',level: 1, title: 'Migrate services one by one',      startDate: d(5),   dueDate: d(25),  progress: 0,  status: 'Open',        priority: 'Medium', assigneeId: 'u6',  createdBy: 'u2', createdAt: ts(-5),  updatedAt: ts(-5), order: 1 },

    // ── t3 Marketing: Social Media ──
    { id: 'tk15', trackerId: 't3', categoryId: 'c3a', parentId: null, level: 0, title: 'Q2 social content calendar',        startDate: d(-10), dueDate: d(5),   progress: 75, status: 'In-Progress', priority: 'High',   assigneeId: 'u8',  createdBy: 'u1', createdAt: ts(-10), updatedAt: ts(-1), order: 0 },
    { id: 'tk15a',trackerId: 't3', categoryId: 'c3a', parentId: 'tk15',level: 1, title: 'LinkedIn post schedule',           startDate: d(-10), dueDate: d(-5),  progress: 100,status: 'Done',        priority: 'Medium', assigneeId: 'u11', createdBy: 'u1', createdAt: ts(-10), updatedAt: ts(-5), order: 0 },
    { id: 'tk15b',trackerId: 't3', categoryId: 'c3a', parentId: 'tk15',level: 1, title: 'Instagram reels production',       startDate: d(-5),  dueDate: d(5),   progress: 50, status: 'In-Progress', priority: 'Medium', assigneeId: 'u15', createdBy: 'u1', createdAt: ts(-5),  updatedAt: ts(-1), order: 1 },
    { id: 'tk16', trackerId: 't3', categoryId: 'c3a', parentId: null, level: 0, title: 'Influencer partnership outreach',   startDate: d(0),   dueDate: d(20),  progress: 15, status: 'In-Progress', priority: 'Medium', assigneeId: 'u11', createdBy: 'u1', createdAt: ts(-2),  updatedAt: ts(-1), order: 1 },
    { id: 'tk16a',trackerId: 't3', categoryId: 'c3a', parentId: 'tk16',level: 1, title: 'Identify top 20 influencers',      startDate: d(0),   dueDate: d(5),   progress: 30, status: 'In-Progress', priority: 'Medium', assigneeId: 'u15', createdBy: 'u1', createdAt: ts(-2),  updatedAt: ts(-1), order: 0 },

    // ── t3 Marketing: Content ──
    { id: 'tk17', trackerId: 't3', categoryId: 'c3b', parentId: null, level: 0, title: 'Publish 4 whitepapers this quarter',startDate: d(-20), dueDate: d(60),  progress: 50, status: 'In-Progress', priority: 'High',   assigneeId: 'u8',  createdBy: 'u1', createdAt: ts(-20), updatedAt: ts(-2), order: 0 },
    { id: 'tk17a',trackerId: 't3', categoryId: 'c3b', parentId: 'tk17',level: 1, title: 'Whitepaper 1 – AI in HR',          startDate: d(-20), dueDate: d(0),   progress: 100,status: 'Done',        priority: 'High',   assigneeId: 'u11', createdBy: 'u1', createdAt: ts(-20), updatedAt: ts(0),  order: 0 },
    { id: 'tk17b',trackerId: 't3', categoryId: 'c3b', parentId: 'tk17',level: 1, title: 'Whitepaper 2 – Remote Culture',    startDate: d(0),   dueDate: d(30),  progress: 20, status: 'In-Progress', priority: 'Medium', assigneeId: 'u15', createdBy: 'u1', createdAt: ts(-5),  updatedAt: ts(-1), order: 1 },
    { id: 'tk18', trackerId: 't3', categoryId: 'c3b', parentId: null, level: 0, title: 'SEO blog refresh',                  startDate: d(-5),  dueDate: d(15),  progress: 35, status: 'In-Progress', priority: 'Medium', assigneeId: 'u15', createdBy: 'u1', createdAt: ts(-5),  updatedAt: ts(-2), order: 1 },

    // ── t3 Marketing: Email ──
    { id: 'tk19', trackerId: 't3', categoryId: 'c3c', parentId: null, level: 0, title: 'Monthly newsletter – April',        startDate: d(0),   dueDate: d(8),   progress: 20, status: 'In-Progress', priority: 'High',   assigneeId: 'u11', createdBy: 'u1', createdAt: ts(-2),  updatedAt: ts(-1), order: 0 },
    { id: 'tk20', trackerId: 't3', categoryId: 'c3c', parentId: null, level: 0, title: 'Re-engagement email sequence',      startDate: d(5),   dueDate: d(20),  progress: 0,  status: 'Open',        priority: 'Medium', assigneeId: 'u8',  createdBy: 'u1', createdAt: ts(-1),  updatedAt: ts(-1), order: 1 },

    // ── t4 Sales: Leads ──
    { id: 'tk21', trackerId: 't4', categoryId: 'c4a', parentId: null, level: 0, title: 'Prospecting – APAC region',         startDate: d(-15), dueDate: d(15),  progress: 40, status: 'In-Progress', priority: 'High',   assigneeId: 'u12', createdBy: 'u4', createdAt: ts(-15), updatedAt: ts(-1), order: 0 },
    { id: 'tk21a',trackerId: 't4', categoryId: 'c4a', parentId: 'tk21',level: 1, title: 'Build target account list',        startDate: d(-15), dueDate: d(-5),  progress: 100,status: 'Done',        priority: 'High',   assigneeId: 'u12', createdBy: 'u4', createdAt: ts(-15), updatedAt: ts(-5), order: 0 },
    { id: 'tk21b',trackerId: 't4', categoryId: 'c4a', parentId: 'tk21',level: 1, title: 'Cold outreach via LinkedIn',       startDate: d(-5),  dueDate: d(10),  progress: 30, status: 'In-Progress', priority: 'High',   assigneeId: 'u3',  createdBy: 'u4', createdAt: ts(-5),  updatedAt: ts(-1), order: 1 },
    { id: 'tk22', trackerId: 't4', categoryId: 'c4a', parentId: null, level: 0, title: 'Tradeshow lead capture – May Expo', startDate: d(30),  dueDate: d(35),  progress: 0,  status: 'Open',        priority: 'Medium', assigneeId: 'u9',  createdBy: 'u4', createdAt: ts(-3),  updatedAt: ts(-3), order: 1 },

    // ── t4 Sales: Qualified ──
    { id: 'tk23', trackerId: 't4', categoryId: 'c4b', parentId: null, level: 0, title: 'Discovery calls – 12 accounts',    startDate: d(-5),  dueDate: d(10),  progress: 50, status: 'In-Progress', priority: 'High',   assigneeId: 'u3',  createdBy: 'u4', createdAt: ts(-5),  updatedAt: ts(-1), order: 0 },
    { id: 'tk23a',trackerId: 't4', categoryId: 'c4b', parentId: 'tk23',level: 1, title: 'Prepare discovery questionnaire', startDate: d(-5),  dueDate: d(-3),  progress: 100,status: 'Done',        priority: 'Medium', assigneeId: 'u12', createdBy: 'u4', createdAt: ts(-5),  updatedAt: ts(-3), order: 0 },
    { id: 'tk24', trackerId: 't4', categoryId: 'c4b', parentId: null, level: 0, title: 'Needs analysis & scoring',         startDate: d(0),   dueDate: d(15),  progress: 20, status: 'In-Progress', priority: 'Medium', assigneeId: 'u12', createdBy: 'u4', createdAt: ts(-2),  updatedAt: ts(-1), order: 1 },

    // ── t4 Sales: Proposals ──
    { id: 'tk25', trackerId: 't4', categoryId: 'c4c', parentId: null, level: 0, title: 'Enterprise proposal – Acme Corp',  startDate: d(-3),  dueDate: d(7),   progress: 60, status: 'In-Progress', priority: 'High',   assigneeId: 'u9',  createdBy: 'u4', createdAt: ts(-3),  updatedAt: ts(-1), order: 0 },
    { id: 'tk25a',trackerId: 't4', categoryId: 'c4c', parentId: 'tk25',level: 1, title: 'Pricing model finalisation',      startDate: d(-3),  dueDate: d(2),   progress: 80, status: 'In-Progress', priority: 'High',   assigneeId: 'u3',  createdBy: 'u4', createdAt: ts(-3),  updatedAt: ts(-1), order: 0 },
    { id: 'tk25b',trackerId: 't4', categoryId: 'c4c', parentId: 'tk25',level: 1, title: 'Executive deck preparation',      startDate: d(2),   dueDate: d(6),   progress: 0,  status: 'Open',        priority: 'High',   assigneeId: 'u12', createdBy: 'u4', createdAt: ts(-3),  updatedAt: ts(-3), order: 1 },
    { id: 'tk26', trackerId: 't4', categoryId: 'c4c', parentId: null, level: 0, title: 'Mid-market proposal – Beta Ltd',   startDate: d(0),   dueDate: d(12),  progress: 10, status: 'In-Progress', priority: 'Medium', assigneeId: 'u3',  createdBy: 'u4', createdAt: ts(-1),  updatedAt: ts(-1), order: 1 },

    // ── t5 Product Design: Research ──
    { id: 'tk27', trackerId: 't5', categoryId: 'c5a', parentId: null, level: 0, title: 'User research – mobile app',        startDate: d(-20), dueDate: d(-5),  progress: 100,status: 'Done',        priority: 'High',   assigneeId: 'u13', createdBy: 'u3', createdAt: ts(-20), updatedAt: ts(-5), order: 0 },
    { id: 'tk27a',trackerId: 't5', categoryId: 'c5a', parentId: 'tk27',level: 1, title: 'Conduct 10 user interviews',       startDate: d(-20), dueDate: d(-12), progress: 100,status: 'Done',        priority: 'High',   assigneeId: 'u5',  createdBy: 'u3', createdAt: ts(-20), updatedAt: ts(-12),order: 0 },
    { id: 'tk27b',trackerId: 't5', categoryId: 'c5a', parentId: 'tk27',level: 1, title: 'Synthesise findings & report',     startDate: d(-12), dueDate: d(-5),  progress: 100,status: 'Done',        priority: 'High',   assigneeId: 'u13', createdBy: 'u3', createdAt: ts(-12), updatedAt: ts(-5), order: 1 },
    { id: 'tk28', trackerId: 't5', categoryId: 'c5a', parentId: null, level: 0, title: 'Competitive analysis',             startDate: d(-10), dueDate: d(0),   progress: 85, status: 'Review',      priority: 'Medium', assigneeId: 'u5',  createdBy: 'u3', createdAt: ts(-10), updatedAt: ts(-1), order: 1 },

    // ── t5 Product Design: Wireframes ──
    { id: 'tk29', trackerId: 't5', categoryId: 'c5b', parentId: null, level: 0, title: 'Low-fi wireframes – onboarding flow',startDate: d(-5), dueDate: d(5),   progress: 70, status: 'In-Progress', priority: 'High',   assigneeId: 'u13', createdBy: 'u3', createdAt: ts(-5),  updatedAt: ts(-1), order: 0 },
    { id: 'tk29a',trackerId: 't5', categoryId: 'c5b', parentId: 'tk29',level: 1, title: 'Sketch initial screens',           startDate: d(-5),  dueDate: d(0),   progress: 100,status: 'Done',        priority: 'High',   assigneeId: 'u13', createdBy: 'u3', createdAt: ts(-5),  updatedAt: ts(-1), order: 0 },
    { id: 'tk29b',trackerId: 't5', categoryId: 'c5b', parentId: 'tk29',level: 1, title: 'Stakeholder review & feedback',    startDate: d(0),   dueDate: d(5),   progress: 40, status: 'In-Progress', priority: 'Medium', assigneeId: 'u15', createdBy: 'u3', createdAt: ts(-5),  updatedAt: ts(-1), order: 1 },
    { id: 'tk30', trackerId: 't5', categoryId: 'c5b', parentId: null, level: 0, title: 'High-fi prototype – key flows',     startDate: d(5),   dueDate: d(20),  progress: 0,  status: 'Open',        priority: 'High',   assigneeId: 'u5',  createdBy: 'u3', createdAt: ts(-2),  updatedAt: ts(-2), order: 1 },

    // ── t5 Product Design: UI Design ──
    { id: 'tk31', trackerId: 't5', categoryId: 'c5c', parentId: null, level: 0, title: 'Design system refresh',             startDate: d(-10), dueDate: d(20),  progress: 45, status: 'In-Progress', priority: 'High',   assigneeId: 'u15', createdBy: 'u3', createdAt: ts(-10), updatedAt: ts(-1), order: 0 },
    { id: 'tk31a',trackerId: 't5', categoryId: 'c5c', parentId: 'tk31',level: 1, title: 'Colour & typography tokens',       startDate: d(-10), dueDate: d(-2),  progress: 100,status: 'Done',        priority: 'High',   assigneeId: 'u13', createdBy: 'u3', createdAt: ts(-10), updatedAt: ts(-2), order: 0 },
    { id: 'tk31b',trackerId: 't5', categoryId: 'c5c', parentId: 'tk31',level: 1, title: 'Component library – Figma',        startDate: d(-2),  dueDate: d(15),  progress: 30, status: 'In-Progress', priority: 'High',   assigneeId: 'u15', createdBy: 'u3', createdAt: ts(-2),  updatedAt: ts(-1), order: 1 },
    { id: 'tk32', trackerId: 't5', categoryId: 'c5c', parentId: null, level: 0, title: 'Accessibility audit & fixes',       startDate: d(10),  dueDate: d(30),  progress: 0,  status: 'Open',        priority: 'Medium', assigneeId: 'u5',  createdBy: 'u3', createdAt: ts(-1),  updatedAt: ts(-1), order: 1 },
  ]

  return { users, trackers, members, categories, tasks }
}

export function applySeedData() {
  const { users, trackers, members, categories, tasks } = getSeedData()
  localStorage.setItem('tt_users',      JSON.stringify(users))
  localStorage.setItem('tt_trackers',   JSON.stringify(trackers))
  localStorage.setItem('tt_members',    JSON.stringify(members))
  localStorage.setItem('tt_categories', JSON.stringify(categories))
  localStorage.setItem('tt_tasks',      JSON.stringify(tasks))
}
