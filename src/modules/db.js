// db.js — Data layer
// All reads/writes go through window.zenith (exposed by preload.js)
// Falls back to localStorage when running outside Electron

const DB = (() => {

  const isElectron = typeof window.zenith !== 'undefined'
  let cache = {}

  async function init() {
    if (isElectron) {
      cache = await window.zenith.loadAll()
    } else {
      const keys = ['tasks','habits','goals','transactions','workouts','journal','events','calConnections','notes','noteFolders']
      keys.forEach(k => {
        try { cache[k] = JSON.parse(localStorage.getItem('zenith_' + k)) || [] }
        catch { cache[k] = [] }
      })
      try { cache['nutrition'] = JSON.parse(localStorage.getItem('zenith_nutrition')) || { goals: {calories:2000,protein:150,carbs:250,fat:65}, log:[] } }
      catch { cache['nutrition'] = { goals: {calories:2000,protein:150,carbs:250,fat:65}, log:[] } }
      cache['apiKey'] = localStorage.getItem('zenith_apiKey') || ''
    }
    return cache
  }

  async function save(key, value) {
    cache[key] = value
    if (isElectron) {
      await window.zenith.set(key, value)
    } else {
      localStorage.setItem('zenith_' + key, JSON.stringify(value))
    }
  }

  function get(key) {
    const val = cache[key]
    if (val === undefined || val === null) {
      if (key === 'nutrition') return { goals: {calories:2000,protein:150,carbs:250,fat:65}, log:[] }
      if (key === 'apiKey') return ''
      if (key === 'calConnections') return {}
      if (key === 'noteFolders') return ['Personal', 'Work', 'Ideas']
      if (key === 'notes') return []
      return []
    }
    return val
  }

  function nextId(key) {
    const items = get(key)
    if (!Array.isArray(items) || !items.length) return 1
    return Math.max(...items.map(i => i.id || 0)) + 1
  }

  return { init, save, get, nextId }
})()
