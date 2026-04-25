// nutrition.js — Calorie & Protein Intake Tracker

const Nutrition = (() => {

  function render() {
    const el = document.getElementById('section-nutrition')
    const data    = DB.get('nutrition') || { goals: { calories: 2000, protein: 150, carbs: 250, fat: 65 }, log: [] }
    const goals   = data.goals
    const log     = data.log || []
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const todayLog = log.filter(e => e.date === todayStr)

    const totals = todayLog.reduce((acc, e) => ({
      calories: acc.calories + (e.calories || 0),
      protein:  acc.protein  + (e.protein  || 0),
      carbs:    acc.carbs    + (e.carbs    || 0),
      fat:      acc.fat      + (e.fat      || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

    const calPct  = Math.min(100, Math.round(totals.calories / goals.calories * 100))
    const protPct = Math.min(100, Math.round(totals.protein  / goals.protein  * 100))
    const carbPct = Math.min(100, Math.round(totals.carbs    / goals.carbs    * 100))
    const fatPct  = Math.min(100, Math.round(totals.fat      / goals.fat      * 100))

    const remaining = {
      calories: Math.max(0, goals.calories - totals.calories),
      protein:  Math.max(0, goals.protein  - totals.protein),
    }

    el.innerHTML = `
      <div class="page-header">
        <div class="page-title">Nutrition</div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-ghost" onclick="Nutrition.showGoalsForm()" style="font-size:12px;">Edit goals</button>
          <button class="btn btn-primary" onclick="Nutrition.showAddForm()">+ Log food</button>
        </div>
      </div>

      <!-- Goals edit form -->
      <div id="goals-form" style="display:none;border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:14px;margin-bottom:1rem;background:var(--bg-2);">
        <div style="font-size:13px;font-weight:500;margin-bottom:10px;">Daily targets</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:8px;">
          <div>
            <label style="font-size:11px;color:var(--text-2);display:block;margin-bottom:4px;">Calories</label>
            <input type="number" id="goal-cal" value="${goals.calories}" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-2);display:block;margin-bottom:4px;">Protein (g)</label>
            <input type="number" id="goal-prot" value="${goals.protein}" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-2);display:block;margin-bottom:4px;">Carbs (g)</label>
            <input type="number" id="goal-carbs" value="${goals.carbs}" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-2);display:block;margin-bottom:4px;">Fat (g)</label>
            <input type="number" id="goal-fat" value="${goals.fat}" />
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary" onclick="Nutrition.saveGoals()">Save targets</button>
          <button class="btn btn-ghost" onclick="Nutrition.hideGoalsForm()">Cancel</button>
        </div>
      </div>

      <!-- Add food form -->
      <div id="add-food-form" style="display:none;border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:14px;margin-bottom:1rem;background:var(--bg-2);">
        <div style="font-size:13px;font-weight:500;margin-bottom:10px;">Log food</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:grid;grid-template-columns:2fr 1fr;gap:8px;">
            <input type="text" id="food-name" placeholder="Food name (e.g. Chicken breast)" />
            <select id="food-meal">
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;">
            <div>
              <label style="font-size:11px;color:var(--text-2);display:block;margin-bottom:4px;">Calories</label>
              <input type="number" id="food-cal" placeholder="e.g. 165" min="0" />
            </div>
            <div>
              <label style="font-size:11px;color:var(--text-2);display:block;margin-bottom:4px;">Protein (g)</label>
              <input type="number" id="food-prot" placeholder="e.g. 31" min="0" />
            </div>
            <div>
              <label style="font-size:11px;color:var(--text-2);display:block;margin-bottom:4px;">Carbs (g)</label>
              <input type="number" id="food-carbs" placeholder="e.g. 0" min="0" />
            </div>
            <div>
              <label style="font-size:11px;color:var(--text-2);display:block;margin-bottom:4px;">Fat (g)</label>
              <input type="number" id="food-fat" placeholder="e.g. 3.5" min="0" />
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary" onclick="Nutrition.addFood()">Log food</button>
            <button class="btn btn-ghost" onclick="Nutrition.hideAddForm()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Daily summary rings -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:1.2rem;">

        <!-- Calories card -->
        <div class="card-white">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <div>
              <div style="font-size:11px;color:var(--text-2);text-transform:uppercase;letter-spacing:.05em;font-weight:500;margin-bottom:4px;">Calories today</div>
              <div style="font-size:26px;font-weight:500;color:var(--text);">${totals.calories.toLocaleString()}</div>
              <div style="font-size:12px;color:var(--text-2);">of ${goals.calories.toLocaleString()} · <span style="color:${remaining.calories > 0 ? 'var(--accent)' : 'var(--red)'};">${remaining.calories > 0 ? remaining.calories + ' remaining' : Math.abs(goals.calories - totals.calories) + ' over'}</span></div>
            </div>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="28" fill="none" stroke="#D3D1C7" stroke-width="6"/>
              <circle cx="36" cy="36" r="28" fill="none" stroke="#D85A30" stroke-width="6"
                stroke-linecap="round"
                stroke-dasharray="${(calPct / 100 * 175.9).toFixed(1)} 175.9"
                transform="rotate(-90 36 36)"/>
              <text x="36" y="40" text-anchor="middle" font-size="13" font-weight="500" fill="#D85A30">${calPct}%</text>
            </svg>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${calPct}%;background:#D85A30;"></div>
          </div>
        </div>

        <!-- Protein card -->
        <div class="card-white">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <div>
              <div style="font-size:11px;color:var(--text-2);text-transform:uppercase;letter-spacing:.05em;font-weight:500;margin-bottom:4px;">Protein today</div>
              <div style="font-size:26px;font-weight:500;color:var(--text);">${totals.protein}<span style="font-size:14px;color:var(--text-2);font-weight:400;">g</span></div>
              <div style="font-size:12px;color:var(--text-2);">of ${goals.protein}g · <span style="color:${remaining.protein > 0 ? 'var(--accent)' : 'var(--red)'};">${remaining.protein > 0 ? remaining.protein + 'g remaining' : Math.abs(goals.protein - totals.protein) + 'g over'}</span></div>
            </div>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="28" fill="none" stroke="#D3D1C7" stroke-width="6"/>
              <circle cx="36" cy="36" r="28" fill="none" stroke="#378ADD" stroke-width="6"
                stroke-linecap="round"
                stroke-dasharray="${(protPct / 100 * 175.9).toFixed(1)} 175.9"
                transform="rotate(-90 36 36)"/>
              <text x="36" y="40" text-anchor="middle" font-size="13" font-weight="500" fill="#378ADD">${protPct}%</text>
            </svg>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${protPct}%;background:#378ADD;"></div>
          </div>
        </div>
      </div>

      <!-- Carbs & fat mini bars -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:1.2rem;">
        <div class="card">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:12px;font-weight:500;">Carbs</span>
            <span style="font-size:12px;color:var(--text-2);">${totals.carbs}g / ${goals.carbs}g</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${carbPct}%;background:#EF9F27;"></div></div>
        </div>
        <div class="card">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:12px;font-weight:500;">Fat</span>
            <span style="font-size:12px;color:var(--text-2);">${totals.fat}g / ${goals.fat}g</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${fatPct}%;background:#D4537E;"></div></div>
        </div>
      </div>

      <!-- Today's food log -->
      <div class="section-label">TODAY'S FOOD LOG</div>
      <div>
        ${todayLog.length === 0
          ? '<div style="font-size:13px;color:var(--text-2);">Nothing logged yet today. Hit "+ Log food" to start.</div>'
          : todayLog.map(e => foodRow(e)).join('')}
      </div>
    `
  }

  function foodRow(e) {
    const mealColors = { Breakfast: '#EF9F27', Lunch: '#1D9E75', Dinner: '#378ADD', Snack: '#7F77DD' }
    const col = mealColors[e.meal] || '#888780'
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-2);border-radius:var(--radius);margin-bottom:6px;">
        <div style="width:3px;height:36px;background:${col};border-radius:0;flex-shrink:0;"></div>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:500;">${e.name}</div>
          <div style="font-size:11px;color:var(--text-2);">${e.meal} · ${e.time}</div>
        </div>
        <div style="text-align:right;font-size:12px;">
          <div style="font-weight:500;color:#D85A30;">${e.calories} cal</div>
          <div style="color:var(--text-2);">${e.protein}g protein</div>
        </div>
        <button onclick="Nutrition.remove('${e.id}')"
          style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:16px;font-family:var(--font);">×</button>
      </div>`
  }

  function showAddForm() {
    document.getElementById('add-food-form').style.display = 'block'
    document.getElementById('food-name').focus()
  }

  function hideAddForm() {
    document.getElementById('add-food-form').style.display = 'none'
  }

  function showGoalsForm() {
    document.getElementById('goals-form').style.display = 'block'
  }

  function hideGoalsForm() {
    document.getElementById('goals-form').style.display = 'none'
  }

  async function saveGoals() {
    const data = DB.get('nutrition') || { goals: {}, log: [] }
    data.goals = {
      calories: parseInt(document.getElementById('goal-cal').value)  || 2000,
      protein:  parseInt(document.getElementById('goal-prot').value) || 150,
      carbs:    parseInt(document.getElementById('goal-carbs').value)|| 250,
      fat:      parseInt(document.getElementById('goal-fat').value)  || 65,
    }
    await DB.save('nutrition', data)
    render()
  }

  async function addFood() {
    const name     = document.getElementById('food-name').value.trim()
    const meal     = document.getElementById('food-meal').value
    const calories = parseInt(document.getElementById('food-cal').value)   || 0
    const protein  = parseFloat(document.getElementById('food-prot').value) || 0
    const carbs    = parseFloat(document.getElementById('food-carbs').value)|| 0
    const fat      = parseFloat(document.getElementById('food-fat').value)  || 0
    if (!name) return

    const data = DB.get('nutrition') || { goals: { calories:2000, protein:150, carbs:250, fat:65 }, log: [] }
    const now  = new Date()
    data.log.unshift({
      id:       now.getTime().toString(),
      date:     now.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }),
      time:     now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }),
      name, meal, calories, protein, carbs, fat
    })
    await DB.save('nutrition', data)
    render()
  }

  async function removeEntry(id) {
    const data = DB.get('nutrition') || { goals: {}, log: [] }
    data.log = data.log.filter(e => e.id !== id)
    await DB.save('nutrition', data)
    render()
  }

  return { render, showAddForm, hideAddForm, showGoalsForm, hideGoalsForm, saveGoals, addFood, remove: removeEntry }
})()
