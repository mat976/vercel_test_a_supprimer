# Système de sondages

## Stack

- **Next.js 16** App Router — routes API dans `src/app/api/polls/`
- **MongoDB** — collection `polls`
- **TypeScript** — interface `Poll` dans `src/types/Poll.ts`
- **Tailwind CSS** + glassmorphism

## Structure d'un sondage (MongoDB)

```ts
{
  _id: ObjectId,
  question: string,
  options: [{ text: string, gif?: string, voters: string[] }],
  createdBy: string,       // userId
  createdByName: string,
  createdAt: Date,
  isPublic: boolean,       // vote sans connexion si true
  slug?: string,           // ex: "meilleure-pizza" → /poll/meilleure-pizza
  endsAt?: Date,           // null = sans limite
  isClosed: boolean        // fermé manuellement par le créateur
}
```

## Routes API

| Méthode | Route | Accès | Action |
|---|---|---|---|
| `GET` | `/api/polls` | Public | Liste tous les sondages |
| `POST` | `/api/polls` | Connecté | Créer un sondage |
| `PATCH` | `/api/polls` | Connecté | Voter ou fermer (`close: true`) |
| `DELETE` | `/api/polls` | Créateur | Supprimer |
| `GET` | `/api/polls/[id]` | Public | Récupérer par `_id` ou `slug` |
| `PATCH` | `/api/polls/[id]` | Connecté / IP si public | Voter via page dédiée |

## Composants

- **`CreatePoll`** — modal de création : question, 2–6 options (texte + GIF optionnel), toggle public/privé, durée, slug personnalisé. Après création affiche le lien partageable.
- **`PollBanner`** — accordéon en haut du chat : fermé = question défile, ouvert = vote complet + countdown + boutons stop/delete/copier-lien.
- **`PollCard`** — carte de vote réutilisable. Prop `fullPage` pour la page dédiée (GIFs en taille naturelle).
- **`PollBannerWrapper`** — wrapper client qui passe le `userId` session à `PollBanner`.

## Page partageable

`/poll/[id]` — accessible par `_id` ou `slug`. Vote sans connexion si `isPublic: true`, sinon message d'avertissement.

## Cycle de vie d'un sondage

```
Création → actif → [endsAt dépassé] ou [créateur clique ⏹] → isClosed = true → lecture seule
```

Un sondage fermé affiche les résultats mais bloque tout nouveau vote.
