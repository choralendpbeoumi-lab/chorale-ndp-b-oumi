# Plan d'ajustement de la carte d'adhérent

## 1. Ajustement de la position du QR Code
- Dans `src/components/hr/HRManagement.tsx`, localiser le bloc du QR Code sur la carte d'adhérent.
- Changer la classe CSS de positionnement de `bottom-8` à `bottom-10` pour remonter légèrement le QR Code.

## 2. Enrichissement des données du QR Code
- Modifier la propriété `value` du composant `QRCodeSVG`.
- Inclure les informations d'identité complètes du membre :
    - ID
    - Nom Complet (Nom et Prénoms)
    - Pupitre
    - Fonction (Rôle)
    - Téléphone
    - Statut actuel
- Utiliser des clés explicites pour le scan (ID, Nom, Pupitre, Rôle, Tel, Statut).

## 3. Validation
- Vérifier que le QR Code est bien positionné et contient toutes les informations demandées lors d'un scan.