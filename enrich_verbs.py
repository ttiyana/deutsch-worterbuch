#!/usr/bin/env python3
"""Enrich the A1/A2 verbs in words.json with Konjunktiv II forms and example
sentences so they are full dictionary entries. Idempotent: skips entries that
already carry 'sentences'. Only touches entries with pos 'v'."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WORDS = ROOT / "words.json"

# de -> (konj2, konj2_note, [(sentence_de, sentence_en)])
DATA = {
    "sein": ("wäre · würde sein", "unregelmäßig (ist · war)", [("Ich bin müde.", "I am tired.")]),
    "haben": ("hätte · würde haben", "unregelmäßig (hat · hatte)", [("Hast du heute Zeit?", "Do you have time today?")]),
    "werden": ("würde · würde werden", "unregelmäßig (wird · wurde)", [("Es wird dunkel.", "It is getting dark.")]),
    "können": ("könnte", "Modalverb", [("Kannst du mir helfen?", "Can you help me?")]),
    "müssen": ("müsste", "Modalverb", [("Ich muss jetzt gehen.", "I have to go now.")]),
    "wollen": ("wollte", "Modalverb", [("Wir wollen ein Eis essen.", "We want to eat ice cream.")]),
    "dürfen": ("dürfte", "Modalverb", [("Darf ich hier sitzen?", "May I sit here?")]),
    "sollen": ("sollte", "Modalverb", [("Du sollst mehr Wasser trinken.", "You should drink more water.")]),
    "mögen": ("möchte · würde mögen", "Modalverb", [("Ich mag Kaffee.", "I like coffee.")]),
    "gehen": ("ginge · würde gehen", "unregelmäßig (geht · ging)", [("Wir gehen ins Kino.", "We're going to the cinema.")]),
    "kommen": ("käme · würde kommen", "unregelmäßig (kommt · kam)", [("Kommst du morgen?", "Are you coming tomorrow?")]),
    "fahren": ("führe · würde fahren", "unregelmäßig (fährt · fuhr)", [("Ich fahre mit dem Bus.", "I take the bus.")]),
    "fliegen": ("flöge · würde fliegen", "unregelmäßig (fliegt · flog)", [("Wir fliegen nach Berlin.", "We're flying to Berlin.")]),
    "laufen": ("liefe · würde laufen", "unregelmäßig (läuft · lief)", [("Ich laufe jeden Morgen.", "I run every morning.")]),
    "stehen": ("stünde · würde stehen", "unregelmäßig (steht · stand)", [("Das Glas steht auf dem Tisch.", "The glass is on the table.")]),
    "sitzen": ("säße · würde sitzen", "unregelmäßig (sitzt · saß)", [("Wir sitzen im Café.", "We're sitting in the café.")]),
    "liegen": ("läge · würde liegen", "unregelmäßig (liegt · lag)", [("Das Buch liegt auf dem Bett.", "The book is lying on the bed.")]),
    "schlafen": ("schliefe · würde schlafen", "unregelmäßig (schläft · schlief)", [("Das Baby schläft schon.", "The baby is already sleeping.")]),
    "aufstehen": ("stünde auf · würde aufstehen", "trennbar + unregelmäßig", [("Ich stehe um sieben auf.", "I get up at seven.")]),
    "bleiben": ("bliebe · würde bleiben", "unregelmäßig (bleibt · blieb)", [("Bleib noch einen Moment!", "Stay a little longer!")]),
    "machen": ("machte · würde machen", "regelmäßig — Konj II = Präteritum", [("Was machst du heute Abend?", "What are you doing tonight?")]),
    "sagen": ("sagte · würde sagen", "regelmäßig — Konj II = Präteritum", [("Sag mir bitte die Wahrheit.", "Please tell me the truth.")]),
    "sprechen": ("spräche · würde sprechen", "unregelmäßig (spricht · sprach)", [("Sprichst du Deutsch?", "Do you speak German?")]),
    "reden": ("redete · würde reden", "regelmäßig — Konj II = Präteritum", [("Wir reden später darüber.", "We'll talk about it later.")]),
    "erzählen": ("erzählte · würde erzählen", "regelmäßig — Konj II = Präteritum", [("Erzähl mir von deiner Reise!", "Tell me about your trip!")]),
    "fragen": ("fragte · würde fragen", "regelmäßig — Konj II = Präteritum", [("Frag den Lehrer!", "Ask the teacher!")]),
    "antworten": ("antwortete · würde antworten", "regelmäßig — Konj II = Präteritum", [("Er antwortet nicht.", "He doesn't answer.")]),
    "geben": ("gäbe · würde geben", "unregelmäßig (gibt · gab)", [("Gib mir bitte das Salz.", "Please pass me the salt.")]),
    "nehmen": ("nähme · würde nehmen", "unregelmäßig (nimmt · nahm)", [("Ich nehme einen Kaffee.", "I'll take a coffee.")]),
    "bringen": ("brächte · würde bringen", "unregelmäßig (bringt · brachte)", [("Bringst du das Buch mit?", "Are you bringing the book along?")]),
    "holen": ("holte · würde holen", "regelmäßig — Konj II = Präteritum", [("Ich hole die Kinder ab.", "I'm picking up the kids.")]),
    "sehen": ("sähe · würde sehen", "unregelmäßig (sieht · sah)", [("Ich sehe den Turm.", "I see the tower.")]),
    "schauen": ("schaute · würde schauen", "regelmäßig — Konj II = Präteritum", [("Schau mal hier!", "Look here!")]),
    "hören": ("hörte · würde hören", "regelmäßig — Konj II = Präteritum", [("Ich höre Musik.", "I'm listening to music.")]),
    "verstehen": ("verstünde · würde verstehen", "unregelmäßig (versteht · verstand)", [("Ich verstehe die Frage nicht.", "I don't understand the question.")]),
    "wissen": ("wüsste", "unregelmäßig (weiß · wusste)", [("Ich weiß die Antwort.", "I know the answer.")]),
    "kennen": ("kennte · würde kennen", "unregelmäßig (kennt · kannte)", [("Kennst du den neuen Kollegen?", "Do you know the new colleague?")]),
    "denken": ("dächte · würde denken", "unregelmäßig (denkt · dachte)", [("Ich denke an dich.", "I'm thinking of you.")]),
    "glauben": ("glaubte · würde glauben", "regelmäßig — Konj II = Präteritum", [("Ich glaube dir.", "I believe you.")]),
    "finden": ("fände · würde finden", "unregelmäßig (findet · fand)", [("Ich finde den Schlüssel nicht.", "I can't find the key.")]),
    "suchen": ("suchte · würde suchen", "regelmäßig — Konj II = Präteritum", [("Ich suche meine Brille.", "I'm looking for my glasses.")]),
    "brauchen": ("bräuchte · würde brauchen", "unregelmäßig (braucht · brauchte)", [("Ich brauche mehr Zeit.", "I need more time.")]),
    "zeigen": ("zeigte · würde zeigen", "regelmäßig — Konj II = Präteritum", [("Zeig mir dein Foto!", "Show me your photo!")]),
    "helfen": ("hülfe · würde helfen", "unregelmäßig (hilft · half)", [("Kann ich dir helfen?", "Can I help you?")]),
    "arbeiten": ("arbeitete · würde arbeiten", "regelmäßig — Konj II = Präteritum", [("Sie arbeitet in München.", "She works in Munich.")]),
    "lernen": ("lernte · würde lernen", "regelmäßig — Konj II = Präteritum", [("Ich lerne Deutsch.", "I'm learning German.")]),
    "üben": ("übte · würde üben", "regelmäßig — Konj II = Präteritum", [("Wir üben die Aussprache.", "We're practicing pronunciation.")]),
    "studieren": ("studierte · würde studieren", "regelmäßig — Konj II = Präteritum", [("Er studiert Informatik.", "He studies computer science.")]),
    "lesen": ("läse · würde lesen", "unregelmäßig (liest · las)", [("Ich lese ein Buch.", "I'm reading a book.")]),
    "schreiben": ("schriebe · würde schreiben", "unregelmäßig (schreibt · schrieb)", [("Sie schreibt eine E-Mail.", "She's writing an email.")]),
    "spielen": ("spielte · würde spielen", "regelmäßig — Konj II = Präteritum", [("Die Kinder spielen draußen.", "The kids are playing outside.")]),
    "wohnen": ("wohnte · würde wohnen", "regelmäßig — Konj II = Präteritum", [("Ich wohne in Berlin.", "I live in Berlin.")]),
    "leben": ("lebte · würde leben", "regelmäßig — Konj II = Präteritum", [("Meine Oma lebt in Hamburg.", "My grandma lives in Hamburg.")]),
    "essen": ("äße · würde essen", "unregelmäßig (isst · aß)", [("Wir essen um zwölf.", "We eat at twelve.")]),
    "trinken": ("tränke · würde trinken", "unregelmäßig (trinkt · trank)", [("Ich trinke gerne Tee.", "I like drinking tea.")]),
    "kochen": ("kochte · würde kochen", "regelmäßig — Konj II = Präteritum", [("Heute koche ich Nudeln.", "Today I'm cooking pasta.")]),
    "backen": ("büke · würde backen", "unregelmäßig (backt · buk)", [("Am Sonntag backen wir einen Kuchen.", "On Sunday we're baking a cake.")]),
    "putzen": ("putzte · würde putzen", "regelmäßig — Konj II = Präteritum", [("Ich putze die Fenster.", "I'm cleaning the windows.")]),
    "öffnen": ("öffnete · würde öffnen", "regelmäßig — Konj II = Präteritum", [("Öffne bitte das Fenster.", "Please open the window.")]),
    "schließen": ("schlösse · würde schließen", "unregelmäßig (schließt · schloss)", [("Schließe die Tür!", "Close the door!")]),
    "anfangen": ("finge an · würde anfangen", "trennbar + unregelmäßig", [("Der Kurs fängt im September an.", "The course starts in September.")]),
    "aufhören": ("hörte auf · würde aufhören", "trennbar + regelmäßig", [("Hört es bald auf zu regnen?", "Will it stop raining soon?")]),
    "beginnen": ("begänne · würde beginnen", "unregelmäßig (beginnt · begann)", [("Die Besprechung beginnt um zehn.", "The meeting starts at ten.")]),
    "enden": ("endete · würde enden", "regelmäßig — Konj II = Präteritum", [("Der Film endet gut.", "The film ends well.")]),
    "warten": ("wartete · würde warten", "regelmäßig — Konj II = Präteritum", [("Warte auf mich!", "Wait for me!")]),
    "hoffen": ("hoffte · würde hoffen", "regelmäßig — Konj II = Präteritum", [("Ich hoffe, du kommst mit.", "I hope you come along.")]),
    "wünschen": ("wünschte · würde wünschen", "regelmäßig — Konj II = Präteritum", [("Ich wünsche dir viel Glück.", "I wish you good luck.")]),
    "schenken": ("schenkte · würde schenken", "regelmäßig — Konj II = Präteritum", [("Ich schenke ihr Blumen.", "I'm giving her flowers.")]),
    "gewinnen": ("gewönne · würde gewinnen", "unregelmäßig (gewinnt · gewann)", [("Wir gewinnen das Spiel.", "We're winning the game.")]),
    "verlieren": ("verlöre · würde verlieren", "unregelmäßig (verliert · verlor)", [("Ich habe meinen Schlüssel verloren.", "I lost my key.")]),
    "verkaufen": ("verkaufte · würde verkaufen", "regelmäßig — Konj II = Präteritum", [("Sie verkauft ihr Auto.", "She's selling her car.")]),
    "kosten": ("kostete · würde kosten", "regelmäßig — Konj II = Präteritum", [("Was kostet die Fahrkarte?", "How much does the ticket cost?")]),
    "fühlen": ("fühlte · würde fühlen", "regelmäßig — Konj II = Präteritum", [("Ich fühle mich gut.", "I feel good.")]),
    "lieben": ("liebte · würde lieben", "regelmäßig — Konj II = Präteritum", [("Ich liebe dich.", "I love you.")]),
    "lachen": ("lachte · würde lachen", "regelmäßig — Konj II = Präteritum", [("Alle lachen über den Witz.", "Everyone laughs at the joke.")]),
    "weinen": ("weinte · würde weinen", "regelmäßig — Konj II = Präteritum", [("Das Kind weint.", "The child is crying.")]),
    "singen": ("sänge · würde singen", "unregelmäßig (singt · sang)", [("Wir singen ein Lied.", "We're singing a song.")]),
    "tanzen": ("tanzte · würde tanzen", "regelmäßig — Konj II = Präteritum", [("Sie tanzt gern.", "She likes dancing.")]),
    "reisen": ("reiste · würde reisen", "regelmäßig — Konj II = Präteritum", [("Wir reisen im Sommer nach Italien.", "We're traveling to Italy in summer.")]),
    "besuchen": ("besuchte · würde besuchen", "regelmäßig — Konj II = Präteritum", [("Ich besuche meine Eltern.", "I'm visiting my parents.")]),
    "treffen": ("träfe · würde treffen", "unregelmäßig (trifft · traf)", [("Ich treffe Freunde im Park.", "I'm meeting friends in the park.")]),
    "einladen": ("lüde ein · würde einladen", "trennbar + unregelmäßig", [("Ich lade dich zum Essen ein.", "I'm inviting you to dinner.")]),
    "telefonieren": ("telefonierte · würde telefonieren", "regelmäßig — Konj II = Präteritum", [("Ich telefoniere mit meiner Mutter.", "I'm talking to my mother on the phone.")]),
    "regnen": ("regnete · würde regnen", "regelmäßig — es regnet", [("Es regnet den ganzen Tag.", "It rains all day.")]),
    "schneien": ("schneite · würde schneien", "regelmäßig — es schneit", [("Es schneit im Winter.", "It snows in winter.")]),
}


def main() -> None:
    words = json.loads(WORDS.read_text(encoding="utf-8"))
    enriched = 0
    missing = []
    for w in words:
        if w.get("pos") != "v":
            continue
        if w.get("sentences"):
            continue
        info = DATA.get(w["de"])
        if not info:
            missing.append(w["de"])
            continue
        konj2, note, sents = info
        w["konj2"] = konj2
        w["konj2_note"] = note
        w["sentences"] = [{"de": d, "en": e} for d, e in sents]
        enriched += 1
    WORDS.write_text(json.dumps(words, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"enriched: {enriched}")
    if missing:
        print("MISSING (no data):", missing)
    v_count = sum(1 for w in words if w.get("pos") == "v")
    with_sents = sum(1 for w in words if w.get("pos") == "v" and w.get("sentences"))
    print(f"verbs total: {v_count}, with sentences: {with_sents}")


if __name__ == "__main__":
    main()