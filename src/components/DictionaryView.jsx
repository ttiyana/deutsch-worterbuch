import { useMemo, useState, useEffect } from 'react'
import { speak } from '../util'

function Speaker({ text, small }) {
  return (
    <button
      className={'spk' + (small ? ' small' : '')}
      aria-label={'Aussprache: ' + text}
      onClick={(ev) => { ev.stopPropagation(); speak(text) }}
    >
      🔊
    </button>
  )
}

function SentenceRow({ s, showEn }) {
  const [open, setOpen] = useState(showEn)
  useEffect(() => setOpen(showEn), [showEn])
  return (
    <div className={'sent' + (open ? ' open' : '')}>
      <div className="de" onClick={() => setOpen((o) => !o)}>{s.de}</div>
      <Speaker text={s.de} small />
      <div className="en" onClick={() => setOpen((o) => !o)}>{s.en}</div>
      <button
        className="rev"
        onClick={(ev) => { ev.stopPropagation(); setOpen((o) => !o) }}
      >
        EN
      </button>
    </div>
  )
}

function EntryCard({ e, showEn }) {
  const lvlLabel = e.pos === 'n' ? 'Plural' : e.pos === 'v' ? 'Partizip II' : 'Info'
  return (
    <div className="card" data-i={e.key}>
      <div className="cardhead">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="verb">{e.front}</div>
          <div className="en">{e.en}</div>
        </div>
        <Speaker text={e.front} />
        {e.irregular && <span className="flag" title="unregelmäßiges Verb">⚡</span>}
      </div>

      <div className="badges">
        <span className="theme hl">{e.tag}</span>
        {e.kind === 'word' && e.level && <span className="theme lvl">{e.level}</span>}
      </div>

      {e.pos === 'v' && (
        <div className="forms">
          <div className="formrow">
            <span className="lbl">Partizip II</span>
            <span className="val">{e.extra}</span>
          </div>
          {e.konj2 && (
            <div className="formrow">
              <span className="lbl">Konj. II</span>
              <div>
                <div className="val">{e.konj2}</div>
                {e.konj2_note && <div className="note">{e.konj2_note}</div>}
              </div>
            </div>
          )}
        </div>
      )}
      {e.kind === 'word' && e.pos !== 'v' && e.extra && (
        <div className="extra"><span className="lbl">{lvlLabel}</span> · {e.extra}</div>
      )}

      {e.sentences && e.sentences.length > 0 && (
        <div className="sents">
          <h3>Beispielsätze</h3>
          {e.sentences.map((s, i) => <SentenceRow key={i} s={s} showEn={showEn} />)}
        </div>
      )}
    </div>
  )
}

export default function DictionaryView({ entries, matches, q, showEn, diceTick }) {
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase()
    return entries.filter((e) => {
      if (!matches(e)) return false
      if (!ql) return true
      if (e.front.toLowerCase().includes(ql)) return true
      if (e.en.toLowerCase().includes(ql)) return true
      if (e.tag && e.tag.toLowerCase().includes(ql)) return true
      return !!(e.sentences && e.sentences.some((s) => s.de.toLowerCase().includes(ql) || s.en.toLowerCase().includes(ql)))
    })
  }, [entries, matches, q])

  // scroll to a random verb when the dice is rolled
  useEffect(() => {
    if (!diceTick) return
    const randomVerb = entries.filter((e) => e.kind === 'verb')[Math.floor(Math.random() * entries.filter((e) => e.kind === 'verb').length)]
    if (!randomVerb) return
    const el = document.querySelector(`.card[data-i="${CSS.escape(randomVerb.key)}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [diceTick, entries])

  return (
    <>
      <div className="countline">
        {filtered.length === entries.length
          ? `Alle Einträge (${entries.length})`
          : `${filtered.length} von ${entries.length} Einträgen`}
      </div>
      {filtered.length === 0 ? (
        <div className="empty">Keine Treffer für <b>{q}</b>.</div>
      ) : (
        filtered.map((e) => <EntryCard key={e.key} e={e} showEn={showEn} />)
      )}
    </>
  )
}