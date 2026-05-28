import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, Archive, ScrollText, ShieldAlert, Users } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const ArchivesModule: React.FC = () => {
  const archives = [
    {
      title: "Statuts et Règlements",
      description: "Document officiel régissant l'organisation et le fonctionnement de la chorale.",
      date: "2026",
      type: "PDF",
      url: "https://storage.googleapis.com/dala-prod-public-storage/attachments/ccab1cf2-1794-4f2c-9ed3-8994780f7688/1779990743116_STATUTS_DE_LA_CHORALE_NDP_DE_BEOUMI.pdf",
      icon: ScrollText,
      category: "Fondamental",
      tags: ["Organisation", "Règles", "Missions"]
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Archive className="w-8 h-8" />
          Archives & Documents
        </h1>
        <p className="text-muted-foreground mt-2">
          Consultez et téléchargez les documents officiels et historiques de la Chorale Notre Dame de la Paix.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {archives.map((doc, idx) => (
          <Card key={idx} className="group hover:shadow-xl transition-all duration-300 border-primary/10 overflow-hidden">
            <div className="h-2 bg-primary/20 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover:scale-110 transition-transform">
                  <doc.icon className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                  {doc.category}
                </Badge>
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">{doc.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2">{doc.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {doc.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-[10px] font-normal border-primary/10">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-xs"
                  asChild
                >
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" />
                    Consulter
                  </a>
                </Button>
                <Button 
                  size="sm" 
                  className="gap-2 text-xs bg-primary hover:bg-primary/90"
                  asChild
                >
                  <a href={doc.url} download>
                    <Download className="w-3 h-3" />
                    Télécharger
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Placeholders for future documents */}
        <div className="border-2 border-dashed border-primary/5 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-muted/10 opacity-60">
           <div className="p-4 bg-muted rounded-full mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
           </div>
           <p className="text-sm font-semibold text-muted-foreground">Prochains Documents</p>
           <p className="text-[10px] text-muted-foreground max-w-[150px] mt-1">
             PV d'assemblée, Rapports annuels, Partitions chorales...
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card className="bg-primary/5 border-primary/10">
           <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5 text-primary" />
                 Accès Restreint
              </CardTitle>
           </CardHeader>
           <CardContent className="text-sm text-muted-foreground italic">
              "Conformément aux Statuts (Article 12), l'accès aux documents financiers détaillés et aux rapports moraux est réservé aux membres à jour de leurs cotisations et disposant des habilitations nécessaires."
           </CardContent>
        </Card>

        <Card className="bg-accent/5 border-accent/10">
           <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                 <Users className="w-5 h-5 text-accent" />
                 Mise à jour des Archives
              </CardTitle>
           </CardHeader>
           <CardContent className="text-sm text-muted-foreground italic">
              "Le Secrétariat Général est responsable du versement annuel des nouveaux documents aux archives numériques de la chorale."
           </CardContent>
        </Card>
      </div>
    </div>
  );
};