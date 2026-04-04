"""Extract BOOKABLE_SERVICES-like JSON from services.ts (best-effort: run after array uses s(...) helper)."""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
services_ts = (ROOT / "src" / "lib" / "services.ts").read_text(encoding="utf-8")

# Strip comments
text = re.sub(r"/\*[\s\S]*?\*/", "", services_ts)
text = re.sub(r"//.*", "", text)

# Find BOOKABLE_SERVICES = [ ... ];
m = re.search(
    r"export\s+const\s+BOOKABLE_SERVICES\s*:\s*BookableService\[\]\s*=\s*\[([\s\S]*?)\]\s*;",
    text,
)
if not m:
    print("Could not find BOOKABLE_SERVICES array", file=sys.stderr)
    sys.exit(1)

body = m.group(1)

# s("id", "category", "name", "desc", durMin, priceDollars, STAFF_CONST, startingAt?)
# or s(..., ["a","b"], ...)
pat = re.compile(
    r's\(\s*"([^"]+)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([^,)]+)(?:\s*,\s*(true|false))?\s*\)',
    re.DOTALL,
)

MANI = ["kate", "nicole", "sherlyn", "danna", "liz"]
PEDI = ["lily", "sherlyn", "nicole", "danna", "kate", "liz"]
MANI_PEDI = ["kate", "nicole", "sherlyn", "danna", "liz"]
HAIR = ["elsa"]
FACIAL = ["elsa", "lily"]
MAKEUP = ["elsa", "lily"]
SCALP = ["nicole", "lily"]
LASH_BROW = ["danna"]
IPL = ["lily"]
WAX_ALL = ["elsa"]
WAX_LILY = ["elsa", "lily"]

POOLS = {
    "MANI": MANI,
    "PEDI": PEDI,
    "MANI_PEDI": MANI_PEDI,
    "HAIR": HAIR,
    "FACIAL": FACIAL,
    "MAKEUP": MAKEUP,
    "SCALP": SCALP,
    "LASH_BROW": LASH_BROW,
    "IPL": IPL,
    "WAX_ALL": WAX_ALL,
    "WAX_LILY": WAX_LILY,
}


def parse_staff_ids(raw: str) -> list[str]:
    raw = raw.strip()
    if raw.startswith("["):
        inner = raw[1 : raw.rindex("]")]
        return re.findall(r'"([^"]+)"', inner)
    if raw in POOLS:
        return list(POOLS[raw])
    raise ValueError(f"Unknown staff ref: {raw}")


out: list[dict] = []
for match in pat.finditer(body):
    sid, cat, name, desc, dur, dollars, staff_raw, starting_raw = match.groups()
    starting_at = True if starting_raw is None else starting_raw == "true"
    staff_ids = parse_staff_ids(staff_raw)
    out.append(
        {
            "id": sid,
            "category": cat.replace("\\'", "'"),
            "name": name.replace("\\'", "'"),
            "description": desc.replace("\\'", "'"),
            "durationMin": int(dur),
            "priceCents": int(dollars) * 100,
            "startingAt": starting_at,
            "staffIds": staff_ids,
        }
    )

if len(out) < 50:
    print(f"Warning: only parsed {len(out)} services", file=sys.stderr)

out_path = ROOT / "data" / "services.json"
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(out, indent=2), encoding="utf-8")
print(f"Wrote {len(out)} services to {out_path}")
