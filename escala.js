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
// Grade padrão para cenários propostos
function SC() {
  var ms = 7, as = 15, ns = 19;
  return {
    ms: ms, as: as, ns: ns,
    lM: ph(ms) + 'h–' + ph(as) + 'h',
    lA: ph(as) + 'h–' + ph(ns) + 'h',
    lN: ph(ns) + 'h–' + ph(ms) + 'h (+1 dia)',
    lD: ph(ms) + 'h–' + ph(ns) + 'h (' + (ns - ms) + 'h)',
    nDur: (ms + 24) - ns
  };
}

// Modelo B: 06h / 13h / 22h
var SHIFT_B = {ms:6, as:13, ns:22};

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
      // Horários variáveis por dia (real)
      morning: [
        N,                    // Dom: folga
        GIO('07–16'),         // Seg
        GIO('07–15'),         // Ter
        GIO('07–15'),         // Qua
        GIO('07–16'),         // Qui
        GIO('07–16'),         // Sex
        GIO('07–13')          // Sáb
      ],
      afternoon: [
        N,                    // Dom: folga
        AND('11–19'),         // Seg
        AND('10–19'),         // Ter
        AND('11–19'),         // Qua
        AND('10–19'),         // Qui
        AND('10–19'),         // Sex
        AND('13–19')          // Sáb
      ],
      night: GAB_A.map(function(g) { return g ? GAB('12×36') : XEMP(); })
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
    },
    // ── EXEMPLOS MODELO A vs B (cenário F como base) ──
    exA: {
      // Modelo A: 07h / 14h / 19h (padrão — usa SC() default)
      morning: [
        N,
        GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'),
        mk('Func. FDS Diurno', C.fds, 'Sábado 12h', false, false, true)
      ],
      afternoon: [N, AND('5×2 · 14h'), AND('5×2 · 14h'), AND('5×2 · 14h'), AND('5×2 · 14h'), AND('5×2 · 14h'), N],
      night: GAB_A.map(function(g, i) {
        if (i === 6) return FDS_N('Sábado noite');
        if (i === 0) return FDS_N('Domingo noite');
        return g ? GAB('12×36') : FREE('Cobertura noturna');
      })
    },
    exB: {
      shift: {ms:6, as:13, ns:22},
      morning: [
        N,
        GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'),
        mk('Func. FDS Diurno', C.fds, 'Sábado 12h', false, false, true)
      ],
      afternoon: [N, AND('5×2 · 13h'), AND('5×2 · 13h'), AND('5×2 · 13h'), AND('5×2 · 13h'), AND('5×2 · 13h'), N],
      night: GAB_A.map(function(g, i) {
        if (i === 6) return FDS_N('Sábado noite');
        if (i === 0) return FDS_N('Domingo noite');
        return g ? GAB('12×36') : FREE('Cobertura noturna');
      })
    },

    // ═══════════════════════════════════════════════════════
    // GIOVANNA — ENTRADA 7h
    // ═══════════════════════════════════════════════════════
    // g7a: Gio 7h 5×2 (07-15) + And 14-19 (5h) + Gab 12×36
    // Overlap: 14-15 (1h) | Gio 35h/sem And 25h/sem
    g7a: {
      // shift default: ms=7, as=15, ns=19
      morning:   [FOLG('FDS'), GIO('5×2 07–15'), GIO('5×2 07–15'), GIO('5×2 07–15'), GIO('5×2 07–15'), GIO('5×2 07–15'), FOLG('FDS')],
      afternoon: [FOLG('FDS'), AND('5×2 14–19'), AND('5×2 14–19'), AND('5×2 14–19'), AND('5×2 14–19'), AND('5×2 14–19'), FOLG('FDS')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },
    // g7b: Gio 7h 6×1 (07-15) + And 14-19 (5h) 6×1 + Gab 12×36
    // Overlap: 14-15 (1h) | Gio 42h/sem And 30h/sem
    g7b: {
      morning:   [N, GIO('6×1 07–15'), GIO('6×1 07–15'), GIO('6×1 07–15'), GIO('6×1 07–15'), GIO('6×1 07–15'), GIO('6×1 07–13')],
      afternoon: [N, AND('6×1 14–19'), AND('6×1 14–19'), AND('6×1 14–19'), AND('6×1 14–19'), AND('6×1 14–19'), AND('6×1 13–19')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },
    // g7c: Gio 7h 5×2 (07-16, 9h) + And 14-19 (5h) → overlap 14-16 (2h!)
    // Gio 40h/sem And 25h/sem — Mais overlap
    g7c: {
      shift: {ms:7, as:16, ns:19},
      morning:   [FOLG('FDS'), GIO('5×2 07–16'), GIO('5×2 07–16'), GIO('5×2 07–16'), GIO('5×2 07–16'), GIO('5×2 07–16'), FOLG('FDS')],
      afternoon: [FOLG('FDS'), AND('5×2 15–19'), AND('5×2 15–19'), AND('5×2 15–19'), AND('5×2 15–19'), AND('5×2 15–19'), FOLG('FDS')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },

    // ═══════════════════════════════════════════════════════
    // GIOVANNA — ENTRADA 6h
    // ═══════════════════════════════════════════════════════
    // g6a: Gio 6h 5×2 (06-14) + And 13-22 (9h, 8h eff.) + Gab 22-06
    // Overlap: 13-14 (1h) | Gio 35h And 40h | Noite 8h
    g6a: {
      shift: {ms:6, as:14, ns:22},
      morning:   [FOLG('FDS'), GIO('5×2 06–14'), GIO('5×2 06–14'), GIO('5×2 06–14'), GIO('5×2 06–14'), GIO('5×2 06–14'), FOLG('FDS')],
      afternoon: [FOLG('FDS'), AND('5×2 13–22'), AND('5×2 13–22'), AND('5×2 13–22'), AND('5×2 13–22'), AND('5×2 13–22'), FOLG('FDS')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },
    // g6b: Gio 6h 6×1 (06-14) + And 13-22 6×1 + Gab 22-06
    // Overlap: 13-14 (1h) | Gio 42h And 48h⚠
    g6b: {
      shift: {ms:6, as:14, ns:22},
      morning:   [N, GIO('6×1 06–14'), GIO('6×1 06–14'), GIO('6×1 06–14'), GIO('6×1 06–14'), GIO('6×1 06–14'), GIO('6×1 06–12')],
      afternoon: [N, AND('6×1 13–22'), AND('6×1 13–22'), AND('6×1 13–22'), AND('6×1 13–22'), AND('6×1 13–22'), AND('6×1 13–19')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },
    // g6c: Gio 6h 5×2 (06-15, 9h) + And 14-22 (8h) → overlap 14-15 (1h)
    // Gio 40h And 35h — Turnos mais equilibrados
    g6c: {
      shift: {ms:6, as:15, ns:22},
      morning:   [FOLG('FDS'), GIO('5×2 06–15'), GIO('5×2 06–15'), GIO('5×2 06–15'), GIO('5×2 06–15'), GIO('5×2 06–15'), FOLG('FDS')],
      afternoon: [FOLG('FDS'), AND('5×2 14–22'), AND('5×2 14–22'), AND('5×2 14–22'), AND('5×2 14–22'), AND('5×2 14–22'), FOLG('FDS')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36') : FREE('Cobertura noturna'); })
    },

    // ═══════════════════════════════════════════════════════
    // GABRIEL — REGIMES
    // ═══════════════════════════════════════════════════════
    // gb1: 12×36 19h-07h (legal, ~42h/sem) — padrão
    gb1: {
      morning:   [FOLG('FDS'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), FOLG('FDS')],
      afternoon: [FOLG('FDS'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), FOLG('FDS')],
      night:     GAB_A.map(function(g) { return g ? GAB('12×36 19–07') : NOVO('12×36 Noturno'); })
    },
    // gb2: 5×2 noturno 19h-03h (8h, 40h/sem) → free 2 noites/sem + FDS
    gb2: {
      morning:   [FOLG('FDS'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), FOLG('FDS')],
      afternoon: [FOLG('FDS'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), FOLG('FDS')],
      night:     [FREE('Dom noite'), GAB('5×2 19–03'), GAB('5×2 19–03'), GAB('5×2 19–03'), GAB('5×2 19–03'), GAB('5×2 19–03'), FREE('Sáb noite')]
    },
    // gb3: 6×1 noturno 19h-02h (7h, 42h/sem) → free 1 noite
    gb3: {
      morning:   [FOLG('FDS'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), FOLG('FDS')],
      afternoon: [FOLG('FDS'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), FOLG('FDS')],
      night:     [N, GAB('6×1 19–02'), GAB('6×1 19–02'), GAB('6×1 19–02'), GAB('6×1 19–02'), GAB('6×1 19–02'), GAB('6×1 19–02')]
    },
    // gb4: 12h seg-sex 19h-07h → 60h/sem 🚨 ILEGAL
    gb4: {
      morning:   [FOLG('FDS'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), GIO('5×2'), FOLG('FDS')],
      afternoon: [FOLG('FDS'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), AND('5×2'), FOLG('FDS')],
      night:     [FREE('Dom'), GAB('⚠ 12h ILEGAL', true), GAB('⚠ 12h ILEGAL', true), GAB('⚠ 12h ILEGAL', true), GAB('⚠ 12h ILEGAL', true), GAB('⚠ 12h ILEGAL', true), FREE('Sáb')]
    }
  };
}

// ── LEGEND DATA ───────────────────────────────────────────────
var LEGS = {
  base:  [{n:'Giovanna (5×2)',           c:C.gio}, {n:'Anderson (5×2)',           c:C.and}, {n:'Gabriel (12×36)',          c:C.gab}, {n:'Freelancer / PJ',           c:C.free}],
  atual: [{n:'Giovanna (variável)',       c:C.gio}, {n:'Anderson (variável)',       c:C.and}, {n:'Gabriel (12×36 Noturno)',  c:C.gab}, {n:'Func. X — saindo',           c:C.x}],
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
  s18:   [{n:'Giovanna (6×1)',            c:C.gio}, {n:'Anderson (6×1)',            c:C.and}, {n:'Gabriel ⚠ ILEGAL (6×1)',    c:C.warn},{n:'Folguista (FDS)',            c:C.folg}],
  exA:   [{n:'Giovanna (5×2 · 07h)',     c:C.gio}, {n:'Anderson (5×2 · 14h)',     c:C.and}, {n:'Gabriel (12×36 · 19h)',     c:C.gab}, {n:'Func. FDS',                  c:C.fds}, {n:'Freelancer',  c:C.free}],
  exB:   [{n:'Giovanna (5×2 · 06h)',     c:C.gio}, {n:'Anderson (5×2 · 13h)',     c:C.and}, {n:'Gabriel (12×36 · 22h)',     c:C.gab}, {n:'Func. FDS',                  c:C.fds}, {n:'Freelancer',  c:C.free}],
  // Giovanna 7h
  g7a:   [{n:'Giovanna (5×2 07–15)',     c:C.gio}, {n:'Anderson (5×2 14–19)',    c:C.and}, {n:'Gabriel (12×36)',            c:C.gab}, {n:'Folguista FDS',              c:C.folg}, {n:'Freelancer',  c:C.free}],
  g7b:   [{n:'Giovanna (6×1 07–15)',     c:C.gio}, {n:'Anderson (6×1 14–19)',    c:C.and}, {n:'Gabriel (12×36)',            c:C.gab}, {n:'Freelancer',                 c:C.free}],
  g7c:   [{n:'Giovanna (5×2 07–16)',     c:C.gio}, {n:'Anderson (5×2 15–19)',    c:C.and}, {n:'Gabriel (12×36)',            c:C.gab}, {n:'Folguista FDS',              c:C.folg}, {n:'Freelancer',  c:C.free}],
  // Giovanna 6h
  g6a:   [{n:'Giovanna (5×2 06–14)',     c:C.gio}, {n:'Anderson (5×2 13–22)',    c:C.and}, {n:'Gabriel (12×36 22h)',        c:C.gab}, {n:'Folguista FDS',              c:C.folg}, {n:'Freelancer',  c:C.free}],
  g6b:   [{n:'Giovanna (6×1 06–14)',     c:C.gio}, {n:'Anderson (6×1 13–22)',    c:C.and}, {n:'Gabriel (12×36 22h)',        c:C.gab}, {n:'Freelancer',                 c:C.free}],
  g6c:   [{n:'Giovanna (5×2 06–15)',     c:C.gio}, {n:'Anderson (5×2 14–22)',    c:C.and}, {n:'Gabriel (12×36 22h)',        c:C.gab}, {n:'Folguista FDS',              c:C.folg}, {n:'Freelancer',  c:C.free}],
  // Gabriel
  gb1:   [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',           c:C.and}, {n:'Gabriel (12×36 19–07)',     c:C.gab}, {n:'Novo noturno (12×36)',       c:C.fds}, {n:'Folguista',   c:C.folg}],
  gb2:   [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',           c:C.and}, {n:'Gabriel (5×2 19–03)',       c:C.gab}, {n:'Freelancer noite',           c:C.free}],
  gb3:   [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',           c:C.and}, {n:'Gabriel (6×1 19–02)',       c:C.gab}, {n:'Freelancer noite',           c:C.free}],
  gb4:   [{n:'Giovanna (5×2)',            c:C.gio}, {n:'Anderson (5×2)',           c:C.and}, {n:'Gabriel ⚠ ILEGAL (12h)',   c:C.warn},{n:'Freelancer FDS',              c:C.free}]
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
  var mDur = sc.as - sc.ms;
  var aDur = sc.ns - sc.as;
  var nDur = sc.nDur;
  var mBreak = mDur > 6 ? '1h almoço' : (mDur > 4 ? '15min' : '');
  var aBreak = aDur > 6 ? '1h refeição' : (aDur > 4 ? '15min' : '');
  var nBreak = nDur > 6 ? '1h descanso' : (nDur > 4 ? '15min' : '');
  var rowInfos = [
    { label: '☀️ Manhã', hours: sc.lM, brk: mBreak },
    { label: '🌆 Tarde',  hours: sc.lA, brk: aBreak },
    { label: '🌙 Noite',  hours: sc.lN, brk: nBreak }
  ];

  // Rastreia quais colunas foram consumidas por rowspan (fullDay)
  var colSpanned = [false, false, false, false, false, false, false];

  for (var ri = 0; ri < 3; ri++) {
    html += '<tr>';
    html += '<td class="shift-lbl"><span class="sl-name">' + rowInfos[ri].label + '</span><span class="sl-hours">' + rowInfos[ri].hours + '</span>' + (rowInfos[ri].brk ? '<span class="sl-break">🍽️ ' + rowInfos[ri].brk + '</span>' : '') + '</td>';

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

  // Break bar — info de pausas
  var breaks = [];
  if (mBreak) breaks.push('☀️ Manhã: ' + mBreak + ' (coberta na sobreposição)');
  if (aBreak) breaks.push('🌆 Tarde: ' + aBreak + ' (coberta na sobreposição)');
  if (nBreak) breaks.push('🌙 Noite: ' + nBreak + ' (sozinho)');
  if (breaks.length) {
    html += '<div class="break-bar">';
    for (var bi = 0; bi < breaks.length; bi++) {
      html += '<span class="bb-item">' + breaks[bi] + '</span>';
    }
    html += '</div>';
  }

  // ── Overlap Timeline — mostra sobreposição visual ──
  // Calcula: Anderson chega 1h antes do turno as → overlap de 1h
  // Para 12×36 fullDay, não mostra (não tem manhã/tarde separados)
  var hasFullDay = false;
  var mRow = sched.morning || [];
  for (var fi = 0; fi < mRow.length; fi++) { if (mRow[fi] && mRow[fi].fullDay) hasFullDay = true; }

  if (!hasFullDay) {
    var gioS = sc.ms;
    var gioE = sc.as;           // Giovanna: ms → as
    var andRealS = sc.as - 1;   // Anderson chega 1h antes
    var andE = sc.ns;            // Anderson: até ns
    var gabS = sc.ns;            // Gabriel: ns em diante
    var gabE = sc.ms + 24;       // até ms (+1 dia)
    var ovS = andRealS;
    var ovE = sc.as;
    var ovH = ovE - ovS;

    // Se não tem overlap (turnos sequenciais sem ajuste), alertar
    if (ovH <= 0) {
      ovH = 0;
      andRealS = sc.as; // sem ajuste
    }

    // Range visual: ms-2 até ns+1
    var RS = Math.max(0, gioS - 1);
    var RE = Math.min(24, andE + 1);
    var RNG = RE - RS;

    function tlPct(h) { return ((h - RS) / RNG * 100).toFixed(1); }
    function tlW(s, e) { return ((e - s) / RNG * 100).toFixed(1); }

    html += '<div class="ov-timeline">';
    html += '<div class="ov-title">Sobreposição diária (seg–sex)</div>';

    // Ruler
    html += '<div class="ov-ruler">';
    for (var rh = RS; rh <= RE; rh += 2) {
      html += '<span style="left:' + tlPct(rh) + '%">' + ph(rh) + '</span>';
    }
    html += '</div>';

    // Giovanna bar
    html += '<div class="ov-row">';
    html += '<div class="ov-lbl" style="color:#be123c">Giovanna</div>';
    html += '<div class="ov-track">';
    html += '<div class="ov-bar" style="left:'+tlPct(gioS)+'%;width:'+tlW(gioS,gioE)+'%;background:#be123c">';
    html += '<span>'+ph(gioS)+'–'+ph(gioE)+'</span></div>';
    // Pausa
    if (gioE - gioS > 6) {
      var gP = gioS + Math.floor((gioE - gioS)/2);
      html += '<div class="ov-pause" style="left:'+tlPct(gP)+'%">🍽️</div>';
    }
    html += '</div></div>';

    // Overlap bar
    if (ovH > 0) {
      html += '<div class="ov-row ov-row-overlap">';
      html += '<div class="ov-lbl" style="color:#6366f1;font-size:.58rem">⟷ Overlap</div>';
      html += '<div class="ov-track">';
      html += '<div class="ov-bar ov-bar-purple" style="left:'+tlPct(ovS)+'%;width:'+tlW(ovS,ovE)+'%">';
      html += '<span>'+ovH+'h</span></div>';
      html += '</div></div>';
    } else {
      html += '<div class="ov-row ov-row-overlap">';
      html += '<div class="ov-lbl" style="color:var(--red);font-size:.58rem">⚠ Sem overlap</div>';
      html += '<div class="ov-track"><div class="ov-warn">Turnos sequenciais — sem cobertura de almoço mútua</div></div></div>';
    }

    // Anderson bar
    html += '<div class="ov-row">';
    html += '<div class="ov-lbl" style="color:#1d4ed8">Anderson</div>';
    html += '<div class="ov-track">';
    html += '<div class="ov-bar" style="left:'+tlPct(andRealS)+'%;width:'+tlW(andRealS,andE)+'%;background:#1d4ed8">';
    html += '<span>'+ph(andRealS)+'–'+ph(andE)+'</span></div>';
    if (andE - andRealS > 6) {
      var aP = andRealS + Math.floor((andE - andRealS)/2) + 1;
      html += '<div class="ov-pause" style="left:'+tlPct(aP)+'%">🍽️</div>';
    }
    html += '</div></div>';

    // Gabriel bar
    html += '<div class="ov-row">';
    html += '<div class="ov-lbl" style="color:#047857">Gabriel</div>';
    html += '<div class="ov-track">';
    html += '<div class="ov-bar" style="left:'+tlPct(gabS)+'%;width:'+tlW(gabS,RE)+'%;background:#047857;border-radius:4px 0 0 4px">';
    html += '<span>'+ph(gabS)+'→'+ph(sc.ms)+'</span></div>';
    html += '</div></div>';

    // Summary
    html += '<div class="ov-summary">';
    if (ovH > 0) {
      html += '<span class="ov-ok">✅ Anderson chega às '+ph(andRealS)+'h (1h antes) → '+ovH+'h de sobreposição → cobertura mútua de almoço</span>';
    }
    html += '</div>';
    html += '</div>';
  } // end if (!hasFullDay)

  // Usamos o container pai (sched-wrap) para limpar e re-renderizar tudo
  var wrapEl = tableTarget.parentElement;
  if (wrapEl) {
    wrapEl.innerHTML = html;
  } else {
    tableTarget.outerHTML = html;
  }
}

// ── OVERLAP GRID — Visualização com timeline e sobreposição ───
// schedReal = { days: [ {gio:{s,e}, and:{s,e}, gab:{s,e,label}}, ... ] }
// 7 entries: Dom(0)...Sáb(6)
function buildOverlapGrid(targetId, schedReal) {
  var el = gi(targetId);
  if (!el) return;

  var RANGE_START = 6, RANGE_END = 20; // 6h-20h visible range (14h)
  var RANGE = RANGE_END - RANGE_START;

  function pct(h) { return ((h - RANGE_START) / RANGE * 100).toFixed(1); }
  function barW(s, e) { return ((e - s) / RANGE * 100).toFixed(1); }

  var html = '<table class="og-table"><thead><tr><th class="og-corner"></th>';
  for (var d = 0; d < 7; d++) {
    html += '<th class="' + (d === 0 ? 'og-sun' : '') + '">' + DAY_NAMES[d] + '</th>';
  }
  html += '</tr></thead><tbody>';

  // --- Hour ruler row ---
  html += '<tr class="og-ruler-row"><td class="og-lbl"></td>';
  for (var d = 0; d < 7; d++) {
    html += '<td class="og-ruler"><div class="og-ruler-inner">';
    for (var h = RANGE_START; h <= RANGE_END; h += 2) {
      html += '<span style="left:' + pct(h) + '%">' + h + '</span>';
    }
    html += '</div></td>';
  }
  html += '</tr>';

  // --- Giovanna row ---
  html += '<tr><td class="og-lbl"><span class="og-dot" style="background:#be123c"></span>Giovanna</td>';
  for (var d = 0; d < 7; d++) {
    var day = schedReal[d];
    html += '<td class="og-cell">';
    if (day && day.gio) {
      html += '<div class="og-bar-wrap">';
      html += '<div class="og-bar" style="left:'+pct(day.gio.s)+'%;width:'+barW(day.gio.s,day.gio.e)+'%;background:#be123c">';
      html += '<span class="og-bar-lbl">' + ph(day.gio.s) + '–' + ph(day.gio.e) + '</span>';
      html += '</div>';
      // Pause marker
      if (day.gio.e - day.gio.s > 6) {
        var pauseH = day.gio.s + Math.floor((day.gio.e - day.gio.s) / 2);
        html += '<div class="og-pause" style="left:'+pct(pauseH)+'%">🍽️</div>';
      }
      html += '</div>';
    } else {
      html += '<div class="og-empty">Folga</div>';
    }
    html += '</td>';
  }
  html += '</tr>';

  // --- Overlap row ---
  html += '<tr class="og-overlap-row"><td class="og-lbl og-lbl-overlap">⟷ Overlap</td>';
  for (var d = 0; d < 7; d++) {
    var day = schedReal[d];
    html += '<td class="og-cell">';
    if (day && day.gio && day.and) {
      var ovS = Math.max(day.gio.s, day.and.s);
      var ovE = Math.min(day.gio.e, day.and.e);
      if (ovE > ovS) {
        var hrs = ovE - ovS;
        html += '<div class="og-bar-wrap">';
        html += '<div class="og-bar og-bar-overlap" style="left:'+pct(ovS)+'%;width:'+barW(ovS,ovE)+'%">';
        html += '<span class="og-bar-lbl">' + hrs + 'h</span>';
        html += '</div></div>';
      } else {
        html += '<div class="og-empty og-empty-warn">0h ⚠</div>';
      }
    } else {
      html += '<div class="og-empty og-empty-crit">—</div>';
    }
    html += '</td>';
  }
  html += '</tr>';

  // --- Anderson row ---
  html += '<tr><td class="og-lbl"><span class="og-dot" style="background:#1d4ed8"></span>Anderson</td>';
  for (var d = 0; d < 7; d++) {
    var day = schedReal[d];
    html += '<td class="og-cell">';
    if (day && day.and) {
      html += '<div class="og-bar-wrap">';
      html += '<div class="og-bar" style="left:'+pct(day.and.s)+'%;width:'+barW(day.and.s,day.and.e)+'%;background:#1d4ed8">';
      html += '<span class="og-bar-lbl">' + ph(day.and.s) + '–' + ph(day.and.e) + '</span>';
      html += '</div>';
      if (day.and.e - day.and.s > 6) {
        var pauseH = day.and.s + Math.floor((day.and.e - day.and.s) / 2) + 1;
        html += '<div class="og-pause" style="left:'+pct(pauseH)+'%">🍽️</div>';
      }
      html += '</div>';
    } else {
      html += '<div class="og-empty">Folga</div>';
    }
    html += '</td>';
  }
  html += '</tr>';

  // --- Gabriel row ---
  html += '<tr><td class="og-lbl"><span class="og-dot" style="background:#047857"></span>Gabriel</td>';
  for (var d = 0; d < 7; d++) {
    var day = schedReal[d];
    html += '<td class="og-cell">';
    if (day && day.gab) {
      html += '<div class="og-bar-wrap">';
      // Night shift: show as bar from ns to edge
      html += '<div class="og-bar og-bar-night" style="left:'+pct(day.gab.s)+'%;width:'+barW(day.gab.s, RANGE_END)+'%;background:#047857">';
      html += '<span class="og-bar-lbl">' + day.gab.label + '</span>';
      html += '</div>';
      html += '<div class="og-pause" style="left:96%">💤</div>';
      html += '</div>';
    } else {
      html += '<div class="og-empty">' + (day && day.gabLabel ? day.gabLabel : 'Folga 12×36') + '</div>';
    }
    html += '</td>';
  }
  html += '</tr>';

  html += '</tbody></table>';

  el.innerHTML = html;
}

// ── ATUAL REAL SCHEDULE DATA ──────────────────────────────────
var ATUAL_REAL = [
  null, // Dom: todos folgam diurno
  {gio:{s:7,e:16}, and:{s:11,e:19}, gab:{s:19,e:7, label:'19–07'}},  // Seg
  {gio:{s:7,e:15}, and:{s:10,e:19}, gab:{s:19,e:7, label:'19–07'}},  // Ter
  {gio:{s:7,e:15}, and:{s:11,e:19}, gab:{s:19,e:7, label:'19–07'}},  // Qua
  {gio:{s:7,e:16}, and:{s:10,e:19}, gab:{s:19,e:7, label:'19–07'}},  // Qui
  {gio:{s:7,e:16}, and:{s:10,e:19}, gab:{s:19,e:7, label:'19–07'}},  // Sex
  {gio:{s:7,e:13}, and:{s:13,e:19}, gab:{s:19,e:7, label:'19–07'}}   // Sáb
];

// ── RENDER ALL TABLES ─────────────────────────────────────────
function renderAll() {
  if (!SCENARIOS_DATA) SCENARIOS_DATA = buildScenarios();
  // Atual: overlap grid (real hours)
  buildOverlapGrid('og-atual', ATUAL_REAL);
  // Atual: standard grid too
  buildTable('gantt-atual', 'leg-atual', SCENARIOS_DATA.atual, 'atual');
  // Pausas: Modelo A e B
  buildTable('gantt-exA',   'leg-exA',  SCENARIOS_DATA.exA,   'exA');
  buildTable('gantt-exB',   'leg-exB',  SCENARIOS_DATA.exB,   'exB');
  // Giovanna 7h
  buildTable('gantt-g7a',   'leg-g7a',  SCENARIOS_DATA.g7a,   'g7a');
  buildTable('gantt-g7b',   'leg-g7b',  SCENARIOS_DATA.g7b,   'g7b');
  buildTable('gantt-g7c',   'leg-g7c',  SCENARIOS_DATA.g7c,   'g7c');
  // Giovanna 6h
  buildTable('gantt-g6a',   'leg-g6a',  SCENARIOS_DATA.g6a,   'g6a');
  buildTable('gantt-g6b',   'leg-g6b',  SCENARIOS_DATA.g6b,   'g6b');
  buildTable('gantt-g6c',   'leg-g6c',  SCENARIOS_DATA.g6c,   'g6c');
  // Gabriel
  buildTable('gantt-gb1',   'leg-gb1',  SCENARIOS_DATA.gb1,   'gb1');
  buildTable('gantt-gb2',   'leg-gb2',  SCENARIOS_DATA.gb2,   'gb2');
  buildTable('gantt-gb3',   'leg-gb3',  SCENARIOS_DATA.gb3,   'gb3');
  buildTable('gantt-gb4',   'leg-gb4',  SCENARIOS_DATA.gb4,   'gb4');
}

// ── LABEL UPDATES ─────────────────────────────────────────────
function updateLabels() {
  // Labels are now hardcoded in HTML tables per scenario
  // Only dynamic labels are in the Contratos section (handled by calcAll)
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
    { n:'0 · Situação Atual',              rt:'—',    gio:'variável',   and:'variável',  gab:'12×36',   ov:'4–6h',  dom:'❌',clt:'✅ ~44h',     pau:'1h mútua'},
    { n:'G7A · Gio 5×2 07–15',             rt:'★★★', gio:'5×2 35h',    and:'5×2 25h',   gab:'12×36',   ov:'1h ✅',  dom:'❌',clt:'✅ OK',       pau:'1h+15min', rec:true},
    { n:'G7B · Gio 6×1 07–15',             rt:'★★☆', gio:'6×1 42h',    and:'6×1 30h',   gab:'12×36',   ov:'1h ✅',  dom:'❌',clt:'✅ OK',       pau:'1h+15min'},
    { n:'G7C · Gio 5×2 07–16 (2h ov)',     rt:'★★★', gio:'5×2 40h',    and:'5×2 20h',   gab:'12×36',   ov:'2h ✅✅',dom:'❌',clt:'✅ OK',       pau:'1h+0', rec:true},
    { n:'G6A · Gio 5×2 06–14',             rt:'★★★', gio:'5×2 35h',    and:'5×2 40h',   gab:'12×36 22h',ov:'1h ✅', dom:'❌',clt:'✅ OK',       pau:'1h+1h', rec:true},
    { n:'G6B · Gio 6×1 06–14',             rt:'★★☆', gio:'6×1 42h',    and:'6×1 48h⚠',  gab:'12×36 22h',ov:'1h ✅', dom:'❌',clt:'⚠ BH',       pau:'1h+1h'},
    { n:'G6C · Gio 5×2 06–15 (equil.)',    rt:'★★★', gio:'5×2 40h',    and:'5×2 35h',   gab:'12×36 22h',ov:'1h ✅', dom:'❌',clt:'✅ OK',       pau:'1h+1h', rec:true},
    { n:'GB1 · Gab 12×36 19h',             rt:'★★★', gio:'—',          and:'—',         gab:'12×36 42h',ov:'—',     dom:'—', clt:'✅ Art.59-A', pau:'1h desc', rec:true},
    { n:'GB2 · Gab 5×2 19–03h',            rt:'★★☆', gio:'—',          and:'—',         gab:'5×2 40h',  ov:'—',     dom:'—', clt:'✅ OK',       pau:'1h gap03–07'},
    { n:'GB3 · Gab 6×1 19–02h',            rt:'★★☆', gio:'—',          and:'—',         gab:'6×1 42h',  ov:'—',     dom:'—', clt:'✅ OK',       pau:'1h gap02–07'},
    { n:'GB4 · Gab 12h seg–sex 🚨',        rt:'✗',    gio:'—',          and:'—',         gab:'60h/sem',  ov:'—',     dom:'—', clt:'🚨 ILEGAL',  pau:'N/A', bad:true}
  ];

  var tbody = gi('cmp-body');
  if (!tbody) return;

  var html = '';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var rowClass = r.rec ? 'rec' : r.bad ? 'bad' : '';
    html += '<tr class="' + rowClass + '">' +
      '<td><strong>' + r.n + '</strong></td>' +
      '<td class="center">' + r.rt + '</td>' +
      '<td style="font-size:.66rem">' + r.gio + '</td>' +
      '<td style="font-size:.66rem">' + r.and + '</td>' +
      '<td style="font-size:.66rem">' + r.gab + '</td>' +
      '<td class="center" style="font-size:.66rem">' + r.ov + '</td>' +
      '<td class="center">' + r.dom + '</td>' +
      '<td style="font-size:.66rem">' + r.clt + '</td>' +
      '<td style="font-size:.64rem">' + r.pau + '</td>' +
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

// ── SIDEBAR NAVIGATION ────────────────────────────────────────
function navigateTo(sectionId) {
  var el = gi(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
    var navEl = document.querySelector('.nav-item[data-section="' + sectionId + '"]');
    if (navEl) navEl.classList.add('active');
    // Close mobile sidebar
    closeSidebar();
  }
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
  document.querySelector('.sidebar-overlay').classList.toggle('show');
}
function closeSidebar() {
  document.querySelector('.sidebar').classList.remove('open');
  document.querySelector('.sidebar-overlay').classList.remove('show');
}

// Track scroll to highlight active nav item
function initScrollSpy() {
  var sections = document.querySelectorAll('.section[id]');
  var navItems = document.querySelectorAll('.nav-item[data-section]');
  if (!sections.length) return;
  
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        navItems.forEach(function(n) { n.classList.remove('active'); });
        var match = document.querySelector('.nav-item[data-section="' + entry.target.id + '"]');
        if (match) match.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -70% 0px' });
  
  sections.forEach(function(s) { observer.observe(s); });
}

// ── INIT ──────────────────────────────────────────────────────
function init() {
  try {
    var d = new Date().toLocaleDateString('pt-BR');
    se('gen-date', d);
    se('footer-date', d);
    se('topbar-date', d);
    renderAll();
    calcAll();
    initScrollSpy();
  } catch (err) {
    console.error('Erro na inicialização da escala:', err);
  }
}

// ── EXPÕE FUNÇÕES GLOBALMENTE ─────────────────────────────────
window.showTab = showTab;
window.init    = init;
window.selectCard = selectCard;
window.cellClick = cellClick;
window.navigateTo = navigateTo;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.buildOverlapGrid = buildOverlapGrid;

document.addEventListener('DOMContentLoaded', init);
