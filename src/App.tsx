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

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shots' | 'exercises' | 'ai' | 'bag'>('dashboard');
  const [distances, setDistances] = useState<DistanceEntry[]>([]);
  const [stats, setStats] = useState<ClubStat[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<any>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clubFilter, setClubFilter] = useState<string>('All');
  const [bagFilter, setBagFilter] = useState<string>('All');
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingShot, setEditingShot] = useState<DistanceEntry | null>(null);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [weather, setWeather] = useState<{ temp: number, wind: number } | null>(null);

  // Form states for "Other" logic
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [customType, setCustomType] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10B981');
  const [shaft, setShaft] = useState('');
  const [grip, setGrip] = useState('');
  const [notes, setNotes] = useState('');
  const [bagFullError, setBagFullError] = useState(false);
  const [logClubSelection, setLogClubSelection] = useState<string>('');
  const [customLogClubName, setCustomLogClubName] = useState('');
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);

  useEffect(() => {
    fetchData();
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`);
        const data = await res.json();
        if (data.current) {
          setWeather({
            temp: data.current.temperature_2m,
            wind: data.current.wind_speed_10m
          });
        }
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    });
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

    try {
      await fetch('/api/distances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ club, distance, direction, hit_point, trajectory })
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
    if (!confirm("Are you sure you want to delete this shot?")) return;
    try {
      await fetch(`/api/distances/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error("Failed to delete distance", err);
    }
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

  const generateAdvice = async () => {
    setIsLoadingAdvice(true);
    const advice = await getGolfAdvice(stats, distances);
    setAiAdvice(advice);
    setIsLoadingAdvice(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b border-black/5 px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Golf Pro Practice</h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Your Digital Caddy</p>
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
            className={`p-2 rounded-full transition-all ${isSyncing ? 'bg-emerald-100 text-emerald-600 animate-spin' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

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
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Total Shots</p>
                  <p className="text-2xl font-bold">{distances.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Clubs Tracked</p>
                  <p className="text-2xl font-bold">{stats.length}</p>
                </div>
              </div>

              {/* Club Averages */}
              <section>
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-lg font-bold">Club Averages</h2>
                  <button onClick={() => { setActiveTab('shots'); setShowLogForm(true); }} className="text-emerald-600 text-sm font-semibold flex items-center gap-1">
                    <Plus size={16} /> Add New
                  </button>
                </div>

                {stats.length > 0 && (
                  <div className="mb-6">
                    <RangeVisualization stats={stats} />
                  </div>
                )}

                <div className="space-y-3">
                  {stats.length > 0 ? stats.map((stat) => (
                    <div key={stat.club} className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{stat.club}</p>
                        <p className="text-xs text-gray-400">{stat.count} shots recorded</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">{Math.round(stat.avg_distance)}m</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Avg Carry</p>
                      </div>
                    </div>
                  )) : (
                    <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                      <p className="text-gray-400 text-sm">No data yet. Start logging your shots!</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Recent History */}
              {distances.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold mb-4">Recent Shots</h2>
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
                <h2 className="text-2xl font-bold">Shots</h2>
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
                    {showLogForm ? 'Close' : 'Log Shot'}
                  </button>
                  <div className="relative">
                    <select 
                      value={clubFilter}
                      onChange={(e) => setClubFilter(e.target.value)}
                      className="bg-white border border-black/10 rounded-xl px-3 py-2 text-sm font-medium outline-none appearance-none pr-8"
                    >
                      <option value="All">All Clubs</option>
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
                        <Plus size={18} className="text-emerald-600" /> New Shot
                      </h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleLogDistance(new FormData(e.currentTarget));
                        setShowLogForm(false);
                      }} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Select Club</label>
                          <select 
                            name="club"
                            value={logClubSelection}
                            onChange={(e) => setLogClubSelection(e.target.value)}
                            className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          >
                            <option value="">Select a Club</option>
                            {clubs.length > 0 && (
                              <optgroup label="Your Bag">
                                {clubs.map(c => <option key={c.id} value={c.name}>{c.name} ({c.brand})</option>)}
                              </optgroup>
                            )}
                            <optgroup label="Standard Clubs">
                              {CLUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </optgroup>
                            <option value="Other">Other (Custom Name)...</option>
                          </select>
                          
                          {logClubSelection === 'Other' && (
                            <div className="mt-3">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Custom Club Name</label>
                              <input 
                                value={customLogClubName}
                                onChange={(e) => setCustomLogClubName(e.target.value)}
                                placeholder="e.g. 2 Iron, Mini Driver..."
                                className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Distance (Meters)</label>
                            <input 
                              name="distance" 
                              type="number" 
                              placeholder="e.g. 135"
                              required
                              className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Trajectory</label>
                            <select name="trajectory" className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                              {TRAJECTORIES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                              <Compass size={12} /> Direction
                            </label>
                            <select name="direction" className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                              {SHOT_DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                              <Zap size={12} /> Hit Point
                            </label>
                            <select name="hit_point" className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                              {HIT_POINTS.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                        </div>

                        <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                          <Plus size={20} /> Save Shot
                        </button>
                      </form>

                      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-2 text-emerald-700 mb-2">
                          <RefreshCw size={18} />
                          <p className="font-bold">Toptracer Sync</p>
                        </div>
                        <p className="text-sm text-emerald-600 mb-4">You can also sync your session data directly from Toptracer enabled ranges.</p>
                        <button 
                          onClick={handleSyncToptracer}
                          className="bg-white text-emerald-600 font-bold px-4 py-2 rounded-lg text-sm border border-emerald-200"
                        >
                          {isSyncing ? 'Syncing...' : 'Sync Now'}
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
                            <Check size={16} /> Save
                          </button>
                          <button type="button" onClick={() => setEditingShot(null)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                            <X size={16} /> Cancel
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
                              <span className="text-[10px] text-gray-400 font-bold uppercase">{d.direction}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">• {d.hit_point}</span>
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
                    <p className="text-gray-400 text-sm">No shots found for this filter.</p>
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
              <h2 className="text-2xl font-bold">Practice Drills</h2>
              <div className="space-y-4">
                {EXERCISES.map((ex) => (
                  <div key={ex.id} className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-1 bg-gray-100 text-[10px] font-bold uppercase rounded text-gray-500 tracking-wider">{ex.category}</span>
                      <span className={`text-[10px] font-bold uppercase ${ex.difficulty === 'Beginner' ? 'text-emerald-500' : ex.difficulty === 'Intermediate' ? 'text-amber-500' : 'text-rose-500'}`}>{ex.difficulty}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{ex.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{ex.description}</p>
                    </div>
                    <button className="w-full py-2 bg-gray-50 text-gray-600 text-sm font-bold rounded-lg border border-gray-100 hover:bg-gray-100 transition-all">
                      Mark as Completed
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
                <h2 className="text-2xl font-bold">AI Coach</h2>
                <button 
                  onClick={generateAdvice}
                  disabled={isLoadingAdvice || stats.length === 0}
                  className="p-2 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  <Sparkles size={20} />
                </button>
              </div>

              {isLoadingAdvice ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-black/5 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-500 font-medium">Analyzing your swing data...</p>
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
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recommended Drills</h4>
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
                    <h3 className="font-bold text-lg">Personalized Coaching</h3>
                    <p className="text-sm text-gray-500 px-4">Get custom drills and advice based on your distance gaps and consistency.</p>
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
                <h2 className="text-2xl font-bold">In the Bag</h2>
                <div className="relative">
                  <select 
                    value={bagFilter}
                    onChange={(e) => setBagFilter(e.target.value)}
                    className="bg-white border border-black/10 rounded-xl px-3 py-2 text-sm font-medium outline-none appearance-none pr-8"
                  >
                    <option value="All">All Brands</option>
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
                    Your bag is full, first remove a club
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Add/Edit Club Form */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  {editingClub ? <Edit2 size={18} className="text-emerald-600" /> : <Plus size={18} className="text-emerald-600" />} 
                  {editingClub ? 'Edit Club' : 'Add a Club'}
                </h3>
                <form onSubmit={handleAddClub} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Club Type</label>
                      <select 
                        value={selectedType} 
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select Type</option>
                        {CLUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        <option value="Other">Other...</option>
                      </select>
                      {selectedType === 'Other' && (
                        <input 
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value)}
                          placeholder="Enter type" 
                          className="mt-2 w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" 
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Brand</label>
                      <select 
                        value={selectedBrand} 
                        onChange={(e) => {
                          setSelectedBrand(e.target.value);
                          setSelectedModel('');
                        }}
                        className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select Brand</option>
                        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                        <option value="Other">Other...</option>
                      </select>
                      {selectedBrand === 'Other' && (
                        <input 
                          value={customBrand}
                          onChange={(e) => setCustomBrand(e.target.value)}
                          placeholder="Enter brand" 
                          className="mt-2 w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" 
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Model</label>
                    {selectedBrand === 'Other' ? (
                      <input 
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        placeholder="Enter model" 
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
                          <option value="">Select Model</option>
                          {selectedBrand && POPULAR_MODELS[selectedBrand]?.map(m => <option key={m} value={m}>{m}</option>)}
                          <option value="Other">Other...</option>
                        </select>
                        {selectedModel === 'Other' && (
                          <input 
                            value={customModel}
                            onChange={(e) => setCustomModel(e.target.value)}
                            placeholder="Enter model" 
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
                    <Settings2 size={14} /> {showAdvanced ? 'Hide' : 'Show'} Advanced Options
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
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Shaft</label>
                            <input 
                              value={shaft}
                              onChange={(e) => setShaft(e.target.value)}
                              placeholder="e.g. Dynamic Gold S300" 
                              className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Grip</label>
                            <input 
                              value={grip}
                              onChange={(e) => setGrip(e.target.value)}
                              placeholder="e.g. Golf Pride MCC" 
                              className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" 
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Notes</label>
                          <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any specific details..." 
                            className="w-full bg-gray-50 border border-black/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 h-20" 
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Club Color</label>
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
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="flex-[2] bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
                      {editingClub ? 'Save Changes' : 'Add to Bag'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Club List */}
              <div className="space-y-8">
                {/* In the Bag Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">In the Bag ({clubs.filter(c => c.in_bag).length}/14)</h3>
                    {clubs.filter(c => c.in_bag).length >= 14 && (
                      <span className="text-[10px] text-amber-600 font-bold uppercase">Bag is Full</span>
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
                      <p className="text-gray-400 text-sm italic">No clubs in your bag yet.</p>
                    </div>
                  )}
                </div>

                {/* In Stock Section */}
                {clubs.filter(c => !c.in_bag).filter(c => bagFilter === 'All' || c.brand === bagFilter).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">In Stock</h3>
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
                    <p className="text-gray-400 text-sm">Your bag is empty. Add your clubs to track performance accurately.</p>
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
                <h3 className="text-xl font-bold">Delete {clubToDelete.name}?</h3>
                <p className="text-gray-500 text-sm">This will permanently remove this club from your bag and stock. This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setClubToDelete(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleDeleteClub(clubToDelete.id);
                    setClubToDelete(null);
                  }}
                  className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all"
                >
                  Delete
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
          label="Stats" 
        />
        <NavButton 
          active={activeTab === 'shots'} 
          onClick={() => setActiveTab('shots')} 
          icon={<History size={24} />} 
          label="Shots" 
        />
        <NavButton 
          active={activeTab === 'bag'} 
          onClick={() => setActiveTab('bag')} 
          icon={<ShoppingBag size={24} />} 
          label="Bag" 
        />
        <NavButton 
          active={activeTab === 'exercises'} 
          onClick={() => setActiveTab('exercises')} 
          icon={<BookOpen size={24} />} 
          label="Drills" 
        />
        <NavButton 
          active={activeTab === 'ai'} 
          onClick={() => setActiveTab('ai')} 
          icon={<Sparkles size={24} />} 
          label="Coach" 
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
            <h4 className="font-bold text-lg">{club.name}</h4>
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold uppercase">{club.brand}</span>
          </div>
          <p className="text-sm text-gray-500">{club.model}</p>
          <div className="flex gap-3 pt-1">
            <button 
              onClick={onToggleBag}
              title={club.in_bag ? "Move to Stock" : "Move to Bag"}
              className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                club.in_bag 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                  : 'bg-gray-50 text-gray-400 border border-gray-100 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
              }`}
            >
              <ArrowLeftRight size={12} />
              {club.in_bag ? 'In Bag' : 'In Stock'}
            </button>
            <button 
              onClick={onEdit}
              className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100 transition-all flex items-center gap-1"
            >
              <Edit2 size={10} /> Edit
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
