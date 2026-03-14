#!/usr/bin/env python3
"""
patch.py — Remove configurações duplicadas do relatório (index.html)
Rode no terminal do VSCode: python3 patch.py
"""

import re, shutil, sys
from pathlib import Path

# ── Arquivo alvo ──────────────────────────────────────────────
TARGET = Path("index.html")   # ajuste se o nome for diferente
if not TARGET.exists():
    # tenta escala-hotel.html como fallback
    TARGET = Path("escala-hotel.html")
if not TARGET.exists():
    sys.exit("❌  Não encontrei index.html nem escala-hotel.html na pasta atual.")

# Backup
backup = TARGET.with_suffix(".bak.html")
shutil.copy(TARGET, backup)
print(f"✅  Backup criado: {backup.name}")

html = TARGET.read_text(encoding="utf-8")

# ══════════════════════════════════════════════════════════════
# 1. SUBSTITUIR BARRA DE CONFIG
#    Remove os inputs de salário e encargos — deixa só o status
#    de configuração + link para config.html
# ══════════════════════════════════════════════════════════════
OLD_CONFIGBAR = re.compile(
    r'<!-- CONFIG BAR -->.*?</div>\s*</div>\s*</div>',
    re.DOTALL
)

NEW_CONFIGBAR = """\
<!-- CONFIG BAR -->
<div class="config-bar">
  <div class="config-inner">

    <div class="cfg-status-group">
      <span class="cfg-lbl">🕐 Turnos:</span>
      <span class="cfg-badge" id="badge-morning">—</span>
      <span class="cfg-badge" id="badge-afternoon">—</span>
      <span class="cfg-badge night" id="badge-night">—</span>
    </div>

    <div class="cfg-sep"></div>

    <div class="cfg-status-group">
      <span class="cfg-lbl">👥 Equipe:</span>
      <span class="cfg-badge gio" id="badge-gio">Giovanna —</span>
      <span class="cfg-badge and" id="badge-and">Anderson —</span>
      <span class="cfg-badge gab" id="badge-gab">Gabriel —</span>
    </div>

    <div class="cfg-sep"></div>

    <div class="cfg-status-group">
      <span class="cfg-lbl">📋 Encargos:</span>
      <span class="cfg-badge" id="badge-enc">— %</span>
    </div>

    <div style="margin-left:auto">
      <a href="config.html" class="cfg-btn cfg-btn-settings">⚙️ Configurações</a>
    </div>

  </div>
</div>

<!-- Inputs ocultos — alimentados pelo JS via localStorage -->
<div style="display:none">
  <input id="s-gio"  type="number" value="1700">
  <input id="s-and"  type="number" value="2100">
  <input id="s-gab"  type="number" value="1800">
  <input id="s-free" type="number" value="250">
  <input id="s-int"  type="number" value="220">
  <input id="s-fds"  type="number" value="491">
  <input id="s-fds2" type="number" value="982">
  <input id="s-folg" type="number" value="1500">
  <input id="enc-inss" type="number" value="20">
  <input id="enc-rat"  type="number" value="2">
  <input id="enc-terc" type="number" value="5.8">
  <input id="enc-fgts" type="number" value="8">
  <input id="enc-fer"  type="number" value="11.11">
  <input id="enc-13"   type="number" value="8.33">
  <input id="enc-fp"   type="number" value="1.92">
  <input id="enc-not"  type="number" value="20">
</div>"""

count = len(OLD_CONFIGBAR.findall(html))
if count == 1:
    html = OLD_CONFIGBAR.sub(NEW_CONFIGBAR, html)
    print("✅  Config bar atualizada")
else:
    print(f"⚠️   Config bar: encontrei {count} ocorrências (esperava 1) — pulando")

# ══════════════════════════════════════════════════════════════
# 2. SUBSTITUIR BLOCO DE ENCARGOS EDITÁVEIS no relatório
#    Troca os inputs por uma tabela read-only + link para config
# ══════════════════════════════════════════════════════════════
OLD_ENCARGOS = re.compile(
    r'<div class="encargos-wrap">.*?</div>\s*</div>',  # fecha encargos-wrap
    re.DOTALL
)

NEW_ENCARGOS = """\
<div class="encargos-wrap">
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px">
    <h3 style="margin:0">📊 Encargos Patronais</h3>
    <a href="config.html" class="cfg-btn cfg-btn-settings" style="font-size:.78rem">⚙️ Editar em Configurações</a>
  </div>
  <div id="enc-readonly-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px"></div>
  <div class="enc-total-row" style="margin-top:10px">
    <span class="text-muted">Total encargos sobre salário bruto:</span>
    <span class="mono text-gold bold" id="enc-total-pct">—%</span>
  </div>
</div>"""

# Precisa ser cuidadoso — só queremos substituir o bloco dentro do salary-section
# Busca a primeira ocorrência (que é a do relatório)
m = OLD_ENCARGOS.search(html)
if m:
    html = html[:m.start()] + NEW_ENCARGOS + html[m.end():]
    print("✅  Bloco de encargos substituído por read-only")
else:
    print("⚠️   Bloco de encargos não encontrado — pulando")

# ══════════════════════════════════════════════════════════════
# 3. INJETAR CSS extra no <style> existente
# ══════════════════════════════════════════════════════════════
CSS_EXTRA = """
/* ── CONFIG BAR v2 ── */
.cfg-status-group{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.cfg-badge{
  display:inline-block;padding:3px 9px;border-radius:12px;
  font-size:.74rem;font-weight:600;font-family:'DM Mono',monospace;
  background:rgba(79,143,224,.1);border:1px solid rgba(79,143,224,.2);color:var(--blue2);
}
.cfg-badge.gio{background:rgba(224,122,122,.1);border-color:rgba(224,122,122,.25);color:var(--gio)}
.cfg-badge.and{background:rgba(80,144,224,.1);border-color:rgba(80,144,224,.25);color:var(--and)}
.cfg-badge.gab{background:rgba(78,200,148,.1);border-color:rgba(78,200,148,.25);color:var(--gab)}
.cfg-badge.night{background:rgba(78,200,148,.08);border-color:rgba(78,200,148,.2);color:var(--gab)}
.cfg-btn-settings{
  padding:6px 14px;border-radius:7px;border:1px solid var(--border2);
  background:rgba(212,168,75,.1);color:var(--gold2);font-size:.8rem;
  font-weight:600;cursor:pointer;transition:all .18s;text-decoration:none;
  font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:5px;
}
.cfg-btn-settings:hover{background:rgba(212,168,75,.2);border-color:var(--gold2)}
/* Enc readonly grid */
.enc-ro-card{
  background:var(--bg3);border:1px solid var(--border);border-radius:7px;
  padding:8px 12px;display:flex;flex-direction:column;gap:2px;
}
.enc-ro-label{font-size:.68rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.04em}
.enc-ro-val{font-family:'DM Mono',monospace;font-size:.9rem;color:var(--text);font-weight:500}
"""

# Injeta antes do </style> final
html = html.replace("</style>", CSS_EXTRA + "\n</style>", 1)
print("✅  CSS extra injetado")

# ══════════════════════════════════════════════════════════════
# 4. ATUALIZAR JS inline (sync badges + enc-readonly)
#    Injeta uma chamada updateConfigBadges() no init()
# ══════════════════════════════════════════════════════════════
JS_BADGES = """
// injected by patch.py — sincroniza badges e encargos read-only
function updateConfigBadges() {
  const cfg = _cfg || {};
  const s = cfg.salaries || {};
  const c = cfg.charges  || {};
  const ms  = cfg.morningStart   ?? 7;
  const as_ = cfg.afternoonStart ?? 15;
  const ns  = cfg.nightStart     ?? 19;
  const pad = h => { h=((h%24)+24)%24; return h<10?'0'+h:''+h; };
  const fmt = v => 'R$\\u00a0'+Math.round(v).toLocaleString('pt-BR');
  const setEl = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };

  setEl('badge-morning',   pad(ms)+'h–'+pad(as_)+'h Manhã');
  setEl('badge-afternoon', pad(as_)+'h–'+pad(ns)+'h Tarde');
  setEl('badge-night',     pad(ns)+'h–'+pad(ms)+'h(+1) Noite');
  setEl('badge-gio',  'Giovanna '  + fmt(s.giovanna  || 1700));
  setEl('badge-and',  'Anderson '  + fmt(s.anderson  || 2100));
  setEl('badge-gab',  'Gabriel '   + fmt(s.gabriel   || 1800));

  const enc = c;
  const total = (enc.inss||20)+(enc.rat||2)+(enc.terceiros||5.8)+(enc.fgts||8)
              + (enc.ferias||11.11)+(enc.decimo||8.33)+(enc.fgtsProv||1.92);
  setEl('badge-enc', total.toFixed(1)+'% encargos');

  // Readonly encargos grid
  const grid = document.getElementById('enc-readonly-grid');
  if (!grid) return;
  const fields = [
    ['INSS Patronal', enc.inss||20,'%'],
    ['RAT', enc.rat||2,'%'],
    ['Terceiros', enc.terceiros||5.8,'%'],
    ['FGTS', enc.fgts||8,'%'],
    ['Prov. Férias+1/3', enc.ferias||11.11,'%'],
    ['Prov. 13°', enc.decimo||8.33,'%'],
    ['FGTS s/ prov.', enc.fgtsProv||1.92,'%'],
    ['Adic. Noturno', enc.noturno||20,'%'],
  ];
  grid.innerHTML = fields.map(([lbl,val,unit]) =>
    `<div class="enc-ro-card">
      <span class="enc-ro-label">${lbl}</span>
      <span class="enc-ro-val">${(+val).toFixed(2)}${unit}</span>
    </div>`
  ).join('');
}
"""

# Injeta o JS antes do </script> final
if "</script>" in html:
    idx = html.rfind("</script>")
    html = html[:idx] + JS_BADGES + "\n</script>" + html[idx+9:]
    print("✅  JS de badges injetado")

# Chama updateConfigBadges() dentro do init()
html = html.replace(
    "  renderGantts();\n  recalcAll();",
    "  updateConfigBadges();\n  renderGantts();\n  recalcAll();"
)

# ══════════════════════════════════════════════════════════════
# 5. GRAVAR
# ══════════════════════════════════════════════════════════════
TARGET.write_text(html, encoding="utf-8")
print(f"\n✅  {TARGET.name} atualizado com sucesso!")
print("   Para desfazer: copie o conteúdo de", backup.name)
