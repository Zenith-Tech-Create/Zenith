// app.js — Main app controller

const App = (() => {

  let currentSection = 'dashboard'
  let _overdueTasks = []

  const CAT_COLORS = {
    Work:          { bg: '#E6F1FB', cl: '#185FA5' },
    Personal:      { bg: '#E1F5EE', cl: '#0F6E56' },
    Health:        { bg: '#FAECE7', cl: '#993C1D' },
    Finance:       { bg: '#FAEEDA', cl: '#854F0B' },
    Learning:      { bg: '#EEEDFE', cl: '#534AB7' },
    Fitness:       { bg: '#FAECE7', cl: '#993C1D' },
    Groceries:     { bg: '#EAF3DE', cl: '#3B6D11' },
    Income:        { bg: '#E1F5EE', cl: '#0F6E56' },
    Subscriptions: { bg: '#EEEDFE', cl: '#534AB7' },
    Transport:     { bg: '#E6F1FB', cl: '#185FA5' },
    Food:          { bg: '#FAEEDA', cl: '#854F0B' },
    Dining:        { bg: '#FAEEDA', cl: '#854F0B' },
    Shopping:      { bg: '#FBEAF0', cl: '#72243E' },
  }

  function tag(cat) {
    const c = CAT_COLORS[cat] || { bg: '#F1EFE8', cl: '#5F5E5A' }
    return `<span class="tag" style="background:${c.bg};color:${c.cl};">${cat}</span>`
  }

  function formatDate() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  function navigate(section) {
    // Update sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'))
    const navEl = document.querySelector(`[data-section="${section}"]`)
    if (navEl) navEl.classList.add('active')

    // Update sections
    document.querySelectorAll('.section').forEach(el => {
      el.classList.remove('active')
      el.style.display  = ''
      el.style.padding  = ''
      el.style.overflow = ''
    })
    const secEl = document.getElementById(`section-${section}`)
    if (secEl) secEl.classList.add('active')

    currentSection = section

    // Re-render the active section
    renderSection(section)
  }

  function renderSection(section) {
    switch (section) {
      case 'dashboard': Dashboard.render(); break
      case 'tasks':     Tasks.render();     break
      case 'habits':    Habits.render();    break
      case 'goals':     Goals.render();     break
      case 'calendar':  ZCalendar.render();  break
      case 'notes':     Notes.render();     break
      case 'finance':   Finance.render();   break
      case 'fitness':   Fitness.render();   break
      case 'nutrition': Nutrition.render(); break
      case 'ai':        AI.render();        break
    }
  }

  async function init() {
    // Load all data
    await DB.init()

    // Set sidebar date
    document.getElementById('sidebar-date').textContent = formatDate()

    // Wire up navigation
    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => navigate(el.dataset.section))
    })

    // Render default section
    renderSection('dashboard')

    // Pull due/overdue tasks from main process now that renderer is fully ready
    if (window.zenith && window.zenith.getOverdueTasks) {
      window.zenith.getOverdueTasks().then(tasks => {
        if (tasks && tasks.length > 0) {
          _overdueTasks = tasks
          Dashboard.render()
        }
      })
    }
  }

  function refreshDashboard() {
    if (currentSection === 'dashboard') Dashboard.render()
  }

  function getOverdueTasks() { return _overdueTasks }
  function dismissOverdueTasks() { _overdueTasks = []; if (currentSection === 'dashboard') Dashboard.render() }

  return { init, navigate, renderSection, refreshDashboard, tag, formatDate, CAT_COLORS, getOverdueTasks, dismissOverdueTasks }
})()

// Boot the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init())
