// notes.js — Notes module (iPhone Notes style)

const Notes = (() => {

  let activeFolder = 'All Notes'
  let activeNoteId = null
  let saveTimer    = null

  // ── Render ────────────────────────────────────────────────────────
  function render() {
    const el      = document.getElementById('section-notes')
    const notes   = DB.get('notes')        || []
    const folders = DB.get('noteFolders')  || ['Personal', 'Work', 'Ideas']

    if (activeNoteId === null && notes.length > 0) activeNoteId = notes[0].id
    const activeNote = notes.find(n => n.id === activeNoteId) || null

    el.style.padding  = '0'
    el.style.overflow = 'hidden'

    el.innerHTML = `
      <div style="display:flex;height:100%;width:100%;overflow:hidden;">

        <!-- Folders panel -->
        <div style="width:190px;min-width:190px;background:var(--bg-2);border-right:0.5px solid var(--border);display:flex;flex-direction:column;overflow:hidden;">
          <div style="padding:16px 16px 12px;border-bottom:0.5px solid var(--border);">
            <div style="font-size:16px;font-weight:600;color:var(--text);">Notes</div>
          </div>

          <div style="flex:1;overflow-y:auto;padding:8px 0;">
            ${folderRow('All Notes', notes.length)}
            ${folderRow('Pinned', notes.filter(n => n.pinned).length)}
            <div style="height:0.5px;background:var(--border);margin:6px 12px;"></div>
            ${folders.map(f => folderRow(f, notes.filter(n => n.folder === f).length, true)).join('')}
          </div>

          <div style="padding:10px 12px;border-top:0.5px solid var(--border);" id="new-folder-area">
            <button id="new-folder-btn" onclick="Notes.showNewFolderInput()"
              style="width:100%;background:none;border:0.5px solid var(--border-2);border-radius:var(--radius);padding:6px;font-size:12px;cursor:pointer;color:var(--text-2);font-family:var(--font);">
              + New folder
            </button>
          </div>
        </div>

        <!-- Notes list -->
        <div style="width:250px;min-width:250px;border-right:0.5px solid var(--border);display:flex;flex-direction:column;overflow:hidden;">
          <div style="padding:10px 12px;border-bottom:0.5px solid var(--border);">
            <input type="text" id="notes-search" placeholder="Search notes..."
              oninput="Notes.search(this.value)"
              style="width:100%;padding:6px 10px;border-radius:20px;border:none;background:var(--bg-3);font-size:12px;outline:none;color:var(--text);box-sizing:border-box;" />
          </div>

          <div style="flex:1;overflow-y:auto;" id="notes-list">
            ${buildNotesList(notes, folders)}
          </div>

          <div style="padding:10px 12px;border-top:0.5px solid var(--border);">
            <button onclick="Notes.newNote()" class="btn btn-primary" style="width:100%;font-size:12px;">
              + New note
            </button>
          </div>
        </div>

        <!-- Editor -->
        <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;" id="editor-panel">
          ${activeNote ? buildEditor(activeNote, folders) : buildEmpty()}
        </div>

      </div>
    `
  }

  // ── Folder row ────────────────────────────────────────────────────
  function folderRow(name, count, deletable = false) {
    const active = name === activeFolder
    const icon = name === 'Pinned'
      ? '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>'
      : name === 'All Notes'
        ? '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>'
        : '<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>'
    return `
      <div onclick="Notes.selectFolder('${name}')"
        style="display:flex;align-items:center;gap:8px;padding:8px 14px;cursor:pointer;font-size:13px;
          background:${active ? 'var(--bg-3)' : 'transparent'};
          color:${active ? 'var(--text)' : 'var(--text-2)'};
          font-weight:${active ? '500' : '400'};">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="flex-shrink:0;">${icon}</svg>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
        <span style="font-size:11px;color:var(--text-3);">${count || ''}</span>
        ${deletable ? `<button onclick="event.stopPropagation();Notes.deleteFolder('${name}')"
          style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:14px;line-height:1;padding:0;font-family:var(--font);margin-left:2px;">×</button>` : ''}
      </div>`
  }

  // ── Notes list ────────────────────────────────────────────────────
  function buildNotesList(notes, folders) {
    let list = [...notes]
    if (activeFolder === 'Pinned')          list = list.filter(n => n.pinned)
    else if (activeFolder !== 'All Notes')  list = list.filter(n => n.folder === activeFolder)

    list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.updated) - new Date(a.updated)
    })

    if (!list.length) return `
      <div style="padding:2rem 1rem;text-align:center;font-size:13px;color:var(--text-2);">
        No notes in this folder
      </div>`

    return list.map(n => {
      const isActive = n.id === activeNoteId
      const preview  = (n.content || '').replace(/\n/g, ' ').substring(0, 55)
      const date     = new Date(n.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return `
        <div onclick="Notes.selectNote(${n.id})"
          style="padding:11px 14px;cursor:pointer;border-bottom:0.5px solid var(--border);
            background:${isActive ? 'var(--bg-3)' : 'transparent'};">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;">
            ${n.pinned ? `<svg width="9" height="9" viewBox="0 0 24 24" fill="#EF9F27" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>` : ''}
            <div style="font-size:13px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${n.title || 'Untitled'}</div>
          </div>
          <div style="font-size:11px;color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${date}${activeFolder === 'All Notes' && n.folder ? ' · ' + n.folder : ''}${preview ? ' · ' + preview : ''}
          </div>
        </div>`
    }).join('')
  }

  // ── Editor ────────────────────────────────────────────────────────
  function buildEditor(note, folders) {
    const date = new Date(note.updated).toLocaleString('en-US', {
      month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'
    })
    const allFolders = [...new Set(['Personal','Work','Ideas',...(folders || [])])]
    return `
      <div style="padding:8px 14px;border-bottom:0.5px solid var(--border);display:flex;align-items:center;gap:6px;flex-wrap:nowrap;min-height:40px;">
        <select onchange="Notes.changeFolder(${note.id}, this.value)"
          style="font-size:12px;padding:3px 8px;border-radius:var(--radius);border:0.5px solid var(--border-2);
            background:var(--bg-2);color:var(--text-2);font-family:var(--font);flex-shrink:0;max-width:130px;">
          <option value="">No folder</option>
          ${allFolders.map(f => `<option value="${f}" ${note.folder === f ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
        <span style="flex:1;font-size:11px;color:var(--text-3);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Edited ${date}</span>
        <button onclick="Notes.togglePin(${note.id})" title="${note.pinned ? 'Unpin' : 'Pin'}"
          style="background:none;border:none;cursor:pointer;padding:4px;color:${note.pinned ? '#EF9F27' : 'var(--text-3)'};">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${note.pinned ? '#EF9F27' : 'none'}" stroke="${note.pinned ? '#EF9F27' : 'currentColor'}" stroke-width="1.8">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
        <button onclick="Notes.deleteNote(${note.id})"
          style="background:none;border:none;cursor:pointer;padding:4px;color:var(--text-3);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
        </button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:1.5rem 2rem;display:flex;flex-direction:column;">
        <input type="text" id="note-title" value="${(note.title || '').replace(/"/g,'&quot;')}"
          placeholder="Title" oninput="Notes.autoSave()"
          style="font-size:22px;font-weight:600;border:none;outline:none;background:transparent;
            color:var(--text);font-family:var(--font);margin-bottom:10px;padding:0;width:100%;" />
        <textarea id="note-content" oninput="Notes.autoSave()" placeholder="Start writing..."
          style="flex:1;border:none;outline:none;background:transparent;color:var(--text);
            font-family:var(--font);font-size:14px;line-height:1.9;resize:none;padding:0;min-height:500px;"
          >${(note.content || '').replace(/</g,'&lt;')}</textarea>
      </div>`
  }

  function buildEmpty() {
    return `
      <div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:var(--text-3);">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
          <line x1="8" y1="17" x2="13" y2="17"/>
        </svg>
        <div style="font-size:14px;">Select a note or create a new one</div>
      </div>`
  }

  // ── Actions ───────────────────────────────────────────────────────
  function selectFolder(name) {
    activeFolder  = name
    activeNoteId  = null
    render()
  }

  function selectNote(id) {
    activeNoteId = id
    const notes   = DB.get('notes')       || []
    const folders = DB.get('noteFolders') || []
    const listEl  = document.getElementById('notes-list')
    const editEl  = document.getElementById('editor-panel')
    if (listEl) listEl.innerHTML = buildNotesList(notes, folders)
    if (editEl) {
      const note = notes.find(n => n.id === id)
      editEl.innerHTML = note ? buildEditor(note, folders) : buildEmpty()
    }
  }

  async function newNote() {
    const notes   = DB.get('notes')       || []
    const folders = DB.get('noteFolders') || []
    const folder  = (activeFolder === 'All Notes' || activeFolder === 'Pinned') ? 'Personal' : activeFolder
    const n = { id: DB.nextId('notes'), title: '', content: '', folder, created: new Date().toISOString(), updated: new Date().toISOString(), pinned: false }
    notes.unshift(n)
    await DB.save('notes', notes)
    activeNoteId = n.id
    render()
    setTimeout(() => { const t = document.getElementById('note-title'); if (t) t.focus() }, 80)
  }

  function autoSave() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      if (!activeNoteId) return
      const titleEl   = document.getElementById('note-title')
      const contentEl = document.getElementById('note-content')
      if (!titleEl || !contentEl) return
      const notes = DB.get('notes') || []
      const note  = notes.find(n => n.id === activeNoteId)
      if (note) {
        note.title   = titleEl.value
        note.content = contentEl.value
        note.updated = new Date().toISOString()
        await DB.save('notes', notes)
        const listEl  = document.getElementById('notes-list')
        const folders = DB.get('noteFolders') || []
        if (listEl) listEl.innerHTML = buildNotesList(notes, folders)
      }
    }, 600)
  }

  async function togglePin(id) {
    const notes = DB.get('notes') || []
    const n = notes.find(n => n.id === id)
    if (n) { n.pinned = !n.pinned; await DB.save('notes', notes); render() }
  }

  async function changeFolder(id, folder) {
    const notes = DB.get('notes') || []
    const n = notes.find(n => n.id === id)
    if (n) { n.folder = folder; await DB.save('notes', notes) }
  }

  async function deleteNote(id) {
    const notes = DB.get('notes').filter(n => n.id !== id)
    await DB.save('notes', notes)
    activeNoteId = notes.length ? notes[0].id : null
    render()
  }

  // ── Folder management ─────────────────────────────────────────────
  function showNewFolderInput() {
    const area = document.getElementById('new-folder-area')
    if (!area) return
    area.innerHTML = `
      <div style="display:flex;gap:4px;">
        <input type="text" id="new-folder-input" placeholder="Folder name" autofocus
          onkeydown="if(event.key==='Enter')Notes.saveNewFolder();if(event.key==='Escape')Notes.render();"
          style="flex:1;padding:5px 8px;font-size:12px;border-radius:var(--radius);
            border:0.5px solid var(--border-2);background:var(--bg);color:var(--text);font-family:var(--font);" />
        <button onclick="Notes.saveNewFolder()"
          style="background:var(--accent);color:#fff;border:none;border-radius:var(--radius);padding:5px 8px;font-size:12px;cursor:pointer;font-family:var(--font);">✓</button>
      </div>`
    setTimeout(() => { const inp = document.getElementById('new-folder-input'); if (inp) inp.focus() }, 30)
  }

  async function saveNewFolder() {
    const inp  = document.getElementById('new-folder-input')
    const name = inp ? inp.value.trim() : ''
    if (!name) { render(); return }
    const folders = DB.get('noteFolders') || []
    if (!folders.includes(name)) { folders.push(name); await DB.save('noteFolders', folders) }
    activeFolder = name
    render()
  }

  async function deleteFolder(name) {
    const folders = (DB.get('noteFolders') || []).filter(f => f !== name)
    await DB.save('noteFolders', folders)
    if (activeFolder === name) activeFolder = 'All Notes'
    render()
  }

  // ── Search ────────────────────────────────────────────────────────
  function search(query) {
    const notes   = DB.get('notes')       || []
    const folders = DB.get('noteFolders') || []
    const listEl  = document.getElementById('notes-list')
    if (!listEl) return
    if (!query) { listEl.innerHTML = buildNotesList(notes, folders); return }
    const q = query.toLowerCase()
    const filtered = notes.filter(n =>
      (n.title   || '').toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q)
    )
    listEl.innerHTML = filtered.length
      ? filtered.map(n => {
          const isActive = n.id === activeNoteId
          const date = new Date(n.updated).toLocaleDateString('en-US', { month:'short', day:'numeric' })
          const preview = (n.content || '').replace(/\n/g,' ').substring(0, 55)
          return `<div onclick="Notes.selectNote(${n.id})"
            style="padding:11px 14px;cursor:pointer;border-bottom:0.5px solid var(--border);background:${isActive?'var(--bg-3)':'transparent'};">
            <div style="font-size:13px;font-weight:500;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n.title||'Untitled'}</div>
            <div style="font-size:11px;color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${date} · ${n.folder || ''} · ${preview}</div>
          </div>`
        }).join('')
      : `<div style="padding:2rem 1rem;text-align:center;font-size:13px;color:var(--text-2);">No results for "${query}"</div>`
  }

  return {
    render, selectFolder, selectNote, newNote, autoSave,
    togglePin, changeFolder, deleteNote,
    showNewFolderInput, saveNewFolder, deleteFolder, search
  }
})()
