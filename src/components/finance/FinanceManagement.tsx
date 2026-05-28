import React, { useState, useMemo } from 'react';
import { useChoir } from '@/context/ChoirContext';
import { Transaction, ExceptionalContribution, Member, Credit } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Plus, ArrowUpCircle, ArrowDownCircle, Search, CheckSquare, Square, Trash2, HeartHandshake, FileText, History, Check, Landmark, CreditCard, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { generateReceiptPDF } from '@/lib/pdf-utils';
import { toast } from 'sonner';

const MONTHS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'
];

export const FinanceManagement: React.FC = () => {
  const { 
    transactions, members, contributions, exceptionalContributions, credits, 
    toggleContribution, addTransaction, deleteTransaction, 
    addExceptionalContribution, deleteExceptionalContribution, 
    addCredit, updateCreditStatus, deleteCredit,
    totalCash, totalPendingCredits 
  } = useChoir();
  
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingExceptional, setIsAddingExceptional] = useState(false);
  const [isAddingMonthly, setIsAddingMonthly] = useState(false);
  const [isAddingCredit, setIsAddingCredit] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('Tous');

  const [txForm, setTxForm] = useState<Omit<Transaction, 'id'>>({
    type: 'Recette',
    category: 'Cotisations',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [excForm, setExcForm] = useState<Omit<ExceptionalContribution, 'id'>>({
    memberId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [monthlyForm, setMonthlyForm] = useState({
    memberId: '',
    month: new Date().getMonth() + 1,
    amount: 420,
    date: new Date().toISOString().split('T')[0]
  });

  const [creditForm, setCreditForm] = useState<Omit<Credit, 'id'>>({
    memberId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'En attente',
    dueDate: ''
  });

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'Tous' || t.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType]);

  const allHistory = useMemo(() => {
    const regular = transactions.map(t => ({ ...t, source: 'Régulier' as const }));
    const exceptional = exceptionalContributions.map(c => {
      const member = members.find(m => m.id === c.memberId);
      return {
        id: c.id,
        type: 'Recette' as const,
        category: 'Cotisation Exceptionnelle',
        amount: c.amount,
        date: c.date,
        description: c.description || `Versé par ${member?.lastName || 'Membre'}`,
        source: 'Exceptionnel' as const,
        memberId: c.memberId
      };
    });

    return [...regular, ...exceptional]
      .filter(item => {
        const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'Tous' || item.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, exceptionalContributions, members, searchTerm, filterType]);

  const handleAddTransaction = () => {
    if (txForm.amount <= 0) {
      toast.error('Le montant doit être supérieur à 0');
      return;
    }
    const newTxData = { ...txForm, amount: Number(txForm.amount) };
    addTransaction(newTxData);
    const tempTx: Transaction = { ...newTxData, id: Math.random().toString(36).substr(2, 9).toUpperCase() };
    generateReceiptPDF(tempTx);
    setIsAddingTransaction(false);
    setTxForm({ type: 'Recette', category: 'Cotisations', amount: 0, date: new Date().toISOString().split('T')[0], description: '' });
  };

  const handleAddExceptional = () => {
    if (!excForm.memberId || excForm.amount <= 0) {
      toast.error('Veuillez remplir tous les champs correctement');
      return;
    }
    const newExcData = { ...excForm, amount: Number(excForm.amount) };
    addExceptionalContribution(newExcData);
    const member = members.find(m => m.id === excForm.memberId);
    const tempTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      type: 'Recette',
      category: 'Cotisation Exceptionnelle',
      amount: Number(excForm.amount),
      date: excForm.date,
      description: excForm.description || `Cotisation Exceptionnelle de ${member?.lastName}`
    };
    generateReceiptPDF(tempTx, member);
    setIsAddingExceptional(false);
    setExcForm({ memberId: '', amount: 0, date: new Date().toISOString().split('T')[0], description: '' });
  };

  const handleAddMonthly = () => {
    if (!monthlyForm.memberId || monthlyForm.amount <= 0) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    const member = members.find(m => m.id === monthlyForm.memberId);
    const monthName = MONTHS[Number(monthlyForm.month) - 1];
    const newTxData = {
      type: 'Recette' as const,
      category: 'Cotisations',
      amount: Number(monthlyForm.amount),
      date: monthlyForm.date,
      description: `Cotisation Mensuelle (${monthName}) - ${member?.lastName} ${member?.firstName}`
    };
    addTransaction(newTxData);
    const alreadyPaid = isMonthPaid(monthlyForm.memberId, Number(monthlyForm.month) - 1);
    if (!alreadyPaid) {
      toggleContribution(monthlyForm.memberId, Number(monthlyForm.month), new Date().getFullYear());
    }
    const tempTx: Transaction = { id: Math.random().toString(36).substr(2, 9).toUpperCase(), ...newTxData };
    generateReceiptPDF(tempTx, member);
    setIsAddingMonthly(false);
    setMonthlyForm({ ...monthlyForm, amount: 420 });
  };

  const handleAddCredit = () => {
    if (!creditForm.memberId || creditForm.amount <= 0) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    const newCreditData = { ...creditForm, amount: Number(creditForm.amount) };
    
    if (totalCash < newCreditData.amount) {
      toast.error('Solde de trésorerie insuffisant');
      return;
    }

    addCredit(newCreditData);
    
    const member = members.find(m => m.id === creditForm.memberId);
    addTransaction({
      type: 'Dépense',
      category: 'Crédit / Prêt',
      amount: newCreditData.amount,
      date: creditForm.date,
      description: `Sortie pour crédit accordé à ${member?.lastName}`
    });

    setIsAddingCredit(false);
    setCreditForm({ memberId: '', amount: 0, date: new Date().toISOString().split('T')[0], description: '', status: 'En attente', dueDate: '' });
  };

  const isMonthPaid = (memberId: string, monthIndex: number) => {
    const userContrib = contributions.find(c => c.memberId === memberId && c.year === new Date().getFullYear());
    return userContrib?.paidMonths.includes(monthIndex + 1);
  };

  const getMemberTotal = (memberId: string) => {
    const userContrib = contributions.find(c => c.memberId === memberId && c.year === new Date().getFullYear());
    return (userContrib?.paidMonths.length || 0) * 420;
  };

  const calculateGrandTotalMensuel = () => {
    return members
      .filter(m => m.status === 'Actif')
      .reduce((acc, member) => acc + getMemberTotal(member.id), 0);
  };

  const calculateGrandTotalExceptional = () => {
    return exceptionalContributions.reduce((acc, c) => acc + c.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion Financière</h1>
          <p className="text-muted-foreground">Suivi des cotisations, de la trésorerie et des crédits.</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4 min-w-[200px]">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Solde Actuel</p>
              <p className="text-2xl font-black text-primary">{totalCash.toLocaleString()} FCFA</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 min-w-[200px]">
            <div className="p-2 bg-amber-100 rounded-full text-amber-600">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-amber-600 uppercase font-semibold">Crédits en cours</p>
              <p className="text-2xl font-black text-amber-700">{totalPendingCredits.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="historique" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-[1000px]">
          <TabsTrigger value="historique" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Historique</span>
          </TabsTrigger>
          <TabsTrigger value="tresorerie">Trésorerie</TabsTrigger>
          <TabsTrigger value="cotisations">Cotisations</TabsTrigger>
          <TabsTrigger value="exceptionnelles">Exceptionnelles</TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Crédits</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="historique" className="pt-4 space-y-4">
           <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  className="pl-10" 
                  placeholder="Rechercher dans l'historique global..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous">Tout</SelectItem>
                  <SelectItem value="Recette">Recettes</SelectItem>
                  <SelectItem value="Dépense">Dépenses</SelectItem>
                </SelectContent>
              </Select>
           </div>
           
           <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Détails</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Source</TableHead>
                  <TableHead className="text-right text-xs">Montant</TableHead>
                  <TableHead className="w-[140px] text-center text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allHistory.map((item) => (
                  <TableRow key={item.id} className="group">
                    <TableCell className="text-[10px]">
                      {format(new Date(item.date), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold flex items-center gap-2">
                        {item.type === 'Recette' ? <ArrowUpCircle className="w-3 h-3 text-green-500" /> : <ArrowDownCircle className="w-3 h-3 text-red-500" />}
                        <span className="truncate max-w-[200px]">{item.description}</span>
                      </div>
                      <div className="text-[9px] text-muted-foreground">{item.category}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                       <Badge variant="secondary" className="text-[8px] h-4">{item.source}</Badge>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right text-xs font-black",
                      item.type === 'Recette' ? "text-green-600" : "text-red-600"
                    )}>
                      {item.type === 'Recette' ? '+' : '-'}{item.amount.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell className="text-center">
                       <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 gap-1 px-2 text-[10px] bg-primary/5 hover:bg-primary/10 border-primary/20"
                          onClick={() => {
                            const member = 'memberId' in item ? members.find(m => m.id === (item as any).memberId) : undefined;
                            generateReceiptPDF(item as Transaction, member);
                          }}
                        >
                          <FileText className="w-3 h-3" />
                          <span>Reçu PDF</span>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {allHistory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs italic">
                      Aucun mouvement trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="cotisations" className="pt-4 space-y-4">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
              <h3 className="font-semibold text-sm">Cotisations Mensuelles ({new Date().getFullYear()})</h3>
              <div className="flex items-center gap-3">
                <div className="text-[10px] bg-accent/20 text-accent-foreground px-2 py-1 rounded font-bold">Standard: 420 FCFA / mois</div>
                
                <Dialog open={isAddingMonthly} onOpenChange={setIsAddingMonthly}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-8 bg-primary hover:bg-primary/90">
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Enregistrer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Enregistrer une Cotisation Mensuelle</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Choriste</label>
                        <Select value={monthlyForm.memberId} onValueChange={(v) => setMonthlyForm({...monthlyForm, memberId: v})}>
                          <SelectTrigger><SelectValue placeholder="Choisir un membre" /></SelectTrigger>
                          <SelectContent>
                            {members.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.lastName} {m.firstName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Mois</label>
                          <Select value={monthlyForm.month.toString()} onValueChange={(v) => setMonthlyForm({...monthlyForm, month: parseInt(v)})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {MONTHS.map((m, i) => (
                                <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Montant (FCFA)</label>
                          <Input type="number" value={monthlyForm.amount} onChange={e => setMonthlyForm({...monthlyForm, amount: Number(e.target.value)})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date de paiement</label>
                        <Input type="date" value={monthlyForm.date} onChange={e => setMonthlyForm({...monthlyForm, date: e.target.value})} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddMonthly} className="w-full">
                        <Check className="w-4 h-4 mr-2" />
                        Enregistrer & Générer Reçu
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="min-w-[180px] sticky left-0 bg-muted/50 z-10 text-xs">Choriste</TableHead>
                    {MONTHS.map((m) => (
                      <TableHead key={m} className="text-center px-2 text-[10px]">{m}</TableHead>
                    ))}
                    <TableHead className="text-right px-4 text-[10px] font-black bg-accent/5 sticky right-0 z-10">CUMUL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.filter(m => m.status === 'Actif').map((member) => (
                    <TableRow key={member.id} className="h-10">
                      <TableCell className="font-medium sticky left-0 bg-card z-10 border-r text-xs">
                        {member.lastName} {member.firstName}
                      </TableCell>
                      {MONTHS.map((_, idx) => (
                        <TableCell key={idx} className="text-center p-0">
                          <button
                            onClick={() => toggleContribution(member.id, idx + 1, new Date().getFullYear())}
                            className={cn(
                              "w-full h-10 flex items-center justify-center transition-colors",
                              isMonthPaid(member.id, idx) ? "bg-green-50 text-green-600" : "hover:bg-muted/30"
                            )}
                          >
                            {isMonthPaid(member.id, idx) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-muted-foreground/20" />}
                          </button>
                        </TableCell>
                      ))}
                      <TableCell className="text-right px-4 text-xs font-black bg-accent/5 sticky right-0 z-10 border-l">
                        {getMemberTotal(member.id).toLocaleString()} <span className="text-[8px] opacity-60">FCFA</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-primary/5 hover:bg-primary/10 border-t-2">
                    <TableCell className="font-black text-primary sticky left-0 bg-primary/5 z-10 text-xs">
                      TOTAL GENERAL
                    </TableCell>
                    <TableCell colSpan={12} className="text-right text-[10px] text-muted-foreground font-medium pr-4">
                      Somme de toutes les cotisations mensuelles :
                    </TableCell>
                    <TableCell className="text-right px-4 text-sm font-black text-primary bg-primary/10 sticky right-0 z-10 border-l">
                      {calculateGrandTotalMensuel().toLocaleString()} <span className="text-[10px]">FCFA</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tresorerie" className="pt-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  className="pl-10 min-w-[200px]" 
                  placeholder="Rechercher une opération..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous">Tout</SelectItem>
                  <SelectItem value="Recette">Recettes</SelectItem>
                  <SelectItem value="Dépense">Dépenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Opération
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Enregistrer une transaction</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <Select value={txForm.type} onValueChange={(v: any) => setTxForm({...txForm, type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Recette">Recette (+)</SelectItem>
                          <SelectItem value="Dépense">Dépense (-)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input type="date" value={txForm.date} onChange={e => setTxForm({...txForm, date: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Montant (FCFA)</label>
                      <Input type="number" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Catégorie</label>
                      <Select value={txForm.category} onValueChange={(v) => setTxForm({...txForm, category: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cotisations">Cotisations</SelectItem>
                          <SelectItem value="Dons">Dons / Offrandes</SelectItem>
                          <SelectItem value="Achat">Achat Matériel</SelectItem>
                          <SelectItem value="Transport">Transport</SelectItem>
                          <SelectItem value="Sono">Sonorisation</SelectItem>
                          <SelectItem value="Fête">Fête / Réception</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} placeholder="Détail de l'opération..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddTransaction} className="w-full">Valider & Générer Reçu</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Catégorie</TableHead>
                  <TableHead className="text-right text-xs">Montant</TableHead>
                  <TableHead className="w-[120px] text-center text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} className="group">
                    <TableCell className="text-[10px]">
                      {format(new Date(tx.date), 'dd/MM/yy')}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold flex items-center gap-2 truncate max-w-[150px]">
                        {tx.type === 'Recette' ? <ArrowUpCircle className="w-3 h-3 text-green-500" /> : <ArrowDownCircle className="w-3 h-3 text-red-500" />}
                        {tx.description}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-[9px] h-4 py-0 font-normal">{tx.category}</Badge>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right text-xs font-bold",
                      tx.type === 'Recette' ? "text-green-600" : "text-red-600"
                    )}>
                      {tx.type === 'Recette' ? '+' : '-'}{tx.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-primary"
                          title="Générer le reçu PDF"
                          onClick={() => generateReceiptPDF(tx)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive"
                          onClick={() => { if(confirm('Annuler cette transaction ?')) deleteTransaction(tx.id); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="exceptionnelles" className="pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-sm">Cotisations Exceptionnelles</h3>
              <p className="text-[10px] text-muted-foreground">Dons spéciaux, projets spécifiques, etc.</p>
            </div>
            <Dialog open={isAddingExceptional} onOpenChange={setIsAddingExceptional}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 size-sm">
                  <HeartHandshake className="w-4 h-4 mr-2" />
                  Nouvelle Cotisation Exc.
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nouvelle Cotisation Exceptionnelle</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Choriste</label>
                    <Select value={excForm.memberId} onValueChange={(v) => setExcForm({...excForm, memberId: v})}>
                      <SelectTrigger><SelectValue placeholder="Choisir un membre" /></SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.lastName} {m.firstName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Montant (FCFA)</label>
                      <Input type="number" value={excForm.amount} onChange={e => setExcForm({...excForm, amount: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input type="date" value={excForm.date} onChange={e => setExcForm({...excForm, date: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description / Motif</label>
                    <Input value={excForm.description} onChange={e => setExcForm({...excForm, description: e.target.value})} placeholder="Ex: Projet Uniformes, Don Spécial..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddExceptional} className="w-full bg-accent text-accent-foreground">Enregistrer & Générer Reçu</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Membre</TableHead>
                  <TableHead className="text-xs">Motif</TableHead>
                  <TableHead className="text-right text-xs">Montant</TableHead>
                  <TableHead className="w-[120px] text-center text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exceptionalContributions.map((c) => {
                  const member = members.find(m => m.id === c.memberId);
                  return (
                    <TableRow key={c.id} className="group">
                      <TableCell className="text-[10px]">
                        {format(new Date(c.date), 'dd/MM/yy')}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {member ? `${member.lastName} ${member.firstName}` : 'Inconnu'}
                      </TableCell>
                      <TableCell className="text-xs italic text-muted-foreground truncate max-w-[150px]">
                        {c.description}
                      </TableCell>
                      <TableCell className="text-right text-xs font-black text-primary">
                        {c.amount.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-primary"
                            onClick={() => {
                              const tx: Transaction = {
                                id: c.id.toUpperCase(),
                                type: 'Recette',
                                category: 'Cotisation Exceptionnelle',
                                amount: c.amount,
                                date: c.date,
                                description: c.description
                              };
                              generateReceiptPDF(tx, member);
                            }}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive"
                            onClick={() => { if(confirm('Supprimer cette cotisation exceptionnelle ?')) deleteExceptionalContribution(c.id); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {exceptionalContributions.length > 0 && (
                  <TableRow className="bg-accent/5 hover:bg-accent/10 border-t-2">
                    <TableCell colSpan={3} className="font-black text-accent text-xs">
                      TOTAL GENERAL
                    </TableCell>
                    <TableCell className="text-right text-sm font-black text-primary">
                      {calculateGrandTotalExceptional().toLocaleString()} <span className="text-[10px]">FCFA</span>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="credits" className="pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-sm">Gestion des Crédits</h3>
              <p className="text-[10px] text-muted-foreground">Prêts accordés aux membres de la chorale.</p>
            </div>
            <Dialog open={isAddingCredit} onOpenChange={setIsAddingCredit}>
              <DialogTrigger asChild>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Accorder un Crédit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nouveau Crédit</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Choriste</label>
                    <Select value={creditForm.memberId} onValueChange={(v) => setCreditForm({...creditForm, memberId: v})}>
                      <SelectTrigger><SelectValue placeholder="Choisir un membre" /></SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.lastName} {m.firstName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Montant (FCFA)</label>
                      <Input type="number" value={creditForm.amount} onChange={e => setCreditForm({...creditForm, amount: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date du prêt</label>
                      <Input type="date" value={creditForm.date} onChange={e => setCreditForm({...creditForm, date: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date d'échéance (facultatif)</label>
                    <Input type="date" value={creditForm.dueDate} onChange={e => setCreditForm({...creditForm, dueDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Motif / Description</label>
                    <Input value={creditForm.description} onChange={e => setCreditForm({...creditForm, description: e.target.value})} placeholder="Raison du crédit..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddCredit} className="w-full bg-amber-600 hover:bg-amber-700">Valider le Crédit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Membre</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-right text-xs">Montant</TableHead>
                  <TableHead className="text-center text-xs">Statut</TableHead>
                  <TableHead className="w-[140px] text-center text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credits.map((c) => {
                  const member = members.find(m => m.id === c.memberId);
                  const isOverdue = c.status === 'En attente' && c.dueDate && new Date(c.dueDate) < new Date();
                  return (
                    <TableRow key={c.id} className="group">
                      <TableCell className="text-[10px]">
                        {format(new Date(c.date), 'dd/MM/yy')}
                        {c.dueDate && (
                          <div className="text-[8px] text-muted-foreground">
                            Échéance: {format(new Date(c.dueDate), 'dd/MM/yy')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {member ? `${member.lastName} ${member.firstName}` : 'Inconnu'}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5">
                           {isOverdue && <AlertCircle className="w-3 h-3 text-red-500" />}
                           <span className="truncate max-w-[150px]">{c.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs font-black text-amber-700">
                        {c.amount.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell className="text-center">
                         <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] px-1.5 h-5",
                              c.status === 'Remboursé' ? "border-green-200 text-green-700 bg-green-50" :
                              c.status === 'Annulé' ? "border-slate-200 text-slate-700 bg-slate-50" :
                              isOverdue ? "border-red-200 text-red-700 bg-red-50 animate-pulse" : "border-amber-200 text-amber-700 bg-amber-50"
                            )}
                          >
                            {isOverdue ? 'En retard' : c.status}
                          </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {c.status === 'En attente' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 px-2 text-[9px] border-green-200 text-green-700 hover:bg-green-50"
                              onClick={() => { if(confirm('Marquer ce crédit comme remboursé ?')) updateCreditStatus(c.id, 'Remboursé'); }}
                            >
                              Rembourser
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive"
                            onClick={() => { if(confirm('Supprimer ce crédit ?')) deleteCredit(c.id); }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {credits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Landmark className="w-8 h-8 opacity-20" />
                        <p className="text-xs italic">Aucun crédit enregistré.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};