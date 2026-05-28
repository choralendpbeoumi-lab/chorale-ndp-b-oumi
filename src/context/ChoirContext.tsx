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

const INITIAL_MEMBERS: Member[] = [
  { id: "1", firstName: "Jean", lastName: "Koffi", phone: "0707070707", voicePart: "Ténor", role: "Président", status: "Actif", photoUrl: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/4fbf6471-3232-4b8c-be90-2e48c4d6965f/member-photo-1-54a5945f-1779975032634.webp" },
  { id: "2", firstName: "Marie", lastName: "Koné", phone: "0505050505", voicePart: "Soprano", role: "Trésorier", status: "Actif", photoUrl: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/4fbf6471-3232-4b8c-be90-2e48c4d6965f/member-photo-2-9762f933-1779975032639.webp" },
  { id: "3", firstName: "Paul", lastName: "N'Guessan", phone: "0101010101", voicePart: "Basse", role: "Maître de Chœur", status: "Actif", photoUrl: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/4fbf6471-3232-4b8c-be90-2e48c4d6965f/member-photo-3-1b17fdff-1779975032626.webp" },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "Recette", category: "Dons", amount: 50000, date: new Date().toISOString(), description: "Don anonyme pour la chorale" },
  { id: "t2", type: "Dépense", category: "Transport", amount: 5000, date: new Date().toISOString(), description: "Déplacement Maître de chœur" },
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
    return saved ? JSON.parse(saved) : [];
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
    addActivity(`Membre ajouté : ${newMember.lastName} ${newMember.firstName}`, "member");
    toast.success("Membre ajouté avec succès");
  };

  const updateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    addActivity(`Fiche membre mise à jour : ${updatedMember.lastName}`, "member");
    toast.info("Informations mises à jour");
  };

  const deleteMember = (id: string) => {
    const member = members.find(m => m.id === id);
    setMembers(prev => prev.filter(m => m.id !== id));
    addActivity(`Membre supprimé : ${member?.lastName}`, "member");
    toast.error("Membre supprimé");
  };

  const addAttendanceSession = (sessionData: Omit<AttendanceSession, 'id'>) => {
    const newSession: AttendanceSession = { ...sessionData, id: Math.random().toString(36).substr(2, 9) };
    setAttendanceSessions(prev => [newSession, ...prev]);
    addActivity(`Pointage effectué (${newSession.type})`, "attendance");
    toast.success("Présences enregistrées");
  };

  const deleteAttendanceSession = (id: string) => {
    setAttendanceSessions(prev => prev.filter(s => s.id !== id));
    toast.info("Session de pointage supprimée");
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...transactionData, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newTransaction, ...prev]);
    addActivity(`${newTransaction.type === "Recette" ? "Entrée" : "Sortie"} : ${newTransaction.description}`, "payment");
    toast.success("Opération validée");
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.info("Transaction annulée");
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
    toast.success("Cotisation exceptionnelle enregistrée");
  };

  const deleteExceptionalContribution = (id: string) => {
    setExceptionalContributions(prev => prev.filter(c => c.id !== id));
    toast.info("Cotisation exceptionnelle supprimée");
  };

  const addCredit = (creditData: Omit<Credit, 'id'>) => {
    const newCredit: Credit = { ...creditData, id: Math.random().toString(36).substr(2, 9).toUpperCase() };
    setCredits(prev => [newCredit, ...prev]);
    const member = members.find(m => m.id === newCredit.memberId);
    addActivity(`Crédit accordé : ${member?.lastName} (${newCredit.amount} FCFA)`, "payment");
    toast.success("Crédit enregistré");
  };

  const updateCreditStatus = (id: string, status: Credit['status']) => {
    setCredits(prev => prev.map(c => {
      if (c.id === id) {
        if (status === 'Remboursé' && c.status !== 'Remboursé') {
          // If credit is repaid, add a transaction
          addTransaction({
            type: 'Recette',
            category: 'Remboursement Crédit',
            amount: c.amount,
            date: new Date().toISOString().split('T')[0],
            description: `Remboursement crédit #${c.id} - ${members.find(m => m.id === c.memberId)?.lastName}`
          });
        }
        return { ...c, status };
      }
      return c;
    }));
    toast.info(`Statut du crédit mis à jour : ${status}`);
  };

  const deleteCredit = (id: string) => {
    setCredits(prev => prev.filter(c => c.id !== id));
    toast.info("Crédit supprimé");
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
      const presentCount = Object.values(s.records).filter(r => r === "Présent" || r === "Retard").length;
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