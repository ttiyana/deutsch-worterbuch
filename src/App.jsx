import { useMemo, useState, useCallback } from 'react'
import DATA from './data.json'
import DictionaryView from './components/DictionaryView'
import CardsView from './components/CardsView'
import MatchView from './components/MatchView'
import { posLabel, loadJSON, saveJSON } from './util'

const FILTERS = [
  ['all', 'Alle'], ['A1', 'A1'], ['A2', 'A2'], ['verb', 'Verben'],
  ['n', 'Nomen'], ['adj', 'Adjektive'], ['phrase', 'Phrasen'], ['other', 'Sonstiges'],
]

export default function App() {
  const { verbs, words, stats, updated } = DATA

  const verbEntries = useMemo(
    () =>
      verbs
        .slice()
        .sort((a, b) => a.v.localeCompare(b.v, 'de'))
        .map((v) => ({
          front: v.v, en: v.en, kind: 'verb', pos: 'v', tag: v.theme, extra: v.part2,
          irregular: !!v.irregular, key: 'v:' + v.v, sentences: v.sentences,
          konj2: v.konj2, konj2_note: v.konj2_note,
        })),
    [verbs],
  )
  const wordEntries = useMemo(
    () =>
      words
        .slice()
        .sort((a, b) => a.de.localeCompare(b.de, 'de'))
        .map((w) => ({
          front: w.de, en: w.en, kind: 'word', pos: w.pos, tag: posLabel(w.pos),
          extra: w.extra || '', irregular: false, level: w.level || 'A1',
          sentences: w.sentences || null, konj2: w.konj2 || '', konj2_note: w.konj2_note || '',
          key: 'w:' + w.de + ':' + (w.pos || ''),
        })),
    [words],
  )
  const ALL = useMemo(() => verbEntries.concat(wordEntries), [verbEntries, wordEntries])
  const themes = useMemo(
    () => stats?.themes || [...new Set(verbEntries.map((v) => v.tag))],
    [stats, verbEntries],
  )

  const [tab, setTab] = useState('dict')
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [showEn, setShowEn] = useState(() => loadJSON('wb_showEn', '0') === '1')
  const [known, setKnown] = useState(() => new Set(loadJSON('wb_known', [])))
  const [diceTick, setDiceTick] = useState(0)

  const matches = useCallback(
    (e) => {
      const f = filter
      if (f === 'all') return true
      if (f === 'A1' || f === 'A2') return e.kind === 'word' && e.level === f
      if (f === 'verb') return e.pos === 'v' // ALL verbs: practice (B1+) + A1/A2 base verbs
      if (themes.indexOf(f) >= 0) return e.kind === 'verb' && e.tag === f
      if (f === 'other') return e.kind === 'word' && !['n', 'adj', 'phrase'].includes(e.pos)
      return e.kind === 'word' && e.pos === f
    },
    [filter, themes],
  )

  const toggleKnown = useCallback((key) => {
    setKnown((prev) => {
      const n = new Set(prev)
      if (n.has(key)) n.delete(key)
      else n.add(key)
      saveJSON('wb_known', [...n])
      return n
    })
  }, [])

  const setKnownKeys = useCallback((keys) => {
    setKnown(new Set(keys))
    saveJSON('wb_known', keys)
  }, [])

  const toggleShowEn = () => {
    const n = !showEn
    setShowEn(n)
    saveJSON('wb_showEn', n ? '1' : '0')
  }

  const randomVerb = () => {
    setQ('')
    setFilter('all')
    setDiceTick((t) => t + 1)
  }

  const filterChips = FILTERS.concat(themes.map((t) => ['theme:' + t, t]))

  return (
    <div>
      <header>
        <div className="wrap">
          <div className="brand">
            <h1>Deutsch <em>Wörterbuch</em></h1>
            <div className="stats">
              <b>{stats?.verbs ?? verbEntries.length}</b> Verben · <b>{stats?.words ?? wordEntries.length}</b> Wörter
            </div>
          </div>
          <div className="tabs">
            <button className={'tab' + (tab === 'dict' ? ' on' : '')} onClick={() => setTab('dict')}>📖 Wörterbuch</button>
            <button className={'tab' + (tab === 'cards' ? ' on' : '')} onClick={() => setTab('cards')}>🃏 Karteikarten</button>
            <button className={'tab' + (tab === 'match' ? ' on' : '')} onClick={() => setTab('match')}>🎯 Match</button>
          </div>

          {tab === 'dict' && (
            <div className="searchrow">
              <input
                id="q"
                type="search"
                placeholder="Suchen … (Verb, Wort, Bedeutung, Satz)"
                autoComplete="off"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          )}

          <div className="toolbar">
            <div className="chips">
              {filterChips.map(([id, label]) => (
                <button
                  key={id}
                  className={'chip' + (filter === id || (filter === 'all' && id === 'all') ? ' on' : '')}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === 'dict' && (
              <>
                <button className={'iconbtn' + (showEn ? ' on' : '')} onClick={toggleShowEn} title="Übersetzungen ein/ausblenden">EN</button>
                <button className="iconbtn" onClick={randomVerb} title="Zufälliges Verb anzeigen">🎲</button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <div className="wrap">
          {tab === 'dict' && (
            <DictionaryView entries={ALL} matches={matches} q={q} showEn={showEn} diceTick={diceTick} />
          )}
          {tab === 'cards' && (
            <CardsView entries={ALL} matches={matches} filter={filter} known={known} toggleKnown={toggleKnown} setKnownKeys={setKnownKeys} />
          )}
          {tab === 'match' && <MatchView entries={ALL} matches={matches} filter={filter} />}
        </div>
      </main>

      <footer>
        <div className="wrap">
          Sammlung wächst täglich mit der SprintDeutsch-Übung · Zuletzt aktualisiert: <span className="u">{updated}</span>
        </div>
      </footer>
    </div>
  )
}