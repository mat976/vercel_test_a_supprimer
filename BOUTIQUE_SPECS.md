# Cahier des Charges - Module E-commerce Bougies (ProjectLike)

## 1. Reformulation du besoin client

**Sarah souhaite** vendre ses 20 bougies artisanales uniques en ligne. Elle veut un catalogue public, un tunnel Stripe simple et un back-office sans formation technique. Contrairement à Instagram où plusieurs clients pouvaient réserver la même pièce, le système doit bloquer la double-vente. L'enjeu : garder 100% de ses marges en évitant les marketplaces.

| Explicite (ce qu'elle a dit) | Implicite (non dit mais nécessaire) |
|------------------------------|-------------------------------------|
| • Vente de 20 bougies pièces uniques | • Conformité RGPD (données clients + paiements) |
| • Paiement Stripe intégré | • Sécurisation des routes admin (authentification renforcée) |
| • Page admin pour ajouter/modifier produits | • Gestion des erreurs de paiement et remboursements |
| • Redirection boutique après connexion | • Responsive mobile (son client cible est mobile-first) |
| • Validation mot de passe 6 caractères | • Protection race condition (double achat simultané d'une même pièce) |

---

## 2. Personas

### Persona 1 : "L'Artisane Passionnée"
| | |
|---|---|
| **Prénom** | Clarel |
| **Âge** | 32 ans |
| **Situation** | Artisane bougière, crée des pièces uniques à la main dans son atelier |
| **Objectif** | Vendre ses créations artisanales en ligne sans passer par des plateformes qui prennent trop de commission |
| **Frustrations** | Les CMS complexes (WordPress), la double vente sur différentes plateformes, la gestion manuelle des stocks |
| **Device** | Desktop/tablet (gestion atelier), occasionnellement mobile |
| **Usage** | Power-user sur l'admin, besoin de clarté visuelle stock, met à jour son catalogue régulièrement |

### Persona 2 : "Le Collectionneur Otaku"
| | |
|---|---|
| **Prénom** | Jerome |
| **Âge** | 26 ans |
| **Situation** | Développeur de jeux gacha japonais, travaille en remote, fan de culture japonaise |
| **Objectif** | Collectionner des bougies artisanales uniques avec des thématiques anime/nature pour son setup gaming |
| **Frustrations** | Les sites compliqués avec trop d'étapes, les stocks menteurs ("dispo" mais vendu), les designs trop classiques |
| **Device** | Smartphone (90% du temps), grand écran pour le gaming |
| **Usage** | Navigation mobile-first, achat impulsif quand il voit un design unique, abandon si friction au paiement |

---

## 3. User Stories (6)

| ID | User Story | Priorité |
|---|---|---|
| US-01 | En tant que visiteur, je veux consulter le catalogue des bougies disponibles afin de découvrir les produits en vente. | **Must** |
| US-02 | En tant que visiteur, je veux créer un compte avec email/mot de passe afin de pouvoir finaliser un achat. | **Must** |
| US-03 | En tant qu'utilisateur connecté, je veux ajouter une bougie à mon panier afin de préparer mon achat. | **Must** |
| US-04 | En tant qu'utilisateur connecté, je veux payer via Stripe en quelques clics afin de finaliser mon achat en toute sécurité. | **Must** |
| US-05 | En tant qu'administrateur, je veux ajouter une nouvelle bougie avec photo, description et prix afin de mettre à jour le catalogue. | **Must** |
| US-06 | En tant qu'utilisateur connecté, je veux voir ma commande confirmée et vider mon panier afin d'être certain que mon achat est enregistré. | **Should** |

---

## 4. Priorisation MoSCoW

| Priorité | User Stories | Justification |
|---|---|---|
| **M (Must)** | US-01, US-02, US-03, US-04, US-05 | Sans ces 5, le MVP ne permet pas de tester l'hypothèse de vente (catalogue, compte, panier, paiement, admin) |
| **S (Should)** | US-06 | Important pour la confiance, mais le webhook Stripe + page succès basique suffisent au lancement |
| **C (Could)** | • Historique des commandes utilisateur<br>• Notifications email post-achat<br>• Filtres catalogue (prix, parfum) | Agréables mais non bloquants pour le MVP |
| **W (Won't this time)** | • Système de favoris/wishlist<br>• Avis clients sur les bougies<br>• Code promo/réductions | Reportés à la v2 si traction confirmée |

---

## 5. Critères d'acceptation Gherkin

### US-04 : Paiement Stripe (Must)

```gherkin
Scénario : Paiement réussi d'une bougie
  Étant donné que je suis connecté avec un compte validé
  Et que j'ai une bougie "Vanille Coco" (20€) dans mon panier
  Quand je clique sur "Procéder au paiement"
  Et que je complète le formulaire Stripe avec une carte valide (4242 4242 4242 4242)
  Alors je suis redirigé vers la page de confirmation
  Et la bougie "Vanille Coco" est marquée comme "vendue" dans la base
  Et mon panier est vidé

Scénario : Échec paiement carte refusée
  Étant donné que je suis connecté avec un compte validé
  Et que j'ai une bougie dans mon panier
  Quand je clique sur "Procéder au paiement"
  Et que je complète le formulaire Stripe avec une carte refusée (4000 0000 0000 0002)
  Alors je reste sur la page panier
  Et un message "Paiement refusé" s'affiche
  Et la bougie reste disponible à l'achat

Scénario : Double achat simultané d'une bougie unique
  Étant donné que je suis connecté et qu'une bougie "Rose" est disponible
  Et qu'un autre utilisateur ajoute aussi cette bougie à son panier
  Quand je finalise mon paiement Stripe avec succès
  Alors l'autre utilisateur voit une erreur "Produit indisponible" à la validation de son panier
```

### US-05 : Ajout de produit par Admin (Must)

```gherkin
Scénario : Ajout réussi d'une nouvelle bougie
  Étant donné que je suis connecté en tant qu'admin (isAdmin: true)
  Et que je suis sur la page /admin/bougies
  Quand je clique sur l'onglet "Ajouter"
  Et que je remplis le formulaire avec :
    | Nom | "Bougie Chocolat" |
    | Description | "Arôme gourmand" |
    | Prix | 25.00 |
    | Stock ID | "BOUGIE-CHOC-001" |
  Et que je clique sur "Ajouter au catalogue"
  Alors la bougie apparaît dans l'inventaire avec le statut "Disponible"
  Et elle est visible dans le catalogue boutique

Scénario : Tentative d'ajout avec stock ID déjà existant
  Étant donné que je suis connecté en tant qu'admin
  Et qu'une bougie avec Stock ID "BOUGIE-001" existe déjà
  Quand je tente d'ajouter une nouvelle bougie avec le même Stock ID
  Alors un message "Cet identifiant de stock existe déjà" s'affiche
  Et la création est bloquée

Scénario : Accès admin refusé pour utilisateur standard
  Étant donné que je suis connecté en tant qu'utilisateur standard (isAdmin: false)
  Quand je tente d'accéder à /admin/bougies
  Alors je suis redirigé vers /chat
  Et un message "Accès non autorisé" s'affiche
```

---

## 6. Architecture des 3 pages

| Page | URL | Fonctionnalités clés | Accès |
|---|---|---|---|
| **Catalogue** | `/boutique` | Grille produits, badge "Pièce unique", lien détail | Public |
| **Détail Produit** | `/boutique/[id]` | Image, description, prix, ajout panier | Public |
| **Panier** | `/panier` | Liste panier, total, bouton Stripe, badge compteur | Connecté |
| **Succès** | `/panier/success` | Confirmation, vidage panier | Connecté (post-paiement) |
| **Admin** | `/admin/bougies` | Ajout produit, inventaire (dispo/vendu), modification | Admin uniquement |

---

## 7. Variables d'environnement requises

```env
# Base de données
MONGODB_URI=mongodb+srv://...

# Stripe (obligatoires pour les paiements)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=https://...vercel.app
```
