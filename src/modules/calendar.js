// calendar.js — Calendar module

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
    showEventForm, hideEventForm, addEvent, removeEvent,
    prevMonth, nextMonth
  }
})()