# Configuration GitHub Actions - Déploiement VPS

Ce guide explique comment configurer le workflow GitHub Actions pour automatiser le déploiement sur votre VPS.

## 📋 Prérequis

- Un compte GitHub avec accès au repository
- Accès SSH au VPS (`asmodan3110@vmi3018824`)
- La clé SSH privée pour le VPS

## 🔑 Configuration des Secrets GitHub

### 1. Accédez aux paramètres du repository

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** (⚙️)
3. Allez dans **Secrets and variables** → **Actions**

### 2. Créez les secrets suivants

#### `VPS_HOST`
- **Valeur** : `vmi3018824.contabo.com` (ou votre IP VPS)
- **Description** : Adresse du serveur VPS

#### `VPS_USER`
- **Valeur** : `asmodan3110`
- **Description** : Nom d'utilisateur SSH

#### `VPS_PORT`
- **Valeur** : `22` (ou le port SSH personnalisé)
- **Description** : Port SSH du VPS

#### `VPS_SSH_KEY`
- **Valeur** : Contenu de votre clé SSH **privée**
- **Description** : Clé SSH privée pour l'authentification

**Comment obtenir votre clé SSH privée** :
```bash
# Sur votre machine locale
cat ~/.ssh/id_rsa  # ou le chemin vers votre clé privée

# Puis copiez-collez le contenu complet dans GitHub
```

## 📝 Exemple de configuration

```
VPS_HOST=vmi3018824.contabo.com
VPS_USER=asmodan3110
VPS_PORT=22
VPS_SSH_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA...
... (contenu complet de la clé)
...
-----END RSA PRIVATE KEY-----
```

## ✅ Vérification

### 1. Testez la connexion SSH

```bash
# Testez la connexion avant GitHub Actions
ssh -i ~/.ssh/your_key asmodan3110@vmi3018824
```

### 2. Vérifiez que le répertoire VPS existe

```bash
# Sur le VPS
ls -la /opt/apps/GlobalSimGroup/
# Devrait afficher :
# - Global-Sim-Group-frontend/
# - docker-compose.yml
# - .env
```

### 3. Lancez un déploiement

1. Faites un commit et un push sur `main` :
   ```bash
   git add .
   git commit -m "test: trigger GitHub Actions deployment"
   git push origin main
   ```

2. Allez sur **Actions** dans GitHub pour voir le workflow en cours d'exécution
3. Vérifiez les logs pour voir la progression

## 🐛 Dépannage

### ❌ "Permission denied (publickey)"
- Vérifiez que `VPS_SSH_KEY` contient la **clé privée** complète
- Assurez-vous que les sauts de ligne sont préservés
- Testez la connexion locale d'abord

### ❌ "docker-compose: not found"
- Vérifiez que docker-compose est installé sur le VPS
- Testez : `ssh asmodan3110@vmi3018824 docker-compose --version`

### ❌ "permission denied" sur les commandes Docker
- Assurez-vous que l'utilisateur peut exécuter `sudo` sans mot de passe
- Testez : `ssh asmodan3110@vmi3018824 sudo docker ps`

### ❌ Le workflow ne démarre pas
- Vérifiez que le fichier `.github/workflows/deploy.yml` est sur `main`
- Allez à **Actions** et vérifiez s'il y a des erreurs de syntaxe

## 📊 Workflow étapes

1. ✅ **Checkout** : Récupère le code source
2. ✅ **Setup Node** : Installe Node.js 22
3. ✅ **Install** : Installe les dépendances npm
4. ✅ **Lint & Type Check** : Valide le TypeScript
5. ✅ **Tests** : Lance la suite de tests
6. ✅ **Build** : Compile le bundle production
7. ✅ **Deploy** : SSH vers le VPS et exécute les commandes de déploiement
8. ✅ **Cleanup** : Supprime la clé SSH temporaire

## 🚀 Automatisation

Une fois configuré, chaque **push sur `main`** déploiera automatiquement :

1. Git pull des derniers changements
2. Arrêt des conteneurs
3. Nettoyage Docker
4. Build et redémarrage des conteneurs
5. Vérification du statut

## 📧 Notifications

Pour recevoir des notifications en cas d'erreur :

1. Allez à **Settings** → **Notifications**
2. Cochez "Email on failed workflow runs"
3. Ou intégrez avec Slack/Discord via des Actions tierces

## 🔐 Sécurité

- ✅ La clé SSH est supprimée après chaque déploiement
- ✅ Les secrets ne sont jamais affichés dans les logs
- ✅ Utilisez une clé SSH dédiée pour les déploiements (pas votre clé personnelle)
- ✅ Limitez les permissions de l'utilisateur au strict nécessaire

## 📞 Support

Si le workflow échoue :
1. Vérifiez les logs dans **Actions**
2. Testez les commandes manuellement sur le VPS
3. Assurez-vous que tous les secrets sont configurés correctement
