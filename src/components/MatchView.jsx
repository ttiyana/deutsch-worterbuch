import { useEffect, useState } from 'react'
import { shuffle, loadInt, saveInt } from '../util'

export default function MatchView({ entries, matches, filter }) {
  const [round, setRound] = useState(0)
  const [tiles, setTiles] = useState([])
  const [sel, setSel] = useState(null)
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [status, setStatus] = useState('idle') // idle | playing | over
  const [result, setResult] = useState(null)
  const [best, setBest] = useState(0)

  /* New round whenever the filter changes (A1 -> A2 starts a fresh grid) */
  useEffect(() => {
    const pool = entries.filter(matches)
    if (pool.length < 2) {
      setTiles([]); setResult(null); setStatus('idle'); setBest(0)
      return
    }
    const pairs = shuffle(pool).slice(0, 6)
    const t = shuffle(
      pairs.flatMap((e) => [
        { key: e.key, side: 0, text: e.front },
        { key: e.key, side: 1, text: e.en },
      ]),
    )
    setTiles(t); setSel(null); setMoves(0); setSeconds(0); setStatus('idle'); setResult(null)
    setBest(loadInt('wb_best_' + filter))
  }, [filter, round])

  /* timer */
  useEffect(() => {
    if (status !== 'playing') return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [status])

  /* completion detection */
  useEffect(() => {
    if (!tiles.length || status === 'over') return
    const doneCount = tiles.filter((t) => t.done).length
    if (doneCount === tiles.length) {
      const oldBest = loadInt('wb_best_' + filter)
      const isBest = !oldBest || seconds < oldBest
      if (isBest) saveInt('wb_best_' + filter, seconds)
      setResult({ seconds, moves, isBest, best: oldBest })
      setStatus('over')
    }
  }, [tiles])

  const clickTile = (i) => {
    if (status === 'over') return
    const t = tiles[i]
    if (!t || t.done || t.bad) return
    if (status === 'idle') setStatus('playing')
    if (sel === i) { setSel(null); return }
    setMoves((m) => m + 1)
    if (sel === null) { setSel(i); return }
    const s = tiles[sel]
    if (s.key === t.key) {
      setTiles((ts) => ts.map((x, ix) => (ix === i || ix === sel ? { ...x, done: true } : x)))
      setSel(null)
    } else {
      setTiles((ts) => ts.map((x, ix) => (ix === i || ix === sel ? { ...x, bad: true } : x)))
      setSel(null)
      setTimeout(() => setTiles((ts) => ts.map((x) => (x.bad ? { ...x, bad: false } : x))), 320)
    }
  }

  return (
    <>
      <div className="mtop">
        <span>{status === 'over' ? 'Fertig' : `${moves} Züge · ${seconds}s`}</span>
        <span>{best ? `🏆 Bestzeit: ${best}s` : ''}</span>
      </div>

      {status === 'over' && result ? (
        <div className="mdone">
          <div className="t">{result.isBest ? '🏆 Neue Bestzeit!' : 'Geschafft!'}</div>
          <div className="s">
            {result.seconds}s · {result.moves} Züge
            {!result.isBest && result.best ? ` · Bestzeit: ${result.best}s` : ''}
          </div>
          <button className="fcbtn gold" onClick={() => setRound((r) => r + 1)}>🔁 Neue Runde</button>
        </div>
      ) : tiles.length ? (
        <div className="mgrid">
          {tiles.map((t, i) => (
            <button
              key={i}
              className={
                'mtile' +
                (t.done ? ' done' : '') +
                (t.bad ? ' bad' : '') +
                (sel === i ? ' sel' : '')
              }
              onClick={() => clickTile(i)}
            >
              {t.text}
            </button>
          ))}
        </div>
      ) : (
        <div className="empty">Nicht genug Karten für diesen Filter.</div>
      )}
    </>
  )
}