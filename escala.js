/* ============================================================
   escala.js — Hotel 24/7 · v4 · 2026
   Self-contained. Reads from localStorage (set by config.html).
   ============================================================ */
'use strict';

// ── CONFIG ────────────────────────────────────────────────────
const STORE_KEY = 'hotel_escala_config';
let CFG = { morningStart:7, afternoonStart:15, nightStart:19,
  salaries:{ giovanna:1700, anderson:2100, gabriel:1800, folguista:1500,
    freelancer:250, intermitente:220, fdsDay:491, fdsNight:982 },
  charges:{ inss:20, rat:2, terceiros:5.8, fgts:8,
    ferias:11.11, decimo:8.33, fgtsProv:1.92, noturno:20 } };

function loadCFG() {
  try { const r = localStorage.getItem(STORE_KEY); if (r) CFG = JSON.parse(r); }
  catch(e) { /* use defaults */ }
}

// ── UTILS ─────────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const p  = h  => { h=((h%24)+24)%24; return (h<10?'0':'')+h; };
const fm = v  => 'R$\u00a0'+Math.round(+v||0).toLocaleString('pt-BR');
const se = (id,v) => { const e=$(id); if(e) e.textContent=v; };
const sf = (id,v) => se(id, fm(v));
const sv = (id,v) => { const e=$(id); if(e) e.value=v; };

// ── SHIFT CONFIG ──────────────────────────────────────────────
function shiftCfg() {
  const ms = +CFG.morningStart   || 7;
  const as = +CFG.afternoonStart || 15;
  const ns = +CFG.nightStart     || 19;
  return { ms, as, ns,
    lM: `${p(ms)}h–${p(as)}h`,
    lA: `${p(as)}h–${p(ns)}h`,
    lN: `${p(ns)}h–${p(ms)}h(+1)`,
    lD: `${p(ms)}h–${p(ns)}h (${ns-ms}h)`,
    mDur: as-ms, aDur: ns-as, nDur: (ms+24)-ns };
}

// ── SALARIES & CHARGES ────────────────────────────────────────
function SAL() {
  const s = CFG.salaries || {};
  // also read live inputs if they exist (for future inline editing)
  const lv = (id, def) => { const e=$(id); return e && +e.value ? +e.value : (s[def] || 0); };
  return {
    gio:  lv('s-gio',  'giovanna')    || 1700,
    and:  lv('s-and',  'anderson')    || 2100,
    gab:  lv('s-gab',  'gabriel')     || 1800,
    free: lv('s-free', 'freelancer')  || 250,
    int:  lv('s-int',  'intermitente')|| 220,
    fds:  lv('s-fds',  'fdsDay')      || 491,
    fds2: lv('s-fds2', 'fdsNight')    || 982,
    folg: lv('s-folg', 'folguista')   || 1500,
  };
}

function ENC() {
  const c = CFG.charges || {};
  const g = (k,d) => +c[k] || d;
  const inss=g('inss',20), rat=g('rat',2), terc=g('terceiros',5.8), fgts=g('fgts',8);
  const fer=g('ferias',11.11), e13=g('decimo',8.33), fp=g('fgtsProv',1.92), not=g('noturno',20);
  return { inss,rat,terc,fgts,fer,e13,fp,not,
    emp: inss+rat+terc+fgts,
    prov: fer+e13+fp,
    total: inss+rat+terc+fgts+fer+e13+fp };
}

// ── SYNC HIDDEN INPUTS ────────────────────────────────────────
function syncInputs() {
  const sal = SAL(), enc = ENC(), s = shiftCfg();
  // Salary inputs
  sv('s-gio',sal.gio); sv('s-and',sal.and); sv('s-gab',sal.gab);
  sv('s-free',sal.free); sv('s-int',sal.int);
  sv('s-fds',sal.fds); sv('s-fds2',sal.fds2); sv('s-folg',sal.folg);
  // Charge inputs
  sv('enc-inss',enc.inss); sv('enc-rat',enc.rat); sv('enc-terc',enc.terc);
  sv('enc-fgts',enc.fgts); sv('enc-fer',enc.fer); sv('enc-13',enc.e13);
  sv('enc-fp',enc.fp); sv('enc-not',enc.not);
  // Config bar chips
  se('b-morn',  `${p(s.ms)}h–${p(s.as)}h Manhã`);
  se('b-aft',   `${p(s.as)}h–${p(s.ns)}h Tarde`);
  se('b-night', `${p(s.ns)}h–${p(s.ms)}h Noite`);
  se('b-gio',   `Giovanna ${fm(sal.gio)}`);
  se('b-and',   `Anderson ${fm(sal.and)}`);
  se('b-gab',   `Gabriel ${fm(sal.gab)}`);
  se('b-enc',   `${enc.total.toFixed(1)}% encargos`);
}

// ── EMPLOYEE COST ─────────────────────────────────────────────
function empCost(sal, hePct, noturno) {
  const enc = ENC();
  const adicHE  = sal * (hePct/100);
  const adicNot = noturno ? sal*(enc.not/100) : 0;
  const gross   = sal + adicHE + adicNot;
  return { base:sal, adicHE, adicNot, gross,
    encV:  gross*(enc.emp/100),
    provV: gross*(enc.prov/100),
    total: gross*(1+(enc.emp+enc.prov)/100) };
}

// ── CELL FACTORIES ────────────────────────────────────────────
// Light-theme colors with good contrast on white-ish backgrounds
const C = {
  gio:  'rgba(192,57,43,.85)',  // deep red
  and:  'rgba(26,111,196,.85)', // blue
  gab:  'rgba(26,153,80,.85)',  // green
  free: 'rgba(184,134,11,.85)', // amber
  folg: 'rgba(123,63,160,.85)', // purple
  new_: 'rgba(14,116,144,.85)', // teal
  warn: 'rgba(220,38,38,.90)',  // red for illegal
  x:    'rgba(120,120,140,.6)', // grey for func X
};

const mk = (name,color,badge,warn,faded,full) =>
  ({name,color,badge:badge||null,warn:!!warn,faded:!!faded,fullDay:!!full});

const GIO  = (b,w) => mk('Giovanna',    C.gio,  b,w);
const AND  = (b,w) => mk('Anderson',    C.and,  b,w);
const GAB  = (b,w) => mk('Gabriel',     w?C.warn:C.gab, b,w);
const FREE = b     => mk('Freelancer',  C.free, b);
const NEW  = b     => mk('T.Parcial',   C.new_, b);
const FOLG = b     => mk('Folguista',   C.folg, b);
const GGIO = b     => mk('Giovanna',    C.gio,  b,false,false,true);
const GAND = b     => mk('Anderson',    C.and,  b,false,false,true);
const GNEW = b     => mk('Novo 12×36',  C.new_, b,false,false,true);
const GFDS = b     => mk('FDS Diurno',  C.new_, b,false,false,true);
const FDN  = b     => mk('FDS Noturno', C.new_, b);
const XEMP = ()    => mk('Func.X',      C.x,'saindo',false,true);
const N    = null;

// Gabriel 12×36 Semana A: Dom(0) Ter(2) Qui(4) Sáb(6)
const GABA = [true,false,true,false,true,false,true];

// ── SCHEDULE DATA ─────────────────────────────────────────────
// Display column order: 0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sáb
function buildScenarios() {
  return {
    atual: {
      morning:   [N,GIO(),GIO(),GIO(),GIO(),GIO(),GIO()],
      afternoon: [N,AND(),AND(),AND(),AND(),AND(),AND()],
      night:     GABA.map(g => g ? GAB('12×36') : XEMP()),
    },
    s1: {
      morning:   [FREE('FDS'),GIO(),GIO(),GIO(),GIO(),GIO(),FREE('FDS')],
      afternoon: [FREE('FDS'),AND(),AND(),AND(),AND(),AND(),FREE('FDS')],
      night:     GABA.map(g => g ? GAB('12×36') : FREE('gap')),
    },
    s2: {
      morning:   [GGIO('12×36'),GAND('12×36'),GGIO('12×36'),GAND('12×36'),GGIO('12×36'),GAND('12×36'),GAND('12×36')],
      afternoon: [N,N,N,N,N,N,N],
      night:     GABA.map(g => g ? GAB('12×36') : GNEW('12×36')),
    },
    s3: {
      morning:   [N,GIO(),GIO(),GIO(),GIO(),GIO(),GIO()],
      afternoon: [AND('rev.'),AND(),AND(),AND(),AND(),AND(),N],
      night:     GABA.map(g => g ? GAB('12×36') : FREE('gap')),
    },
    s4: {
      morning:   [FREE('FDS'),GIO(),GIO(),GIO(),GIO(),GIO(),FREE('FDS')],
      afternoon: [FREE('FDS'),AND(),AND(),AND(),AND(),AND(),FREE('FDS')],
      night: [FREE('FDS'),GAB('⚠60h',true),GAB('⚠ilegal',true),
              GAB('⚠ilegal',true),GAB('⚠ilegal',true),GAB('⚠ilegal',true),FREE('FDS')],
    },
    s5: {
      morning:   [FREE('Dom'),GIO(),GIO(),GIO(),GIO(),GIO(),AND('banco h.')],
      afternoon: [FREE('Dom'),AND(),AND(),AND(),AND(),AND(),AND()],
      night:     GABA.map(g => g ? GAB('12×36') : FREE('gap')),
    },
    s6: {
      morning:   [N,          GIO(),GIO(),GIO(),GIO(),GIO(),GFDS('Sáb·12h')],
      afternoon: [N,          AND(),AND(),AND(),AND(),AND(),N],
      night: GABA.map((g,i) => {
        if (i===6) return FDN('Sáb·12h');
        if (i===0) return FDN('Dom·12h');
        return g ? GAB('12×36') : FREE('gap');
      }),
    },
    sg: {
      morning:   [N,          GIO(),GIO(),GIO(),GIO(),GIO(),FOLG('FDS')],
      afternoon: [FOLG('FDS'),AND(),AND(),AND(),AND(),AND(),AND()],
      night:     GABA.map(g => g ? GAB('12×36') : FREE('gap')),
    },
  };
}

// ── LEGEND DATA ───────────────────────────────────────────────
const LEGS = {
  base: [{name:'Giovanna',c:C.gio},{name:'Anderson',c:C.and},{name:'Gabriel 12×36 (sem.A)',c:C.gab},{name:'Freelancer',c:C.free}],
  atual:[{name:'Giovanna',c:C.gio},{name:'Anderson',c:C.and},{name:'Gabriel 12×36',c:C.gab},{name:'Func.X (saindo)',c:C.x}],
  s2:  [{name:'Giovanna 12×36',c:C.gio},{name:'Anderson 12×36',c:C.and},{name:'Gabriel 12×36',c:C.gab},{name:'Novo Noturno',c:C.new_}],
  s4:  [{name:'Giovanna',c:C.gio},{name:'Anderson',c:C.and},{name:'Gabriel ⚠ILEGAL',c:C.warn},{name:'Freelancer',c:C.free}],
  s6:  [{name:'Giovanna',c:C.gio},{name:'Anderson',c:C.and},{name:'Gabriel 12×36',c:C.gab},{name:'FDS Diurno/Noturno',c:C.new_},{name:'Freelancer gap',c:C.free}],
  sg:  [{name:'Giovanna',c:C.gio},{name:'Anderson',c:C.and},{name:'Gabriel 12×36',c:C.gab},{name:'Folguista',c:C.folg},{name:'Freelancer noite',c:C.free}],
};

// ── SCHEDULE TABLE BUILDER ────────────────────────────────────
const DAY_LABELS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

function buildTable(tableId, legendId, sched, legKey) {
  const tbl = $(tableId);
  const leg = $(legendId);
  if (!tbl) { console.warn('buildTable: element not found:', tableId); return; }

  const sc = shiftCfg();

  // Legend
  if (leg) {
    leg.innerHTML = (LEGS[legKey]||[]).map(l =>
      `<div class="leg"><div class="leg-box" style="background:${l.c}"></div>${l.name}</div>`
    ).join('');
  }

  // Build table
  tbl.innerHTML = '';
  tbl.className = 'sched';

  // ── Header ──
  const thead = tbl.createTHead();
  const hr = thead.insertRow();
  const th0 = document.createElement('th');
  th0.style.cssText='background:var(--bg3);border:1px solid var(--bdr);width:88px';
  hr.appendChild(th0);
  DAY_LABELS.forEach((d,i) => {
    const th = document.createElement('th');
    th.className = i===0 ? 'sun' : '';
    th.textContent = d;
    hr.appendChild(th);
  });

  // ── Body ──
  const rows = ['morning','afternoon','night'];
  const labels = [
    {name:'☀️ Manhã', hours: sc.lM},
    {name:'🌆 Tarde',  hours: sc.lA},
    {name:'🌙 Noite',  hours: sc.lN},
  ];
  const afSkip = new Array(7).fill(false);
  const tbody  = tbl.createTBody();

  rows.forEach((rowKey, ri) => {
    const tr = tbody.insertRow();

    // Row label
    const lbl = document.createElement('td');
    lbl.className = 'shift-lbl';
    lbl.innerHTML = `<span class="sl-name">${labels[ri].name}</span><span class="sl-hours">${labels[ri].hours}</span>`;
    tr.appendChild(lbl);

    for (let col = 0; col < 7; col++) {
      if (ri === 1 && afSkip[col]) continue; // consumed by rowspan

      const cell = (sched[rowKey] || [])[col] ?? null;
      const td   = document.createElement('td');

      if (!cell) {
        td.className = 'sc sc-empty';
        td.innerHTML = '<div class="sc-inner"><span class="sc-empty-lbl">Vago</span></div>';

      } else if (cell.fullDay && ri === 0) {
        td.className = 'sc sc-tall' + (cell.warn ? ' sc-warn' : '');
        td.setAttribute('rowspan', '2');
        td.style.background = cell.color;
        if (cell.faded) td.style.opacity = '0.5';
        td.innerHTML = `<div class="sc-inner">
          <span class="sc-name">${cell.name}</span>
          <span class="sc-sub">${sc.lD}</span>
          ${cell.badge ? `<span class="sc-badge${cell.warn?' warn':''}">${cell.badge}</span>` : ''}
        </div>`;
        afSkip[col] = true;

      } else {
        td.className = 'sc' + (cell.warn ? ' sc-warn' : '');
        td.style.background = cell.color;
        if (cell.faded) td.style.opacity = '0.5';
        td.innerHTML = `<div class="sc-inner">
          <span class="sc-name">${cell.warn ? '⚠ ' : ''}${cell.name}</span>
          ${cell.badge ? `<span class="sc-badge${cell.warn?' warn':''}">${cell.badge}</span>` : ''}
        </div>`;
      }

      tr.appendChild(td);
    }
  });
}

// ── RENDER ALL TABLES ─────────────────────────────────────────
function renderAll() {
  const sc = buildScenarios();
  buildTable('gantt-atual','leg-atual', sc.atual, 'atual');
  buildTable('gantt-s1',   'leg-s1',   sc.s1,    'base');
  buildTable('gantt-s2',   'leg-s2',   sc.s2,    's2');
  buildTable('gantt-s3',   'leg-s3',   sc.s3,    'base');
  buildTable('gantt-s4',   'leg-s4',   sc.s4,    's4');
  buildTable('gantt-s5',   'leg-s5',   sc.s5,    'base');
  buildTable('gantt-s6',   'leg-s6',   sc.s6,    's6');
  buildTable('gantt-sg',   'leg-sg',   sc.sg,    'sg');
}

// ── LABEL UPDATES ─────────────────────────────────────────────
function updateLabels() {
  const s = shiftCfg();
  se('lbl-gio-a',s.lM); se('lbl-and-a',s.lA); se('lbl-gab-a',s.lN);
  const pairs = [
    ['la-gio-s1',s.lM],['la-and-s1',s.lA],['la-gab-s1',s.lN],
    ['la-gio-s2',s.lD],['la-and-s2',s.lD],['la-gab-s2',s.lN],['la-new-s2',s.lN],
    ['la-gio-s3',s.lM],['la-and-s3',s.lA],['la-gab-s3',s.lN],
    ['la-gio-s5',s.lM],['la-and-s5',s.lA],['la-gab-s5',s.lN],
    ['la-gio-s6',s.lM],['la-and-s6',s.lA],['la-gab-s6',s.lN],
    ['la-gio-sg',s.lM],['la-and-sg',s.lA],['la-gab-sg',s.lN],
  ];
  pairs.forEach(([id,v]) => se(id,v));
}

// ── TAB SWITCHING ─────────────────────────────────────────────
function showTab(id) {
  document.querySelectorAll('.panel').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  const panel = $('panel-'+id);
  const tab   = $('t-'+id);
  if (panel) panel.classList.add('active');
  if (tab)   tab.classList.add('active');
}
// Expõe no escopo global para os onclick do HTML
window.showTab = showTab;

// ── SALARY CARDS ──────────────────────────────────────────────
function buildSalCards() {
  const sal = SAL(), enc = ENC();
  const emps = [
    {name:'Giovanna',color:'var(--gio)',sal:sal.gio,regime:'6×1 CLT',      hePct:11.8,noturno:false},
    {name:'Anderson',color:'var(--and)',sal:sal.and,regime:'6×1 CLT',      hePct:11.8,noturno:false},
    {name:'Gabriel', color:'var(--gab)',sal:sal.gab,regime:'12×36 Noturno',hePct:0,   noturno:true},
  ];
  let cards='', rows='';
  emps.forEach(e => {
    const c = empCost(e.sal, e.hePct, e.noturno);
    cards += `<div class="emp-card">
      <div class="emp-card-hd"><div class="dot" style="background:${e.color}"></div>
        <div><div style="font-weight:600;font-size:.86rem">${e.name}</div>
        <div style="font-size:.7rem;color:var(--tx3)">${e.regime}</div></div>
      </div>
      <div class="emp-card-bd">
        <div class="calc-row"><span class="lbl">Salário base</span><span class="val">${fm(c.base)}</span></div>
        ${c.adicHE>0?`<div class="calc-row"><span class="lbl">H. extras (~${e.hePct}%)</span><span class="val">${fm(c.adicHE)}</span></div>`:''}
        ${c.adicNot>0?`<div class="calc-row"><span class="lbl">Adic. noturno (${enc.not}%)</span><span class="val" style="color:var(--orange)">${fm(c.adicNot)}</span></div>`:''}
        <div class="calc-row total"><span class="lbl">Salário bruto</span><span class="val">${fm(c.gross)}</span></div>
        <div class="calc-row enc"><span class="lbl">+ Encargos (${enc.emp.toFixed(1)}%)</span><span class="val">${fm(c.encV)}</span></div>
        <div class="calc-row enc"><span class="lbl">+ Provisões (${enc.prov.toFixed(2)}%)</span><span class="val">${fm(c.provV)}</span></div>
        <div class="calc-row total"><span class="lbl">CUSTO TOTAL/MÊS</span><span class="val">${fm(c.total)}</span></div>
      </div></div>`;
    rows += `<tr><td style="color:${e.color};font-weight:600">${e.name}</td><td>${e.regime}</td>
      <td class="mono">${fm(c.base)}</td>
      <td class="mono" style="color:var(--orange)">${fm(c.adicHE+c.adicNot)}</td>
      <td class="mono">${fm(c.encV)}</td><td class="mono">${fm(c.provV)}</td>
      <td class="mono" style="font-weight:700">${fm(c.total)}</td></tr>`;
  });
  const ce=$('emp-cards'), se2=$('sal-summary');
  if(ce) ce.innerHTML=cards; if(se2) se2.innerHTML=rows;
}

// ── ENCARGOS READ-ONLY GRID ───────────────────────────────────
function buildEncGrid() {
  const enc = ENC();
  const grid = $('enc-ro-grid');
  if (!grid) return;
  const fields = [
    ['INSS Patronal', enc.inss], ['RAT', enc.rat],
    ['Terceiros', enc.terc],     ['FGTS', enc.fgts],
    ['Prov. Férias+1/3', enc.fer],['Prov. 13°', enc.e13],
    ['FGTS s/ prov.', enc.fp],   ['Adic. Noturno', enc.not],
  ];
  grid.innerHTML = fields.map(([lbl,val]) =>
    `<div class="enc-card">
      <span class="el">${lbl}</span>
      <span class="ev">${(+val).toFixed(2)}%</span>
    </div>`
  ).join('');
  se('enc-total-pct', enc.total.toFixed(1)+'%');
}

// ── MAIN COST CALC ────────────────────────────────────────────
function calcAll() {
  const sal = SAL(), enc = ENC(), sc = shiftCfg();
  const OVHD = 1+enc.total/100;
  const NOTT = 1+enc.not/100;
  const HE   = 11.8;

  const gio6  = sal.gio * OVHD * (1+HE/100);
  const and6  = sal.and * OVHD * (1+HE/100);
  const gio5  = sal.gio * OVHD;
  const and5  = sal.and * OVHD;
  const gab   = sal.gab * OVHD * NOTT;
  const nw    = sal.gab * OVHD * NOTT;
  const fD    = sal.free;
  const fN    = sal.free * 1.4;
  const folg  = sal.folg * OVHD * (1+HE/100);
  const fdsD  = sal.fds  * OVHD;
  const fdsN  = sal.fds2 * OVHD * NOTT;

  const s1free = 4.33*4*fD + 15*fN;
  const s3free = 15*fN;
  const gabHE  = sal.gab * OVHD * NOTT * 1.36;
  const s4free = 4.33*4*fD + 8*fN;
  const s5free = 4.33*2*fD + 12*fN;
  const s6gap  = 8*fN;
  const sgfree = 12*fN;

  // ── Set DOM ──
  sf('c0-gio',gio6); sf('c0-and',and6); sf('c0-gab',gab); sf('c0-x',gab);
  sf('c0-tot',gio6+and6+gab*2);

  sf('c1-gio',gio5); sf('c1-and',and5); sf('c1-gab',gab); sf('c1-free',s1free);
  sf('c1-tot',gio5+and5+gab+s1free);

  sf('c2-gio',gio5); sf('c2-and',and5); sf('c2-gab',gab); sf('c2-new',nw);
  sf('c2-tot',gio5+and5+gab+nw);

  sf('c3-gio',gio6); sf('c3-and',and6); sf('c3-gab',gab); sf('c3-free',s3free);
  sf('c3-tot',gio6+and6+gab+s3free);

  sf('c4-gio',gio5); sf('c4-and',and5); sf('c4-gab',gabHE); sf('c4-free',s4free);
  sf('c4-tot',gio5+and5+gabHE+s4free);

  sf('c5-gio',gio5); sf('c5-and',and6); sf('c5-gab',gab); sf('c5-free',s5free);
  sf('c5-tot',gio5+and6+gab+s5free);

  sf('c6-gio',gio5); sf('c6-and',and5); sf('c6-gab',gab);
  sf('c6-fds',fdsD+fdsN); sf('c6-free',s6gap);
  sf('c6-tot',gio5+and5+gab+fdsD+fdsN+s6gap);

  sf('cg-gio',gio5); sf('cg-and',and5); sf('cg-gab',gab);
  sf('cg-folg',folg); sf('cg-free',sgfree);
  sf('cg-tot',gio5+and5+gab+folg+sgfree);

  // ── Comparison table ──
  buildCmpTable({
    c0:{fix:gio6+and6+gab*2,       free:0},
    s1:{fix:gio5+and5+gab,         free:s1free},
    s2:{fix:gio5+and5+gab+nw,      free:0},
    s3:{fix:gio6+and6+gab,         free:s3free},
    s4:{fix:gio5+and5+gabHE,       free:s4free},
    s5:{fix:gio5+and6+gab,         free:s5free},
    s6:{fix:gio5+and5+gab+fdsD+fdsN, free:s6gap},
    sg:{fix:gio5+and5+gab+folg,    free:sgfree},
  });

  // ── S6 CLT analysis ──
  const interj   = sc.ns - sc.ms;
  const nightH   = Math.max(0, Math.min(sc.ms+24,29) - Math.max(sc.ns,22));
  const okI      = interj >= 11;
  const el6 = $('s6-clt-analysis');
  if (el6) el6.innerHTML = `<div class="alert alert-${okI?'ok':'warn'}">
    <span class="ai">${okI?'✅':'⚠️'}</span>
    <div><strong>Verificação CLT (turnos ${p(sc.ms)}h/${p(sc.ns)}h):</strong><br>
    FDS Diurno: ${sc.ns-sc.ms}h/sem. ≤ 30h → <strong>${okI?'✅ LEGAL':'⚠ Revisar'}</strong> (Art.58-A+59-A)<br>
    FDS Noturno: ${sc.nDur*2}h/sem. ≤ 30h → <strong>✅ LEGAL</strong> (Art.58-A+59-A)<br>
    Interjornada Sáb→Dom noite: ${interj}h ${okI?'≥ 11h ✅':'&lt; 11h ⚠ ILEGAL — ajuste em ⚙️'} (Art.66)<br>
    Adicional noturno: ~${nightH}h/turno × ${enc.not}% obrigatório (Art.73)</div></div>`;

  // ── Contracts ──
  sf('ct-fds-d', fdsD);
  sf('ct-fds-n', fdsN);
  sf('ct-int',   4.33*2*sal.int);
  sf('ct-tmp',   4.33*2*sal.free*1.15);
  se('ct-night-hours', `Art. 58-A + 59-A · ${sc.nDur*2}h/sem.`);
  se('ct-night-hw',    `${sc.nDur*2}h ≤ 30h → ✅`);
  se('ct-interj', `${interj}h entre turnos ${okI?'≥ 11h ✅':'⚠ ajustar'} (Art.66)`);
  se('ct-noct',   `~${nightH}h/turno × ${enc.not}% (Art.73)`);
  se('ct-night-status', okI ? '✅ LEGAL' : '⚠ ATENÇÃO');

  buildSalCards();
  buildEncGrid();
  updateLabels();
}

// ── COMPARISON TABLE ──────────────────────────────────────────
function buildCmpTable(c) {
  const rows = [
    {n:'0 · Atual',               fx:4,ex:'—',         dom:'❌',he:'Gio+And HE',   c:c.c0, clt:'⚠',       risk:'Médio'},
    {n:'A · 5×2+Freelancer',      fx:3,ex:'~32 diárias',dom:'✅',he:'Nenhuma',     c:c.s1, clt:'✅(PJ⚠)', risk:'Baixo'},
    {n:'B · 12×36 Universal',     fx:4,ex:'—',         dom:'✅',he:'Nenhuma',     c:c.s2, clt:'✅',       risk:'Mínimo'},
    {n:'C · Revezamento 6×1',     fx:3,ex:'~15 noites',dom:'✅',he:'BH Gio+And',  c:c.s3, clt:'⚠ BH',    risk:'Baixo'},
    {n:'D · Gab Seg–Sex ⚠',       fx:3,ex:'~24 diárias',dom:'✅',he:'ILEGAL',     c:c.s4, clt:'🚨',       risk:'ALTO', bad:true},
    {n:'E · Misto ⭐',             fx:3,ex:'~21 diárias',dom:'✅',he:'And (BH)',   c:c.s5, clt:'✅(BH⚠)', risk:'Baixo', rec:true},
    {n:'F · Intermediários 12h ⭐',fx:5,ex:'2 interm.',  dom:'✅',he:'Nenhuma',   c:c.s6, clt:'✅',       risk:'Mínimo',rec:true},
    {n:'G · Folguista ⭐',         fx:4,ex:'~12 noites',dom:'✅',he:'Folg.(BH)',  c:c.sg, clt:'✅(BH)',   risk:'Mínimo',rec:true},
  ];
  const totals = rows.map(r=>(r.c.fix||0)+(r.c.free||0));
  const minT   = Math.min(...totals.filter((_,i)=>!rows[i].bad));
  const tbody  = $('cmp-body');
  if (!tbody) return;
  tbody.innerHTML = rows.map((r,i)=>{
    const tot = totals[i];
    return `<tr class="${r.rec?'rec':r.bad?'bad':''}">
      <td><strong>${r.n}</strong></td>
      <td class="center">${r.fx}</td>
      <td style="font-size:.76rem">${r.ex}</td>
      <td class="center">${r.dom}</td>
      <td style="font-size:.76rem">${r.he}</td>
      <td class="mono">${fm(r.c.fix||0)}</td>
      <td class="mono">${r.c.free>0?fm(r.c.free):'—'}</td>
      <td class="mono${tot===minT&&!r.bad?' best':''}${r.bad?' worst':''}">${fm(tot)}</td>
      <td style="text-align:center;font-size:.76rem">${r.clt}</td>
      <td style="text-align:center;font-size:.76rem">${r.risk}</td>
    </tr>`;
  }).join('');
}

// ── INIT ──────────────────────────────────────────────────────
function init() {
  loadCFG();
  syncInputs();
  const d = new Date().toLocaleDateString('pt-BR');
  se('gen-date',d); se('footer-date',d);
  renderAll();
  calcAll();
}

document.addEventListener('DOMContentLoaded', init);
