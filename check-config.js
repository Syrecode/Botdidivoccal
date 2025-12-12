import dotenv from 'dotenv';
import { existsSync } from 'fs';

dotenv.config();

console.log('🔍 Vérification de la configuration...\n');

const requiredEnvVars = [
  'DISCORD_TOKEN',
  'CLIENT_ID',
  'GUILD_ID',
  'INFO_CHANNEL_ID',
  'VOCAL_CHANNEL_ID',
  'CONFIANCE_ROLE_ID',
  'VOCAL_ACCESS_ROLE_ID',
  'STREAMER_ROLE_ID'
];

let hasErrors = false;

// Vérifier l'existence du fichier .env
if (!existsSync('.env')) {
  console.error('❌ Fichier .env introuvable !');
  console.log('💡 Créez un fichier .env à partir de .env.example\n');
  hasErrors = true;
}

// Vérifier chaque variable
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === 'your_bot_token_here' || value === 'your_client_id_here' || value === 'your_guild_id_here') {
    console.error(`❌ ${varName} manquant ou non configuré`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName} configuré`);
  }
});

console.log('');

if (hasErrors) {
  console.error('❌ Configuration incomplète ! Corrigez les erreurs ci-dessus.\n');
  process.exit(1);
} else {
  console.log('✅ Configuration valide ! Vous pouvez démarrer le bot.\n');
  console.log('Pour démarrer le bot : npm start\n');
}
