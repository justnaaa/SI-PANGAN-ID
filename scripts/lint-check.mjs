import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const filesToCheck = [
    'src/main.js',
    'src/domain/sharedFoundation.js',
    'src/data/initialState.js',
    'src/controllers/coreAppController.js',
    'src/controllers/authAndRoleController.js',
    'src/services/supabaseAndStorage.js',
    'src/services/receiptPdfService.js',
    'src/ai/priceAdvisorEngine.js',
    'src/ai/aiForecastAndSurplus.js'
];

let hasError = false;
for (const rel of filesToCheck) {
    const abs = path.resolve(process.cwd(), rel);
    if (!fs.existsSync(abs)) {
        console.error(`[lint] Missing file: ${rel}`);
        hasError = true;
        continue;
    }
    const res = spawnSync(process.execPath, ['--check', abs], { encoding: 'utf8' });
    if (res.status !== 0) {
        console.error(`[lint] Syntax error in ${rel}:\n${res.stderr}`);
        hasError = true;
    }
}

// Check duplicate HTML element IDs in index.html
const htmlPath = path.resolve(process.cwd(), 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const idRegex = /\bid="([^"]+)"/g;
const seenIds = new Map();
let match;
while ((match = idRegex.exec(html)) !== null) {
    const id = match[1];
    seenIds.set(id, (seenIds.get(id) || 0) + 1);
}
for (const [id, count] of seenIds.entries()) {
    if (count > 1) {
        console.error(`[lint] Duplicate HTML id="${id}" (${count}x) in index.html`);
        hasError = true;
    }
}

if (hasError) {
    process.exit(1);
}
console.log(`[lint] OK — ${filesToCheck.length} JS modules syntax-checked & ${seenIds.size} unique HTML IDs verified.`);
