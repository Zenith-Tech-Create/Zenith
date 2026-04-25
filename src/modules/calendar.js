// calendar.js — Calendar module with Google & Apple Calendar connection

const ZCalendar = (() => {

  let selectedDate = new Date()

  function render() {
    const el = document.getElementById('section-calendar')
    const now = new Date()
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const monthName = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const connections = DB.get('calConnections') || {}

    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    let calGrid = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:1rem;">`
    dayNames.forEach(d => {
      calGrid += `<div style="text-align:center;font-size:11px;color:var(--text-2);padding:4px 0;">${d}</div>`
    })
    for (let i = 0; i < firstDay; i++) calGrid += `<div></div>`
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear()
      calGrid += `<div style="text-align:center;padding:2px;">
        <div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;
          margin:auto;font-size:12px;border-radius:var(--radius);cursor:pointer;
          ${isToday ? 'background:var(--accent);color:#fff;font-weight:500;' : ''}">
          ${d}
        </div>
      </div>`
    }
    calGrid += `</div>`

    el.innerHTML = `
      <div class="page-header">
        <div class="page-title">Calendar</div>
        <button class="btn btn-primary" onclick="ZCalendar.showEventForm()">+ New event</button>
      </div>

      <!-- Calendar connections -->
      <div class="card-white" style="margin-bottom:1rem;">
        <div style="font-size:12px;font-weight:500;color:var(--text-2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;">Connected accounts</div>
        <div style="display:flex;flex-direction:column;gap:8px;">

          <!-- Google Calendar -->
          <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg-2);border-radius:var(--radius);">
            <div style="width:32px;height:32px;border-radius:8px;background:#E6F1FB;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            </div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:500;">Google Calendar</div>
              <div style="font-size:11px;color:var(--text-2);">${connections.google ? connections.google.email : 'Not connected'}</div>
            </div>
            ${connections.google
              ? `<span style="font-size:11px;background:#E1F5EE;color:#085041;padding:2px 8px;border-radius:10px;">Connected</span>
                 <button onclick="ZCalendar.disconnectGoogle()" style="background:none;border:none;cursor:pointer;font-size:11px;color:var(--text-2);font-family:var(--font);">Disconnect</button>`
              : `<button class="btn btn-ghost" onclick="ZCalendar.showGoogleForm()" style="font-size:12px;padding:5px 12px;">Connect</button>`
            }
          </div>

          <!-- Apple Calendar -->
          <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg-2);border-radius:var(--radius);">
            <div style="width:32px;height:32px;border-radius:8px;background:var(--bg-3);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color:var(--text);"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            </div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:500;">Apple Calendar</div>
              <div style="font-size:11px;color:var(--text-2);">${connections.apple ? connections.apple.email : 'Not connected'}</div>
            </div>
            ${connections.apple
              ? `<span style="font-size:11px;background:#E1F5EE;color:#085041;padding:2px 8px;border-radius:10px;">Connected</span>
                 <button onclick="ZCalendar.disconnectApple()" style="background:none;border:none;cursor:pointer;font-size:11px;color:var(--text-2);font-family:var(--font);">Disconnect</button>`
              : `<button class="btn btn-ghost" onclick="ZCalendar.showAppleForm()" style="font-size:12px;padding:5px 12px;">Connect</button>`
            }
          </div>
        </div>
      </div>

      <!-- Google connect form -->
      <div id="google-form" style="display:none;border:0.5px solid #85B7EB;border-radius:var(--radius-lg);padding:14px;margin-bottom:1rem;background:#E6F1FB;">
        <div style="font-size:13px;font-weight:500;color:#0C447C;margin-bottom:8px;">Connect Google Calendar</div>
        <div style="font-size:12px;color:#185FA5;margin-bottom:10px;line-height:1.5;">
          Enter your Google account email. Full OAuth sync requires a Google API key — 
          see README for setup instructions.
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <input type="email" id="google-email" placeholder="your@gmail.com" style="background:#fff;" />
          <div style="display:flex;gap:8px;">
            <button class="btn" onclick="ZCalendar.saveGoogle()" style="background:#4285F4;color:#fff;font-size:12px;">Connect</button>
            <button class="btn btn-ghost" onclick="ZCalendar.hideGoogleForm()" style="font-size:12px;">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Apple connect form -->
      <div id="apple-form" style="display:none;border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:14px;margin-bottom:1rem;background:var(--bg-2);">
        <div style="font-size:13px;font-weight:500;margin-bottom:4px;">Connect Apple Calendar</div>
        <div style="font-size:12px;color:var(--text-2);margin-bottom:10px;line-height:1.5;">
          Uses iCloud CalDAV. You need an <strong>app-specific password</strong> — not your regular Apple ID password.<br/>
          Generate one at: <strong>appleid.apple.com → Security → App-Specific Passwords</strong>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <input type="email" id="apple-email" placeholder="your@icloud.com" />
          <input type="password" id="apple-password" placeholder="App-specific password (xxxx-xxxx-xxxx-xxxx)" />
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary" onclick="ZCalendar.saveApple()" style="font-size:12px;">Connect</button>
            <button class="btn btn-ghost" onclick="ZCalendar.hideAppleForm()" style="font-size:12px;">Cancel</button>
          </div>
        </div>
      </div>

      <!-- New event form -->
      <div id="new-event-form" style="display:none;border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:14px;margin-bottom:1rem;background:var(--bg-2);">
        <div style="font-size:13px;font-weight:500;margin-bottom:10px;">New event</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <input type="text" id="ev-title" placeholder="Event title" />
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div>
              <label style="font-size:11px;color:var(--text-2);display:block;margin-bottom:4px;">Start</label>
              <input type="datetime-local" id="ev-start" />
            </div>
            <div>
              <label style="font-size:11px;color:var(--text-2);display:block;margin-bottom:4px;">End</label>
              <input type="datetime-local" id="ev-end" />
            </div>
          </div>
          <input type="text" id="ev-location" placeholder="Location (optional)" />
          ${connections.google || connections.apple ? `
          <div style="background:var(--bg-3);border-radius:var(--radius);padding:8px 10px;font-size:12px;color:var(--text-2);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0115-6.7L21 8"/></svg>
            Will sync to: ${[connections.google ? 'Google Calendar' : '', connections.apple ? 'Apple Calendar' : ''].filter(Boolean).join(' & ')}
          </div>` : ''}
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary" onclick="ZCalendar.addEvent()">Save event</button>
            <button class="btn btn-ghost" onclick="ZCalendar.hideEventForm()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="card-white" style="margin-bottom:1rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <button class="btn btn-ghost" onclick="ZCalendar.prevMonth()" style="padding:5px 14px;font-size:18px;line-height:1;">‹</button>
          <div style="font-size:14px;font-weight:500;">${monthName}</div>
          <button class="btn btn-ghost" onclick="ZCalendar.nextMonth()" style="padding:5px 14px;font-size:18px;line-height:1;">›</button>
        </div>
        ${calGrid}
      </div>

      <!-- Events list -->
      <div class="section-label">UPCOMING EVENTS</div>
      <div id="event-list">${renderEvents()}</div>
    `

    const todayStr = new Date().toISOString().slice(0, 16)
    const endStr   = new Date(Date.now() + 3600000).toISOString().slice(0, 16)
    const s = document.getElementById('ev-start')
    const e = document.getElementById('ev-end')
    if (s) s.value = todayStr
    if (e) e.value = endStr
  }

  function renderEvents() {
    const events = DB.get('events') || []
    if (!events.length) return '<div style="font-size:13px;color:var(--text-2);">No events yet. Add one above.</div>'
    return events.map(e => `
      <div style="display:flex;gap:12px;align-items:center;padding:10px;background:var(--bg-2);border-radius:var(--radius);margin-bottom:8px;">
        <div style="width:3px;height:36px;background:var(--accent);border-radius:0;flex-shrink:0;"></div>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:500;">${e.title}</div>
          <div style="font-size:11px;color:var(--text-2);">${e.start}${e.location ? ' · ' + e.location : ''}</div>
        </div>
        <button onclick="ZCalendar.removeEvent(${e.id})" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:16px;font-family:var(--font);">×</button>
      </div>`).join('')
  }

  // ── Google ────────────────────────────────────────────────────────
  function showGoogleForm() { document.getElementById('google-form').style.display = 'block' }
  function hideGoogleForm() { document.getElementById('google-form').style.display = 'none' }

  async function saveGoogle() {
    const email = document.getElementById('google-email').value.trim()
    if (!email) return
    const conns = DB.get('calConnections') || {}
    conns.google = { email, connected: true }
    await DB.save('calConnections', conns)
    render()
  }

  async function disconnectGoogle() {
    const conns = DB.get('calConnections') || {}
    delete conns.google
    await DB.save('calConnections', conns)
    render()
  }

  // ── Apple ─────────────────────────────────────────────────────────
  function showAppleForm() { document.getElementById('apple-form').style.display = 'block' }
  function hideAppleForm() { document.getElementById('apple-form').style.display = 'none' }

  async function saveApple() {
    const email = document.getElementById('apple-email').value.trim()
    const pass  = document.getElementById('apple-password').value.trim()
    if (!email || !pass) return
    const conns = DB.get('calConnections') || {}
    conns.apple = { email, connected: true }
    await DB.save('calConnections', conns)
    render()
  }

  async function disconnectApple() {
    const conns = DB.get('calConnections') || {}
    delete conns.apple
    await DB.save('calConnections', conns)
    render()
  }

  // ── Events ────────────────────────────────────────────────────────
  function showEventForm() {
    document.getElementById('new-event-form').style.display = 'block'
    document.getElementById('ev-title').focus()
  }

  function hideEventForm() { document.getElementById('new-event-form').style.display = 'none' }

  async function addEvent() {
    const title    = document.getElementById('ev-title').value.trim()
    const start    = document.getElementById('ev-start').value
    const end      = document.getElementById('ev-end').value
    const location = document.getElementById('ev-location').value.trim()
    if (!title || !start) return
    const events = DB.get('events') || []
    events.push({
      id:       events.length ? Math.max(...events.map(e => e.id)) + 1 : 1,
      title,
      start:    new Date(start).toLocaleString(),
      end:      end ? new Date(end).toLocaleString() : '',
      location
    })
    await DB.save('events', events)
    render()
  }

  async function removeEvent(id) {
    await DB.save('events', (DB.get('events') || []).filter(e => e.id !== id))
    render()
  }

  function prevMonth() {
    selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
    render()
  }

  function nextMonth() {
    selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
    render()
  }

  return {
    render,
    showGoogleForm, hideGoogleForm, saveGoogle, disconnectGoogle,
    showAppleForm,  hideAppleForm,  saveApple,  disconnectApple,
    showEventForm,  hideEventForm,  addEvent,   removeEvent,
    prevMonth, nextMonth
  }
})()
