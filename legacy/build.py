"""Builds the static pages from src/layout.html + src/pages/*.html.
Run:  python build.py   (outputs index.html, about.html, work.html, stack.html, contact.html)"""
import math, pathlib

ROOT = pathlib.Path(__file__).parent
layout = (ROOT / "src/layout.html").read_text(encoding="utf-8")

PAGES = [
    dict(slug="index", page="home", title="Naveen Chand: Software Engineer",
         desc="Portfolio of Naveen Chand, a software engineer building across full-stack, machine learning and Web3. Based in Bengaluru.",
         next_href="about.html", next_label="About", next_kicker="Next: who I am"),
    dict(slug="about", page="about", title="About | Naveen Chand",
         desc="Who Naveen Chand is: education, milestones, leadership and life off-screen.",
         next_href="work.html", next_label="Work", next_kicker="Next: selected projects"),
    dict(slug="work", page="work", title="Work | Naveen Chand",
         desc="Selected projects by Naveen Chand: STOCK AI, NFT Vault, DeFi Vault and Cyber Trigger.",
         next_href="stack.html", next_label="Stack", next_kicker="Next: the toolbox",
         extra='<script src="js/visuals.js"></script>'),
    dict(slug="stack", page="stack", title="Stack | Naveen Chand",
         desc="Languages, frameworks, platforms and certifications, including Google Cloud Associate Cloud Engineer.",
         next_href="contact.html", next_label="Contact", next_kicker="Next: let's talk"),
    dict(slug="contact", page="contact", title="Contact | Naveen Chand",
         desc="Get in touch with Naveen Chand. Open to software engineering roles and available immediately.",
         next_href="index.html", next_label="Home", next_kicker="Back to the start"),
]

RINGS = [
    (21, "26s", "normal", ["Python", "C++", "JavaScript", "TypeScript", "SQL"]),
    (32, "40s", "reverse", ["React", "Node.js", "TensorFlow", "Django", "Firebase", "Supabase", "Tailwind"]),
    (44, "60s", "normal", ["Solidity", "Hardhat", "Google Cloud", "AWS", "MongoDB", "Git", "Linux", "Chainlink", "IPFS"]),
]

def orbit():
    out = []
    for r, dur, d, items in RINGS:
        rdir = "reverse" if d == "normal" else "normal"
        spans = []
        for i, name in enumerate(items):
            a = round(360 * i / len(items) + r * 3, 1)
            spans.append(f'<span class="ring__item" style="--a:{a}deg"><span>{name}</span></span>')
        out.append(f'<div class="ring" style="--r:{r}"><div class="ring__spin" style="--dur:{dur};--dir:{d};--rdir:{rdir};--r:{r}">{"".join(spans)}</div></div>')
    return "\n        ".join(out)

for p in PAGES:
    content = (ROOT / f"src/pages/{p['slug']}.html").read_text(encoding="utf-8")
    content = content.replace("{{orbit}}", orbit())
    html = layout
    for key in ("about", "work", "stack", "contact"):
        html = html.replace("{{cur_%s}}" % key, ' aria-current="page"' if p["slug"] == key else "")
    html = (html.replace("{{content}}", content)
                .replace("{{title}}", p["title"]).replace("{{desc}}", p["desc"]).replace("{{page}}", p["page"])
                .replace("{{next_href}}", p["next_href"]).replace("{{next_label}}", p["next_label"])
                .replace("{{next_kicker}}", p["next_kicker"]).replace("{{extra_scripts}}", p.get("extra", "")))
    assert "{{" not in html, p["slug"]
    (ROOT / f"{p['slug']}.html").write_text(html, encoding="utf-8")
    print("built", p["slug"] + ".html")
