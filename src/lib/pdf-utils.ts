import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Transaction, Member } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Converts a number to French words.
 * Handles numbers up to 999,999,999.
 */
function numberToFrenchWords(n: number): string {
  if (n === 0) return 'zéro';

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  function convert(num: number): string {
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const q = Math.floor(num / 10);
      const r = num % 10;
      if (q === 7) return 'soixante' + (r === 1 ? '-et-onze' : '-' + teens[r]);
      if (q === 8) {
        if (r === 0) return 'quatre-vingts';
        return 'quatre-vingt-' + units[r];
      }
      if (q === 9) return 'quatre-vingt-' + teens[r];
      if (r === 0) return tens[q];
      if (r === 1) return tens[q] + '-et-un';
      return tens[q] + '-' + units[r];
    }
    if (num < 1000) {
      const q = Math.floor(num / 100);
      const r = num % 100;
      const h = q === 1 ? 'cent' : units[q] + ' cent' + (r === 0 ? 's' : '');
      return h + (r === 0 ? '' : ' ' + convert(r));
    }
    if (num < 1000000) {
      const q = Math.floor(num / 1000);
      const r = num % 1000;
      const t = q === 1 ? 'mille' : convert(q) + ' mille';
      return t + (r === 0 ? '' : ' ' + convert(r));
    }
    if (num < 1000000000) {
      const q = Math.floor(num / 1000000);
      const r = num % 1000000;
      const m = q === 1 ? 'un million' : convert(q) + ' millions';
      return m + (r === 0 ? '' : ' ' + convert(r));
    }
    return num.toString();
  }

  const result = convert(n).trim().replace(/ -/g, '-').replace(/- /g, '-');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export const generateReceiptPDF = (transaction: Transaction, member?: Member) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const primaryColor = [30, 58, 138]; // Blue Peace
  const accentColor = [212, 175, 55]; // Golden

  // Header Background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 148, 40, 'F');

  // Logo
  const logoUrl = 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/4fbf6471-3232-4b8c-be90-2e48c4d6965f/choir-logo-a3ac4ce4-1779966833282.webp';
  try {
    doc.addImage(logoUrl, 'WEBP', 10, 5, 25, 25);
  } catch (e) {
    console.error("Logo could not be added to PDF", e);
  }

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CHORALE NOTRE DAME DE LA PAIX', 40, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Béoumi - Côte d'Ivoire", 40, 22);
  doc.text('REÇU DE CAISSE', 40, 32);

  // Transaction Details Box
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(10, 50, 128, 95, 3, 3, 'S');

  // Generate Reference with Date, Hour, Minute
  const now = new Date();
  const timestamp = format(now, 'yyyyMMdd-HHmm');
  const reference = `REF-${timestamp}-${transaction.id.toUpperCase()}`;

  // Labels and Values
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Référence:', 15, 65);
  doc.text('Date:', 15, 75);
  doc.text('Nature:', 15, 85);
  doc.text('Catégorie:', 15, 95);
  doc.text('Montant:', 15, 105);
  doc.text('Description:', 15, 120);

  doc.setFont('helvetica', 'normal');
  doc.text(reference, 50, 65);
  doc.text(format(new Date(transaction.date), 'dd MMMM yyyy', { locale: fr }), 50, 75);
  doc.text(transaction.type === 'Recette' ? "ENTRÉE D'ARGENT" : "SORTIE D'ARGENT", 50, 85);
  doc.text(transaction.category, 50, 95);
  
  // Numerical amount
  doc.setFont('helvetica', 'bold');
  doc.text(`${transaction.amount.toLocaleString()} FCFA`, 50, 105);
  
  // Amount in words
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const amountInWords = numberToFrenchWords(transaction.amount) + ' francs CFA';
  doc.text(`(Soit : ${amountInWords})`, 50, 110, { maxWidth: 80 });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(transaction.description, 50, 120, { maxWidth: 80 });

  if (member) {
    doc.setFont('helvetica', 'bold');
    doc.text('Membre:', 15, 135);
    doc.setFont('helvetica', 'normal');
    doc.text(`${member.lastName} ${member.firstName}`, 50, 135);
  }

  // Amount Box (Prominent at the bottom)
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 155, 118, 20, 'F');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const amountText = `${transaction.amount.toLocaleString()} FCFA`;
  doc.text('TOTAL:', 25, 168);
  doc.text(amountText, 125, 168, { align: 'right' });

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Généré automatiquement par le système de gestion de la chorale.', 74, 185, { align: 'center' });
  doc.text(`Édité le ${format(now, 'dd/MM/yyyy HH:mm')}`, 74, 190, { align: 'center' });

  // Download
  doc.save(`Recu_${transaction.type}_${format(new Date(transaction.date), 'yyyyMMdd')}_${transaction.id}.pdf`);
};