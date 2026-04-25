// ai.js — AI Assistant module

const AI = (() => {

  let history = []

  function render() {
    const el     = document.getElementById('section-ai')
    const apiKey = DB.get('apiKey') || ''

    el.innerHTML = `
      <div style="padding:16px 20px;border-bottom:0.5px solid var(--border);display:flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--purple-light);display:flex;align-items:center;justify-content:center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="2">
            <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
        </div>
        <div style="flex:1;">
          <div style="font-size:14px;font-weight:500;">Zenith AI</div>
          <div style="font-size:11px;color:var(--text-2);">Powered by Claude — knows your tasks, habits, goals & more</div>
        </div>
        <button onclick="AI.showKeyForm()" style="background:none;border:0.5px solid var(--border-2);border-radius:var(--radius);padding:4px 10px;font-size:11px;cursor:pointer;color:var(--text-2);font-family:var(--font);">
          ${apiKey ? 'Edit API key' : 'Set API key'}
        </button>
      </div>

      <!-- API key setup panel -->
      <div id="api-key-panel" style="display:${apiKey ? 'none' : 'block'};padding:1.2rem;border-bottom:0.5px solid var(--border);background:var(--bg-2);">
        <div style="font-size:13px;font-weight:500;margin-bottom:6px;">Set your Anthropic API key</div>
        <div style="font-size:12px;color:var(--text-2);margin-bottom:10px;line-height:1.6;">
          The AI assistant uses the Anthropic API. Get a free API key at
          <strong>console.anthropic.com</strong> → API Keys → Create key.
        </div>
        <div style="display:flex;gap:8px;">
          <input type="password" id="api-key-input" placeholder="sk-ant-api03-..." value="${apiKey}"
            style="flex:1;font-family:monospace;" />
          <button class="btn btn-purple" onclick="AI.saveKey()" style="font-size:12px;white-space:nowrap;">Save key</button>
        </div>
        ${apiKey ? '<button class="btn btn-ghost" onclick="AI.hideKeyForm()" style="margin-top:8px;font-size:12px;">Cancel</button>' : ''}
      </div>

      ${!apiKey ? `
        <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:2rem;text-align:center;">
          <div>
            <div style="font-size:32px;margin-bottom:12px;">🤖</div>
            <div style="font-size:14px;font-weight:500;margin-bottom:6px;">Enter your API key above to get started</div>
            <div style="font-size:12px;color:var(--text-2);">Your key is stored locally and never shared.</div>
          </div>
        </div>
      ` : `
        <div id="ai-messages" style="flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:10px;">
          <div class="msg-ai">Hi! I have full context on your tasks, habits, goals, finances and workouts. Ask me anything.</div>
          <div id="ai-chips" style="display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start;">
            ${['What should I focus on today?','How am I tracking on my goals?','Analyze my spending','Suggest a workout','Give me a journal prompt'].map(q =>
              `<button onclick="AI.ask('${q}')" style="padding:6px 12px;border-radius:20px;border:0.5px solid var(--border-2);font-size:12px;cursor:pointer;background:var(--bg-2);color:var(--text);font-family:var(--font);">${q}</button>`
            ).join('')}
          </div>
        </div>
        <div style="padding:12px 16px;border-top:0.5px solid var(--border);display:flex;gap:8px;align-items:center;">
          <input id="ai-input" type="text" placeholder="Ask anything about your day, goals, habits..."
            style="flex:1;" onkeydown="if(event.key==='Enter')AI.send()" />
          <button class="btn btn-purple" id="ai-send-btn" onclick="AI.send()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      `}
    `
  }

  function showKeyForm() {
    const panel = document.getElementById('api-key-panel')
    if (panel) panel.style.display = 'block'
  }

  function hideKeyForm() {
    const panel = document.getElementById('api-key-panel')
    if (panel) panel.style.display = 'none'
  }

  async function saveKey() {
    const input = document.getElementById('api-key-input')
    const key   = input ? input.value.trim() : ''
    if (!key) return
    await DB.save('apiKey', key)
    history = []
    render()
  }

  function getContext() {
    const tasks        = DB.get('tasks')        || []
    const habits       = DB.get('habits')       || []
    const goals        = DB.get('goals')        || []
    const transactions = DB.get('transactions') || []
    const workouts     = DB.get('workouts')     || []
    const nutrition    = DB.get('nutrition')    || { goals: {}, log: [] }

    const income   = transactions.filter(t => t.type === 'inc').reduce((s, t) => s + t.amt, 0)
    const expenses = transactions.filter(t => t.type === 'exp').reduce((s, t) => s + t.amt, 0)

    const todayStr  = new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })
    const todayNut  = (nutrition.log || []).filter(e => e.date === todayStr)
    const totalCals = todayNut.reduce((s, e) => s + (e.calories || 0), 0)
    const totalProt = todayNut.reduce((s, e) => s + (e.protein  || 0), 0)

    return `You are the AI assistant built into Zenith, a personal life OS desktop app.
Today is ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}.
Be concise, warm, and actionable. Keep responses to 2-4 sentences unless a list is genuinely needed.

USER DATA:
Tasks: ${JSON.stringify(tasks.map(t => ({ text: t.text, done: t.done, cat: t.cat, due: t.date })))}
Habits: ${JSON.stringify(habits.map(h => ({ name: h.name, done: h.done, streak: h.streak })))}
Goals: ${JSON.stringify(goals.map(g => ({ name: g.name, progress: g.prog, target: g.total, unit: g.unit })))}
Finance: income $${income.toFixed(2)}, expenses $${expenses.toFixed(2)}, balance $${(income - expenses).toFixed(2)}
Recent transactions: ${JSON.stringify(transactions.slice(0, 5).map(t => ({ desc: t.desc, amount: t.amt, type: t.type })))}
Workouts: ${JSON.stringify(workouts.slice(0, 5).map(w => ({ type: w.type, minutes: w.dur, calories: w.cal })))}
Nutrition today: ${totalCals} cal, ${totalProt}g protein (goals: ${nutrition.goals.calories || 2000} cal, ${nutrition.goals.protein || 150}g protein)`
  }

  async function ask(q) {
    const input = document.getElementById('ai-input')
    if (input) input.value = q
    send()
  }

  async function send() {
    const apiKey = DB.get('apiKey') || ''
    if (!apiKey) { alert('Please enter your Anthropic API key first.'); return }

    const input = document.getElementById('ai-input')
    const q = input ? input.value.trim() : ''
    if (!q) return
    input.value = ''

    const chips = document.getElementById('ai-chips')
    if (chips) chips.style.display = 'none'

    const msgs = document.getElementById('ai-messages')

    const uDiv = document.createElement('div')
    uDiv.className = 'msg-user'
    uDiv.textContent = q
    msgs.appendChild(uDiv)

    const typDiv = document.createElement('div')
    typDiv.className = 'typing-indicator'
    typDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>'
    msgs.appendChild(typDiv)
    msgs.scrollTop = msgs.scrollHeight

    const sendBtn = document.getElementById('ai-send-btn')
    if (sendBtn) sendBtn.disabled = true

    history.push({ role: 'user', content: q })

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          system: getContext(),
          messages: history
        })
      })

      const data  = await res.json()

      if (data.error) {
        throw new Error(data.error.message || 'API error')
      }

      const reply = data.content && data.content[0] ? data.content[0].text : 'Sorry, something went wrong.'
      history.push({ role: 'assistant', content: reply })

      typDiv.remove()
      const aDiv = document.createElement('div')
      aDiv.className = 'msg-ai'
      aDiv.textContent = reply
      msgs.appendChild(aDiv)

    } catch (err) {
      typDiv.remove()
      const eDiv = document.createElement('div')
      eDiv.className = 'msg-ai'
      eDiv.style.color = 'var(--red)'
      eDiv.textContent = 'Error: ' + (err.message || 'Could not reach the AI. Check your API key and internet connection.')
      msgs.appendChild(eDiv)
    }

    msgs.scrollTop = msgs.scrollHeight
    if (sendBtn) sendBtn.disabled = false
    if (input) input.focus()
  }

  return { render, showKeyForm, hideKeyForm, saveKey, ask, send }
})()
