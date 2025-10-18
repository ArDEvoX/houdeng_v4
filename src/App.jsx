import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// Import de Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from "firebase/firestore";

// Import des styles d'impression
import './print.css';

// Import des composants d'onglets
import ParametresTab from './components/tabs/ParametresTab';
import PrevisionsTab from './components/tabs/PrevisionsTab';
import CompetencesTab from './components/tabs/CompetencesTab';
import DisponibilitesTab from './components/tabs/DisponibilitesTab';
import AffectationAutoTab from './components/tabs/AffectationAutoTab';
import SousActivitesTab from './components/tabs/SousActivitesTab';
import PlanningFinalTab from './components/tabs/PlanningFinalTab';
import RevueTab from './components/tabs/RevueTab';
import Notification from './components/Notification';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDy3QKEV7YyCbNN-W4IrNxNJ_8VMVTt-A8",
  authDomain: "dimensionement-houdeng.firebaseapp.com",
  projectId: "dimensionement-houdeng",
  storageBucket: "dimensionement-houdeng.firebasestorage.app",
  messagingSenderId: "1005962478553",
  appId: "1:1005962478553:web:48408e7627aa8660dc0fc8",
  measurementId: "G-JXCYW8S28G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const LogistiqueApp = () => {
  // État d'authentification
  const [estConnecte, setEstConnecte] = useState(false);
  const [estAdmin, setEstAdmin] = useState(false);
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreurConnexion, setErreurConnexion] = useState("");
  
  // État pour la navigation
  const [activeTab, setActiveTab] = useState("competences");
  
  // Utilisateurs autorisés (simpliste, en production utiliser un système d'authentification sécurisé)
  const utilisateurs = [
    { id: 'admin', mdp: 'phoenix2025', admin: true },
    { id: 'user', mdp: 'phoenix', admin: false },
  ];
  
  // Fonction de connexion
  const seConnecter = () => {
    const utilisateur = utilisateurs.find(u => u.id === identifiant && u.mdp === motDePasse);
    
    if (utilisateur) {
      setEstConnecte(true);
      setEstAdmin(utilisateur.admin);
      setErreurConnexion("");
    } else {
      setErreurConnexion("Identifiant ou mot de passe incorrect");
    }
  };
  
  // Fonction de déconnexion
  const seDeconnecter = () => {
    setEstConnecte(false);
    setEstAdmin(false);
    setIdentifiant("");
    setMotDePasse("");
  };

  // Valeurs par défaut pour les paramètres
  const defaultProductivite = {
    frigo: 120,
    controle: 30,
    pickingTrad: 147,
    eo: 25,
    remplissageAuto: 1800,
    rangement: 22
  };

  const defaultParametres = {
    tauxEjection: 11,
    conversionLignesBacs: 8.7,
    conversionUnitesLignes: 1.8,
    pourcentageAutomates: 75.2,
    pourcentageFrigo: 3,
    pourcentageEO: 1.2,
    lignesRangement: 1000,
    pourcentagePickingTrad: 27.3,
    facteurHeuresPersonne: 6.35,
    productiviteCible: 100,
    sousActivites: {
      'PICKING FRIGO': [],
      'CONTRÔLE': [],
      'EO': [],
      'REMPL. AUT.': ['REMPL. AUT. 1A', 'REMPL. AUT. 1B', 'REMPL. AUT. 2A', 'REMPL. AUT. 2B'],
      'PICKING TRAD': ['PICKING 11', 'PICKING 12', 'PICKING 13', 'PICKING 14', 'PICKING 15', 'PICKING 16', 'MEZZ'],
      'RANGEMENT': []
    },
    heritageCompetences: {
      'REMPL. AUT. 1A': true,
      'REMPL. AUT. 1B': true,
      'REMPL. AUT. 2A': true,
      'REMPL. AUT. 2B': true,
      'PICKING 11': true,
      'PICKING 12': true,
      'PICKING 13': true,
      'PICKING 14': true,
      'PICKING 15': true,
      'PICKING 16': true,
      'MEZZ': true
    },
    creneauxPersonnalises: [
      { 
        id: 'creneau1', 
        label: '8h51 - 10h45',
        heureDebut: '08:51',
        heureFin: '10:45',
        duree: 1.9, 
        equipe: 'matin',
        activitesAutorisees: ['EO', 'REMPL. AUT.', 'RANGEMENT']
      },
      { 
        id: 'creneau2', 
        label: '11h00 - 13h30',
        heureDebut: '11:00',
        heureFin: '13:30',
        duree: 2.5, 
        equipe: 'both',
        activitesAutorisees: ['EO', 'REMPL. AUT.', 'PICKING FRIGO', 'PICKING TRAD', 'CONTRÔLE', 'RANGEMENT']
      },
      { 
        id: 'creneau3', 
        label: '14h30 - 15h30',
        heureDebut: '14:30',
        heureFin: '15:30',
        duree: 1.0, 
        equipe: 'both',
        activitesAutorisees: ['EO', 'REMPL. AUT.', 'RANGEMENT']
      },
      { 
        id: 'creneau4', 
        label: '15h30 - 16h15',
        heureDebut: '15:30',
        heureFin: '16:15',
        duree: 0.75, 
        equipe: 'both',
        activitesAutorisees: ['EO', 'REMPL. AUT.', 'PICKING FRIGO', 'PICKING TRAD', 'CONTRÔLE', 'RANGEMENT']
      },
      { 
        id: 'creneau5', 
        label: '16h15 - 17h00',
        heureDebut: '16:15',
        heureFin: '17:00',
        duree: 0.75, 
        equipe: 'both',
        activitesAutorisees: ['EO', 'REMPL. AUT.', 'RANGEMENT']
      },
      { 
        id: 'creneau6', 
        label: '17h30 - 19h45',
        heureDebut: '17:30',
        heureFin: '19:45',
        duree: 2.25, 
        equipe: 'apresMidi',
        activitesAutorisees: ['EO', 'REMPL. AUT.', 'PICKING FRIGO', 'PICKING TRAD', 'CONTRÔLE', 'RANGEMENT']
      }
    ]
  };

  // États pour les paramètres globaux
  const [productivite, setProductivite] = useState({...defaultProductivite});
  const [parametres, setParametres] = useState({...defaultParametres});

  // Liste des activités pour la planification (complète)
  const activites = [
    'PICKING FRIGO', 
    'CONTRÔLE', 
    'EO', 
    'REMPL. AUT.', 
    'REMPL. AUT. 1A',
    'REMPL. AUT. 1B',
    'REMPL. AUT. 2A',
    'REMPL. AUT. 2B',
    'PICKING TRAD', 
    'PICKING 11',
    'PICKING 12',
    'PICKING 13',
    'PICKING 14',
    'PICKING 15',
    'PICKING 16',
    'MEZZ',
    'RANGEMENT'
  ];

  // Liste des compétences (simplifiée pour la matrice)
  const competencesActivites = [
    'PICKING FRIGO', 
    'CONTRÔLE', 
    'EO', 
    'REMPL. AUT.', 
    'PICKING TRAD', 
    'RANGEMENT'
  ];

  // Mapping des sous-activités vers les activités principales
  const mappingActivites = {
    'PICKING 11': 'PICKING TRAD',
    'PICKING 12': 'PICKING TRAD',
    'PICKING 13': 'PICKING TRAD',
    'PICKING 14': 'PICKING TRAD',
    'PICKING 15': 'PICKING TRAD',
    'PICKING 16': 'PICKING TRAD',
    'MEZZ': 'PICKING TRAD',
    'REMPL. AUT. 1A': 'REMPL. AUT.',
    'REMPL. AUT. 1B': 'REMPL. AUT.',
    'REMPL. AUT. 2A': 'REMPL. AUT.',
    'REMPL. AUT. 2B': 'REMPL. AUT.'
  };

  // Fonction pour obtenir l'activité principale d'une sous-activité
  const getActivitePrincipale = (activite) => {
    return mappingActivites[activite] || activite;
  };

  // Fonction pour convertir hex en RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Fonction pour convertir RGB en hex
  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  };

  // Fonction pour générer un dégradé de couleurs
  const genererDegrade = (couleurBase, nombreNuances) => {
    const rgb = hexToRgb(couleurBase);
    if (!rgb) return [couleurBase];
    
    const nuances = [];
    for (let i = 0; i < nombreNuances; i++) {
      // Créer un dégradé du plus clair au plus foncé
      const facteur = 1.2 - (i * 0.4 / (nombreNuances - 1)); // De 1.2 (plus clair) à 0.8 (plus foncé)
      
      let r, g, b;
      if (facteur > 1) {
        // Éclaircir (vers le blanc)
        const eclaircissement = facteur - 1;
        r = rgb.r + (255 - rgb.r) * eclaircissement;
        g = rgb.g + (255 - rgb.g) * eclaircissement;
        b = rgb.b + (255 - rgb.b) * eclaircissement;
      } else {
        // Assombrir
        r = rgb.r * facteur;
        g = rgb.g * facteur;
        b = rgb.b * facteur;
      }
      
      nuances.push(rgbToHex(r, g, b));
    }
    return nuances;
  };

  // Couleurs de base pour les activités principales
  const couleursActivitesBase = {
    'PICKING FRIGO': '#C8E6C9', // Vert clair
    'CONTRÔLE': '#FFECB3', // Jaune clair
    'EO': '#B3E5FC', // Bleu clair
    'REMPL. AUT.': '#D1C4E9', // Violet clair
    'PICKING TRAD': '#FFCCBC', // Orange clair
    'RANGEMENT': '#F5F5F5' // Gris clair
  };

  // Fonction pour obtenir la couleur d'une activité ou sous-activité
  const obtenirCouleurActivite = (activite) => {
    // Si c'est une activité principale, retourner sa couleur de base
    if (couleursActivitesBase[activite]) {
      return couleursActivitesBase[activite];
    }

    // Sinon, c'est une sous-activité, trouver son activité principale
    const activitePrincipale = getActivitePrincipale(activite);
    const couleurBase = couleursActivitesBase[activitePrincipale];
    
    if (!couleurBase) {
      return '#CCCCCC'; // Couleur par défaut si non trouvée
    }

    // Obtenir toutes les sous-activités de cette activité principale
    const sousActivites = parametres.sousActivites[activitePrincipale] || [];
    
    if (sousActivites.length === 0) {
      return couleurBase;
    }

    // Générer le dégradé
    const degrade = genererDegrade(couleurBase, sousActivites.length);
    
    // Trouver l'index de cette sous-activité
    const index = sousActivites.indexOf(activite);
    
    if (index === -1) {
      return couleurBase;
    }

    return degrade[index];
  };

  // Créer l'objet couleursActivites dynamiquement pour la compatibilité
  const couleursActivites = React.useMemo(() => {
    const couleurs = { ...couleursActivitesBase };
    
    // Ajouter les couleurs de toutes les sous-activités
    Object.keys(parametres.sousActivites || {}).forEach(activitePrincipale => {
      const sousActivites = parametres.sousActivites[activitePrincipale] || [];
      sousActivites.forEach(sousActivite => {
        couleurs[sousActivite] = obtenirCouleurActivite(sousActivite);
      });
    });
    
    return couleurs;
  }, [parametres.sousActivites]);

  // Obtenir les créneaux horaires depuis les paramètres (personnalisables)
  const obtenirCreneauxHoraires = () => {
    return parametres.creneauxPersonnalises || defaultParametres.creneauxPersonnalises || [];
  };

  const [previsions, setPrevisions] = useState('');
  const [previsionsProcessed, setPrevisionsProcessed] = useState([]);

  // États pour les programmes
  const [programmes, setProgrammes] = useState([]);
  const [currentProgramme, setCurrentProgramme] = useState(null);
  const [volumeJournalier, setVolumeJournalier] = useState(0);
  const [nombrePostes, setNombrePostes] = useState(10);
  const [programmeASupprimer, setProgrammeASupprimer] = useState(null);
  const [programmeAEditer, setProgrammeAEditer] = useState(null);
  const [nouveauNomProgramme, setNouveauNomProgramme] = useState("");
  const [nouveauVolumeProgramme, setNouveauVolumeProgramme] = useState(0);

  // États pour le nouveau système de dimensionnement
  const [dimensionnementActuel, setDimensionnementActuel] = useState(null);
  const [volumeDimensionnement, setVolumeDimensionnement] = useState(0);
  const [dimensionnementModifie, setDimensionnementModifie] = useState({});
  const [programmeDimensionnement, setProgrammeDimensionnement] = useState(null);
  
  // États pour la séparation matin/après-midi
  const [dimensionnementMatinModifie, setDimensionnementMatinModifie] = useState({});
  const [dimensionnementApresMidiModifie, setDimensionnementApresMidiModifie] = useState({});
  
  // États pour la modification de programmes existants
  const [programmeAModifier, setProgrammeAModifier] = useState(null);
  const [modeModification, setModeModification] = useState(false);
  
  // États pour l'affectation automatique du personnel - Nouvelle version
  const [dateAffectation, setDateAffectation] = useState('');
  const [volumeAffectation, setVolumeAffectation] = useState(0);
  const [dimensionnementGenere, setDimensionnementGenere] = useState(null);
  const [affectationsPostes, setAffectationsPostes] = useState({});
  const [postesExtras, setPostesExtras] = useState([]);
  const [nouvelleAffectation, setNouvelleAffectation] = useState({ posteId: '', employeId: '' });
  
  // État pour les activités personnalisées
  const [activitesPersonnalisees, setActivitesPersonnalisees] = useState([]);
  const [nouvelleActivite, setNouvelleActivite] = useState('');
  
  // États pour les sous-activités (Étape 0)
  const [nouvelleSousActivite, setNouvelleSousActivite] = useState('');
  const [activiteParentSelectionnee, setActiviteParentSelectionnee] = useState('');
  
  // États pour l'ancien système (à conserver pour compatibilité)
  const [programmeAffectation, setProgrammeAffectation] = useState(null);
  const [affectationsAutomatiques, setAffectationsAutomatiques] = useState({});
  const [posteExtra, setPosteExtra] = useState({ intitule: '', equipe: 'matin' });
  
  // États pour l'échange d'employés
  const [employeEchange1, setEmployeEchange1] = useState('');
  const [employeEchange2, setEmployeEchange2] = useState('');
  
  // État pour les erreurs de validation de cohérence
  const [erreursValidation, setErreursValidation] = useState([]);

  // État pour les notifications
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  // Fonctions pour gérer les notifications
  const afficherNotification = (message, type = 'success') => {
    setNotification({
      visible: true,
      message,
      type
    });
  };

  const fermerNotification = () => {
    setNotification({
      ...notification,
      visible: false
    });
  };

  // États pour la matrice de compétences
  const [employes, setEmployes] = useState([
    { id: '1', nom: 'Employé 1' },
    { id: '2', nom: 'Employé 2' },
    { id: '3', nom: 'Employé 3' },
    { id: '4', nom: 'Employé 4' },
    { id: '5', nom: 'Employé 5' },
  ]);

  const [competences, setCompetences] = useState({});

  // État pour la journée sélectionnée
  const [jourSelectionne, setJourSelectionne] = useState(null);
  const [programmeSelectionne, setProgrammeSelectionne] = useState(null);
  const [affectations, setAffectations] = useState({});
  const [nouvelEmployeNom, setNouvelEmployeNom] = useState("");

  // État pour les disponibilités des employés
  const [disponibilites, setDisponibilites] = useState({});
  const [disponibilitesTexte, setDisponibilitesTexte] = useState('');
  const [datesDispo, setDatesDispo] = useState([]);
  
  // État pour la revue de planification
  const [planifications, setPlanifications] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour la vue détaillée et modification dans l'étape 4
  const [dateDetaillee, setDateDetaillee] = useState(null);
  const [planificationEnCoursDeModif, setPlanificationEnCoursDeModif] = useState(null);
  const [affectationsModifiees, setAffectationsModifiees] = useState({});
  
  const genererProchainsJours = () => {
    const aujourdhui = new Date();
    const prochainsjours = [];
    
    for (let i = 0; i < 30; i++) { // Changé de 14 à 30
      const date = new Date(aujourdhui);
      date.setDate(date.getDate() + i);
      
      const jour = date.getDate().toString().padStart(2, '0');
      const mois = (date.getMonth() + 1).toString().padStart(2, '0');
      const annee = date.getFullYear();
      
      prochainsjours.push(`${jour}/${mois}/${annee}`);
    }
    
    return prochainsjours;
  };
  
  // FONCTIONS UTILITAIRES POUR LA VUE CALENDRIER
  
  // Obtenir le nom du jour de la semaine
  const getJourSemaine = (dateStr) => {
    const [jour, mois, annee] = dateStr.split('/');
    const date = new Date(annee, mois - 1, jour);
    const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return jours[date.getDay()];
  };
  
  // Vérifier si c'est un weekend
  const isWeekend = (dateStr) => {
    const jourSemaine = getJourSemaine(dateStr);
    return jourSemaine === 'Sam' || jourSemaine === 'Dim';
  };
  
  // Grouper les dates par semaines
  const grouperParSemaines = (dates) => {
    const semaines = [];
    let semaineActuelle = [];
    let numeroSemaine = 1;
    
    dates.forEach((date, index) => {
      const jourSemaine = getJourSemaine(date);
      
      // Si c'est lundi et qu'on a déjà des jours, commencer une nouvelle semaine
      if (jourSemaine === 'Lun' && semaineActuelle.length > 0) {
        semaines.push({
          numero: numeroSemaine,
          debut: semaineActuelle[0],
          fin: semaineActuelle[semaineActuelle.length - 1],
          jours: [...semaineActuelle]
        });
        semaineActuelle = [];
        numeroSemaine++;
      }
      
      semaineActuelle.push(date);
      
      // Si c'est le dernier élément, ajouter la semaine
      if (index === dates.length - 1) {
        semaines.push({
          numero: numeroSemaine,
          debut: semaineActuelle[0],
          fin: semaineActuelle[semaineActuelle.length - 1],
          jours: [...semaineActuelle]
        });
      }
    });
    
    return semaines;
  };
  
  
  // Initialiser les dates de disponibilité
  useEffect(() => {
    setDatesDispo(genererProchainsJours());
  }, []);

  // Sauvegarder automatiquement la productivité quand elle change (avec debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        sauvegarderParametres();
      }
    }, 1000); // Attendre 1 seconde après le dernier changement
    
    return () => clearTimeout(timer);
  }, [productivite]);
  
  // Sauvegarder automatiquement les paramètres quand ils changent (avec debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        sauvegarderParametres();
      }
    }, 1000); // Attendre 1 seconde après le dernier changement
    
    return () => clearTimeout(timer);
  }, [parametres]);

  // Charger les données depuis Firebase au chargement
  useEffect(() => {
    const chargerDonnees = async () => {
      setIsLoading(true);
      try {
        // Charger les paramètres avec merge pour ne pas perdre les nouvelles propriétés
        const docParamsRef = doc(db, "parametres", "global");
        const docParamsSnap = await getDoc(docParamsRef);
        
        if (docParamsSnap.exists()) {
          const paramsFirebase = docParamsSnap.data().parametres || {};
          const productiviteFirebase = docParamsSnap.data().productivite || {};
          
          // Merger heritageCompetences en s'assurant que PICKING 16 hérite toujours
          const heritageCompetencesMerged = {
            ...defaultParametres.heritageCompetences,
            ...(paramsFirebase.heritageCompetences || {})
          };
          
          // Forcer PICKING 16 à avoir l'héritage activé (comme les autres sous-activités de PICKING TRAD)
          if (heritageCompetencesMerged['PICKING 16'] === false) {
            heritageCompetencesMerged['PICKING 16'] = true;
          }
          
          // Merger avec les valeurs par défaut pour ne jamais perdre les nouvelles propriétés
          const parametresMerged = {
            ...defaultParametres,
            ...paramsFirebase,
            heritageCompetences: heritageCompetencesMerged,
            // S'assurer que creneauxPersonnalises existe toujours
            creneauxPersonnalises: paramsFirebase.creneauxPersonnalises && paramsFirebase.creneauxPersonnalises.length > 0
              ? paramsFirebase.creneauxPersonnalises
              : defaultParametres.creneauxPersonnalises
          };
          
          setParametres(parametresMerged);
          
          // Sauvegarder immédiatement la correction dans Firebase
          if (heritageCompetencesMerged['PICKING 16'] === true && paramsFirebase.heritageCompetences?.['PICKING 16'] === false) {
            await setDoc(doc(db, "parametres", "global"), {
              parametres: parametresMerged,
              productivite: productiviteFirebase || defaultProductivite,
              lastUpdated: new Date()
            });
          }
          
          setProductivite({
            ...defaultProductivite,
            ...productiviteFirebase
          });
        } else {
          // Si aucune donnée n'existe dans Firebase, sauvegarder les valeurs par défaut
          await setDoc(doc(db, "parametres", "global"), {
            parametres: defaultParametres,
            productivite: defaultProductivite,
            lastUpdated: new Date()
          });
        }
        
        // Charger les prévisions
        const previsionsRef = collection(db, "previsions");
        const previsionsSnapshot = await getDocs(previsionsRef);
        const previsionsData = previsionsSnapshot.docs.map(doc => doc.data());
        setPrevisionsProcessed(previsionsData);
        
        // Charger les programmes
        const programmesRef = collection(db, "programmes");
        const programmesSnapshot = await getDocs(programmesRef);
        const programmesData = programmesSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
        setProgrammes(programmesData);
        
        // Charger les employés
        const employesRef = collection(db, "employes");
        const employesSnapshot = await getDocs(employesRef);
        const employesData = employesSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
        if (employesData.length > 0) {
          setEmployes(employesData);
        }
        
        // Charger les compétences
        const competencesRef = collection(db, "competences");
        const competencesSnapshot = await getDocs(competencesRef);
        
        const competencesObj = {};
        competencesSnapshot.docs.forEach(doc => {
          competencesObj[doc.id] = doc.data();
        });
        
        if (Object.keys(competencesObj).length > 0) {
          setCompetences(competencesObj);
        }
        
        // Charger les disponibilités
        const disponibilitesRef = collection(db, "disponibilites");
        const disponibilitesSnapshot = await getDocs(disponibilitesRef);
        
        const disponibilitesObj = {};
        disponibilitesSnapshot.docs.forEach(doc => {
          disponibilitesObj[doc.id] = doc.data();
        });
        
        if (Object.keys(disponibilitesObj).length > 0) {
          setDisponibilites(disponibilitesObj);
        }
        
        // Charger les planifications
        const planificationsRef = collection(db, "planifications");
        const planificationsSnapshot = await getDocs(planificationsRef);
        
        const planificationsObj = {};
        planificationsSnapshot.docs.forEach(doc => {
          // Convertir les clés de date de format "DD-MM-YYYY" vers "DD/MM/YYYY"
          const dateKey = doc.id.replace(/-/g, "/");
          planificationsObj[dateKey] = doc.data();
        });
        
        if (Object.keys(planificationsObj).length > 0) {
          setPlanifications(planificationsObj);
        }
        
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    chargerDonnees();
  }, []);
  
  // Sauvegarder les paramètres dans Firebase
  const sauvegarderParametres = async () => {
    try {
      await setDoc(doc(db, "parametres", "global"), {
        parametres,
        productivite,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
      alert("Erreur lors de la sauvegarde des paramètres. Vérifiez votre connexion internet.");
    }
  };
  
  // Sauvegarder les prévisions dans Firebase
  const sauvegarderPrevisions = async (donnees = previsionsProcessed) => {
    try {
      // Supprimer toutes les prévisions existantes
      const previsionsRef = collection(db, "previsions");
      const previsionsSnapshot = await getDocs(previsionsRef);
      const promises = previsionsSnapshot.docs.map(docSnap => 
        deleteDoc(doc(db, "previsions", docSnap.id))
      );
      await Promise.all(promises);
      
      // Ajouter les nouvelles prévisions
      const newPromises = donnees.map(prevision => 
        setDoc(doc(db, "previsions", prevision.date.replace(/\//g, "-")), prevision)
      );
      await Promise.all(newPromises);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des prévisions:", error);
    }
  };
  
  // Sauvegarder un programme dans Firebase
  const sauvegarderProgramme = async (programme) => {
    try {
      await setDoc(doc(db, "programmes", programme.id), programme);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du programme:", error);
    }
  };
  
  // Supprimer un programme de Firebase
  const supprimerProgrammeFirebase = async (programmeId) => {
    try {
      await deleteDoc(doc(db, "programmes", programmeId));
    } catch (error) {
      console.error("Erreur lors de la suppression du programme:", error);
    }
  };
  
  // Sauvegarder les compétences dans Firebase
  const sauvegarderCompetences = async () => {
    try {
      for (const employeId in competences) {
        await setDoc(doc(db, "competences", employeId), competences[employeId]);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des compétences:", error);
    }
  };
  
  // Sauvegarder un employé dans Firebase
  const sauvegarderEmploye = async (employe) => {
    try {
      await setDoc(doc(db, "employes", employe.id), employe);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'employé:", error);
    }
  };
  
  // Supprimer un employé de Firebase
  const supprimerEmployeFirebase = async (employeId) => {
    try {
      await deleteDoc(doc(db, "employes", employeId));
      await deleteDoc(doc(db, "competences", employeId));
      await deleteDoc(doc(db, "disponibilites", employeId));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'employé:", error);
    }
  };
  
  // Sauvegarder les disponibilités dans Firebase
  const sauvegarderDisponibilites = async () => {
    try {
      for (const employeId in disponibilites) {
        await setDoc(doc(db, "disponibilites", employeId), disponibilites[employeId]);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des disponibilités:", error);
    }
  };
  
  // Sauvegarder une planification dans Firebase
  const sauvegarderPlanification = async (date, planification) => {
    try {
      const dateKey = date.replace(/\//g, "-");
      await setDoc(doc(db, "planifications", dateKey), planification);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la planification:", error);
      alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
    }
  };
  
  // Fonction pour éditer un programme (nom et volume)
  const editerProgramme = () => {
    if (!programmeAEditer || !nouveauNomProgramme.trim() || !nouveauVolumeProgramme) return;
    
    // Recalculer les heures nécessaires avec le nouveau volume
    const nouvellesHeuresNecessaires = calculerHeuresNecessaires(nouveauVolumeProgramme);
    
    // Mettre à jour le programme dans la liste
    const programmesMisAJour = programmes.map(prog => {
      if (prog.id === programmeAEditer) {
        return { 
          ...prog, 
          nom: nouveauNomProgramme,
          volumeCible: nouveauVolumeProgramme,
          heuresNecessaires: nouvellesHeuresNecessaires
        };
      }
      return prog;
    });
    
    setProgrammes(programmesMisAJour);
    
    // Mettre à jour le programme actuel si c'est celui qui est édité
    if (currentProgramme && currentProgramme.id === programmeAEditer) {
      setCurrentProgramme({ 
        ...currentProgramme, 
        nom: nouveauNomProgramme,
        volumeCible: nouveauVolumeProgramme,
        heuresNecessaires: nouvellesHeuresNecessaires
      });
    }
    
    // Réinitialiser l'état d'édition
    setProgrammeAEditer(null);
    setNouveauNomProgramme("");
    setNouveauVolumeProgramme(0);
    
    // Sauvegarder dans Firebase
    const programmeAMettreAJour = programmesMisAJour.find(p => p.id === programmeAEditer);
    if (programmeAMettreAJour) {
      sauvegarderProgramme(programmeAMettreAJour);
    }
  };
  
  // Obtenir la date actuelle au format JJ/MM/AAAA
  const obtenirDateActuelle = () => {
    const aujourdhui = new Date();
    const jour = aujourdhui.getDate().toString().padStart(2, '0');
    const mois = (aujourdhui.getMonth() + 1).toString().padStart(2, '0');
    const annee = aujourdhui.getFullYear();
    
    return `${jour}/${mois}/${annee}`;
  };
  
 // Filtrer les prévisions pour ne montrer que les 30 prochains jours (modifié de 14 à 30)
const filtrerPrevisionsProchains30Jours = () => { // Renommé la fonction
  const dateActuelle = obtenirDateActuelle();
  const prochainsDates = genererProchainsJours();
  
  return previsionsProcessed
    .filter(prev => prochainsDates.includes(prev.date))
    .sort((a, b) => {
      // Convertir les dates au format DD/MM/YYYY en objets Date pour comparaison
      const [dayA, monthA, yearA] = a.date.split('/').map(Number);
      const [dayB, monthB, yearB] = b.date.split('/').map(Number);
      
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      
      return dateA - dateB;
    });
};

  // Initialisation des compétences
  useEffect(() => {
    const competencesInitiales = {};
    employes.forEach(employe => {
      competencesInitiales[employe.id] = {};
      activites.forEach(activite => {
        competencesInitiales[employe.id][activite] = 0; // Changé de false à 0
      });
    });
    setCompetences(competencesInitiales);
  }, []);

  // Traitement des prévisions
  const traiterPrevisions = async () => {
    const lignes = previsions.split('\n');
    const previsionsTraitees = lignes.map(ligne => {
      const indexEspace = ligne.indexOf('\t');
      if (indexEspace === -1) return { date: '', volume: NaN };
      
      const date = ligne.substring(0, indexEspace).trim();
      const volume = ligne.substring(indexEspace + 1).trim();
      
      return { date, volume: parseInt(volume) };
    }).filter(item => !isNaN(item.volume));
    
    setPrevisionsProcessed(previsionsTraitees);
    
    // Passer directement les données traitées
    await sauvegarderPrevisions(previsionsTraitees);
    
    // Afficher une notification de succès
    const previsionsValides = previsionsTraitees.filter(p => p.volume > 0).length;
    afficherNotification(
      `✓ ${previsionsTraitees.length} prévision${previsionsTraitees.length > 1 ? 's' : ''} importée${previsionsTraitees.length > 1 ? 's' : ''} avec succès (${previsionsValides} valide${previsionsValides > 1 ? 's' : ''})`,
      'success'
    );
  };
  

// Traitement des disponibilités des employés - Nouveau format simplifié
const traiterDisponibilites = () => {
  const lignes = disponibilitesTexte.split('\n').filter(ligne => ligne.trim() !== '');
  const nouvDisponibilites = {...disponibilites};
  
  if (lignes.length < 2) {
    alert('Erreur: Le tableau doit contenir au moins une ligne d\'en-tête et une ligne de données');
    return;
  }
  
  // La première ligne contient les en-têtes : Nom [TAB] Date1 [TAB] Date2 [TAB] ...
  const ligneEnTete = lignes[0];
  const colonnes = ligneEnTete.split('\t').map(col => col.trim());
  
  // Extraire les dates (toutes les colonnes sauf la première qui est "Nom")
  const datesColonnes = colonnes.slice(1);
  
  // Valider et filtrer les dates
  const datesValides = [];
  const dateActuelle = obtenirDateActuelle();
  
  datesColonnes.forEach(dateStr => {
    // Vérifier si c'est une date au format DD/MM/YYYY
    const matchDate = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (matchDate) {
      const [, jour, mois, annee] = matchDate;
      const dateObj = new Date(parseInt(annee), parseInt(mois) - 1, parseInt(jour));
      const dateActuelleObj = new Date();
      dateActuelleObj.setHours(0, 0, 0, 0);
      
      // Ne garder que les dates futures ou aujourd'hui
      if (dateObj >= dateActuelleObj) {
        datesValides.push(dateStr);
      }
    }
  });
  
  if (datesValides.length === 0) {
    alert('Erreur: Aucune date valide trouvée dans l\'en-tête. Vérifiez le format DD/MM/YYYY');
    return;
  }
  
  // Mettre à jour les dates disponibles
  setDatesDispo(prev => {
    const nouvellesDates = [...datesValides, ...prev.filter(d => !datesValides.includes(d))];
    return nouvellesDates;
  });
  
  let employesTraites = 0;
  let employesCrees = 0;
  
  // Traiter chaque ligne d'employé (à partir de la ligne 1)
  for (let i = 1; i < lignes.length; i++) {
    const ligne = lignes[i].trim();
    if (ligne === '') continue;
    
    const elements = ligne.split('\t').map(el => el.trim());
    
    if (elements.length < 2) {

      continue;
    }
    
    const employeNom = elements[0].trim();
    
    // Vérifier que c'est un nom d'employé valide
    if (!employeNom || employeNom.length < 2) {

      continue;
    }
    

    employesTraites++;
    
    // Vérifier si l'employé existe déjà, sinon l'ajouter
    let employe = employes.find(e => e.nom === employeNom);
    
    if (!employe) {
      // Créer un nouvel employé
      employe = { id: Date.now() + i + '', nom: employeNom };

      employesCrees++;
      
      setEmployes(prev => [...prev, employe]);
      
      // Initialiser ses compétences
      setCompetences(prev => {
        const newComp = {...prev};
        newComp[employe.id] = {};
        activites.forEach(activite => {
          newComp[employe.id][activite] = 0;
        });
        return newComp;
      });
      
      // Sauvegarder le nouvel employé dans Firebase
      sauvegarderEmploye(employe);
    }
    
    // Initialiser les disponibilités pour cet employé
    if (!nouvDisponibilites[employe.id]) {
      nouvDisponibilites[employe.id] = {};
    }
    
    // Traiter chaque date/disponibilité
    let disponibilitesEmploye = [];
    
    for (let j = 0; j < datesValides.length && j + 1 < elements.length; j++) {
      const date = datesValides[j];
      const code = elements[j + 1] ? elements[j + 1].trim().toUpperCase() : '';
      
      // Mapper les codes vers les types de disponibilité
      let disponibilite = 'non'; // Par défaut
      
      if (code === 'M TÔT' || code === 'M TOT') {
        disponibilite = 'matin';
      } else if (code === 'M TARD') {
        disponibilite = 'apresMidi';
      } else if (code === '1/2 M TÔT' || code === '1/2 M TOT') {
        disponibilite = 'miTempsMatin';
      } else if (code === '1/2 M TARD') {
        disponibilite = 'miTempsApresMidi';
      }
      // Tout le reste (V, 0, 1/2R, ANC, RECEP, TLV, etc.) = 'non'
      
      nouvDisponibilites[employe.id][date] = disponibilite;
      disponibilitesEmploye.push(`${date}: ${disponibilite}`);
    }
    

  }
  

  
  setDisponibilites(nouvDisponibilites);
  // Sauvegarder dans Firebase
  sauvegarderDisponibilites();
  
  // Afficher une notification de succès
  afficherNotification(
    `✓ Importation terminée: ${employesTraites} employé${employesTraites > 1 ? 's' : ''} traité${employesTraites > 1 ? 's' : ''}, ${employesCrees} créé${employesCrees > 1 ? 's' : ''}, ${datesValides.length} date${datesValides.length > 1 ? 's' : ''}`,
    'success'
  );
};

  // Changement des paramètres de productivité
  const handleProductiviteChange = (activite, valeur) => {
    setProductivite(prev => ({
      ...prev,
      [activite]: parseFloat(valeur)
    }));
    
    // Mettre à jour les heures nécessaires dans tous les programmes
    setTimeout(() => mettreAJourHeuresNecessairesProgrammes(), 100);
  };

  // Changement des paramètres généraux
  const handleParametresChange = (param, valeur) => {
    setParametres(prev => ({
      ...prev,
      [param]: parseFloat(valeur)
    }));
    
    // Mettre à jour les heures nécessaires dans tous les programmes
    setTimeout(() => mettreAJourHeuresNecessairesProgrammes(), 100);
  };

  // FONCTIONS POUR GÉRER LES CRÉNEAUX PERSONNALISÉS
  
  // Calculer la durée en heures entre deux horaires (format HH:MM)
  const calculerDureeEnHeures = (heureDebut, heureFin) => {
    const [heureD, minuteD] = heureDebut.split(':').map(Number);
    const [heureF, minuteF] = heureFin.split(':').map(Number);
    
    const minutesDebut = heureD * 60 + minuteD;
    const minutesFin = heureF * 60 + minuteF;
    
    const dureeMinutes = minutesFin - minutesDebut;
    return Math.round((dureeMinutes / 60) * 100) / 100; // Arrondir à 2 décimales
  };

  // Formater un horaire pour l'affichage (HH:MM -> Hh:MM)
  const formaterHoraire = (heure) => {
    const [h, m] = heure.split(':');
    return `${h}h${m}`;
  };

  // Modifier un créneau
  const modifierCreneau = (creneauId, champ, valeur) => {
    setParametres(prev => {
      const nouveauxCreneaux = prev.creneauxPersonnalises.map(creneau => {
        if (creneau.id === creneauId) {
          const creneauModifie = { ...creneau, [champ]: valeur };
          
          // Si on modifie heureDebut ou heureFin, recalculer la durée et le label
          if (champ === 'heureDebut' || champ === 'heureFin') {
            const debut = champ === 'heureDebut' ? valeur : creneau.heureDebut;
            const fin = champ === 'heureFin' ? valeur : creneau.heureFin;
            creneauModifie.duree = calculerDureeEnHeures(debut, fin);
            creneauModifie.label = `${formaterHoraire(debut)} - ${formaterHoraire(fin)}`;
          }
          
          return creneauModifie;
        }
        return creneau;
      });
      
      const updated = { ...prev, creneauxPersonnalises: nouveauxCreneaux };
      setTimeout(() => sauvegarderParametres(), 500);
      return updated;
    });
  };

  // Ajouter un nouveau créneau
  const ajouterCreneau = () => {
    const nouveauId = `creneau${parametres.creneauxPersonnalises.length + 1}`;
    const nouveauCreneau = {
      id: nouveauId,
      label: '12h00 - 13h00',
      heureDebut: '12:00',
      heureFin: '13:00',
      duree: 1.0,
      equipe: 'both',
      activitesAutorisees: ['EO', 'REMPL. AUT.', 'RANGEMENT']
    };
    
    setParametres(prev => {
      const updated = {
        ...prev,
        creneauxPersonnalises: [...prev.creneauxPersonnalises, nouveauCreneau]
      };
      setTimeout(() => sauvegarderParametres(), 500);
      return updated;
    });
  };

  // Supprimer un créneau
  const supprimerCreneau = (creneauId) => {
    if (parametres.creneauxPersonnalises.length <= 1) {
      alert('Vous devez avoir au moins un créneau horaire');
      return;
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce créneau ? Cette action est irréversible.')) {
      setParametres(prev => {
        const updated = {
          ...prev,
          creneauxPersonnalises: prev.creneauxPersonnalises.filter(c => c.id !== creneauId)
        };
        setTimeout(() => sauvegarderParametres(), 500);
        return updated;
      });
    }
  };

  // Basculer l'autorisation d'une activité pour un créneau
  const toggleActiviteCreneau = (creneauId, activite) => {
    setParametres(prev => {
      const nouveauxCreneaux = prev.creneauxPersonnalises.map(creneau => {
        if (creneau.id === creneauId) {
          const activitesAutorisees = [...creneau.activitesAutorisees];
          const index = activitesAutorisees.indexOf(activite);
          
          if (index > -1) {
            // L'activité est déjà autorisée, la retirer
            activitesAutorisees.splice(index, 1);
          } else {
            // L'activité n'est pas autorisée, l'ajouter
            activitesAutorisees.push(activite);
          }
          
          // Vérifier qu'il reste au moins une activité
          if (activitesAutorisees.length === 0) {
            alert('Un créneau doit avoir au moins une activité autorisée');
            return creneau;
          }
          
          return { ...creneau, activitesAutorisees };
        }
        return creneau;
      });
      
      const updated = { ...prev, creneauxPersonnalises: nouveauxCreneaux };
      setTimeout(() => sauvegarderParametres(), 500);
      return updated;
    });
  };

  // Calcul du nombre d'heures nécessaires par activité
  const calculerHeuresNecessaires = (volume) => {
    const heuresEO = (volume * parametres.pourcentageEO / 100) / productivite.eo;
    const heuresAutomates = (volume * parametres.pourcentageAutomates / 100 * parametres.conversionUnitesLignes) / productivite.remplissageAuto;
    const heuresFrigo = (volume * parametres.pourcentageFrigo / 100) / productivite.frigo;
    const heuresPickingTrad = (volume * parametres.pourcentagePickingTrad / 100) / productivite.pickingTrad;
    const heuresRangement = parametres.lignesRangement / productivite.rangement;
    const heuresControle = (volume / parametres.conversionLignesBacs * (parametres.tauxEjection / 100)) / productivite.controle;
    
    return {
      'EO': heuresEO,
      'REMPL. AUT.': heuresAutomates,
      'PICKING FRIGO': heuresFrigo,
      'PICKING TRAD': heuresPickingTrad,
      'RANGEMENT': heuresRangement,
      'CONTRÔLE': heuresControle
    };
  };

  // Fonction pour mettre à jour les heures nécessaires dans tous les programmes
  const mettreAJourHeuresNecessairesProgrammes = () => {
    const programmesMisAJour = programmes.map(programme => {
      const nouvellesHeuresNecessaires = calculerHeuresNecessaires(programme.volumeCible);
      
      return {
        ...programme,
        heuresNecessaires: nouvellesHeuresNecessaires
      };
    });
    
    setProgrammes(programmesMisAJour);
    
    // Mettre à jour le programme actuel si il existe
    if (currentProgramme) {
      const programmeActuelMisAJour = programmesMisAJour.find(p => p.id === currentProgramme.id);
      if (programmeActuelMisAJour) {
        setCurrentProgramme(programmeActuelMisAJour);
      }
    }
    
    // Sauvegarder tous les programmes mis à jour dans Firebase
    programmesMisAJour.forEach(programme => {
      sauvegarderProgramme(programme);
    });
  };

  // Supprimer un employé
  const supprimerEmploye = (employeId) => {
    // Supprimer l'employé de la liste
    setEmployes(employes.filter(emp => emp.id !== employeId));
    
    // Supprimer ses compétences
    setCompetences(prev => {
      const newComp = {...prev};
      delete newComp[employeId];
      return newComp;
    });
    
    // Supprimer ses disponibilités
    setDisponibilites(prev => {
      const newDisp = {...prev};
      delete newDisp[employeId];
      return newDisp;
    });
    
    // Supprimer ses affectations dans toutes les planifications
    setPlanifications(prev => {
      const newPlan = {...prev};
      
      Object.keys(newPlan).forEach(date => {
        Object.keys(newPlan[date].affectations).forEach(posteId => {
          if (newPlan[date].affectations[posteId] === employeId) {
            delete newPlan[date].affectations[posteId];
          }
        });
        
        // Mettre à jour Firebase
        sauvegarderPlanification(date, newPlan[date]);
      });
      
      return newPlan;
    });
    
    // Supprimer de Firebase
    supprimerEmployeFirebase(employeId);
  };
  
  // Ajout d'un nouvel employé
  const ajouterEmploye = () => {
    if (nouvelEmployeNom.trim() === "") return;
    
    const newEmploye = {
      id: Date.now().toString(),
      nom: nouvelEmployeNom
    };
    
    setEmployes([...employes, newEmploye]);
    setNouvelEmployeNom("");
    
    // Initialiser les compétences pour ce nouvel employé
    setCompetences(prev => {
      const newComp = {...prev};
      newComp[newEmploye.id] = {};
      activites.forEach(activite => {
        newComp[newEmploye.id][activite] = 0;
      });
      return newComp;
    });
    
    // Sauvegarder dans Firebase
    sauvegarderEmploye(newEmploye);
    setTimeout(() => sauvegarderCompetences(), 500);
  };

  // Mettre à jour la disponibilité d'un employé
  const updateDisponibilite = (employeId, date, disponibilite) => {
    setDisponibilites(prev => {
      const newDisp = {...prev};
      
      if (!newDisp[employeId]) {
        newDisp[employeId] = {};
      }
      
      newDisp[employeId][date] = disponibilite;
      
      // Sauvegarder dans Firebase
      setTimeout(() => sauvegarderDisponibilites(), 500);
      
      return newDisp;
    });
  };

  // Mettre à jour une compétence
  const updateCompetence = (employeId, activite, valeur) => {
    setCompetences(prev => {
      const newComp = {
        ...prev,
        [employeId]: {
          ...prev[employeId],
          [activite]: valeur
        }
      };
      
      // Sauvegarder dans Firebase
      setTimeout(() => sauvegarderCompetences(), 500);
      
      return newComp;
    });
  };

  // Mémoriser les prévisions filtrées pour éviter les recalculs
  const previsionsProchains30Jours = useMemo(() => {
    const dateActuelle = obtenirDateActuelle();
    const prochainsDates = genererProchainsJours();
    
    return previsionsProcessed
      .filter(prev => prochainsDates.includes(prev.date))
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        
        return dateA - dateB;
      });
  }, [previsionsProcessed]);

  // Préparer les données pour le graphique des prévisions (mémorisé)
  const donneesGraphiquePrevisions = useMemo(() => {
    return previsionsProchains30Jours.map(prev => ({
      date: prev.date,
      volume: prev.volume
    }));
  }, [previsionsProchains30Jours]);

  // Préparer les données pour le graphique des compétences (mémorisé)
  const donneesGraphiqueCompetences = useMemo(() => {
    const activitesAAfficher = [];
    
    // Ajouter les activités principales
    competencesActivites.forEach(activite => {
      activitesAAfficher.push(activite);
    });
    
    // Ajouter les sous-activités sans héritage (compétences spécifiques requises)
    competencesActivites.forEach(activite => {
      const sousActivites = parametres.sousActivites[activite] || [];
      sousActivites.forEach(sousAct => {
        if (parametres.heritageCompetences[sousAct] === false) {
          activitesAAfficher.push(sousAct);
        }
      });
    });
    
    return activitesAAfficher.map(activite => {
      const nombreEmployes = employes.filter(emp => 
        competences[emp.id] && competences[emp.id][activite] > 0
      ).length;
      
      return {
        activite,
        nombreEmployes,
        pourcentage: (nombreEmployes / Math.max(1, employes.length)) * 100
      };
    });
  }, [employes, competences, parametres.sousActivites, parametres.heritageCompetences]);
  
  // Calculer le pourcentage de postes affectés avec détails
  const calculerPourcentageAffectation = (date) => {
    const planning = planifications[date];
    
    // Si pas de planification, retourner 0
    if (!planning || !planning.dimensionnement) {
      return { pourcentage: 0, postesAffectes: 0, totalPostes: 0 };
    }
    
    // Utiliser les postes générés de la planification sauvegardée
    const postesGeneres = planning.dimensionnement.postesGeneres || [];
    const affectations = planning.affectations || {};
    
    const totalPostes = postesGeneres.length;
    
    if (totalPostes === 0) {
      return { pourcentage: 0, postesAffectes: 0, totalPostes: 0 };
    }
    
    // Compter les postes avec employés affectés
    const postesAffectes = Object.values(affectations).filter(employeId => employeId).length;
    
    const pourcentage = (postesAffectes / totalPostes) * 100;
    
    return { pourcentage, postesAffectes, totalPostes };
  };
  
  // NOUVELLE FONCTION : Calculer la productivité (lignes/heure) pour une date
  const calculerProductivite = (date) => {
    const planning = planifications[date];
    
    // Si pas de planification sauvegardée, retourner 0
    if (!planning || !planning.volume) return 0;
    
    // Utiliser le volume de la planification sauvegardée
    const volume = planning.volume;
    
    // Calculer les heures à partir des postes réellement affectés
    const affectations = planning.affectations || {};
    const postesGeneres = planning.dimensionnement?.postesGeneres || [];
    
    let totalHeures = 0;
    
    // Parcourir les affectations pour calculer le total d'heures
    Object.entries(affectations).forEach(([posteId, employeId]) => {
      if (employeId) {
        const poste = postesGeneres.find(p => p.id === posteId);
        if (poste) {
          totalHeures += poste.heuresDimensionnees;
        }
      }
    });
    
    if (totalHeures === 0) return 0;
    
    // Productivité = Volume / Heures affectées
    return volume / totalHeures;
  };

  // NOUVELLE FONCTION : Calculer le nombre d'employés équivalents avec pondération
  const calculerNombreEmployesEquivalents = (date) => {
    let nombreEquivalent = 0;
    
    employes.forEach(employe => {
      const dispo = disponibilites[employe.id]?.[date];
      
      if (dispo === 'miTempsMatin' || dispo === 'miTempsApresMidi') {
        // 1/2 M TÔT ou 1/2 M TARD = 0.5
        nombreEquivalent += 0.5;
      } else if (dispo === 'matin' || dispo === 'apresMidi') {
        // M TÔT ou M TARD = 1
        nombreEquivalent += 1;
      }
      // 'non' ou undefined = 0 (pas ajouté)
    });
    
    return nombreEquivalent;
  };

  // NOUVELLE FONCTION : Calculer la productivité prévisionnelle (lignes/heure)
  const calculerProductivitePrevisionnelle = (date) => {
    const prevision = previsionsProcessed.find(p => p.date === date);
    
    // Si pas de prévision, retourner 0
    if (!prevision || !prevision.volume) return 0;
    
    const volume = prevision.volume;
    const nombreEmployes = calculerNombreEmployesEquivalents(date);
    
    // Si aucun employé disponible, retourner 0
    if (nombreEmployes === 0) return 0;
    
    // Productivité = Volume / (Nombre employés × Heures par personne)
    const heuresTravaillees = nombreEmployes * parametres.facteurHeuresPersonne;
    
    return volume / heuresTravaillees;
  };

  // Calculer le pourcentage d'occupation avec le facteur paramétrable
  const calculerPourcentageOccupation = (date) => {
    if (!planifications[date] || !planifications[date].programmeId) return 0;
    
    const programmeId = planifications[date].programmeId;
    const programme = programmes.find(p => p.id === programmeId);
    
    if (!programme) return 0;
    
    // Heures cibles totales
    const heuresCibles = Object.values(programme.heuresNecessaires).reduce((total, heures) => total + heures, 0);
    
    // Nombre de personnes planifiées
    const affectations = planifications[date]?.affectations || {};
    const nombrePersonnes = Object.keys(affectations).filter(posteId => affectations[posteId]).length;
    
    // Calcul du pourcentage d'occupation avec le facteur paramétrable
    const heuresPersonnes = nombrePersonnes * parametres.facteurHeuresPersonne;
    
    if (heuresCibles === 0) return 0;
    
    return (heuresPersonnes / heuresCibles) * 100;
  };

  // ===== NOUVELLES FONCTIONS POUR L'AFFECTATION AUTOMATIQUE =====

  // ===== NOUVELLE LOGIQUE D'AFFECTATION OPTIMALE =====
  
  // Fonction pour calculer le poids d'un employé basé sur ses compétences
  const calculerPoidsEmploye = (employeId, activitesNecessaires) => {
    let score = 0;
    Object.keys(activitesNecessaires).forEach(activite => {
      const niveau = competences[employeId]?.[activite] || 0;
      // Niveau 3 = 3 points, Niveau 2 = 2 points, Niveau 1 = 1 point
      score += niveau;
    });
    return score;
  };

  // Fonction pour répartir les heures selon les poids des employés
  const repartirHeuresSelonPoids = (heuresNecessaires, employesDisponibles, date) => {
    // Calculer le poids total
    let poidsTotal = 0;
    const poids = {};
    
    employesDisponibles.forEach(employe => {
      const poidsEmploye = calculerPoidsEmploye(employe.id, heuresNecessaires);
      poids[employe.id] = poidsEmploye;
      poidsTotal += poidsEmploye;
    });
    
    // Si aucun employé n'a de compétences, répartir équitablement
    if (poidsTotal === 0) {
      poidsTotal = employesDisponibles.length;
      employesDisponibles.forEach(employe => {
        poids[employe.id] = 1;
      });
    }
    
    // Répartir les heures proportionnellement
    const repartition = {};
    employesDisponibles.forEach(employe => {
      repartition[employe.id] = {};
      Object.entries(heuresNecessaires).forEach(([activite, heures]) => {
        const niveauCompetence = competences[employe.id]?.[activite] || 0;
        if (niveauCompetence > 0) {
          // Répartir selon le poids
          repartition[employe.id][activite] = (heures * poids[employe.id]) / poidsTotal;
        }
      });
    });
    
    return repartition;
  };

  // Fonction pour calculer le score total de compétence d'un employé
  const calculerScoreTotal = (employeId) => {
    let score = 0;
    Object.keys(competencesActivites).forEach(activite => {
      const niveau = competences[employeId]?.[activite] || 0;
      score += niveau;
    });
    return score;
  };

  // Fonction pour calculer la capacité totale disponible
  const calculerCapaciteTotale = (employesDisponibles, date) => {
    let capacite = 0;
    const creneauxHoraires = parametres.creneauxPersonnalises || [];
    employesDisponibles.forEach(employe => {
      const dispo = disponibilites[employe.id]?.[date];
      const creneaux = creneauxHoraires.filter(creneau => {
        if (dispo === 'miTempsMatin') {
          return ['creneau1', 'creneau2'].includes(creneau.id);
        }
        if (dispo === 'miTempsApresMidi') {
          return ['creneau5', 'creneau6'].includes(creneau.id);
        }
        if (dispo === 'matin') {
          return creneau.equipe !== 'apresMidi';
        }
        if (dispo === 'apresMidi') {
          return creneau.equipe !== 'matin';
        }
        return true;
      });
      capacite += creneaux.reduce((sum, c) => sum + c.duree, 0);
    });
    return capacite;
  };

  // Fonction pour calculer les heures cibles avec surplus
  const calculerAvecSurplus = (heuresNecessaires, surplus) => {
    if (surplus <= 0) return {...heuresNecessaires};
    
    const total = Object.values(heuresNecessaires).reduce((sum, h) => sum + h, 0);
    const heuresCibles = {};
    
    Object.entries(heuresNecessaires).forEach(([activite, heures]) => {
      const proportion = heures / total;
      heuresCibles[activite] = heures + (surplus * proportion);
    });
    
    return heuresCibles;
  };

  // FONCTION AUXILIAIRE : Obtenir les créneaux disponibles d'un employé selon sa disponibilité
  const obtenirCreneauxEmploye = (disponibilite) => {
    const creneauxHoraires = parametres.creneauxPersonnalises || [];
    return creneauxHoraires.filter(creneau => {
      if (disponibilite === 'miTempsMatin') {
        return ['creneau1', 'creneau2'].includes(creneau.id);
      }
      if (disponibilite === 'miTempsApresMidi') {
        return ['creneau5', 'creneau6'].includes(creneau.id);
      }
      if (disponibilite === 'matin') {
        return creneau.equipe !== 'apresMidi'; // créneaux 1-5
      }
      if (disponibilite === 'apresMidi') {
        return creneau.equipe !== 'matin'; // créneaux 2-6
      }
      return true; // Disponibilité complète
    });
  };

  // FONCTION AUXILIAIRE : Répartir les besoins par créneau avec surplus équitable
  const repartirBesoinsParCreneau = (heuresNecessaires, surplus, nombreEmployes) => {
    const besoinsParCreneau = {};
    const creneauxHoraires = parametres.creneauxPersonnalises || [];
    
    // Initialiser la structure pour chaque créneau
    creneauxHoraires.forEach(creneau => {
      besoinsParCreneau[creneau.id] = {};
      
      // Initialiser toutes les activités à 0
      Object.keys(heuresNecessaires).forEach(activite => {
        besoinsParCreneau[creneau.id][activite] = 0;
      });
    });

    // Répartir les besoins selon les contraintes d'activités
    Object.entries(heuresNecessaires).forEach(([activite, heuresNecessaire]) => {
      // Activités à horaires limités (créneaux 2, 4, 6)
      if (['PICKING FRIGO', 'PICKING TRAD', 'CONTRÔLE'].includes(activite)) {
        const creneauxLimites = creneauxHoraires.filter(c => 
          ['creneau2', 'creneau4', 'creneau6'].includes(c.id)
        );
        const dureeTotal = creneauxLimites.reduce((sum, c) => sum + c.duree, 0);
        
        creneauxLimites.forEach(creneau => {
          const proportion = creneau.duree / dureeTotal;
          besoinsParCreneau[creneau.id][activite] = heuresNecessaire * proportion;
        });
      }
      // Activités flexibles (tous créneaux)
      else {
        const dureeTotal = creneauxHoraires.reduce((sum, c) => sum + c.duree, 0);
        
        creneauxHoraires.forEach(creneau => {
          const proportion = creneau.duree / dureeTotal;
          besoinsParCreneau[creneau.id][activite] = heuresNecessaire * proportion;
        });
      }
    });

    // Répartir le surplus équitablement si positif
    if (surplus > 0 && nombreEmployes > 0) {
      const surplusParEmploye = surplus / nombreEmployes;
      const surplusParCreneau = surplusParEmploye / creneauxHoraires.length;
      
      creneauxHoraires.forEach(creneau => {
        // Répartir le surplus proportionnellement aux besoins existants
        const totalBesoins = Object.values(besoinsParCreneau[creneau.id]).reduce((sum, b) => sum + b, 0);
        
        if (totalBesoins > 0) {
          Object.keys(besoinsParCreneau[creneau.id]).forEach(activite => {
            const proportion = besoinsParCreneau[creneau.id][activite] / totalBesoins;
            besoinsParCreneau[creneau.id][activite] += surplusParCreneau * proportion;
          });
        }
      });
    }

    return besoinsParCreneau;
  };

  // FONCTION AUXILIAIRE : Choisir l'activité optimale pour un employé sur un créneau
  const choisirActiviteOptimale = (employeId, creneau, besoinsCreneauRestants) => {
    // Lister les activités possibles pour ce créneau
    const activitesPossibles = creneau.activitesAutorisees
      .filter(act => (competences[employeId]?.[act] || 0) > 0)  // A la compétence
      .filter(act => (besoinsCreneauRestants[act] || 0) > 0.01);  // Besoin restant

    if (activitesPossibles.length === 0) {
      // Si aucune activité avec besoin, prendre n'importe quelle activité avec compétence
      const activitesAvecCompetence = creneau.activitesAutorisees
        .filter(act => (competences[employeId]?.[act] || 0) > 0);
      
      if (activitesAvecCompetence.length > 0) {
        // Trier par niveau de compétence décroissant
        return activitesAvecCompetence.sort((a, b) => 
          (competences[employeId]?.[b] || 0) - (competences[employeId]?.[a] || 0)
        )[0];
      }
      
      return null;
    }

    // Trier par priorité
    return activitesPossibles.sort((a, b) => {
      // 1. EO en priorité pour cohérence
      if (a === 'EO' && (besoinsCreneauRestants['EO'] || 0) > 0) return -1;
      if (b === 'EO' && (besoinsCreneauRestants['EO'] || 0) > 0) return 1;

      // 2. Activités à créneaux limités
      const limites = ['PICKING FRIGO', 'PICKING TRAD', 'CONTRÔLE'];
      const aLimite = limites.includes(a);
      const bLimite = limites.includes(b);
      if (aLimite && !bLimite) return -1;
      if (bLimite && !aLimite) return 1;

      // 3. Plus grand besoin restant
      const besoinA = besoinsCreneauRestants[a] || 0;
      const besoinB = besoinsCreneauRestants[b] || 0;
      if (Math.abs(besoinB - besoinA) > 0.1) {
        return besoinB - besoinA;
      }

      // 4. Meilleure compétence de l'employé
      const niveauA = competences[employeId]?.[a] || 0;
      const niveauB = competences[employeId]?.[b] || 0;
      return niveauB - niveauA;
    })[0];
  };

  // Fonction pour choisir la meilleure activité pour un créneau
  const choisirMeilleureActivite = (employeId, creneau, besoinsRestants) => {
    // Lister activités possibles pour ce créneau
    const activitesPossibles = creneau.activitesAutorisees
      .filter(act => (competences[employeId]?.[act] || 0) > 0)  // A la compétence
      .filter(act => besoinsRestants[act] > 0.01);  // Encore du besoin

    if (activitesPossibles.length === 0) return null;

    // Critères de choix (par ordre de priorité)
    return activitesPossibles.sort((a, b) => {
      // 1. EO en premier (exclusif)
      if (a === 'EO') return -1;
      if (b === 'EO') return 1;

      // 2. Activités à créneaux limités
      const limites = ['PICKING FRIGO', 'PICKING TRAD', 'CONTRÔLE'];
      const aLimite = limites.includes(a);
      const bLimite = limites.includes(b);
      if (aLimite && !bLimite) return -1;
      if (bLimite && !aLimite) return 1;

      // 3. Plus grand besoin restant
      const diffBesoin = besoinsRestants[b] - besoinsRestants[a];
      if (Math.abs(diffBesoin) > 0.5) return diffBesoin > 0 ? 1 : -1;

      // 4. Meilleure compétence de l'employé
      const niveauA = competences[employeId]?.[a] || 0;
      const niveauB = competences[employeId]?.[b] || 0;
      return niveauB - niveauA;

    })[0];
  };

  // Fonction pour attribuer automatiquement les sous-activités de manière équitable
  const attribuerSousActivitesAutomatiquement = (postesGeneres) => {
    // Grouper les postes par activité principale (sans créneau cette fois)
    const groupes = {};
    
    postesGeneres.forEach(poste => {
      const activitePrincipale = getActivitePrincipale(poste.activite);
      const sousActivitesPossibles = parametres.sousActivites[activitePrincipale] || [];
      
      // Ne traiter que les activités qui ont des sous-activités configurées
      if (sousActivitesPossibles.length > 0) {
        // Grouper uniquement par activité principale, pas par créneau
        const key = activitePrincipale;
        
        if (!groupes[key]) {
          groupes[key] = {
            activite: activitePrincipale,
            sousActivites: sousActivitesPossibles,
            postesParEmploye: {} // Nouveau : grouper les postes par employé
          };
        }
        
        // Grouper les postes par employé affecté
        const employeId = poste.employeAffecte;
        if (employeId) {
          if (!groupes[key].postesParEmploye[employeId]) {
            groupes[key].postesParEmploye[employeId] = [];
          }
          groupes[key].postesParEmploye[employeId].push(poste);
        }
      }
    });

    // Pour chaque activité principale, attribuer les sous-activités de manière équilibrée
    let indexGlobal = 0; // Compteur global pour assurer la rotation entre employés
    
    Object.values(groupes).forEach(groupe => {
      // Trier les employés par nombre de postes (du plus au moins) pour équilibrer
      const employesOrdonnes = Object.entries(groupe.postesParEmploye)
        .sort((a, b) => b[1].length - a[1].length);
      
      employesOrdonnes.forEach(([employeId, postesEmploye]) => {
        // Trier les postes de cet employé par créneau pour cohérence
        postesEmploye.sort((a, b) => {
          const creneauA = parseInt(a.creneauId.replace('creneau', ''));
          const creneauB = parseInt(b.creneauId.replace('creneau', ''));
          return creneauA - creneauB;
        });
        
        // Attribuer des sous-activités différentes pour chaque créneau de cet employé
        postesEmploye.forEach((poste, indexLocal) => {
          // Utiliser le compteur global + index local pour assurer variété
          const sousActiviteIndex = (indexGlobal + indexLocal) % groupe.sousActivites.length;
          poste.sousActivite = getSousActiviteNom(groupe.sousActivites[sousActiviteIndex]);
        });
        
        // Incrémenter le compteur global pour le prochain employé
        // On incrémente de la longueur des postes pour éviter les répétitions
        indexGlobal += postesEmploye.length;
      });
    });

    return postesGeneres;
  };

  // NOUVELLE STRATÉGIE D'AFFECTATION AUTOMATIQUE
  // Règle 1: EO exclusif toute la journée
  // Règle 2: Minimiser l'écart entre heures planifiées et nécessaires
  // Règle 3: Même nombre d'activités par créneau disponible
  // Règle 4: Répartir équitablement les postes entre employés
  // Règle 5: Prioriser les employés les plus compétents
  
  // Fonction auxiliaire : Calculer le nombre de postes nécessaires par créneau et activité
  const calculerBesoinsParCreneau = (heuresNecessaires, date, employesDisponibles) => {
    const creneauxHoraires = parametres.creneauxPersonnalises || [];
    const besoinsParCreneau = {};
    
    // Initialiser la structure
    creneauxHoraires.forEach(creneau => {
      besoinsParCreneau[creneau.id] = {};
    });
    
    // Fonction helper pour calculer la capacité réelle d'un créneau pour une activité
    const calculerCapaciteCreneau = (creneau, activite, employesDisponibles, date) => {
      let capacite = 0;
      
      employesDisponibles.forEach(employe => {
        // Vérifier si l'employé a la compétence pour cette activité
        const competence = competences[employe.id]?.[activite] || 0;
        if (competence === 0) return;
        
        // Vérifier si l'employé peut travailler sur ce créneau selon sa disponibilité
        const disponibilite = disponibilites[employe.id]?.[date];
        if (!disponibilite || disponibilite === 'non') return;
        
        // Vérifier la compatibilité créneau/disponibilité
        if (disponibilite === 'miTempsMatin' && !['creneau1', 'creneau2'].includes(creneau.id)) {
          return;
        }
        if (disponibilite === 'miTempsApresMidi' && !['creneau5', 'creneau6'].includes(creneau.id)) {
          return;
        }
        if (disponibilite === 'matin' && creneau.equipe === 'apresMidi') {
          return;
        }
        if (disponibilite === 'apresMidi' && creneau.equipe === 'matin') {
          return;
        }
        
        // Cet employé peut travailler sur ce créneau pour cette activité
        capacite++;
      });
      
      return capacite;
    };
    
    // Pour chaque activité, calculer combien de postes par créneau
    Object.entries(heuresNecessaires).forEach(([activite, heuresNecessaire]) => {
      // Obtenir les créneaux autorisés pour cette activité
      const creneauxAutorises = creneauxHoraires.filter(c => 
        c.activitesAutorisees.includes(activite)
      );
      
      if (creneauxAutorises.length === 0) return;
      
      // Calculer le nombre de postes total nécessaire
      const dureeCreneauMoyenne = creneauxAutorises.reduce((sum, c) => sum + c.duree, 0) / creneauxAutorises.length;
      const nombrePostesTotal = Math.ceil(heuresNecessaire / dureeCreneauMoyenne);
      
      // NOUVELLE LOGIQUE : Grouper les créneaux par profil d'activités
      // Un profil = l'ensemble trié des activités autorisées sur le créneau
      const groupesCreneaux = {};
      
      creneauxAutorises.forEach(creneau => {
        // Créer une clé unique basée sur les activités autorisées (triées)
        const profilKey = [...creneau.activitesAutorisees].sort().join('|');
        
        if (!groupesCreneaux[profilKey]) {
          groupesCreneaux[profilKey] = [];
        }
        groupesCreneaux[profilKey].push(creneau);
      });
      
      // Répartir les postes entre les groupes proportionnellement à leur taille
      const nombreGroupes = Object.keys(groupesCreneaux).length;
      let postesDistribues = 0;
      
      Object.values(groupesCreneaux).forEach((creneauxDuGroupe, indexGroupe) => {
        // Calculer combien de postes pour ce groupe
        const nombreCreneauxDuGroupe = creneauxDuGroupe.length;
        const proportionGroupe = nombreCreneauxDuGroupe / creneauxAutorises.length;
        
        // Nombre de postes pour ce groupe
        let postesGroupe;
        if (indexGroupe === nombreGroupes - 1) {
          // Dernier groupe : prendre tous les postes restants
          postesGroupe = nombrePostesTotal - postesDistribues;
        } else {
          postesGroupe = Math.round(nombrePostesTotal * proportionGroupe);
        }
        
        // NOUVELLE LOGIQUE : Calculer la capacité réelle de chaque créneau du groupe
        const capacitesCreneaux = creneauxDuGroupe.map(creneau => ({
          creneau,
          capacite: calculerCapaciteCreneau(creneau, activite, employesDisponibles, date)
        }));
        
        // Calculer la capacité totale du groupe
        const capaciteTotale = capacitesCreneaux.reduce((sum, item) => sum + item.capacite, 0);
        
        if (capaciteTotale === 0) {
          // Aucune capacité disponible, répartir quand même uniformément (sera géré par Phase 3)
          const postesParCreneau = Math.floor(postesGroupe / nombreCreneauxDuGroupe);
          let postesRestants = postesGroupe % nombreCreneauxDuGroupe;
          
          creneauxDuGroupe.forEach((creneau, index) => {
            const nombrePostes = postesParCreneau + (index < postesRestants ? 1 : 0);
            besoinsParCreneau[creneau.id][activite] = nombrePostes;
            postesDistribues += nombrePostes;
          });
        } else {
          // Répartir proportionnellement à la capacité réelle
          let postesDistribuesGroupe = 0;
          
          capacitesCreneaux.forEach((item, index) => {
            let nombrePostes;
            
            if (index === capacitesCreneaux.length - 1) {
              // Dernier créneau du groupe : prendre les postes restants
              nombrePostes = postesGroupe - postesDistribuesGroupe;
            } else {
              // Répartir proportionnellement à la capacité
              const proportion = item.capacite / capaciteTotale;
              nombrePostes = Math.round(postesGroupe * proportion);
            }
            
            // S'assurer de ne pas dépasser la capacité du créneau
            nombrePostes = Math.min(nombrePostes, item.capacite);
            
            besoinsParCreneau[item.creneau.id][activite] = nombrePostes;
            postesDistribuesGroupe += nombrePostes;
            postesDistribues += nombrePostes;
          });
        }
      });
    });
    
    return besoinsParCreneau;
  };
  
  // Fonction auxiliaire : Trier les employés par priorité pour une activité
  const trierEmployesParPriorite = (employes, activite, compteurAffectations) => {
    return [...employes].sort((a, b) => {
      // Règle 4 : D'abord, favoriser ceux qui ont moins d'affectations de cette activité
      const affectationsA = compteurAffectations[a.id]?.[activite] || 0;
      const affectationsB = compteurAffectations[b.id]?.[activite] || 0;
      
      if (affectationsA !== affectationsB) {
        return affectationsA - affectationsB; // Moins d'affectations = prioritaire
      }
      
      // Règle 5 : Ensuite, prioriser le plus compétent
      const competenceA = competences[a.id]?.[activite] || 0;
      const competenceB = competences[b.id]?.[activite] || 0;
      
      return competenceB - competenceA; // Compétence décroissante
    });
  };
  
  // Fonction auxiliaire : Vérifier si un employé peut travailler sur un créneau
  const peutTravaillerSurCreneau = (employe, creneau, date, employesAffectesEO, creneauxUtilises) => {
    // Règle 1 : Si affecté à l'EO, ne peut pas faire autre chose
    if (employesAffectesEO.has(employe.id)) return false;
    
    // Vérifier si le créneau n'est pas déjà utilisé par cet employé
    const key = `${employe.id}_${creneau.id}`;
    if (creneauxUtilises.has(key)) return false;
    
    // Vérifier la disponibilité
    const disponibilite = disponibilites[employe.id]?.[date];
    if (!disponibilite || disponibilite === 'non') return false;
    
    // Vérifier la compatibilité du créneau avec la disponibilité
    if (disponibilite === 'miTempsMatin' && !['creneau1', 'creneau2'].includes(creneau.id)) {
      return false;
    }
    if (disponibilite === 'miTempsApresMidi' && !['creneau5', 'creneau6'].includes(creneau.id)) {
      return false;
    }
    if (disponibilite === 'matin' && creneau.equipe === 'apresMidi') {
      return false;
    }
    if (disponibilite === 'apresMidi' && creneau.equipe === 'matin') {
      return false;
    }
    
    return true;
  };

  // NOUVELLE FONCTION : Générer l'affectation complète avec la nouvelle stratégie
  const genererAffectationComplete = (volume, date = dateAffectation) => {
    if (!volume || volume <= 0) return null;
    if (!date) {
      console.error('Date non fournie pour l\'affectation');
      return null;
    }

    // Étape 1: Calculer les heures nécessaires par activité
    const heuresNecessaires = calculerHeuresNecessaires(volume);
    
    // Étape 2: Obtenir les employés disponibles
    const employesDisponibles = obtenirEmployesDisponibles(date);
    
    if (employesDisponibles.length === 0) {
      console.warn('Aucun employé disponible pour cette date');
      return {
        volume: volume,
        heuresNecessaires: heuresNecessaires,
        postesGeneres: [],
        totalHeuresDimensionnees: 0,
        employesAffectes: []
      };
    }

    // Étape 3: Calculer les besoins par créneau (Règle 3) - Avec capacité réelle
    const besoinsParCreneau = calculerBesoinsParCreneau(heuresNecessaires, date, employesDisponibles);
    
    // Initialisation
    const postesGeneres = [];
    const employesAffectesEO = new Set(); // Règle 1
    const creneauxUtilises = new Set(); // Pour éviter double affectation
    const compteurAffectations = {}; // Règle 4 : compter les affectations par employé et activité
    let posteId = 1;
    
    // Initialiser le compteur d'affectations
    employesDisponibles.forEach(employe => {
      compteurAffectations[employe.id] = {};
    });
    
    const creneauxHoraires = parametres.creneauxPersonnalises || [];

    // ===== PHASE 1 : Affectation EO exclusif (Règle 1) =====
    const employesEO = employesDisponibles
      .filter(e => (competences[e.id]?.['EO'] || 0) > 0)
      .sort((a, b) => (competences[b.id]?.['EO'] || 0) - (competences[a.id]?.['EO'] || 0));

    let besoinEORestant = heuresNecessaires['EO'] || 0;
    
    for (const employe of employesEO) {
      if (besoinEORestant <= 0.01) break;
      
      const disponibilite = disponibilites[employe.id]?.[date];
      const creneauxEmploye = obtenirCreneauxEmploye(disponibilite);
      const heuresDisponibles = creneauxEmploye.reduce((sum, c) => sum + c.duree, 0);
      
      // Si cet employé peut couvrir (ou presque) le besoin EO restant
      if (heuresDisponibles <= besoinEORestant + 1) {
        // Affecter à EO pour toute sa journée
        creneauxEmploye.forEach(creneau => {
          postesGeneres.push({
            id: `poste_${posteId++}`,
            activite: 'EO',
            creneauId: creneau.id,
            creneauLabel: creneau.label,
            equipe: creneau.equipe,
            heuresDimensionnees: creneau.duree,
            employeAffecte: employe.id,
            employeNom: employe.nom,
            niveauCompetence: competences[employe.id]?.['EO'] || 0,
            exclusif: true
          });
          
          creneauxUtilises.add(`${employe.id}_${creneau.id}`);
          
          // Déduire du besoin
          if (besoinsParCreneau[creneau.id]?.['EO']) {
            besoinsParCreneau[creneau.id]['EO'] = Math.max(0, besoinsParCreneau[creneau.id]['EO'] - 1);
          }
        });
        
        besoinEORestant -= heuresDisponibles;
        employesAffectesEO.add(employe.id);
        compteurAffectations[employe.id]['EO'] = creneauxEmploye.length;
      }
    }

    // ===== PHASE 2 : Affectation des autres activités =====
    const employesRestants = employesDisponibles.filter(e => !employesAffectesEO.has(e.id));
    
    // Trier les activités par besoin décroissant (sauf EO)
    const activitesATraiter = Object.entries(heuresNecessaires)
      .filter(([act, _]) => act !== 'EO')
      .sort((a, b) => b[1] - a[1]);
    
    // Pour chaque créneau
    creneauxHoraires.forEach(creneau => {
      // Pour chaque activité dans l'ordre de priorité
      activitesATraiter.forEach(([activite, _]) => {
        // Vérifier si cette activité est autorisée sur ce créneau
        if (!creneau.activitesAutorisees.includes(activite)) return;
        
        // Nombre de postes nécessaires pour cette activité sur ce créneau
        const nombrePostesNecessaires = besoinsParCreneau[creneau.id][activite] || 0;
        
        if (nombrePostesNecessaires <= 0) return;
        
        // Obtenir les employés éligibles pour cette activité sur ce créneau
        const employesEligibles = employesRestants.filter(employe => {
          // Doit avoir la compétence
          const competence = competences[employe.id]?.[activite] || 0;
          if (competence === 0) return false;
          
          // Doit pouvoir travailler sur ce créneau
          return peutTravaillerSurCreneau(employe, creneau, date, employesAffectesEO, creneauxUtilises);
        });
        
        if (employesEligibles.length === 0) return;
        
        // Trier par priorité (Règles 4 et 5)
        const employesTries = trierEmployesParPriorite(employesEligibles, activite, compteurAffectations);
        
        // Affecter les postes (Règle 2 : respecter le nombre calculé)
        let postesAffectes = 0;
        for (const employe of employesTries) {
          if (postesAffectes >= nombrePostesNecessaires) break;
          
          // Vérifier à nouveau la disponibilité (au cas où déjà affecté depuis)
          if (!peutTravaillerSurCreneau(employe, creneau, date, employesAffectesEO, creneauxUtilises)) {
            continue;
          }
          
          // Créer le poste
          postesGeneres.push({
            id: `poste_${posteId++}`,
            activite: activite,
            creneauId: creneau.id,
            creneauLabel: creneau.label,
            equipe: creneau.equipe,
            heuresDimensionnees: creneau.duree,
            employeAffecte: employe.id,
            employeNom: employe.nom,
            niveauCompetence: competences[employe.id]?.[activite] || 0,
            exclusif: false
          });
          
          // Marquer le créneau comme utilisé pour cet employé
          creneauxUtilises.add(`${employe.id}_${creneau.id}`);
          
          // Mettre à jour le compteur d'affectations (Règle 4)
          if (!compteurAffectations[employe.id][activite]) {
            compteurAffectations[employe.id][activite] = 0;
          }
          compteurAffectations[employe.id][activite]++;
          
          postesAffectes++;
        }
      });
    });

    // ===== PHASE 3 : Remplissage intelligent des écarts négatifs =====
    // Calculer les écarts initiaux
    let continuerRemplissage = true;
    let iterationsMax = 50; // Sécurité pour éviter boucle infinie
    let iteration = 0;
    
    while (continuerRemplissage && iteration < iterationsMax) {
      iteration++;
      
      // Calculer les écarts actuels
      const ecartsActuels = {};
      Object.entries(heuresNecessaires).forEach(([activite, heuresNecessaire]) => {
        let heuresAffectees = 0;
        postesGeneres.forEach(poste => {
          if (poste.activite === activite && poste.employeAffecte) {
            heuresAffectees += poste.heuresDimensionnees;
          }
        });
        ecartsActuels[activite] = heuresAffectees - heuresNecessaire;
      });
      
      // Trouver l'activité avec le plus grand écart négatif
      let activiteMaxEcart = null;
      let ecartMax = -0.5; // Seuil minimum pour continuer
      
      Object.entries(ecartsActuels).forEach(([activite, ecart]) => {
        if (ecart < ecartMax) {
          ecartMax = ecart;
          activiteMaxEcart = activite;
        }
      });
      
      // Si aucun écart négatif significatif, arrêter
      if (!activiteMaxEcart) {
        continuerRemplissage = false;
        break;
      }
      
      // Trouver les créneaux autorisés pour cette activité
      const creneauxPourActivite = creneauxHoraires
        .filter(c => c.activitesAutorisees.includes(activiteMaxEcart))
        .sort((a, b) => b.duree - a.duree); // Trier par durée décroissante
      
      if (creneauxPourActivite.length === 0) {
        continuerRemplissage = false;
        break;
      }
      
      // Essayer d'affecter sur chaque créneau
      let posteAjoute = false;
      
      for (const creneau of creneauxPourActivite) {
        // Trouver les employés disponibles pour ce créneau et cette activité
        const employesCandidats = employesRestants.filter(employe => {
          // Doit avoir la compétence
          const competence = competences[employe.id]?.[activiteMaxEcart] || 0;
          if (competence === 0) return false;
          
          // Doit pouvoir travailler sur ce créneau
          if (!peutTravaillerSurCreneau(employe, creneau, date, employesAffectesEO, creneauxUtilises)) {
            return false;
          }
          
          return true;
        });
        
        if (employesCandidats.length === 0) continue;
        
        // Trier par compétence décroissante
        employesCandidats.sort((a, b) => {
          const compA = competences[a.id]?.[activiteMaxEcart] || 0;
          const compB = competences[b.id]?.[activiteMaxEcart] || 0;
          return compB - compA;
        });
        
        // Prendre le meilleur candidat
        const meilleurEmploye = employesCandidats[0];
        
        // Créer un nouveau poste
        const nouveauPoste = {
          id: `poste_${posteId++}`,
          activite: activiteMaxEcart,
          creneauId: creneau.id,
          creneauLabel: creneau.label,
          equipe: creneau.equipe,
          heuresDimensionnees: creneau.duree,
          employeAffecte: meilleurEmploye.id,
          employeNom: meilleurEmploye.nom,
          niveauCompetence: competences[meilleurEmploye.id]?.[activiteMaxEcart] || 0,
          exclusif: false,
          remplissage: true // Marqueur pour identifier les postes de remplissage
        };
        
        postesGeneres.push(nouveauPoste);
        
        // Marquer le créneau comme utilisé
        creneauxUtilises.add(`${meilleurEmploye.id}_${creneau.id}`);
        
        // Mettre à jour le compteur d'affectations
        if (!compteurAffectations[meilleurEmploye.id][activiteMaxEcart]) {
          compteurAffectations[meilleurEmploye.id][activiteMaxEcart] = 0;
        }
        compteurAffectations[meilleurEmploye.id][activiteMaxEcart]++;
        
        posteAjoute = true;
        
        // Recalculer l'écart pour cette activité
        let heuresAffectees = 0;
        postesGeneres.forEach(poste => {
          if (poste.activite === activiteMaxEcart && poste.employeAffecte) {
            heuresAffectees += poste.heuresDimensionnees;
          }
        });
        const nouvelEcart = heuresAffectees - heuresNecessaires[activiteMaxEcart];
        
        // Si l'écart est maintenant positif ou proche de 0, passer à l'activité suivante
        if (nouvelEcart >= -0.5) {
          break;
        }
      }
      
      // Si aucun poste n'a pu être ajouté, arrêter
      if (!posteAjoute) {
        continuerRemplissage = false;
      }
    }

    // Étape finale : Attribuer automatiquement les sous-activités
    const postesAvecSousActivites = attribuerSousActivitesAutomatiquement(postesGeneres);
    const totalHeuresDimensionnees = postesAvecSousActivites.reduce((sum, p) => sum + p.heuresDimensionnees, 0);

    return {
      volume: volume,
      heuresNecessaires: heuresNecessaires,
      postesGeneres: postesAvecSousActivites,
      totalHeuresDimensionnees: totalHeuresDimensionnees,
      employesAffectes: employesDisponibles.map(e => e.id)
    };
  };

  // Fonction pour obtenir les employés disponibles pour une date
  const obtenirEmployesDisponibles = (date) => {
    return employes.filter(employe => {
      const dispo = disponibilites[employe.id]?.[date];
      return dispo && dispo !== 'non';
    });
  };

  // Fonction pour vérifier si un employé peut être affecté à un poste
  const peutEtreAffecte = (employeId, poste, date) => {
    const employe = employes.find(e => e.id === employeId);
    if (!employe) return false;

    // Vérifier la disponibilité
    const dispo = disponibilites[employeId]?.[date];
    if (!dispo || dispo === 'non') return false;

    // Vérifier la compatibilité avec l'équipe/créneau
    const creneauxHoraires = parametres.creneauxPersonnalises || [];
    const creneau = creneauxHoraires.find(c => c.id === poste.creneauId);
    if (!creneau) return false;

    // Vérifier les contraintes de disponibilité selon le type
    if (dispo === 'miTempsMatin' && !['creneau1', 'creneau2'].includes(poste.creneauId)) {
      return false; // 1/2 M TÔT ne peut que sur les 2 premiers créneaux
    }
    
    if (dispo === 'miTempsApresMidi' && !['creneau5', 'creneau6'].includes(poste.creneauId)) {
      return false; // 1/2 M TARD ne peut que sur les 2 derniers créneaux
    }

    if (dispo === 'matin' && creneau.equipe === 'apresMidi') {
      return false;
    }

    if (dispo === 'apresMidi' && creneau.equipe === 'matin') {
      return false;
    }

    // Vérifier les compétences
    const niveauCompetence = competences[employeId]?.[poste.activite] || 0;
    return niveauCompetence > 0; // Au moins niveau 1
  };

  // Fonction pour affecter automatiquement les employés - Version optimisée
  const affecterAutomatiquement = (dimensionnement, date) => {
    if (!dimensionnement) return {};

    const affectationsAuto = {};
    const employesDisponibles = obtenirEmployesDisponibles(date);
    const employesUtilises = new Set();
    const postesExtrasGeneres = [];

    // PHASE 1: Affectation prioritaire des postes critiques

    
    // Trier les postes par priorité (EO en premier car exclusif)
    const postesOrdonnes = [...dimensionnement.postesGeneres].sort((a, b) => {
      if (a.exclusif && !b.exclusif) return -1;
      if (!a.exclusif && b.exclusif) return 1;
      return 0;
    });

    postesOrdonnes.forEach(poste => {
      // Trouver le meilleur employé pour ce poste
      const candidats = employesDisponibles
        .filter(employe => 
          !employesUtilises.has(employe.id) && 
          peutEtreAffecte(employe.id, poste, date)
        )
        .map(employe => ({
          employe,
          competence: competences[employe.id]?.[poste.activite] || 0
        }))
        .sort((a, b) => b.competence - a.competence);

      if (candidats.length > 0) {
        const meilleurCandidat = candidats[0];
        affectationsAuto[poste.id] = meilleurCandidat.employe.id;
        
        // Si le poste est exclusif (EO), marquer l'employé comme utilisé pour toute la journée
        if (poste.exclusif) {
          employesUtilises.add(meilleurCandidat.employe.id);
        } else {
          // Pour les postes non-exclusifs, marquer comme utilisé seulement pour ce créneau
          // (on gérera les conflits de créneaux dans la phase 2)
        }
        

      }
    });


    // Ajouter les postes extras générés au dimensionnement
    if (postesExtrasGeneres.length > 0) {
      setDimensionnementGenere(prev => ({
        ...prev,
        postesGeneres: [...prev.postesGeneres, ...postesExtrasGeneres]
      }));
    }






    return affectationsAuto;
  };

  // Fonction pour calculer les écarts entre dimensionné et nécessaire - Version corrigée basée sur affectations réelles
  const calculerEcarts = (dimensionnement, affectations = {}) => {
    if (!dimensionnement) return {};

    const ecarts = {};
    



    
    Object.entries(dimensionnement.heuresNecessaires).forEach(([activite, heuresNecessaires]) => {


      
      // Calculer les heures RÉELLEMENT affectées pour cette activité
      let heuresAffectees = 0;
      const postesAffectes = [];
      
      dimensionnement.postesGeneres.forEach(poste => {
        // Ne compter que les postes de cette activité ET qui ont un employé affecté
        if (poste.activite === activite && affectations[poste.id]) {
          heuresAffectees += poste.heuresDimensionnees;
          postesAffectes.push(poste);

        }
      });
      

      
      ecarts[activite] = {
        necessaire: heuresNecessaires,
        dimensionne: heuresAffectees,
        ecart: heuresAffectees - heuresNecessaires,
        pourcentage: heuresNecessaires > 0 ? (heuresAffectees / heuresNecessaires) * 100 : 0
      };
    });


    Object.entries(ecarts).forEach(([activite, data]) => {

    });

    return ecarts;
  };

  // Fonction pour analyser les disponibilités
  const analyserDisponibilites = (date, dimensionnement) => {
    if (!dimensionnement) return { surplus: 0, deficit: 0, details: {} };

    const employesDisponibles = obtenirEmployesDisponibles(date);
    
    // Calculer le temps total NÉCESSAIRE (heures théoriques par activité)
    const totalHeuresNecessaires = Object.values(dimensionnement.heuresNecessaires).reduce((sum, h) => sum + h, 0);
    
    // Calculer le temps de travail moyen par employé selon leur disponibilité
    let tempsDeTravailMoyen = 0;
    employesDisponibles.forEach(emp => {
      const dispo = disponibilites[emp.id]?.[date];
      const creneaux = obtenirCreneauxEmploye(dispo);
      const heuresEmploye = creneaux.reduce((sum, c) => sum + c.duree, 0);
      tempsDeTravailMoyen += heuresEmploye;
    });
    
    if (employesDisponibles.length > 0) {
      tempsDeTravailMoyen = tempsDeTravailMoyen / employesDisponibles.length;
    } else {
      tempsDeTravailMoyen = 7.5; // Valeur par défaut
    }
    
    // Nombre d'employés nécessaires = temps total nécessaire / temps de travail moyen
    const employesNecessaires = Math.ceil(totalHeuresNecessaires / tempsDeTravailMoyen);
    
    const analyse = {
      employesDisponibles: employesDisponibles.length,
      employesNecessaires: employesNecessaires,
      totalHeures: totalHeuresNecessaires,
      heuresMoyennes: tempsDeTravailMoyen,
      surplus: Math.max(0, employesDisponibles.length - employesNecessaires),
      deficit: Math.max(0, employesNecessaires - employesDisponibles.length),
      details: {}
    };

    // Analyser par type de disponibilité
    ['matin', 'apresMidi', 'miTempsMatin', 'miTempsApresMidi'].forEach(typeDispo => {
      const employesCeType = employesDisponibles.filter(emp => 
        disponibilites[emp.id]?.[date] === typeDispo
      );
      
      analyse.details[typeDispo] = {
        nombre: employesCeType.length,
        employes: employesCeType.map(emp => emp.nom)
      };
    });

    return analyse;
  };

  // FONCTIONS POUR GÉRER LES ACTIVITÉS PERSONNALISÉES
  
  // Ajouter une activité personnalisée
  const ajouterActivitePersonnalisee = () => {
    if (!nouvelleActivite.trim()) {
      alert('Veuillez saisir un nom d\'activité');
      return;
    }
    
    const nomActivite = nouvelleActivite.trim().toUpperCase();
    
    // Vérifier si l'activité existe déjà
    if (activitesPersonnalisees.includes(nomActivite)) {
      alert('Cette activité existe déjà');
      return;
    }
    
    setActivitesPersonnalisees(prev => [...prev, nomActivite]);
    setNouvelleActivite('');
  };
  
  // Supprimer une activité personnalisée
  const supprimerActivitePersonnalisee = (activite) => {
    // Retirer l'activité de la liste
    setActivitesPersonnalisees(prev => prev.filter(a => a !== activite));
    
    // Retirer les affectations de cette activité
    if (dimensionnementGenere) {
      const postesARetirer = dimensionnementGenere.postesGeneres
        .filter(p => p.activite === activite)
        .map(p => p.id);
      
      // Supprimer les affectations
      setAffectationsPostes(prev => {
        const newAffectations = {...prev};
        postesARetirer.forEach(posteId => {
          delete newAffectations[posteId];
        });
        return newAffectations;
      });
      
      // Supprimer les postes
      setDimensionnementGenere(prev => ({
        ...prev,
        postesGeneres: prev.postesGeneres.filter(p => p.activite !== activite)
      }));
    }
  };

  // FONCTIONS POUR GÉRER LES SOUS-ACTIVITÉS
  
  // Helper pour obtenir le nom d'une sous-activité (compatibilité ancien/nouveau format)
  const getSousActiviteNom = (sousActivite) => {
    return typeof sousActivite === 'string' ? sousActivite : sousActivite.nom;
  };

  // Helper pour obtenir les créneaux autorisés d'une sous-activité
  const getSousActiviteCreneaux = (sousActivite) => {
    if (typeof sousActivite === 'string') {
      // Format ancien = tous les créneaux par défaut
      return parametres.creneauxPersonnalises?.map(c => c.id) || [];
    }
    return sousActivite.creneauxAutorises || [];
  };
  
  // Ajouter une sous-activité à une activité principale
  const ajouterSousActivite = () => {
    if (!nouvelleSousActivite.trim() || !activiteParentSelectionnee) {
      alert('Veuillez sélectionner une activité principale et saisir un nom de sous-activité');
      return;
    }
    
    const nomSousActivite = nouvelleSousActivite.trim().toUpperCase();
    
    // Vérifier si la sous-activité existe déjà pour cette activité
    const sousActivitesExistantes = (parametres.sousActivites[activiteParentSelectionnee] || [])
      .map(sa => getSousActiviteNom(sa));
    
    if (sousActivitesExistantes.includes(nomSousActivite)) {
      alert('Cette sous-activité existe déjà pour cette activité');
      return;
    }
    
    setParametres(prev => {
      // Récupérer uniquement les créneaux autorisés pour l'activité principale
      const creneauxAutorisesActivitePrincipale = (prev.creneauxPersonnalises || [])
        .filter(c => c.activitesAutorisees.includes(activiteParentSelectionnee))
        .map(c => c.id);
      
      // Créer la nouvelle sous-activité au nouveau format avec les créneaux de l'activité principale
      const nouvelleSousActiviteObj = {
        nom: nomSousActivite,
        creneauxAutorises: creneauxAutorisesActivitePrincipale
      };
      
      const updated = {
        ...prev,
        sousActivites: {
          ...prev.sousActivites,
          [activiteParentSelectionnee]: [
            ...(prev.sousActivites[activiteParentSelectionnee] || []),
            nouvelleSousActiviteObj
          ]
        },
        heritageCompetences: {
          ...prev.heritageCompetences,
          [nomSousActivite]: true // Par défaut, héritage activé
        }
      };
      setTimeout(() => sauvegarderParametres(), 500);
      return updated;
    });
    
    setNouvelleSousActivite('');
  };
  
  // Supprimer une sous-activité
  const supprimerSousActivite = (activiteParent, sousActivite) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la sous-activité "${sousActivite}" ?`)) {
      setParametres(prev => {
        const updated = {
          ...prev,
          sousActivites: {
            ...prev.sousActivites,
            [activiteParent]: prev.sousActivites[activiteParent].filter(sa => getSousActiviteNom(sa) !== sousActivite)
          }
        };
        
        // Supprimer aussi l'héritage de compétences
        const newHeritageCompetences = {...prev.heritageCompetences};
        delete newHeritageCompetences[sousActivite];
        updated.heritageCompetences = newHeritageCompetences;
        
        setTimeout(() => sauvegarderParametres(), 500);
        return updated;
      });
    }
  };
  
  // Basculer un créneau pour une sous-activité
  const toggleCreneauSousActivite = (activiteParent, sousActiviteNom, creneauId) => {
    setParametres(prev => {
      // Vérifier que le créneau est autorisé pour l'activité principale
      const creneauConfig = prev.creneauxPersonnalises?.find(c => c.id === creneauId);
      const estAutoriseActivitePrincipale = creneauConfig?.activitesAutorisees.includes(activiteParent);
      
      if (!estAutoriseActivitePrincipale) {
        alert(`Ce créneau n'est pas autorisé pour l'activité principale "${activiteParent}". Vous devez d'abord l'autoriser dans la configuration des créneaux horaires ci-dessus.`);
        return prev;
      }
      
      const sousActivites = prev.sousActivites[activiteParent] || [];
      
      const nouvellesSousActivites = sousActivites.map(sa => {
        const nom = getSousActiviteNom(sa);
        
        if (nom === sousActiviteNom) {
          // Convertir au nouveau format si nécessaire
          const sousActiviteObj = typeof sa === 'string' 
            ? { nom: sa, creneauxAutorises: prev.creneauxPersonnalises?.map(c => c.id) || [] }
            : { ...sa };
          
          const creneauxActuels = sousActiviteObj.creneauxAutorises || [];
          
          // Basculer le créneau
          if (creneauxActuels.includes(creneauId)) {
            // Vérifier qu'il reste au moins un créneau
            if (creneauxActuels.length <= 1) {
              alert('Une sous-activité doit avoir au moins un créneau autorisé');
              return sa;
            }
            sousActiviteObj.creneauxAutorises = creneauxActuels.filter(id => id !== creneauId);
          } else {
            sousActiviteObj.creneauxAutorises = [...creneauxActuels, creneauId];
          }
          
          return sousActiviteObj;
        }
        
        return sa;
      });
      
      const updated = {
        ...prev,
        sousActivites: {
          ...prev.sousActivites,
          [activiteParent]: nouvellesSousActivites
        }
      };
      
      setTimeout(() => sauvegarderParametres(), 500);
      return updated;
    });
  };
  
  // Basculer l'héritage de compétences pour une sous-activité
  const toggleHeritageCompetence = (sousActivite) => {
    setParametres(prev => {
      const updated = {
        ...prev,
        heritageCompetences: {
          ...prev.heritageCompetences,
          [sousActivite]: !prev.heritageCompetences[sousActivite]
        }
      };
      setTimeout(() => sauvegarderParametres(), 500);
      return updated;
    });
  };

  // Fonction pour supprimer un poste
  const supprimerPoste = (posteId) => {
    if (dimensionnementGenere) {
      setDimensionnementGenere(prev => ({
        ...prev,
        postesGeneres: prev.postesGeneres.filter(p => p.id !== posteId)
      }));
    }
    
    // Supprimer aussi l'affectation
    setAffectationsPostes(prev => {
      const newAffectations = {...prev};
      delete newAffectations[posteId];
      return newAffectations;
    });
  };

  // Fonction pour modifier l'affectation d'un poste
  const modifierAffectation = (posteId, employeId) => {
    setAffectationsPostes(prev => ({
      ...prev,
      [posteId]: employeId || null
    }));
  };

  // Pour changer d'onglet
  const renderTabHeader = () => (
    <div className="flex mb-6 border-b overflow-x-auto sticky top-0 bg-white z-10 shadow-sm">
      {estAdmin && (
        <button 
          className={`px-4 py-2 ${activeTab === "parametres" ? "border-b-2 border-green-700 font-medium" : ""}`}
          onClick={() => setActiveTab("parametres")}
          style={{ borderColor: activeTab === "parametres" ? "#007F61" : "" }}
        >
          Étape 0: Paramétrages
        </button>
      )}
      <button 
        className={`px-4 py-2 ${activeTab === "previsions" ? "border-b-2 border-green-700 font-medium" : ""}`}
        onClick={() => setActiveTab("previsions")}
        style={{ borderColor: activeTab === "previsions" ? "#007F61" : "" }}
      >
        Étape 1: Prévisions
      </button>
      <button 
        className={`px-4 py-2 ${activeTab === "competences" ? "border-b-2 border-green-700 font-medium" : ""}`}
        onClick={() => setActiveTab("competences")}
        style={{ borderColor: activeTab === "competences" ? "#007F61" : "" }}
      >
        Étape 2: Compétences
      </button>
      <button 
        className={`px-4 py-2 ${activeTab === "disponibilites" ? "border-b-2 border-green-700 font-medium" : ""}`}
        onClick={() => setActiveTab("disponibilites")}
        style={{ borderColor: activeTab === "disponibilites" ? "#007F61" : "" }}
      >
        Étape 3: Disponibilités
      </button>
      <button 
        className={`px-4 py-2 ${activeTab === "affectation-auto" ? "border-b-2 border-green-700 font-medium" : ""}`}
        onClick={() => setActiveTab("affectation-auto")}
        style={{ borderColor: activeTab === "affectation-auto" ? "#007F61" : "" }}
      >
        Étape 4: Affectation automatique
      </button>
      <button 
        className={`px-4 py-2 ${activeTab === "sous-activites" ? "border-b-2 border-green-700 font-medium" : ""}`}
        onClick={() => setActiveTab("sous-activites")}
        style={{ borderColor: activeTab === "sous-activites" ? "#007F61" : "" }}
      >
        Étape 5: Sous-activités
      </button>
      <button 
        className={`px-4 py-2 ${activeTab === "planning-final" ? "border-b-2 border-green-700 font-medium" : ""}`}
        onClick={() => setActiveTab("planning-final")}
        style={{ borderColor: activeTab === "planning-final" ? "#007F61" : "" }}
      >
        Étape 6: Planning final
      </button>
      <button 
        className={`px-4 py-2 ${activeTab === "revue" ? "border-b-2 border-green-700 font-medium" : ""}`}
        onClick={() => setActiveTab("revue")}
        style={{ borderColor: activeTab === "revue" ? "#007F61" : "" }}
      >
        Étape 7: Revue
      </button>
    </div>
  );

  // Rendu de l'onglet Paramétrages
  const renderParametresTab = () => (
    <ParametresTab
      productivite={productivite}
      defaultProductivite={defaultProductivite}
      handleProductiviteChange={handleProductiviteChange}
      parametres={parametres}
      defaultParametres={defaultParametres}
      handleParametresChange={handleParametresChange}
      competencesActivites={competencesActivites}
      couleursActivites={couleursActivites}
      modifierCreneau={modifierCreneau}
      ajouterCreneau={ajouterCreneau}
      supprimerCreneau={supprimerCreneau}
      toggleActiviteCreneau={toggleActiviteCreneau}
      activiteParentSelectionnee={activiteParentSelectionnee}
      setActiviteParentSelectionnee={setActiviteParentSelectionnee}
      nouvelleSousActivite={nouvelleSousActivite}
      setNouvelleSousActivite={setNouvelleSousActivite}
      ajouterSousActivite={ajouterSousActivite}
      supprimerSousActivite={supprimerSousActivite}
      toggleHeritageCompetence={toggleHeritageCompetence}
      toggleCreneauSousActivite={toggleCreneauSousActivite}
    />
  );

  // Contenu principal en fonction de l'onglet actif
  const renderActiveTab = () => {
    // Si l'application est en cours de chargement
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-4 border-green-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Chargement des données...</p>
          </div>
        </div>
      );
    }
    
    // Si l'utilisateur n'est pas administrateur et tente d'accéder aux onglets réservés
    if (!estAdmin && (activeTab === "parametres")) {
      return (
        <div className="bg-green-100 border-l-4 border-green-700 text-green-800 p-4 mb-4" style={{ borderColor: "#007F61" }}>
          <p className="font-bold">Accès restreint</p>
          <p>Vous n'avez pas les droits d'accès à cette section. Veuillez contacter un administrateur.</p>
        </div>
      );
    }
    
    switch (activeTab) {
      case "parametres":
        return renderParametresTab();
      case "previsions":
        return (
          <PrevisionsTab
            previsions={previsions}
            setPrevisions={setPrevisions}
            previsionsProcessed={previsionsProcessed}
            traiterPrevisions={traiterPrevisions}
            donneesGraphiquePrevisions={donneesGraphiquePrevisions}
          />
        );
      case "competences":
        return (
          <CompetencesTab
            parametres={parametres}
            couleursActivites={couleursActivites}
            employes={employes}
            supprimerEmploye={supprimerEmploye}
            competences={competences}
            updateCompetence={updateCompetence}
            nouvelEmployeNom={nouvelEmployeNom}
            setNouvelEmployeNom={setNouvelEmployeNom}
            ajouterEmploye={ajouterEmploye}
            donneesGraphiqueCompetences={donneesGraphiqueCompetences}
            activites={activites}
          />
        );
      case "disponibilites":
        return (
          <DisponibilitesTab
            disponibilitesTexte={disponibilitesTexte}
            setDisponibilitesTexte={setDisponibilitesTexte}
            traiterDisponibilites={traiterDisponibilites}
            datesDispo={datesDispo}
            employes={employes}
            disponibilites={disponibilites}
            updateDisponibilite={updateDisponibilite}
          />
        );
      case "affectation-auto":
        return (
          <AffectationAutoTab
            dateAffectation={dateAffectation}
            setDateAffectation={setDateAffectation}
            volumeAffectation={volumeAffectation}
            setVolumeAffectation={setVolumeAffectation}
            datesDispo={datesDispo}
            previsionsProcessed={previsionsProcessed}
            dimensionnementGenere={dimensionnementGenere}
            setDimensionnementGenere={setDimensionnementGenere}
            affectationsPostes={affectationsPostes}
            setAffectationsPostes={setAffectationsPostes}
            activitesPersonnalisees={activitesPersonnalisees}
            setActivitesPersonnalisees={setActivitesPersonnalisees}
            employes={employes}
            competences={competences}
            disponibilites={disponibilites}
            parametres={parametres}
            couleursActivites={couleursActivites}
            genererAffectationComplete={genererAffectationComplete}
            calculerEcarts={calculerEcarts}
            analyserDisponibilites={analyserDisponibilites}
            obtenirEmployesDisponibles={obtenirEmployesDisponibles}
            modifierAffectation={modifierAffectation}
            nouvelleActivite={nouvelleActivite}
            setNouvelleActivite={setNouvelleActivite}
            ajouterActivitePersonnalisee={ajouterActivitePersonnalisee}
            supprimerActivitePersonnalisee={supprimerActivitePersonnalisee}
            sauvegarderPlanification={sauvegarderPlanification}
            planifications={planifications}
            setPlanifications={setPlanifications}
          />
        );
      case "sous-activites":
        return (
          <SousActivitesTab
            dimensionnementGenere={dimensionnementGenere}
            dateAffectation={dateAffectation}
            volumeAffectation={volumeAffectation}
            setActiveTab={setActiveTab}
            affectationsPostes={affectationsPostes}
            parametres={parametres}
            getActivitePrincipale={getActivitePrincipale}
            employes={employes}
            couleursActivites={couleursActivites}
            setDimensionnementGenere={setDimensionnementGenere}
            sauvegarderPlanification={sauvegarderPlanification}
            activitesPersonnalisees={activitesPersonnalisees}
            planifications={planifications}
            setPlanifications={setPlanifications}
          />
        );
      case "planning-final":
        return (
          <PlanningFinalTab
            dimensionnementGenere={dimensionnementGenere}
            dateAffectation={dateAffectation}
            volumeAffectation={volumeAffectation}
            affectationsPostes={affectationsPostes}
            employes={employes}
            disponibilites={disponibilites}
            parametres={parametres}
            couleursActivites={couleursActivites}
            setActiveTab={setActiveTab}
          />
        );
      case "revue":
        return (
          <RevueTab
            datesDispo={datesDispo}
            grouperParSemaines={grouperParSemaines}
            getJourSemaine={getJourSemaine}
            isWeekend={isWeekend}
            previsionsProcessed={previsionsProcessed}
            planifications={planifications}
            programmes={programmes}
            calculerProductivite={calculerProductivite}
            calculerNombreEmployesEquivalents={calculerNombreEmployesEquivalents}
            calculerProductivitePrevisionnelle={calculerProductivitePrevisionnelle}
            setDateAffectation={setDateAffectation}
            setVolumeAffectation={setVolumeAffectation}
            setDimensionnementGenere={setDimensionnementGenere}
            setAffectationsPostes={setAffectationsPostes}
            setActivitesPersonnalisees={setActivitesPersonnalisees}
            setActiveTab={setActiveTab}
            disponibilites={disponibilites}
            employes={employes}
            parametres={parametres}
          />
        );
      default:
        if (estAdmin) {
          return renderParametresTab();
        } else {
          return (
            <CompetencesTab
              parametres={parametres}
              couleursActivites={couleursActivites}
              employes={employes}
              supprimerEmploye={supprimerEmploye}
              competences={competences}
              updateCompetence={updateCompetence}
              nouvelEmployeNom={nouvelEmployeNom}
              setNouvelEmployeNom={setNouvelEmployeNom}
              ajouterEmploye={ajouterEmploye}
              donneesGraphiqueCompetences={donneesGraphiqueCompetences}
              activites={activites}
            />
          );
        }
    }
  };

  // Rendu du composant
  return (
    <div className="p-4 max-w-6xl mx-auto bg-gradient-to-b from-green-50 to-green-100 min-h-screen">
      <Notification
        message={notification.message}
        type={notification.type}
        visible={notification.visible}
        onClose={fermerNotification}
      />
      {!estConnecte ? (
        // Écran de connexion
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold" style={{ color: "#007F61" }}>PHOENIX</h1>
              <h2 className="text-xl font-medium text-gray-600">Logistique Houdeng</h2>
              <p className="text-gray-500 mt-2">Application de planification</p>
            </div>
            
            {erreurConnexion && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {erreurConnexion}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Identifiant</label>
                <input 
                  type="text"
                  className="w-full p-2 border rounded"
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe</label>
                <input 
                  type="password"
                  className="w-full p-2 border rounded"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                />
              </div>
              <button 
                className="w-full py-2 text-white rounded hover:bg-opacity-90"
                style={{ backgroundColor: "#007F61" }}
                onClick={seConnecter}
              >
                Se connecter
              </button>
              
              <div className="text-center mt-4">
                <p className="text-gray-500 mb-2">ou</p>
                <button 
                  className="w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  onClick={() => {
                    setEstConnecte(true);
                    setEstAdmin(false);
                  }}
                >
                  Accéder en mode standard (sans connexion)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Application principale
        <>
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 shadow-sm p-4 rounded-lg">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#007F61" }}>Phoenix Logistique - Houdeng</h1>
              <p className="text-sm text-gray-600">Application de Planification</p>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Connecté en tant que: <strong>{estAdmin ? "Administrateur" : "Utilisateur"}</strong></span>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={seDeconnecter}
              >
                Déconnexion
              </button>
            </div>
          </div>
          
          {renderTabHeader()}
          
          {renderActiveTab()}
        </>
      )}
    </div>
  );
};

export default LogistiqueApp;
