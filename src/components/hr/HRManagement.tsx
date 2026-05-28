import React, { useState } from 'react';
import { useChoir } from '@/context/ChoirContext';
import { VoicePart, Role, Status, Member, AttendanceStatus, AttendanceSession } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Search, Phone, Edit, CalendarCheck, Check, X, Clock, Camera, User, IdCard, Printer, Trash2, History, Eye, Calendar } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QRCodeSVG } from 'qrcode.react';
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const VOICE_PARTS: VoicePart[] = ['Soprano', 'Alto', 'Ténor', 'Basse', 'Maître de Chœur'];
const ROLES: Role[] = ['Simple choriste', 'Maître de Chœur', 'Président', 'Vice-président', 'Secrétaire', 'Trésorier', 'Commissariat aux comptes', 'Bureau', 'PCO'];
const STATUSES: Status[] = ['Actif', 'En congé', 'Inactif'];

export const HRManagement: React.FC = () => {
  const { members, attendanceSessions, addMember, updateMember, deleteMember, addAttendanceSession, deleteAttendanceSession } = useChoir();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPupitre, setFilterPupitre] = useState<string>('Tous');
  const [filterStatus, setFilterStatus] = useState<string>('Tous');
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberForm, setMemberForm] = useState<Omit<Member, 'id'>>({
    firstName: '',
    lastName: '',
    phone: '',
    voicePart: 'Soprano',
    role: 'Simple choriste',
    status: 'Actif',
    photoUrl: ''
  });

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceType, setAttendanceType] = useState<'Répétition' | 'Messe'>('Répétition');
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceStatus>>({});
  
  const [viewingSession, setViewingSession] = useState<AttendanceSession | null>(null);

  const filteredMembers = members.filter(m => {
    const matchesSearch = `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm);
    const matchesPupitre = filterPupitre === 'Tous' || m.voicePart === filterPupitre;
    const matchesStatus = filterStatus === 'Tous' || m.status === filterStatus;
    return matchesSearch && matchesPupitre && matchesStatus;
  });

  const handleSaveMember = () => {
    if (editingMember) {
      updateMember({ ...memberForm, id: editingMember.id });
    } else {
      addMember(memberForm);
    }
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setMemberForm({ 
      firstName: '', 
      lastName: '', 
      phone: '', 
      voicePart: 'Soprano', 
      role: 'Simple choriste', 
      status: 'Actif',
      photoUrl: ''
    });
    setEditingMember(null);
  };

  const startEdit = (member: Member) => {
    setEditingMember(member);
    setMemberForm({ ...member });
    setIsAdding(true);
  };

  const setAttendanceStatus = (memberId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [memberId]: status
    }));
  };

  const submitAttendance = () => {
    const activeMembers = members.filter(m => m.status === 'Actif');
    const finalRecords: Record<string, AttendanceStatus> = {};
    activeMembers.forEach(m => {
      finalRecords[m.id] = attendanceRecords[m.id] || 'Absent';
    });
    addAttendanceSession({
      date: attendanceDate,
      type: attendanceType,
      records: finalRecords
    });
    setAttendanceRecords({});
  };

  const printCard = () => {
    const printContent = document.getElementById('membership-card-preview');
    if (!printContent) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Impression Carte Membre</title>');
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('');
    printWindow.document.write(styles);
    printWindow.document.write('</head><body style="padding: 40px; display: flex; justify-content: center; align-items: center;">');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const calculateSessionStats = (session: AttendanceSession) => {
    const total = Object.keys(session.records).length;
    const present = Object.values(session.records).filter(r => r === 'Présent').length;
    const late = Object.values(session.records).filter(r => r === 'Retard').length;
    const absent = Object.values(session.records).filter(r => r === 'Absent').length;
    return { total, present, late, absent, rate: total > 0 ? Math.round(((present + late) / total) * 100) : 0 };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Ressources Humaines</h1>
          <p className="text-muted-foreground">Gérez vos membres et leurs présences.</p>
        </div>
        <Dialog open={isAdding} onOpenChange={(open) => {
          setIsAdding(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Nouveau Membre
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
            <DialogHeader className="p-6 bg-primary text-primary-foreground">
              <DialogTitle className="text-xl flex items-center gap-2">
                {editingMember ? <IdCard className="w-6 h-6 text-accent" /> : <UserPlus className="w-6 h-6 text-accent" />}
                {editingMember ? "Carte d'adhérent" : "Nouveau Choriste"}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-none bg-muted/50 border-b">
                <TabsTrigger value="info" className="data-[state=active]:bg-background">Infos</TabsTrigger>
                <TabsTrigger value="photo" className="data-[state=active]:bg-background">Photo</TabsTrigger>
                <TabsTrigger value="card" className="data-[state=active]:bg-background" disabled={!editingMember && !memberForm.firstName}>Carte</TabsTrigger>
              </TabsList>
              
              <div className="p-6">
                <TabsContent value="info" className="mt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom</label>
                      <Input value={memberForm.lastName} onChange={e => setMemberForm({...memberForm, lastName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prénom</label>
                      <Input value={memberForm.firstName} onChange={e => setMemberForm({...memberForm, firstName: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Téléphone</label>
                    <Input value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} placeholder="00 00 00 00 00" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pupitre</label>
                      <Select value={memberForm.voicePart} onValueChange={(v: VoicePart) => setMemberForm({...memberForm, voicePart: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {VOICE_PARTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Statut</label>
                      <Select value={memberForm.status} onValueChange={(v: Status) => setMemberForm({...memberForm, status: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rôle</label>
                    <Select value={memberForm.role} onValueChange={(v: Role) => setMemberForm({...memberForm, role: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="photo" className="mt-0 space-y-4 flex flex-col items-center py-4">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 border-4 border-accent/20 shadow-lg">
                      <AvatarImage src={memberForm.photoUrl} alt="Photo" className="object-cover" />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <User className="w-16 h-16" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="text-white w-8 h-8" />
                    </div>
                  </div>
                  <div className="w-full space-y-2 mt-4">
                    <label className="text-sm font-medium">URL de la Photo</label>
                    <Input 
                      value={memberForm.photoUrl} 
                      onChange={e => setMemberForm({...memberForm, photoUrl: e.target.value})} 
                      placeholder="https://exemple.com/photo.jpg" 
                    />
                    <p className="text-[10px] text-muted-foreground italic text-center">
                      Collez un lien d'image pour l'adhérent.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="card" className="mt-0">
                  <div className="flex justify-center py-4" id="membership-card-preview">
                    <div className="w-[400px] h-[240px] bg-white border-2 border-primary/20 rounded-xl shadow-xl overflow-hidden relative font-sans text-foreground">
                      <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <img src="https://storage.googleapis.com/dala-prod-public-storage/attachments/ccab1cf2-1794-4f2c-9ed3-8994780f7688/1779989907288_image.png" className="w-8 h-8 object-contain bg-white rounded-full p-0.5" alt="Logo" />
                          <div>
                            <p className="text-[10px] font-bold leading-tight uppercase">Chorale Notre Dame de la Paix</p>
                            <p className="text-[8px] opacity-80 italic">Béoumi - Côte d'Ivoire</p>
                          </div>
                        </div>
                        <div className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded font-black">
                          {editingMember ? `ID: ${editingMember.id}` : "CARTE"}
                        </div>
                      </div>

                      <div className="p-4 flex gap-4 h-full relative z-10">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-24 h-24 border-2 border-primary/10 rounded-lg overflow-hidden bg-muted">
                            {memberForm.photoUrl ? (
                              <img src={memberForm.photoUrl} className="w-full h-full object-cover" alt="Avatar" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <User className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-[9px] h-4 py-0 font-bold border-primary/20 bg-white/50">
                            {memberForm.status}
                          </Badge>
                        </div>

                        <div className="flex-1 space-y-1.5 mt-1">
                          <div>
                            <p className="text-[7px] uppercase text-muted-foreground font-bold">Nom & Prénoms</p>
                            <p className="text-sm font-black text-primary leading-tight">
                              {memberForm.lastName.toUpperCase()} {memberForm.firstName}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className="text-[7px] uppercase text-muted-foreground font-bold">Pupitre</p>
                              <p className="text-[10px] font-bold">{memberForm.voicePart}</p>
                            </div>
                            <div>
                              <p className="text-[7px] uppercase text-muted-foreground font-bold">Fonction</p>
                              <p className="text-[10px] font-bold">{memberForm.role}</p>
                            </div>
                          </div>
                          <div className="pt-1">
                             <p className="text-[7px] uppercase text-muted-foreground font-bold">Téléphone</p>
                             <p className="text-[10px] font-bold">{memberForm.phone}</p>
                          </div>
                        </div>

                        {/* QRCode moved up (bottom-8) and data enriched */}
                        <div className="absolute bottom-8 right-4 bg-white p-1 border border-primary/10 rounded shadow-sm">
                          <QRCodeSVG 
                            value={JSON.stringify({
                              ID: editingMember?.id || 'NOUVEAU',
                              Nom: memberForm.lastName.toUpperCase(),
                              Prenoms: memberForm.firstName,
                              Pupitre: memberForm.voicePart,
                              Fonction: memberForm.role,
                              Telephone: memberForm.phone,
                              Statut: memberForm.status
                            })} 
                            size={65}
                            level="H"
                          />
                        </div>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] rotate-12 pointer-events-none">
                         <img src="https://storage.googleapis.com/dala-prod-public-storage/attachments/ccab1cf2-1794-4f2c-9ed3-8994780f7688/1779989907288_image.png" className="w-32 h-32 grayscale" alt="Watermark" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 mt-2">
                    <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={printCard}>
                       <Printer className="w-3 h-3" />
                       Imprimer
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
            
            <DialogFooter className="p-6 bg-muted/20 border-t flex gap-2">
              {editingMember && (
                <Button variant="destructive" size="icon" onClick={() => { if(confirm('Supprimer ce membre ?')) { deleteMember(editingMember.id); setIsAdding(false); resetForm(); } }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button onClick={handleSaveMember} className="flex-1">
                {editingMember ? "Mettre à jour" : "Enregistrer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="annuaire" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="annuaire">Annuaire</TabsTrigger>
          <TabsTrigger value="presences">Pointage</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>
        
        <TabsContent value="annuaire" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                className="pl-10" 
                placeholder="Rechercher par nom..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterPupitre} onValueChange={setFilterPupitre}>
              <SelectTrigger><SelectValue placeholder="Pupitre" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Tous les pupitres</SelectItem>
                {VOICE_PARTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Tous les statuts</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[60px]"></TableHead>
                  <TableHead>Nom & Prénom</TableHead>
                  <TableHead>Pupitre</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Avatar className="w-8 h-8 border border-muted">
                        <AvatarImage src={member.photoUrl} alt="Photo" className="object-cover" />
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {member.lastName[0]}{member.firstName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[150px]">{member.lastName} {member.firstName}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" /> {member.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 h-5",
                        member.voicePart === 'Soprano' ? "border-pink-200 text-pink-700 bg-pink-50" :
                        member.voicePart === 'Alto' ? "border-purple-200 text-purple-700 bg-purple-50" :
                        member.voicePart === 'Ténor' ? "border-blue-200 text-blue-700 bg-blue-50" :
                        "border-slate-200 text-slate-700 bg-slate-50"
                      )}>
                        {member.voicePart}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs truncate max-w-[100px]">{member.role}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-[10px] px-1.5 h-5",
                        member.status === 'Actif' ? "bg-green-100 text-green-700 hover:bg-green-100" :
                        member.status === 'En congé' ? "bg-amber-100 text-amber-700 hover:bg-amber-100" :
                        "bg-red-100 text-red-700 hover:bg-red-100"
                      )}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(member)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Aucun membre trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="presences" className="pt-4">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-end mb-8">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Type</label>
                <Select value={attendanceType} onValueChange={(v: any) => setAttendanceType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Répétition">Répétition</SelectItem>
                    <SelectItem value="Messe">Messe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => setAttendanceRecords({})}>Vider</Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold mb-4 border-b pb-2">Membres Actifs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {members.filter(m => m.status === 'Actif').map(member => (
                  <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/10 transition-colors gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.photoUrl} alt="Avatar" className="object-cover" />
                        <AvatarFallback className="text-[10px]">
                          {member.lastName[0]}{member.firstName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold">{member.lastName} {member.firstName}</p>
                        <p className="text-[10px] text-muted-foreground">{member.voicePart}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg">
                      <label className="flex items-center gap-1.5 cursor-pointer group">
                        <Checkbox 
                          id={`present-${member.id}`}
                          checked={attendanceRecords[member.id] === 'Présent'} 
                          onCheckedChange={() => setAttendanceStatus(member.id, 'Présent')}
                        />
                        <span className={cn(
                          "text-[10px] font-bold transition-colors",
                          attendanceRecords[member.id] === 'Présent' ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}>Présent</span>
                      </label>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer group">
                        <Checkbox 
                          id={`late-${member.id}`}
                          checked={attendanceRecords[member.id] === 'Retard'} 
                          onCheckedChange={() => setAttendanceStatus(member.id, 'Retard')}
                        />
                        <span className={cn(
                          "text-[10px] font-bold transition-colors",
                          attendanceRecords[member.id] === 'Retard' ? "text-amber-600" : "text-muted-foreground group-hover:text-foreground"
                        )}>Retard</span>
                      </label>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer group">
                        <Checkbox 
                          id={`absent-${member.id}`}
                          checked={attendanceRecords[member.id] === 'Absent'} 
                          onCheckedChange={() => setAttendanceStatus(member.id, 'Absent')}
                        />
                        <span className={cn(
                          "text-[10px] font-bold transition-colors",
                          attendanceRecords[member.id] === 'Absent' ? "text-destructive" : "text-muted-foreground group-hover:text-foreground"
                        )}>Absent</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t flex justify-end">
              <Button onClick={submitAttendance} className="bg-primary px-8">
                <CalendarCheck className="w-4 h-4 mr-2" />
                Enregistrer la séance
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="historique" className="pt-4">
          <div className="space-y-4">
            {attendanceSessions.length === 0 ? (
              <div className="bg-card p-12 rounded-lg border border-dashed text-center flex flex-col items-center gap-4">
                <div className="p-4 bg-muted rounded-full">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Aucune séance enregistrée</p>
                  <p className="text-sm text-muted-foreground">Les pointages apparaîtront ici.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendanceSessions.map(session => {
                  const stats = calculateSessionStats(session);
                  return (
                    <div key={session.id} className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={session.type === 'Messe' ? 'default' : 'secondary'} className="text-[9px]">
                            {session.type}
                          </Badge>
                          <span className="text-xs font-bold">{format(new Date(session.date), 'dd MMMM yyyy', { locale: fr })}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewingSession(session)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if(confirm('Supprimer cette séance ?')) deleteAttendanceSession(session.id); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-around text-center">
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase">Présents</p>
                          <p className="text-lg font-black text-green-600">{stats.present + stats.late}</p>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase">Absents</p>
                          <p className="text-lg font-black text-red-600">{stats.absent}</p>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase">Taux</p>
                          <p className="text-lg font-black text-primary">{stats.rate}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Dialog open={!!viewingSession} onOpenChange={(open) => !open && setViewingSession(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Détails du pointage - {viewingSession && format(new Date(viewingSession.date), 'dd/MM/yyyy')}
                </DialogTitle>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto pr-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Choriste</TableHead>
                      <TableHead className="text-xs">Pupitre</TableHead>
                      <TableHead className="text-right text-xs">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingSession && members.filter(m => viewingSession.records[m.id]).map(member => (
                      <TableRow key={member.id} className="h-10">
                        <TableCell className="text-xs font-semibold">{member.lastName} {member.firstName}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{member.voicePart}</TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] px-1.5 h-5",
                              viewingSession.records[member.id] === 'Présent' ? "border-green-200 text-green-700 bg-green-50" :
                              viewingSession.records[member.id] === 'Retard' ? "border-amber-200 text-amber-700 bg-amber-50" :
                              "border-red-200 text-red-700 bg-red-50"
                            )}
                          >
                            {viewingSession.records[member.id]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingSession(null)}>Fermer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};