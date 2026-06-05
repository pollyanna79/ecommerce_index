const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const outPath = path.join(__dirname, 'env.js');

if (!fs.existsSync(envPath)) {
    console.error('.env não encontrado. Crie um arquivo .env a partir de .env.example.');
    process.exit(1);
}

const lines = fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

const env = {};
for (const line of lines) {
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    env[key] = value;
}

const js = `// Este arquivo é gerado a partir de .env\n// Não comite env.js no repositório.\nwindow.APP_CONFIG = ${JSON.stringify(env, null, 4)};\n`;
fs.writeFileSync(outPath, js, 'utf8');
console.log('env.js gerado com sucesso.');