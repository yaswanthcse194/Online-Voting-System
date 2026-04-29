// backend/scripts/parseCandidates.js
// This script parses your candidate text data into clean JSON

import fs from "fs";

// Your exact party symbols mapping
const partySymbols = {
  "DMK": "🌄", "AIADMK": "🌱", "BJP": "🪷", "INC": "✋", "NTK": "👨‍🌾",
  "TVK": "🐿️", "PMK": "🥭", "AMMK": "🍚", "DMDK": "🥁", "VCK": "🏺",
  "KMDK": "🦁", "AIPTMMK": "🎋", "CPI": "🔨", "IUML": "🪜",
  "NOTA": "❌", "Others": "🗳️"
};

// Parse the main election data (DMK/AIADMK/etc.)
function parseMainCandidates(rawText) {
  const lines = rawText.split('\n').filter(l => l.trim());
  const candidates = [];
  
  for (const line of lines) {
    // Skip header lines, region labels, empty
    if (line.match(/^(Sl\.No|Chennai|Kanchipuram|TVK:|NTK:|AIPTMMK)/i) || !line.includes('\t')) continue;
    
    const parts = line.split('\t').map(p => p.trim()).filter(p => p);
    if (parts.length < 5) continue;
    
    // Format: [No, Constituency, Party1, Name1, Party2, Name2]
    const constituency = parts[1]?.replace(/\(SC\)|\(ST\)/g, '').trim();
    
    // First candidate
    if (parts[2] && parts[3] && partySymbols[parts[2]]) {
      candidates.push({
        name: parts[3],
        party: parts[2].toUpperCase(),
        constituency,
        symbol: partySymbols[parts[2]]
      });
    }
    // Second candidate
    if (parts[4] && parts[5] && partySymbols[parts[4]]) {
      candidates.push({
        name: parts[5],
        party: parts[4].toUpperCase(),
        constituency,
        symbol: partySymbols[parts[4]]
      });
    }
  }
  return candidates;
}

// Parse TVK candidates (special format)
function parseTVK(rawText) {
  const lines = rawText.split('\n').filter(l => l.trim());
  const candidates = [];
  let inTVK = false;
  
  for (const line of lines) {
    if (line.trim() === 'TVK:') { inTVK = true; continue; }
    if (inTVK && (line.includes('NTK:') || line.includes('AIPTMMK:'))) break;
    if (!inTVK) continue;
    
    // Format: "Constituency - Name (note)"
    const match = line.match(/^(.+?)\s*[-–]\s*([^(-]+?)(?:\s*\([^)]*\))?$/);
    if (match) {
      const constituency = match[1].trim().replace(/\(SC\)|\(ST\)/g, '');
      const name = match[2].trim();
      candidates.push({
        name,
        party: "TVK",
        constituency,
        symbol: "🐿️"
      });
    }
  }
  return candidates;
}

// Parse NTK candidates (numbered format)
function parseNTK(rawText) {
  const lines = rawText.split('\n').filter(l => l.trim());
  const candidates = [];
  let inNTK = false;
  
  for (const line of lines) {
    if (line.trim() === 'NTK:') { inNTK = true; continue; }
    if (inNTK && line.includes('AIPTMMK:')) break;
    if (!inNTK) continue;
    
    // Format: "1 Sridhar 1 - Gummidipoondi"
    const match = line.match(/^\d+\s+([^-]+?)\s+\d+\s*[-–]\s*(.+)$/);
    if (match) {
      const name = match[1].trim();
      const constituency = match[2].trim().replace(/\(SC\)|\(ST\)/g, '');
      candidates.push({
        name,
        party: "NTK",
        constituency,
        symbol: "👨‍🌾"
      });
    }
  }
  return candidates;
}

// Parse AIPTMMK (table format with extra fields)
function parseAIPTMMK(rawText) {
  const lines = rawText.split('\n').filter(l => l.trim());
  const candidates = [];
  let inAIPTMMK = false;
  
  for (const line of lines) {
    if (line.trim() === 'AIPTMMK') { inAIPTMMK = true; continue; }
    if (!inAIPTMMK) continue;
    if (line.match(/^\d+\s+$/)) continue; // skip number-only lines
    
    const parts = line.split('\t').map(p => p.trim()).filter(p => p);
    if (parts.length >= 3 && parts[1] && !parts[1].match(/^(Male|Female)/i)) {
      candidates.push({
        name: parts[1],
        party: "AIPTMMK",
        constituency: parts[2]?.replace(/\(SC\)|\(ST\)/g, ''),
        symbol: "🎋"
      });
    }
  }
  return candidates;
}

// Main execution
const rawData = fs.readFileSync('candidate_data.txt', 'utf8'); // Save your data here first

const allCandidates = [
  ...parseMainCandidates(rawData),
  ...parseTVK(rawData),
  ...parseNTK(rawData),
  ...parseAIPTMMK(rawData)
];

// Remove duplicates (same name+constituency+party)
const unique = [];
const seen = new Set();
for (const c of allCandidates) {
  const key = `${c.name}|${c.constituency}|${c.party}`;
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(c);
  }
}

// Save to JSON
fs.writeFileSync('candidates.json', JSON.stringify(unique, null, 2));
console.log(`✅ Parsed ${unique.length} unique candidates to candidates.json`);