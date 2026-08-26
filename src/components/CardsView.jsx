import { useEffect, useState } from 'react'
import { shuffle, speak } from '../util'

const HINT = 'Tipp: Karte antippen zum Umdrehen (oder Leertaste) · ✓ merkt sich gelernte Wörter'

export default function CardsView({ entries, matches, filter, known, toggleKnown, setKnownKeys }) {
  const [round, setRound] = useState(0)
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [deck, setDeck] = useState([])
  const [baseTotal, setBaseTotal] = useState(0)
  const [idx, setIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [note, setNote] = useState(HINT)

  /* Rebuild the deck whenever the filter changes, the round is restarted,
     or the "nur offene Karten" toggle flips. This is what makes A1 -> A2
     actually switch to a new deck instead of staying on the same card. */
  useEffect(() => {
    let pool = entries.filter(matches)
    let knownCards = []
    if (onlyOpen) {
      pool = pool.filter((e) => !known.has(e.key))
    } else {
      knownCards = pool.filter((e) => known.has(e.key))
    }
    setDeck(shuffle(pool).concat(shuffle(knownCards)))
    setBaseTotal(pool.length)
    setIdx(0)
    setCorrect(0)
    setFlipped(false)
    setNote(
      pool.length
        ? `${filterLabel(filter)}: ${pool.length} Karten` + (knownCards.length ? ` · ${knownCards.length} bekannte am Ende` : '')
        : 'Keine Karten für diesen Filter.',
    )
  }, [filter, round, onlyOpen])

  /* space bar flips the card */
  useEffect(() => {
    const h = (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) {
        e.preventDefault()
        setFlipped((f) => !f)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const current = deck[idx]
  const finished = !current && baseTotal > 0
  const shown = deck.length - baseTotal // repeats so far

  const again = () => {
    if (!current) return
    setDeck((d) => [...d, current])
    setIdx((i) => i + 1)
    setNote(HINT)
  }
  const knowIt = () => {
    if (!current) return
    toggleKnown(current.key)
    setCorrect((c) => c + 1)
    setIdx((i) => i + 1)
    setNote(HINT)
  }

  const progress = baseTotal ? Math.min(100, (idx / baseTotal) * 100) : 0

  return (
    <div className="fcwrap">
      <div className="fcprogress">
        <div className="fcbar"><i style={{ width: progress + '%' }} /></div>
        <div className="fcmeta">{baseTotal ? `${Math.min(idx + 1, baseTotal)} / ${baseTotal}` : '0 / 0'}</div>
      </div>

      {finished ? (
        <div className="fcdone">
          <div className="t">Geschafft! 🎉</div>
          <div className="s">
            {baseTotal} Karten · {correct} richtig gewusst{shown ? ` · ${shown} wiederholt` : ''}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="fcbtn" onClick={() => { setOnlyOpen(false); setRound((r) => r + 1) }}>🔁 Nochmal durchspielen</button>
            <button className="fcbtn gold" onClick={() => { setOnlyOpen(true); setRound((r) => r + 1) }}>Nur offene Karten</button>
          </div>
          <div style={{ marginTop: 10 }}>
            <button className="fcbtn" onClick={() => { setKnownKeys([]); setOnlyOpen(false); setRound((r) => r + 1) }}>Reset: alle Karten vergessen</button>
          </div>
        </div>
      ) : current ? (
        <>
          <div
            className={'fc' + (flipped ? ' flipped' : '')}
            onClick={() => setFlipped((f) => !f)}
          >
            <div className="fc-inner">
              <div className="fcf">
                <div className="big">{current.front}</div>
                <div className="hint">antippen</div>
              </div>
              <div className="fcb">
                <div className="big">{current.en}</div>
                {current.extra && <div className="sub">{current.extra}</div>}
                {current.sentences && current.sentences.length > 0 && (
                  <div className="sub" style={{ fontFamily: 'var(--sans)', fontSize: 12.5 }}>{current.sentences[0].de}</div>
                )}
              </div>
            </div>
          </div>
          <div className="fcbtns">
            <button className="fcbtn" onClick={again}>⟳ Wiederholen</button>
            <button className="fcbtn gold" onClick={knowIt}>✓ Kenne ich</button>
          </div>
          {current.kind === 'word' && current.level && (
            <div className="fcnote">Level: {current.level} · {current.tag}</div>
          )}
          <div className="fcnote">{note}</div>
          <div className="fcnote" style={{ marginTop: 2 }}>
            <button className="iconbtn" style={{ marginRight: 6 }} onClick={() => speak(current.front)}>🔊 anhören</button>
            {known.has(current.key) ? '✓ schon als bekannt markiert' : ''}
          </div>
        </>
      ) : (
        <div className="empty">Keine Karten für diesen Filter.</div>
      )}
    </div>
  )
}

function filterLabel(f) {
  return { all: 'Alle' }[f] || (f === 'A1' || f === 'A2' ? f : f)
}