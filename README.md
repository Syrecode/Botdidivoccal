# 🎯 Discord Vocal Access Bot

Bot Discord pour gérer l'accès vocal temporaire avec système de phrase secrète.

## 🌟 Fonctionnalités

- **Session temporaire** : Accès vocal limité à 6 heures
- **Phrase secrète** : Protection par phrase définie par le streamer
- **Rôle Confiance** : Seuls les viewers de confiance peuvent demander l'accès
- **Interface tactique** : Design cyberpunk avec embeds stylés
- **Modal Discord** : Saisie sécurisée de la phrase secrète
- **Auto-cleanup** : Retrait automatique des accès après 6h

## 📋 Prérequis

- Node.js 18+ installé
- Un bot Discord créé sur le [Discord Developer Portal](https://discord.com/developers/applications)
- Les permissions suivantes pour le bot :
  - `applications.commands` (Slash Commands)
  - `Manage Roles`
  - `Send Messages`
  - `Embed Links`

## 🚀 Installation

### 1. Cloner/Télécharger le projet

```bash
cd discord-vocal-bot
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Créer un fichier `.env` à partir de `.env.example` :

```bash
cp .env.example .env
```

Remplir les variables dans `.env` :

```env
# Token du bot Discord
DISCORD_TOKEN=votre_token_ici

# ID de l'application (Client ID)
CLIENT_ID=votre_client_id

# ID du serveur Discord
GUILD_ID=votre_guild_id

# IDs des channels et rôles (déjà configurés)
INFO_CHANNEL_ID=893976804505833533
VOCAL_CHANNEL_ID=1376236628212842599
CONFIANCE_ROLE_ID=1449044202620190871
VOCAL_ACCESS_ROLE_ID=1449046383402418361
STREAMER_ROLE_ID=1017255214287421450
```

### 4. Inviter le bot sur votre serveur

Générer un lien d'invitation avec ces permissions :
```
https://discord.com/api/oauth2/authorize?client_id=VOTRE_CLIENT_ID&permissions=268435456&scope=bot%20applications.commands
```

Remplacez `VOTRE_CLIENT_ID` par l'ID de votre bot.

### 5. Lancer le bot

```bash
npm start
```

Ou en mode développement avec auto-reload :
```bash
npm run dev
```

## 🎮 Utilisation

### Commandes disponibles

#### `/start-session [phrase]`
**Permissions** : Rôle Streamer uniquement

Démarre une nouvelle session d'accès vocal de 6 heures.

**Exemple** :
```
/start-session phrase:StarCitizenRules2024
```

**Comportement** :
- Crée un embed dans le channel info avec un bouton de vérification
- Lance un timer de 6 heures
- Empêche de créer une nouvelle session si une est déjà active

#### `/shutdown`
**Permissions** : Rôle Streamer uniquement

Arrête immédiatement la session en cours et retire tous les accès.

**Comportement** :
- Retire le rôle VocalAccess de tous les membres
- Supprime l'embed d'information
- Réinitialise la session

### Workflow pour les utilisateurs

1. **Le streamer lance la session** avec `/start-session`
2. **Un embed apparaît** dans le channel info avec un bouton 🔐
3. **Les membres avec le rôle Confiance** cliquent sur le bouton
4. **Un modal s'ouvre** pour entrer la phrase secrète
5. **Si la phrase est correcte** → Rôle VocalAccess attribué pour 6h
6. **Après 6 heures** → Accès automatiquement retiré

## 🎨 Design

L'interface utilise le thème **Tactical Interface 2955** :
- Couleur principale : Cyan (`#00FFFF`)
- Style : Cyberpunk / Holographique
- Embeds avec bordures ANSI
- Emojis tactiques : 🎯 🔐 ⏱️ 🎮

## 🔒 Sécurité

- **Vérification des rôles** : Seuls les membres avec "Confiance" peuvent demander l'accès
- **Phrase secrète case-sensitive** : Doit être exacte
- **Permissions limitées** : Seul le rôle Streamer peut gérer les sessions
- **Session unique** : Une seule session active à la fois
- **Logs détaillés** : Toutes les actions sont tracées dans la console

## 📊 Structure du projet

```
discord-vocal-bot/
├── index.js           # Fichier principal du bot
├── package.json       # Dépendances et scripts
├── .env.example       # Template de configuration
├── .env              # Configuration (à créer, non versionné)
└── README.md         # Documentation
```

## 🐛 Dépannage

### Le bot ne répond pas aux commandes
- Vérifiez que le bot est bien en ligne
- Vérifiez que les commandes sont enregistrées : regardez les logs au démarrage
- Vérifiez les permissions du bot sur le serveur

### Les rôles ne sont pas attribués
- Vérifiez que le bot a la permission "Manage Roles"
- Vérifiez que le rôle du bot est **au-dessus** du rôle VocalAccess dans la hiérarchie

### L'embed ne s'affiche pas
- Vérifiez l'ID du channel info dans le `.env`
- Vérifiez que le bot peut écrire dans ce channel

### Erreur "Session déjà active"
- Utilisez `/shutdown` pour terminer la session en cours
- Attendez que le timer de 6h expire

## 🔧 Configuration avancée

### Modifier la durée de la session

Dans `index.js`, ligne 33 :
```javascript
sessionDuration: 6 * 60 * 60 * 1000 // 6 heures
```

Modifier le `6` par le nombre d'heures souhaité.

### Personnaliser l'embed

Modifier la fonction `createSessionEmbed()` à partir de la ligne 88.

## 📝 Logs

Le bot affiche des logs détaillés :
- ✅ Succès (connexion, commandes, attribution de rôles)
- ❌ Erreurs (échecs d'attribution, permissions manquantes)
- 🎯 Actions importantes (démarrage/arrêt de session)
- 🔐 Tentatives de vérification (réussies et échouées)

## 🤝 Support

Créé pour la communauté POLYV et le stream de ton ami !

Pour toute question ou amélioration, n'hésite pas à modifier le code selon tes besoins. 💎

---

**Version** : 1.0.0  
**Auteur** : Soyour  
**Style** : Tactical Interface 2955 🚀
