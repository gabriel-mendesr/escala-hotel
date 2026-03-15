/* ============================================================
   escala.js — Hotel 24/7 · v6 · 2026
   Gerador de escalas e relatório estratégico de turnos.
   Sem cálculo salarial — apenas estrutura de horários e análise CLT.
   ============================================================ */


// ── UTILS ─────────────────────────────────────────────────────
function gi(id) { return document.getElementById(id); }
function ph(h)  { h = ((h % 24) + 24) % 24; return (h < 10 ? '0' : '') + h; }
function se(id, v) { var e = gi(id); if (e) e.textContent = v; }

// ── SHIFT CONFIG ──────────────────────────────────────────────
function SC() {
  var ms = 7, as = 15, ns = 19; // fixed shifts
  return {
    ms: ms, as: as, ns: ns,
    lM: ph(ms) + 'h–' + ph(as) + 'h',
    lA: ph(as) + 'h–' + ph(ns) + 'h',
    lN: ph(ns) + 'h–' + ph(ms) + 'h (+1 dia)',
    lD: ph(ms) + 'h–' + ph(ns) + 'h (' + (ns - ms) + 'h)',
    nDur: (ms + 24) - ns
  };
}

function SC_shift(shift) {
  var ms = shift.ms, as = shift.as, ns = shift.ns;
  return {
    ms: ms, as: as, ns: ns,
    lM: ph(ms) + 'h–' + ph(as) + 'h',
    lA: ph(as) + 'h–' + ph(ns) + 'h',
    lN: ph(ns) + 'h–' + ph(ms) + 'h (+1 dia)',
    lD: ph(ms) + 'h–' + ph(ns) + 'h (' + (ns - ms) + 'h)',
    nDur: (ms + 24) - ns
  };
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
function FOL(reg)     { return mk('Folguista', C.folg, reg); }
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
    },
    s7: {
      morning:   [FOLG('Fim de semana'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), FOLG('Fim de semana')],
      afternoon: [FOLG('Fim de semana'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), FOLG('Fim de semana')],
      night:     GAB_A.map(function(g) { return g ? GAB('5×2') : FOLG('Folguista'); })
    },
    s8: {
      morning:   [FOLG('Fim de semana'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), FOLG('Fim de semana')],
      afternoon: [FOLG('Fim de semana'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), FOLG('Fim de semana')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },
    s9: {
      morning:   [N, GIO('6×1'), GIO('6×1'), GIO('6×1'), GIO('6×1'), GIO('6×1'), GIO('6×1')],
      afternoon: [N, AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), N],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },
    s10: {
      morning: [
        mk('Giovanna',C.gio,'12×36 Diurno',false,false,true),
        mk('Anderson', C.and,'12×36 Diurno',false,false,true),
        mk('Giovanna',C.gio,'12×36 Diurno',false,false,true),
        mk('Anderson', C.and,'12×36 Diurno',false,false,true),
        mk('Giovanna',C.gio,'12×36 Diurno',false,false,true),
        mk('Anderson', C.and,'12×36 Diurno',false,false,true),
        mk('Giovanna',C.gio,'12×36 Diurno',false,false,true)
      ],
      afternoon: [N,N,N,N,N,N,N],
      night: GAB_A.map(function(g) { return g ? GAB('12×36') : GAB('12×36 Noturno'); })
    },
    s11: {
      morning:   [FREE('Fim de semana'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), FREE('Fim de semana')],
      afternoon: [FREE('Fim de semana'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), FREE('Fim de semana')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },
    s12: {
      morning:   [N, GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), N],
      afternoon: [N, AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), N],
      night: GAB_A.map(function(g, i) {
        if (i === 6) return FDS_N('Sábado noite — T. Parcial');
        if (i === 0) return FDS_N('Domingo noite — T. Parcial');
        return g ? GAB('12×36') : FREE('Cobertura noturna');
      })
    },
    s13: {
      shift: {ms:6, as:14, ns:22},
      morning:   [FREE('Fim de semana'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), FREE('Fim de semana')],
      afternoon: [FREE('Fim de semana'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), FREE('Fim de semana')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },
    s14: {
      shift: {ms:6, as:14, ns:22},
      morning:   [N, GIO('6×1'), GAB('6×1 Manhã'), GIO('6×1'), GAB('6×1 Manhã'), GIO('6×1'), GAB('6×1 Manhã')],
      afternoon: [AND('Revezamento'), AND('6×1'), AND('6×1'), AND('6×1'), AND('6×1'), AND('6×1'), N],
      night:     GAB_A.map(function(g) { return g ? FOL('6×1 Noite') : FREE('Cobertura noturna'); })
    },
    s15: {
      shift: {ms:6, as:14, ns:22},
      morning:   [FREE('Manhã freelancer'), FREE('Manhã freelancer'), FREE('Manhã freelancer'), FREE('Manhã freelancer'), FREE('Manhã freelancer'), FREE('Manhã freelancer'), FREE('Manhã freelancer')],
      afternoon: [FREE('Fim de semana'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), FREE('Fim de semana')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },
    s16: {
      shift: {ms:6, as:14, ns:22},
      morning:   [AND('6×1 Manhã'), AND('6×1 Manhã'), AND('6×1 Manhã'), AND('6×1 Manhã'), AND('6×1 Manhã'), AND('6×1 Manhã'), N],
      afternoon: [GAB('6×1 Tarde'), GAB('6×1 Tarde'), GAB('6×1 Tarde'), GAB('6×1 Tarde'), GAB('6×1 Tarde'), GAB('6×1 Tarde'), N],
      night:     GAB_A.map(function(g) { return g ? FOL('6×1 Noite') : FREE('Cobertura noturna'); })
    },
    s17: {
      morning:   [FREE('Fim de semana'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), FREE('Fim de semana')],
      afternoon: [FREE('Fim de semana'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), FREE('Fim de semana')],
      night:     GAB_A.map(function(g) { return g ? GAB('5×2 ⚠ ILEGAL') : FOLG('Folguista'); })
    },
    s18: {
      morning:   [FREE('Fim de semana'), GIO('6×1'), GIO('6×1'), GIO('6×1'), GIO('6×1'), GIO('6×1'), FREE('Fim de semana')],
      afternoon: [FREE('Fim de semana'), AND('6×1'), AND('6×1'), AND('6×1'), AND('6×1'), AND('6×1'), FREE('Fim de semana')],
      night:     GAB_A.map(function(g) { return g ? GAB('6×1 ⚠ ILEGAL') : FOLG('Folguista'); })
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
  sg:    [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',            c:C.and}, {n:'Gabriel (12×36)',          c:C.gab}, {n:'Folguista (6×1)',             c:C.folg},{n:'Freelancer (noturno)',       c:C.free}],
  s7:    [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',            c:C.and}, {n:'Gabriel (5×2)',            c:C.gab}, {n:'Folguista (5×2)',            c:C.folg}],
  s8:    [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',            c:C.and}, {n:'Gabriel (12×36)',          c:C.gab}, {n:'Folguista (5×2)',            c:C.folg}],
  s9:    [{n:'Giovanna (6×1)',            c:C.gio}, {n:'Anderson (5×2)',            c:C.and}, {n:'Gabriel (12×36)',          c:C.gab}, {n:'Freelancer noturno',         c:C.free}],
  s10:   [{n:'Giovanna (12×36)',          c:C.gio}, {n:'Anderson (12×36)',          c:C.and}, {n:'Gabriel (12×36)',          c:C.gab}],
  s11:   [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',            c:C.and}, {n:'Gabriel (12×36)',          c:C.gab}, {n:'Freelancer FDS',             c:C.free}],
  s12:   [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',            c:C.and}, {n:'Gabriel (12×36)',            c:C.gab}, {n:'Func. FDS (Tempo Parcial)',     c:C.fds}, {n:'Freelancer (lacunas)',        c:C.free}],
  s13:   [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',            c:C.and}, {n:'Gabriel (12×36)',            c:C.gab}, {n:'Freelancer / PJ',             c:C.free}],
  s14:   [{n:'Giovanna (6×1)',            c:C.gio}, {n:'Gabriel (6×1 Manhã)',       c:C.gab}, {n:'Anderson (6×1)',            c:C.and}, {n:'Folguista (noturno)',        c:C.folg}],
  s15:   [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',            c:C.and}, {n:'Gabriel (12×36)',            c:C.gab}, {n:'Freelancer manhã + FDS',      c:C.free}],
  s16:   [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Gabriel (6×1 Tarde)',       c:C.gab}, {n:'Anderson (6×1 Manhã)',       c:C.and}, {n:'Folguista (noturno)',        c:C.folg}],
  s17:   [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',            c:C.and}, {n:'Gabriel ⚠ ILEGAL (5×2)',    c:C.warn},{n:'Folguista (FDS)',            c:C.folg}],
  s18:   [{n:'Giovanna (6×1)',            c:C.gio}, {n:'Anderson (6×1)',            c:C.and}, {n:'Gabriel ⚠ ILEGAL (6×1)',    c:C.warn},{n:'Folguista (FDS)',            c:C.folg}]
};

// ── TABLE BUILDER (innerHTML puro — mais robusto) ─────────────
var DAY_NAMES = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
var selectedEmp = null;
var SCENARIOS_DATA = null;

// Seleciona um card na esquerda
function selectCard(el, name, color) {
  selectedEmp = { nome: name, cor: color, regime: 'Manual' };
  document.querySelectorAll('.leg-card').forEach(function(c) { c.classList.remove('selected'); });
  el.classList.add('selected');
}

// Aplica o funcionário selecionado à célula clicada
function cellClick(scenarioKey, rowKey, dayIndex) {
  if (!selectedEmp || !SCENARIOS_DATA) return;
  
  // Atualiza o dado no objeto global para persistir a edição
  SCENARIOS_DATA[scenarioKey][rowKey][dayIndex] = {
    nome: selectedEmp.nome,
    cor: selectedEmp.cor,
    regime: selectedEmp.regime
  };
  
  // Re-renderiza para mostrar a mudança imediatamente
  renderAll();
  if (typeof calcAll === 'function') calcAll();
}

function buildTable(tableId, legendId, sched, legKey) {
  var tableTarget = gi(tableId);
  var legEl   = gi(legendId);

  if (!tableTarget) {
    // Se o ID sumiu (devido ao bug de innerHTML), tentamos encontrar pelo seletor de classe no container
    // mas o ideal é garantir que o ID permaneça no re-render.
    return;
  }

  var sc = sched && sched.shift ? SC_shift(sched.shift) : SC();

  // ── Legenda ──
  if (legEl) {
    var legItems = (LEGS[legKey] || []);
    legEl.innerHTML = legItems.map(function(l) {
      // Transformando legenda em mini-cards informativos
      var parts = l.n.split(' ');
      var name = parts.shift();
      var details = parts.join(' ');
      
      var isSelected = selectedEmp && selectedEmp.nome === name ? ' selected' : '';
      // Ativado: Clique para selecionar e Draggable para arrastar
      return '<div class="leg-card' + isSelected + '" onclick="selectCard(this, \''+name+'\', \''+l.c+'\')" draggable="true" ondragstart="event.dataTransfer.setData(\'text/plain\', JSON.stringify({n:\''+name+'\',c:\''+l.c+'\'}))">' +
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
      
      // Handlers de clique e drop para cada célula
      var cellAttr = ' onclick="cellClick(\''+legKey+'\', \''+rowKeys[ri]+'\', '+ci+')" ' +
                     ' ondragover="event.preventDefault()" ' +
                     ' ondrop="var d=JSON.parse(event.dataTransfer.getData(\'text/plain\')); selectedEmp={nome:d.n, cor:d.c, regime:\'Manual\'}; cellClick(\''+legKey+'\', \''+rowKeys[ri]+'\', '+ci+')"';

      if (!cell) {
        // Vago / sem cobertura
        html += '<td class="sc sc-empty"' + cellAttr + '><div class="sc-inner"><span class="sc-empty-lbl">Vago</span></div></td>';

      } else if (cell.fullDay && ri === 0) {
        // Turno de 12h diurno: ocupa manhã + tarde
        var opacity = cell.faded ? ' style="opacity:.5"' : '';
        html += '<td class="sc sc-tall' + (cell.warn ? ' sc-warn' : '') + '" rowspan="2" style="background:' + cell.cor + ';' + (cell.faded ? 'opacity:.5' : '') + '"' + cellAttr + '>';
        html += '<div class="sc-inner">';
        html += '<span class="sc-name">' + (cell.warn ? '⚠ ' : '') + cell.nome + '</span>';
        html += '<span class="sc-sub">' + sc.lD + '</span>';
        if (cell.regime) html += '<span class="sc-badge' + (cell.warn ? ' warn' : '') + '">' + cell.regime + '</span>';
        html += '</div></td>';
        colSpanned[ci] = true;

      } else {
        // Célula normal
        html += '<td class="sc' + (cell.warn ? ' sc-warn' : '') + '" style="background:' + cell.cor + ';' + (cell.faded ? 'opacity:.5' : '') + '"' + cellAttr + '>';
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
  if (!SCENARIOS_DATA) SCENARIOS_DATA = buildScenarios();
  buildTable('gantt-atual', 'leg-atual', SCENARIOS_DATA.atual, 'atual');
  buildTable('gantt-s1',    'leg-s1',   SCENARIOS_DATA.s1,    'base');
  buildTable('gantt-s2',    'leg-s2',   SCENARIOS_DATA.s2,    's2');
  buildTable('gantt-s3',    'leg-s3',   SCENARIOS_DATA.s3,    's3');
  buildTable('gantt-s4',    'leg-s4',   SCENARIOS_DATA.s4,    's4');
  buildTable('gantt-s5',    'leg-s5',   SCENARIOS_DATA.s5,    'base');
  buildTable('gantt-s6',    'leg-s6',   SCENARIOS_DATA.s6,    's6');
  buildTable('gantt-sg',    'leg-sg',   SCENARIOS_DATA.sg,    'sg');
  buildTable('gantt-s7',    'leg-s7',   SCENARIOS_DATA.s7,    's7');
  buildTable('gantt-s8',    'leg-s8',   SCENARIOS_DATA.s8,    's8');
  buildTable('gantt-s9',    'leg-s9',   SCENARIOS_DATA.s9,    's9');
  buildTable('gantt-s10',   'leg-s10',  SCENARIOS_DATA.s10,   's10');
  buildTable('gantt-s11',   'leg-s11',  SCENARIOS_DATA.s11,   's11');
  buildTable('gantt-s12',   'leg-s12',  SCENARIOS_DATA.s12,   's12');
  buildTable('gantt-s13',   'leg-s13',  SCENARIOS_DATA.s13,   's13');
  buildTable('gantt-s14',   'leg-s14',  SCENARIOS_DATA.s14,   's14');
  buildTable('gantt-s15',   'leg-s15',  SCENARIOS_DATA.s15,   's15');
  buildTable('gantt-s16',   'leg-s16',  SCENARIOS_DATA.s16,   's16');
  buildTable('gantt-s17',   'leg-s17',  SCENARIOS_DATA.s17,   's17');
  buildTable('gantt-s18',   'leg-s18',  SCENARIOS_DATA.s18,   's18');
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
    ['la-gio-sg',s.lM],['la-and-sg',s.lA],['la-gab-sg',s.lN],
    ['la-gio-s7',s.lM],['la-and-s7',s.lA],['la-gab-s7',s.lN],
    ['la-gio-s8',s.lM],['la-and-s8',s.lA],['la-gab-s8',s.lN],
    ['la-gio-s9',s.lM],['la-and-s9',s.lA],['la-gab-s9',s.lN],
    ['la-gio-s10',s.lD],['la-and-s10',s.lD],['la-gab-s10',s.lN],
    ['la-gio-s11',s.lM],['la-and-s11',s.lA],['la-gab-s11',s.lN],
    ['la-gio-s12',s.lM],['la-and-s12',s.lA],['la-gab-s12',s.lN]
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

// ── COMPARISON TABLE ──────────────────────────────────────────
function buildCmpTable() {
  var rows = [
    { n:'0 · Situação Atual',             fx:4, ex:'—',                dom:'❌', he:'Gio + And (hora extra)', clt:'⚠ HE',       risk:'Médio'},
    { n:'F · Intermediários 12h FDS ⭐',   fx:5, ex:'2 intermediários', dom:'✅', he:'Nenhuma',               clt:'✅ Perfeito', risk:'Mínimo', rec:true},
    { n:'K · 12×36 Revezamento ⭐',         fx:3, ex:'—',                dom:'✅', he:'Nenhuma',               clt:'✅ Perfeito', risk:'Mínimo', rec:true},
    { n:'M · Interm. Noites ⭐',             fx:4, ex:'2 intermediários', dom:'✅', he:'Nenhuma',               clt:'✅ Perfeito', risk:'Mínimo', rec:true},
    { n:'G · Folguista Coringa ⭐',        fx:4, ex:'~12 noites/mês',   dom:'✅', he:'Folguista (B.Horas)',   clt:'✅ (B.H)',    risk:'Mínimo', rec:true},
    { n:'E · Misto Recomendado ⭐',        fx:3, ex:'~21 diárias/mês',  dom:'✅', he:'Anderson (B.Horas)',    clt:'✅ (B.H⚠)',  risk:'Baixo',  rec:true},
    { n:'B · 12×36 Universal',            fx:4, ex:'—',                dom:'✅', he:'Nenhuma',               clt:'✅ Perfeito', risk:'Mínimo'},
    { n:'C · Revezamento 6×1',            fx:3, ex:'~15 noites/mês',   dom:'✅', he:'Banco de horas',        clt:'⚠ B.Horas', risk:'Baixo'},
    { n:'J · 6×1 Manhã + Free',           fx:3, ex:'~15 noites/mês',   dom:'✅', he:'Giovanna (B.Horas)',    clt:'⚠ B.Horas', risk:'Baixo'},
    { n:'H · 5×2 + Folguista',            fx:4, ex:'—',                dom:'✅', he:'Folguista (B.Horas)',   clt:'✅ (B.H)',   risk:'Baixo'},
    { n:'I · Misto Folguista',             fx:4, ex:'—',                dom:'✅', he:'Folguista (B.Horas)',   clt:'✅ (B.H)',   risk:'Baixo'},
    { n:'A · 5×2 + Freelancer',           fx:3, ex:'~32 diárias/mês',  dom:'✅', he:'Nenhuma',               clt:'✅ (PJ⚠)',   risk:'Baixo'},
    { n:'L · 5×2 + Free FDS',              fx:3, ex:'~32 diárias/mês',  dom:'✅', he:'Nenhuma',               clt:'✅ (PJ⚠)',   risk:'Baixo'},
    { n:'D · Gabriel Seg–Sex Noite ⚠',   fx:3, ex:'~24 diárias/mês',  dom:'✅', he:'ILEGAL (60h/sem.)',     clt:'🚨 ILEGAL',  risk:'ALTO', bad:true},
    { n:'R · Gabriel 5×2 Seg–Sex ⚠',     fx:4, ex:'2 folguistas FDS', dom:'✅', he:'ILEGAL (60h/sem.)',     clt:'🚨 ILEGAL',  risk:'ALTO', bad:true},
    { n:'S · Gabriel 6×1 Seg–Sex ⚠',     fx:4, ex:'2 folguistas FDS', dom:'✅', he:'ILEGAL (60h/sem.)',     clt:'🚨 ILEGAL',  risk:'ALTO', bad:true}
  ];

  var tbody = gi('cmp-body');
  if (!tbody) return;

  var html = '';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var rowClass = r.rec ? 'rec' : r.bad ? 'bad' : '';
    html += '<tr class="' + rowClass + '">' +
      '<td><strong>' + r.n + '</strong></td>' +
      '<td class="center">' + r.fx + '</td>' +
      '<td style="font-size:.76rem">' + r.ex + '</td>' +
      '<td class="center">' + r.dom + '</td>' +
      '<td style="font-size:.76rem">' + r.he + '</td>' +
      '<td style="text-align:center;font-size:.76rem">' + r.clt + '</td>' +
      '<td style="text-align:center;font-size:.76rem">' + r.risk + '</td>' +
      '</tr>';
  }
  tbody.innerHTML = html;
}

// ── LABELS & COMPARATIVO ─────────────────────────────────────
function calcAll() {
  var sc = SC();
  // Análise CLT S6
  var enc_not = 20;
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
      'Interjornada Sáb→Dom noite: ' + interj + 'h ' + (okI ? '≥ 11h ✅' : '&lt; 11h ⚠ ILEGAL') + ' (Art. 66)<br>' +
      'Adicional noturno: ~' + nightH + 'h/turno obrigatório (Art. 73)' +
      '</div></div>';
  }
  // Contratos - só status CLT, sem valores
  se('ct-night-hours', 'Art. 58-A + 59-A · ' + sc.nDur * 2 + 'h/semana');
  se('ct-night-hw',    sc.nDur * 2 + 'h ≤ 30h → ✅');
  se('ct-interj', interj + 'h entre turnos ' + (okI ? '≥ 11h ✅' : '⚠ Ajustar horário') + ' (Art. 66)');
  se('ct-noct',   '~' + nightH + 'h/turno (Art. 73)');
  se('ct-night-status', okI ? '✅ LEGAL' : '⚠ ATENÇÃO');

  buildCmpTable();
  updateLabels();
}

// ── INIT ──────────────────────────────────────────────────────
function init() {
  try {
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
window.selectCard = selectCard;
window.cellClick = cellClick;

document.addEventListener('DOMContentLoaded', init);
