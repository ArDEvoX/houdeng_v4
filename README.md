# Phoenix Logistique - Houdeng

Application web de planification et gestion des ressources logistiques pour le site de Houdeng.

🔗 **Repository GitHub**: [https://github.com/ArDEvoX/houdeng_v4](https://github.com/ArDEvoX/houdeng_v4)

## 📋 Description

Phoenix est une application de planification logistique complète permettant de gérer:
- Les prévisions de volumes
- Les compétences des employés
- Les disponibilités du personnel
- L'affectation automatique des ressources
- La planification des sous-activités
- La génération de plannings optimisés

## 🚀 Technologies utilisées

- **React 18** - Framework JavaScript
- **Vite** - Outil de build rapide
- **Firebase** - Base de données et authentification
- **Recharts** - Visualisation de données
- **Tailwind CSS** - Framework CSS
- **SASS** - Préprocesseur CSS

## 📦 Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn

### Étapes d'installation

1. Cloner le repository
```bash
git clone https://github.com/ArDEvoX/houdeng_v4.git
cd houdeng_v4
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer Firebase
- Créer un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com)
- Copier la configuration Firebase dans `src/App.jsx`

4. Lancer l'application en mode développement
```bash
npm run dev
```

5. Accéder à l'application
```
http://localhost:5173
```

## 🏗️ Structure du projet

```
houdeng_v4/
├── src/
│   ├── components/
│   │   ├── tabs/
│   │   │   ├── ParametresTab.jsx       # Configuration des paramètres
│   │   │   ├── PrevisionsTab.jsx       # Gestion des prévisions
│   │   │   ├── CompetencesTab.jsx      # Matrice de compétences
│   │   │   ├── DisponibilitesTab.jsx   # Disponibilités employés
│   │   │   ├── AffectationAutoTab.jsx  # Affectation automatique
│   │   │   ├── SousActivitesTab.jsx    # Gestion sous-activités
│   │   │   ├── PlanningFinalTab.jsx    # Planning final
│   │   │   └── RevueTab.jsx            # Revue et calendrier
│   │   └── Notification.jsx            # Système de notifications
│   ├── App.jsx                         # Composant principal
│   ├── main.jsx                        # Point d'entrée
│   ├── main.scss                       # Styles SCSS
│   └── print.css                       # Styles d'impression
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔧 Fonctionnalités principales

### Étape 0 : Paramétrages (Administrateur uniquement)
- Configuration des taux de productivité par activité
- Paramètres de conversion et pourcentages
- Gestion des créneaux horaires personnalisés
- Configuration des activités et sous-activités

### Étape 1 : Prévisions
- Import des prévisions de volumes (format tabulaire)
- Visualisation graphique des prévisions
- Données sauvegardées dans Firebase

### Étape 2 : Compétences
- Matrice de compétences employés/activités
- 4 niveaux de compétence (0-3)
- Ajout/suppression d'employés
- Statistiques visuelles des compétences

### Étape 3 : Disponibilités
- Import en masse des disponibilités (format Excel)
- Types de disponibilités:
  - M TÔT (Matin)
  - M TARD (Après-midi)
  - 1/2 M TÔT (Mi-temps matin)
  - 1/2 M TARD (Mi-temps après-midi)
- Gestion manuelle par employé et par date

### Étape 4 : Affectation automatique
- Génération automatique du dimensionnement
- Algorithme d'affectation optimisé:
  - EO exclusif toute la journée
  - X fixe pour activités à créneaux limités
  - Round-robin pour activités flexibles
- Gestion des alertes de compétences
- Sauvegarde des planifications

### Étape 5 : Sous-activités
- Attribution automatique des sous-activités
- Gestion de l'héritage des compétences
- Configuration des créneaux autorisés par sous-activité

### Étape 6 : Planning final
- Vue d'ensemble du planning
- Export et impression
- Répartition par créneaux horaires

### Étape 7 : Revue
- Vue calendrier mensuelle
- Indicateurs de productivité
- Suivi des affectations
- Modification rapide des planifications existantes

## 🔐 Authentification

Deux niveaux d'accès:
- **Administrateur** (admin/phoenix2025): Accès complet incluant paramétrages
- **Utilisateur** (user/phoenix): Accès aux fonctionnalités de planification

Mode standard disponible sans connexion (lecture seule).

## 💾 Base de données Firebase

### Collections utilisées:
- `parametres` - Configuration globale
- `previsions` - Prévisions de volumes
- `programmes` - Programmes de dimensionnement
- `employes` - Liste des employés
- `competences` - Matrice de compétences
- `disponibilites` - Disponibilités des employés
- `planifications` - Planifications générées

## 📊 Activités gérées

**Activités principales:**
- PICKING FRIGO
- CONTRÔLE
- EO (Emballage Ordre)
- REMPL. AUT. (Remplissage Automates)
- PICKING TRAD (Picking Traditionnel)
- RANGEMENT

**Sous-activités configurables:**
- REMPL. AUT. 1A, 1B, 2A, 2B
- PICKING 11, 12, 13, 14, 15, 16, MEZZ

## 🎨 Système de couleurs

Chaque activité dispose d'une couleur de base avec dégradés pour les sous-activités:
- PICKING FRIGO: Vert clair
- CONTRÔLE: Jaune clair
- EO: Bleu clair
- REMPL. AUT.: Violet clair
- PICKING TRAD: Orange clair
- RANGEMENT: Gris clair

## 🔨 Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

## 🤝 Contribution

Les contributions sont les bienvenues! Pour contribuer:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est propriétaire et réservé à l'usage interne.

## 👥 Auteurs

- ArDEvoX - *Développement initial*

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.

---

**Version:** 4.0  
**Dernière mise à jour:** Octobre 2025
