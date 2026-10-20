const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function fixFile(fileName) {
  const filePath = path.join(rootDir, fileName);
  console.log(`[Fix] Processing: ${fileName}...`);
  let html = fs.readFileSync(filePath, 'utf8');

  // -------------------------------------------------------------
  // ISSUE 2: REMOVE MEODL BACKGROUND ASSETS
  // -------------------------------------------------------------
  // 1. Remove meodl_arena_bg.png watermark behind Quarterfinals and Semifinals
  const meodlArenaRegex = /\s*<!-- Subtle Tekken Arena Ambient Background Layer -->\s*<div class="absolute inset-0 bg-cover bg-center pointer-events-none opacity-15" style="background-image:\s*url\('\.\/assets\/meodl_arena_bg\.png'\);\s*filter:\s*blur\(0\.5px\);"><\/div>/g;
  if (meodlArenaRegex.test(html)) {
    html = html.replace(meodlArenaRegex, '');
    console.log('  -> Removed meodl_arena_bg.png layer behind bracket canvas');
  } else {
    // Fallback regex in case of whitespace differences
    const altMeodlArena = /<div[^>]*style="[^"]*meodl_arena_bg\.png[^"]*"[^>]*><\/div>/g;
    html = html.replace(altMeodlArena, '');
    console.log('  -> Removed meodl_arena_bg.png via fallback pattern');
  }

  // 2. Remove meodl_banner_league.jpg from site ambient background
  const meodlBannerRegex = /\s*<div id="site-ambient-bg-image" class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 filter contrast-125 brightness-95" style="background-image:\s*url\('\.\/assets\/official\/meodl_banner_league\.jpg'\);"><\/div>/g;
  if (meodlBannerRegex.test(html)) {
    html = html.replace(meodlBannerRegex, '');
    console.log('  -> Removed meodl_banner_league.jpg from site ambient background');
  } else {
    const altMeodlBanner = /<div id="site-ambient-bg-image"[^>]*><\/div>/g;
    html = html.replace(altMeodlBanner, '');
    console.log('  -> Removed meodl_banner_league.jpg via fallback pattern');
  }

  // Also clean any text mentioning MEODL in headers/guidelines
  html = html.replace(/UPHSD Mechanical Engineering Society • MEODL 2026/g, 'UPHSD Engineering Days 2026 • Tekken 8');
  html = html.replace(/MEODL ESPORTS • TOURNAMENT OPS/g, 'ENGINEERING DAYS • TOURNAMENT OPS');
  html = html.replace(/Official MEODL Rules & Guidelines/g, 'Official Tekken 8 Rules & Guidelines');

  // -------------------------------------------------------------
  // ISSUE 1: REMOVE DUPLICATE OLD toggleBracketLineMode
  // -------------------------------------------------------------
  // Delete the old toggleBracketLineMode around line 1106 that had 'behind'
  const oldToggleFuncRegex = /\n\s*function toggleBracketLineMode\(\) \{\s*const modes = \['front', 'behind', 'off'\];[\s\S]*?drawConnectors\(\);\s*\}/g;
  if (oldToggleFuncRegex.test(html)) {
    html = html.replace(oldToggleFuncRegex, '');
    console.log('  -> Removed duplicate old toggleBracketLineMode function');
  }

  // -------------------------------------------------------------
  // ISSUE 1: UPDATE CSS FOR CONNECTOR LINES & SVG
  // -------------------------------------------------------------
  const oldSvgLayeringRegex = /\/\* Bracket SVG Connector Lines Layering \*\/[\s\S]*?\.connector-inactive\s*\{[\s\S]*?\}/;
  const newSvgLayering = `/* Bracket SVG Connector Lines Layering */
    #bracket-svg {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      overflow: visible !important;
      z-index: 45 !important; /* Default: In Front of cards */
    }
    body.bracket-lines-under #bracket-svg,
    body.bracket-lines-behind #bracket-svg {
      z-index: 10 !important; /* Under cards (cards have z-index: 30) */
    }
    body.bracket-lines-front #bracket-svg {
      z-index: 45 !important; /* In front of cards */
    }
    body.bracket-lines-off #bracket-svg {
      display: none !important;
    }

    .match-node {
      position: relative;
      z-index: 30;
    }

    .connector-line {
      transition: stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease;
      stroke-linecap: round;
      stroke-linejoin: round;
      pointer-events: none;
    }
    .connector-active {
      stroke: #fbbf24 !important;
      stroke-width: 3px !important;
      opacity: 1 !important;
      filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.95)) drop-shadow(0 0 12px rgba(234, 179, 8, 0.6)) !important;
    }
    .connector-inactive {
      stroke: #f59e0b !important;
      stroke-width: 2px !important;
      opacity: 0.85 !important;
      filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.5)) !important;
    }`;

  if (oldSvgLayeringRegex.test(html)) {
    html = html.replace(oldSvgLayeringRegex, newSvgLayering);
    console.log('  -> Updated SVG layering & connector-line CSS (visible #f59e0b, 2px, opacity 0.85)');
  }

  // -------------------------------------------------------------
  // ISSUE 1: UPDATE createMatchCardHTML TO PROVIDE ALIASES & METADATA
  // -------------------------------------------------------------
  // Ensure cards have robust IDs and query attributes
  html = html.replace(
    /return `\s*<div id="\$\{idPrefix\}-\$\{match\.id\}" data-match-id="\$\{match\.id\}"/g,
    `const byeAlias = (match.id === 'UB1' ? 'card-BYE 1 card-BYE1 card-bye1' : (match.id === 'UB2' ? 'card-BYE 2 card-BYE2 card-bye2' : ''));
      return \`
        <div id="\${idPrefix}-\${match.id}" data-match-id="\${match.id}" data-match-code="\${match.code || ''}" data-alt-ids="\${byeAlias}"`
  );

  // -------------------------------------------------------------
  // ISSUE 1: ROBUST drawConnectors, updateBracketLinesUI, toggleBracketLines
  // -------------------------------------------------------------
  const oldConnectorsBlockRegex = /function updateBracketLinesUI\(\) \{[\s\S]*?if \(!window\._bracketListenersAttached\) \{[\s\S]*?\}\s*\}\s*\}/;
  
  const newConnectorsBlock = `// Helper to find match card DOM element with robust fallbacks for BYE 1, BYE 2, etc.
    function getMatchCardEl(matchId) {
      if (!matchId) return null;
      const raw = String(matchId).trim();
      
      // 1. Direct getElementById
      let el = document.getElementById('card-' + raw) || document.getElementById(raw);
      if (el) return el;

      // 2. Normalized check (remove spaces, dashes, case-insensitive)
      const norm = raw.toUpperCase().replace(/[\\s\\-_]/g, '');

      // Special aliases for Bye matches
      if (norm === 'UB1' || norm === 'BYE1' || norm === 'UBBYE1' || norm === 'SLOT1') {
        el = document.getElementById('card-UB1') ||
             document.getElementById('card-BYE 1') ||
             document.getElementById('card-BYE1') ||
             document.getElementById('card-bye1') ||
             document.querySelector('[data-match-id="UB1"]') ||
             document.querySelector('[data-match-code="BYE 1"]') ||
             document.querySelector('#col-wr1 > div:first-child');
        if (el) return el;
      }
      if (norm === 'UB2' || norm === 'BYE2' || norm === 'UBBYE2' || norm === 'SLOT2') {
        el = document.getElementById('card-UB2') ||
             document.getElementById('card-BYE 2') ||
             document.getElementById('card-BYE2') ||
             document.getElementById('card-bye2') ||
             document.querySelector('[data-match-id="UB2"]') ||
             document.querySelector('[data-match-code="BYE 2"]') ||
             document.querySelector('#col-wr1 > div:nth-child(5)');
        if (el) return el;
      }

      // 3. Match code query selectors
      el = document.getElementById('card-' + norm) ||
           document.querySelector('[data-match-id="' + raw + '"]') ||
           document.querySelector('[data-match-id="' + norm + '"]') ||
           document.querySelector('[data-match-code="' + raw + '"]') ||
           document.querySelector('[id$="-' + raw + '"]') ||
           document.querySelector('[id$="-' + norm + '"]');
      return el;
    }

    function updateBracketLinesUI() {
      // Force default to 'front' if undefined, 'behind', or 'off'
      if (!state.bracketLineMode || state.bracketLineMode === 'behind') {
        state.bracketLineMode = 'front';
      }
      const mode = state.bracketLineMode || 'front';

      if (document.body && document.body.classList) {
        document.body.classList.remove('bracket-lines-front', 'bracket-lines-under', 'bracket-lines-off', 'bracket-lines-behind');
        document.body.classList.add(\`bracket-lines-\${mode}\`);
      }

      const config = {
        'front': {
          label: '⚡ Lines: In Front',
          class: 'px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/80 text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1 transition-all shadow-sm',
          headerClass: 'px-2.5 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/80 text-xs font-mono font-bold text-amber-300 transition-all flex items-center gap-1 shadow-sm'
        },
        'under': {
          label: '⚡ Lines: Under Cards',
          class: 'px-2.5 py-1 rounded-lg bg-[#1c1412] hover:bg-[#2b1d19] border border-amber-600/50 text-[11px] font-mono font-bold text-amber-200 flex items-center gap-1 transition-all shadow-sm',
          headerClass: 'px-2.5 py-1.5 rounded-lg bg-[#1c1412] hover:bg-[#2b1d19] border border-amber-600/50 text-xs font-mono font-bold text-amber-200 transition-all flex items-center gap-1 shadow-sm'
        },
        'off': {
          label: '⚡ Lines: Hidden',
          class: 'px-2.5 py-1 rounded-lg bg-[#160f0e] hover:bg-[#241815] border border-[#57201c] text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1 transition-all shadow-sm',
          headerClass: 'px-2.5 py-1.5 rounded-lg bg-[#160f0e] hover:bg-[#241815] border border-[#57201c] text-xs font-mono font-bold text-slate-400 transition-all flex items-center gap-1 shadow-sm'
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
        btn2.className = c.headerClass;
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

      // Exact Tournament Match Connections
      const links = [
        // UPPER BRACKET ROUND 1 -> QUARTERFINALS
        // BYE 1 (Slot 1) + M1 ---> connect into M7 (Quarterfinals)
        { from: 'UB1', to: 'M7', slot: 1 },
        { from: 'M1', to: 'M7', slot: 2 },

        // M2 + M3 ---> connect into M8 (Quarterfinals)
        { from: 'M2', to: 'M8', slot: 1 },
        { from: 'M3', to: 'M8', slot: 2 },

        // BYE 2 (Slot 2) + M4 ---> connect into M9 (Quarterfinals)
        { from: 'UB2', to: 'M9', slot: 1 },
        { from: 'M4', to: 'M9', slot: 2 },

        // M5 + M6 ---> connect into M10 (Quarterfinals)
        { from: 'M5', to: 'M10', slot: 1 },
        { from: 'M6', to: 'M10', slot: 2 },

        // UPPER BRACKET QUARTERFINALS -> SEMIFINALS
        // M7 + M8 ---> connect into M17 (Semifinals)
        { from: 'M7', to: 'M17', slot: 1 },
        { from: 'M8', to: 'M17', slot: 2 },

        // M9 + M10 ---> connect into M18 (Semifinals)
        { from: 'M9', to: 'M18', slot: 1 },
        { from: 'M10', to: 'M18', slot: 2 },

        // UPPER BRACKET SEMIFINALS -> WINNERS FINALS
        // M17 + M18 ---> connect into M23 (Winners Finals)
        { from: 'M17', to: 'M23', slot: 1 },
        { from: 'M18', to: 'M23', slot: 2 },

        // WINNERS FINALS -> GRAND FINALS
        { from: 'M23', to: 'M26', slot: 1, crossSection: true },

        // LOWER BRACKET ROUND 1 -> LOWER BRACKET ROUND 2
        { from: 'M11', to: 'M14', slot: 2 },
        { from: 'M12', to: 'M16', slot: 2 },

        // LOWER BRACKET ROUND 2 -> LOWER BRACKET ROUND 3
        { from: 'M13', to: 'M19', slot: 1 },
        { from: 'M14', to: 'M19', slot: 2 },
        { from: 'M15', to: 'M20', slot: 1 },
        { from: 'M16', to: 'M20', slot: 2 },

        // LOWER BRACKET ROUND 3 -> LOWER BRACKET QUARTERFINALS (LB R4)
        { from: 'M19', to: 'M21', slot: 2 },
        { from: 'M20', to: 'M22', slot: 2 },

        // LOWER BRACKET QUARTERFINALS -> LOWER BRACKET SEMIFINALS (LB R5)
        { from: 'M21', to: 'M24', slot: 1 },
        { from: 'M22', to: 'M24', slot: 2 },

        // LOWER BRACKET SEMIFINALS -> LOWER BRACKET FINALS (LB R6)
        { from: 'M24', to: 'M25', slot: 2 },

        // LOWER BRACKET FINALS -> GRAND FINALS
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
        const fromEl = getMatchCardEl(link.from);
        const toEl = getMatchCardEl(link.to);

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

        const fromMatch = state.matches[link.from] || (link.from === 'UB1' ? state.matches['UB1'] : null) || (link.from === 'UB2' ? state.matches['UB2'] : null);
        const isActive = fromMatch && fromMatch.completed;
        const strokeClass = isActive ? 'connector-active' : 'connector-inactive';

        // Vibrant visible Engineering Gold / Amber lines (#f59e0b, 2px, opacity: 0.85)
        const strokeColor = isActive ? '#fbbf24' : '#f59e0b';
        const strokeWidth = isActive ? '3' : '2';
        const opacity = isActive ? '1' : '0.85';
        const filterAttr = isActive ? 'filter="url(#tekken-glow-gold)"' : 'filter="url(#tekken-glow)"';

        let d;
        if (link.crossSection || x2 < x1) {
          const midX = x1 + 50;
          const entryX = Math.max(20, x2 - 50);
          const midY = (y1 + y2) / 2;
          d = \`M \${x1} \${y1} C \${midX} \${y1}, \${midX} \${midY}, \${(x1 + x2) / 2} \${midY} S \${entryX} \${y2}, \${x2} \${y2}\`;
        } else {
          const dx = Math.max(30, (x2 - x1) * 0.52);
          d = \`M \${x1} \${y1} C \${x1 + dx} \${y1}, \${x2 - dx} \${y2}, \${x2} \${y2}\`;
        }

        svgContent += \`<path d="\${d}" class="connector-line \${strokeClass}" fill="none" stroke="\${strokeColor}" stroke-width="\${strokeWidth}" stroke-opacity="\${opacity}" \${filterAttr} stroke-linecap="round" stroke-linejoin="round" />\`;
      });

      svg.innerHTML = svgContent;

      if (skippedDueToLayout) {
        [50, 150, 300, 600, 1000].forEach(delay => {
          setTimeout(() => {
            const c = document.getElementById('bracket-canvas');
            if (c && c.offsetWidth > 0) {
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

  if (oldConnectorsBlockRegex.test(html)) {
    html = html.replace(oldConnectorsBlockRegex, newConnectorsBlock);
    console.log('  -> Updated drawConnectors with getMatchCardEl fallbacks & visible #f59e0b stroke');
  } else {
    console.warn('  ⚠️ Could not match oldConnectorsBlockRegex, checking alternative match...');
    const altRegex = /function updateBracketLinesUI\(\) \{[\s\S]*?vp\.addEventListener\('scroll', \(\) => drawConnectors\(\), \{ passive: true \}\);\s*\}\s*\}\s*\}/;
    if (altRegex.test(html)) {
      html = html.replace(altRegex, newConnectorsBlock);
      console.log('  -> Updated drawConnectors via alternative regex');
    }
  }

  // -------------------------------------------------------------
  // ISSUE 1: SYNC BOTH ZOOM DISPLAYS
  // -------------------------------------------------------------
  html = html.replace(
    /const tekkenTxt = document\.getElementById\('zoom-level-text'\);[\s\S]*?if \(uniTxt\) uniTxt\.innerText = pct;/g,
    `document.querySelectorAll('#zoom-level-text').forEach(el => el.innerText = pct);`
  );

  // -------------------------------------------------------------
  // FORCE DEFAULT TO 'front' ON INIT (PROTECT AGAINST STALE STORAGE)
  // -------------------------------------------------------------
  html = html.replace(
    /if \(!state\.bracketLineMode\) state\.bracketLineMode = 'front';/g,
    `if (!state.bracketLineMode || state.bracketLineMode === 'behind') state.bracketLineMode = 'front';`
  );

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`[Fix] Successfully saved: ${fileName}!`);
}

fixFile('index.html');
fixFile('student.html');
console.log('[Fix] Complete!');
