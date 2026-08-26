#!/usr/bin/env python3
"""Tag every word in words.json with its CEFR level (A1 default, A2 set below).
Re-runnable: skips words that already carry a level. Levels are judgement calls
on the standard Goethe-Institut A1/A2 distribution, applied to the curated list."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WORDS = ROOT / "words.json"

# --- words judged A2 (everything else stays A1) ---
A2_NOUNS = {
    "der Balkon", "das Gewitter", "das Hähnchen", "die Karotte", "die Erdbeere",
    "die Zwiebel", "der Pfeffer", "der Joghurt", "das Öl", "die Nudeln",
    "der Reis", "die Suppe", "der Salat", "der Kuchen", "das Eis",
    "die Tablette", "die Medizin", "der Schmerz", "der Zahn", "der Rücken",
    "der Bauch", "das Herz", "der Finger", "der Gürtel", "der Hut", "der Schal",
    "die Socke", "die Mütze", "die Brille", "die Uhr", "der Flughafen",
    "das Motorrad", "das Ticket", "die Fahrkarte", "die Ampel", "die Kreuzung",
    "die Brücke", "die Post", "die Bank", "die Kirche", "die Universität",
    "das Theater", "das Museum", "der Markt", "der Laden", "das Gebäude",
    "das Dorf", "der Herd", "das Sofa", "die Treppe", "der Spiegel",
    "die Leute", "der Beruf", "das Büro", "die Firma", "der Kollege",
    "die Kollegin", "der Chef", "die Chefin", "der Termin", "die Besprechung",
    "die Aufgabe", "das Projekt", "der Feierabend", "die Pause", "der Preis",
    "die Rechnung", "das Gehalt", "der Laptop", "der Bildschirm", "die Tastatur",
    "die Maus", "der Drucker", "der Anruf", "die E-Mail", "das WLAN",
    "die Datei", "das Programm", "die Software", "die App", "der Fehler",
    "der Test", "die Webseite", "das Heft", "die Lösung", "das Beispiel",
    "die Erfahrung", "die Sprache", "der Satz", "die Grammatik", "die Aussprache",
    "der Unterricht", "die Prüfung", "der Kurs", "das Studium", "das Team",
    "der Kunde", "die Kundin", "die Kleidung", "der Kühlschrank", "die Bahn",
    "das Krankenhaus", "die Apotheke", "die Uhrzeit",
}
A2_VERBS = {
    "studieren", "beginnen", "enden", "schenken", "gewinnen", "verlieren",
    "reisen", "besuchen", "einladen",
}
A2_ADJ = {"sauer", "scharf"}
A2_ADV = {"wirklich", "ungefähr", "ziemlich", "genug", "woher"}
A2_PREP = {"seit"}
A2_CONJ = {"als", "ob", "bevor", "während", "trotzdem", "deshalb", "also", "sondern"}
A2_PHRASE = {
    "Es tut mir leid.", "Ich verstehe nicht.", "Ich weiß nicht.", "Wie geht's?",
    "Prost!", "Viel Glück!", "Herzlichen Glückwunsch", "Was kostet das?",
    "Ich hätte gern …", "Sprechen Sie Englisch?",
}

BY_POS = {
    "n": A2_NOUNS, "v": A2_VERBS, "adj": A2_ADJ, "adv": A2_ADV,
    "prep": A2_PREP, "conj": A2_CONJ, "phrase": A2_PHRASE,
    "pron": set(), "num": set(),
}


def main() -> None:
    words = json.loads(WORDS.read_text(encoding="utf-8"))
    changed = 0
    for w in words:
        if w.get("level"):
            continue
        w["level"] = "A2" if w["de"] in BY_POS.get(w["pos"], set()) else "A1"
        changed += 1
    WORDS.write_text(json.dumps(words, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    from collections import Counter
    print("tagged:", changed, "| levels:", dict(Counter(w["level"] for w in words)))
    missing = [w["de"] for w in words if not w.get("level")]
    print("missing:", missing if missing else "none")


if __name__ == "__main__":
    main()