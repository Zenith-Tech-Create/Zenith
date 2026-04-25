// fitness.js — Fitness module

const Fitness = (() => {

  function render() {
    const el = document.getElementById('section-fitness')
    const workouts = DB.get('workouts')
    const totalCal = workouts.reduce((s, w) => s + w.cal, 0)
    const totalMin = workouts.reduce((s, w) => s + w.dur, 0)

    el.innerHTML = `
      <div class="page-header">
        <div class="page-title">Fitness</div>
        <button class="btn btn-primary" onclick="Fitness.showLogForm()">+ Log workout</button>
      </div>

      <div id="log-workout-form" style="display:none;border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:14px;margin-bottom:1rem;background:var(--bg-2);">
        <div style="font-size:13px;font-weight:500;margin-bottom:10px;">Log workout</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <select id="w-type">
            <option>Running</option><option>Weight Training</option>
            <option>Cycling</option><option>Yoga</option>
            <option>Swimming</option><option>HIIT</option>
            <option>Walking</option><option>Other</option>
          </select>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div>
              <label style="font-size:11px;color:var(--text-2);display:block;margin-bottom:4px;">Duration (minutes)</label>
              <input type="number" id="w-dur" placeholder="e.g. 45" min="1" />
            </div>
            <div>
              <label style="font-size:11px;color:var(--text-2);display:block;margin-bottom:4px;">Calories burned</label>
              <input type="number" id="w-cal" placeholder="e.g. 350" min="0" />
            </div>
          </div>
          <input type="text" id="w-notes" placeholder="Notes (optional)" />
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary" onclick="Fitness.logWorkout()">Save workout</button>
            <button class="btn btn-ghost" onclick="Fitness.hideLogForm()">Cancel</button>
          </div>
        </div>
      </div>

      <div class="stat-grid" style="margin-bottom:1.2rem;">
        <div class="stat-card">
          <div class="stat-label">Total workouts</div>
          <div class="stat-value">${workouts.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Calories burned</div>
          <div class="stat-value">${totalCal.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active minutes</div>
          <div class="stat-value">${totalMin}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg per session</div>
          <div class="stat-value">${workouts.length ? Math.round(totalCal / workouts.length) : 0} cal</div>
        </div>
      </div>

      <div class="section-label">WORKOUT LOG</div>
      <div>
        ${workouts.length === 0
          ? '<div style="font-size:13px;color:var(--text-2);">No workouts logged yet. Start tracking!</div>'
          : workouts.map(w => workoutRow(w)).join('')}
      </div>
    `
  }

  function workoutRow(w) {
    return `
      <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg-2);
        border-radius:var(--radius);margin-bottom:8px;">
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:500;">${w.type}</div>
          <div style="font-size:11px;color:var(--text-2);">${w.date}${w.notes ? ' · ' + w.notes : ''}</div>
        </div>
        <div style="text-align:center;min-width:52px;">
          <div style="font-size:16px;font-weight:500;">${w.dur}</div>
          <div style="font-size:10px;color:var(--text-2);">min</div>
        </div>
        <div style="text-align:center;min-width:52px;">
          <div style="font-size:16px;font-weight:500;color:var(--coral);">${w.cal}</div>
          <div style="font-size:10px;color:var(--text-2);">cal</div>
        </div>
        <button onclick="Fitness.remove(${w.id})"
          style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:16px;font-family:var(--font);">×</button>
      </div>
    `
  }

  function showLogForm() {
    document.getElementById('log-workout-form').style.display = 'block'
    document.getElementById('w-type').focus()
  }

  function hideLogForm() {
    document.getElementById('log-workout-form').style.display = 'none'
  }

  async function logWorkout() {
    const type  = document.getElementById('w-type').value
    const dur   = parseInt(document.getElementById('w-dur').value)
    const cal   = parseInt(document.getElementById('w-cal').value)
    const notes = document.getElementById('w-notes').value.trim()
    if (!dur || !cal) return

    const workouts = DB.get('workouts')
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    workouts.unshift({ id: DB.nextId('workouts'), type, dur, cal, notes, date: today })
    await DB.save('workouts', workouts)
    render()
    if (typeof App !== 'undefined') App.refreshDashboard()
  }

  async function removeWorkout(id) {
    await DB.save('workouts', DB.get('workouts').filter(w => w.id !== id))
    render()
    if (typeof App !== 'undefined') App.refreshDashboard()
  }

  return { render, showLogForm, hideLogForm, logWorkout, remove: removeWorkout }
})()
