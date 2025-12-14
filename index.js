import { 
  Client, 
  GatewayIntentBits, 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  REST,
  Routes,
  PermissionFlagsBits
} from 'discord.js';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// Configuration
const CONFIG = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  port: process.env.PORT || 3000,
  channels: {
    info: process.env.INFO_CHANNEL_ID,
    vocal: process.env.VOCAL_CHANNEL_ID
  },
  roles: {
    confiance: process.env.CONFIANCE_ROLE_ID,
    vocalAccess: process.env.VOCAL_ACCESS_ROLE_ID,
    streamer: process.env.STREAMER_ROLE_ID
  },
  sessionDuration: 8 * 60 * 60 * 1000 // 6 heures en millisecondes
};

// État de la session
let activeSession = {
  isActive: false,
  secretPhrase: null,
  embedMessage: null,
  authorizedMembers: new Set(),
  timer: null,
  startTime: null
};

// Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// Commandes Slash
const commands = [
  new SlashCommandBuilder()
    .setName('start-session')
    .setDescription('🔐 Démarre une session d\'accès vocal avec phrase secrète')
    .addStringOption(option =>
      option
        .setName('phrase')
        .setDescription('La phrase secrète pour accéder au vocal')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('🛑 Arrête la session en cours et retire tous les accès')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

// Enregistrement des commandes
async function registerCommands() {
  const rest = new REST().setToken(CONFIG.token);
  try {
    console.log('🔄 Enregistrement des commandes slash...');
    await rest.put(
      Routes.applicationGuildCommands(CONFIG.clientId, CONFIG.guildId),
      { body: commands }
    );
    console.log('✅ Commandes enregistrées avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement des commandes:', error);
  }
}

// Fonction pour créer l'embed de session
function createSessionEmbed() {
  return new EmbedBuilder()
    .setColor('#00FFFF')
    .setTitle('🎯 SESSION VOCALE ACTIVE')
    .setDescription('ACCÈS VOCAL TEMPORAIRE ACTIVÉ')
    .addFields(
      {
        name: '🔐 Conditions d\'accès',
        value: '> Rôle **Vocal Live** requis\n> Phrase secrète correcte\n> Cliquez sur le bouton ci-dessous',
        inline: false
      },
      {
        name: '⏱️ Durée',
        value: '> **8 heures** d\'accès\n> Expiration automatique',
        inline: true
      },
      {
        name: '🎮 Statut',
        value: '> `OPÉRATIONNEL`\n> Membres autorisés: `0`',
        inline: true
      }
    )
    .setFooter({ 
      text: '🌟 Vocal Access System v1.0 ',
      iconURL: 'https://i.imgur.com/AfFp7pu.png'
    })
    .setTimestamp();
}

// Fonction pour mettre à jour l'embed avec le nombre de membres
async function updateSessionEmbed() {
  if (!activeSession.embedMessage) return;
  
  const embed = createSessionEmbed();
  const memberCount = activeSession.authorizedMembers.size;
  
  // Mise à jour du champ statut
  embed.spliceFields(2, 1, {
    name: '🎮 Statut',
    value: `> \`OPÉRATIONNEL\`\n> Membres autorisés: \`${memberCount}\``,
    inline: true
  });
  
  await activeSession.embedMessage.edit({ embeds: [embed] });
}

// Fonction pour arrêter la session
async function endSession(guild, reason = 'Timer expiré') {
  if (!activeSession.isActive) return;
  
  console.log(`🛑 Arrêt de la session: ${reason}`);
  
  // Retirer le rôle VocalAccess de tous les membres autorisés
  const role = await guild.roles.fetch(CONFIG.roles.vocalAccess);
  if (role) {
    for (const memberId of activeSession.authorizedMembers) {
      try {
        const member = await guild.members.fetch(memberId);
        await member.roles.remove(role);
        console.log(`✅ Rôle retiré à ${member.user.tag}`);
      } catch (error) {
        console.error(`❌ Erreur pour retirer le rôle à ${memberId}:`, error);
      }
    }
  }
  
  // Supprimer l'embed si possible
  if (activeSession.embedMessage) {
    try {
      await activeSession.embedMessage.delete();
    } catch (error) {
      console.error('❌ Impossible de supprimer l\'embed:', error);
    }
  }
  
  // Clear timer
  if (activeSession.timer) {
    clearTimeout(activeSession.timer);
  }
  
  // Reset de la session
  activeSession = {
    isActive: false,
    secretPhrase: null,
    embedMessage: null,
    authorizedMembers: new Set(),
    timer: null,
    startTime: null
  };
  
  console.log('✅ Session terminée et accès réinitialisés');
}

// Event: Bot prêt
client.once('ready', async () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
  console.log('🎯 Vocal Access System opérationnel !');
  await registerCommands();
});

// Event: Commandes slash
client.on('interactionCreate', async interaction => {
  // Commande /start-session
  if (interaction.isChatInputCommand() && interaction.commandName === 'start-session') {
    // Vérifier le rôle streamer
    if (!interaction.member.roles.cache.has(CONFIG.roles.streamer)) {
      return interaction.reply({
        content: '❌ Vous n\'avez pas la permission d\'utiliser cette commande.',
        ephemeral: true
      });
    }
    
    // Vérifier si une session est déjà active
    if (activeSession.isActive) {
      return interaction.reply({
        content: '⚠️ Une session est déjà en cours ! Utilisez `/shutdown` pour l\'arrêter avant d\'en démarrer une nouvelle.',
        ephemeral: true
      });
    }
    
    const secretPhrase = interaction.options.getString('phrase');
    
    // Démarrer la session
    activeSession.isActive = true;
    activeSession.secretPhrase = secretPhrase;
    activeSession.startTime = Date.now();
    
    // Créer l'embed
    const embed = createSessionEmbed();
    
    // Créer le bouton
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('verify_access')
          .setLabel('🔐 Vérifier l\'accès')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔓')
      );
    
    // Envoyer dans le channel info
    const infoChannel = await client.channels.fetch(CONFIG.channels.info);
    const message = await infoChannel.send({
      embeds: [embed],
      components: [row]
    });
    
    activeSession.embedMessage = message;
    
    // Programmer l'arrêt automatique après 6h
    activeSession.timer = setTimeout(() => {
      endSession(interaction.guild, 'Durée de 6h écoulée');
    }, CONFIG.sessionDuration);
    
    await interaction.reply({
      content: `✅ Session démarrée avec succès !\n🔐 Phrase secrète définie\n⏱️ Durée: 6 heures\n📍 Embed posté dans <#${CONFIG.channels.info}>`,
      ephemeral: true
    });
    
    console.log(`🎯 Session démarrée par ${interaction.user.tag}`);
  }
  
  // Commande /shutdown
  if (interaction.isChatInputCommand() && interaction.commandName === 'shutdown') {
    // Vérifier le rôle streamer
    if (!interaction.member.roles.cache.has(CONFIG.roles.streamer)) {
      return interaction.reply({
        content: '❌ Vous n\'avez pas la permission d\'utiliser cette commande.',
        ephemeral: true
      });
    }
    
    if (!activeSession.isActive) {
      return interaction.reply({
        content: '⚠️ Aucune session n\'est actuellement active.',
        ephemeral: true
      });
    }
    
    await endSession(interaction.guild, 'Arrêt manuel par ' + interaction.user.tag);
    
    await interaction.reply({
      content: '✅ Session arrêtée avec succès !\n🔒 Tous les accès ont été retirés.',
      ephemeral: true
    });
  }
  
  // Bouton: Vérifier l'accès
  if (interaction.isButton() && interaction.customId === 'verify_access') {
    // Vérifier si la session est active
    if (!activeSession.isActive) {
      return interaction.reply({
        content: '❌ Aucune session n\'est active actuellement.',
        ephemeral: true
      });
    }
    
    // Vérifier le rôle Confiance
    if (!interaction.member.roles.cache.has(CONFIG.roles.confiance)) {
      return interaction.reply({
        content: '🚫 Vous devez avoir le rôle **Confiance** pour accéder à cette fonctionnalité.',
        ephemeral: true
      });
    }
    
    // Vérifier si le membre a déjà l'accès
    if (activeSession.authorizedMembers.has(interaction.user.id)) {
      return interaction.reply({
        content: '✅ Vous avez déjà l\'accès vocal !',
        ephemeral: true
      });
    }
    
    // Créer le modal pour la phrase secrète
    const modal = new ModalBuilder()
      .setCustomId('secret_phrase_modal')
      .setTitle('🔐 Vérification d\'accès');
    
    const phraseInput = new TextInputBuilder()
      .setCustomId('phrase_input')
      .setLabel('Entrez la phrase secrète')
      .setPlaceholder('La phrase exacte donnée par le streamer')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    
    const row = new ActionRowBuilder().addComponents(phraseInput);
    modal.addComponents(row);
    
    await interaction.showModal(modal);
  }
  
  // Modal: Vérification de la phrase
  if (interaction.isModalSubmit() && interaction.customId === 'secret_phrase_modal') {
    const enteredPhrase = interaction.fields.getTextInputValue('phrase_input');
    
    // Vérifier la phrase (case sensitive)
    if (enteredPhrase === activeSession.secretPhrase) {
      // Phrase correcte ! Donner le rôle VocalAccess
      try {
        const role = await interaction.guild.roles.fetch(CONFIG.roles.vocalAccess);
        await interaction.member.roles.add(role);
        
        // Ajouter à la liste des membres autorisés
        activeSession.authorizedMembers.add(interaction.user.id);
        
        // Mettre à jour l'embed
        await updateSessionEmbed();
        
        await interaction.reply({
          content: `✅ **Accès accordé !**\n🎤 Vous avez maintenant accès au vocal pour **6 heures**.\n📍 Rendez-vous dans <#${CONFIG.channels.vocal}>`,
          ephemeral: true
        });
        
        console.log(`✅ Accès accordé à ${interaction.user.tag}`);
      } catch (error) {
        console.error('❌ Erreur lors de l\'attribution du rôle:', error);
        await interaction.reply({
          content: '❌ Une erreur s\'est produite lors de l\'attribution de l\'accès.',
          ephemeral: true
        });
      }
    } else {
      // Phrase incorrecte
      await interaction.reply({
        content: '❌ **Phrase secrète incorrecte !**\nVérifiez auprès du streamer et réessayez.',
        ephemeral: true
      });
      
      console.log(`❌ Tentative échouée de ${interaction.user.tag}: "${enteredPhrase}"`);
    }
  }
});

// Gestion des erreurs
client.on('error', error => {
  console.error('❌ Erreur Discord.js:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled promise rejection:', error);
});

// Serveur HTTP pour fly.io health checks
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      bot: client.user ? client.user.tag : 'connecting...',
      uptime: process.uptime(),
      session: {
        active: activeSession.isActive,
        members: activeSession.authorizedMembers.size
      }
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(CONFIG.port, () => {
  console.log(`🌐 Serveur HTTP démarré sur le port ${CONFIG.port}`);
});

// Connexion du bot
client.login(CONFIG.token);
