# CertiScan - Décodage de QR codes 2D-Doc

[![npm version](https://badge.fury.io/js/%40teko13%2Fcertiscan.svg)](https://badge.fury.io/js/%40teko13%2Fcertiscan)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Bibliothèque JavaScript pour le décodage et la vérification de QR codes 2D-Doc conformes aux spécifications ANTS françaises.

## Installation

### Via npm (recommandé)

```bash
npm install @teko13/certiscan
```

### Installation locale (développement)

```bash
git clone https://github.com/teko13/certiscan.git
cd certiscan
npm install
```

## Utilisation

CertiScan peut être utilisé de plusieurs façons :

### 1. Utilisation en ligne de commande

#### Avec npx (recommandé)

```bash
npx @teko13/certiscan "VOTRE_CHAINE_2D_DOC_ICI"
```

#### Installation globale

```bash
npm install -g @teko13/certiscan
certiscan "VOTRE_CHAINE_2D_DOC_ICI"
```

#### Installation locale

```bash
node src/scan.js "VOTRE_CHAINE_2D_DOC_ICI"
```

Cette commande affichera un JSON structuré contenant :

- `success` : booléen indiquant si le décodage a réussi
- `error` : message d'erreur si le décodage a échoué
- `header` : objet avec les informations d'en-tête (version, ca_id, cert_id, etc.)
- `message` : objet avec les données extraites (dataset)
- `signature` : objet avec les informations de validation de la signature

### 2. Utilisation comme dépendance dans un projet

#### Import ES6

```javascript
import { decoderQrCode } from "@teko13/certiscan";

// Décoder un QR code 2D-Doc
const result = decoderQrCode("VOTRE_CHAINE_2D_DOC_ICI");

if (result.success) {
  console.log("Décodage réussi !");
  console.log("En-tête :", result.header);
  console.log("Données :", result.message);
  console.log("Signature valide :", result.signature.valid);
} else {
  console.error("Erreur de décodage :", result.error);
}
```

#### Import CommonJS

```javascript
const { decoderQrCode } = require("@teko13/certiscan");

const result = decoderQrCode("VOTRE_CHAINE_2D_DOC_ICI");
console.log(result);
```

### 3. API avancée

Pour un contrôle plus fin, vous pouvez utiliser directement les classes internes :

```javascript
import { TwoDDoc, internal } from "@teko13/certiscan";

const doc = TwoDDoc.fromCode("VOTRE_CHAINE_2D_DOC_ICI");

console.log(doc.header.docType().userType);
console.log(doc.header.docType().emitterType);
console.log(doc.message.dataset);
console.log(doc.message.dataset[0].definition.name);
console.log(doc.message.dataset[0].value);

const chain = internal();
console.log(doc.header.caId);
console.log(doc.header.certId);
console.log(doc.signatureIsValid(chain));
```

## Exemples d'utilisation

### Exemple complet avec gestion d'erreurs

```javascript
import { decoderQrCode } from "@teko13/certiscan";

async function processQRCode(qrCodeString) {
  try {
    const result = decoderQrCode(qrCodeString);

    if (result.success) {
      console.log("✅ Décodage réussi");
      console.log("📄 Type de document:", result.header.doc_type_id);
      console.log("📅 Date d'émission:", result.header.emit_date);
      console.log("🔐 Signature valide:", result.signature.valid);
      console.log("📊 Données:", result.message.dataset);

      return result;
    } else {
      console.error("❌ Erreur de décodage:", result.error);
      return null;
    }
  } catch (error) {
    console.error("💥 Erreur inattendue:", error);
    return null;
  }
}

// Utilisation
const qrCode = "VOTRE_CHAINE_2D_DOC_ICI";
processQRCode(qrCode);
```

## Outils de développement

### Outil de dump

Pour analyser les fichiers de test :

```bash
node src/dump.js src/samples/spec/3.1.3/15.2.2/17.txt
```

## Tests

```bash
npm test
```

## Liens utiles

- **Package npm** : https://www.npmjs.com/package/@teko13/certiscan
- **Repository GitHub** : https://github.com/teko13/certiscan
- **Documentation ANTS** : https://ants.gouv.fr/

## Limitations

Cette bibliothèque est une traduction fidèle de la bibliothèque Python originale. Certaines fonctionnalités peuvent être simplifiées ou pas entièrement implémentées dans la version JavaScript :

- Le parsing des certificats est simplifié (nécessiterait un parsing ASN.1 approprié pour un usage en production)
- La vérification de signature est une implémentation de base
- Le support de certains formats binaires peut être limité

## Licence

MIT
