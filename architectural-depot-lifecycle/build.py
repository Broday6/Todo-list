#!/usr/bin/env python3
"""Build the Architectural Depot lifecycle program from data/.

Reads data/program.json and data/flows/*.json (one file per flow, schema in PROMPT.md section 9)
and writes dist/:

  emails/<STEP>.html  Klaviyo-ready HTML for every email. Template tags stay literal; dynamic
                      product blocks and image slots are marked placeholders to swap in.
  build-sheet.csv     One row per message: what to build in the ESP, in order.
  copy-deck.md        Every message in reading order, for copy review and sign-off.
  qa-report.md        Errors, warnings, links to verify, claims to verify, tokens to map.
  flow-map.html       Self-contained viewer: flows, timelines, email and SMS previews.

Usage:  python3 build.py            build, print a summary
        python3 build.py --strict   same, but exit 1 if any error was found
"""
from __future__ import annotations

import csv
import html
import json
import math
import re
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parent
FLOWS_DIR = ROOT / "data" / "flows"
PROGRAM_FILE = ROOT / "data" / "program.json"
SMS_FILE = ROOT / "data" / "sms.json"
DIST = ROOT / "dist"

SITE = "https://www.architecturaldepot.com"
SITE_HOSTS = {"www.architecturaldepot.com", "architecturaldepot.com"}
# Paths confirmed to exist on the live site. Anything else is listed in the QA report to check.
VERIFIED_PATHS = {
    "/", "/all.html", "/beams.html", "/faux-wood-beams.html", "/made-to-order-faux-wood-beams.html",
    "/BM.html", "/BUILDER-COR.html", "/BUILDER-BKT.html", "/BUILDER-FLT.html", "/ekena-millwork.html",
    "/moulding.html", "/catalogs.html", "/HELP.html", "/products-on-sale.html", "/brands.html",
    "/architecturaldepot-customer-reviews.html", "/BASK.html", "/SAMPLE-URETHANE.html",
    "/BM-MAT-SAMPLE.html", "/LVSAMPLECOLORS.html", "/BESAMPLECOLORS.html", "/blogs/",
    "/blogs/introducing-the-next-generation-of-timberthane-even-more-realistic-still-maintenance-free/",
}

PHONE = "1-888-573-3768"
CS_EMAIL = "cs@architecturaldepot.com"
HOURS = "Mon–Fri 8am–6pm CT, Sat 8am–12pm CT"

# Placeholder email palette (stone + bronze) until the real brand palette is dropped in.
C = {
    "page": "#EDEAE4", "card": "#FFFFFF", "ink": "#23211E", "muted": "#6A655D", "rule": "#E2DDD4",
    "soft": "#F5F1EA", "accent": "#8C5A2B", "accent_dark": "#5E3B1A", "ph": "#D9D1C3", "ph_ink": "#5E574C",
}
SERIF = "Georgia,'Times New Roman',Times,serif"
SANS = "Helvetica,Arial,sans-serif"

BLOCK_TYPES = {"text", "bullets", "cards", "steps", "products", "callout", "review", "image", "button"}
SMS_PREFIX = "Architectural Depot:"
SMS_STOP = "Reply STOP to opt out"
LINK_LEN = 23  # a platform-shortened link

GSM7_BASIC = set(
    "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩ"
    "ΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyz"
    "äöñüà"
)
GSM7_EXT = set("^{}\\[~]|€\f")

TOKEN_RE = re.compile(r"\{\{.*?\}\}|\{%.*?%\}")
LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
EMOJI_RE = re.compile("[\U0001F000-\U0001FAFF☀-➿️]")

# Sample values used to preview tokens and estimate rendered SMS length.
TOKEN_SAMPLES = {
    "first_name": "Jordan",
    "product_name": "Hand Hewn Faux Wood Beam",
    "category_name": "faux wood beam",
    "order_number": "100482",
    "depot_dollars_balance": "$42.50",
    "depot_dollars_expiration_date": "Dec 18",
    "welcome_code": "WELCOME-7KQ2",
    "coupon_code": "WELCOME-7KQ2",
    "SPECIALIST_NAME": "Sam",
    "WELCOME_OFFER": "10% off your first order",
    "CART_INCENTIVE": "double Depot Dollars (10% back)",
    "WINBACK_INCENTIVE": "bonus Depot Dollars",
    "SAMPLE_CREDIT": "[sample credit, if confirmed]",
    "MTO_LEAD_TIME": "[X-Y business days]",
    "TRADE_PROGRAM": "[trade program details, if confirmed]",
    "INSTAGRAM_HANDLE": "@[handle]",
    "BFCM_OFFER": "[sale offer]",
    "HOLIDAY_SHIP_CUTOFF": "[cutoff date]",
    "organization.name": "Architectural Depot",
    "organization.full_address": "[Company mailing address]",
}
URL_TOKENS = {"cart_url", "product_url"}

# How each token maps to a real value at build time.
TOKEN_MAPPING = {
    "first_name": "Native profile field. Keep the |default:'there' fallback.",
    "product_name": "Event property from the Miva integration (Viewed Product / Started Checkout item name).",
    "product_url": "Event property: the item URL.",
    "category_name": "Event or catalog property: the item's category, lowercase.",
    "cart_url": "Started Checkout restore URL. /BASK.html only restores on the same browser.",
    "order_number": "Placed Order event property.",
    "depot_dollars_balance": "Profile property synced from Miva.",
    "depot_dollars_expiration_date": "Profile property synced from Miva, formatted 'Mon D'.",
    "welcome_code": "Klaviyo coupon: {% coupon_code 'WELCOME' %} fed by an uploaded Miva code list.",
    "coupon_code": "Klaviyo coupon tag.",
    "unsubscribe": "Klaviyo tag, required in every marketing email.",
    "manage_preferences": "Klaviyo tag.",
    "organization.name": "Klaviyo account setting.",
    "organization.full_address": "Klaviyo account setting. Required by CAN-SPAM.",
}

CLAIM_PATTERNS = [
    (r"warrant", "warranty"), (r"lifetime", "lifetime"), (r"free shipping", "free shipping"),
    (r"#1|number one", "ranking"), (r"best[- ]?sell", "best seller"), (r"\baward", "award"),
    (r"\b\d[\d,]*\+?\s+(?:customers|homeowners|reviews|projects|pros)\b", "count"),
    (r"\b\d+(?:\.\d)?\s*stars?\b|\bfive[- ]star\b|\b5[- ]star\b", "rating"),
    (r"same[- ]day|ships? (?:today|tomorrow)|\bin \d+\s*(?:-|to|–)\s*\d+\s*(?:business )?(?:days|hours)\b", "lead time"),
    (r"maintenance[- ]free|rot[- ]proof|waterproof|insect|termite|won't (?:rot|warp|crack)", "material performance"),
]

# Claim wording that matches a verified fact (PROMPT.md section 2). Still listed, marked as verified.
VERIFIED_CLAIMS = [
    r"timberthane[^.]*maintenance[- ]free|maintenance[- ]free[^.]*timberthane|still maintenance[- ]free",
    r"free shipping[^.]*lower 48",
    r"heritage series[^.]*24-72 hours",
]


# ---------------------------------------------------------------------------------------------
# helpers

def token_name(tok: str) -> str:
    inner = tok[2:-2].strip()
    if tok.startswith("{%"):
        return inner.split()[0] if inner else inner
    return inner.split("|")[0].strip()


def tokens_in(text: str) -> list[str]:
    return [token_name(t) for t in TOKEN_RE.findall(text or "")]


def is_token_url(url: str) -> bool:
    return url.strip().startswith(("{{", "{%"))


class Ctx:
    """Rendering context for one message."""

    def __init__(self, flow: dict, step: dict, mode: str, medium: str):
        self.flow, self.step, self.mode, self.medium = flow, step, mode, medium
        self.links: list[str] = []
        self.tokens: set[str] = set()


def track(url: str, ctx: Ctx) -> str:
    """Record a link and add the program's UTM parameters to on-site URLs."""
    url = url.strip()
    ctx.links.append(url)
    if is_token_url(url):
        ctx.tokens.add(token_name(url))
        return url if ctx.mode == "raw" else "#"
    parts = urlsplit(url)
    if parts.hostname not in SITE_HOSTS:
        return url
    query = dict(parse_qsl(parts.query))
    for key, value in (("utm_source", "klaviyo"), ("utm_medium", ctx.medium),
                       ("utm_campaign", ctx.flow["id"]), ("utm_content", ctx.step["id"])):
        query.setdefault(key, value)
    return urlunsplit((parts.scheme, parts.netloc, parts.path or "/", urlencode(query), parts.fragment))


def token_html(tok: str, ctx: Ctx) -> str:
    name = token_name(tok)
    ctx.tokens.add(name)
    if ctx.mode == "raw":
        return tok
    if name in ("unsubscribe", "manage_preferences"):
        label = "Unsubscribe" if name == "unsubscribe" else "Manage preferences"
        return f'<a href="#" style="color:{C["muted"]};text-decoration:underline">{label}</a>'
    sample = TOKEN_SAMPLES.get(name, f"[{name}]")
    return (f'<span title="{html.escape(tok)}" style="background:#FFF1C9;color:#23211E;'
            f'border-bottom:1px dotted {C["accent"]}">{html.escape(sample)}</span>')


def inline(text: str, ctx: Ctx, allow_links: bool = True, link_color: str | None = None) -> str:
    """Escape text and render **bold**, [label](url) and template tokens."""
    stash: list[str] = []

    def keep(fragment: str) -> str:
        stash.append(fragment)
        return f"\x00{len(stash) - 1}\x00"

    text = text or ""
    if allow_links:
        def link(m: re.Match) -> str:
            href = html.escape(track(m.group(2), ctx))
            color = link_color or C["accent"]
            label = inline(m.group(1), ctx, allow_links=False)
            return keep(f'<a href="{href}" style="color:{color};text-decoration:underline">{label}</a>')
        text = LINK_RE.sub(link, text)
    text = TOKEN_RE.sub(lambda m: keep(token_html(m.group(0), ctx)), text)
    text = html.escape(text, quote=False)
    text = BOLD_RE.sub(r"<strong>\1</strong>", text)
    text = text.replace("\n", "<br>")
    return re.sub(r"\x00(\d+)\x00", lambda m: stash[int(m.group(1))], text)


def ps_text(step: dict) -> str:
    """The P.S. line without its label; the template adds the label."""
    return re.sub(r"^\s*P\.?\s*S\.?\s*", "", step.get("ps") or "")


def plain_words(text: str) -> int:
    text = TOKEN_RE.sub("x", text or "")
    text = LINK_RE.sub(r"\1", text)
    return len(re.findall(r"[A-Za-z0-9$%'’]+", text))


# ---------------------------------------------------------------------------------------------
# email rendering

def p_style(size: int = 16, color: str | None = None, extra: str = "") -> str:
    return (f"margin:0 0 16px;font-family:{SANS};font-size:{size}px;line-height:1.6;"
            f"color:{color or C['ink']};{extra}")


def h2(text: str, ctx: Ctx) -> str:
    return (f'<h2 class="ink" style="margin:8px 0 14px;font-family:{SERIF};font-size:21px;line-height:1.3;'
            f'font-weight:normal;color:{C["ink"]}">{inline(text, ctx)}</h2>')


def placeholder(label: str, detail: str, height: int, ctx: Ctx) -> str:
    comment = f"<!-- {label}: {html.escape(detail)} -->" if ctx.mode == "raw" else ""
    return (f'{comment}<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>'
            f'<td height="{height}" align="center" valign="middle" style="background:{C["ph"]};height:{height}px;'
            f'padding:16px;font-family:{SANS};font-size:12px;line-height:1.5;color:{C["ph_ink"]}">'
            f'<strong style="letter-spacing:1px;text-transform:uppercase">{label}</strong><br>{html.escape(detail)}'
            f'</td></tr></table>')


def button(label: str, url: str, ctx: Ctx, primary: bool = True) -> str:
    href = html.escape(track(url, ctx))
    if primary:
        cell = f'bgcolor="{C["accent"]}" style="border-radius:3px;background:{C["accent"]}"'
        link = (f'style="display:inline-block;padding:15px 30px;font-family:{SANS};font-size:15px;font-weight:bold;'
                f'letter-spacing:.3px;color:#FFFFFF;text-decoration:none;border-radius:3px"')
    else:
        cell = f'style="border:1px solid {C["accent"]};border-radius:3px"'
        link = (f'style="display:inline-block;padding:12px 24px;font-family:{SANS};font-size:14px;font-weight:bold;'
                f'color:{C["accent"]};text-decoration:none"')
    return (f'<table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 20px"><tr>'
            f'<td {cell}><a href="{href}" {link}>{inline(label, ctx, allow_links=False)}</a></td></tr></table>')


def grid(cells: list[str], cols: int) -> str:
    rows = []
    width = int(100 / cols)
    for i in range(0, len(cells), cols):
        chunk = cells[i:i + cols]
        tds = []
        for j, cell in enumerate(chunk):
            pad = "0 0 12px 0" if cols == 1 else ("0 6px 12px 0" if j == 0 else ("0 0 12px 6px" if j == cols - 1 else "0 6px 12px"))
            tds.append(f'<td class="col" width="{width}%" valign="top" style="padding:{pad}">{cell}</td>')
        tds += [f'<td class="col" width="{width}%"></td>'] * (cols - len(chunk))
        rows.append("<tr>" + "".join(tds) + "</tr>")
    return f'<table role="presentation" width="100%" cellspacing="0" cellpadding="0">{"".join(rows)}</table>'


def render_block(block: dict, ctx: Ctx) -> str:
    kind = block.get("type")
    title = h2(block["title"], ctx) if block.get("title") and kind in ("cards", "steps", "products", "bullets") else ""
    if kind == "text":
        return f'<p class="ink" style="{p_style()}">{inline(block.get("text", ""), ctx)}</p>'
    if kind == "bullets":
        rows = "".join(
            f'<tr><td width="20" valign="top" style="font-family:{SANS};font-size:16px;line-height:1.6;color:{C["accent"]}">&#9632;</td>'
            f'<td class="ink" style="padding:0 0 8px;font-family:{SANS};font-size:16px;line-height:1.6;color:{C["ink"]}">{inline(item, ctx)}</td></tr>'
            for item in block.get("items", []))
        return f'{title}<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px">{rows}</table>'
    if kind == "cards":
        items = block.get("items", [])
        cols = 3 if len(items) == 3 else (1 if len(items) == 1 else 2)
        cells = []
        for item in items:
            more = ""
            if item.get("url"):
                more = (f'<p style="margin:10px 0 0;font-family:{SANS};font-size:14px;font-weight:bold">'
                        f'<a href="{html.escape(track(item["url"], ctx))}" style="color:{C["accent"]};text-decoration:none">'
                        f'{html.escape(item.get("link_label", "Shop now"))} &rarr;</a></p>')
            cells.append(
                f'<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>'
                f'<td class="soft" style="background:{C["soft"]};padding:18px;border-top:2px solid {C["accent"]}">'
                f'<p class="ink" style="margin:0 0 6px;font-family:{SERIF};font-size:17px;line-height:1.3;color:{C["ink"]}">{inline(item.get("title", ""), ctx)}</p>'
                f'<p class="muted" style="margin:0;font-family:{SANS};font-size:14px;line-height:1.55;color:{C["muted"]}">{inline(item.get("text", ""), ctx)}</p>'
                f'{more}</td></tr></table>')
        return f'{title}{grid(cells, cols)}<div style="height:8px;line-height:8px">&nbsp;</div>'
    if kind == "steps":
        rows = []
        for n, item in enumerate(block.get("items", []), 1):
            rows.append(
                f'<tr><td width="44" valign="top" style="padding:0 0 14px">'
                f'<table role="presentation" cellspacing="0" cellpadding="0"><tr><td width="30" height="30" align="center" '
                f'style="width:30px;height:30px;border-radius:15px;background:{C["accent"]};font-family:{SANS};font-size:14px;'
                f'font-weight:bold;color:#FFFFFF">{n}</td></tr></table></td>'
                f'<td valign="top" class="ink" style="padding:4px 0 14px;font-family:{SANS};font-size:16px;line-height:1.55;color:{C["ink"]}">'
                f'<strong>{inline(item.get("title", ""), ctx)}</strong><br>'
                f'<span class="muted" style="color:{C["muted"]};font-size:15px">{inline(item.get("text", ""), ctx)}</span></td></tr>')
        return f'{title}<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 8px">{"".join(rows)}</table>'
    if kind == "products":
        count = max(1, min(int(block.get("count", 3) or 3), 6))
        cols = 3 if count in (3, 6) else (1 if count == 1 else 2)
        cell = (f'<table role="presentation" width="100%" cellspacing="0" cellpadding="0">'
                f'<tr><td height="150" style="height:150px;background:{C["ph"]}">&nbsp;</td></tr>'
                f'<tr><td class="ink" style="padding:10px 0 2px;font-family:{SANS};font-size:14px;font-weight:bold;color:{C["ink"]}">Product name</td></tr>'
                f'<tr><td class="muted" style="font-family:{SANS};font-size:13px;color:{C["muted"]}">$000.00 &middot; '
                f'<span style="color:{C["accent"]};font-weight:bold">View</span></td></tr></table>')
        source = html.escape(block.get("source", ""))
        comment = f"<!-- DYNAMIC PRODUCT BLOCK: {source} -->" if ctx.mode == "raw" else ""
        note = (f'<p class="muted" style="margin:0 0 20px;padding:8px 10px;border:1px dashed {C["ph_ink"]};font-family:{SANS};'
                f'font-size:12px;line-height:1.5;color:{C["muted"]}"><strong>Dynamic block</strong> &middot; {source}</p>')
        return f'{comment}{title}{grid([cell] * count, cols)}{note}'
    if kind == "callout":
        head = (f'<p class="ink" style="margin:0 0 6px;font-family:{SERIF};font-size:18px;line-height:1.3;color:{C["ink"]}">'
                f'{inline(block["title"], ctx)}</p>') if block.get("title") else ""
        return (f'<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:4px 0 20px"><tr>'
                f'<td class="soft" style="background:{C["soft"]};padding:20px 22px">{head}'
                f'<p class="ink" style="margin:0;font-family:{SANS};font-size:15px;line-height:1.6;color:{C["ink"]}">{inline(block.get("text", ""), ctx)}</p>'
                f'</td></tr></table>')
    if kind == "review":
        source = block.get("source", "")
        comment = f"<!-- REAL REVIEW: {html.escape(source)} -->" if ctx.mode == "raw" else ""
        return (f'{comment}<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:4px 0 20px"><tr>'
                f'<td style="border:1px dashed {C["ph_ink"]};padding:18px 22px;font-family:{SANS};font-size:13px;line-height:1.55;color:{C["muted"]}">'
                f'<strong style="letter-spacing:1px;text-transform:uppercase">Real customer review goes here</strong><br>'
                f'{html.escape(source)}</td></tr></table>')
    if kind == "image":
        return placeholder("Image", block.get("direction", ""), 220, ctx) + '<div style="height:20px;line-height:20px">&nbsp;</div>'
    if kind == "button":
        return button(block.get("label", "Learn more"), block.get("url", SITE), ctx, primary=False)
    return ""


def footer_html(ctx: Ctx) -> str:
    small = f"font-family:{SANS};font-size:12px;line-height:1.6;color:{C['muted']}"
    unsub = token_html("{% unsubscribe %}", ctx)
    prefs = token_html("{% manage_preferences %}", ctx)
    org = token_html("{{ organization.name }}", ctx)
    addr = token_html("{{ organization.full_address }}", ctx)
    return (f'<p class="muted" style="margin:0 0 10px;{small}">Questions about your project? Call <strong>{PHONE}</strong> '
            f'({html.escape(HOURS)}) or email <a href="mailto:{CS_EMAIL}" style="color:{C["muted"]}">{CS_EMAIL}</a>.</p>'
            f'<p class="muted" style="margin:0 0 10px;{small}">You are receiving this email because you subscribed or shopped '
            f'at ArchitecturalDepot.com.</p>'
            f'<p class="muted" style="margin:0;{small}">{prefs} &middot; {unsub}<br>{org} &middot; {addr}</p>')


def render_email(flow: dict, step: dict, mode: str) -> tuple[str, Ctx]:
    ctx = Ctx(flow, step, mode, "email")
    plain = step.get("style") == "plain"
    hero = step.get("hero") or {}
    body = "".join(render_block(b, ctx) for b in step.get("blocks", []))
    cta = step.get("cta") or {}
    preheader = inline(step.get("preheader", ""), ctx, allow_links=False)
    title = html.escape(TOKEN_RE.sub("", step.get("subject", "")))
    base = '<base target="_blank">' if mode == "preview" else ""

    head = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>{title}</title>{base}
<!-- {flow['name']} / {step['id']} / {html.escape(step.get('name', ''))} / generated by build.py, edit data/flows/{flow['id']}.json -->
<style>
  body{{margin:0;padding:0;-webkit-text-size-adjust:100%}}
  table{{border-collapse:collapse}}
  img{{border:0;display:block}}
  @media (max-width:620px){{
    .container{{width:100%!important}}
    .px{{padding-left:22px!important;padding-right:22px!important}}
    .col{{display:block!important;width:100%!important;padding-left:0!important;padding-right:0!important}}
    .h1{{font-size:27px!important}}
  }}
  @media (prefers-color-scheme: dark){{
    .bg{{background:#171614!important}}
    .card{{background:#22201D!important}}
    .soft{{background:#2D2A26!important}}
    .ink{{color:#EEEAE3!important}}
    .muted{{color:#B9B1A5!important}}
  }}
</style>
</head>
<body class="bg" style="margin:0;padding:0;background:{C['page'] if not plain else '#FFFFFF'}">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">{preheader}&#8203;{'&nbsp;&#8203;' * 40}</div>
"""
    if plain:
        cta_line = ""
        if cta.get("url"):
            cta_line = (f'<p class="ink" style="{p_style()}"><a href="{html.escape(track(cta["url"], ctx))}" '
                        f'style="color:{C["accent"]};font-weight:bold">{inline(cta.get("label", ""), ctx, False)}</a></p>')
        ps = f'<p class="ink" style="{p_style(15)}">P.S. {inline(ps_text(step), ctx)}</p>' if step.get("ps") else ""
        content = f"""<table role="presentation" width="100%" class="bg" style="background:#FFFFFF"><tr><td align="left" style="padding:28px 16px">
<table role="presentation" width="560" class="container card" style="width:560px;max-width:560px;background:#FFFFFF"><tr><td class="px" style="padding:0 8px">
{body}{cta_line}{ps}
<div style="border-top:1px solid {C['rule']};margin:28px 0 16px;height:1px;line-height:1px">&nbsp;</div>
{footer_html(ctx)}
</td></tr></table>
</td></tr></table>
</body>
</html>
"""
        return head + content, ctx

    eyebrow = (f'<p style="margin:0 0 10px;font-family:{SANS};font-size:12px;font-weight:bold;letter-spacing:2px;'
               f'text-transform:uppercase;color:{C["accent"]}">{inline(hero["eyebrow"], ctx)}</p>') if hero.get("eyebrow") else ""
    subhead = (f'<p class="muted" style="{p_style(17, C["muted"], "margin:0 0 22px;")}">{inline(hero["subhead"], ctx)}</p>'
               if hero.get("subhead") else "")
    hero_img = placeholder("Hero image", hero["image"], 280, ctx) if hero.get("image") else ""
    nav = " &nbsp;&middot;&nbsp; ".join(
        f'<a href="{html.escape(track(SITE + path, ctx))}" style="color:{C["ink"]};text-decoration:none" class="ink">{label}</a>'
        for label, path in (("Beams", "/beams.html"), ("Moulding", "/moulding.html"),
                            ("Ekena Millwork", "/ekena-millwork.html"), ("Sale", "/products-on-sale.html")))
    cta_html = button(cta["label"], cta["url"], ctx) if cta.get("url") else ""
    ps = (f'<p class="muted" style="{p_style(15, C["muted"])}"><strong>P.S.</strong> {inline(ps_text(step), ctx)}</p>'
          if step.get("ps") else "")
    trust_cells = [("Price match guarantee", "Exact same product, lower price? We refund the difference."),
                   ("5% back in Depot Dollars", "On every qualifying order, ready once it ships."),
                   ("Real people, real answers", f"{PHONE}")]
    trust = "".join(
        f'<td class="col" width="33%" valign="top" style="padding:0 8px 12px">'
        f'<p class="ink" style="margin:0 0 4px;font-family:{SERIF};font-size:15px;color:{C["ink"]}">{t}</p>'
        f'<p class="muted" style="margin:0;font-family:{SANS};font-size:12px;line-height:1.5;color:{C["muted"]}">{d}</p></td>'
        for t, d in trust_cells)

    content = f"""<table role="presentation" width="100%" class="bg" style="background:{C['page']}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" class="container card" style="width:600px;max-width:600px;background:{C['card']}">
<tr><td class="soft px" align="center" style="background:{C['soft']};padding:9px 36px;font-family:{SANS};font-size:11px;letter-spacing:.5px;color:{C['muted']}">
<span class="muted">Price match guarantee &nbsp;&middot;&nbsp; 5% back in Depot Dollars &nbsp;&middot;&nbsp; {PHONE}</span></td></tr>
<tr><td class="px" align="center" style="padding:26px 36px 8px">
<p class="ink" style="margin:0;font-family:{SERIF};font-size:23px;letter-spacing:4px;color:{C['ink']}">ARCHITECTURAL DEPOT</p>
<p class="muted" style="margin:6px 0 0;font-family:{SANS};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:{C['muted']}">Architectural millwork for every project</p>
</td></tr>
<tr><td class="px" align="center" style="padding:14px 36px 18px;border-bottom:1px solid {C['rule']};font-family:{SANS};font-size:13px">{nav}</td></tr>
<tr><td class="px" style="padding:34px 36px 6px">
{eyebrow}<h1 class="h1 ink" style="margin:0 0 12px;font-family:{SERIF};font-size:32px;line-height:1.2;font-weight:normal;color:{C['ink']}">{inline(hero.get('headline', ''), ctx)}</h1>
{subhead}</td></tr>
<tr><td class="px" style="padding:0 36px 26px">{hero_img}</td></tr>
<tr><td class="px" style="padding:0 36px 8px">
{body}{cta_html}{ps}
</td></tr>
<tr><td class="px" style="padding:22px 28px 10px;border-top:1px solid {C['rule']}">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>{trust}</tr></table>
</td></tr>
</table>
<table role="presentation" width="600" class="container" style="width:600px;max-width:600px"><tr><td class="px" style="padding:22px 36px 30px">
{footer_html(ctx)}
</td></tr></table>
</td></tr></table>
</body>
</html>
"""
    return head + content, ctx


# ---------------------------------------------------------------------------------------------
# SMS

def sms_render(text: str, ctx: Ctx | None = None) -> str:
    """Text as a recipient would see it, with sample token values and a shortened link."""
    def sub(m: re.Match) -> str:
        name = token_name(m.group(0))
        if ctx is not None:
            ctx.tokens.add(name)
        return "x" * LINK_LEN if name in URL_TOKENS else TOKEN_SAMPLES.get(name, f"[{name}]")
    return TOKEN_RE.sub(sub, text or "").replace("{link}", "x" * LINK_LEN)


def sms_stats(text: str) -> dict:
    literal = TOKEN_RE.sub("", text or "").replace("{link}", "")
    bad = sorted({ch for ch in literal if ch not in GSM7_BASIC and ch not in GSM7_EXT})
    rendered = sms_render(text)
    if bad:
        length = len(rendered)
        segments = 1 if length <= 70 else math.ceil(length / 67)
        encoding = "UCS-2"
    else:
        length = sum(2 if ch in GSM7_EXT else 1 for ch in rendered)
        segments = 1 if length <= 160 else math.ceil(length / 153)
        encoding = "GSM-7"
    return {"chars": length, "segments": segments, "encoding": encoding, "non_gsm": bad}


# ---------------------------------------------------------------------------------------------
# validation

def email_copy_strings(step: dict) -> list[str]:
    out = [step.get("subject", ""), step.get("subject_b", ""), step.get("preheader", ""), step.get("ps", "")]
    hero = step.get("hero") or {}
    out += [hero.get("eyebrow", ""), hero.get("headline", ""), hero.get("subhead", "")]
    for b in step.get("blocks", []):
        out += [b.get("text", ""), b.get("title", "")]
        for item in b.get("items", []) or []:
            out += [item] if isinstance(item, str) else [item.get("title", ""), item.get("text", "")]
    out.append((step.get("cta") or {}).get("label", ""))
    for alt in step.get("alt_versions", []) or []:
        out += [alt.get("subject", ""), alt.get("headline", "")]
    return [s for s in out if s]


def body_word_count(step: dict) -> int:
    words = 0
    for b in step.get("blocks", []):
        if b.get("type") in ("products", "review", "image", "button"):
            continue
        words += plain_words(b.get("text", "")) + plain_words(b.get("title", ""))
        for item in b.get("items", []) or []:
            words += plain_words(item) if isinstance(item, str) else plain_words(item.get("title", "")) + plain_words(item.get("text", ""))
    return words


def sms_issues(text: str, link: str | None, mode: str) -> list[dict]:
    """Checks shared by flow texts, campaign texts and system replies.

    mode: "marketing" (must end with the STOP line), "confirmation" (must carry HELP and STOP),
    "system" (keyword/HELP/STOP replies: prefix, encoding and length only).
    """
    issues: list[dict] = []

    def add(level: str, msg: str) -> None:
        issues.append({"level": level, "msg": msg})

    if not text:
        add("error", "Missing SMS text")
        return issues
    if not text.startswith(SMS_PREFIX):
        add("error", f'SMS must start with "{SMS_PREFIX}"')
    if mode == "confirmation" and ("STOP" not in text or "HELP" not in text):
        add("error", "Opt-in confirmation must include HELP and STOP")
    if mode == "marketing" and not text.rstrip().endswith(SMS_STOP):
        add("error", f'SMS must end with "{SMS_STOP}"')
    stats = sms_stats(text)
    if stats["non_gsm"]:
        add("error", "Non GSM-7 characters force 70-char segments: " + " ".join(repr(c) for c in stats["non_gsm"]))
    if stats["segments"] > 2:
        add("error", f"{stats['chars']} chars = {stats['segments']} segments (max 2)")
    elif stats["segments"] == 2:
        add("warn", f"{stats['chars']} chars = 2 segments (costs double; 160 fits one)")
    if text.count("{link}") > 1:
        add("error", "More than one link")
    if "{link}" in text and not link:
        add("error", "{link} used but no link given")
    if link and "{link}" not in text:
        add("warn", "link given but {link} not placed in text")
    if EMOJI_RE.search(text):
        add("error", "Contains emoji")
    return issues


def check_step(flow: dict, step: dict, seen: set[str]) -> list[dict]:
    issues: list[dict] = []

    def add(level: str, msg: str) -> None:
        issues.append({"level": level, "msg": msg})

    sid = step.get("id", "?")
    if sid in seen:
        add("error", f"Duplicate step id {sid}")
    seen.add(sid)
    if not sid.startswith(flow.get("code", "") + "-"):
        add("warn", f"Step id should start with {flow.get('code')}-")
    for key in ("channel", "timing", "name", "purpose"):
        if not step.get(key):
            add("error", f"Missing {key}")
    if not isinstance(step.get("offset_hours"), (int, float)):
        add("error", "offset_hours must be a number")

    if step.get("channel") == "email":
        for key in ("subject", "preheader"):
            if not step.get(key):
                add("error", f"Missing {key}")
        if not step.get("subject_b"):
            add("warn", "No A/B subject (subject_b)")
        if not (step.get("hero") or {}).get("headline") and step.get("style") != "plain":
            add("error", "Missing hero.headline")
        if not step.get("blocks"):
            add("error", "No body blocks")
        if not (step.get("cta") or {}).get("url"):
            add("error", "Missing primary CTA")
        for label, subj in (("Subject", step.get("subject", "")), ("Subject B", step.get("subject_b", ""))):
            n = len(subj)
            if n > 60:
                add("error", f"{label} is {n} characters (max 60)")
            elif n > 50:
                add("warn", f"{label} is {n} characters (aim for 45 or fewer)")
        pre = len(step.get("preheader", ""))
        if step.get("preheader") and not 35 <= pre <= 100:
            add("warn", f"Preview text is {pre} characters (aim for 40-90)")
        for b in step.get("blocks", []):
            if b.get("type") not in BLOCK_TYPES:
                add("error", f"Unknown block type {b.get('type')!r}")
        words = body_word_count(step)
        if words < 60:
            add("warn", f"Body is {words} words (aim for 80-200)")
        elif words > 230:
            add("warn", f"Body is {words} words (aim for 80-200)")
        copy = " ".join(email_copy_strings(step))
        bangs = sum(s.count("!") for s in email_copy_strings(step) if s not in (step.get("subject_b", ""),))
        if bangs > 1:
            add("warn", f"{bangs} exclamation points (max 1)")
        if EMOJI_RE.search(copy):
            add("error", "Contains emoji")
    elif step.get("channel") == "sms":
        mode = "confirmation" if "S0" in sid else "marketing"
        issues += sms_issues(step.get("text", ""), step.get("link"), mode)
    else:
        add("error", f"Unknown channel {step.get('channel')!r}")
    return issues


def check_flow(flow: dict) -> list[dict]:
    issues = []
    for key in ("id", "code", "name", "phase", "priority_rank", "goal", "trigger", "smart_sending", "kpis", "steps"):
        if flow.get(key) in (None, "", []):
            level = "error" if key in ("id", "code", "name", "phase", "priority_rank", "trigger", "steps") else "warn"
            issues.append({"level": level, "msg": f"Flow is missing {key}"})
    for key in ("flow_filters", "exit_conditions"):
        if key not in flow:
            issues.append({"level": "warn", "msg": f"Flow is missing {key}"})
    return issues


def claims(texts: list[str]) -> list[dict]:
    hits = []
    for text in texts:
        for pattern, label in CLAIM_PATTERNS:
            for m in re.finditer(pattern, text, flags=re.I):
                start, end = max(0, m.start() - 50), min(len(text), m.end() + 50)
                snippet = ("..." if start else "") + text[start:end].replace("\n", " ") + ("..." if end < len(text) else "")
                sentence = re.split(r"(?<=[.!?])\s", text[:m.start()])[-1] + text[m.start():].split(". ")[0]
                verified = any(re.search(v, sentence, flags=re.I) for v in VERIFIED_CLAIMS)
                hits.append({"text": f"{label}: \u201c{snippet}\u201d", "verified": verified})
    return hits


# ---------------------------------------------------------------------------------------------
# outputs

def offset_label(hours: float) -> str:
    if hours < 0:
        d = -hours / 24
        return f"{d:g} days before" if d >= 1 else f"{-hours:g}h before"
    if hours < 48:
        return f"+{hours:g}h"
    d = hours / 24
    return f"+{d:g}d" if d == int(d) else f"+{hours:g}h"


def block_md(b: dict) -> str:
    kind = b.get("type")
    title = f"**{b['title']}**\n\n" if b.get("title") else ""
    if kind == "text":
        return b.get("text", "")
    if kind == "bullets":
        return title + "\n".join(f"- {i}" for i in b.get("items", []))
    if kind == "cards":
        return title + "\n".join(
            f"- **{i.get('title', '')}** — {i.get('text', '')}" + (f" ({i['url']})" if i.get("url") else "")
            for i in b.get("items", []))
    if kind == "steps":
        return title + "\n".join(f"{n}. **{i.get('title', '')}** {i.get('text', '')}" for n, i in enumerate(b.get("items", []), 1))
    if kind == "products":
        return f"{title}> [Dynamic products × {b.get('count', 3)}: {b.get('source', '')}]"
    if kind == "callout":
        return f"> **{b.get('title', '')}** {b.get('text', '')}".replace("> ** ", "> ")
    if kind == "review":
        return f"> [Real customer review: {b.get('source', '')}]"
    if kind == "image":
        return f"> [Image: {b.get('direction', '')}]"
    if kind == "button":
        return f"[Button: {b.get('label', '')}]({b.get('url', '')})"
    return ""


def write_outputs(program: dict, flows: list[dict], results: dict, sms_data: dict, sms_problems: list[dict]) -> tuple:
    (DIST / "emails").mkdir(parents=True, exist_ok=True)
    for old in (DIST / "emails").glob("*.html"):
        old.unlink()

    rows, deck, viewer_flows = [], [], []
    all_tokens: dict[str, set[str]] = {}
    unverified: dict[str, set[str]] = {}
    claim_hits: dict[str, list[str]] = {}

    deck.append(f"# {program['name']} — copy deck\n")
    deck.append("Generated by `build.py` from `data/flows/*.json`. Edit the JSON, not this file.\n")
    deck.append("Tokens like `{{ first_name }}` are filled at send time; see qa-report.md for the mapping.\n")

    for flow in flows:
        steps = sorted(flow["steps"], key=lambda s: (s.get("offset_hours", 0), s.get("id", "")))
        n_email = sum(1 for s in steps if s.get("channel") == "email")
        n_sms = sum(1 for s in steps if s.get("channel") == "sms")
        deck.append(f"\n---\n\n## {flow['priority_rank']}. {flow['name']} (`{flow['code']}`) — Phase {flow['phase']}\n")
        deck.append(f"**Goal:** {flow.get('goal', '')}\n")
        deck.append(f"**Trigger:** {flow.get('trigger', '')}\n")
        if flow.get("flow_filters"):
            deck.append("**Flow filters:**\n" + "\n".join(f"- {f}" for f in flow["flow_filters"]) + "\n")
        if flow.get("exit_conditions"):
            deck.append("**Exits:**\n" + "\n".join(f"- {f}" for f in flow["exit_conditions"]) + "\n")
        deck.append(f"**Smart sending:** {flow.get('smart_sending', '')}\n")
        if flow.get("branches"):
            deck.append("**Branches:**\n" + "\n".join(f"- **{b.get('id')}** {b.get('label', '')}: {b.get('rule', '')}" for b in flow["branches"]) + "\n")
        if flow.get("kpis"):
            deck.append("**KPIs:** " + "; ".join(f"{k.get('metric')} → {k.get('target')}" for k in flow["kpis"]) + "\n")
        if flow.get("build_notes"):
            deck.append("**Build notes:**\n" + "\n".join(f"- {n}" for n in flow["build_notes"]) + "\n")

        vsteps = []
        for step in steps:
            sid = step["id"]
            issues = results["steps"].get(sid, [])
            entry = {k: step.get(k) for k in ("id", "channel", "branch", "timing", "offset_hours", "condition",
                                               "name", "purpose", "subject", "subject_b", "preheader", "style",
                                               "alt_versions")}
            entry["offset_label"] = offset_label(step.get("offset_hours", 0) or 0)
            entry["issues"] = issues
            row = {"flow_id": flow["id"], "flow": flow["name"], "phase": flow["phase"], "step_id": sid,
                   "channel": step.get("channel"), "branch": step.get("branch", ""), "timing": step.get("timing", ""),
                   "offset_hours": step.get("offset_hours", ""), "condition": step.get("condition", ""),
                   "name": step.get("name", ""), "subject_a": "", "subject_b": "", "preheader": "", "headline": "",
                   "cta_label": "", "cta_url": "", "sms_text": "", "sms_link": "", "sms_chars_est": "",
                   "sms_segments": "", "tokens": "", "file": "", "issues": "; ".join(f"[{i['level']}] {i['msg']}" for i in issues)}
            header = f"\n### {sid} · {step.get('name', '')}\n\n*{step.get('timing', '')} ({offset_label(step.get('offset_hours', 0) or 0)}) · {step.get('channel', '').upper()} · branch: {step.get('branch', 'All')} · condition: {step.get('condition', 'None')}*\n\n_Purpose:_ {step.get('purpose', '')}\n"
            deck.append(header)

            if step.get("channel") == "email":
                raw, ctx = render_email(flow, step, "raw")
                preview, _ = render_email(flow, step, "preview")
                (DIST / "emails" / f"{sid}.html").write_text(raw, encoding="utf-8")
                cta = step.get("cta") or {}
                cta_url = track(cta.get("url", ""), Ctx(flow, step, "raw", "email")) if cta.get("url") else ""
                row.update(subject_a=step.get("subject", ""), subject_b=step.get("subject_b", ""),
                           preheader=step.get("preheader", ""), headline=(step.get("hero") or {}).get("headline", ""),
                           cta_label=cta.get("label", ""), cta_url=cta_url, file=f"emails/{sid}.html")
                entry["html"] = preview
                entry["cta_label"] = cta.get("label", "")
                hero = step.get("hero") or {}
                deck.append(f"**Subject A:** {step.get('subject', '')}  \n**Subject B:** {step.get('subject_b', '')}  \n**Preview text:** {step.get('preheader', '')}\n")
                if step.get("style") == "plain":
                    deck.append("_Plain-text style: no header, images or buttons._\n")
                else:
                    deck.append(f"**Hero:** {hero.get('eyebrow', '')} / **{hero.get('headline', '')}** / {hero.get('subhead', '')}  \n> [Hero image: {hero.get('image', '')}]\n")
                for b in step.get("blocks", []):
                    deck.append(block_md(b) + "\n")
                deck.append(f"**CTA:** [{cta.get('label', '')}]({cta.get('url', '')})\n")
                if step.get("ps"):
                    deck.append(f"**P.S.** {ps_text(step)}\n")
                for alt in step.get("alt_versions", []) or []:
                    deck.append(f"> **Alt — {alt.get('label', '')}:** subject “{alt.get('subject', '')}”; headline “{alt.get('headline', '')}”. {alt.get('notes', '')}\n")
                texts = email_copy_strings(step)
            else:
                ctx = Ctx(flow, step, "raw", "sms")
                link = track(step["link"], ctx) if step.get("link") else ""
                stats = sms_stats(step.get("text", ""))
                sms_render(step.get("text", ""), ctx)
                row.update(sms_text=step.get("text", ""), sms_link=link, sms_chars_est=stats["chars"],
                           sms_segments=stats["segments"])
                entry.update(text=step.get("text", ""), link=link, media=step.get("media"), **{k: stats[k] for k in ("chars", "segments", "encoding")})
                deck.append(f"> {step.get('text', '')}\n\n_{stats['chars']} chars (est.) · {stats['segments']} segment(s) · {stats['encoding']} · link: {step.get('link', '—')}_\n")
                if step.get("media"):
                    deck.append(f"_MMS image: {step['media']}_\n")
                texts = [step.get("text", "")]

            tokens = sorted(ctx.tokens - {"unsubscribe", "manage_preferences", "organization.name", "organization.full_address"})
            row["tokens"] = " ".join(tokens)
            entry["tokens"] = tokens
            for t in ctx.tokens:
                all_tokens.setdefault(t, set()).add(sid)
            for url in ctx.links:
                if is_token_url(url):
                    continue
                parts = urlsplit(url)
                if parts.hostname in SITE_HOSTS and (parts.path or "/") not in VERIFIED_PATHS:
                    unverified.setdefault(parts.path, set()).add(sid)
            hits = claims(texts)
            if hits:
                claim_hits[sid] = hits
            rows.append(row)
            vsteps.append(entry)

        viewer_flows.append({k: flow.get(k) for k in ("id", "code", "name", "phase", "priority_rank", "goal", "trigger",
                                                      "flow_filters", "exit_conditions", "smart_sending", "branches",
                                                      "kpis", "build_notes")}
                            | {"counts": {"email": n_email, "sms": n_sms}, "steps": vsteps,
                               "issues": results["flows"].get(flow["id"], [])})

    with (DIST / "build-sheet.csv").open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()) if rows else ["flow_id"])
        writer.writeheader()
        writer.writerows(rows)
    (DIST / "copy-deck.md").write_text("\n".join(deck), encoding="utf-8")

    # QA report
    errors = [(sid, i) for sid, lst in results["steps"].items() for i in lst if i["level"] == "error"]
    warns = [(sid, i) for sid, lst in results["steps"].items() for i in lst if i["level"] == "warn"]
    errors += [(i["id"], i) for i in sms_problems if i["level"] == "error"]
    warns += [(i["id"], i) for i in sms_problems if i["level"] == "warn"]
    flow_issues = [(fid, i) for fid, lst in results["flows"].items() for i in lst]
    qa = [f"# QA report\n", f"Generated by `build.py`. {len(flows)} flows, {len(rows)} messages.\n",
          f"**{len(errors)} errors · {len(warns)} warnings · {len(unverified)} unverified links · "
          f"{sum(1 for v in claim_hits.values() for h in v if not h['verified'])} claims to verify**\n"]
    qa.append("## Errors\n")
    qa += [f"- `{sid}` {i['msg']}" for sid, i in errors + [(f, i) for f, i in flow_issues if i["level"] == "error"]] or ["None."]
    qa.append("\n## Warnings\n")
    qa += [f"- `{sid}` {i['msg']}" for sid, i in warns + [(f, i) for f, i in flow_issues if i["level"] == "warn"]] or ["None."]
    qa.append("\n## Links to verify\n\nThese on-site paths are not on the verified list in build.py. Open each one; fix the JSON or add the path to VERIFIED_PATHS.\n")
    qa += [f"- `{path}` — used in {', '.join(sorted(ids))}" for path, ids in sorted(unverified.items())] or ["None."]
    qa.append("\n## Claims to verify\n\nPhrases that read as a promise (shipping, lead time, ratings, material performance) and do not match a verified fact. Confirm each is true and current.\n")
    open_claims = [(sid, h) for sid, hits in claim_hits.items() for h in hits if not h["verified"]]
    qa += [f"- `{sid}` {h['text']}" for sid, h in open_claims] or ["None."]
    qa.append("\n## Claims that match verified facts\n\nListed for a final spot-check against the live site before launch.\n")
    done_claims = [(sid, h) for sid, hits in claim_hits.items() for h in hits if h["verified"]]
    qa += [f"- `{sid}` {h['text']}" for sid, h in done_claims] or ["None."]
    qa.append("\n## Tokens to map\n\n| Token | Used in | Map to |\n|---|---|---|")
    to_confirm = {c["token"]: c for c in program.get("to_confirm", [])}
    for t in sorted(all_tokens):
        mapping = TOKEN_MAPPING.get(t) or (f"Business decision: {to_confirm[t]['question']}" if t in to_confirm else "Static value: replace before launch.")
        qa.append(f"| `{t}` | {len(all_tokens[t])} messages | {mapping} |")
    (DIST / "qa-report.md").write_text("\n".join(qa) + "\n", encoding="utf-8")

    # Viewer
    token_table = []
    for t in sorted(all_tokens):
        if t in ("unsubscribe", "manage_preferences", "organization.name", "organization.full_address"):
            continue
        token_table.append({"token": t, "count": len(all_tokens[t]),
                            "mapping": TOKEN_MAPPING.get(t, ""), "confirm": t in to_confirm})
    data = {
        "program": program,
        "flows": viewer_flows,
        "tokens": token_table,
        "samples": TOKEN_SAMPLES,
        "sms": sms_data,
        "qa": {
            "errors": [{"id": sid, "msg": i["msg"]} for sid, i in errors],
            "warnings": [{"id": sid, "msg": i["msg"]} for sid, i in warns],
            "unverified": [{"path": p, "ids": sorted(ids)} for p, ids in sorted(unverified.items())],
            "claims": [{"id": sid, "hits": hits} for sid, hits in claim_hits.items()],
        },
    }
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    page = VIEWER.replace("__DATA__", payload)
    (DIST / "flow-map.html").write_text("<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
                                        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n"
                                        "</head>\n<body>\n" + page + "\n</body>\n</html>\n", encoding="utf-8")
    (DIST / "flow-map.artifact.html").write_text(page, encoding="utf-8")
    return len(rows), errors, warns, unverified, claim_hits


def build_sms_program(sms: dict, flows: list[dict]) -> tuple[dict, list[dict]]:
    """Validate data/sms.json, write dist/sms-playbook.md, return viewer data and issues."""
    all_issues: list[dict] = []
    systems, campaigns, flow_texts = [], [], []
    for msg in sms.get("system_messages", []):
        mode = "confirmation" if msg["id"] in ("SYS-DOI", "SYS-JOIN", "SYS-START") else "system"
        issues = sms_issues(msg.get("text", ""), None, mode)
        if mode == "confirmation" and msg["id"] == "SYS-DOI":
            issues = [i for i in issues if "HELP" not in i["msg"]]  # the DOI prompt only asks for Y
        all_issues += [{"id": msg["id"], **i} for i in issues]
        systems.append({**msg, **sms_stats(msg.get("text", "")), "issues": issues})
    for camp in sms.get("campaigns", []):
        fake_flow, fake_step = {"id": "sms-campaign"}, {"id": camp["id"]}
        ctx = Ctx(fake_flow, fake_step, "raw", "sms")
        link = track(camp["link"], ctx) if camp.get("link") else ""
        issues = sms_issues(camp.get("text", ""), camp.get("link"), "marketing")
        all_issues += [{"id": camp["id"], **i} for i in issues]
        campaigns.append({**camp, "link": link, **sms_stats(camp.get("text", "")), "issues": issues})
    for flow in flows:
        for step in sorted(flow["steps"], key=lambda s: s.get("offset_hours", 0)):
            if step.get("channel") == "sms":
                flow_texts.append({"flow": flow["id"], "flow_name": flow["name"], "id": step["id"],
                                   "timing": step.get("timing", ""), "condition": step.get("condition", ""),
                                   "text": step.get("text", ""), **sms_stats(step.get("text", ""))})

    md = ["# SMS playbook \u2014 copy\n",
          "Generated by `build.py` from `data/sms.json` and the flow files. Edit those, not this file. "
          "Character counts use sample token values and a 23-character short link.\n",
          "## Consent disclosure\n", "Use this under every web opt-in that says \"full\". Have counsel approve it before launch.\n",
          "> " + sms.get("disclosure", "") + "\n", "## Opt-in placements\n"]
    for pl in sms.get("consent_placements", []):
        disclosure = sms.get("disclosure", "") if pl.get("disclosure") == "full" else pl.get("disclosure", "")
        md.append(f"### {pl['placement']}\n\n*{pl.get('where', '')}*\n")
        md.append(f"- **Headline:** {pl.get('headline', '')}")
        if pl.get("body"):
            md.append(f"- **Body:** {pl['body']}")
        if pl.get("button"):
            md.append(f"- **Button:** {pl['button']}" + (f" \u00b7 **Decline:** {pl['decline']}" if pl.get("decline") else ""))
        md.append(f"- **Disclosure:** {disclosure}")
        md.append(f"- **Target:** {pl.get('target', '')}\n")
    md.append("## System replies\n")
    for m in systems:
        md.append(f"### {m['id']} \u00b7 {m['name']}\n\n*{m.get('when', '')}*\n\n> {m['text']}\n\n"
                  f"_{m['chars']} chars \u00b7 {m['segments']} segment(s) \u00b7 {m['encoding']}_\n")
    md.append("## Automated texts in flows\n\n| ID | Flow | Timing | Chars | Segments |\n|---|---|---|---|---|")
    for t in flow_texts:
        md.append(f"| {t['id']} | {t['flow_name']} | {t['timing']} | {t['chars']} | {t['segments']} |")
    md.append("\nFull text for each is in `copy-deck.md` and `build-sheet.csv`.\n")
    md.append("## Campaign calendar\n")
    for c in campaigns:
        md.append(f"### {c['date']} ({c['day']}, {c.get('send', '')}) \u00b7 {c['name']}\n\n**Audience:** {c.get('audience', '')}\n\n> {c['text']}\n\n"
                  f"_{c['chars']} chars \u00b7 {c['segments']} segment(s) \u00b7 link: {c['link']}_\n")
        if c.get("media"):
            md.append(f"_MMS image: {c['media']}_\n")
        if c.get("notes"):
            md.append(f"Note: {c['notes']}\n")
    (DIST / "sms-playbook.md").write_text("\n".join(md), encoding="utf-8")
    data = {"disclosure": sms.get("disclosure", ""), "placements": sms.get("consent_placements", []),
            "system": systems, "campaigns": campaigns, "flow_texts": flow_texts}
    return data, all_issues


def main() -> int:
    program = json.loads(PROGRAM_FILE.read_text(encoding="utf-8"))
    flows = []
    load_errors = []
    for path in sorted(FLOWS_DIR.glob("*.json")):
        try:
            flows.append(json.loads(path.read_text(encoding="utf-8")))
        except json.JSONDecodeError as exc:
            load_errors.append(f"{path.name}: {exc}")
    if load_errors:
        print("Could not parse:\n  " + "\n  ".join(load_errors))
        return 1
    flows.sort(key=lambda f: f.get("priority_rank", 99))

    results = {"steps": {}, "flows": {}}
    seen: set[str] = set()
    for flow in flows:
        results["flows"][flow.get("id", "?")] = check_flow(flow)
        for step in flow.get("steps", []):
            results["steps"][step.get("id", "?")] = check_step(flow, step, seen)

    DIST.mkdir(exist_ok=True)
    sms = json.loads(SMS_FILE.read_text(encoding="utf-8")) if SMS_FILE.exists() else {}
    program["to_confirm"] = program.get("to_confirm", []) + sms.get("to_confirm", [])
    sms_data, sms_problems = build_sms_program(sms, flows)
    n, errors, warns, unverified, claim_hits = write_outputs(program, flows, results, sms_data, sms_problems)

    n_email = sum(1 for f in flows for s in f["steps"] if s.get("channel") == "email")
    n_sms = n - n_email
    print(f"Built {len(flows)} flows, {n} messages ({n_email} email, {n_sms} SMS) -> {DIST.relative_to(ROOT)}/")
    print(f"{len(errors)} errors, {len(warns)} warnings, {len(unverified)} unverified links, "
          f"{sum(1 for v in claim_hits.values() for h in v if not h['verified'])} claims to verify, "
          f"{sum(1 for v in claim_hits.values() for h in v if h['verified'])} matching verified facts (see dist/qa-report.md)")
    for sid, issue in errors:
        print(f"  ERROR {sid}: {issue['msg']}")
    return 1 if ("--strict" in sys.argv and errors) else 0


VIEWER = (ROOT / "viewer.html").read_text(encoding="utf-8") if (ROOT / "viewer.html").exists() else "__DATA__"

if __name__ == "__main__":
    sys.exit(main())
