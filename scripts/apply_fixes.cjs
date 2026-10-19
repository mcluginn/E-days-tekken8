const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function applyFixesToFile(filePath, isStudentMode = false) {
  console.log(`[Apply Fixes] Processing: ${path.basename(filePath)}...`);
  let html = fs.readFileSync(filePath, 'utf8');

  // -------------------------------------------------------------
  // 1. UPDATE TAILWIND CONFIGURATION
  // -------------------------------------------------------------
  const oldTailwindConfig = /colors:\s*\{[\s\S]*?theme:\s*\{[\s\S]*?slate:\s*['"]#94a3b8['"]\s*\}\s*\},[\s\S]*?boxShadow:\s*\{[\s\S]*?'tactical':\s*['"][^'"]+['"]\s*\}/;
  const newTailwindConfig = `colors: {
              obsidian: '#110d0d',
              cardBg: '#1c1412',
              cardHover: '#2b1d19',
              cardSubtle: '#160f0e',
              electric: {
                400: '#fbbf24',
                500: '#f59e0b',
                DEFAULT: '#f59e0b',
              },
              mishima: {
                300: '#fef08a',
                400: '#f59e0b',
                500: '#d97706',
              },
              theme: {
                main: '#110d0d',
                card: '#1c1412',
                subtle: '#160f0e',
                hover: '#2b1d19',
                border: '#57201c',
                borderSubtle: '#3d1614',
                gold: '#f59e0b',
                brass: '#fde047',
                crimson: '#991b1b',
                maroon: '#7f1d1d',
                slate: '#a89f91'
              }
            },
            boxShadow: {
              'electric': '0 0 20px -3px rgba(245, 158, 11, 0.45)',
              'electric-lg': '0 0 35px -4px rgba(234, 179, 8, 0.55)',
              'mishima': '0 0 25px -3px rgba(245, 158, 11, 0.5)',
              'gold': '0 0 20px -3px rgba(245, 158, 11, 0.5)',
              'card': '0 10px 25px -5px rgba(17, 13, 13, 0.8), 0 8px 10px -6px rgba(17, 13, 13, 0.8)',
              'tactical': '0 0 20px -3px rgba(245, 158, 11, 0.45)'
            }`;

  if (oldTailwindConfig.test(html)) {
    html = html.replace(oldTailwindConfig, newTailwindConfig);
    console.log('  -> Updated Tailwind theme colors');
  }

  // -------------------------------------------------------------
  // 2. UPDATE ROOT CSS VARIABLES & BASE STYLES
  // -------------------------------------------------------------
  const oldRootCss = /:root\s*\{[\s\S]*?--text-gold:\s*#f7b943;\s*\}\s*\*[\s\S]*?body\s*\{[\s\S]*?overflow-x:\s*hidden;\s*\}/;
  const newRootCss = `:root {
      --bg-main: #110d0d;
      --bg-card: #1c1412;
      --bg-card-subtle: #160f0e;
      --bg-card-hover: #2b1d19;
      --border-main: #57201c;
      --border-subtle: #3d1614;
      --border-gold: #f59e0b;
      --border-crimson: #991b1b;
      --text-white: #fdfaf7;
      --text-slate: #a89f91;
      --text-gold: #f59e0b;
      --text-amber: #fbbf24;
      --text-crimson: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #110d0d;
      background-image: 
        radial-gradient(circle at 50% 0%, rgba(153, 27, 27, 0.28) 0%, transparent 65%),
        radial-gradient(circle at 50% 100%, rgba(127, 29, 29, 0.22) 0%, transparent 60%),
        radial-gradient(circle at 10% 30%, rgba(245, 158, 11, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 90% 70%, rgba(245, 158, 11, 0.08) 0%, transparent 45%),
        linear-gradient(135deg, rgba(17, 13, 13, 0.96) 0%, rgba(26, 18, 16, 0.93) 50%, rgba(17, 13, 13, 0.98) 100%);
      background-attachment: fixed;
      color: #fdfaf7;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }`;

  if (oldRootCss.test(html)) {
    html = html.replace(oldRootCss, newRootCss);
    console.log('  -> Updated root CSS & body background');
  }

  // Scrollbar and Grid Pattern styling
  html = html.replace(/::-webkit-scrollbar-track\s*\{\s*background:\s*#06162f;\s*\}/g, '::-webkit-scrollbar-track { background: #110d0d; }');
  html = html.replace(/::-webkit-scrollbar-thumb\s*\{\s*background:\s*#2c4f75;\s*border-radius:\s*9999px;\s*border:\s*2px\s*solid\s*#06162f;\s*\}/g,
    '::-webkit-scrollbar-thumb { background: #57201c; border-radius: 9999px; border: 2px solid #110d0d; }');
  html = html.replace(/::-webkit-scrollbar-thumb:hover\s*\{\s*background:\s*#f7b943;\s*\}/g, '::-webkit-scrollbar-thumb:hover { background: #f59e0b; }');
  html = html.replace(/rgba\(44,\s*79,\s*117,\s*0\.12\)/g, 'rgba(87, 32, 28, 0.2)');

  // Score button & nav-tab styling
  html = html.replace(/\.score-button\s*\{[\s\S]*?user-select:\s*none;\s*\}/g,
    `.score-button { width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; background: #1c1412; border: 1px solid #57201c; color: #fdfaf7; font-weight: bold; font-size: 13px; transition: all 0.15s; user-select: none; }`);
  html = html.replace(/\.score-button:hover\s*\{[\s\S]*?\}/g,
    `.score-button:hover { background: #2b1d19; border-color: #f59e0b; color: #ffffff; }`);
  html = html.replace(/\.nav-tab\.active-tab\s*\{[\s\S]*?\}/g,
    `.nav-tab.active-tab { background-color: #2b1d19; color: #f59e0b; border-color: rgba(245, 158, 11, 0.6); font-weight: 600; }`);

  // -------------------------------------------------------------
  // 3. UPDATE CONNECTOR LINES CSS IN STYLE TAG
  // -------------------------------------------------------------
  const oldConnectorCss = /\.connector-active\s*\{[\s\S]*?filter:\s*drop-shadow\(0 0 5px rgba\(0, 240, 255, 0\.8\)\)[^;]*;[\s\S]*?\}/;
  const newConnectorCss = `.connector-active {
      stroke: #fbbf24 !important;
      stroke-width: 3.5 !important;
      opacity: 1 !important;
      filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.95)) drop-shadow(0 0 14px rgba(234, 179, 8, 0.6)) !important;
    }
    .connector-inactive {
      stroke: #b45309 !important;
      stroke-width: 2.2 !important;
      stroke-dasharray: 6 4 !important;
      opacity: 0.85 !important;
      filter: drop-shadow(0 0 4px rgba(217, 119, 6, 0.65)) !important;
    }`;

  if (oldConnectorCss.test(html)) {
    html = html.replace(oldConnectorCss, newConnectorCss);
    console.log('  -> Updated connector line CSS (Gold & Amber)');
  }

  // Ensure .match-node has z-index: 30
  html = html.replace(/\.match-node\s*\{\s*position:\s*relative;\s*\}/g, `.match-node {\n      position: relative;\n      z-index: 30;\n    }`);

  // -------------------------------------------------------------
  // 4. UPDATE BODY TAG & AMBIENT BACKGROUND LAYER
  // -------------------------------------------------------------
  const oldBodyTag1 = '<body class="bg-[#030b17] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-cyan-500 selection:text-white student-mode">';
  const oldBodyTag2 = '<body class="bg-[#030b17] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-cyan-500 selection:text-white ">';

  const newBodyTag = isStudentMode
    ? '<body class="bg-[#110d0d] text-[#fdfaf7] min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-black student-mode bracket-lines-front">'
    : '<body class="bg-[#110d0d] text-[#fdfaf7] min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-black bracket-lines-front">';

  html = html.replace(oldBodyTag1, newBodyTag);
  html = html.replace(oldBodyTag2, newBodyTag);

  // Update site ambient background gradients
  const oldAmbientBg = /<div id="site-ambient-bg"[\s\S]*?class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-\[#00f0ff\]\/50 to-transparent"><\/div>\s*<\/div>/;
  const newAmbientBg = `<div id="site-ambient-bg" class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div id="site-ambient-bg-image" class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 filter contrast-125 brightness-95" style="background-image: url('./assets/official/meodl_banner_league.jpg');"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-[#110d0d]/92 via-[#160f0e]/85 to-[#110d0d]/98"></div>
    <div class="absolute inset-0" style="background: radial-gradient(ellipse at 50% 25%, transparent 20%, rgba(22, 15, 14, 0.75) 65%, rgba(17, 13, 13, 0.98) 100%);"></div>
    <div class="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-red-900/20 via-amber-700/10 to-transparent"></div>
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f59e0b]/50 to-transparent"></div>
  </div>`;

  if (oldAmbientBg.test(html)) {
    html = html.replace(oldAmbientBg, newAmbientBg);
    console.log('  -> Updated site ambient background to Engineering Days dark charcoal');
  }

  // -------------------------------------------------------------
  // 5. UPDATE HEADER BAR
  // -------------------------------------------------------------
  // Header background & border
  html = html.replace(/<header class="sticky top-0 z-40 bg-\[#06162f\]\/95 backdrop-blur-xl border-b border-\[#1e3a5f\]/g,
    '<header class="sticky top-0 z-40 bg-[#160f0e]/95 backdrop-blur-xl border-b border-[#57201c]');

  // Header Logo container
  html = html.replace(/<div class="w-10 h-10 rounded-xl p-0\.5 bg-gradient-to-tr from-\[#f7b943\] via-\[#0a2344\] to-\[#f7b943\] shadow-electric hover:scale-105 transition-transform overflow-hidden">\s*<img src="\.\/assets\/esc_logo\.jpg" alt="Engineering Days Logo" class="w-full h-full object-cover rounded-lg">\s*<\/div>/g,
    `<div class="w-10 h-10 rounded-xl p-0.5 bg-gradient-to-tr from-amber-500 via-red-950 to-amber-500 shadow-md hover:scale-105 transition-transform overflow-hidden flex items-center justify-center">
            <img src="./assets/esc_logo.jpg" alt="Engineering Days Logo" class="w-full h-full object-contain rounded-lg">
          </div>`);

  // Header title gradient & badge
  html = html.replace(/bg-gradient-to-r from-\[#ffd477\] via-\[#f7b943\] to-sky-300/g,
    'bg-gradient-to-r from-[#fef08a] via-[#f59e0b] to-red-400');

  // Header button colors
  html = html.replace(/bg-\[#0a2344\] hover:bg-\[#102d52\] border border-\[#2c4f75\] text-xs font-mono font-bold text-cyan-300/g,
    'bg-[#1c1412] hover:bg-[#2b1d19] border border-amber-600/40 text-xs font-mono font-bold text-amber-300');

  html = html.replace(/bg-cyan-950\/60 hover:bg-cyan-900\/80 border border-cyan-800 text-xs font-mono font-bold text-cyan-300/g,
    'bg-red-950/60 hover:bg-red-900/80 border border-amber-600/40 text-xs font-mono font-bold text-amber-300');

  html = html.replace(/bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-xs font-mono font-bold text-cyan-300/g,
    'bg-red-950/80 hover:bg-red-900 border border-amber-600/50 text-xs font-mono font-bold text-amber-300');

  // -------------------------------------------------------------
  // 6. UPDATE SUB-NAVIGATION & TEKKEN 8 CONTAINER
  // -------------------------------------------------------------
  html = html.replace(/<div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-\[#06162f\] via-\[#06162f\]\/50 to-\[#06162f\]\/90 z-0"><\/div>/g,
    '<div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#110d0d] via-[#110d0d]/50 to-[#110d0d]/90 z-0"></div>');

  html = html.replace(/style="background: radial-gradient\(ellipse at 50% 30%, transparent 15%, rgba\(6, 22, 47, 0\.7\) 60%, rgba\(6, 22, 47, 0\.98\) 100%\);"/g,
    'style="background: radial-gradient(ellipse at 50% 30%, transparent 15%, rgba(22, 15, 14, 0.75) 60%, rgba(17, 13, 13, 0.98) 100%);"');

  html = html.replace(/class="z-20 px-4 sm:px-6 py-2\.5 bg-\[#06162f\]\/90 border-b border-\[#2c4f75\] backdrop-blur-md/g,
    'class="z-20 px-4 sm:px-6 py-2.5 bg-[#160f0e]/95 border-b border-[#57201c] backdrop-blur-md');

  html = html.replace(/bg-\[#0a2344\] border border-\[#2c4f75\] text-xs font-mono shrink-0/g,
    'bg-[#1c1412] border border-[#57201c] text-xs font-mono shrink-0');

  html = html.replace(/active-tab bg-\[#102d52\] text-\[#f7b943\] border border-\[#f7b943\]\/40 font-semibold shadow-sm/g,
    'active-tab bg-[#2b1d19] text-[#f59e0b] border border-[#f59e0b]/60 font-semibold shadow-sm');

  // Floating Navigation Hint Pill in #view-full
  html = html.replace(/<div class="absolute top-4 left-6 z-30 pointer-events-none hidden md:flex items-center gap-3 bg-\[#06162f\]\/95 border border-\[#2c4f75\] backdrop-blur-md px-4 py-2 rounded-full text-\[11px\] text-slate-300 shadow-xl">\s*<img src="\.\/assets\/mes_logo\.png" alt="MES" class="w-4 h-4 rounded-full">\s*<span>UPHSD Mechanical Engineering Society Tekken 8 Championship<\/span>\s*<span class="text-\[#2c4f75\]">[^<]*<\/span>\s*<span class="text-cyan-400">Scroll horizontally to view all rounds<\/span>\s*<\/div>/g,
    `<div class="absolute top-4 left-6 z-30 pointer-events-none hidden md:flex items-center gap-3 bg-[#160f0e]/95 border border-[#57201c] backdrop-blur-md px-4 py-2 rounded-full text-[11px] text-slate-300 shadow-xl">
          <img src="./assets/esc_logo.jpg" alt="Engineering Days Logo" class="w-4 h-4 rounded-full object-contain">
          <span>Engineering Days 2026 • Tekken 8 Championship</span>
          <span class="text-[#57201c]">•</span>
          <span class="text-amber-400">Scroll horizontally to view all rounds</span>
        </div>`);

  // Floating Zoom & Lines Controls Pill
  html = html.replace(/<div class="absolute top-4 right-6 z-30 flex items-center gap-2 bg-\[#06162f\]\/95 border border-\[#2c4f75\] backdrop-blur-md px-3 py-1\.5 rounded-full shadow-xl">/g,
    '<div class="absolute top-4 right-6 z-30 flex items-center gap-2 bg-[#160f0e]/95 border border-[#57201c] backdrop-blur-md px-3 py-1.5 rounded-full shadow-xl">');

  // Toggle Lines Button in full view
  html = html.replace(/<button id="btn-tekken-toggle-lines" onclick="toggleBracketLines\(\)" class="px-2\.5 py-1 rounded-lg bg-cyan-950\/80 hover:bg-cyan-900 border border-cyan-500\/80 text-\[11px\] font-mono font-bold text-cyan-300 flex items-center gap-1 transition-all shadow-sm" title="Toggle Bracket Connector Lines">\s*<span>[^<]*<\/span>\s*<\/button>/g,
    `<button id="btn-tekken-toggle-lines" onclick="toggleBracketLines()" class="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/80 text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1 transition-all shadow-sm" title="Toggle Bracket Connector Lines">
            <span>⚡ Lines: In Front</span>
          </button>`);

  // -------------------------------------------------------------
  // 7. UPDATE SVG CONNECTOR DEFINITIONS IN HTML
  // -------------------------------------------------------------
  const oldSvgBlock = /<svg id="bracket-svg"[\s\S]*?<\/svg>/;
  const newSvgBlock = `<svg id="bracket-svg" class="absolute top-0 left-0 pointer-events-none w-full h-full" style="min-width: 2900px; min-height: 2200px;">
              <defs>
                <filter id="tekken-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="#f59e0b" flood-opacity="0.8"/>
                </filter>
                <filter id="tekken-glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4.5" flood-color="#fbbf24" flood-opacity="0.95"/>
                </filter>
                <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#b45309" stop-opacity="0.9"/>
                  <stop offset="100%" stop-color="#f59e0b" stop-opacity="1"/>
                </linearGradient>
                <linearGradient id="crimson-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#7f1d1d" stop-opacity="0.9"/>
                  <stop offset="100%" stop-color="#991b1b" stop-opacity="1"/>
                </linearGradient>
              </defs>
            </svg>`;

  if (oldSvgBlock.test(html)) {
    html = html.replace(oldSvgBlock, newSvgBlock);
    console.log('  -> Updated bracket-svg defs (Gold/Amber & Crimson gradients)');
  }

  // -------------------------------------------------------------
  // 8. UPDATE BRACKET SECTION HEADERS & COLUMNS
  // -------------------------------------------------------------
  // Winners section title
  html = html.replace(/<div class="w-2\.5 h-2\.5 rounded-full bg-cyan-400 shadow-electric"><\/div>\s*<h2 class="text-sm font-bold uppercase tracking-wider text-cyan-300 font-mono">\s*Winners Bracket \(Top Seed Path\)\s*<\/h2>/g,
    `<div class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]"></div>
                  <h2 class="text-sm font-bold uppercase tracking-wider text-amber-300 font-mono">
                    Winners Bracket (Top Seed Path)
                  </h2>`);

  // Sticky column headers
  html = html.replace(/bg-\[#06162f\]\/95 backdrop-blur-md py-1\.5 px-3 rounded-lg border border-\[#2c4f75\] text-xs font-mono font-bold text-slate-200 flex justify-between shadow-sm/g,
    'bg-[#160f0e]/95 backdrop-blur-md py-1.5 px-3 rounded-lg border border-[#57201c] text-xs font-mono font-bold text-slate-200 flex justify-between shadow-sm');

  // Winners finals sticky header
  html = html.replace(/border border-\[#38bdf8\]\/60 text-xs font-mono font-bold text-cyan-300/g,
    'border border-amber-500/60 text-xs font-mono font-bold text-amber-300');

  // Grand Finals section divider & title
  html = html.replace(/<div class="pt-4 border-t border-\[#2c4f75\]\/60">\s*<div class="flex items-center gap-2\.5 mb-4 pl-2">\s*<div class="w-2\.5 h-2\.5 rounded-full bg-\[#f7b943\] shadow-mishima"><\/div>\s*<h2 class="text-sm font-bold uppercase tracking-wider text-\[#f7b943\] font-mono">\s*Grand Finals Championship\s*<\/h2>/g,
    `<div class="pt-4 border-t border-[#57201c]/80">
                <div class="flex items-center gap-2.5 mb-4 pl-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_10px_#f59e0b]"></div>
                  <h2 class="text-sm font-bold uppercase tracking-wider text-[#fbbf24] font-mono">
                    Grand Finals Championship
                  </h2>`);

  // Losers section divider & title
  html = html.replace(/<div class="pt-4 border-t border-\[#2c4f75\]\/60">\s*<div class="flex items-center gap-2\.5 mb-4 pl-2">\s*<div class="w-2\.5 h-2\.5 rounded-full bg-red-400 shadow-lg"><\/div>\s*<h2 class="text-sm font-bold uppercase tracking-wider text-red-300 font-mono">\s*Losers Bracket \(Redemption Path\)\s*<\/h2>/g,
    `<div class="pt-4 border-t border-[#57201c]/80">
                <div class="flex items-center gap-2.5 mb-4 pl-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"></div>
                  <h2 class="text-sm font-bold uppercase tracking-wider text-red-300 font-mono">
                    Losers Bracket (Redemption Path)
                  </h2>`);

  // Losers finals sticky header
  html = html.replace(/border border-red-500\/60 text-xs font-mono font-bold text-red-300/g,
    'border border-red-600/70 text-xs font-mono font-bold text-red-300');

  // -------------------------------------------------------------
  // 9. FIX MATCH CARD HTML GENERATION (createMatchCardHTML)
  // -------------------------------------------------------------
  const oldCreateMatchCard = /function createMatchCardHTML\(match, idPrefix = 'card'\) \{[\s\S]*?return `\s*<div id="\$\{idPrefix\}-\$\{match\.id\}"[\s\S]*?<\/div>\s*<\/div>\s*`;\s*\}/;
  const newCreateMatchCard = `function createMatchCardHTML(match, idPrefix = 'card') {
      const isCompleted = match.completed;
      const isLive = match.isLive;
      const hasBothPlayers = !!(match.p1 && match.p2 && !match.p1.isBye && !match.p2.isBye);

      let statusBadgeClass = 'bg-[#160f0e] text-slate-400 border border-[#57201c]';
      let statusText = 'WAITING';

      if (isCompleted) {
        statusBadgeClass = 'bg-[#2a1a12] text-[#f59e0b] border border-[#f59e0b]/60 font-bold shadow-sm';
        statusText = 'DONE';
      } else if (isLive) {
        statusBadgeClass = 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold animate-pulse';
        statusText = 'LIVE';
      } else if (hasBothPlayers) {
        statusBadgeClass = 'bg-[#241815] text-amber-300 border border-amber-600/60 font-semibold';
        statusText = 'READY';
      }

      const renderRow = (player, score, isWinner, isLoser, slotNum) => {
        if (!player) {
          return \`
            <div class="flex items-center justify-between p-2 rounded-lg border border-dashed border-[#57201c]/70 bg-[#110d0d]/50 text-xs text-slate-400">
              <span class="italic font-mono">TBD</span>
              <span class="font-mono text-slate-500">-</span>
            </div>
          \`;
        }

        const isBye = player.isBye;
        const winnerBorder = isWinner 
          ? 'border-amber-500/70 bg-gradient-to-r from-amber-950/40 via-red-950/20 to-transparent shadow-[0_0_12px_rgba(245,158,11,0.25)]' 
          : 'border-[#57201c]/80 bg-[#160f0e]/60';
        const loserOpacity = isLoser ? 'opacity-40 grayscale-[40%]' : '';

        return \`
          <div class="flex items-center justify-between p-2 rounded-lg border \${winnerBorder} \${loserOpacity} transition-all hover:bg-[#2b1d19]/80">
            <div class="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer" onclick="selectMatchWinner('\${match.id}', \${slotNum})">
              <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#110d0d] text-[#f59e0b] border border-[#57201c] font-semibold shrink-0">
                #\${player.seed}
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-[#fdfaf7] truncate \${isWinner ? 'text-amber-300' : ''}">
                    \${player.name}
                  </span>
                  \${isWinner ? '<span class="text-amber-400 text-xs font-bold">✓</span>' : ''}
                </div>
                <div class="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span class="font-mono text-amber-200/60">\${player.year}</span>
                  \${!isBye ? \`
                    <span class="text-amber-800">•</span>
                    <span class="text-amber-400 font-medium">\${player.character || 'No Pick'}</span>
                  \` : ''}
                </div>
              </div>
            </div>

            \${!isBye ? \`
              <div class="flex items-center gap-1 shrink-0 ml-2">
                \${!IS_STUDENT_MODE ? \`<button onclick="event.stopPropagation(); adjustScore('\${match.id}', \${slotNum}, -1)" class="score-button" title="Minus point">-</button>\` : ''}
                <span class="w-5 text-center font-mono font-bold text-sm num-mono \${isWinner ? 'text-[#f59e0b] font-black' : 'text-slate-200'}">\${score}</span>
                \${!IS_STUDENT_MODE ? \`<button onclick="event.stopPropagation(); adjustScore('\${match.id}', \${slotNum}, 1)" class="score-button" title="Add point">+</button>\` : ''}
              </div>
            \` : \`
              <span class="font-mono text-xs text-amber-400/80 pr-1">BYE</span>
            \`}
          </div>
        \`;
      };

      const p1Winner = match.winner === 1;
      const p1Loser = match.winner === 2;
      const p2Winner = match.winner === 2;
      const p2Loser = match.winner === 1;

      return \`
        <div id="\${idPrefix}-\${match.id}" data-match-id="\${match.id}" class="match-node relative bg-[#1c1412]/95 backdrop-blur-md rounded-xl border border-[#57201c] hover:border-amber-500/60 p-2.5 transition-all shadow-card \${isLive ? 'match-live live-pulse' : (hasBothPlayers && !isCompleted ? 'match-ready' : (isCompleted ? 'match-complete' : ''))}">
          <div class="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#57201c]/80">
            <div class="flex items-center gap-1.5 cursor-pointer" onclick="openMatchModal('\${match.id}')">
              <span class="font-mono font-bold text-[11px] text-[#f59e0b] hover:underline">
                \${match.code}
              </span>
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#160f0e] text-slate-300 border border-[#57201c]">
                BO\${match.bestOf}
              </span>
              <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#110d0d] text-[#fde047] border border-[#57201c]" title="Target Schedule Call Time">
                \${match.scheduledTime || (SCHEDULE_TARGETS[match.id]?.time || '')}
              </span>
              \${match.actualStartTime ? \`<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80" title="Actual Start Time">⏱ \${match.actualStartTime}</span>\` : ''}
            </div>
            
            <div class="flex items-center gap-1">
              <span class="text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase \${statusBadgeClass}">
                \${statusText}
              </span>
              \${!IS_STUDENT_MODE ? \`
              <button onclick="openMatchModal('\${match.id}')" class="text-slate-400 hover:text-white px-1 py-0.5 rounded text-xs" title="Edit Match">
                ✎
              </button>\` : ''}
            </div>
          </div>

          <div class="space-y-1.5">
            \${renderRow(match.p1, match.score1, p1Winner, p1Loser, 1)}
            \${renderRow(match.p2, match.score2, p2Winner, p2Loser, 2)}
          </div>
        </div>
      \`;
    }`;

  if (oldCreateMatchCard.test(html)) {
    html = html.replace(oldCreateMatchCard, newCreateMatchCard);
    console.log('  -> Updated createMatchCardHTML styling to obsidian & gold');
  }

  // -------------------------------------------------------------
  // 10. FIX FINALS SPOTLIGHT HERO BANNER (FIX 3 & FIX 2)
  // -------------------------------------------------------------
  const oldBannerHtmlPattern = /const bannerHTML = `[\s\S]*?<h1 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight">[\s\S]*?CHAMPIONSHIP STAGE[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*`;/;
  const newBannerHtml = `const bannerHTML = \`
        <div class="relative w-full max-w-4xl rounded-2xl overflow-hidden border border-amber-600/40 bg-[#1a120b]/95 shadow-2xl">
          <!-- Background: Tekken Key Art on right with gradient fading to dark obsidian on left -->
          <div class="relative min-h-[160px] sm:min-h-[180px] w-full flex items-center overflow-hidden">
            <!-- Right-side Tekken 8 Artwork with smooth gradient fade -->
            <div class="absolute right-0 top-0 bottom-0 w-2/3 sm:w-1/2 pointer-events-none overflow-hidden select-none">
              <img src="./assets/tekken8_cover.jpg" alt="Tekken 8 Hero Ambient" class="w-full h-full object-cover object-right filter brightness-90 contrast-110">
              <div class="absolute inset-0 bg-gradient-to-l from-transparent via-[#1a120b]/75 to-[#1a120b]"></div>
            </div>
            <!-- Overall gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-[#110d0d] via-[#110d0d]/40 to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-[#110d0d] via-[#110d0d]/90 to-transparent"></div>
            
            <!-- Banner Content -->
            <div class="relative z-10 w-full p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <!-- Left: Circular Logo & Tournament Title -->
              <div class="flex items-center gap-4">
                <div class="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl p-1 bg-gradient-to-br from-amber-500/40 via-red-950/80 to-amber-600/30 border border-amber-500/50 shadow-lg shadow-amber-950/50 flex items-center justify-center">
                  <img src="./assets/esc_logo.jpg" alt="Engineering Days Logo" class="w-full h-full object-contain rounded-xl">
                </div>
                <div>
                  <div class="text-[11px] font-mono font-bold tracking-widest text-[#f59e0b] uppercase flex items-center gap-1.5">
                    <span>ENGINEERING DAYS 2026</span>
                    <span class="text-amber-700">•</span>
                    <span class="text-amber-300/90">UPHSD CALAMBA</span>
                  </div>
                  <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#fdfaf7] tracking-tight font-mono">
                    TEKKEN 8 GRAND FINALS
                  </h1>
                  <p class="text-xs text-amber-200/70 font-mono mt-0.5">
                    14-Player Double Elimination Championship
                  </p>
                </div>
              </div>

              <!-- Right/Badge: CHAMPIONSHIP STAGE Badge with Gold & Crimson -->
              <div class="shrink-0 flex items-center gap-2 self-start sm:self-center bg-[#160f0e]/90 border border-amber-500/60 px-3.5 py-1.5 rounded-full text-xs font-mono text-amber-300 shadow-md backdrop-blur-md">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]"></span>
                <span class="font-bold tracking-wider">CHAMPIONSHIP STAGE</span>
                <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              </div>
            </div>
          </div>
        </div>
      \`;`;

  if (oldBannerHtmlPattern.test(html)) {
    html = html.replace(oldBannerHtmlPattern, newBannerHtml);
    console.log('  -> Updated Finals Spotlight Hero Banner (80px/96px non-cropped seal + Gold/Crimson badge + Tekken fade)');
  }

  // Also update champion podium banner in renderFinalsSpotlight
  html = html.replace(/bg-gradient-to-b from-\[#f7b943\]\/20 via-\[#0a2344\]\/95 to-\[#06162f\] border border-\[#f7b943\]\/60/g,
    'bg-gradient-to-b from-amber-500/20 via-[#1c1412]/95 to-[#110d0d] border border-amber-500/60');

  html = html.replace(/<img src="\.\/assets\/mes_logo\.png" alt="MES Seal" class="w-10 h-10 rounded-full border border-amber-400\/80 shadow-mishima">/g,
    '<img src="./assets/esc_logo.jpg" alt="Engineering Days Logo" class="w-12 h-12 rounded-xl object-contain border border-amber-400/80 shadow-lg p-0.5 bg-[#160f0e]">');

  html = html.replace(/UPHSD • MECHANICAL ENGINEERING SOCIETY CHAMPION/g,
    'UPHSD • ENGINEERING DAYS 2026 CHAMPION');

  // -------------------------------------------------------------
  // 11. RESTORE & ENHANCE DRAWCONNECTORS, UPDATEBRACKETLINESUI, TOGGLEBRACKETLINES (FIX 1)
  // -------------------------------------------------------------
  const oldDrawConnectorsPattern = /function updateBracketLinesUI\(\) \{[\s\S]*?vp\.addEventListener\('scroll', \(\) => drawConnectors\(\), \{ passive: true \}\);\s*\}\s*\}\s*\}|function drawConnectors\(\) \{[\s\S]*?window\._tekkenResizeObserver\.observe\(c\);\s*\}\s*\}\s*\}/;
  const newDrawConnectors = `function updateBracketLinesUI() {
      const mode = (typeof state !== 'undefined' && state && state.bracketLineMode) ? state.bracketLineMode : 'front';
      if (document.body && document.body.classList) {
        document.body.classList.remove('bracket-lines-front', 'bracket-lines-under', 'bracket-lines-off');
        document.body.classList.add(\`bracket-lines-\${mode}\`);
      }

      const config = {
        'front': {
          label: '⚡ Lines: In Front',
          class: 'px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/80 text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1 transition-all shadow-sm'
        },
        'under': {
          label: '⚡ Lines: Under Cards',
          class: 'px-2.5 py-1 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-amber-600/50 text-[11px] font-mono font-bold text-amber-200 flex items-center gap-1 transition-all shadow-sm'
        },
        'off': {
          label: '⚡ Lines: Hidden',
          class: 'px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-[11px] font-mono font-bold text-zinc-400 flex items-center gap-1 transition-all shadow-sm'
        }
      };

      const c = config[mode] || config.front;
      const btn1 = document.getElementById('btn-tekken-toggle-lines');
      if (btn1) {
        btn1.className = c.class;
        btn1.innerHTML = \`<span>\${c.label}</span>\`;
      }
      const btn2 = document.getElementById('line-mode-btn');
      if (btn2) {
        btn2.className = c.class;
        btn2.innerHTML = \`<span>\${c.label}</span>\`;
      }
    }

    function toggleBracketLines() {
      const modes = ['front', 'under', 'off'];
      const current = (typeof state !== 'undefined' && state.bracketLineMode) ? state.bracketLineMode : 'front';
      const nextIndex = (modes.indexOf(current) + 1) % modes.length;
      state.bracketLineMode = modes[nextIndex];
      safeSetStorage(STORAGE_KEY, JSON.stringify(state));
      updateBracketLinesUI();
      drawConnectors();
    }
    window.toggleBracketLines = toggleBracketLines;
    window.toggleBracketLineMode = toggleBracketLines;

    function drawConnectors() {
      const svg = document.getElementById('bracket-svg');
      if (!svg) return;
      if (state.bracketLineMode === 'off') {
        svg.innerHTML = '';
        return;
      }

      const canvas = document.getElementById('bracket-canvas');
      if (!canvas) return;

      const z = Math.max(0.2, Number(state.zoom) || 1.0);

      const w = Math.max(canvas.scrollWidth, canvas.offsetWidth, 2900);
      const h = Math.max(canvas.scrollHeight, canvas.offsetHeight, 2200);
      svg.style.width = w + 'px';
      svg.style.height = h + 'px';
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      svg.setAttribute('viewBox', \`0 0 \${w} \${h}\`);

      const canvasRect = canvas.getBoundingClientRect();
      let skippedDueToLayout = false;

      const links = [
        // WINNERS R1 -> QUARTERFINALS
        { from: 'UB1', to: 'M7', slot: 1 },
        { from: 'M1', to: 'M7', slot: 2 },
        { from: 'M2', to: 'M8', slot: 1 },
        { from: 'M3', to: 'M8', slot: 2 },
        { from: 'UB2', to: 'M9', slot: 1 },
        { from: 'M4', to: 'M9', slot: 2 },
        { from: 'M5', to: 'M10', slot: 1 },
        { from: 'M6', to: 'M10', slot: 2 },

        // WINNERS QUARTERFINALS -> SEMIFINALS
        { from: 'M7', to: 'M17', slot: 1 },
        { from: 'M8', to: 'M17', slot: 2 },
        { from: 'M9', to: 'M18', slot: 1 },
        { from: 'M10', to: 'M18', slot: 2 },

        // WINNERS SEMIFINALS -> WINNERS FINALS
        { from: 'M17', to: 'M23', slot: 1 },
        { from: 'M18', to: 'M23', slot: 2 },

        // WINNERS FINALS -> GRAND FINALS
        { from: 'M23', to: 'M26', slot: 1, crossSection: true },

        // LOSERS R1 -> LOSERS R2
        { from: 'M11', to: 'M14', slot: 2 },
        { from: 'M12', to: 'M16', slot: 2 },

        // LOSERS R2 -> LOSERS R3
        { from: 'M13', to: 'M19', slot: 1 },
        { from: 'M14', to: 'M19', slot: 2 },
        { from: 'M15', to: 'M20', slot: 1 },
        { from: 'M16', to: 'M20', slot: 2 },

        // LOSERS R3 -> LOSERS QUARTERS
        { from: 'M19', to: 'M21', slot: 2 },
        { from: 'M20', to: 'M22', slot: 2 },

        // LOSERS QUARTERS -> LOSERS SEMIS
        { from: 'M21', to: 'M24', slot: 1 },
        { from: 'M22', to: 'M24', slot: 2 },

        // LOSERS SEMIS -> LOSERS FINALS
        { from: 'M24', to: 'M25', slot: 2 },

        // LOSERS FINALS -> GRAND FINALS
        { from: 'M25', to: 'M26', slot: 2, crossSection: true },

        // GRAND FINALS 1 -> GRAND FINALS RESET (MATCH 27)
        ...(state.grandFinalsResetNeeded || (state.matches && state.matches['M27'] && state.matches['M27'].p1) ? [{ from: 'M26', to: 'M27', slot: 1 }] : [])
      ];

      let svgContent = \`
        <defs>
          <filter id="tekken-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="#f59e0b" flood-opacity="0.8"/>
          </filter>
          <filter id="tekken-glow-gold" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4.5" flood-color="#fbbf24" flood-opacity="0.95"/>
          </filter>
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#b45309" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#f59e0b" stop-opacity="1"/>
          </linearGradient>
          <linearGradient id="crimson-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#7f1d1d" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#991b1b" stop-opacity="1"/>
          </linearGradient>
        </defs>
      \`;

      links.forEach(link => {
        const fromEl = document.getElementById(\`card-\${link.from}\`);
        const toEl = document.getElementById(\`card-\${link.to}\`);

        if (!fromEl || !toEl) return;

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        if (fromRect.width === 0 || toRect.width === 0 || canvasRect.width === 0) {
          skippedDueToLayout = true;
          return;
        }

        const x1 = (fromRect.right - canvasRect.left) / z;
        const y1 = (fromRect.top + fromRect.height / 2 - canvasRect.top) / z;

        const x2 = (toRect.left - canvasRect.left) / z;
        const slotOffset = link.slot === 1 ? toRect.height * 0.35 : toRect.height * 0.70;
        const y2 = (toRect.top + slotOffset - canvasRect.top) / z;

        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return;

        const fromMatch = state.matches[link.from];
        const isActive = fromMatch && fromMatch.completed;
        const strokeClass = isActive ? 'connector-active' : 'connector-inactive';

        const strokeColor = isActive ? '#fbbf24' : '#b45309';
        const strokeWidth = isActive ? '3.5' : '2.2';
        const strokeDash = isActive ? '' : 'stroke-dasharray="6 4"';
        const opacity = isActive ? '1' : '0.85';
        const filterAttr = isActive ? 'filter="url(#tekken-glow-gold)"' : 'filter="url(#tekken-glow)"';

        let d;
        if (link.crossSection || x2 < x1) {
          const midX = x1 + 50;
          const entryX = Math.max(20, x2 - 50);
          const midY = (y1 + y2) / 2;
          d = \`M \${x1} \${y1} C \${midX} \${y1}, \${midX} \${midY}, \${(x1 + x2) / 2} \${midY} S \${entryX} \${y2}, \${x2} \${y2}\`;
        } else {
          const dx = Math.max(30, (x2 - x1) * 0.55);
          d = \`M \${x1} \${y1} C \${x1 + dx} \${y1}, \${x2 - dx} \${y2}, \${x2} \${y2}\`;
        }

        svgContent += \`<path d="\${d}" class="connector-line \${strokeClass}" fill="none" stroke="\${strokeColor}" stroke-width="\${strokeWidth}" stroke-opacity="\${opacity}" \${strokeDash} \${filterAttr} stroke-linecap="round" stroke-linejoin="round" />\`;
      });

      svg.innerHTML = svgContent;

      if (skippedDueToLayout) {
        [50, 150, 300, 600].forEach(delay => {
          setTimeout(() => {
            const c = document.getElementById('bracket-canvas');
            if (c && c.offsetWidth > 0 && (state.activeView === 'full' || !state.activeView)) {
              drawConnectors();
            }
          }, delay);
        });
      }

      // Attach ResizeObserver and scroll listener to keep bracket lines permanently synced
      if (!window._tekkenResizeObserver && window.ResizeObserver) {
        const c = document.getElementById('bracket-canvas');
        if (c) {
          window._tekkenResizeObserver = new ResizeObserver(() => {
            if (!state.activeView || state.activeView === 'full') {
              drawConnectors();
            }
          });
          window._tekkenResizeObserver.observe(c);
        }
      }

      if (!window._bracketListenersAttached) {
        window._bracketListenersAttached = true;
        window.addEventListener('resize', () => drawConnectors());
        window.addEventListener('scroll', () => drawConnectors(), { passive: true });
        const vp = document.getElementById('bracket-viewport');
        if (vp) {
          vp.addEventListener('scroll', () => drawConnectors(), { passive: true });
        }
      }
    }`;

  if (oldDrawConnectorsPattern.test(html)) {
    html = html.replace(oldDrawConnectorsPattern, newDrawConnectors);
    console.log('  -> Restored and enhanced drawConnectors + updateBracketLinesUI + toggleBracketLines');
  }

  // -------------------------------------------------------------
  // 12. INITIALIZATION CALLS (initApp & DOMContentLoaded)
  // -------------------------------------------------------------
  if (!html.includes('updateBracketLinesUI();')) {
    html = html.replace(/initApp\(\);/g, 'initApp();\n      updateBracketLinesUI();');
  }

  html = html.replace(/if \(!state\.bracketLineMode \|\| state\.bracketLineMode === 'off'\) \{\s*state\.bracketLineMode = 'front';\s*\}/g,
    `if (!state.bracketLineMode) state.bracketLineMode = 'front';\n            updateBracketLinesUI();`);

  // -------------------------------------------------------------
  // 13. COMPREHENSIVE OBSIDIAN / CHARCOAL / MAROON REPLACEMENTS
  // -------------------------------------------------------------
  html = html.replace(/bg-\[#06162f\]/g, 'bg-[#160f0e]');
  html = html.replace(/bg-\[#0a2344\]/g, 'bg-[#1c1412]');
  html = html.replace(/bg-\[#081d38\]/g, 'bg-[#160f0e]');
  html = html.replace(/bg-\[#102d52\]/g, 'bg-[#2b1d19]');
  html = html.replace(/hover:bg-\[#102d52\]/g, 'hover:bg-[#2b1d19]');
  html = html.replace(/hover:bg-\[#1a4478\]/g, 'hover:bg-[#3d1614]');
  html = html.replace(/border-\[#2c4f75\]/g, 'border-[#57201c]');
  html = html.replace(/border-\[#1e3a5f\]/g, 'border-[#3d1614]');
  html = html.replace(/text-\[#38bdf8\]/g, 'text-amber-400');
  html = html.replace(/focus:border-\[#38bdf8\]/g, 'focus:border-amber-500');
  html = html.replace(/hover:border-\[#38bdf8\]/g, 'hover:border-amber-500');
  html = html.replace(/bg-\[#030b17\]/g, 'bg-[#110d0d]');

  // Clean double-slash classes if present
  html = html.replace(/bg-amber-950\/80\/(10|50|80)/g, 'bg-amber-950/40');
  html = html.replace(/border-cyan-700\/80/g, 'border-amber-600/70');
  html = html.replace(/border-cyan-900\/60/g, 'border-amber-800/60');
  html = html.replace(/text-sky-300/g, 'text-amber-300');
  html = html.replace(/text-sky-400/g, 'text-amber-400');
  html = html.replace(/border-sky-800/g, 'border-amber-700/60');
  html = html.replace(/bg-sky-950/g, 'bg-amber-950/60');

  // Replace cyan accents
  html = html.replace(/text-cyan-400/g, 'text-amber-400');
  html = html.replace(/text-cyan-300/g, 'text-amber-300');
  html = html.replace(/bg-cyan-400/g, 'bg-amber-400');
  html = html.replace(/bg-cyan-600/g, 'bg-amber-600');
  html = html.replace(/hover:bg-cyan-500/g, 'hover:bg-amber-500');
  html = html.replace(/border-cyan-500/g, 'border-amber-500');
  html = html.replace(/border-cyan-800/g, 'border-amber-700/60');
  html = html.replace(/bg-cyan-950/g, 'bg-amber-950/80');
  html = html.replace(/from-cyan-500/g, 'from-red-600');

  // Replace remaining mes_logo.png references
  html = html.replace(/\.\/assets\/mes_logo\.png/g, './assets/esc_logo.jpg');

  // Replace remaining hexes in style or inline
  html = html.replace(/#06162f/g, '#160f0e');
  html = html.replace(/#0a2344/g, '#1c1412');
  html = html.replace(/#081d38/g, '#160f0e');
  html = html.replace(/#102d52/g, '#2b1d19');
  html = html.replace(/#2c4f75/g, '#57201c');
  html = html.replace(/#1e3a5f/g, '#3d1614');
  html = html.replace(/#00f0ff/g, '#f59e0b');
  html = html.replace(/#38bdf8/g, '#fbbf24');
  html = html.replace(/#030b17/g, '#110d0d');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`[Apply Fixes] Successfully saved ${path.basename(filePath)}!`);
}

// Apply fixes to both index.html and student.html
applyFixesToFile(path.join(rootDir, 'index.html'), false);
applyFixesToFile(path.join(rootDir, 'student.html'), true);

console.log('[Apply Fixes] Complete!');
