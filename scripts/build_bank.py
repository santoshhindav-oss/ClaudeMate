"""Build src/bank.json from the approved answers .docx (Heading 1 = category, Heading 2 = "Question N",
next paragraph = question, following paragraphs = answer), and optionally copy recordings into audio/.

Usage: python3 scripts/build_bank.py ANSWERS.docx [RECORDINGS_DIR]
Recordings are matched by question text (Q###_<first words>.mp3), not by number, and saved as audio/Q<new n>.mp3.
"""
import json, re, shutil, sys
from pathlib import Path
from docx import Document

ROOT = Path(__file__).resolve().parent.parent
GROUP = {'About You': 'HR', 'Leadership, People and Compliance': 'HR', 'Leadership and Strategic Delivery Scenarios': 'HR',
         'Architecture': 'Technical', 'AI in Delivery': 'Technical', 'Engineering Programs, Agile and Release Management': 'Technical'}

def slug(text, words=6):
    return '_'.join(re.findall(r'[A-Za-z0-9]+', text)[:words]).lower()

doc = Document(sys.argv[1])
bank, topic, cur = [], None, None
for p in doc.paragraphs:
    t, style = p.text.strip(), p.style.name
    if style == 'Heading 1':
        topic = re.sub(r'^\d+\.\s*', '', t); cur = None; continue
    if style == 'Heading 2' and t.startswith('Question '):
        cur = {'n': int(t.split()[1]), 'topic': topic, 'q': None, 'a': []}; bank.append(cur); continue
    if cur is None or not t: continue
    if cur['q'] is None: cur['q'] = t
    else: cur['a'].append(t)
for x in bank:
    x['a'] = '\n\n'.join(x['a'])
    x['category'] = 'Technical' if x['topic'].startswith('AI ') else GROUP.get(x['topic'], 'Delivery')
assert [x['n'] for x in bank] == list(range(1, len(bank) + 1)), 'question numbers are not 1..N'
assert all(x['q'] and x['a'] for x in bank), 'a question has no text or answer'
(ROOT / 'src/bank.json').write_text(json.dumps(bank, ensure_ascii=False), encoding='utf-8')
print(f'{len(bank)} questions in {len({x["topic"] for x in bank})} categories')

if len(sys.argv) > 2:
    files = {}
    for f in Path(sys.argv[2]).glob('Q[0-9][0-9][0-9]_*.mp3'):
        files.setdefault(f.name[5:-4].lower(), []).append(f)
    out = ROOT / 'audio'; shutil.rmtree(out, ignore_errors=True); out.mkdir()
    missing, ambiguous = [], []
    for x in bank:
        cands = [fs for k, fs in files.items() if slug(x['q'], len(k.split('_'))) == k]
        cands = [f for fs in cands for f in fs]
        # Duplicate questions share wording; prefer the file whose number matches.
        exact = [f for f in cands if int(f.name[1:4]) == x['n']]
        pick = exact[0] if exact else (cands[0] if len(cands) == 1 else None)
        if pick is None: (ambiguous if cands else missing).append(x['n']); continue
        shutil.copy(pick, out / f'Q{x["n"]:03d}.mp3')
    print(f'recordings: {len(bank) - len(missing) - len(ambiguous)} mapped, missing {missing}, ambiguous {ambiguous}')
