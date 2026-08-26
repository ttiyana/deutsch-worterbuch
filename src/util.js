export const posLabel = (p) =>
  ({ n: 'Nomen', v: 'Verben', adj: 'Adjektive', adv: 'Adverbien', pron: 'Pronomen',
     prep: 'Präpositionen', conj: 'Konjunktionen', num: 'Zahlen', phrase: 'Phrasen' }[p] || p)

export function shuffle(arr) {
  const b = arr.slice()
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

export function speak(text) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'de-DE'
  u.rate = 0.88
  u.pitch = 1
  const vs = window.speechSynthesis.getVoices()
  const v = vs.find((v) => /^de[-_](DE|AT|CH)/.test(v.lang)) || vs.find((v) => v.lang && v.lang.slice(0, 2) === 'de')
  if (v) u.voice = v
  window.speechSynthesis.speak(u)
}

export function loadJSON(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch (e) { return fallback }
}
export function saveJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch (e) {}
}
export function loadInt(key) {
  try { return parseInt(localStorage.getItem(key) || '0', 10) || 0 } catch (e) { return 0 }
}
export function saveInt(key, n) {
  try { localStorage.setItem(key, String(n)) } catch (e) {}
}