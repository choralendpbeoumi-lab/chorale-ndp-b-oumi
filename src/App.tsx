import { useState } from 'react';
import { ChoirProvider } from './context/ChoirContext';
import { Dashboard } from './components/dashboard/Dashboard';
import { HRManagement } from './components/hr/HRManagement';
import { FinanceManagement } from './components/finance/FinanceManagement';
import { ProfilePage } from './components/profile/ProfilePage';
import { ArchivesModule } from './components/archives/ArchivesModule';
import { LayoutDashboard, Users, CreditCard, Music, UserCircle, Archive } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'hr' | 'finance' | 'profile' | 'archives'>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hr', label: 'Membres & RH', icon: Users },
    { id: 'finance', label: 'Trésorerie', icon: CreditCard },
    { id: 'archives', label: 'Archives', icon: Archive },
    { id: 'profile', label: 'Profil', icon: UserCircle },
  ] as const;

  const logoUrl = "https://storage.googleapis.com/dala-prod-public-storage/attachments/ccab1cf2-1794-4f2c-9ed3-8994780f7688/1779989907288_image.png";

  return (
    <ChoirProvider>
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        {/* Mobile Header */}
        <header className="md:hidden bg-primary text-primary-foreground p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white overflow-hidden p-0.5">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg">Chorale Notre Dame</span>
          </div>
        </header>

        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-primary text-primary-foreground border-r sticky top-0 h-screen">
          <div className="p-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 border-2 border-accent shadow-lg shadow-black/20 overflow-hidden p-1">
               <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-black text-center leading-tight">Notre Dame de la Paix</h1>
            <p className="text-[10px] uppercase tracking-widest text-accent mt-1 font-bold">Béoumi - Côte d'Ivoire</p>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 mt-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  activeTab === item.id 
                    ? "bg-accent text-accent-foreground shadow-md" 
                    : "hover:bg-white/10"
                )}
              >
                <item.icon className={cn("w-5 h-5", activeTab === item.id ? "" : "text-white/70 group-hover:text-white")} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 mt-auto">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-[10px] text-white/50 uppercase mb-2">Statut Application</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium">Connecté (Local)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'hr' && <HRManagement />}
              {activeTab === 'finance' && <FinanceManagement />}
              {activeTab === 'archives' && <ArchivesModule />}
              {activeTab === 'profile' && <ProfilePage />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Nav (Mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-2 flex justify-around items-center z-50">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[80px]",
                activeTab === item.id ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="activeDot" className="w-1 h-1 bg-primary rounded-full mt-0.5" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </ChoirProvider>
  );
}

export default App;