#!/usr/bin/env python3
"""Build data.js from verbs.json for the Deutsch Wörterbuch site."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "verbs.json"
OUT = ROOT / "data.js"


def main() -> None:
    with open(SRC, encoding="utf-8") as f:
        data = json.load(f)  # raises on invalid JSON -> job catches this

    verbs = data["verbs"]
    assert isinstance(verbs, list) and verbs, "verbs must be a non-empty list"
    seen = set()
    for v in verbs:
        assert v["v"] not in seen, f"duplicate verb: {v['v']}"
        seen.add(v["v"])
        assert v["sentences"], f"verb without sentences: {v['v']}"

    stats = {
        "verbs": len(verbs),
        "sentences": sum(len(v["sentences"]) for v in verbs),
        "themes": sorted({v["theme"] for v in verbs}),
    }
    data["stats"] = stats

    js = "window.WB_DATA = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n"
    OUT.write_text(js, encoding="utf-8")
    print(f"OK: {len(verbs)} verbs, {stats['sentences']} sentences -> {OUT.name} ({len(js)} bytes)")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # surface hard failures for the cron job
        print(f"BUILD FAILED: {e}", file=sys.stderr)
        sys.exit(1)