// SSR smoke test: renders every view to a string with react-dom/server to
// catch render-time errors without a browser. Run via: npm run test:ssr
import React from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import DictionaryView from './components/DictionaryView'
import CardsView from './components/CardsView'
import MatchView from './components/MatchView'
import DATA from './data.json'

// minimal browser stubs for module-level localStorage reads
const storage = new Map()
global.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
}
global.window = {
  speechSynthesis: { cancel() {}, getVoices() { return [] }, speak() {} },
  addEventListener() {},
}

const matchesAll = () => true

const out = []
out.push('app: ' + renderToString(<App />).length + ' chars')
out.push('dict: ' + renderToString(<DictionaryView entries={DATA.verbs.map((v) => ({ front: v.v, en: v.en, kind: 'verb', tag: v.theme, sentences: v.sentences, extra: v.part2, konj2: v.konj2, key: v.v }))} matches={matchesAll} q="" showEn={false} diceTick={0} />).length + ' chars')
out.push(
  'cards: ' +
    renderToString(
      <CardsView
        entries={DATA.words.slice(0, 20).map((w) => ({ front: w.de, en: w.en, kind: 'word', pos: w.pos, tag: w.pos, level: w.level, extra: w.extra || '', key: w.de }))}
        matches={matchesAll}
        filter="all"
        known={new Set()}
        toggleKnown={() => {}}
        setKnownKeys={() => {}}
      />,
    ).length + ' chars',
)
out.push(
  'match: ' +
    renderToString(
      <MatchView
        entries={DATA.words.slice(0, 20).map((w) => ({ front: w.de, en: w.en, kind: 'word', pos: w.pos, level: w.level, key: w.de }))}
        matches={matchesAll}
        filter="all"
      />,
    ).length + ' chars',
)
console.log(out.join('\n'))
console.log('SSR SMOKE OK')