// finance.js — Finance module

const Finance = (() => {

  function render() {
    const el = document.getElementById('section-finance')
    const txns = DB.get('transactions')
    const income   = txns.filter(t => t.type === 'inc').reduce((s, t) => s + t.amt, 0)
    const expenses = txns.filter(t => t.type === 'exp').reduce((s, t) => s + t.amt, 0)
    const balance  = income - expenses

    el.innerHTML = `
      <div class="page-header">
        <div class="page-title">Finance</div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary" onclick="Finance.showAddForm()">+ Add transaction</button>
        </div>
      </div>

      <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.2rem;">
        <div class="stat-card">
          <div class="stat-label">Balance</div>
          <div class="stat-value" style="color:var(--accent);">$${balance.toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Income</div>
          <div class="stat-value">$${income.toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Expenses</div>
          <div class="stat-value" style="color:var(--red);">$${expenses.toFixed(2)}</div>
        </div>
      </div>

      <div id="add-txn-form" style="display:none;margin-bottom:1rem;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <input type="text" id="txn-desc" placeholder="Description" style="flex:2;min-width:140px;" />
          <input type="number" id="txn-amt" placeholder="Amount" step="0.01" style="flex:1;min-width:90px;" />
          <select id="txn-type" style="flex:1;min-width:100px;">
            <option value="exp">Expense</option>
            <option value="inc">Income</option>
          </select>
          <select id="txn-cat" style="flex:1;min-width:110px;">
            <option>Groceries</option><option>Dining</option><option>Transport</option>
            <option>Subscriptions</option><option>Shopping</option><option>Health</option>
            <option>Income</option><option>Utilities</option><option>Other</option>
          </select>
          <button class="btn btn-primary" onclick="Finance.addTxn()">Add</button>
          <button class="btn btn-ghost" onclick="Finance.hideAddForm()">Cancel</button>
        </div>
      </div>

      <div class="section-label">RECENT TRANSACTIONS</div>
      <div>
        ${txns.map(t => txnRow(t)).join('')}
        ${txns.length === 0 ? '<div style="font-size:13px;color:var(--text-2);">No transactions yet.</div>' : ''}
      </div>
    `
  }

  function txnRow(t) {
    const isInc = t.type === 'inc'
    return `
      <div class="row-item">
        <div style="width:34px;height:34px;border-radius:var(--radius);flex-shrink:0;display:flex;
          align-items:center;justify-content:center;
          background:${isInc ? '#E1F5EE' : '#FCEBEB'};">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="${isInc ? '#0F6E56' : '#A32D2D'}" stroke-width="2">
            ${isInc
              ? '<polyline points="12 19 12 5"/><polyline points="5 12 12 5 19 12"/>'
              : '<polyline points="12 5 12 19"/><polyline points="19 12 12 19 5 12"/>'}
          </svg>
        </div>
        <div style="flex:1;">
          <div style="font-size:13px;">${t.desc}</div>
          <div style="font-size:11px;color:var(--text-2);">${t.date}</div>
        </div>
        ${App.tag(t.cat)}
        <div style="font-size:13px;font-weight:500;color:${isInc ? 'var(--accent)' : 'var(--red)'};">
          ${isInc ? '+' : '-'}$${Number(t.amt).toFixed(2)}
        </div>
        <button onclick="Finance.remove(${t.id})"
          style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:16px;line-height:1;padding:2px 4px;font-family:var(--font);">×</button>
      </div>
    `
  }

  function showAddForm() {
    document.getElementById('add-txn-form').style.display = 'block'
  }

  function hideAddForm() {
    document.getElementById('add-txn-form').style.display = 'none'
  }

  async function addTxn() {
    const desc = document.getElementById('txn-desc').value.trim()
    const amt  = parseFloat(document.getElementById('txn-amt').value)
    const type = document.getElementById('txn-type').value
    const cat  = document.getElementById('txn-cat').value
    if (!desc || isNaN(amt)) return

    const txns = DB.get('transactions')
    txns.unshift({ id: DB.nextId('transactions'), type, desc, amt, cat, date: 'Today' })
    await DB.save('transactions', txns)
    render()
    if (typeof App !== 'undefined') App.refreshDashboard()
  }

  async function removeTxn(id) {
    await DB.save('transactions', DB.get('transactions').filter(t => t.id !== id))
    render()
    if (typeof App !== 'undefined') App.refreshDashboard()
  }

  return { render, showAddForm, hideAddForm, addTxn, remove: removeTxn }
})()
