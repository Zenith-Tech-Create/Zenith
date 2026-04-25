// goals.js — Goals module

const Goals = (() => {

  function render() {
    const el = document.getElementById('section-goals')
    const goals = DB.get('goals')

    el.innerHTML = `
      <div class="page-header">
        <div class="page-title">Goals</div>
        <button class="btn btn-primary" onclick="Goals.showAddForm()">+ New goal</button>
      </div>

      <div id="add-goal-form" style="display:none;border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:14px;margin-bottom:1rem;background:var(--bg-2);">
        <div style="font-size:13px;font-weight:500;margin-bottom:10px;">New goal</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <input type="text" id="g-name" placeholder="Goal name (e.g. Read 24 books this year)" />
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
            <input type="number" id="g-target" placeholder="Target (e.g. 24)" />
            <input type="text" id="g-unit" placeholder="Unit (books, %, $)" />
            <select id="g-cat">
              <option>Personal</option><option>Finance</option>
              <option>Health</option><option>Fitness</option>
              <option>Learning</option><option>Work</option>
            </select>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary" onclick="Goals.addGoal()">Save goal</button>
            <button class="btn btn-ghost" onclick="Goals.hideAddForm()">Cancel</button>
          </div>
        </div>
      </div>

      <div id="goal-list">
        ${goals.length === 0
          ? '<div style="color:var(--text-2);font-size:13px;padding:1rem 0;">No goals yet. Add one above!</div>'
          : goals.map(g => goalCard(g)).join('')}
      </div>
    `
  }

  function goalCard(g) {
    const pct = Math.min(100, Math.round(g.prog / g.total * 100))
    const display = g.unit === '$'
      ? `$${Number(g.prog).toLocaleString()} / $${Number(g.total).toLocaleString()}`
      : `${g.prog} / ${g.total} ${g.unit}`
    return `
      <div class="card-white" style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px;">
          <div style="flex:1;margin-right:12px;">
            <div style="font-size:13px;font-weight:500;margin-bottom:3px;">${g.name}</div>
            <div style="font-size:12px;color:var(--text-2);">${display}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${App.tag(g.cat)}
            <span style="font-size:13px;font-weight:500;color:${g.col};">${pct}%</span>
            <button onclick="Goals.toggleUpdate(${g.id})" style="background:none;border:0.5px solid var(--border-2);border-radius:var(--radius);padding:3px 8px;font-size:11px;cursor:pointer;color:var(--text-2);font-family:var(--font);">Update</button>
            <button onclick="Goals.remove(${g.id})" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:16px;line-height:1;font-family:var(--font);">×</button>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;background:${g.col};"></div>
        </div>
        <div id="update-form-${g.id}" style="display:none;margin-top:10px;">
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="number" id="update-val-${g.id}" value="${g.prog}" placeholder="New value" style="flex:1;" />
            <button class="btn btn-primary" onclick="Goals.saveProgress(${g.id})" style="padding:6px 12px;font-size:12px;">Save</button>
            <button class="btn btn-ghost" onclick="Goals.toggleUpdate(${g.id})" style="padding:6px 12px;font-size:12px;">Cancel</button>
          </div>
        </div>
      </div>`
  }

  function showAddForm() {
    document.getElementById('add-goal-form').style.display = 'block'
    document.getElementById('g-name').focus()
  }

  function hideAddForm() {
    document.getElementById('add-goal-form').style.display = 'none'
  }

  function toggleUpdate(id) {
    const form = document.getElementById('update-form-' + id)
    if (form) form.style.display = form.style.display === 'flex' ? 'none' : 'flex'
  }

  async function saveProgress(id) {
    const input = document.getElementById('update-val-' + id)
    if (!input) return
    const newProg = parseFloat(input.value)
    if (isNaN(newProg)) return
    const goals = DB.get('goals')
    const g = goals.find(g => g.id === id)
    if (g) { g.prog = newProg; await DB.save('goals', goals); render(); if (typeof App !== 'undefined') App.refreshDashboard() }
  }

  async function addGoal() {
    const name   = document.getElementById('g-name').value.trim()
    const target = parseFloat(document.getElementById('g-target').value)
    const unit   = document.getElementById('g-unit').value.trim() || '%'
    const cat    = document.getElementById('g-cat').value
    if (!name || isNaN(target)) return
    const goals = DB.get('goals')
    const cols  = ['#1D9E75','#378ADD','#D85A30','#7F77DD','#EF9F27','#D4537E']
    goals.push({ id: DB.nextId('goals'), name, prog: 0, total: target, unit, cat, col: cols[goals.length % cols.length] })
    await DB.save('goals', goals)
    render()
    if (typeof App !== 'undefined') App.refreshDashboard()
  }

  async function removeGoal(id) {
    await DB.save('goals', DB.get('goals').filter(g => g.id !== id))
    render()
    if (typeof App !== 'undefined') App.refreshDashboard()
  }

  return { render, showAddForm, hideAddForm, addGoal, toggleUpdate, saveProgress, remove: removeGoal }
})()
