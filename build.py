#!/usr/bin/env python3
"""Build data.js from verbs.json + words.json for the Deutsch Wörterbuch site."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VERBS = ROOT / "verbs.json"
WORDS = ROOT / "words.json"
OUT = ROOT / "data.js"


def main() -> None:
    verbs = json.loads(VERBS.read_text(encoding="utf-8"))["verbs"]  # raises on invalid JSON
    words = json.loads(WORDS.read_text(encoding="utf-8"))  # raises on invalid JSON

    assert isinstance(verbs, list) and verbs, "verbs must be a non-empty list"
    assert isinstance(words, list) and words, "words must be a non-empty list"

    seen = set()
    for v in verbs:
        assert v["v"] not in seen, f"duplicate verb: {v['v']}"
        seen.add(v["v"])
        assert v["sentences"], f"verb without sentences: {v['v']}"

    for w in words:
        key = (w["de"], w.get("pos"))
        assert key not in seen, f"duplicate entry: {w['de']} ({w.get('pos')})"
        seen.add(key)
        assert w.get("en"), f"word without translation: {w.get('de')}"

    stats = {
        "verbs": len(verbs),
        "words": len(words),
        "sentences": sum(len(v["sentences"]) for v in verbs),
        "themes": sorted({v["theme"] for v in verbs}),
    }

    data = {
        "title": "Deutsch Wörterbuch",
        "subtitle": "SprintDeutsch · Verben & Beispielsätze",
        "verbs": verbs,
        "words": words,
        "stats": stats,
    }

    js = "window.WB_DATA = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n"
    OUT.write_text(js, encoding="utf-8")
    print(f"OK: {len(verbs)} verbs, {len(words)} words, {stats['sentences']} sentences -> {OUT.name} ({len(js)} bytes)")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # surface hard failures for the cron job
        print(f"BUILD FAILED: {e}", file=sys.stderr)
        sys.exit(1)