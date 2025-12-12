# 🚀 Déploiement sur fly.io

## ✅ Ce qui a été corrigé

Le timeout était causé par l'absence de serveur HTTP. Fly.io a besoin d'un endpoint pour vérifier que l'app fonctionne.

**Ajouts :**
- ✅ Serveur HTTP sur le port 3000
- ✅ Endpoint `/health` pour les health checks
- ✅ Configuration fly.toml optimisée
- ✅ Dockerfile pour le déploiement

## 📋 Prérequis

1. **Installer flyctl** (CLI de fly.io)
```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

2. **Se connecter à fly.io**
```bash
fly auth login
```

## 🔧 Configuration des secrets (Variables d'environnement)

Depuis ton terminal, dans le dossier du bot :

```bash
# Token Discord
fly secrets set DISCORD_TOKEN="ton_token_ici"

# Client ID
fly secrets set CLIENT_ID="ton_client_id"

# Guild ID
fly secrets set GUILD_ID="ton_guild_id"

# Les autres variables sont déjà dans fly.toml ou .env
fly secrets set INFO_CHANNEL_ID="893976804505833533"
fly secrets set VOCAL_CHANNEL_ID="1376236628212842599"
fly secrets set CONFIANCE_ROLE_ID="1449044202620190871"
fly secrets set VOCAL_ACCESS_ROLE_ID="1449046383402418361"
fly secrets set STREAMER_ROLE_ID="1017255214287421450"
```

## 🚀 Déploiement

### Si c'est ta première fois (app pas encore créée)

```bash
fly launch
```

Répondre aux questions :
- App name: `botdidivoccal` (ou autre nom)
- Region: `cdg` (Paris) recommandé
- PostgreSQL: `Non`
- Redis: `Non`

### Si l'app existe déjà

```bash
fly deploy
```

## 🔍 Vérification

### Voir les logs en temps réel
```bash
fly logs
```

Tu devrais voir :
```
✅ Bot connecté en tant que VocalAccessBot#1234
🎯 Vocal Access System opérationnel !
🌐 Serveur HTTP démarré sur le port 3000
✅ Commandes enregistrées avec succès !
```

### Tester le health check
```bash
curl https://botdidivoccal.fly.dev/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "bot": "VocalAccessBot#1234",
  "uptime": 123.456,
  "session": {
    "active": false,
    "members": 0
  }
}
```

## 🎮 Utilisation après déploiement

Ton bot est maintenant **en ligne 24/7** ! 🎉

Les commandes Discord fonctionnent normalement :
- `/start-session phrase:secret`
- `/shutdown`

## 📊 Commandes utiles fly.io

```bash
# Voir le statut
fly status

# Voir les logs
fly logs

# Redémarrer l'app
fly apps restart botdidivoccal

# Voir les secrets configurés
fly secrets list

# SSH dans la machine (debug)
fly ssh console

# Voir l'utilisation
fly dashboard
```

## 💰 Coûts

- **Machines partagées** : ~$2-3/mois (toujours actif)
- **Premier 3 petites VMs** : Gratuites chez fly.io
- **Bandwidth** : 160 GB/mois inclus gratuitement

Pour un bot Discord, ça reste dans le tier gratuit ! 💎

## 🐛 Troubleshooting

### Le bot ne démarre pas
```bash
# Vérifier les logs
fly logs

# Vérifier les secrets
fly secrets list
```

### Health check fail
- Vérifie que le port 3000 est bien utilisé
- Le endpoint `/health` doit répondre en moins de 10 secondes

### Bot déconnecté
```bash
# Redémarrer
fly apps restart botdidivoccal
```

## 🔄 Mise à jour du code

Quand tu modifies le code :

```bash
# 1. Commit tes changements (si tu utilises Git)
git add .
git commit -m "Update bot"

# 2. Redéployer
fly deploy
```

Fly.io va automatiquement :
1. Builder la nouvelle image Docker
2. Déployer sans downtime
3. Redémarrer le bot

---

## ✨ Ton bot est maintenant hébergé 24/7 !

Plus besoin de laisser ton PC allumé. Le bot tourne en continu sur les serveurs de fly.io. 🚀

**Prochaine étape** : `fly deploy` et c'est parti ! 💎
