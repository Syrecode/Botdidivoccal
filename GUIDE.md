# 🎮 Guide d'utilisation rapide

## 🚀 Setup initial (à faire une seule fois)

### 1. Créer le bot Discord
1. Aller sur https://discord.com/developers/applications
2. Cliquer "New Application" → Donner un nom (ex: "Vocal Access Bot")
3. Aller dans "Bot" → Cliquer "Add Bot"
4. Copier le **Token** → Le mettre dans `.env` (DISCORD_TOKEN)
5. Activer ces options sous "Privileged Gateway Intents" :
   - ✅ Server Members Intent
   - ✅ Message Content Intent (optionnel)

### 2. Récupérer les IDs nécessaires
1. Activer le mode développeur Discord : `Paramètres > Avancés > Mode développeur`
2. **Client ID** : Sur la page "General Information" de votre bot
3. **Guild ID** : Clic droit sur votre serveur → Copier l'identifiant
4. Les autres IDs sont déjà configurés dans `.env.example`

### 3. Inviter le bot
URL à personnaliser avec votre CLIENT_ID :
```
https://discord.com/api/oauth2/authorize?client_id=VOTRE_CLIENT_ID&permissions=268435456&scope=bot%20applications.commands
```

### 4. Configuration des rôles
⚠️ **IMPORTANT** : Le rôle du bot doit être **AU-DESSUS** du rôle VocalAccess dans la hiérarchie !

Hiérarchie recommandée :
```
1. @Admin/Modérateur
2. @Bot Vocal Access  ← Rôle du bot
3. @Streamer
4. @VocalAccess      ← Ce rôle sera géré par le bot
5. @Confiance
6. @everyone
```

## 📖 Scénarios d'utilisation

### Scénario 1 : Stream classique
```
1. Le streamer lance : /start-session phrase:LiveDuSoir2024
2. Les viewers de confiance voient l'embed dans #info
3. Ils cliquent sur 🔐 et entrent "LiveDuSoir2024"
4. Accès accordé pour 6h → Ils rejoignent le vocal
5. Après le stream : /shutdown (ou attendre 6h)
```

### Scénario 2 : Session événement
```
1. Avant l'événement : /start-session phrase:EventPolyv2024
2. Partage de la phrase sur Discord ou vocal
3. Les membres de confiance obtiennent l'accès
4. L'événement dure moins de 6h → /shutdown à la fin
```

### Scénario 3 : Phrase simple
```
/start-session phrase:secret
/start-session phrase:1234
/start-session phrase:go
```
✅ La phrase peut être courte et simple !

## 💡 Astuces et bonnes pratiques

### Pour le streamer
- **Phrase unique** : Changez la phrase à chaque stream pour plus de sécurité
- **Annonce vocale** : Donnez la phrase à l'oral pendant le live
- **Shutdown manuel** : Utilisez `/shutdown` en fin de stream plutôt que d'attendre 6h
- **Vérification** : L'embed montre le nombre de membres autorisés en temps réel

### Pour la configuration
- **Rôle Confiance** : Attribuez-le manuellement aux viewers réguliers
- **Channel info** : Utilisez un channel visible par les membres de confiance uniquement
- **Permissions vocal** : Le channel vocal `1376236628212842599` doit être configuré pour n'autoriser que le rôle VocalAccess

### Sécurité
- **Case sensitive** : "Secret" ≠ "secret" ≠ "SECRET"
- **Pas d'espaces** : Attention aux espaces avant/après
- **Caractères spéciaux** : Autorisés (ex: "Live@2024!")
- **Session unique** : Impossible de lancer 2 sessions simultanées

## 🔧 Commandes utiles

### Vérifier la config
```bash
npm run check
```

### Démarrer le bot
```bash
npm start
```

### Mode développement (auto-reload)
```bash
npm run dev
```

### Voir les logs en temps réel
Les logs affichent :
- ✅ Accès accordés avec nom du membre
- ❌ Tentatives échouées avec phrase incorrecte
- 🎯 Démarrages/arrêts de session
- 🛑 Retraits de rôles

## ⚠️ Problèmes fréquents

### "Une session est déjà en cours"
**Solution** : `/shutdown` puis recommencer

### Le bouton ne fait rien
**Cause** : L'utilisateur n'a pas le rôle Confiance  
**Solution** : Vérifier les rôles du membre

### La phrase ne fonctionne pas
**Vérifier** :
- Pas d'espaces avant/après
- Majuscules/minuscules exactes
- Caractères spéciaux corrects

### Le rôle n'est pas attribué
**Vérifier** :
1. Le bot a la permission "Manage Roles"
2. Le rôle du bot est AU-DESSUS de VocalAccess
3. Le rôle VocalAccess existe (ID: 1449046383402418361)

### L'embed ne s'affiche pas
**Vérifier** :
1. Le channel ID est correct (893976804505833533)
2. Le bot peut écrire dans ce channel
3. Le bot a la permission "Send Messages" et "Embed Links"

## 📊 Exemple de workflow complet

```
[17:00] Streamer : /start-session phrase:StarCitizen2024
         Bot → Embed posté dans #info

[17:01] Viewer1 (avec Confiance) : *clique sur 🔐*
         Bot → Modal "Entrez la phrase secrète"
         Viewer1 : tape "StarCitizen2024"
         Bot → ✅ Accès accordé à Viewer1

[17:05] Viewer2 (avec Confiance) : *clique sur 🔐*
         Bot → Modal
         Viewer2 : tape "starcitizen2024" (minuscules)
         Bot → ❌ Phrase incorrecte

[17:06] Viewer2 : *réessaye*
         Viewer2 : tape "StarCitizen2024"
         Bot → ✅ Accès accordé à Viewer2

[21:00] Streamer : /shutdown
         Bot → Retire VocalAccess à tous
         Bot → Supprime l'embed
         Bot → Session terminée
```

## 🎨 Personnalisation

### Changer la durée (dans index.js ligne 33)
```javascript
sessionDuration: 4 * 60 * 60 * 1000 // 4 heures au lieu de 6
```

### Modifier les couleurs de l'embed (ligne 94)
```javascript
.setColor('#FF00FF') // Rose au lieu de cyan
```

### Ajouter des champs à l'embed (après ligne 110)
```javascript
.addFields({
  name: '📢 Annonce',
  value: 'Bienvenue dans le vocal du stream !',
  inline: false
})
```

## 🆘 Support

Si vous rencontrez un problème :
1. Vérifiez les logs du bot (console)
2. Utilisez `npm run check` pour vérifier la config
3. Vérifiez la hiérarchie des rôles sur Discord
4. Relancez le bot (`Ctrl+C` puis `npm start`)

---

✨ **Bon stream et bon jeu dans Star Citizen !** 🚀
