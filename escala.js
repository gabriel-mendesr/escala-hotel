/* ============================================================
   escala.js — Hotel 24/7 · v5 · 2026
   Lê configurações do localStorage (salvas em config.html).
   Todas as funções usadas no HTML estão expostas em window.
   ============================================================ */

// ── CONFIG ────────────────────────────────────────────────────
var STORE_KEY = 'hotel_escala_config';
var CFG = {
  morningStart: 7, afternoonStart: 15, nightStart: 19,
  salaries: {
    giovanna: 1700, anderson: 2100, gabriel: 1800, folguista: 1500,
    freelancer: 250, intermitente: 220, fdsDay: 491, fdsNight: 982
  },
  charges: {
    inss: 20, rat: 2, terceiros: 5.8, fgts: 8,
    ferias: 11.11, decimo: 8.33, fgtsProv: 1.92, noturno: 20
  }
};

function loadCFG() {
  try {
    var r = localStorage.getItem(STORE_KEY);
    if (r) CFG = JSON.parse(r);
  } catch (e) { /* mantém defaults */ }
}

// ── UTILS ─────────────────────────────────────────────────────
function gi(id) { return document.getElementById(id); }
function ph(h)  { h = ((h % 24) + 24) % 24; return (h < 10 ? '0' : '') + h; }
function fm(v)  { return 'R$\u00a0' + Math.round(+v || 0).toLocaleString('pt-BR'); }
function se(id, v) { var e = gi(id); if (e) e.textContent = v; }
function sf(id, v) { se(id, fm(v)); }
function sv(id, v) { var e = gi(id); if (e) e.value = v; }

// ── SHIFT CONFIG ──────────────────────────────────────────────
function SC() {
  var ms = +CFG.morningStart   || 7;
  var as = +CFG.afternoonStart || 15;
  var ns = +CFG.nightStart     || 19;
  return {
    ms: ms, as: as, ns: ns,
    lM: ph(ms) + 'h–' + ph(as) + 'h',
    lA: ph(as) + 'h–' + ph(ns) + 'h',
    lN: ph(ns) + 'h–' + ph(ms) + 'h (+1 dia)',
    lD: ph(ms) + 'h–' + ph(ns) + 'h (' + (ns - ms) + 'h)',
    nDur: (ms + 24) - ns
  };
}

// ── SALARIES & CHARGES ────────────────────────────────────────
function SAL() {
  var s = CFG.salaries || {};
  function lv(id, key, def) {
    var e = gi(id);
    return (e && +e.value) ? +e.value : (+s[key] || def);
  }
  return {
    gio:  lv('s-gio',  'giovanna',    1700),
    and:  lv('s-and',  'anderson',    2100),
    gab:  lv('s-gab',  'gabriel',     1800),
    free: lv('s-free', 'freelancer',  250),
    int:  lv('s-int',  'intermitente',220),
    fds:  lv('s-fds',  'fdsDay',      491),
    fds2: lv('s-fds2', 'fdsNight',    982),
    folg: lv('s-folg', 'folguista',   1500)
  };
}

function ENC() {
  var c = CFG.charges || {};
  function g(k, d) { return +c[k] || d; }
  var inss = g('inss', 20), rat = g('rat', 2), terc = g('terceiros', 5.8), fgts = g('fgts', 8);
  var fer = g('ferias', 11.11), e13 = g('decimo', 8.33), fp = g('fgtsProv', 1.92), not = g('noturno', 20);
  return {
    inss: inss, rat: rat, terc: terc, fgts: fgts,
    fer: fer, e13: e13, fp: fp, not: not,
    emp: inss + rat + terc + fgts,
    prov: fer + e13 + fp,
    total: inss + rat + terc + fgts + fer + e13 + fp
  };
}

// ── SYNC HIDDEN INPUTS ────────────────────────────────────────
function syncInputs() {
  var sal = SAL(), enc = ENC(), sc = SC();
  sv('s-gio',  sal.gio);  sv('s-and', sal.and);  sv('s-gab',  sal.gab);
  sv('s-free', sal.free); sv('s-int', sal.int);
  sv('s-fds',  sal.fds);  sv('s-fds2',sal.fds2); sv('s-folg', sal.folg);
  sv('enc-inss', enc.inss); sv('enc-rat',  enc.rat);  sv('enc-terc', enc.terc);
  sv('enc-fgts', enc.fgts); sv('enc-fer',  enc.fer);  sv('enc-13',   enc.e13);
  sv('enc-fp',   enc.fp);   sv('enc-not',  enc.not);
  // Chips da config bar
  se('b-morn',  ph(sc.ms) + 'h – ' + ph(sc.as) + 'h  (Manhã)');
  se('b-aft',   ph(sc.as) + 'h – ' + ph(sc.ns) + 'h  (Tarde)');
  se('b-night', ph(sc.ns) + 'h – ' + ph(sc.ms) + 'h  (Noite)');
  se('b-gio',   'Giovanna  ' + fm(sal.gio));
  se('b-and',   'Anderson  ' + fm(sal.and));
  se('b-gab',   'Gabriel   ' + fm(sal.gab));
  se('b-enc',   enc.total.toFixed(1) + '%  total de encargos');
}

// ── EMPLOYEE COST ─────────────────────────────────────────────
function empCost(sal, hePct, noturno) {
  var enc = ENC();
  var adicHE  = sal * (hePct / 100);
  var adicNot = noturno ? sal * (enc.not / 100) : 0;
  var gross   = sal + adicHE + adicNot;
  var encV    = gross * (enc.emp  / 100);
  var provV   = gross * (enc.prov / 100);
  return { base: sal, adicHE: adicHE, adicNot: adicNot, gross: gross,
           encV: encV, provV: provV, total: gross + encV + provV };
}

// ── CELL FACTORIES ────────────────────────────────────────────
// Cores vibrantes com bom contraste em fundo claro
var C = {
  gio:  '#b84040',  // vermelho escuro
  and:  '#1a6fc4',  // azul
  gab:  '#1e8a4a',  // verde
  free: '#9a6e00',  // âmbar escuro
  folg: '#6b35a0',  // roxo
  fds:  '#0e7490',  // azul-petróleo
  warn: '#c0392b',  // vermelho
  x:    '#8888a0'   // cinza
};

function mk(nome, cor, regime, warn, faded, fullDay) {
  return {
    nome: nome, cor: cor, regime: regime || '',
    warn: !!warn, faded: !!faded, fullDay: !!fullDay
  };
}

// Funcionários
function GIO(regime)  { return mk('Giovanna',        C.gio,  regime); }
function AND(regime)  { return mk('Anderson',         C.and,  regime); }
function GAB(regime, warn) { return mk('Gabriel',     warn ? C.warn : C.gab, regime, warn); }
function FREE(regime) { return mk('Freelancer',       C.free, regime); }
function FOLG(regime) { return mk('Folguista',        C.folg, regime); }
function FDS_D(reg)   { return mk('Func. FDS Diurno', C.fds,  reg); }
function FDS_N(reg)   { return mk('Func. FDS Noturno',C.fds,  reg); }
function NOVO(reg)    { return mk('Novo Funcionário',  C.fds,  reg); }
function XEMP()       { return mk('Func. X (saindo)', C.x, 'Saindo em breve', false, true); }
var N = null; // célula vazia / vago

// Gabriel 12×36 Semana A: Dom(0) Ter(2) Qui(4) Sáb(6)
var GAB_A = [true, false, true, false, true, false, true];

// ── SCHEDULE DATA ─────────────────────────────────────────────
// Ordem das colunas: 0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sáb
function buildScenarios() {
  return {
    atual: {
      morning:   [N,    GIO('6×1'), GIO('6×1'), GIO('6×1'), GIO('6×1'), GIO('6×1'), GIO('6×1')],
      afternoon: [N,    AND('6×1'), AND('6×1'), AND('6×1'), AND('6×1'), AND('6×1'), AND('6×1')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : XEMP(); })
    },
    s1: {
      morning:   [FREE('Fim de semana'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), FREE('Fim de semana')],
      afternoon: [FREE('Fim de semana'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), FREE('Fim de semana')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },
    s2: {
      // fullDay = true → célula ocupa manhã+tarde (rowspan 2)
      morning: [
        mk('Giovanna',C.gio,'12×36 Diurno',false,false,true),
        mk('Anderson', C.and,'12×36 Diurno',false,false,true),
        mk('Giovanna',C.gio,'12×36 Diurno',false,false,true),
        mk('Anderson', C.and,'12×36 Diurno',false,false,true),
        mk('Giovanna',C.gio,'12×36 Diurno',false,false,true),
        mk('Anderson', C.and,'12×36 Diurno',false,false,true),
        mk('Anderson', C.and,'12×36 Diurno',false,false,true)
      ],
      afternoon: [N,N,N,N,N,N,N], // preenchido pelo rowspan acima
      night: GAB_A.map(function(g) { return g ? GAB('12×36') : NOVO('12×36 Noturno'); })
    },
    s3: {
      morning:   [N,    GIO('6×1'), GIO('6×1'), GIO('6×1'), GIO('6×1'), GIO('6×1'), GIO('6×1')],
      afternoon: [AND('Revezamento'), AND('6×1'), AND('6×1'), AND('6×1'), AND('6×1'), AND('6×1'), N],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },
    s4: {
      morning:   [FREE('Fim de semana'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), FREE('Fim de semana')],
      afternoon: [FREE('Fim de semana'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), FREE('Fim de semana')],
      night: [
        FREE('Fim de semana'),
        GAB('⚠ 60h/sem. — ILEGAL', true),
        GAB('⚠ Excede limite CLT',  true),
        GAB('⚠ Excede limite CLT',  true),
        GAB('⚠ Excede limite CLT',  true),
        GAB('⚠ Excede limite CLT',  true),
        FREE('Fim de semana')
      ]
    },
    s5: {
      morning:   [FREE('Domingo'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), AND('Banco de horas')],
      afternoon: [FREE('Domingo'), AND('6×1'), AND('6×1'), AND('6×1'), AND('6×1'), AND('6×1'), AND('6×1')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },
    s6: {
      morning: [
        N,
        GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'),
        mk('Func. FDS Diurno', C.fds, 'Sábado 12h — T. Parcial', false, false, true)
      ],
      afternoon: [N, AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), N],
      night: GAB_A.map(function(g, i) {
        if (i === 6) return FDS_N('Sábado noite — T. Parcial');
        if (i === 0) return FDS_N('Domingo noite — T. Parcial');
        return g ? GAB('12×36') : FREE('Cobertura noturna');
      })
    },
    sg: {
      morning:   [N,        GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), FOLG('Fim de semana')],
      afternoon: [FOLG('Fim de semana'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    }
  };
}

// ── LEGEND DATA ───────────────────────────────────────────────
var LEGS = {
  base:  [{n:'Giovanna (5×2)',           c:C.gio}, {n:'Anderson (5×2)',           c:C.and}, {n:'Gabriel (12×36)',          c:C.gab}, {n:'Freelancer / PJ',           c:C.free}],
  atual: [{n:'Giovanna (6×1 Seg–Sáb)',   c:C.gio}, {n:'Anderson (6×1 Seg–Sáb)',   c:C.and}, {n:'Gabriel (12×36 Noturno)',  c:C.gab}, {n:'Func. X — saindo',           c:C.x}],
  s2:    [{n:'Giovanna (12×36 Diurno)',   c:C.gio}, {n:'Anderson (12×36 Diurno)',   c:C.and}, {n:'Gabriel (12×36 Noturno)',  c:C.gab}, {n:'Novo Funcionário (Noturno)', c:C.fds}],
  s3:    [{n:'Giovanna (6×1)',            c:C.gio}, {n:'Anderson (6×1)',            c:C.and}, {n:'Gabriel (12×36)',          c:C.gab}, {n:'Freelancer noturno',         c:C.free}],
  s4:    [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',            c:C.and}, {n:'Gabriel ⚠ ILEGAL',         c:C.warn},{n:'Freelancer',                  c:C.free}],
  s6:    [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',            c:C.and}, {n:'Gabriel (12×36)',          c:C.gab}, {n:'Func. FDS (Tempo Parcial)',   c:C.fds}, {n:'Freelancer (lacunas)',      c:C.free}],
  sg:    [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',            c:C.and}, {n:'Gabriel (12×36)',          c:C.gab}, {n:'Folguista (6×1)',             c:C.folg},{n:'Freelancer (noturno)',       c:C.free}]
};

// ── TABLE BUILDER (innerHTML puro — mais robusto) ─────────────
var DAY_NAMES = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

function buildTable(tableId, legendId, sched, legKey) {
  var tableTarget = gi(tableId);
  var legEl   = gi(legendId);

  if (!tableTarget) {
    // Se o ID sumiu (devido ao bug de innerHTML), tentamos encontrar pelo seletor de classe no container
    // mas o ideal é garantir que o ID permaneça no re-render.
    return;
  }

  var sc = SC();

  // ── Legenda ──
  if (legEl) {
    var legItems = (LEGS[legKey] || []);
    legEl.innerHTML = legItems.map(function(l) {
      // Transformando legenda em mini-cards informativos
      var parts = l.n.split(' ');
      var name = parts.shift();
      var details = parts.join(' ');
      return '<div class="leg-card">' +
             '<div class="leg-dot" style="background:' + l.c + '"></div>' +
             '<div class="leg-info"><strong>' + name + '</strong><span>' + (details || 'Fixo') + '</span></div>' +
             '</div>';
    }).join('');
  }

  // ── Monta HTML da tabela como string ──
  // Importante: Manter o tableId aqui para que gi(tableId) funcione em renders futuros
  var html = '<table id="' + tableId + '" class="sched">';

  // Cabeçalho: linha com nomes dos dias
  html += '<thead><tr>';
  html += '<th style="background:var(--bg3);border:1px solid var(--bdr);min-width:92px"></th>';
  for (var di = 0; di < 7; di++) {
    html += '<th class="' + (di === 0 ? 'sun' : '') + '">' + DAY_NAMES[di] + '</th>';
  }
  html += '</tr></thead>';

  // Corpo
  html += '<tbody>';

  var rowKeys  = ['morning', 'afternoon', 'night'];
  var rowInfos = [
    { label: '☀️ Manhã', hours: sc.lM },
    { label: '🌆 Tarde',  hours: sc.lA },
    { label: '🌙 Noite',  hours: sc.lN }
  ];

  // Rastreia quais colunas foram consumidas por rowspan (fullDay)
  var colSpanned = [false, false, false, false, false, false, false];

  for (var ri = 0; ri < 3; ri++) {
    html += '<tr>';
    html += '<td class="shift-lbl"><span class="sl-name">' + rowInfos[ri].label + '</span><span class="sl-hours">' + rowInfos[ri].hours + '</span></td>';

    var rowData = sched[rowKeys[ri]] || [];

    for (var ci = 0; ci < 7; ci++) {
      // Pula colunas consumidas pelo rowspan de manhã
      if (ri === 1 && colSpanned[ci]) continue;

      var cell = rowData[ci] != null ? rowData[ci] : null;

      if (!cell) {
        // Vago / sem cobertura
        html += '<td class="sc sc-empty"><div class="sc-inner"><span class="sc-empty-lbl">Vago</span></div></td>';

      } else if (cell.fullDay && ri === 0) {
        // Turno de 12h diurno: ocupa manhã + tarde
        var opacity = cell.faded ? ' style="opacity:.5"' : '';
        html += '<td class="sc sc-tall' + (cell.warn ? ' sc-warn' : '') + '" rowspan="2" style="background:' + cell.cor + ';' + (cell.faded ? 'opacity:.5' : '') + '">';
        html += '<div class="sc-inner">';
        html += '<span class="sc-name">' + (cell.warn ? '⚠ ' : '') + cell.nome + '</span>';
        html += '<span class="sc-sub">' + sc.lD + '</span>';
        if (cell.regime) html += '<span class="sc-badge' + (cell.warn ? ' warn' : '') + '">' + cell.regime + '</span>';
        html += '</div></td>';
        colSpanned[ci] = true;

      } else {
        // Célula normal
        html += '<td class="sc' + (cell.warn ? ' sc-warn' : '') + '" style="background:' + cell.cor + ';' + (cell.faded ? 'opacity:.5' : '') + '">';
        html += '<div class="sc-inner">';
        html += '<span class="sc-name">' + (cell.warn ? '⚠ ' : '') + cell.nome + '</span>';
        if (cell.regime) html += '<span class="sc-badge' + (cell.warn ? ' warn' : '') + '">' + cell.regime + '</span>';
        html += '</div></td>';
      }
    }

    html += '</tr>';
  }

  html += '</tbody></table>';

  // Usamos outerHTML para substituir o placeholder/tabela antiga preservando a estrutura
  tableTarget.outerHTML = html;
}

// ── RENDER ALL TABLES ─────────────────────────────────────────
function renderAll() {
  var sc = buildScenarios();
  buildTable('gantt-atual', 'leg-atual', sc.atual, 'atual');
  buildTable('gantt-s1',    'leg-s1',   sc.s1,    'base');
  buildTable('gantt-s2',    'leg-s2',   sc.s2,    's2');
  buildTable('gantt-s3',    'leg-s3',   sc.s3,    's3');
  buildTable('gantt-s4',    'leg-s4',   sc.s4,    's4');
  buildTable('gantt-s5',    'leg-s5',   sc.s5,    'base');
  buildTable('gantt-s6',    'leg-s6',   sc.s6,    's6');
  buildTable('gantt-sg',    'leg-sg',   sc.sg,    'sg');
}

// ── LABEL UPDATES ─────────────────────────────────────────────
function updateLabels() {
  var s = SC();
  se('lbl-gio-a', s.lM); se('lbl-and-a', s.lA); se('lbl-gab-a', s.lN);
  var pairs = [
    ['la-gio-s1',s.lM],['la-and-s1',s.lA],['la-gab-s1',s.lN],
    ['la-gio-s2',s.lD],['la-and-s2',s.lD],['la-gab-s2',s.lN],['la-new-s2',s.lN],
    ['la-gio-s3',s.lM],['la-and-s3',s.lA],['la-gab-s3',s.lN],
    ['la-gio-s5',s.lM],['la-and-s5',s.lA],['la-gab-s5',s.lN],
    ['la-gio-s6',s.lM],['la-and-s6',s.lA],['la-gab-s6',s.lN],
    ['la-gio-sg',s.lM],['la-and-sg',s.lA],['la-gab-sg',s.lN]
  ];
  for (var i = 0; i < pairs.length; i++) se(pairs[i][0], pairs[i][1]);
}

// ── TAB SWITCHING ─────────────────────────────────────────────
function showTab(id) {
  var panels = document.querySelectorAll('.panel');
  var tabs   = document.querySelectorAll('.tab');
  for (var i = 0; i < panels.length; i++) panels[i].classList.remove('active');
  for (var i = 0; i < tabs.length;   i++) tabs[i].classList.remove('active');
  var panel = gi('panel-' + id);
  var tab   = gi('t-' + id);
  if (panel) panel.classList.add('active');
  if (tab)   tab.classList.add('active');
}

// ── SALARY CARDS ──────────────────────────────────────────────
function buildSalCards() {
  var sal = SAL(), enc = ENC();
  var emps = [
    { name:'Giovanna', color:'var(--gio)', sal:sal.gio, regime:'6×1 CLT',       hePct:11.8, noturno:false },
    { name:'Anderson', color:'var(--and)', sal:sal.and, regime:'6×1 CLT',       hePct:11.8, noturno:false },
    { name:'Gabriel',  color:'var(--gab)', sal:sal.gab, regime:'12×36 Noturno', hePct:0,    noturno:true  }
  ];
  var cards = '', rows = '';
  for (var i = 0; i < emps.length; i++) {
    var e = emps[i];
    var c = empCost(e.sal, e.hePct, e.noturno);
    cards += '<div class="emp-card">' +
      '<div class="emp-card-hd"><div class="dot" style="background:' + e.color + '"></div>' +
      '<div><div style="font-weight:600;font-size:.86rem">' + e.name + '</div>' +
      '<div style="font-size:.7rem;color:var(--tx3)">' + e.regime + '</div></div></div>' +
      '<div class="emp-card-bd">' +
      '<div class="calc-row"><span class="lbl">Salário base</span><span class="val">' + fm(c.base) + '</span></div>' +
      (c.adicHE > 0 ? '<div class="calc-row"><span class="lbl">Horas extras (~' + e.hePct + '%)</span><span class="val">' + fm(c.adicHE) + '</span></div>' : '') +
      (c.adicNot > 0 ? '<div class="calc-row"><span class="lbl">Adicional noturno (' + enc.not + '%)</span><span class="val" style="color:var(--orange)">' + fm(c.adicNot) + '</span></div>' : '') +
      '<div class="calc-row total"><span class="lbl">Salário bruto</span><span class="val">' + fm(c.gross) + '</span></div>' +
      '<div class="calc-row enc"><span class="lbl">+ Encargos (' + enc.emp.toFixed(1) + '%)</span><span class="val">' + fm(c.encV) + '</span></div>' +
      '<div class="calc-row enc"><span class="lbl">+ Provisões (' + enc.prov.toFixed(2) + '%)</span><span class="val">' + fm(c.provV) + '</span></div>' +
      '<div class="calc-row total"><span class="lbl">CUSTO TOTAL / MÊS</span><span class="val">' + fm(c.total) + '</span></div>' +
      '</div></div>';
    rows += '<tr><td style="color:' + e.color + ';font-weight:600">' + e.name + '</td>' +
      '<td>' + e.regime + '</td>' +
      '<td class="mono">' + fm(c.base) + '</td>' +
      '<td class="mono" style="color:var(--orange)">' + fm(c.adicHE + c.adicNot) + '</td>' +
      '<td class="mono">' + fm(c.encV) + '</td>' +
      '<td class="mono">' + fm(c.provV) + '</td>' +
      '<td class="mono" style="font-weight:700">' + fm(c.total) + '</td></tr>';
  }
  var ce = gi('emp-cards'), se2 = gi('sal-summary');
  if (ce)  ce.innerHTML  = cards;
  if (se2) se2.innerHTML = rows;
}

// ── ENCARGOS READ-ONLY ────────────────────────────────────────
function buildEncGrid() {
  var enc  = ENC();
  var grid = gi('enc-ro-grid');
  if (!grid) return;
  var fields = [
    ['INSS Patronal',    enc.inss],
    ['RAT',              enc.rat],
    ['Terceiros',        enc.terc],
    ['FGTS',             enc.fgts],
    ['Provisão Férias+1/3', enc.fer],
    ['Provisão 13°',     enc.e13],
    ['FGTS s/ provisões',enc.fp],
    ['Adicional Noturno',enc.not]
  ];
  var html = '';
  for (var i = 0; i < fields.length; i++) {
    html += '<div class="enc-card"><span class="el">' + fields[i][0] + '</span>' +
            '<span class="ev">' + (+fields[i][1]).toFixed(2) + '%</span></div>';
  }
  grid.innerHTML = html;
  se('enc-total-pct', enc.total.toFixed(1) + '%');
}

// ── COMPARISON TABLE ──────────────────────────────────────────
function buildCmpTable(c) {
  var rows = [
    { n:'0 · Situação Atual',           fx:4, ex:'—',                dom:'❌', he:'Gio + And (hora extra)', c:c.c0, clt:'⚠ HE',       risk:'Médio'},
    { n:'A · 5×2 + Freelancer',          fx:3, ex:'~32 diárias/mês', dom:'✅', he:'Nenhuma',               c:c.s1, clt:'✅ (PJ⚠)',   risk:'Baixo'},
    { n:'B · 12×36 Universal',           fx:4, ex:'—',                dom:'✅', he:'Nenhuma',               c:c.s2, clt:'✅ Perfeito', risk:'Mínimo'},
    { n:'C · Revezamento 6×1',           fx:3, ex:'~15 noites/mês',  dom:'✅', he:'Banco de horas',        c:c.s3, clt:'⚠ B.Horas', risk:'Baixo'},
    { n:'D · Gabriel Seg–Sex Noite ⚠',   fx:3, ex:'~24 diárias/mês', dom:'✅', he:'ILEGAL (60h/sem.)',     c:c.s4, clt:'🚨 ILEGAL',  risk:'ALTO',  bad:true},
    { n:'E · Misto Recomendado ⭐',       fx:3, ex:'~21 diárias/mês', dom:'✅', he:'Anderson (B.Horas)',   c:c.s5, clt:'✅ (B.H⚠)',  risk:'Baixo', rec:true},
    { n:'F · Intermediários 12h FDS ⭐',  fx:5, ex:'2 intermediários',dom:'✅', he:'Nenhuma',               c:c.s6, clt:'✅ Perfeito', risk:'Mínimo',rec:true},
    { n:'G · Folguista Coringa ⭐',       fx:4, ex:'~12 noites/mês',  dom:'✅', he:'Folguista (B.Horas)',  c:c.sg, clt:'✅ (B.H)',    risk:'Mínimo',rec:true}
  ];

  var totals = rows.map(function(r) { return (r.c.fix || 0) + (r.c.free || 0); });
  var minT   = Infinity;
  for (var i = 0; i < rows.length; i++) {
    if (!rows[i].bad && totals[i] < minT) minT = totals[i];
  }

  var tbody = gi('cmp-body');
  if (!tbody) return;

  var html = '';
  for (var i = 0; i < rows.length; i++) {
    var r   = rows[i];
    var tot = totals[i];
    var rowClass = r.rec ? 'rec' : r.bad ? 'bad' : '';
    var valClass = (tot === minT && !r.bad) ? ' best' : (r.bad ? ' worst' : '');
    html += '<tr class="' + rowClass + '">' +
      '<td><strong>' + r.n + '</strong></td>' +
      '<td class="center">' + r.fx + '</td>' +
      '<td style="font-size:.76rem">' + r.ex + '</td>' +
      '<td class="center">' + r.dom + '</td>' +
      '<td style="font-size:.76rem">' + r.he + '</td>' +
      '<td class="mono">' + fm(r.c.fix || 0) + '</td>' +
      '<td class="mono">' + (r.c.free > 0 ? fm(r.c.free) : '—') + '</td>' +
      '<td class="mono' + valClass + '">' + fm(tot) + '</td>' +
      '<td style="text-align:center;font-size:.76rem">' + r.clt + '</td>' +
      '<td style="text-align:center;font-size:.76rem">' + r.risk + '</td>' +
      '</tr>';
  }
  tbody.innerHTML = html;
}

// ── MAIN COST CALC ────────────────────────────────────────────
function calcAll() {
  var sal  = SAL(), enc = ENC(), sc = SC();
  var OVHD = 1 + enc.total / 100;
  var NOTT = 1 + enc.not   / 100;
  var HE   = 11.8;

  var gio6  = sal.gio  * OVHD * (1 + HE / 100);
  var and6  = sal.and  * OVHD * (1 + HE / 100);
  var gio5  = sal.gio  * OVHD;
  var and5  = sal.and  * OVHD;
  var gab   = sal.gab  * OVHD * NOTT;
  var nw    = sal.gab  * OVHD * NOTT;
  var fD    = sal.free;
  var fN    = sal.free * 1.4;
  var folg  = sal.folg * OVHD * (1 + HE / 100);
  var fdsD  = sal.fds  * OVHD;
  var fdsN  = sal.fds2 * OVHD * NOTT;

  var s1free = 4.33 * 4 * fD + 15 * fN;
  var s3free = 15 * fN;
  var gabHE  = sal.gab * OVHD * NOTT * 1.36;
  var s4free = 4.33 * 4 * fD + 8  * fN;
  var s5free = 4.33 * 2 * fD + 12 * fN;
  var s6gap  = 8  * fN;
  var sgfree = 12 * fN;

  sf('c0-gio', gio6);  sf('c0-and', and6);  sf('c0-gab', gab);   sf('c0-x',   gab);
  sf('c0-tot', gio6 + and6 + gab * 2);

  sf('c1-gio', gio5);  sf('c1-and', and5);  sf('c1-gab', gab);   sf('c1-free',s1free);
  sf('c1-tot', gio5 + and5 + gab + s1free);

  sf('c2-gio', gio5);  sf('c2-and', and5);  sf('c2-gab', gab);   sf('c2-new', nw);
  sf('c2-tot', gio5 + and5 + gab + nw);

  sf('c3-gio', gio6);  sf('c3-and', and6);  sf('c3-gab', gab);   sf('c3-free',s3free);
  sf('c3-tot', gio6 + and6 + gab + s3free);

  sf('c4-gio', gio5);  sf('c4-and', and5);  sf('c4-gab', gabHE); sf('c4-free',s4free);
  sf('c4-tot', gio5 + and5 + gabHE + s4free);

  sf('c5-gio', gio5);  sf('c5-and', and6);  sf('c5-gab', gab);   sf('c5-free',s5free);
  sf('c5-tot', gio5 + and6 + gab + s5free);

  sf('c6-gio', gio5);  sf('c6-and', and5);  sf('c6-gab', gab);
  sf('c6-fds', fdsD + fdsN);  sf('c6-free', s6gap);
  sf('c6-tot', gio5 + and5 + gab + fdsD + fdsN + s6gap);

  sf('cg-gio', gio5);  sf('cg-and', and5);  sf('cg-gab', gab);
  sf('cg-folg',folg);  sf('cg-free',sgfree);
  sf('cg-tot', gio5 + and5 + gab + folg + sgfree);

  // Análise CLT S6
  var interj   = sc.ns - sc.ms;
  var nightH   = Math.max(0, Math.min(sc.ms + 24, 29) - Math.max(sc.ns, 22));
  var okI      = interj >= 11;
  var el6      = gi('s6-clt-analysis');
  if (el6) {
    el6.innerHTML = '<div class="alert alert-' + (okI ? 'ok' : 'warn') + '">' +
      '<span class="ai">' + (okI ? '✅' : '⚠️') + '</span>' +
      '<div><strong>Verificação CLT para turnos ' + ph(sc.ms) + 'h / ' + ph(sc.ns) + 'h:</strong><br>' +
      'FDS Diurno: ' + (sc.ns - sc.ms) + 'h/semana ≤ 30h → <strong>' + (okI ? '✅ LEGAL' : '⚠ Revisar') + '</strong> (Art. 58-A + 59-A)<br>' +
      'FDS Noturno: ' + (sc.nDur * 2) + 'h/semana ≤ 30h → <strong>✅ LEGAL</strong> (Art. 58-A + 59-A)<br>' +
      'Interjornada Sáb→Dom noite: ' + interj + 'h ' + (okI ? '≥ 11h ✅' : '&lt; 11h ⚠ ILEGAL — ajuste em ⚙️ Configurações') + ' (Art. 66)<br>' +
      'Adicional noturno: ~' + nightH + 'h/turno × ' + enc.not + '% obrigatório (Art. 73)' +
      '</div></div>';
  }

  // Contratos
  sf('ct-fds-d', fdsD);
  sf('ct-fds-n', fdsN);
  sf('ct-int',   4.33 * 2 * sal.int);
  sf('ct-tmp',   4.33 * 2 * sal.free * 1.15);
  se('ct-night-hours', 'Art. 58-A + 59-A · ' + sc.nDur * 2 + 'h/semana');
  se('ct-night-hw',    sc.nDur * 2 + 'h ≤ 30h → ✅');
  se('ct-interj', interj + 'h entre turnos ' + (okI ? '≥ 11h ✅' : '⚠ Ajustar horário') + ' (Art. 66)');
  se('ct-noct',   '~' + nightH + 'h/turno × ' + enc.not + '% (Art. 73)');
  se('ct-night-status', okI ? '✅ LEGAL' : '⚠ ATENÇÃO');

  buildCmpTable({
    c0: { fix: gio6 + and6 + gab * 2,           free: 0      },
    s1: { fix: gio5 + and5 + gab,               free: s1free },
    s2: { fix: gio5 + and5 + gab + nw,          free: 0      },
    s3: { fix: gio6 + and6 + gab,               free: s3free },
    s4: { fix: gio5 + and5 + gabHE,             free: s4free },
    s5: { fix: gio5 + and6 + gab,               free: s5free },
    s6: { fix: gio5 + and5 + gab + fdsD + fdsN, free: s6gap  },
    sg: { fix: gio5 + and5 + gab + folg,        free: sgfree }
  });

  buildSalCards();
  buildEncGrid();
  updateLabels();
}

// ── INIT ──────────────────────────────────────────────────────
function init() {
  try {
    loadCFG();
    syncInputs();
    var d = new Date().toLocaleDateString('pt-BR');
    se('gen-date', d);
    se('footer-date', d);
    renderAll();
    calcAll();
  } catch (err) {
    console.error('Erro na inicialização da escala:', err);
  }
}

// ── EXPÕE FUNÇÕES GLOBALMENTE ─────────────────────────────────
// Necessário porque os onclick do HTML chamam diretamente
window.showTab = showTab;
window.init    = init;

document.addEventListener('DOMContentLoaded', init);
