// journal.js — Journal module
// How it works:
// - Each time you click "Save entry" a new entry is created with today's date & time
// - Entries persist forever — they never automatically delete or move
// - Today's entries appear at the top under "Today", older ones under "Past entries"
// - The textarea is always blank and ready for a new entry

const Journal = (() => {

  function render() {
    const el = document.getElementById('section-journal')
    const entries = DB.get('journal')
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const todayEntries = entries.filter(e => e.date === todayStr)
    const pastEntries  = entries.filter(e => e.date !== todayStr)

    el.innerHTML = `
      <div class="page-header">
        <div class="page-title">Journal</div>
      </div>

      <div style="font-size:12px;color:var(--text-2);margin-bottom:10px;">${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>

      <textarea id="journal-entry" placeholder="What's on your mind today..."
        style="width:100%;min-height:180px;margin-bottom:10px;"></textarea>

      <div style="display:flex;gap:8px;align-items:center;margin-bottom:1.5rem;">
        <button class="btn btn-primary" onclick="Journal.save()">Save entry</button>
        <span id="journal-saved" style="font-size:12px;color:var(--accent);"></span>
      </div>

      ${todayEntries.length > 0 ? `
        <div class="section-label">TODAY'S ENTRIES</div>
        <div style="margin-bottom:1.2rem;">
          ${todayEntries.map(e => entryCard(e, true)).join('')}
        </div>` : ''}

      ${pastEntries.length > 0 ? `
        <div class="section-label">PAST ENTRIES</div>
        <div>
          ${pastEntries.map(e => entryCard(e, false)).join('')}
        </div>` : ''}

      ${entries.length === 0 ? `
        <div style="font-size:13px;color:var(--text-2);">No entries yet. Write something and hit save!</div>` : ''}
    `
  }

  function entryCard(e, expanded) {
    return `
      <div style="border:0.5px solid var(--border);border-radius:var(--radius-lg);margin-bottom:8px;overflow:hidden;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;
          background:var(--bg-2);cursor:pointer;" onclick="Journal.toggleEntry('entry-body-${e.id}')">
          <div>
            <div style="font-size:13px;font-weight:500;">${e.date}</div>
            <div style="font-size:11px;color:var(--text-2);margin-top:1px;">${e.time} · ${e.content.split(' ').length} words</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <button onclick="event.stopPropagation();Journal.remove('${e.id}')"
              style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:16px;font-family:var(--font);">×</button>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
        <div id="entry-body-${e.id}" style="display:${expanded ? 'block' : 'none'};padding:12px 14px;font-size:13px;line-height:1.7;white-space:pre-wrap;">${e.content}</div>
      </div>`
  }

  function toggleEntry(id) {
    const el = document.getElementById(id)
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'
  }

  async function save() {
    const content = document.getElementById('journal-entry').value.trim()
    if (!content) return
    const entries = DB.get('journal')
    const now  = new Date()
    const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    entries.unshift({ id: now.getTime().toString(), date, time, content })
    await DB.save('journal', entries)

    document.getElementById('journal-entry').value = ''
    document.getElementById('journal-saved').textContent = 'Saved at ' + time
    render()
  }

  async function removeEntry(id) {
    await DB.save('journal', DB.get('journal').filter(e => e.id !== id))
    render()
  }

  return { render, save, toggleEntry, remove: removeEntry }
})()
