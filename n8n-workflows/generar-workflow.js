// Genera routine-agent-workflow.ready.json con las keys del backend/.env
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../backend/.env');
const templatePath = path.join(__dirname, 'routine-agent-workflow.json');
const outputPath = path.join(__dirname, 'routine-agent-workflow.ready.json');

// Leer .env
const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const required = ['SUPABASE_SERVICE_ROLE_KEY', 'GROQ_API_KEY'];
const missing = required.filter(k => !env[k]);
if (missing.length) {
  console.error('Faltan estas variables en backend/.env:', missing.join(', '));
  process.exit(1);
}

// Sustituir placeholders
let workflow = fs.readFileSync(templatePath, 'utf8');
workflow = workflow
  .replace(/"=\{ 'Bearer ' \+ \$env\.SUPABASE_SERVICE_ROLE_KEY \}"/g,
    `"Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}"`)
  .replace(/"=\{ \$env\.SUPABASE_SERVICE_ROLE_KEY \}"/g,
    `"${env.SUPABASE_SERVICE_ROLE_KEY}"`)
  .replace(/"=\{ 'Bearer ' \+ \$env\.GROQ_API_KEY \}"/g,
    `"Bearer ${env.GROQ_API_KEY}"`);

fs.writeFileSync(outputPath, workflow, 'utf8');
console.log('✓ Archivo generado:', outputPath);
console.log('  Importa ese archivo en n8n y activa el workflow.');
