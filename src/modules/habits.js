// habits.js — Habits module with per-day repeat selection

const Habits = (() => {

  const ALL_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  let newHabitDays = [...ALL_DAYS]

  function todayName() {
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()]
  }

  function render() {
    const el     = document.getElementById('section-habits')
    const habits = DB.get('habits')
    const today  = todayName()
    newHabitDays = [...ALL_DAYS]

    el.innerHTML = `
      <div class="page-header">
        <div class="page-title">Habits</div>
        <button class="btn btn-primary" onclick="Habits.showAddForm()">+ New habit</button>
      </div>

      <div id="add-habit-form" style="display:none;border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:14px;margin-bottom:1rem;background:var(--bg-2);">
        <div style="font-size:13px;font-weight:500;margin-bottom:10px;">New habit</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <input type="text" id="new-habit-name" placeholder="e.g. Morning meditation, Read 30 min..." />

          <div>
            <div style="font-size:11px;color:var(--text-2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;font-weight:500;">Repeat on</div>
            <div style="display:flex;gap:4px;" id="day-selector">
              ${ALL_DAYS.map(d => `
                <button type="button" onclick="Habits.toggleDay(this)" data-day="${d}"
                  style="flex:1;padding:6px 2px;font-size:11px;font-weight:500;border-radius:var(--radius);cursor:pointer;
                    border:0.5px solid var(--accent);background:var(--accent);color:#fff;font-family:var(--font);transition:all .12s;">
                  ${d}
                </button>`).join('')}
            </div>
            <div style="display:flex;gap:8px;margin-top:6px;">
              <button type="button" onclick="Habits.selectPreset('all')" style="font-size:11px;background:none;border:none;cursor:pointer;color:var(--text-2);font-family:var(--font);padding:0;">All days</button>
              <button type="button" onclick="Habits.selectPreset('weekdays')" style="font-size:11px;background:none;border:none;cursor:pointer;color:var(--text-2);font-family:var(--font);padding:0;">Weekdays</button>
              <button type="button" onclick="Habits.selectPreset('weekends')" style="font-size:11px;background:none;border:none;cursor:pointer;color:var(--text-2);font-family:var(--font);padding:0;">Weekends</button>
            </div>
          </div>

          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary" onclick="Habits.addHabit()">Save habit</button>
            <button class="btn btn-ghost" onclick="Habits.hideAddForm()">Cancel</button>
          </div>
        </div>
      </div>

      <p style="font-size:13px;color:var(--text-2);margin-bottom:1rem;">
        Today is <strong>${today}</strong> — showing habits due today.
      </p>

      <div id="habit-list">
        ${habits.length === 0
          ? '<div style="color:var(--text-2);font-size:13px;padding:1rem 0;">No habits yet. Add one above!</div>'
          : habits.map(h => habitRow(h, today)).join('')}
      </div>
    `
  }

  function habitRow(h, today) {
    const days     = h.days || ALL_DAYS
    const dueToday = days.includes(today)
    const dimmed   = !dueToday ? 'opacity:.45;' : ''
    return `
      <div class="row-item" id="habit-${h.id}" style="${dimmed}">
        <input type="checkbox" ${h.done ? 'checked' : ''} ${!dueToday ? 'disabled' : ''}
          onchange="Habits.toggle(${h.id})"
          style="width:15px;height:15px;cursor:${dueToday?'pointer':'not-allowed'};accent-color:var(--accent);flex-shrink:0;" />
        <div style="flex:1;">
          <div style="font-size:13px;text-decoration:${h.done ? 'line-through' : 'none'};
            color:${h.done ? 'var(--text-2)' : 'var(--text)'};">${h.name}</div>
          <div style="display:flex;gap:3px;margin-top:4px;">
            ${ALL_DAYS.map(d => {
              const sel = days.includes(d)
              const isToday = d === today
              return `<div title="${d}" style="width:22px;height:5px;border-radius:2px;
                background:${sel ? (isToday ? 'var(--accent)' : 'var(--border-2)') : 'transparent'};
                border:0.5px solid ${sel ? (isToday ? 'var(--accent)' : 'var(--border-2)') : 'var(--border)'};"></div>`
            }).join('')}
          </div>
        </div>
        <span style="font-size:11px;color:var(--text-2);background:var(--bg-2);padding:2px 8px;border-radius:12px;white-space:nowrap;">
          ${h.streak}d streak
        </span>
        ${!dueToday ? `<span style="font-size:11px;color:var(--text-3);">Not today</span>` : ''}
        <button onclick="Habits.remove(${h.id})"
          style="background:none;border:none;cursor:pointer;color:var(--text-3);padding:2px 4px;font-size:16px;line-height:1;font-family:var(--font);">×</button>
      </div>`
  }

  function showAddForm() {
    const form = document.getElementById('add-habit-form')
    form.style.display = 'block'
    document.getElementById('new-habit-name').focus()
  }

  function hideAddForm() {
    document.getElementById('add-habit-form').style.display = 'none'
    newHabitDays = [...ALL_DAYS]
  }

  function toggleDay(btn) {
    const day = btn.dataset.day
    const idx = newHabitDays.indexOf(day)
    if (idx > -1) {
      if (newHabitDays.length === 1) return // Keep at least one
      newHabitDays.splice(idx, 1)
      btn.style.background = 'transparent'
      btn.style.color      = 'var(--accent)'
    } else {
      newHabitDays.push(day)
      btn.style.background = 'var(--accent)'
      btn.style.color      = '#fff'
    }
  }

  function selectPreset(preset) {
    if (preset === 'all')      newHabitDays = [...ALL_DAYS]
    if (preset === 'weekdays') newHabitDays = ['Mon','Tue','Wed','Thu','Fri']
    if (preset === 'weekends') newHabitDays = ['Sat','Sun']
    const sel = document.getElementById('day-selector')
    if (!sel) return
    sel.querySelectorAll('button').forEach(btn => {
      const active = newHabitDays.includes(btn.dataset.day)
      btn.style.background = active ? 'var(--accent)' : 'transparent'
      btn.style.color      = active ? '#fff' : 'var(--accent)'
    })
  }

  async function addHabit() {
    const nameEl = document.getElementById('new-habit-name')
    const name   = nameEl ? nameEl.value.trim() : ''
    if (!name) return
    const habits = DB.get('habits')
    habits.push({ id: DB.nextId('habits'), name, done: false, streak: 0, days: [...newHabitDays] })
    await DB.save('habits', habits)
    render()
    if (typeof App !== 'undefined') App.refreshDashboard()
  }

  async function toggle(id) {
    const habits = DB.get('habits')
    const h = habits.find(h => h.id === id)
    if (h) {
      h.done = !h.done
      if (h.done) h.streak = (h.streak || 0) + 1
      await DB.save('habits', habits)
    }
    render()
    if (typeof App !== 'undefined') App.refreshDashboard()
  }

  async function removeHabit(id) {
    await DB.save('habits', DB.get('habits').filter(h => h.id !== id))
    render()
    if (typeof App !== 'undefined') App.refreshDashboard()
  }

  return { render, showAddForm, hideAddForm, toggleDay, selectPreset, addHabit, toggle, remove: removeHabit }
})()
