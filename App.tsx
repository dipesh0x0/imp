
// @google/genai guidelines followed: Using property access for response.text and models as specified.
import React, { useState, useEffect } from 'react';
import { BrandInfo, GenerationState, ContentPlanItem, Asset, Trend, BrandPersona } from './types';
import BrandForm from './components/BrandForm';
import Dashboard from './components/Dashboard';
import AssetVault from './components/AssetVault';
import StudioEditor from './components/StudioEditor';
import TrendLab from './components/TrendLab';
import CompetitorResearch from './components/CompetitorResearch';
import LivePilot from './components/LivePilot';
import Login from './components/Login';
import Publisher from './components/Publisher';
import PersonaHub from './components/PersonaHub';
import ClientPortal from './components/ClientPortal';
import Campaigns from './components/Campaigns';
import Settings from './components/Settings';
import { generatePlan, scanTrends, researchCompetitors, generatePersona } from './services/contentService';
import { syncMemoryToPinecone } from './services/externalServices';
import { 
  BrainCircuit, LayoutDashboard, Database, Clapperboard, 
  Settings as SettingsIcon, LogOut, Search, Smartphone, ShieldCheck, Cpu, 
  ArrowRight, Sparkles, Building2, UserCircle, Store, Zap, 
  Target, Mic, HelpCircle, RefreshCw, Loader2, BarChart3, Users, ShieldAlert,
  Bell, Plus, Activity, CalendarDays
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { WebSocketProvider, useWebSocket } from './context/WebSocketContext';

type AppStep = 'landing' | 'onboarding' | 'config' | 'generating' | 'os';
type ActiveModule = 'planner' | 'research' | 'library' | 'studio' | 'trends' | 'publishing' | 'settings' | 'ambassador' | 'approvals' | 'campaigns';

const AppContent: React.FC = () => {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { isConnected } = useWebSocket();
  const [step, setStep] = useState<AppStep>('landing');
  const [activeModule, setActiveModule] = useState<ActiveModule>('planner');
  const [showLivePilot, setShowLivePilot] = useState(false);
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
  const [state, setState] = useState<GenerationState>({
    isAnalyzing: false,
    isGeneratingAssets: false,
    progress: 0,
    plan: [],
    assets: [],
    trends: []
  });

  const handleBrandSubmit = async (brand: BrandInfo, initialAssets?: Asset[]) => {
    setStep('generating');
    let finalBrand = { ...brand };
    if (!finalBrand.persona) {
      try {
        finalBrand.persona = await generatePersona(brand);
      } catch (e) { console.error(e); }
    }
    setBrandInfo(finalBrand);
    
    if (finalBrand.memory) {
      syncMemoryToPinecone(user?.id || 'guest', finalBrand.memory).catch(e => console.warn(e));
    }

    try {
      const [plan, trends, strategy] = await Promise.all([
        generatePlan(finalBrand),
        scanTrends(finalBrand.industry),
        researchCompetitors(finalBrand)
      ]);
      setState(prev => ({ 
        ...prev, 
        plan: plan.map(p => ({ ...p, status: 'pending' })), 
        trends, 
        strategy, 
        assets: initialAssets ? [...prev.assets, ...initialAssets] : prev.assets 
      }));
      setTimeout(() => setStep('os'), 1500);
    } catch (error) {
      setStep('config');
    }
  };

  const handleClientReview = (day: number, status: 'completed' | 'rejected', feedback?: string) => {
    setState(s => ({
      ...s,
      plan: s.plan.map(p => p.day === day ? { ...p, status, clientFeedback: feedback } : p)
    }));
  };

  const handleSchedule = (day: number, timestamp: number) => {
    setState(s => ({
      ...s,
      plan: s.plan.map(p => p.day === day ? { ...p, status: 'scheduled', scheduledAt: timestamp } : p)
    }));
  };

  const switchToStudio = () => setActiveModule('studio');

  if (isAuthLoading) return <div className="min-h-screen bg-nixtio-bg flex items-center justify-center font-bold text-nixtio-black">Booting ContentPilot...</div>;
  if (!user) return < Login />;

  if (step === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center pt-32 pb-20 bg-mesh">
        <nav className="fixed top-0 w-full z-50 border-b border-white/60 bg-[#ECF0F8]/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 bg-nixtio-black rounded-lg flex items-center justify-center text-white"><Cpu size={18} /></div>
              <span className="text-nixtio-black text-base font-bold tracking-tight uppercase">ContentPilot</span>
            </div>
            <button onClick={logout} className="text-sm font-bold text-nixtio-gray hover:text-nixtio-black">Sign Out</button>
          </div>
        </nav>
        <div className="text-center max-w-4xl mx-auto px-4 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-nixtio-black leading-[0.95] mb-6">Social Content <br /><span className="text-nixtio-gray/50">on Auto-Pilot.</span></h1>
          <p className="text-lg text-nixtio-gray max-w-lg mx-auto mb-10 font-medium">One workspace to research, design, and publish your entire social presence.</p>
          <button onClick={() => setStep('onboarding')} className="btn-black text-sm font-bold tracking-tight rounded-full py-5 px-10 shadow-cta flex items-center gap-2 mx-auto transition-all">Start Free Trial <ArrowRight size={16} /></button>
        </div>
      </div>
    );
  }

  if (step === 'onboarding') {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center px-4">
        <h2 className="text-4xl font-extrabold text-nixtio-black mb-16 text-center tracking-tight">Select your workspace</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          <WorkspaceCard onClick={() => setStep('config')} icon={<Building2 size={24}/>} title="Agency" desc="Manage multiple clients with shared brand memory." features={['Multi-client DB', 'Client Approvals']} />
          <WorkspaceCard onClick={() => setStep('config')} icon={<UserCircle size={24}/>} title="Creator" desc="Fast volume for viral growth and daily trends." features={['Daily Viral Scans', 'Auto-Captions']} recommended />
          <WorkspaceCard onClick={() => setStep('config')} icon={<Store size={24}/>} title="Business" desc="Focus on local ROI and direct customer conversion." features={['Local SEO focus', 'Review Monitoring']} />
        </div>
      </div>
    );
  }

  if (step === 'config') return <BrandForm onSubmit={handleBrandSubmit} isLoading={false} onBack={() => setStep('onboarding')} />;

  if (step === 'generating') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-nixtio-bg">
        <div className="text-center w-full max-sm px-6">
          <div className="w-16 h-16 mx-auto mb-8 bg-white rounded-3xl flex items-center justify-center shadow-glass animate-pulse-soft"><Cpu size={28} /></div>
          <h2 className="text-xl font-extrabold text-nixtio-black mb-6">Building Strategy...</h2>
          <div className="h-1.5 w-full bg-white rounded-full overflow-hidden"><div className="h-full bg-nixtio-black rounded-full loading-bar-anim"></div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-nixtio-bg relative">
      <aside className="w-64 bg-white/40 backdrop-blur-xl border-r border-white/60 flex flex-col p-6 h-full shrink-0 z-30">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-nixtio-black rounded-xl flex items-center justify-center text-white shadow-cta"><BrainCircuit size={20} /></div>
          <span className="font-bold text-sm tracking-tight text-nixtio-black">Pilot OS</span>
        </div>
        
        <nav className="space-y-1 flex-1 overflow-y-auto custom-scroll">
          <NavItem active={activeModule === 'planner'} onClick={() => setActiveModule('planner')} icon={<LayoutDashboard size={18}/>} label="Dashboard" />
          <NavItem active={activeModule === 'campaigns'} onClick={() => setActiveModule('campaigns')} icon={<CalendarDays size={18}/>} label="Calendar" />
          <NavItem active={activeModule === 'approvals'} onClick={() => setActiveModule('approvals')} icon={<ShieldAlert size={18}/>} label="Approvals" />
          <NavItem active={activeModule === 'ambassador'} onClick={() => setActiveModule('ambassador')} icon={<Users size={18}/>} label="Ambassador" />
          <NavItem active={activeModule === 'publishing'} onClick={() => setActiveModule('publishing')} icon={<BarChart3 size={18}/>} label="Publishing" />
          <NavItem active={activeModule === 'research'} onClick={() => setActiveModule('research')} icon={<Target size={18}/>} label="Research" />
          <NavItem active={activeModule === 'library'} onClick={() => setActiveModule('library')} icon={<Database size={18}/>} label="Assets" />
          <NavItem active={activeModule === 'studio'} onClick={() => setActiveModule('studio')} icon={<Clapperboard size={18}/>} label="Studio" />
          <NavItem active={activeModule === 'trends'} onClick={() => setActiveModule('trends')} icon={<Search size={18}/>} label="Trends" />
          <div className="pt-8 pb-2 px-3 text-[10px] font-bold text-nixtio-gray uppercase tracking-widest">Settings</div>
          <NavItem active={activeModule === 'settings'} onClick={() => setActiveModule('settings')} icon={<SettingsIcon size={18}/>} label="Profile" />
        </nav>

        <div className="mt-8 space-y-4">
          <div className="px-4 py-4 bg-white/60 rounded-2xl border border-white">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                   <Activity size={12} className="text-nixtio-purple" />
                   <span className="text-[9px] font-black uppercase text-nixtio-gray tracking-widest">GPU Usage</span>
                </div>
                <span className="text-[9px] font-black text-nixtio-black">85%</span>
             </div>
             <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-nixtio-purple rounded-full" style={{ width: '85%' }}></div>
             </div>
             <p className="text-[8px] text-nixtio-gray font-bold mt-2 uppercase">850 / 1000 Credits</p>
          </div>

          <button onClick={() => setShowLivePilot(true)} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-nixtio-black text-white text-[11px] font-bold uppercase tracking-widest hover:bg-nixtio-purple transition-all shadow-cta">
            <Mic size={16} /> AI Assistant
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-white/60 flex items-center justify-between px-10 bg-nixtio-bg/80 backdrop-blur-md z-40 shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold text-nixtio-black tracking-tight capitalize">
              {activeModule === 'planner' ? 'Dashboard' : activeModule === 'library' ? 'Assets' : activeModule}
            </h2>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-nixtio-black text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-cta hover:bg-nixtio-purple transition-all">
               <Plus size={14} /> Create New
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{isConnected ? 'Neural Link' : 'Offline'}</span>
            </div>
            <button className="relative p-2 text-nixtio-gray hover:text-nixtio-black transition-colors">
               <Bell size={20} />
               <span className="absolute top-1 right-1 w-2 h-2 bg-nixtio-purple rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-nixtio-black">{user.name}</p>
                <p className="text-[10px] text-nixtio-gray font-bold uppercase tracking-widest">Pro Member</p>
              </div>
              <img src={user.avatarUrl} className="w-10 h-10 rounded-xl border border-white shadow-sm" alt="Profile" />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-10 animate-fade-in custom-scroll">
          {activeModule === 'planner' && brandInfo && <Dashboard state={state} brandInfo={brandInfo} onReset={() => setStep('landing')} onUpdateBrand={(b) => setBrandInfo(b)} updatePlanItem={(day, up) => setState(s => ({...s, plan: s.plan.map(p => p.day === day ? {...p, ...up} : p)}))} onUseTemplate={switchToStudio} />}
          {activeModule === 'approvals' && <ClientPortal plan={state.plan} onReview={handleClientReview} />}
          {activeModule === 'publishing' && <Publisher plan={state.plan} brandInfo={brandInfo || undefined} onUpdateBrand={(b) => setBrandInfo(b)} />}
          {activeModule === 'campaigns' && <Campaigns plan={state.plan} onSchedule={handleSchedule} />}
          {activeModule === 'research' && <CompetitorResearch strategy={state.strategy} />}
          {activeModule === 'library' && <AssetVault assets={state.assets} onUpload={(a) => setState(s => ({...s, assets: [...s.assets, a]}))} />}
          {activeModule === 'studio' && <StudioEditor plan={state.plan} assets={state.assets} onAddAsset={(a) => setState(s => ({...s, assets: [...s.assets, a]}))} />}
          {activeModule === 'trends' && <TrendLab trends={state.trends} onRefresh={() => {}} />}
          {activeModule === 'ambassador' && brandInfo && <PersonaHub brand={brandInfo} onUpdate={(p) => setBrandInfo({ ...brandInfo, persona: p })} />}
          {activeModule === 'settings' && brandInfo && <Settings brand={brandInfo} onUpdate={(b) => setBrandInfo(b)} />}
          {activeModule === 'settings' && !brandInfo && <div className="max-w-2xl mx-auto"><BrandForm onSubmit={handleBrandSubmit} isLoading={false} /></div>}
        </section>
      </main>

      {showLivePilot && <LivePilot onClose={() => setShowLivePilot(false)} state={state} />}
    </div>
  );
};

const WorkspaceCard = ({ icon, title, desc, features, recommended, onClick }: any) => (
  <div onClick={onClick} className={`glass-panel p-10 rounded-[40px] cursor-pointer relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl ${recommended ? 'ring-2 ring-nixtio-black' : ''}`}>
    {recommended && <div className="absolute top-0 right-0 p-5"><span className="bg-nixtio-black text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">Recommended</span></div>}
    <div className="w-14 h-14 bg-white rounded-2xl border border-white/60 shadow-sm flex items-center justify-center mb-8 text-nixtio-black">{icon}</div>
    <h3 className="text-sm font-bold text-nixtio-black uppercase tracking-widest mb-2">{title}</h3>
    <p className="text-nixtio-gray text-sm font-medium mb-8 leading-relaxed">{desc}</p>
    <div className="space-y-3 mb-10 flex-1">
      {features.map((f: string) => <div key={f} className="flex items-center gap-3 text-xs font-bold text-nixtio-gray"><ArrowRight size={14} className="text-nixtio-purple"/> {f}</div>)}
    </div>
    <button className="w-full py-4 rounded-2xl bg-nixtio-black text-white font-bold text-xs uppercase tracking-widest transition-all">Select</button>
  </div>
);

const NavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-bold transition-all uppercase tracking-widest ${active ? 'bg-nixtio-black text-white shadow-cta' : 'text-nixtio-gray hover:text-nixtio-black hover:bg-white/50'}`}>{icon} {label}</button>
);

const App: React.FC = () => {
  return (
    <WebSocketProvider>
      <AppContent />
    </WebSocketProvider>
  );
};

export default App;
