import React from 'react';
import { useChoir } from '@/context/ChoirContext';
import { StatCard } from '../shared/StatCard';
import { Users, CheckCircle, Wallet, Calendar, PlusCircle, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const Dashboard: React.FC = () => {
  const { members, avgAttendance, attendanceTrend, totalCash, activities, transactions } = useChoir();

  const activeChoristers = members.filter(m => m.status === 'Actif').length;
  
  // Financial Goal: Updated to 3,000,000 as per request
  const financialGoal = 3000000;
  const goalProgress = Math.min((totalCash / financialGoal) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Tableau de Bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de la Chorale Notre Dame de la Paix.</p>
        </div>
        <div className="text-sm font-medium px-4 py-2 bg-accent/20 text-accent-foreground rounded-full flex items-center gap-2 border border-accent/30 shadow-sm">
          <Calendar className="w-4 h-4" />
          {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Choristes Actifs" 
          value={activeChoristers} 
          icon={Users} 
          description={`${members.length} inscrits au total`}
        />
        <StatCard 
          title="Présence Moyenne" 
          value={`${Math.round(avgAttendance)}%`} 
          icon={CheckCircle} 
          trend={attendanceTrend}
        />
        <StatCard 
          title="Caisse Totale" 
          value={`${totalCash.toLocaleString()} FCFA`} 
          icon={Wallet} 
          className="border-primary/50 shadow-md"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-accent" />
              Objectif Financier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-black text-primary">{totalCash.toLocaleString()} FCFA</span>
                <span className="text-muted-foreground text-xs uppercase font-bold">Cible: {financialGoal.toLocaleString()}</span>
              </div>
              <Progress value={goalProgress} className="h-4 bg-primary/10" />
            </div>
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/10">
              <p className="text-sm text-accent-foreground font-medium italic">
                "Nous avons atteint {Math.round(goalProgress)}% de notre objectif de {financialGoal.toLocaleString()} FCFA pour les projets de la chorale."
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Journal d'Activités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? activities.slice(0, 4).map((activity, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={activity.id} 
                  className="flex items-start gap-3 pb-3 border-b last:border-0"
                >
                  <div className={cn(
                    "mt-1 p-1.5 rounded-full shadow-sm",
                    activity.type === 'payment' ? "bg-green-100 text-green-600" :
                    activity.type === 'member' ? "bg-blue-100 text-blue-600" :
                    "bg-amber-100 text-amber-600"
                  )}>
                    {activity.type === 'payment' ? <ArrowUpRight className="w-3 h-3" /> :
                     activity.type === 'member' ? <Users className="w-3 h-3" /> :
                     <Calendar className="w-3 h-3" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground/80 leading-snug">{activity.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(activity.date), 'HH:mm', { locale: fr })}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-6 italic">Aucune activité enregistrée.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-card rounded-xl p-6 border border-primary/10 shadow-sm">
        <h3 className="font-bold mb-4 text-primary flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Derniers Mouvements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {transactions.slice(-4).reverse().map((t) => (
            <div key={t.id} className="bg-muted/30 p-4 rounded-xl border group hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "text-[9px] px-2 py-0.5 rounded-full uppercase font-black",
                  t.type === 'Recette' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {t.type}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">{format(new Date(t.date), 'dd/MM')}</span>
              </div>
              <p className="text-xs font-bold truncate mb-1 text-foreground/80">{t.description}</p>
              <p className={cn(
                "text-lg font-black tracking-tight",
                t.type === 'Recette' ? "text-green-600" : "text-red-600"
              )}>
                {t.type === 'Recette' ? '+' : '-'}{t.amount.toLocaleString()} <span className="text-[10px] font-bold opacity-60">FCFA</span>
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="col-span-full py-10 text-center text-muted-foreground text-sm italic">
               Aucune transaction récente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};