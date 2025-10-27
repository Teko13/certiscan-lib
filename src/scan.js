/**
 * Decoder for 2D-Doc QR codes - JavaScript version
 */

import { TwoDDoc } from './doc.js';
import { internal } from './keychain.js';

function jsonSerializer(obj) {
    /**
     * Fonction de sérialisation personnalisée pour convertir les objets non sérialisables en JSON.
     */
    if (obj instanceof Date) {
        // Return date in YYYY-MM-DD format like Python does
        const year = obj.getFullYear();
        const month = (obj.getMonth() + 1).toString().padStart(2, '0');
        const day = obj.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } else if (obj && typeof obj === 'object' && obj.constructor === Object) {
        return obj.toString();
    } else {
        return obj.toString();
    }
}

export function decoderQrCode(codeBrut) {
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
    
    try {
        // Gérer le cas où le séparateur est ^_ au lieu de \x1f
        if (codeBrut.includes('^_') && !codeBrut.includes('\x1f')) {
            // Remplacer ^_ par \x1f pour la compatibilité
            codeBrut = codeBrut.replace(/\^_/g, '\x1f');
        }
        
        const doc = TwoDDoc.fromCode(codeBrut);
        result.success = true;
    } catch (e) {
        result.error = e.message;
        return result;
    }

    // ---- HEADER ----
    const headerData = {};
    const doc = TwoDDoc.fromCode(codeBrut);
    
    // Extract header properties using the same logic as Python
    // Use snake_case to match Python version exactly
    const headerProps = [
        { js: 'version', py: 'version' },
        { js: 'caId', py: 'ca_id' },
        { js: 'certId', py: 'cert_id' },
        { js: 'emitDate', py: 'emit_date' },
        { js: 'signDate', py: 'sign_date' },
        { js: 'docTypeId', py: 'doc_type_id' },
        { js: 'perimeterId', py: 'perimeter_id' },
        { js: 'countryId', py: 'country_id' },
        { js: 'length', py: 'length' },
        { js: 'mode', py: 'mode' }
    ];
    
    for (const prop of headerProps) {
        if (doc.header[prop.js] !== undefined) {
            let value = doc.header[prop.js];
            // Convertir les objets non sérialisables en chaînes
            if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean' && value !== null) {
                value = jsonSerializer(value);
            }
            headerData[prop.py] = value;
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
                try {
                    // on essaye de récupérer le nom du champ depuis la définition si dispo
                    let name = item.definition.label || item.definition.name;
                    if (!name) {
                        name = `Champ_${i + 1}`;
                    }

                    let value = item.value;
                    // Convertir les objets non sérialisables en chaînes
                    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean' && value !== null) {
                        value = jsonSerializer(value);
                    }
                    dataDict[name] = value;
                } catch (e) {
                    dataDict[`Champ_${i + 1}`] = item.value || '';
                }
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
        console.log("Exemple: node scan.js 'VOTRE_CHAINE_2D_DOC_ICI'");
        process.exit(1);
    }
    
    const codeBrut = process.argv[2];
    const result = decoderQrCode(codeBrut);
    console.log(JSON.stringify(result, null, 2));
}

export default { decoderQrCode };
