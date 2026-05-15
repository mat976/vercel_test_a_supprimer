#!/bin/bash

# Script de démarrage pour ProjectLike (Next.js + MongoDB + Stripe)

echo "🚀 Démarrage de ProjectLike..."
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer : https://nodejs.org"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé."
    exit 1
fi

echo "✅ Node.js version : $(node -v)"
echo "✅ npm version : $(npm -v)"
echo ""

# Vérifier les variables d'environnement requises
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  Variable d'environnement MONGODB_URI non définie"
    echo "   Créez un fichier .env.local avec : MONGODB_URI=mongodb+srv://..."
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "⚠️  Variable d'environnement STRIPE_SECRET_KEY non définie"
    echo "   Stripe sera désactivé pour les paiements"
fi

echo ""
echo "📦 Vérification des dépendances..."

# Installer les dépendances si node_modules n'existe pas
if [ ! -d "node_modules" ]; then
    echo "   Installation des dépendances..."
    npm install
fi

echo "✅ Dépendances OK"
echo ""
echo "🌐 Lancement du serveur de développement..."
echo "   URL : http://localhost:3000"
echo ""

# Lancer Next.js en mode dev
npm run dev
