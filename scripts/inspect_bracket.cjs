const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

console.log('--- Inspecting match rendering logic ---');

// Search for where match card IDs are rendered
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('id="card-') || line.includes('id=\'card-') || line.includes('id={`card-') || line.includes('id="card-${') || line.includes('card-${') || line.includes('data-match-id')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});

// Also search for functions that generate cards
lines.forEach((line, i) => {
  if (line.includes('function renderCard') || line.includes('function renderMatch') || line.includes('function buildCard')) {
    console.log(`Function line ${i + 1}: ${line.trim()}`);
  }
});

