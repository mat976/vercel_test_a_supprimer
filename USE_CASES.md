# Cas d'utilisation — Système de sondages

## Diagramme PlantUML

```plantuml
@startuml
left to right direction
actor "Visiteur" as V
actor "Utilisateur connecté" as U
actor "Créateur du sondage" as C

rectangle "DiscussLike — Sondages" {
  usecase "Voir un sondage public" as UC1
  usecase "Voter sur un sondage public" as UC2
  usecase "S'inscrire / Se connecter" as UC3
  usecase "Voter sur un sondage privé" as UC4
  usecase "Créer un sondage" as UC5
  usecase "Ajouter un GIF par option" as UC6
  usecase "Définir une durée limite" as UC7
  usecase "Choisir public ou privé" as UC8
  usecase "Générer un slug personnalisé" as UC9
  usecase "Partager le lien /poll/[id]" as UC10
  usecase "Arrêter le sondage" as UC11
  usecase "Supprimer le sondage" as UC12
  usecase "Voir les résultats" as UC13
}

V --> UC1
V --> UC2
V --> UC3

U --> UC4
U --> UC5
U --> UC10
U --> UC13
U --|> V

C --> UC6
C --> UC7
C --> UC8
C --> UC9
C --> UC11
C --> UC12
C --|> U

UC5 ..> UC6 : <<include>>
UC5 ..> UC7 : <<include>>
UC5 ..> UC8 : <<include>>
UC5 ..> UC9 : <<extend>>
UC11 ..> UC13 : <<include>>
@enduml
```

## Description des cas

| Cas | Acteur | Description |
|---|---|---|
| Voir un sondage public | Visiteur | Accès à `/poll/[id]` sans compte |
| Voter sur un sondage public | Visiteur | Vote identifié par IP |
| S'inscrire / Se connecter | Visiteur | Accès aux fonctions privées |
| Voter sur un sondage privé | Utilisateur | Requiert session active |
| Créer un sondage | Utilisateur | Via le bouton 📊 dans le chat |
| Ajouter un GIF par option | Créateur | GifPicker inline dans le modal |
| Définir une durée limite | Créateur | 15min → 7 jours → sans limite |
| Choisir public ou privé | Créateur | Toggle dans le modal de création |
| Générer un slug | Créateur | Ex: `/poll/meilleure-pizza` |
| Partager le lien | Utilisateur | Copie l'URL depuis la bannière ou après création |
| Arrêter le sondage | Créateur | Bouton ⏹ dans la bannière |
| Supprimer le sondage | Créateur | Bouton 🗑️ dans la bannière |
| Voir les résultats | Utilisateur | Barres de progression + % en temps réel |
