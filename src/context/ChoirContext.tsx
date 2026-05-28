import React, { createContext, useContext, useState, useEffect } from 'react';
import { Member, AttendanceSession, Transaction, Contribution, Activity, ExceptionalContribution, Credit } from '../types';
import { toast } from 'sonner';

interface ChoirContextType {
  members: Member[];
  attendanceSessions: AttendanceSession[];
  transactions: Transaction[];
  contributions: Contribution[];
  exceptionalContributions: ExceptionalContribution[];
  credits: Credit[];
  activities: Activity[];
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (member: Member) => void;
  deleteMember: (id: string) => void;
  addAttendanceSession: (session: Omit<AttendanceSession, 'id'>) => void;
  deleteAttendanceSession: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  toggleContribution: (memberId: string, month: number, year: number) => void;
  addExceptionalContribution: (contribution: Omit<ExceptionalContribution, 'id'>) => void;
  deleteExceptionalContribution: (id: string) => void;
  addCredit: (credit: Omit<Credit, 'id'>) => void;
  updateCreditStatus: (id: string, status: Credit['status']) => void;
  deleteCredit: (id: string) => void;
  totalCash: number;
  totalPendingCredits: number;
  avgAttendance: number;
  attendanceTrend: { value: number; isUp: boolean };
}

const ChoirContext = createContext<ChoirContextType | undefined>(undefined);

// Données issues du document "ETAT DES COTISATIONS MENSUELLES DE LA CHORALE NDP BEOUMI" (Mars 2026)
const INITIAL_MEMBERS: Member[] = [
  { id: "M001", firstName: "Mathias", lastName: "ADOU KOUASSI", phone: "0708091011", voicePart: "Basse", role: "Simple choriste", status: "Actif", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
  { id: "M002", firstName: "Sylvie", lastName: "KOFFI AMENAN", phone: "0506070809", voicePart: "Soprano", role: "Secr\u00e9taire", status: "Actif", photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
  { id: "M003", firstName: "F\u00e9lix", lastName: "N'GUESSAN KOUAME", phone: "0102030405", voicePart: "T\u00e9nor", role: "Ma\u00eetre de Ch\u0153ur", status: "Actif", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" },
  { id: "M004", firstName: "D\u00e9sir\u00e9", lastName: "KOUADIO KONAN", phone: "0707070707", voicePart: "Basse", role: "Tr\u00e9sorier", status: "Actif", photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" },
  { id: "M005", firstName: "Serge", lastName: "YAO KOUASSI", phone: "0505050505", voicePart: "Alto", role: "Bureau", status: "Actif", photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop" },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  // Cotisations ADOU KOUASSI MATHIAS (2026)
  { id: "tx_m001_1", type: "Recette", category: "Cotisations", amount: 400, date: "2026-01-15", description: "Cotisation Mensuelle (Jan) - ADOU KOUASSI Mathias" },
  { id: "tx_m001_2", type: "Recette", category: "Cotisations", amount: 400, date: "2026-02-15", description: "Cotisation Mensuelle (F\u00e9v) - ADOU KOUASSI Mathias" },
  { id: "tx_m001_3", type: "Recette", category: "Cotisations", amount: 400, date: "2026-03-12", description: "Cotisation Mensuelle (Mar) - ADOU KOUASSI Mathias" },
  { id: "tx_m001_4", type: "Recette", category: "Cotisations", amount: 400, date: "2026-04-10", description: "Cotisation Mensuelle (Avr) - ADOU KOUASSI Mathias" },
  { id: "tx_m001_5", type: "Recette", category: "Cotisations", amount: 500, date: "2026-05-20", description: "Cotisation Mensuelle (Mai) - ADOU KOUASSI Mathias" },
  { id: "tx_m001_6", type: "Recette", category: "Cotisations", amount: 500, date: "2026-06-15", description: "Cotisation Mensuelle (Juin) - ADOU KOUASSI Mathias" },
  { id: "tx_m001_7", type: "Recette", category: "Cotisations", amount: 400, date: "2026-07-05", description: "Cotisation Mensuelle (Juil) - ADOU KOUASSI Mathias" },
  
  // Solde initial (Report)
  { id: "tx_init", type: "Recette", category: "Autre", amount: 250000, date: "2026-01-01", description: "Solde de report ann\u00e9e pr\u00e9c\u00e9dente" },
  
  // D\u00e9penses exemples
  { id: "tx_exp1", type: "D\u00e9pense", category: "Achat", amount: 15000, date: "2026-02-10", description: "Achat de nouvelles partitions" },
];

const INITIAL_CONTRIBUTIONS: Contribution[] = [
  { memberId: "M001", year: 2026, paidMonths: [1, 2, 3, 4, 5, 6, 7] },
  { memberId: "M002", year: 2026, paidMonths: [1, 2, 3] },
  { memberId: "M003", year: 2026, paidMonths: [1, 2, 3, 4] },
];

export const ChoirProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem("choir_members");
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => {
    const saved = localStorage.getItem("choir_attendance");
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("choir_transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [contributions, setContributions] = useState<Contribution[]>(() => {
    const saved = localStorage.getItem("choir_contributions");
    return saved ? JSON.parse(saved) : INITIAL_CONTRIBUTIONS;
  });

  const [exceptionalContributions, setExceptionalContributions] = useState<ExceptionalContribution[]>(() => {
    const saved = localStorage.getItem("choir_exceptional_contributions");
    return saved ? JSON.parse(saved) : [];
  });

  const [credits, setCredits] = useState<Credit[]>(() => {
    const saved = localStorage.getItem("choir_credits");
    return saved ? JSON.parse(saved) : [];
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem("choir_activities");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("choir_members", JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem("choir_attendance", JSON.stringify(attendanceSessions));
  }, [attendanceSessions]);

  useEffect(() => {
    localStorage.setItem("choir_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("choir_contributions", JSON.stringify(contributions));
  }, [contributions]);

  useEffect(() => {
    localStorage.setItem("choir_exceptional_contributions", JSON.stringify(exceptionalContributions));
  }, [exceptionalContributions]);

  useEffect(() => {
    localStorage.setItem("choir_credits", JSON.stringify(credits));
  }, [credits]);

  useEffect(() => {
    localStorage.setItem("choir_activities", JSON.stringify(activities));
  }, [activities]);

  const addActivity = (description: string, type: Activity['type']) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      type,
      date: new Date().toISOString(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 50));
  };

  const addMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = { ...memberData, id: Math.random().toString(36).substr(2, 6).toUpperCase() };
    setMembers(prev => [...prev, newMember]);
    addActivity(`Membre ajout\u00e9 : ${newMember.lastName} ${newMember.firstName}`, "member");
    toast.success("Membre ajout\u00e9 avec succ\u00e8s");
  };

  const updateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    addActivity(`Fiche membre mise \u00e0 jour : ${updatedMember.lastName}`, "member");
    toast.info("Informations mises \u00e0 jour");
  };

  const deleteMember = (id: string) => {
    const member = members.find(m => m.id === id);
    setMembers(prev => prev.filter(m => m.id !== id));
    addActivity(`Membre supprim\u00e9 : ${member?.lastName}`, "member");
    toast.error("Membre supprim\u00e9");
  };

  const addAttendanceSession = (sessionData: Omit<AttendanceSession, 'id'>) => {
    const newSession: AttendanceSession = { ...sessionData, id: Math.random().toString(36).substr(2, 9) };
    setAttendanceSessions(prev => [newSession, ...prev]);
    addActivity(`Pointage effectu\u00e9 (${newSession.type})`, "attendance");
    toast.success("Pr\u00e9sences enregistr\u00e9es");
  };

  const deleteAttendanceSession = (id: string) => {
    setAttendanceSessions(prev => prev.filter(s => s.id !== id));
    toast.info("Session de pointage supprim\u00e9e");
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...transactionData, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newTransaction, ...prev]);
    addActivity(`${newTransaction.type === "Recette" ? "Entr\u00e9e" : "Sortie"} : ${newTransaction.description}`, "payment");
    toast.success("Op\u00e9ration valid\u00e9e");
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.info("Transaction annul\u00e9e");
  };

  const toggleContribution = (memberId: string, month: number, year: number) => {
    setContributions(prev => {
      const existing = prev.find(c => c.memberId === memberId && c.year === year);
      const member = members.find(m => m.id === memberId);
      
      if (existing) {
        const isPaid = existing.paidMonths.includes(month);
        const newPaidMonths = isPaid 
          ? existing.paidMonths.filter(m => m !== month)
          : [...existing.paidMonths, month];
        
        if (!isPaid) {
          addActivity(`${member?.lastName} : Cotisation mois ${month}`, "payment");
        }

        return prev.map(c => (c.memberId === memberId && c.year === year) ? { ...c, paidMonths: newPaidMonths } : c);
      } else {
        addActivity(`${member?.lastName} : Cotisation mois ${month}`, "payment");
        return [...prev, { memberId, year, paidMonths: [month] }];
      }
    });
  };

  const addExceptionalContribution = (contributionData: Omit<ExceptionalContribution, 'id'>) => {
    const newContribution: ExceptionalContribution = { ...contributionData, id: Math.random().toString(36).substr(2, 9) };
    setExceptionalContributions(prev => [newContribution, ...prev]);
    const member = members.find(m => m.id === newContribution.memberId);
    addActivity(`Cotisation Exc. : ${member?.lastName} (${newContribution.amount} FCFA)`, "payment");
    toast.success("Cotisation exceptionnelle enregistr\u00e9e");
  };

  const deleteExceptionalContribution = (id: string) => {
    setExceptionalContributions(prev => prev.filter(c => c.id !== id));
    toast.info("Cotisation exceptionnelle supprim\u00e9e");
  };

  const addCredit = (creditData: Omit<Credit, 'id'>) => {
    const newCredit: Credit = { ...creditData, id: Math.random().toString(36).substr(2, 9).toUpperCase() };
    setCredits(prev => [newCredit, ...prev]);
    const member = members.find(m => m.id === newCredit.memberId);
    addActivity(`Cr\u00e9dit accord\u00e9 : ${member?.lastName} (${newCredit.amount} FCFA)`, "payment");
    toast.success("Cr\u00e9dit enregistr\u00e9");
  };

  const updateCreditStatus = (id: string, status: Credit['status']) => {
    setCredits(prev => prev.map(c => {
      if (c.id === id) {
        if (status === 'Rembours\u00e9' && c.status !== 'Rembours\u00e9') {
          // If credit is repaid, add a transaction
          addTransaction({
            type: 'Recette',
            category: 'Remboursement Cr\u00e9dit',
            amount: c.amount,
            date: new Date().toISOString().split('T')[0],
            description: `Remboursement cr\u00e9dit #${c.id} - ${members.find(m => m.id === c.memberId)?.lastName}`
          });
        }
        return { ...c, status };
      }
      return c;
    }));
    toast.info(`Statut du cr\u00e9dit mis \u00e0 jour : ${status}`);
  };

  const deleteCredit = (id: string) => {
    setCredits(prev => prev.filter(c => c.id !== id));
    toast.info("Cr\u00e9dit supprim\u00e9");
  };

  const totalCash = 
    transactions.reduce((acc, t) => t.type === "Recette" ? acc + t.amount : acc - t.amount, 0) +
    exceptionalContributions.reduce((acc, c) => acc + c.amount, 0);

  const totalPendingCredits = credits
    .filter(c => c.status === 'En attente')
    .reduce((acc, c) => acc + c.amount, 0);

  const calculateAttendance = (sessions: AttendanceSession[]) => {
    if (sessions.length === 0) return 0;
    const totalPresent = sessions.reduce((acc, s) => {
      const presentCount = Object.values(s.records).filter(r => r === "Pr\u00e9sent" || r === "Retard").length;
      return acc + (presentCount / members.length);
    }, 0);
    return (totalPresent / sessions.length) * 100;
  };

  const avgAttendance = calculateAttendance(attendanceSessions);

  const lastSessionAttendance = attendanceSessions.length > 0 
    ? calculateAttendance([attendanceSessions[0]])
    : 0;
  
  const previousAvg = attendanceSessions.length > 1
    ? calculateAttendance(attendanceSessions.slice(1))
    : lastSessionAttendance;

  const attendanceTrend = {
    value: Math.abs(Math.round(lastSessionAttendance - previousAvg)),
    isUp: lastSessionAttendance >= previousAvg
  };

  return (
    <ChoirContext.Provider value={{
      members,
      attendanceSessions,
      transactions,
      contributions,
      exceptionalContributions,
      credits,
      activities,
      addMember,
      updateMember,
      deleteMember,
      addAttendanceSession,
      deleteAttendanceSession,
      addTransaction,
      deleteTransaction,
      toggleContribution,
      addExceptionalContribution,
      deleteExceptionalContribution,
      addCredit,
      updateCreditStatus,
      deleteCredit,
      totalCash,
      totalPendingCredits,
      avgAttendance,
      attendanceTrend
    }}>
      {children}
    </ChoirContext.Provider>
  );
};

export const useChoir = () => {
  const context = useContext(ChoirContext);
  if (!context) throw new Error("useChoir must be used within a ChoirProvider");
  return context;
};