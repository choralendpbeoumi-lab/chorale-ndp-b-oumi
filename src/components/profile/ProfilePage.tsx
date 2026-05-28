import React from 'react';
import { useChoir } from '@/context/ChoirContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, MapPin, Calendar, Info, ShieldCheck, Mail, Phone } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const ProfilePage: React.FC = () => {
  const { members } = useChoir();
  const activeCount = members.filter(m => m.status === 'Actif').length;

  const logoUrl = "https://storage.googleapis.com/dala-prod-public-storage/attachments/ccab1cf2-1794-4f2c-9ed3-8994780f7688/1779989907288_image.png";

  return (
    <div className="relative min-h-[calc(100-200px)] rounded-3xl overflow-hidden shadow-2xl border border-primary/10 bg-background">
      {/* Background with Logo Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none z-0"
        style={{
          backgroundImage: `url(${logoUrl})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '80% auto',
        }}
      />

      <div className="relative z-10">
        {/* Header/Cover Section */}
        <div className="h-48 bg-primary relative">
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-xl border-4 border-white overflow-hidden">
              <img 
                src={logoUrl} 
                alt="Choir Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="pb-4">
              <h1 className="text-3xl font-black text-white drop-shadow-md">Notre Dame de la Paix</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-accent text-accent-foreground font-bold">CNDP Béoumi</Badge>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Béoumi, Côte d'Ivoire
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="pt-24 px-8 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/10 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-primary">
                  <Info className="w-5 h-5" />
                  À propos de la Chorale
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                La Chorale Notre Dame de la Paix de Béoumi est un ensemble vocal dédié à l'animation liturgique et au partage de la foi par le chant. 
                Fondée sur des valeurs de fraternité et de paix, notre mission est de louer Dieu et d'édifier les fidèles à travers un répertoire varié.
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-[10px] uppercase font-black text-primary/50">Membres Actifs</p>
                    <p className="text-2xl font-black text-primary">{activeCount}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-[10px] uppercase font-black text-primary/50">Année de Fondation</p>
                    <p className="text-2xl font-black text-primary">1998</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-primary/10 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    Répétitions
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-dashed">
                    <span>Mardi</span>
                    <span className="font-bold text-primary">18h30 - 20h30</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-dashed">
                    <span>Jeudi</span>
                    <span className="font-bold text-primary">18h30 - 20h30</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Samedi</span>
                    <span className="font-bold text-primary">15h00 - 17h00</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    Administration
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-dashed">
                    <span>Statut</span>
                    <Badge variant="outline" className="text-[9px] border-green-200 text-green-700 bg-green-50">Association Agréée</Badge>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-dashed">
                    <span>Trésorerie</span>
                    <span className="font-bold text-primary">Transparence Totale</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Révision</span>
                    <span className="font-bold text-primary">Mensuelle</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/10 shadow-sm bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                   Contact & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Phone className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] opacity-60">Téléphone</p>
                    <p className="text-sm font-bold">+225 07 00 00 00 00</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Mail className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] opacity-60">Email</p>
                    <p className="text-sm font-bold">contact@cndp-beoumi.ci</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Music className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] opacity-60">Localisation</p>
                    <p className="text-sm font-bold">Paroisse Notre Dame, Béoumi</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 bg-accent/10 border border-accent/20 rounded-2xl">
              <p className="text-xs text-accent-foreground font-black uppercase mb-4 tracking-tighter">Notre Devise</p>
              <blockquote className="text-lg font-black text-primary leading-tight italic">
                "Avec Marie, louons Jésus pour Sa Paix Infinie."
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};