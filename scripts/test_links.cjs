const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

// Extract all match card IDs that get rendered in renderBracketColumns
const rbcMatch = content.match(/function renderBracketColumns\(\) \{([\s\S]*?)\n    \}/);
if (!rbcMatch) {
  console.error('Could not find renderBracketColumns');
  process.exit(1);
}

console.log('--- Checking all match IDs rendered in HTML ---');
const matchIdArrays = rbcMatch[1].match(/\['([^']+)'(?:,\s*'([^']+)')*\]/g);
console.log('Match ID arrays found:');
const allRenderedIds = new Set();
if (matchIdArrays) {
  matchIdArrays.forEach(arrStr => {
    const ids = JSON.parse(arrStr.replace(/'/g, '"'));
    ids.forEach(id => allRenderedIds.add(id));
  });
}
allRenderedIds.add('M26');
allRenderedIds.add('M27');

console.log('All rendered match IDs:', Array.from(allRenderedIds));

// Now check links in drawConnectors
const dcMatch = content.match(/function drawConnectors\(\) \{([\s\S]*?)\n    \}/);
const linksMatch = dcMatch[1].match(/const links = \[([\s\S]*?)\];/);

const linkLines = linksMatch[1].split('\n')
  .map(l => l.trim())
  .filter(l => l.startsWith('{ from:'));

console.log(`\nChecking ${linkLines.length} links:`);
let missingCount = 0;
linkLines.forEach(l => {
  const fromMatch = l.match(/from:\s*'([^']+)'/);
  const toMatch = l.match(/to:\s*'([^']+)'/);
  if (fromMatch && toMatch) {
    const fromId = fromMatch[1];
    const toId = toMatch[1];
    const fromExists = allRenderedIds.has(fromId);
    const toExists = allRenderedIds.has(toId);
    if (!fromExists || !toExists) {
      console.log(`❌ LINK MISSING DOM ELEMENT: from '${fromId}' (exists: ${fromExists}) -> to '${toId}' (exists: ${toExists})`);
      missingCount++;
    } else {
      console.log(`✓ Link valid: ${fromId} -> ${toId}`);
    }
  }
});

console.log(`\nResult: ${linkLines.length - missingCount} valid links, ${missingCount} missing.`);
