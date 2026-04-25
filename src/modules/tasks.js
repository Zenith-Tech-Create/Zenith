// tasks.js — Tasks module (Task Template/Rule System)

const Tasks = (() => {

  const ALL_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  let newTaskDays = []
  let repeatMode  = 'none'

  function render() {
    const el    = document.getElementById('section-tasks')
    const tasks = DB.get('tasks')
    newTaskDays = []
    repeatMode  = 'none'

    el.innerHTML = `
      <div class="page-header">
        <div class="page-title">Tasks</div>
        <button class="btn btn-primary" onclick="Tasks.showAddForm()">+ Add task</button>
      </div>

      <div id="add-task-form" style="display:none;border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:14px;margin-bottom:1rem;background:var(--bg-2);">
        <div style="font-size:13px;font-weight:500;margin-bottom:10px;">New task</div>
        <div style="display:flex;flex-direction:column;gap:10px;">

          <input type="text" id="new-task-input" placeholder="What needs to be done?" />

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <select id="new-task-cat">
              <option>Personal</option>
              <option>Work</option>
              <option>Health</option>
              <option>Finance</option>
            </select>
            <select id="new-task-date">
              <option>Today</option>
              <option>Tomorrow</option>
              <option>This week</option>
            </select>
          </div>

          <div>
            <div style="font-size:11px;color:var(--text-2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;font-weight:500;">Repeat</div>
            <div style="display:flex;gap:6px;margin-bottom:8px;">
              <button type="button" id="rep-none" onclick="Tasks.setRepeat('none')"
                style="flex:1;padding:6px;font-size:12px;border-radius:var(--radius);cursor:pointer;font-family:var(--font);
                  background:var(--accent);color:#fff;border:0.5px solid var(--accent);">None</button>
              <button type="button" id="rep-daily" onclick="Tasks.setRepeat('daily')"
                style="flex:1;padding:6px;font-size:12px;border-radius:var(--radius);cursor:pointer;font-family:var(--font);
                  background:transparent;color:var(--text-2);border:0.5px solid var(--border-2);">Daily</button>
              <button type="button" id="rep-weekly" onclick="Tasks.setRepeat('weekly')"
                style="flex:1;padding:6px;font-size:12px;border-radius:var(--radius);cursor:pointer;font-family:var(--font);
                  background:transparent;color:var(--text-2);border:0.5px solid var(--border-2);">Weekly</button>
            </div>

            <div id="day-picker" style="display:none;flex-direction:column;gap:6px;">
              <div style="display:flex;gap:4px;" id="task-day-selector">
                ${ALL_DAYS.map(d => `
                  <button type="button" onclick="Tasks.toggleDay(this)" data-day="${d}"
                    style="flex:1;padding:6px 2px;font-size:11px;font-weight:500;border-radius:var(--radius);cursor:pointer;
                      border:0.5px solid var(--border-2);background:transparent;color:var(--text-2);
                      font-family:var(--font);transition:all .12s;">
                    ${d}
                  </button>`).join('')}
              </div>
              <div style="display:flex;gap:8px;">
                <button type="button" onclick="Tasks.dayPreset('all')" style="font-size:11px;background:none;border:none;cursor:pointer;color:var(--text-2);font-family:var(--font);padding:0;">All days</button>
                <button type="button" onclick="Tasks.dayPreset('weekdays')" style="font-size:11px;background:none;border:none;cursor:pointer;color:var(--text-2);font-family:var(--font);padding:0;">Weekdays</button>
                <button type="button" onclick="Tasks.dayPreset('weekends')" style="font-size:11px;background:none;border:none;cursor:pointer;color:var(--text-2);font-family:var(--font);padding:0;">Weekends</button>
              </div>
            </div>
          </div>

          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary" onclick="Tasks.addTask()">Add task</button>
            <button class="btn btn-ghost" onclick="Tasks.hideAddForm()">Cancel</button>
          </div>
        </div>
      </div>

      <div id="task-list">
        ${tasks.length === 0
          ? '<div style="color:var(--text-2);font-size:13px;padding:1rem 0;">No tasks yet. Add one above!</div>'
          : tasks.map(t => taskRow(t)).join('')}
      </div>
    `
  }

  function taskRow(t) {
    const repeatLabel = repeatBadge(t)
    return `
      <div class="row-item" id="task-${t.id}" style="opacity:${t.done ? .5 : 1}">
        <input type="checkbox" ${t.done ? 'checked' : ''} onchange="Tasks.toggle(${t.id})"
          style="width:15px;height:15px;cursor:pointer;accent-color:var(--accent);flex-shrink:0;" />
        <div style="flex:1;">
          <div style="font-size:13px;text-decoration:${t.done ? 'line-through' : 'none'};color:var(--text);">${t.text}</div>
          ${repeatLabel ? `<div style="margin-top:3px;">${repeatLabel}</div>` : ''}
        </div>
        ${App.tag(t.cat)}
        <span style="font-size:11px;color:var(--text-2);">${t.date}</span>
        <button onclick="Tasks.startEdit(${t.id})" title="Edit task"
          style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:13px;line-height:1;padding:0 2px;opacity:.7;">✎</button>
        <button onclick="Tasks.remove(${t.id})"
          style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:16px;line-height:1;font-family:var(--font);">×</button>
      </div>`
  }

  function editRow(t) {
    return `
      <div class="row-item" id="task-${t.id}" style="flex-direction:column;align-items:stretch;gap:8px;background:var(--bg-2);border-color:var(--accent);">
        <div style="font-size:11px;font-weight:500;color:var(--text-2);margin-bottom:2px;">Edit task</div>
        <input id="edit-task-text-${t.id}" type="text" value="${t.text.replace(/"/g,'&quot;')}" style="width:100%;box-sizing:border-box;" />
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <select id="edit-task-cat-${t.id}">
            ${['Personal','Work','Health','Finance'].map(c => `<option${c === t.cat ? ' selected' : ''}>${c}</option>`).join('')}
          </select>
          <select id="edit-task-date-${t.id}">
            ${['Today','Tomorrow','This week'].map(d => `<option${d === t.date ? ' selected' : ''}>${d}</option>`).join('')}
          </select>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary" onclick="Tasks.saveEdit(${t.id})">Save</button>
          <button class="btn btn-ghost" onclick="Tasks.cancelEdit()">Cancel</button>
        </div>
      </div>`
  }

  function repeatBadge(t) {
    if (!t.repeat || t.repeat === 'none') return ''
    if (t.repeat === 'daily') {
      return `<span style="font-size:10px;color:var(--text-2);display:inline-flex;align-items:center;gap:3px;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
        Daily
      </span>`
    }
    if (t.repeat === 'weekly' && t.repeatDays && t.repeatDays.length) {
      const today = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()]
      const dots = ALL_DAYS.map(d => {
        const sel     = t.repeatDays.includes(d)
        const isToday = d === today
        return `<div title="${d}" style="width:18px;height:4px;border-radius:2px;
          background:${sel ? (isToday ? 'var(--accent)' : 'var(--border-2)') : 'transparent'};
          border:0.5px solid ${sel ? (isToday ? 'var(--accent)' : 'var(--border-2)') : 'var(--border)'};"></div>`
      }).join('')
      return `<div style="display:flex;align-items:center;gap:4px;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
        <div style="display:flex;gap:2px;">${dots}</div>
      </div>`
    }
    return ''
  }

  // ── Form controls ─────────────────────────────────────────────────
  function showAddForm() {
    const form = document.getElementById('add-task-form')
    form.style.display = 'block'
    document.getElementById('new-task-input').focus()
  }

  function hideAddForm() {
    document.getElementById('add-task-form').style.display = 'none'
    newTaskDays = []
    repeatMode  = 'none'
  }

  function setRepeat(mode) {
    repeatMode = mode
    const btns = { none: 'rep-none', daily: 'rep-daily', weekly: 'rep-weekly' }
    Object.entries(btns).forEach(([m, id]) => {
      const btn = document.getElementById(id)
      if (!btn) return
      if (m === mode) {
        btn.style.background = 'var(--accent)'
        btn.style.color      = '#fff'
        btn.style.borderColor = 'var(--accent)'
      } else {
        btn.style.background  = 'transparent'
        btn.style.color       = 'var(--text-2)'
        btn.style.borderColor = 'var(--border-2)'
      }
    })
    const picker = document.getElementById('day-picker')
    if (picker) picker.style.display = mode === 'weekly' ? 'flex' : 'none'
    if (mode !== 'weekly') newTaskDays = []
  }

  function toggleDay(btn) {
    const day = btn.dataset.day
    const idx = newTaskDays.indexOf(day)
    if (idx > -1) {
      if (newTaskDays.length === 1) return
      newTaskDays.splice(idx, 1)
      btn.style.background  = 'transparent'
      btn.style.color       = 'var(--text-2)'
      btn.style.borderColor = 'var(--border-2)'
    } else {
      newTaskDays.push(day)
      btn.style.background  = 'var(--accent)'
      btn.style.color       = '#fff'
      btn.style.borderColor = 'var(--accent)'
    }
  }

  function dayPreset(preset) {
    if (preset === 'all')      newTaskDays = [...ALL_DAYS]
    if (preset === 'weekdays') newTaskDays = ['Mon','Tue','Wed','Thu','Fri']
    if (preset === 'weekends') newTaskDays = ['Sat','Sun']
    const sel = document.getElementById('task-day-selector')
    if (!sel) return
    sel.querySelectorAll('button').forEach(btn => {
      const active = newTaskDays.includes(btn.dataset.day)
      btn.style.background  = active ? 'var(--accent)' : 'transparent'
      btn.style.color       = active ? '#fff' : 'var(--text-2)'
      btn.style.borderColor = active ? 'var(--accent)' : 'var(--border-2)'
    })
  }

  // ── Data actions ──────────────────────────────────────────────────
  async function addTask() {
    const input = document.getElementById('new-task-input')
    const cat   = document.getElementById('new-task-cat').value
    const date  = document.getElementById('new-task-date').value
    const text  = input ? input.value.trim() : ''
    if (!text) return

    const tasks = DB.get('tasks')
    const task  = { id: DB.nextId('tasks'), text, done: false, cat, date, repeat: repeatMode }
    if (repeatMode === 'weekly' && newTaskDays.length) task.repeatDays = [...newTaskDays]
    tasks.unshift(task)
    await DB.save('tasks', tasks)
    if (input) input.value = ''
    render()
    if (typeof App !== 'undefined') App.refreshDashboard()
  }

  async function toggle(id) {
    const tasks = DB.get('tasks')
    const t = tasks.find(t => t.id === id)
    if (t) { t.done = !t.done; await DB.save('tasks', tasks) }
    render()
    if (typeof App !== 'undefined') App.refreshDashboard()
  }

  async function deleteTask(id) {
    await DB.save('tasks', DB.get('tasks').filter(t => t.id !== id))
    render()
    if (typeof App !== 'undefined') App.refreshDashboard()
  }

  function startEdit(id) {
    const tasks = DB.get('tasks')
    const t = tasks.find(t => t.id === id)
    if (!t) return
    const container = document.getElementById(`task-${id}`)
    if (container) container.outerHTML = editRow(t)
  }

  async function saveEdit(id) {
    const textEl = document.getElementById(`edit-task-text-${id}`)
    const catEl  = document.getElementById(`edit-task-cat-${id}`)
    const dateEl = document.getElementById(`edit-task-date-${id}`)
    if (!textEl) return
    const text = textEl.value.trim()
    if (!text) return
    const tasks = DB.get('tasks')
    const t = tasks.find(t => t.id === id)
    if (t) {
      t.text = text
      t.cat  = catEl ? catEl.value : t.cat
      t.date = dateEl ? dateEl.value : t.date
      await DB.save('tasks', tasks)
    }
    render()
    if (typeof App !== 'undefined') App.refreshDashboard()
  }

  function cancelEdit() { render() }

  return { render, showAddForm, hideAddForm, setRepeat, toggleDay, dayPreset, addTask, toggle, remove: deleteTask, startEdit, saveEdit, cancelEdit }
})()
