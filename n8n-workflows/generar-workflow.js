// Genera routine-agent-workflow.ready.json con las keys del backend/.env
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../backend/.env');
const templatePath = path.join(__dirname, 'routine-agent-workflow.json');
const outputPath = path.join(__dirname, 'routine-agent-workflow.ready.json');

// Leer .env (maneja CRLF de Windows y LF de Linux)
const env = {};
fs.readFileSync(envPath, 'utf8')
  .replace(/\r\n/g, '\n')
  .replace(/\r/g, '\n')
  .split('\n')
  .forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (key) env[key] = val;
  });

const required = ['SUPABASE_SERVICE_ROLE_KEY', 'GROQ_API_KEY'];
const missing = required.filter(k => !env[k]);
if (missing.length) {
  console.error('Faltan estas variables en backend/.env:', missing.join(', '));
  process.exit(1);
}

// Sustituir placeholders (reemplazo directo de strings exactos)
let workflow = fs.readFileSync(templatePath, 'utf8');
workflow = workflow
  .replaceAll(`"={{ 'Bearer ' + $env.SUPABASE_SERVICE_ROLE_KEY }}"`, `"Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}"`)
  .replaceAll(`"={{ $env.SUPABASE_SERVICE_ROLE_KEY }}"`, `"${env.SUPABASE_SERVICE_ROLE_KEY}"`)
  .replaceAll(`"={{ 'Bearer ' + $env.GROQ_API_KEY }}"`, `"Bearer ${env.GROQ_API_KEY}"`);

fs.writeFileSync(outputPath, workflow, 'utf8');
console.log('✓ Archivo generado:', outputPath);
console.log('  Importa ese archivo en n8n y activa el workflow.');
