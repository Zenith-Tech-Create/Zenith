// ai.js — AI Assistant module with content reporting (Microsoft Store requirement)

const AI = (() => {

  let history = []
  let messageCounter = 0

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
          <div style="font-size:11px;color:var(--text-2);">Powered by Claude · <span style="color:var(--accent);">AI-generated content may be inaccurate</span></div>
        </div>
        <button onclick="AI.showKeyForm()" style="background:none;border:0.5px solid var(--border-2);border-radius:var(--radius);padding:4px 10px;font-size:11px;cursor:pointer;color:var(--text-2);font-family:var(--font);">
          ${apiKey ? 'Edit API key' : 'Set API key'}
        </button>
      </div>

      <!-- API key setup panel -->
      <div id="api-key-panel" style="display:${apiKey ? 'none' : 'block'};padding:1.2rem;border-bottom:0.5px solid var(--border);background:var(--bg-2);">
        <div style="font-size:13px;font-weight:500;margin-bottom:6px;">Set your Anthropic API key</div>
        <div style="font-size:12px;color:var(--text-2);margin-bottom:10px;line-height:1.6;">
          Get a free API key at <strong>console.anthropic.com</strong> → API Keys → Create key.
        </div>
        <div style="display:flex;gap:8px;">
          <input type="password" id="api-key-input" placeholder="sk-ant-api03-..."
            value="${apiKey}" style="flex:1;font-family:monospace;" />
          <button class="btn btn-purple" onclick="AI.saveKey()" style="font-size:12px;white-space:nowrap;">Save key</button>
        </div>
      </div>

      <!-- Report inappropriate content banner -->
      <div style="padding:8px 20px;background:#FEF9EC;border-bottom:0.5px solid #F0D080;display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#854F0B" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          <span style="font-size:11px;color:#854F0B;">AI can make mistakes. Responses are generated automatically and may be inaccurate.</span>
        </div>
        <button onclick="AI.showReportDialog(null, 'general')"
          style="background:none;border:0.5px solid #854F0B;border-radius:var(--radius);padding:3px 10px;font-size:11px;cursor:pointer;color:#854F0B;font-family:var(--font);white-space:nowrap;">
          Report content
        </button>
      </div>

      ${!apiKey ? `
        <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:2rem;text-align:center;">
          <div>
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

      <!-- Report dialog (hidden by default) -->
      <div id="report-dialog" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center;">
        <div style="background:var(--bg);border-radius:var(--radius-lg);padding:1.5rem;max-width:420px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
          <div style="font-size:15px;font-weight:500;margin-bottom:6px;">Report inappropriate content</div>
          <div style="font-size:12px;color:var(--text-2);margin-bottom:1rem;line-height:1.5;">
            Help us improve Zenith AI by reporting content that is harmful, inaccurate, offensive, or inappropriate.
          </div>

          <div style="font-size:11px;color:var(--text-2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;font-weight:500;">Reason</div>
          <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:1rem;" id="report-reasons">
            ${[
              'Harmful or dangerous content',
              'Offensive or inappropriate content',
              'Inaccurate or misleading information',
              'Privacy concern',
              'Other'
            ].map((r, i) => `
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
                <input type="radio" name="report-reason" value="${r}" ${i === 0 ? 'checked' : ''}
                  style="accent-color:var(--red);" />
                ${r}
              </label>`).join('')}
          </div>

          <div style="font-size:11px;color:var(--text-2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;font-weight:500;">Additional details (optional)</div>
          <textarea id="report-details" placeholder="Describe the issue..."
            style="width:100%;height:80px;margin-bottom:1rem;font-size:13px;resize:none;box-sizing:border-box;"></textarea>

          <div id="report-content-preview" style="display:none;background:var(--bg-2);border-radius:var(--radius);padding:10px;margin-bottom:1rem;font-size:12px;color:var(--text-2);max-height:60px;overflow:hidden;"></div>

          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-ghost" onclick="AI.hideReportDialog()" style="font-size:12px;">Cancel</button>
            <button onclick="AI.submitReport()"
              style="background:#E24B4A;color:#fff;border:none;border-radius:var(--radius);padding:7px 16px;font-size:12px;cursor:pointer;font-family:var(--font);">
              Submit report
            </button>
          </div>
        </div>
      </div>

      <!-- Report success toast -->
      <div id="report-toast" style="display:none;position:fixed;bottom:20px;right:20px;background:#1A1A1A;color:#fff;padding:10px 16px;border-radius:var(--radius);font-size:13px;z-index:1001;max-width:320px;line-height:1.5;">
        Report submitted. Your email client will open so you can send the report to our team.
      </div>
    `
  }

  // ── Report functions ──────────────────────────────────────────────
  let currentReportMessageId = null

  function showReportDialog(messageId, type) {
    currentReportMessageId = messageId
    const dialog = document.getElementById('report-dialog')
    if (!dialog) return
    dialog.style.display = 'flex'

    const preview = document.getElementById('report-content-preview')
    if (messageId && preview) {
      const msgEl = document.getElementById('ai-msg-' + messageId)
      if (msgEl) {
        preview.style.display = 'block'
        preview.textContent = 'Reported message: "' + msgEl.textContent.substring(0, 100) + '..."'
      }
    }
  }

  function hideReportDialog() {
    const dialog = document.getElementById('report-dialog')
    if (dialog) dialog.style.display = 'none'
    currentReportMessageId = null
  }

  async function submitReport() {
    const reasonEl  = document.querySelector('input[name="report-reason"]:checked')
    const detailsEl = document.getElementById('report-details')
    const reason    = reasonEl ? reasonEl.value : 'Other'
    const details   = detailsEl ? detailsEl.value.trim() : ''

    // Get reported message content if available
    let messageContent = ''
    if (currentReportMessageId) {
      const msgEl = document.getElementById('ai-msg-' + currentReportMessageId)
      if (msgEl) messageContent = msgEl.textContent.substring(0, 500)
    }

    // Save report locally
    const reports = DB.get('aiReports') || []
    reports.push({
      id:        Date.now().toString(),
      messageId: currentReportMessageId,
      reason,
      details,
      timestamp: new Date().toISOString()
    })
    await DB.save('aiReports', reports)

    // Open email client with report pre-filled
    const subject = encodeURIComponent('Zenith AI Content Report')
    const body = encodeURIComponent(
      'ZENITH AI CONTENT REPORT\n' +
      '================================\n\n' +
      'Reason: ' + reason + '\n\n' +
      'Additional details: ' + (details || 'None provided') + '\n\n' +
      (messageContent ? 'Reported message:\n' + messageContent + '\n\n' : '') +
      'Timestamp: ' + new Date().toISOString() + '\n\n' +
      '================================\n' +
      'Submitted from Zenith Personnel Life OS v1.2.1'
    )

    // Open email client via preload bridge
    const mailtoUrl = 'mailto:Localaiworkstation@gmail.com?subject=' + subject + '&body=' + body
    if (window.zenith && window.zenith.openExternal) {
      window.zenith.openExternal(mailtoUrl)
    } else {
      window.location.href = mailtoUrl
    }

    hideReportDialog()

    // Show success toast
    const toast = document.getElementById('report-toast')
    if (toast) {
      toast.style.display = 'block'
      setTimeout(() => { toast.style.display = 'none' }, 4000)
    }
  }

  // ── Key management ────────────────────────────────────────────────
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

  // ── Context ───────────────────────────────────────────────────────
  function getContext() {
    const tasks        = DB.get('tasks')        || []
    const habits       = DB.get('habits')       || []
    const goals        = DB.get('goals')        || []
    const transactions = DB.get('transactions') || []
    const workouts     = DB.get('workouts')     || []
    const nutrition    = DB.get('nutrition')    || { goals: {}, log: [] }

    const income   = transactions.filter(t => t.type === 'inc').reduce((s, t) => s + t.amt, 0)
    const expenses = transactions.filter(t => t.type === 'exp').reduce((s, t) => s + t.amt, 0)
    const todayStr = new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })
    const todayNut = (nutrition.log || []).filter(e => e.date === todayStr)
    const totalCals = todayNut.reduce((s, e) => s + (e.calories || 0), 0)
    const totalProt = todayNut.reduce((s, e) => s + (e.protein  || 0), 0)

    return `You are the AI assistant built into Zenith, a personal life OS desktop app.
Today is ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}.
Be concise, warm, and actionable. Keep responses to 2-4 sentences unless a list is genuinely needed.
Important: Do not generate harmful, offensive, or inappropriate content.

USER DATA:
Tasks: ${JSON.stringify(tasks.map(t => ({ text: t.text, done: t.done, cat: t.cat, due: t.date })))}
Habits: ${JSON.stringify(habits.map(h => ({ name: h.name, done: h.done, streak: h.streak })))}
Goals: ${JSON.stringify(goals.map(g => ({ name: g.name, progress: g.prog, target: g.total, unit: g.unit })))}
Finance: income $${income.toFixed(2)}, expenses $${expenses.toFixed(2)}, balance $${(income - expenses).toFixed(2)}
Workouts: ${JSON.stringify(workouts.slice(0, 5).map(w => ({ type: w.type, minutes: w.dur, calories: w.cal })))}
Nutrition today: ${totalCals} cal, ${totalProt}g protein`
  }

  // ── Chat ──────────────────────────────────────────────────────────
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
      if (data.error) throw new Error(data.error.message || 'API error')

      const reply = data.content && data.content[0] ? data.content[0].text : 'Sorry, something went wrong.'
      history.push({ role: 'assistant', content: reply })

      typDiv.remove()

      // Create message with report button
      const msgId  = 'msg-' + (++messageCounter)
      const aWrap  = document.createElement('div')
      aWrap.style.cssText = 'display:flex;flex-direction:column;align-self:flex-start;gap:4px;max-width:90%;'
      aWrap.innerHTML = `
        <div class="msg-ai" id="ai-msg-${msgId}" style="margin:0;">${reply}</div>
        <button onclick="AI.showReportDialog('${msgId}', 'message')"
          style="background:none;border:none;cursor:pointer;font-size:10px;color:var(--text-3);
            text-align:left;padding:0 4px;font-family:var(--font);display:flex;align-items:center;gap:3px;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
          Report this response
        </button>`
      msgs.appendChild(aWrap)

    } catch (err) {
      typDiv.remove()
      const eDiv = document.createElement('div')
      eDiv.className = 'msg-ai'
      eDiv.style.color = 'var(--red)'
      eDiv.textContent = 'Error: ' + (err.message || 'Could not reach the AI.')
      msgs.appendChild(eDiv)
    }

    msgs.scrollTop = msgs.scrollHeight
    if (sendBtn) sendBtn.disabled = false
    if (input) input.focus()
  }

  return { render, showKeyForm, hideKeyForm, saveKey, ask, send, showReportDialog, hideReportDialog, submitReport }
})()