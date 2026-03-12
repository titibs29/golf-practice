import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  BookOpen, 
  LineChart, 
  Plus, 
  ChevronRight, 
  Sparkles,
  RefreshCw,
  History,
  ShoppingBag,
  Settings2,
  Trash2,
  Compass,
  Zap,
  ArrowUp,
  Filter,
  Edit2,
  X,
  Check,
  Thermometer,
  Wind,
  ArrowLeftRight,
  AlertTriangle,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { DistanceEntry, ClubStat, Exercise, Club } from './types';
import { EXERCISES, CLUB_TYPES, BRANDS, POPULAR_MODELS, SHOT_DIRECTIONS, HIT_POINTS, TRAJECTORIES, CLUB_COLORS } from './constants';
import { getGolfAdvice } from './services/geminiService';
import { RangeVisualization } from './components/RangeVisualization';
import { Geolocation } from '@capacitor/geolocation';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// Simple translation function
const isFrench = typeof navigator !== 'undefined' && navigator.language.startsWith('fr');
const t = (text: string) => {
  if (!isFrench) return text;
  const frDict: Record<string, string> = {
    // Navigation & General
    "Dashboard": "Tableau de bord",
    "Stats": "Stats",
    "Shots": "Coups",
    "Bag": "Sac",
    "Log": "Historique",
    "Coach": "Coach",
    "Drills": "Exercices",
    "AI Coach": "Coach IA",
    "Practice Drills": "Exercices d'entraînement",
    "Settings": "Réglages",
    "Dark Mode": "Mode Sombre",
    "Language": "Langue",
    "French": "Français",
    "English": "Anglais",
    "Cancel": "Annuler",
    "Save": "Enregistrer",
    "Delete": "Supprimer",
    "Edit": "Modifier",
    "Close": "Fermer",
    "Confirm": "Confirmer",
    "Are you sure?": "Êtes-vous sûr ?",
    "This action cannot be undone.": "Cette action est irréversible.",
    "Local": "Local",
    "Offline": "Hors ligne",
    "No Connection": "Pas de connexion",
    "You are currently offline and no local AI model is installed. Please connect to the internet to use the Cloud AI or to download a local model.": "Vous êtes hors ligne et aucun modèle IA local n'est installé. Connectez-vous à Internet pour utiliser l'IA Cloud ou télécharger un modèle local.",
    "AI Model Settings": "Paramètres du modèle IA",
    "Local AI ensures privacy and offline use. Cloud AI offers enhanced speed and precision.": "L'IA locale garantit la confidentialité et l'utilisation hors ligne.\nL'IA Cloud offre une vitesse et une précision accrues.",
    "Processing Mode": "Mode de traitement",
    "Cloud AI": "IA Cloud",
    "Local AI": "IA Locale",
    "Select Local Model": "Sélectionner un modèle local",
    "Add Drill": "Ajouter un exercice",
    "Create Custom Drill": "Créer un exercice personnalisé",
    "Title": "Titre",
    "Description": "Description",
    "Category": "Catégorie",
    "Difficulty": "Difficulté",
    "Putting": "Putting",
    "Chipping": "Chipping",
    "Iron": "Fers",
    "Driver": "Driver",
    "Mental": "Mental",
    "Beginner": "Débutant",
    "Intermediate": "Intermédiaire",
    "Advanced": "Avancé",
    "Mark as Completed": "Marquer comme terminé",
    "My Bag": "Mon Sac",
    "Add Club": "Ajouter un club",
    "Recent Shots": "Coups Récents",
    "Log Shot": "Enregistrer un tir",
    "Distance": "Distance",
    "Club": "Club",
    "Direction": "Direction",
    "Hit Point": "Point d'impact",
    "Trajectory": "Trajectoire",
    "Wind": "Vent",
    "Temperature": "Température",
    "Notes": "Notes",
    "Save Shot": "Enregistrer le tir",
    "Update Shot": "Mettre à jour le tir",
    "Brand": "Marque",
    "Model": "Modèle",
    "Shaft": "Manche",
    "Grip": "Grip",
    "Color": "Couleur",
    "In Bag": "Dans le sac",
    "Out of Bag": "Hors du sac",
    "All Clubs": "Tous les clubs",
    "All": "Tous",
    "Avg": "Moy",
    "Max": "Max",
    "shots": "coups",
    "shot": "coup",
    "No shots logged yet.": "Aucun coup enregistré pour le moment.",
    "No shots found for this filter.": "Aucun coup trouvé pour ce filtre.",
    "Bag is full (14 clubs max)": "Le sac est plein (14 clubs max)",
    "Are you sure you want to delete this club?": "Êtes-vous sûr de vouloir supprimer ce club ?",
    "Delete Club": "Supprimer le club",
    "Other": "Autre",
    "Custom Type": "Type personnalisé",
    "Custom Brand": "Marque personnalisée",
    "Custom Model": "Modèle personnalisé",
    "Local Assistant Setup": "Configuration de l'assistant local",
    "Checking for installed models (Google Edge AI Gallery)...": "Vérification des modèles installés (Google Edge AI Gallery)...",
    "We found existing models on your device. Please select one to use:": "Nous avons trouvé des modèles existants sur votre appareil. Veuillez en sélectionner un :",
    "Source:": "Source :",
    "Use Selected Model": "Utiliser le modèle sélectionné",
    "None of these? Download a new model": "Aucun de ceux-ci ? Télécharger un nouveau modèle",
    "Verifying model availability and free license...": "Vérification de la disponibilité du modèle et de la licence gratuite...",
    "No existing models found. To run the AI Coach locally on your device for complete privacy and offline access, you need to download a small Gemma model (approx. 800MB).": "Aucun modèle existant trouvé. Pour exécuter le Coach IA localement sur votre appareil pour une confidentialité totale et un accès hors ligne, vous devez télécharger un petit modèle Gemma (environ 800 Mo).",
    "Verified free and available to download.": "Vérifié gratuit et disponible au téléchargement.",
    "Downloading": "Téléchargement",
    "Download Model (<1GB)": "Télécharger le modèle (<1Go)",
    "Analyzing your swing data...": "Analyse de vos données de swing...",
    "Local Gemma model is analyzing your swing data...": "Le modèle Gemma local analyse vos données de swing...",
    "Keep practicing! Consistency is key. We couldn't analyze your data right now.": "Continuez à vous entraîner ! La régularité est la clé. Nous n'avons pas pu analyser vos données pour le moment.",
    "Focus on Tempo": "Concentrez-vous sur le tempo",
    "Maintain a smooth 3:1 backswing to downswing ratio.": "Maintenez un rapport de 3:1 entre la montée et la descente.",
    "Metronome Drill": "Exercice du métronome",
    
    // Dashboard / Stats
    "Range Visualization": "Visualisation du Practice",
    "Carry Distance Map": "Carte des Portées (Carry)",
    "Bag Visualization": "Visualisation du Sac",
    "Clubs in Bag": "Clubs dans le Sac",
    "Total Shots": "Coups Totaux",
    "Avg Distance": "Distance Moy.",
    "Max Distance": "Distance Max",
    "Club Stats": "Stats par Club",
    "Start hitting balls to see your stats!": "Commencez à taper des balles pour voir vos stats !",
    "Best Club": "Meilleur Club",
    "Accuracy %": "Précision %",
    "Club Averages": "Moyennes par Club",
    
    // Logging Shots
    "Log New Shot": "Enregistrer un Coup",
    "Select Club": "Choisir un Club",
    "Distance (m)": "Distance (m)",
    "Distance (y)": "Distance (y)",
    "Distance (m/y)": "Distance (m/y)",
    "Temp": "Temp.",
    "Custom Club Name": "Nom du Club Personnalisé",
    "Accuracy": "Précision",
    
    // Club Management
    "Edit Club": "Modifier le club",
    "Club Type": "Type de Club",
    "Custom Name (Optional)": "Nom Personnalisé (Optionnel)",
    "Nickname for your club": "Surnom pour votre club",
    "Advanced Options": "Options Avancées",
    "Show Advanced Options": "Afficher les options avancées",
    "Hide Advanced Options": "Masquer les options avancées",
    "In Stock": "En Réserve",
    "Clubs in Stock": "Clubs en Réserve",
    "Move to Bag": "Mettre dans le Sac",
    "Remove from Bag": "Retirer du Sac",
    "Move to Stock": "Mettre en Réserve",
    "Select Model": "Choisir le Modèle",
    "Bag is Full": "Le Sac est Plein",
    "Save Changes": "Enregistrer les Changements",
    "Add to Bag": "Ajouter au Sac",
    "Club Color": "Couleur du club",
    "Type": "Type",
    "e.g. My Lucky 7-Iron": "ex: Mon 7 de la chance",
    
    // AI Coach
    "AI Golf Coach": "Coach de Golf IA",
    "Get Advice": "Obtenir un Conseil",
    "Thinking...": "Réflexion...",
    "Drills for You": "Exercices pour Vous",
    "AI Advice": "Conseils de l'IA",
    "Local Model": "Modèle Local",
    "Cloud Model": "Modèle Cloud",
    "Verify Model": "Vérifier le Modèle",
    "Model Verified": "Modèle Vérifié",
    "Model Not Found": "Modèle Non Trouvé",
    "Assessment": "Évaluation",
    "Recommended Drills": "Exercices recommandés",
    "Personalized Coaching": "Coaching personnalisé",
    "Get custom drills and advice based on your distance gaps and consistency.": "Obtenez des exercices et des conseils personnalisés basés sur vos écarts de distance et votre régularité.",
    "Log some shots first": "Enregistrez quelques coups d'abord",
    "Generate Advice": "Générer des conseils",
    "Analyze My Game": "Analyser mon jeu",
    "Analyzing...": "Analyse en cours...",
    "Local AI Analysis": "Analyse IA Locale",
    "Select AI Model": "Sélectionner le modèle IA",
    
    // Golf Jargon - Club Types
    "3 Wood": "Bois 3",
    "5 Wood": "Bois 5",
    "7 Wood": "Bois 7",
    "4 Hybrid": "Hybride 4",
    "5 Hybrid": "Hybride 5",
    "3 Iron": "Fer 3",
    "4 Iron": "Fer 4",
    "5 Iron": "Fer 5",
    "6 Iron": "Fer 6",
    "7 Iron": "Fer 7",
    "8 Iron": "Fer 8",
    "9 Iron": "Fer 9",
    "PW": "Pitching Wedge",
    "GW": "Gap Wedge",
    "SW": "Sand Wedge",
    "LW": "Lob Wedge",
    "Putter": "Putter",
    "Wedge": "Wedge",
    "Hybrid": "Hybride",
    "Wood": "Bois",
    
    // Golf Jargon - Shot Data
    "Far Left": "Grand Hook",
    "Left": "Draw / Gauche",
    "Center": "Centre",
    "Right": "Fade / Droite",
    "Far Right": "Grand Slice",
    "Top": "Top",
    "Fat": "Gratte",
    "Thin": "Balle Fine",
    "Toe": "Pointe",
    "Heel": "Talon",
    "High": "Haute",
    "Mid": "Moyenne",
    "Low": "Basse",
    "No Wind": "Pas de Vent",
    "Light": "Léger",
    "Moderate": "Modéré",
    "Strong": "Fort",
    "Headwind": "Vent de Face",
    "Tailwind": "Vent de Dos",
    "Crosswind": "Vent de Côté",
    "Straight": "Droit",
    "Draw": "Draw",
    "Fade": "Fade",
    "Hook": "Hook",
    "Slice": "Slice",
    
    // History / Navigation
    "Shot History": "Historique des Coups",
    "Filter by Club": "Filtrer par Club",
    "Date": "Date",
    "Select a Club": "Choisir un Club",
    "Your Bag": "Votre Sac",
    "Standard Clubs": "Clubs Standards",
    "Custom Name": "Nom Personnalisé",
    "Toptracer Sync": "Synchro Toptracer",
    "You can also sync your session data directly from Toptracer enabled ranges.": "Vous pouvez également synchroniser vos données directement depuis les practices équipés Toptracer.",
    "Sync Now": "Synchroniser",
    "Sync with Toptracer": "Synchroniser avec Toptracer",
    "All Brands": "Toutes les Marques",
    "Driving": "Driving",
    "Irons": "Fers",
    "Fitness": "Fitness",
    "Clubs Tracked": "Clubs Suivis",
    "recorded": "enregistrés",
    "Avg Carry": "Portée Moy.",
    "No data yet. Start logging your shots!": "Pas encore de données. Commencez à enregistrer vos coups !",
    "Syncing...": "Synchronisation...",
    "In the Bag": "Dans le Sac",
    "Your bag is full, first remove a club": "Votre sac est plein, retirez d'abord un club",
    "Add a Club": "Ajouter un Club",
    "Select Type": "Choisir le Type",
    "Enter type": "Entrer le type",
    "Select Brand": "Choisir la Marque",
    "Enter brand": "Entrer la marque",
    "Enter model": "Entrer le modèle",
    "Hide": "Masquer",
    "Show": "Afficher",
    "Any specific details...": "Détails spécifiques...",
    "Your bag is empty. Add your clubs to track performance accurately.": "Votre sac est vide. Ajoutez vos clubs pour suivre vos performances avec précision.",
    
    // Header / Settings
    "Your Digital Caddy": "Votre Caddy Digital",
    "Toggle app theme": "Changer le thème de l'application",
    "e.g. 2 Iron, Mini Driver...": "ex: Fer 2, Mini Driver...",
    "e.g. 135": "ex: 135",
    "Are you sure you want to delete this shot?": "Êtes-vous sûr de vouloir supprimer ce coup ?",
    "Golf Pro Practice": "Golf Pro Practice"
  };
  return frDict[text] || text;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [distances, setDistances] = useState<DistanceEntry[]>([]);
  const [stats, setStats] = useState<ClubStat[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [weather, setWeather] = useState<{ temp: number, wind: number } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [useLocalLLM, setUseLocalLLM] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [clubFilter, setClubFilter] = useState('All');
  const [logClubSelection, setLogClubSelection] = useState('');
  const [customLogClubName, setCustomLogClubName] = useState('');
  const [editingShot, setEditingShot] = useState<DistanceEntry | null>(null);
  const [showDrillForm, setShowDrillForm] = useState(false);
  const [newDrill, setNewDrill] = useState({ title: '', description: '', category: 'Iron', difficulty: 'Beginner' });
  const [drills, setDrills] = useState<Exercise[]>(EXERCISES);
  const [showAISettings, setShowAISettings] = useState(false);
  const [isVerifyingDownload, setIsVerifyingDownload] = useState(false);
  const [downloadVerified, setDownloadVerified] = useState(false);
  const [isCheckingModels, setIsCheckingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isDownloadingModel, setIsDownloadingModel] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [localModelInstalled, setLocalModelInstalled] = useState(false);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('golf-practice-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [bagFilter, setBagFilter] = useState('All');
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [customName, setCustomName] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [customType, setCustomType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10B981');
  const [shaft, setShaft] = useState('');
  const [grip, setGrip] = useState('');
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bagFullError, setBagFullError] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchData();
    fetchWeather();
    
    if (Capacitor.isNativePlatform()) {
      Geolocation.requestPermissions().catch(err => console.error("Permission request failed", err));
    }
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setUseLocalLLM(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('golf-practice-dark-mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchWeather = async () => {
    try {
      let position;
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
          await Geolocation.requestPermissions();
        }
        position = await Geolocation.getCurrentPosition();
      } else {
        position = await new Promise<any>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      }

      const { latitude, longitude } = position.coords;
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`);
      const data = await res.json();
      if (data.current) {
        setWeather({
          temp: data.current.temperature_2m,
          wind: data.current.wind_speed_10m
        });
      }
    } catch (err) {
      console.error("Failed to fetch weather or location", err);
    }
  };

  const fetchData = async () => {
    try {
      const [distRes, statsRes, clubsRes] = await Promise.all([
        fetch('/api/distances'),
        fetch('/api/stats'),
        fetch('/api/clubs')
      ]);
      const distData = await distRes.json();
      const statsData = await statsRes.json();
      const clubsData = await clubsRes.json();
      setDistances(distData);
      setStats(statsData.map((s: any) => ({ ...s, in_bag: !!s.in_bag })));
      setClubs(clubsData.map((c: any) => ({ ...c, in_bag: !!c.in_bag })));
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleAddClub = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const clubName = selectedType === 'Other' ? customType : selectedType;
    const clubBrand = selectedBrand === 'Other' ? customBrand : selectedBrand;
    const clubModel = (selectedBrand === 'Other' || selectedModel === 'Other') ? customModel : selectedModel;

    if (!clubName || !clubBrand || !clubModel) {
      alert("Please fill in all required fields");
      return;
    }

    const clubData = {
      name: clubName,
      custom_name: customName || undefined,
      brand: clubBrand,
      model: clubModel,
      shaft,
      grip,
      notes,
      color: selectedColor,
      in_bag: editingClub ? (editingClub.in_bag ? 1 : 0) : (clubs.filter(c => c.in_bag).length < 14 ? 1 : 0)
    };

    try {
      if (editingClub) {
        await fetch(`/api/clubs/${editingClub.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clubData)
        });
      } else {
        await fetch('/api/clubs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clubData)
        });
      }
      fetchData();
      (e.target as HTMLFormElement).reset();
      setShowAdvanced(false);
      setEditingClub(null);
      setSelectedType('');
      setSelectedBrand('');
      setSelectedModel('');
      setCustomType('');
      setCustomBrand('');
      setCustomModel('');
      setShaft('');
      setGrip('');
      setNotes('');
      setSelectedColor('#10B981');
    } catch (err) {
      console.error("Failed to save club", err);
    }
  };

  const handleToggleBag = async (club: Club) => {
    const inBagCount = clubs.filter(c => c.in_bag).length;
    if (!club.in_bag && inBagCount >= 14) {
      setBagFullError(true);
      setTimeout(() => setBagFullError(false), 3000);
      return;
    }

    try {
      await fetch(`/api/clubs/${club.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...club, in_bag: !club.in_bag ? 1 : 0 })
      });
      fetchData();
    } catch (err) {
      console.error("Failed to toggle bag status", err);
    }
  };

  const handleEditClub = (club: Club) => {
    setEditingClub(club);
    setCustomName(club.custom_name || '');
    setSelectedType(CLUB_TYPES.includes(club.name) ? club.name : 'Other');
    setCustomType(CLUB_TYPES.includes(club.name) ? '' : club.name);
    setSelectedBrand(BRANDS.includes(club.brand) ? club.brand : 'Other');
    setCustomBrand(BRANDS.includes(club.brand) ? '' : club.brand);
    
    const models = POPULAR_MODELS[club.brand] || [];
    setSelectedModel(models.includes(club.model) ? club.model : 'Other');
    setCustomModel(models.includes(club.model) ? '' : club.model);
    
    setSelectedColor(club.color);
    setShaft(club.shaft || '');
    setGrip(club.grip || '');
    setNotes(club.notes || '');
    setShowAdvanced(!!(club.shaft || club.grip || club.notes));
    
    // Switch to bag tab if not already there
    setActiveTab('bag');
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReorderClubs = async (newInBagOrder: Club[]) => {
    // Keep the clubs that are NOT in the bag in their positions (or just at the end)
    const notInBag = clubs.filter(c => !c.in_bag);
    const updatedClubs = [...newInBagOrder, ...notInBag];
    setClubs(updatedClubs);

    try {
      await fetch('/api/clubs/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubIds: updatedClubs.map(c => c.id) })
      });
    } catch (err) {
      console.error("Failed to sync reorder", err);
    }
  };

  const handleDeleteClub = async (id: number) => {
    try {
      await fetch(`/api/clubs/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error("Failed to delete club", err);
    }
  };

  const handleLogDistance = async (formData: FormData) => {
    let club = formData.get('club') as string;
    if (club === 'Other') {
      club = customLogClubName;
    }
    const distance = Number(formData.get('distance'));
    const direction = formData.get('direction') as string;
    const hit_point = formData.get('hit_point') as string;
    const trajectory = formData.get('trajectory') as string;
    const wind = formData.get('wind') as string;
    const temperature = Number(formData.get('temperature')) || null;

    try {
      await fetch('/api/distances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ club, distance, direction, hit_point, trajectory, wind, temperature })
      });
      fetchData();
      setActiveTab('dashboard');
    } catch (err) {
      console.error("Failed to log distance", err);
    }
  };

  const handleUpdateDistance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingShot) return;
    const formData = new FormData(e.currentTarget);
    const updatedData = {
      club: formData.get('club'),
      distance: Number(formData.get('distance')),
      direction: formData.get('direction'),
      hit_point: formData.get('hit_point'),
      trajectory: formData.get('trajectory'),
    };

    try {
      await fetch(`/api/distances/${editingShot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      setEditingShot(null);
      fetchData();
    } catch (err) {
      console.error("Failed to update distance", err);
    }
  };

  const handleDeleteDistance = async (id: number) => {
    if (!confirm(t("Are you sure you want to delete this shot?"))) return;
    try {
      await fetch(`/api/distances/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error("Failed to delete distance", err);
    }
  };

  const handleCreateDrill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrill.title || !newDrill.description) return;
    
    const drill: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      title: newDrill.title,
      description: newDrill.description,
      category: newDrill.category as any,
      difficulty: newDrill.difficulty as any
    };
    
    setDrills([drill, ...drills]);
    setShowDrillForm(false);
    setNewDrill({ title: '', description: '', category: 'Iron', difficulty: 'Beginner' });
  };

  const handleDeleteDrill = (id: string) => {
    setDrills(drills.filter(d => d.id !== id));
  };

  const filteredDistances = clubFilter === 'All' 
    ? distances 
    : distances.filter(d => d.club === clubFilter);

  const handleSyncToptracer = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // Mock sync: add some random data
      const mockClubs = ['7 Iron', 'Driver', 'PW'];
      const club = mockClubs[Math.floor(Math.random() * mockClubs.length)];
      const dist = Math.floor(Math.random() * 100) + 100;
      const formData = new FormData();
      formData.append('club', club);
      formData.append('distance', dist.toString());
      formData.append('direction', 'Center');
      formData.append('hit_point', 'Center');
      formData.append('trajectory', 'Mid');
      handleLogDistance(formData);
    }, 2000);
  };

  const verifyDownloadAvailability = async () => {
    setIsVerifyingDownload(true);
    // Check if online and has enough space (simulated space check but real network check)
    if (navigator.onLine) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsVerifyingDownload(false);
      setDownloadVerified(true);
    } else {
      setIsVerifyingDownload(false);
      setDownloadVerified(false);
      alert(t('Please connect to the internet to verify model availability.'));
    }
  };

  const checkLocalModels = async () => {
    setIsCheckingModels(true);
    setAvailableModels([]);
    setDownloadVerified(false);
    
    try {
      const foundModels: any[] = [];
      
      if (Capacitor.isNativePlatform()) {
        // Scan app documents directory for model files
        const result = await Filesystem.readdir({
          path: '',
          directory: Directory.Documents
        });
        
        result.files.forEach(file => {
          if (file.name.endsWith('.bin') || file.name.endsWith('.gguf')) {
            foundModels.push({
              id: file.uri,
              name: file.name,
              source: 'Local Storage'
            });
          }
        });
      }
      
      // Also check for window.ai (Chrome/Android built-in AI)
      if (typeof (window as any).ai !== 'undefined') {
        foundModels.push({
          id: 'window-ai',
          name: 'Gemini Nano (Built-in)',
          source: 'System'
        });
      }

      setIsCheckingModels(false);
      
      if (foundModels.length > 0) {
        setAvailableModels(foundModels);
        setSelectedModelId(foundModels[0].id);
        setLocalModelInstalled(true);
      } else {
        // If no models found, we'll show the download option or manual select
        setDownloadVerified(true);
      }
    } catch (error) {
      console.error("Error scanning for models:", error);
      setIsCheckingModels(false);
      setDownloadVerified(true);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAvailableModels(prev => [
      ...prev,
      { id: file.name, name: file.name, source: 'User Selected' }
    ]);
    setSelectedModelId(file.name);
    setLocalModelInstalled(true);
  };

  const handleDownloadModel = () => {
    setIsDownloadingModel(true);
    setDownloadProgress(0);
    
    // In a real app, this would use Filesystem.downloadFile
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDownloadingModel(false);
            setLocalModelInstalled(true);
            setAvailableModels(prevModels => [
              ...prevModels,
              { id: 'gemma-2b-local', name: 'Gemma 2B (Downloaded)', source: 'Local Storage' }
            ]);
            setSelectedModelId('gemma-2b-local');
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const generateAdvice = async () => {
    setIsLoadingAdvice(true);
    const advice = await getGolfAdvice(stats, distances, useLocalLLM, selectedModelId || undefined);
    setAiAdvice(advice);
    setIsLoadingAdvice(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-900 text-[#1A1A1A] dark:text-gray-100 font-sans pb-24 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-black/5 dark:border-white/10 px-6 py-4 sticky top-0 z-10 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight dark:text-white">{t('Golf Pro Practice')}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{t('Your Digital Caddy')}</p>
          </div>
          {weather && (
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-black/5">
              <div className="flex items-center gap-1 text-rose-500">
                <Thermometer size={14} />
                <span className="text-xs font-bold">{Math.round(weather.temp)}°C</span>
              </div>
              <div className="flex items-center gap-1 text-blue-500">
                <Wind size={14} />
                <span className="text-xs font-bold">{Math.round(weather.wind)} km/h</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {weather && (
            <div className="flex sm:hidden items-center gap-2 mr-2">
              <div className="flex items-center gap-0.5 text-rose-500">
                <Thermometer size={12} />
                <span className="text-[10px] font-bold">{Math.round(weather.temp)}°</span>
              </div>
              <div className="flex items-center gap-0.5 text-blue-500">
                <Wind size={12} />
                <span className="text-[10px] font-bold">{Math.round(weather.wind)}</span>
              </div>
            </div>
          )}
          <button 
            onClick={handleSyncToptracer}
            disabled={isSyncing}
            className={`p-2 rounded-full transition-all ${isSyncing ? 'bg-emerald-100 text-emerald-600 animate-spin' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full transition-all bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Settings2 size={20} />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-black/5 dark:border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">{t('Settings')}</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-black/5 dark:border-white/5">
                  <div>
                    <p className="font-bold dark:text-white">{t('Dark Mode')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('Toggle app theme')}</p>
                  </div>
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="p-6 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{t('Total Shots')}</p>
                  <p className="text-2xl font-bold">{distances.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{t('Clubs Tracked')}</p>
                  <p className="text-2xl font-bold">{stats.length}</p>
                </div>
              </div>

              {/* Club Averages */}
              <section>
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-lg font-bold">{t('Club Averages')}</h2>
                  <button onClick={() => { setActiveTab('shots'); setShowLogForm(true); }} className="text-emerald-600 text-sm font-semibold flex items-center gap-1">
                    <Plus size={16} /> {t('Add New')}
                  </button>
                </div>

                {stats.length > 0 && (
                  <div className="mb-6">
                    <RangeVisualization stats={stats} distances={distances} t={t} />
                  </div>
                )}

                <div className="space-y-3">
                  {stats.length > 0 ? stats.map((stat) => (
                    <div key={stat.club} className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{stat.club}</p>
                        <p className="text-xs text-gray-400">{stat.count} {stat.count > 1 ? t('shots') : t('shot')} {t('recorded')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">{Math.round(stat.avg_distance)}m</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{t('Avg Carry')}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                      <p className="text-gray-400 text-sm">{t('No data yet. Start logging your shots!')}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Recent History */}
              {distances.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold mb-4">{t('Recent Shots')}</h2>
                  <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                    {distances.slice(0, 5).map((d, i) => (
                      <div key={d.id} className={`p-4 flex justify-between items-center ${i !== 4 ? 'border-b border-black/5' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                            <History size={16} />
                          </div>
                          <div>
                            <p className="font-medium">{d.club}</p>
                            <div className="flex gap-2 mt-0.5">
                              {d.direction && <span className="text-[10px] text-gray-400 font-bold uppercase">{d.direction}</span>}
                              {d.hit_point && <span className="text-[10px] text-gray-400 font-bold uppercase">• {d.hit_point}</span>}
                            </div>
                          </div>
                        </div>
                        <p className="font-bold">{d.distance}m</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          )}

          {activeTab === 'shots' && (
            <motion.div 
              key="shots"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('Shots')}</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowLogForm(!showLogForm)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      showLogForm 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    }`}
                  >
                    {showLogForm ? <X size={16} /> : <Plus size={16} />}
                    {showLogForm ? t('Close') : t('Log Shot')}
                  </button>
                  <div className="relative">
                    <select 
                      value={clubFilter}
                      onChange={(e) => setClubFilter(e.target.value)}
                      className="bg-white border border-black/10 rounded-xl px-3 py-2 text-sm font-medium outline-none appearance-none pr-8"
                    >
                      <option value="All">{t('All Clubs')}</option>
                      {Array.from(new Set(distances.map(d => d.club))).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <Filter size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showLogForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-6 mb-6">
                      <h3 className="font-bold flex items-center gap-2">
                        <Plus size={18} className="text-emerald-600" /> {t('Log New Shot')}
                      </h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleLogDistance(new FormData(e.currentTarget));
                        setShowLogForm(false);
                      }} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('Select Club')}</label>
                          <select 
                            name="club"
                            value={logClubSelection}
                            onChange={(e) => setLogClubSelection(e.target.value)}
                            className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          >
                            <option value="">{t('Select a Club')}</option>
                            {clubs.length > 0 && (
                              <optgroup label={t('Your Bag')}>
                                {clubs.map(c => <option key={c.id} value={c.name}>{c.custom_name || t(c.name)} ({c.brand})</option>)}
                              </optgroup>
                            )}
                            <optgroup label={t('Standard Clubs')}>
                              {CLUB_TYPES.map(t_type => <option key={t_type} value={t_type}>{t(t_type)}</option>)}
                            </optgroup>
                            <option value="Other">{t('Other')} ({t('Custom Name')})...</option>
                          </select>
                          
                          {logClubSelection === 'Other' && (
                            <div className="mt-3">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('Custom Club Name')}</label>
                              <input 
                                value={customLogClubName}
                                onChange={(e) => setCustomLogClubName(e.target.value)}
                                placeholder={t("e.g. 2 Iron, Mini Driver...")}
                                className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('Distance (m)')}</label>
                            <input 
                              name="distance" 
                              type="number" 
                              placeholder={t("e.g. 135")}
                              required
                              className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('Trajectory')}</label>
                            <select name="trajectory" className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                              {TRAJECTORIES.map(t_traj => <option key={t_traj} value={t_traj}>{t(t_traj)}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                              <Compass size={12} /> {t('Direction')}
                            </label>
                            <select name="direction" className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                              {SHOT_DIRECTIONS.map(d => <option key={d} value={d}>{t(d)}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                              <Zap size={12} /> {t('Hit Point')}
                            </label>
                            <select name="hit_point" className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                              {HIT_POINTS.map(h => <option key={h} value={h}>{t(h)}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('Wind')} (km/h)</label>
                            <input 
                              name="wind" 
                              type="text" 
                              placeholder="e.g. 10km/h N"
                              className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('Temp')} (°C)</label>
                            <input 
                              name="temperature" 
                              type="number" 
                              placeholder="e.g. 22"
                              className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                          <Plus size={20} /> {t('Save Shot')}
                        </button>
                      </form>

                      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-2 text-emerald-700 mb-2">
                          <RefreshCw size={18} />
                          <p className="font-bold">{t('Toptracer Sync')}</p>
                        </div>
                        <p className="text-sm text-emerald-600 mb-4">{t('You can also sync your session data directly from Toptracer enabled ranges.')}</p>
                        <button 
                          onClick={handleSyncToptracer}
                          className="bg-white text-emerald-600 font-bold px-4 py-2 rounded-lg text-sm border border-emerald-200"
                        >
                          {isSyncing ? t('Syncing...') : t('Sync Now')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                {filteredDistances.length > 0 ? filteredDistances.map((d) => (
                  <div key={d.id} className="bg-white p-4 rounded-2xl shadow-sm border border-black/5">
                    {editingShot?.id === d.id ? (
                      <form onSubmit={handleUpdateDistance} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <select name="club" defaultValue={d.club} className="bg-gray-50 border border-black/5 rounded-lg p-2 text-sm">
                            {CLUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <input name="distance" type="number" defaultValue={d.distance} className="bg-gray-50 border border-black/5 rounded-lg p-2 text-sm" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <select name="direction" defaultValue={d.direction} className="bg-gray-50 border border-black/5 rounded-lg p-2 text-xs">
                            {SHOT_DIRECTIONS.map(sd => <option key={sd} value={sd}>{sd}</option>)}
                          </select>
                          <select name="hit_point" defaultValue={d.hit_point} className="bg-gray-50 border border-black/5 rounded-lg p-2 text-xs">
                            {HIT_POINTS.map(hp => <option key={hp} value={hp}>{hp}</option>)}
                          </select>
                          <select name="trajectory" defaultValue={d.trajectory} className="bg-gray-50 border border-black/5 rounded-lg p-2 text-xs">
                            {TRAJECTORIES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                            <Check size={16} /> {t('Save')}
                          </button>
                          <button type="button" onClick={() => setEditingShot(null)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                            <X size={16} /> {t('Cancel')}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-emerald-600">
                            <ArrowUp size={20} className={d.trajectory === 'Low' ? 'rotate-45' : d.trajectory === 'High' ? '-rotate-45' : ''} />
                          </div>
                          <div>
                            <p className="font-bold">{d.club}</p>
                            <div className="flex gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-400 font-bold uppercase">{t(d.direction)}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">• {t(d.hit_point)}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">• {new Date(d.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold">{d.distance}m</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setEditingShot(d)} className="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteDistance(d.id)} className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                    <p className="text-gray-400 text-sm">{t('No shots found for this filter.')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'exercises' && (
            <motion.div 
              key="exercises"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('Practice Drills')}</h2>
                <button 
                  onClick={() => setShowDrillForm(!showDrillForm)}
                  className="p-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors"
                >
                  {showDrillForm ? <X size={20} /> : <Plus size={20} />}
                </button>
              </div>

              {showDrillForm && (
                <form onSubmit={handleCreateDrill} className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 space-y-4">
                  <h3 className="font-bold">{t('Create Custom Drill')}</h3>
                  <input 
                    type="text" 
                    placeholder={t('Title')}
                    value={newDrill.title}
                    onChange={e => setNewDrill({...newDrill, title: e.target.value})}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <textarea 
                    placeholder={t('Description')}
                    value={newDrill.description}
                    onChange={e => setNewDrill({...newDrill, description: e.target.value})}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                    required
                  />
                  <div className="flex gap-3">
                    <select 
                      value={newDrill.category}
                      onChange={e => setNewDrill({...newDrill, category: e.target.value as any})}
                      className="flex-1 bg-gray-50 border border-black/5 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {['Putting', 'Chipping', 'Iron', 'Driver', 'Mental'].map(c => <option key={c} value={c}>{t(c)}</option>)}
                    </select>
                    <select 
                      value={newDrill.difficulty}
                      onChange={e => setNewDrill({...newDrill, difficulty: e.target.value as any})}
                      className="flex-1 bg-gray-50 border border-black/5 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d} value={d}>{t(d)}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                    {t('Save')}
                  </button>
                </form>
              )}

              <div className="space-y-4">
                {drills.map((ex) => (
                  <div key={ex.id} className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 space-y-3 relative group">
                    <button 
                      onClick={() => handleDeleteDrill(ex.id)}
                      className="absolute top-4 right-4 p-2 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex justify-between items-start pr-8">
                      <span className="px-2 py-1 bg-gray-100 text-[10px] font-bold uppercase rounded text-gray-500 tracking-wider">{t(ex.category)}</span>
                      <span className={`text-[10px] font-bold uppercase ${ex.difficulty === 'Beginner' ? 'text-emerald-500' : ex.difficulty === 'Intermediate' ? 'text-amber-500' : 'text-rose-500'}`}>{t(ex.difficulty)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{ex.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{ex.description}</p>
                    </div>
                    <button className="w-full py-2 bg-gray-50 text-gray-600 text-sm font-bold rounded-lg border border-gray-100 hover:bg-gray-100 transition-all">
                      {t('Mark as Completed')}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div 
              key="ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{t('AI Coach')}</h2>
                  {useLocalLLM && localModelInstalled && (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                      <Zap size={10} /> {t('Local')}
                    </span>
                  )}
                  {!isOnline && (
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                      {t('Offline')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {(isOnline || availableModels.length > 1) && (
                    <button 
                      onClick={() => setShowAISettings(!showAISettings)}
                      className={`p-2 rounded-full transition-colors ${showAISettings ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      <Settings2 size={20} />
                    </button>
                  )}
                  <button 
                    onClick={generateAdvice}
                    disabled={isLoadingAdvice || stats.length === 0 || (!isOnline && !localModelInstalled)}
                    className="p-2 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <Sparkles size={20} />
                  </button>
                </div>
              </div>

              {!isOnline && !localModelInstalled && (
                <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl shadow-sm text-rose-700 text-sm">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertTriangle size={18} /> {t('No Connection')}
                  </div>
                  {t('You are currently offline and no local AI model is installed. Please connect to the internet to use the Cloud AI or to download a local model.')}
                </div>
              )}

              {showAISettings && (isOnline || availableModels.length > 1) && (
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 text-gray-600 rounded-lg shrink-0">
                      <Settings2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{t('AI Model Settings')}</h3>
                      <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">
                        {t('Local AI ensures privacy and offline use. Cloud AI offers enhanced speed and precision.')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2 border-t border-black/5">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{t('Processing Mode')}</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => isOnline && setUseLocalLLM(false)}
                        disabled={!isOnline}
                        className={`flex-1 py-2 px-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          !useLocalLLM 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white border-black/5 text-gray-600 hover:bg-gray-50'
                        } ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {t('Cloud AI')} {!isOnline && `(${t('Offline')})`}
                      </button>
                      <button
                        onClick={() => {
                          setUseLocalLLM(true);
                          if (!localModelInstalled && availableModels.length === 0) {
                            checkLocalModels();
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          useLocalLLM 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white border-black/5 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {t('Local AI')}
                      </button>
                    </div>
                  </div>

                  {useLocalLLM && availableModels.length > 1 && (
                    <div className="space-y-2 pt-2 border-t border-black/5">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{t('Select Local Model')}</label>
                      <select 
                        value={selectedModelId}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                        className="w-full bg-gray-50 border border-black/5 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {availableModels.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.source})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {useLocalLLM && !localModelInstalled && (
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                      <Zap size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900">{t('Local Assistant Setup')}</h3>
                      
                      {isCheckingModels ? (
                        <div className="py-4 space-y-3">
                          <div className="flex items-center gap-3 text-blue-700">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-medium">Checking for installed models (Google Edge AI Gallery)...</span>
                          </div>
                        </div>
                      ) : availableModels.length > 0 ? (
                        <div className="mt-2 space-y-4">
                          <p className="text-sm text-blue-700">
                            We found existing models on your device. Please select one to use:
                          </p>
                          <div className="space-y-2">
                            {availableModels.map(model => (
                              <label key={model.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedModelId === model.id ? 'bg-blue-100 border-blue-300' : 'bg-white border-black/5 hover:border-blue-200'}`}>
                                <input 
                                  type="radio" 
                                  name="localModel" 
                                  value={model.id}
                                  checked={selectedModelId === model.id}
                                  onChange={() => setSelectedModelId(model.id)}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                  <p className="font-bold text-sm text-gray-900">{model.name}</p>
                                  <p className="text-xs text-gray-500">Source: {model.source}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button 
                              onClick={() => setLocalModelInstalled(true)}
                              className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Use Selected Model
                            </button>
                            <button 
                              onClick={() => setUseLocalLLM(false)}
                              className="bg-blue-100 text-blue-700 text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                          <button 
                            onClick={() => {
                              setAvailableModels([]);
                              verifyDownloadAvailability();
                            }}
                            className="text-blue-600 text-xs font-bold underline mt-2"
                          >
                            None of these? Download a new model
                          </button>
                        </div>
                      ) : isVerifyingDownload ? (
                        <div className="py-4 space-y-3">
                          <div className="flex items-center gap-3 text-blue-700">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-medium">Verifying model availability and free license...</span>
                          </div>
                        </div>
                      ) : downloadVerified ? (
                        <div className="mt-2 space-y-4">
                          <p className="text-sm text-blue-700">
                            No compatible models were found automatically. You can download a recommended model or select one manually from your device.
                          </p>
                          
                          {isDownloadingModel ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-bold text-blue-800">
                                <span>Downloading Gemma 2B...</span>
                                <span>{downloadProgress}%</span>
                              </div>
                              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={handleDownloadModel}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                              >
                                Download Gemma 2B (800MB)
                              </button>
                              <label className="w-full bg-white border border-blue-200 text-blue-700 font-bold py-3 rounded-xl text-center cursor-pointer hover:bg-blue-50 transition-colors">
                                Select Model File (.bin, .gguf)
                                <input type="file" className="hidden" accept=".bin,.gguf" onChange={handleFileSelect} />
                              </label>
                              <button 
                                onClick={() => setUseLocalLLM(false)}
                                className="text-blue-600 text-xs font-bold py-2"
                              >
                                {t('Cancel')}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {isLoadingAdvice ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-black/5 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-500 font-medium">
                    {useLocalLLM && localModelInstalled ? 'Local Gemma model is analyzing your swing data...' : 'Analyzing your swing data...'}
                  </p>
                </div>
              ) : aiAdvice ? (
                <div className="space-y-6">
                  <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-xl shadow-emerald-600/20">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <Sparkles size={20} /> Assessment
                    </h3>
                    <p className="text-emerald-50 leading-relaxed">{aiAdvice.summary}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('Recommended Drills')}</h4>
                    {aiAdvice.tips.map((tip: any, i: number) => (
                      <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-black/5">
                        <h5 className="font-bold mb-1">{tip.title}</h5>
                        <p className="text-sm text-gray-500 mb-3">{tip.description}</p>
                        <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase">
                          <Target size={14} /> {tip.drill}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <Sparkles size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t('Personalized Coaching')}</h3>
                    <p className="text-sm text-gray-500 px-4">{t('Get custom drills and advice based on your distance gaps and consistency.')}</p>
                  </div>
                  <button 
                    onClick={generateAdvice}
                    disabled={stats.length === 0}
                    className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                  >
                    {stats.length === 0 ? 'Log some shots first' : 'Generate Advice'}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'bag' && (
            <motion.div 
              key="bag"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('In the Bag')}</h2>
                <div className="relative">
                  <select 
                    value={bagFilter}
                    onChange={(e) => setBagFilter(e.target.value)}
                    className="bg-white border border-black/10 rounded-xl px-3 py-2 text-sm font-medium outline-none appearance-none pr-8"
                  >
                    <option value="All">{t('All Brands')}</option>
                    {Array.from(new Set(clubs.map(c => c.brand))).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <Filter size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <AnimatePresence>
                {bagFullError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                  >
                    <Zap size={16} />
                    {t('Your bag is full, first remove a club')}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Add/Edit Club Form */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  {editingClub ? <Edit2 size={18} className="text-emerald-600" /> : <Plus size={18} className="text-emerald-600" />} 
                  {editingClub ? t('Edit Club') : t('Add a Club')}
                </h3>
                <form onSubmit={handleAddClub} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('Custom Name (Optional)')}</label>
                    <input 
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={t('Nickname for your club')}
                      className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('Club Type')}</label>
                      <select 
                        value={selectedType} 
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">{t('Select Type')}</option>
                        {CLUB_TYPES.map(t_type => <option key={t_type} value={t_type}>{t(t_type)}</option>)}
                        <option value="Other">{t('Other')}...</option>
                      </select>
                      {selectedType === 'Other' && (
                        <input 
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value)}
                          placeholder={t('Enter type')} 
                          className="mt-2 w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" 
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('Brand')}</label>
                      <select 
                        value={selectedBrand} 
                        onChange={(e) => {
                          setSelectedBrand(e.target.value);
                          setSelectedModel('');
                        }}
                        className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">{t('Select Brand')}</option>
                        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                        <option value="Other">{t('Other')}...</option>
                      </select>
                      {selectedBrand === 'Other' && (
                        <input 
                          value={customBrand}
                          onChange={(e) => setCustomBrand(e.target.value)}
                          placeholder={t('Enter brand')} 
                          className="mt-2 w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" 
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('Model')}</label>
                    {selectedBrand === 'Other' ? (
                      <input 
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        placeholder={t('Enter model')} 
                        className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" 
                      />
                    ) : (
                      <>
                        <select 
                          value={selectedModel} 
                          onChange={(e) => setSelectedModel(e.target.value)}
                          disabled={!selectedBrand}
                          className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                        >
                          <option value="">{t('Select Model')}</option>
                          {selectedBrand && POPULAR_MODELS[selectedBrand]?.map(m => <option key={m} value={m}>{m}</option>)}
                          <option value="Other">{t('Other')}...</option>
                        </select>
                        {selectedModel === 'Other' && (
                          <input 
                            value={customModel}
                            onChange={(e) => setCustomModel(e.target.value)}
                            placeholder={t('Enter model')} 
                            className="mt-2 w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" 
                          />
                        )}
                      </>
                    )}
                  </div>

                  <button 
                    type="button" 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs font-bold text-emerald-600 flex items-center gap-1"
                  >
                    <Settings2 size={14} /> {showAdvanced ? t('Hide') : t('Show')} {t('Advanced Options')}
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('Shaft')}</label>
                            <input 
                              value={shaft}
                              onChange={(e) => setShaft(e.target.value)}
                              placeholder="e.g. Dynamic Gold S300" 
                              className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('Grip')}</label>
                            <input 
                              value={grip}
                              onChange={(e) => setGrip(e.target.value)}
                              placeholder="e.g. Golf Pride MCC" 
                              className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" 
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('Notes')}</label>
                          <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t("Any specific details...")} 
                            className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 h-20" 
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t('Club Color')}</label>
                    <div className="flex flex-wrap gap-2">
                      {CLUB_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === color ? 'border-emerald-600 scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {editingClub && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingClub(null);
                          setSelectedType('');
                          setSelectedBrand('');
                          setSelectedModel('');
                          setCustomType('');
                          setCustomBrand('');
                          setCustomModel('');
                          setShaft('');
                          setGrip('');
                          setNotes('');
                          setSelectedColor('#10B981');
                        }}
                        className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
                      >
                        {t('Cancel')}
                      </button>
                    )}
                    <button type="submit" className="flex-[2] bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
                      {editingClub ? t('Save Changes') : t('Add to Bag')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Club List */}
              <div className="space-y-8">
                {/* In the Bag Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">{t('In the Bag')} ({clubs.filter(c => c.in_bag).length}/14)</h3>
                    {clubs.filter(c => c.in_bag).length >= 14 && (
                      <span className="text-[10px] text-amber-600 font-bold uppercase">{t('Bag is Full')}</span>
                    )}
                  </div>
                  
                  {clubs.filter(c => c.in_bag).length > 0 ? (
                    bagFilter === 'All' ? (
                      <Reorder.Group 
                        axis="y" 
                        values={clubs.filter(c => c.in_bag)} 
                        onReorder={handleReorderClubs}
                        className="space-y-4"
                      >
                        {clubs.filter(c => c.in_bag).map((club) => (
                          <Reorder.Item 
                            key={club.id} 
                            value={club}
                          >
                            <ClubCard 
                              club={club} 
                              onDelete={() => { setClubToDelete(club); }} 
                              onToggleBag={() => { handleToggleBag(club); }}
                              onEdit={() => { handleEditClub(club); }}
                              isDraggable={true}
                            />
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    ) : (
                      <div className="space-y-4">
                        {clubs.filter(c => c.in_bag)
                          .filter(c => c.brand === bagFilter)
                          .map((club) => (
                          <ClubCard 
                            key={club.id} 
                            club={club} 
                            onDelete={() => { setClubToDelete(club); }} 
                            onToggleBag={() => { handleToggleBag(club); }}
                            onEdit={() => { handleEditClub(club); }}
                            isDraggable={false}
                          />
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                      <p className="text-gray-400 text-sm italic">{t('No clubs in your bag yet.')}</p>
                    </div>
                  )}
                </div>

                {/* In Stock Section */}
                {clubs.filter(c => !c.in_bag).filter(c => bagFilter === 'All' || c.brand === bagFilter).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">{t('In Stock')}</h3>
                    {clubs.filter(c => !c.in_bag)
                      .filter(c => bagFilter === 'All' || c.brand === bagFilter)
                      .map((club) => (
                      <ClubCard 
                        key={club.id} 
                        club={club} 
                        onDelete={() => { setClubToDelete(club); }} 
                        onToggleBag={() => { handleToggleBag(club); }}
                        onEdit={() => { handleEditClub(club); }}
                      />
                    ))}
                  </div>
                )}

                {clubs.length === 0 && (
                  <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                    <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 text-sm">{t('Your bag is empty. Add your clubs to track performance accurately.')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {clubToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle size={32} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">{t('Delete')} {clubToDelete.custom_name || t(clubToDelete.name)}?</h3>
                <p className="text-gray-500 text-sm">{t('This will permanently remove this club from your bag and stock. This action cannot be undone.')}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setClubToDelete(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  {t('Cancel')}
                </button>
                <button 
                  onClick={() => {
                    handleDeleteClub(clubToDelete.id);
                    setClubToDelete(null);
                  }}
                  className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all"
                >
                  {t('Delete')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 px-6 py-3 flex justify-between items-center z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<LineChart size={24} />} 
          label={t("Stats")} 
        />
        <NavButton 
          active={activeTab === 'shots'} 
          onClick={() => setActiveTab('shots')} 
          icon={<History size={24} />} 
          label={t("Shots")} 
        />
        <NavButton 
          active={activeTab === 'bag'} 
          onClick={() => setActiveTab('bag')} 
          icon={<ShoppingBag size={24} />} 
          label={t("Bag")} 
        />
        <NavButton 
          active={activeTab === 'exercises'} 
          onClick={() => setActiveTab('exercises')} 
          icon={<BookOpen size={24} />} 
          label={t("Drills")} 
        />
        <NavButton 
          active={activeTab === 'ai'} 
          onClick={() => setActiveTab('ai')} 
          icon={<Sparkles size={24} />} 
          label={t("Coach")} 
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-emerald-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

const ClubCard: React.FC<{ 
  club: Club, 
  onDelete: () => void, 
  onToggleBag: () => void, 
  onEdit: () => void,
  isDraggable?: boolean
}> = ({ club, onDelete, onToggleBag, onEdit, isDraggable }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 flex justify-between items-start transition-all hover:shadow-md group">
      <div className="flex gap-4">
        {isDraggable && (
          <div className="text-gray-300 cursor-grab active:cursor-grabbing mt-1">
            <GripVertical size={20} />
          </div>
        )}
        <div 
          className="w-1.5 h-12 rounded-full mt-1" 
          style={{ backgroundColor: club.color }} 
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-lg">{club.custom_name || t(club.name)}</h4>
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold uppercase">{club.brand}</span>
          </div>
          <p className="text-sm text-gray-500">{club.model}</p>
          <div className="flex gap-3 pt-1">
            <button 
              onClick={onToggleBag}
              title={club.in_bag ? t("Move to Stock") : t("Move to Bag")}
              className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                club.in_bag 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                  : 'bg-gray-50 text-gray-400 border border-gray-100 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
              }`}
            >
              <ArrowLeftRight size={12} />
              {club.in_bag ? t('In Bag') : t('In Stock')}
            </button>
            <button 
              onClick={onEdit}
              className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100 transition-all flex items-center gap-1"
            >
              <Edit2 size={10} /> {t('Edit')}
            </button>
          </div>
        </div>
      </div>
      <button 
        onClick={onDelete}
        className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
