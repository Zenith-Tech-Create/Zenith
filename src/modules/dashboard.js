// dashboard.js — Dashboard module (all charts use live DB data)

const Dashboard = (() => {

  let clockInterval = null

  function updateClock() {
    const el = document.getElementById('dashboard-clock')
    if (!el) { clearInterval(clockInterval); clockInterval = null; return }
    const now  = new Date()
    const h    = now.getHours()
    const m    = String(now.getMinutes()).padStart(2, '0')
    const s    = String(now.getSeconds()).padStart(2, '0')
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12  = String(h % 12 || 12).padStart(2, '0')
    el.textContent = `${h12}:${m}:${s} ${ampm}`
  }

  function startClock() {
    if (clockInterval) clearInterval(clockInterval)
    updateClock()
    clockInterval = setInterval(updateClock, 1000)
  }

  function destroyChart(id) {
    const existing = Chart.getChart ? Chart.getChart(id) : null
    if (existing) existing.destroy()
  }

  function overdueBanner(tasks) {
    if (!tasks || tasks.length === 0) return ''
    const items = tasks.slice(0, 5).map(t =>
      `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:0.5px solid rgba(255,255,255,.2);">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span style="flex:1;font-size:12px;">${t.text}</span>
        <span style="font-size:10px;opacity:.7;background:rgba(0,0,0,.15);padding:1px 6px;border-radius:8px;">${t.cat}</span>
      </div>`
    ).join('')
    const extra = tasks.length > 5
      ? `<div style="font-size:11px;opacity:.7;margin-top:6px;">+${tasks.length - 5} more</div>` : ''
    return `
      <div style="background:linear-gradient(135deg,#C0392B,#E74C3C);color:#fff;border-radius:var(--radius-lg);padding:14px 16px;margin-bottom:1.1rem;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style="font-size:13px;font-weight:600;">${tasks.length} task${tasks.length > 1 ? 's' : ''} due today or overdue</span>
          <button onclick="App.dismissOverdueTasks()"
            style="margin-left:auto;background:rgba(255,255,255,.25);border:none;color:#fff;border-radius:var(--radius);padding:3px 10px;font-size:11px;cursor:pointer;font-family:var(--font);font-weight:500;">
            Dismiss
          </button>
        </div>
        <div>${items}${extra}</div>
      </div>`
  }

  function render() {
    const tasks    = DB.get('tasks')        || []
    const habits   = DB.get('habits')       || []
    const goals    = DB.get('goals')        || []
    const txns     = DB.get('transactions') || []
    const workouts = DB.get('workouts')     || []
    const nutrition = DB.get('nutrition')   || { goals: { calories: 2000, protein: 150 }, log: [] }

    // ── Stat calculations ──────────────────────────────────────────
    const doneTasks  = tasks.filter(t => t.done).length
    const openTasks  = tasks.filter(t => !t.done).length
    const totalTasks = tasks.length
    const doneHabits = habits.filter(h => h.done).length
    const income     = txns.filter(t => t.type === 'inc').reduce((s, t) => s + Number(t.amt), 0)
    const expenses   = txns.filter(t => t.type === 'exp').reduce((s, t) => s + Number(t.amt), 0)
    const todayCal   = workouts.filter(w => w.date === 'Today').reduce((s, w) => s + w.cal, 0)
    const taskPct    = totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0
    const taskCirc   = 106.8
    const taskDash   = (taskPct / 100 * taskCirc).toFixed(1)
    const maxStreak  = habits.length ? Math.max(...habits.map(h => h.streak || 0)) : 0

    // ── Spending by category (live) ────────────────────────────────
    const catMap = {}
    txns.filter(t => t.type === 'exp').forEach(t => {
      catMap[t.cat] = (catMap[t.cat] || 0) + Number(t.amt)
    })
    const catEntries  = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
    const palette     = ['#1D9E75','#378ADD','#EF9F27','#D4537E','#7F77DD','#B4B2A9','#D85A30']
    const catLabels   = catEntries.map(([k]) => k)
    const catAmounts  = catEntries.map(([, v]) => parseFloat(v.toFixed(2)))
    const catColors   = catEntries.map((_, i) => palette[i % palette.length])

    const spendLegend = catEntries.length > 0
      ? catEntries.map(([cat], i) => `
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:9px;height:9px;border-radius:50%;background:${palette[i % palette.length]};flex-shrink:0;"></div>
            <span style="flex:1;color:var(--text-2);font-size:11px;">${cat}</span>
            <span style="font-size:11px;font-weight:500;color:var(--text);">$${catMap[cat].toFixed(0)}</span>
          </div>`).join('')
      : '<div style="font-size:12px;color:var(--text-3);">No expenses logged yet</div>'

    // ── Fitness data (live, last 7 workouts) ───────────────────────
    const last7     = workouts.slice(0, 7).reverse()
    const fitData   = Array(7).fill(0)
    const fitCols   = Array(7).fill('rgba(128,128,128,0.15)')
    last7.forEach((w, i) => {
      fitData[i] = w.cal
      fitCols[i] = i === last7.length - 1 ? '#D85A30' : '#F0997B'
    })
    const fitLabels = Array(7).fill('').map((_, i) => {
      const w = last7[i]
      return w ? w.date.substring(0, 6) : ''
    })

    // ── Weekly tasks + habits (current state by due date) ──────────
    const todayDow = new Date().getDay()
    const todayIdx = todayDow === 0 ? 6 : todayDow - 1
    const weekLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    const taskBars   = Array(7).fill(0)
    const habitBars  = Array(7).fill(0)
    tasks.filter(t => t.done).forEach(t => {
      if (t.date === 'Today') taskBars[todayIdx]++
      else if (t.date === 'Tomorrow') taskBars[(todayIdx + 1) % 7]++
    })
    tasks.filter(t => !t.done).forEach(t => {
      if (t.date === 'Today') taskBars[todayIdx]++
    })
    habits.forEach(h => {
      if (h.done) habitBars[todayIdx]++
    })

    // ── Goal rings ─────────────────────────────────────────────────
    const goalRings = goals.slice(0, 4).map(g => {
      const pct  = Math.min(100, Math.round(g.prog / g.total * 100))
      const circ = 163.4
      const dash = (pct / 100 * circ).toFixed(1)
      const lbl  = g.unit === '$' ? `$${Number(g.prog / 1000).toFixed(1)}k` : `${g.prog}${g.unit}`
      return `
        <div style="text-align:center;">
          <svg width="66" height="66" viewBox="0 0 66 66">
            <circle cx="33" cy="33" r="26" fill="none" stroke="#D3D1C7" stroke-width="5"/>
            <circle cx="33" cy="33" r="26" fill="none" stroke="${g.col}" stroke-width="5"
              stroke-linecap="round" stroke-dasharray="${dash} ${circ}" transform="rotate(-90 33 33)"/>
            <text x="33" y="37" text-anchor="middle" font-size="11" font-weight="500" fill="${g.col}">${pct}%</text>
          </svg>
          <div style="font-size:11px;font-weight:500;">${g.name.split(' ').slice(0,2).join(' ')}</div>
          <div style="font-size:10px;color:var(--text-2);">${lbl}</div>
        </div>`
    }).join('')

    const overdueTasks = (typeof App !== 'undefined' && App.getOverdueTasks) ? App.getOverdueTasks() : []
    const el = document.getElementById('section-dashboard')
    el.innerHTML = `
      ${overdueBanner(overdueTasks)}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.1rem;gap:12px;">
        <div>
          <div style="font-size:19px;font-weight:500;">Good morning!</div>
          <div style="font-size:12px;color:var(--text-2);margin-top:2px;">${App.formatDate()}</div>
          <div style="display:flex;align-items:center;gap:5px;background:#E1F5EE;border-radius:20px;padding:4px 10px;margin-top:6px;display:inline-flex;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--accent)"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>
            <span style="font-size:11px;color:#085041;font-weight:500;">${maxStreak}-day streak</span>
          </div>
        </div>

        <div style="text-align:center;background:var(--bg-2);border-radius:var(--radius-lg);padding:14px 20px;flex-shrink:0;">
          <div id="dashboard-clock" style="font-size:30px;font-weight:500;font-family:monospace;letter-spacing:0.04em;color:var(--text);">--:--:-- --</div>
          <div style="font-size:11px;color:var(--text-2);margin-top:3px;">Local time</div>
        </div>
      </div>

      <div class="stat-grid">
        <div class="card">
          <div class="stat-label">Tasks completed</div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div class="stat-value">${doneTasks}<span style="font-size:13px;color:var(--text-2);font-weight:400;">/${totalTasks}</span></div>
              <div style="font-size:11px;color:var(--accent);margin-top:2px;">${openTasks} open</div>
            </div>
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="17" fill="none" stroke="#D3D1C7" stroke-width="4"/>
              <circle cx="22" cy="22" r="17" fill="none" stroke="var(--accent)" stroke-width="4"
                stroke-linecap="round" stroke-dasharray="${taskDash} ${taskCirc}" transform="rotate(-90 22 22)"/>
              <text x="22" y="26" text-anchor="middle" font-size="10" font-weight="500" fill="var(--accent)">${taskPct}%</text>
            </svg>
          </div>
        </div>

        <div class="card">
          <div class="stat-label">Habits</div>
          <div class="stat-value">${doneHabits}<span style="font-size:13px;color:var(--text-2);font-weight:400;">/${habits.length} today</span></div>
          <div style="display:flex;gap:4px;margin-top:8px;">
            ${habits.length > 0
              ? habits.map(h => `<div style="flex:1;height:5px;border-radius:3px;background:${h.done ? 'var(--accent)' : '#D3D1C7'};"></div>`).join('')
              : '<div style="flex:1;height:5px;border-radius:3px;background:#D3D1C7;"></div>'}
          </div>
          <div style="font-size:11px;color:var(--text-2);margin-top:5px;">${habits.length - doneHabits} left today</div>
        </div>

        <div class="card">
          <div class="stat-label">Balance</div>
          <div class="stat-value" style="color:var(--accent);">$${(income - expenses).toFixed(0)}</div>
          <div style="margin-top:8px;height:4px;background:#D3D1C7;border-radius:2px;overflow:hidden;">
            <div style="width:${income > 0 ? Math.min(100, Math.round((income - expenses) / income * 100)) : 0}%;height:100%;background:var(--blue);border-radius:2px;"></div>
          </div>
          <div style="font-size:11px;color:var(--text-2);margin-top:3px;">$${income.toFixed(0)} income · $${expenses.toFixed(0)} spent</div>
        </div>

        <div class="card">
          <div class="stat-label">Calories today</div>
          <div class="stat-value">${todayCal}</div>
          <div style="display:flex;align-items:flex-end;gap:3px;margin-top:8px;height:24px;">
            ${last7.map((w, i) => `<div style="flex:1;border-radius:2px 2px 0 0;background:${i === last7.length - 1 ? 'var(--coral)' : '#F0997B'};height:${last7.length ? Math.round(w.cal / Math.max(...last7.map(x => x.cal), 1) * 100) + '%' : '4px'};min-height:3px;"></div>`).join('')}
            ${last7.length === 0 ? '<div style="flex:1;height:4px;border-radius:2px;background:#D3D1C7;"></div>' : ''}
          </div>
          <div style="font-size:11px;color:var(--text-2);margin-top:4px;">${workouts.reduce((s,w)=>s+w.cal,0).toLocaleString()} cal total</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:3fr 2fr;gap:12px;margin-bottom:12px;">
        <div class="card-white">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div class="section-label" style="margin-bottom:0;">Weekly activity</div>
            <div style="display:flex;gap:12px;">
              <div style="display:flex;align-items:center;gap:5px;"><div style="width:9px;height:9px;border-radius:50%;background:var(--accent);"></div><span style="font-size:11px;color:var(--text-2);">Tasks</span></div>
              <div style="display:flex;align-items:center;gap:5px;"><div style="width:9px;height:9px;border-radius:50%;background:var(--purple);"></div><span style="font-size:11px;color:var(--text-2);">Habits</span></div>
            </div>
          </div>
          ${taskBars.every(v => v === 0) && habitBars.every(v => v === 0)
            ? `<div style="height:155px;display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--text-3);">No activity data yet</div>`
            : `<div style="position:relative;height:155px;"><canvas id="c-weekly"></canvas></div>`}
        </div>

        <div class="card-white">
          <div class="section-label">Goal progress</div>
          ${goals.length === 0
            ? `<div style="display:flex;align-items:center;justify-content:center;height:140px;font-size:13px;color:var(--text-3);">No goals added yet</div>`
            : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;">${goalRings}</div>`}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="card-white">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div class="section-label" style="margin-bottom:0;">Spending</div>
            <span style="font-size:12px;font-weight:500;">$${expenses.toFixed(2)}</span>
          </div>
          ${catEntries.length === 0
            ? `<div style="display:flex;align-items:center;justify-content:center;height:110px;font-size:13px;color:var(--text-3);">No expenses logged yet</div>`
            : `<div style="display:flex;gap:14px;align-items:center;">
                <div style="width:110px;height:110px;flex-shrink:0;"><canvas id="c-spend"></canvas></div>
                <div style="flex:1;display:flex;flex-direction:column;gap:5px;">${spendLegend}</div>
              </div>`}
        </div>

        <div class="card-white">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div class="section-label" style="margin-bottom:0;">Fitness</div>
            <div style="font-size:14px;font-weight:500;color:var(--coral);">${workouts.reduce((s,w)=>s+w.cal,0).toLocaleString()} cal</div>
          </div>
          ${workouts.length === 0
            ? `<div style="display:flex;align-items:center;justify-content:center;height:120px;font-size:13px;color:var(--text-3);">No workouts logged yet</div>`
            : `<div style="position:relative;height:120px;"><canvas id="c-fit"></canvas></div>
               <div style="display:grid;grid-template-columns:repeat(7,1fr);margin-top:5px;">
                 ${fitLabels.map((l, i) => `<span style="text-align:center;font-size:9px;color:${i===last7.length-1?'var(--coral)':'var(--text-2)'};">${l}</span>`).join('')}
               </div>`}
        </div>
      </div>
    `

    requestAnimationFrame(() => { startClock(); initCharts(taskBars, habitBars, weekLabels, catLabels, catAmounts, catColors, fitData, fitCols, last7.length) })
  }

  function initCharts(taskBars, habitBars, weekLabels, catLabels, catAmounts, catColors, fitData, fitCols, fitCount) {
    const gc = 'rgba(128,128,128,0.1)'
    const tc = '#888780'

    // Destroy any existing chart instances first
    destroyChart('c-weekly')
    destroyChart('c-spend')
    destroyChart('c-fit')

    if (document.getElementById('c-weekly')) {
      new Chart(document.getElementById('c-weekly'), {
        type: 'bar',
        data: {
          labels: weekLabels,
          datasets: [
            { label:'Tasks',  data: taskBars,  backgroundColor:'#1D9E75', borderRadius:3, barPercentage:.38, categoryPercentage:.8 },
            { label:'Habits', data: habitBars, backgroundColor:'#7F77DD', borderRadius:3, barPercentage:.38, categoryPercentage:.8 }
          ]
        },
        options: {
          responsive:true, maintainAspectRatio:false,
          plugins:{ legend:{ display:false } },
          scales:{
            x:{ grid:{ display:false }, border:{ display:false }, ticks:{ color:tc, font:{ size:11 } } },
            y:{ grid:{ color:gc }, border:{ display:false }, ticks:{ color:tc, font:{ size:11 }, stepSize:1, precision:0 }, min:0 }
          }
        }
      })
    }

    if (document.getElementById('c-spend') && catLabels.length > 0) {
      new Chart(document.getElementById('c-spend'), {
        type: 'doughnut',
        data: {
          labels: catLabels,
          datasets: [{ data: catAmounts, backgroundColor: catColors, borderWidth: 0 }]
        },
        options: {
          responsive:true, maintainAspectRatio:false, cutout:'68%',
          plugins:{
            legend:{ display:false },
            tooltip:{ callbacks:{ label: ctx => `${ctx.label}: $${Number(ctx.raw).toFixed(2)}` } }
          }
        }
      })
    }

    if (document.getElementById('c-fit') && fitCount > 0) {
      new Chart(document.getElementById('c-fit'), {
        type: 'bar',
        data: {
          labels: Array(7).fill(''),
          datasets: [{ data: fitData, backgroundColor: fitCols, borderRadius:3, barPercentage:.6 }]
        },
        options: {
          responsive:true, maintainAspectRatio:false,
          plugins:{
            legend:{ display:false },
            tooltip:{ callbacks:{ label: ctx => ctx.raw === 0 ? 'Rest day' : `${ctx.raw} cal` } }
          },
          scales:{
            x:{ grid:{ display:false }, border:{ display:false }, ticks:{ display:false } },
            y:{ grid:{ color:gc }, border:{ display:false }, ticks:{ color:tc, font:{ size:11 } }, min:0 }
          }
        }
      })
    }
  }

  return { render }
})()
