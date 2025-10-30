/**
 * Main decoder module - JavaScript port of dec.py
 */

import { TwoDDoc } from './doc.js';
import { internal } from './keychain.js';

function jsonSerializer(obj) {
    /**
     * Fonction de sérialisation personnalisée pour convertir les objets non sérialisables en JSON.
     */
    if (obj instanceof Date) {
        return obj.toISOString();
    } else if (obj && typeof obj === 'object' && obj.constructor === Object) {
        return obj.toString();
    } else {
        return String(obj);
    }
}

export async function decoderQrCode(codeBrut) {
    /**
     * Décode un QR code 2D-Doc et retourne un JSON structuré avec les informations.
     * 
     * Args:
     *     codeBrut (string): La chaîne brute du QR code 2D-Doc
     *     
     * Returns:
     *     object: JSON structuré contenant header, message et signature
     */
    codeBrut = codeBrut.trim().replace(/\r/g, "").replace(/\n/g, "");
    
    const result = {
        success: false,
        error: null,
        header: {},
        message: {},
        signature: {
            valid: false,
            error: null
        }
    };
    
    let doc;
    try {
        // Gérer le cas où le séparateur est ^_ au lieu de \x1f
        if (codeBrut.includes('^_') && !codeBrut.includes('\x1f')) {
            // Remplacer ^_ par \x1f pour la compatibilité
            codeBrut = codeBrut.replace(/\^_/g, '\x1f');
        }
        
        doc = await TwoDDoc.fromCode(codeBrut);
        result.success = true;
    } catch (e) {
        result.error = e.message;
        return result;
    }

    // ---- HEADER ----
    const headerData = {};
    const header = doc.header;
    
    // Extract header properties
    const headerProps = ['version', 'caId', 'certId', 'emitDate', 'signDate', 'docTypeId', 'perimeterId', 'countryId'];
    for (const prop of headerProps) {
        if (header.hasOwnProperty(prop)) {
            let value = header[prop];
            // Convertir les objets non sérialisables en chaînes
            if (value !== null && value !== undefined && 
                typeof value !== 'string' && typeof value !== 'number' && 
                typeof value !== 'boolean') {
                value = jsonSerializer(value);
            }
            headerData[prop] = value;
        }
    }
    result.header = headerData;

    // ---- MESSAGE ----
    const msg = doc.message;
    if (!msg) {
        result.message = { error: "Aucun message trouvé" };
        return result;
    }

    // si dataset existe
    if (msg.dataset) {
        const dataset = msg.dataset;
        if (Array.isArray(dataset) && dataset.length > 0) {
            const dataDict = {};
            for (let i = 0; i < dataset.length; i++) {
                const item = dataset[i];
                let name = null;
                try {
                    // on essaye de récupérer le nom du champ depuis la définition si dispo
                    if (item.definition) {
                        name = item.definition.label || item.definition.name || null;
                    }
                } catch (e) {
                    name = null;
                }
                if (!name) {
                    name = `Champ_${i + 1}`;
                }

                let value = item.value || null;
                // Convertir les objets non sérialisables en chaînes
                if (value !== null && value !== undefined && 
                    typeof value !== 'string' && typeof value !== 'number' && 
                    typeof value !== 'boolean') {
                    value = jsonSerializer(value);
                }
                dataDict[name] = value;
            }

            result.message = {
                dataset: dataDict,
                count: dataset.length
            };
        } else {
            result.message = { error: "dataset vide ou invalide" };
        }
    } else {
        result.message = { error: "Aucun champ dataset détecté dans le message" };
    }

    // ---- SIGNATURE ----
    try {
        const chain = internal();
        result.signature.valid = doc.signatureIsValid(chain);
    } catch (e) {
        result.signature.error = e.message;
    }

    return result;
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    if (process.argv.length !== 3) {
        console.log("Usage: node scan.js <CHAINE-2D-DOC>");
        console.log("Exemple: node scan.js '<CHAINE-2D-DOC-EXEMPLE>'");
        process.exit(1);
    }
    
    const codeBrut = process.argv[2];
    const result = await decoderQrCode(codeBrut);
    console.log(JSON.stringify(result, null, 2));
}
