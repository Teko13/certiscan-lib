/**
 * Documentation representation.
 */

import { Header } from './header.js';
import { C40Message } from './message.js';

function base32Decode(str) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0;
    let value = 0;
    
    // Add padding if needed
    const padding = (8 - (str.length % 8)) % 8;
    str += '='.repeat(padding);
    
    for (const char of str) {
        const index = alphabet.indexOf(char.toUpperCase());
        if (index === -1) continue;
        
        value = (value << 5) | index;
        bits += 5;
        
        while (bits >= 8) {
            result += String.fromCharCode((value >> (bits - 8)) & 0xFF);
            bits -= 8;
        }
    }
    
    return result;
}

export class TwoDDoc {
    /**
     * A 2D-Doc document
     */
    constructor(header, message, signature, signedData = null, extra = null) {
        this.header = header;
        this.message = message;
        this.signature = signature;
        this.signedData = signedData;
        this.extra = extra;
    }

    static fromCode(doc) {
        /**
         * Load a 2D-Doc from its ASCII form, as outputted by a barcode reader
         */
        const header = Header.fromCode(doc);
        if (header.mode === "c40") {
            // Try different separators
            let dataAndSign = doc.substring(header.length).split('\x1f', 2);
            if (dataAndSign.length < 2) {
                dataAndSign = doc.substring(header.length).split('U', 2);
            }
            const data = dataAndSign[0];
            const sign = dataAndSign[1];
            if (!sign) {
                throw new Error("No signature found in document");
            }
            const signature = base32Decode(sign);
            const message = C40Message.fromCode(header.perimeterId, data);
            const signedData = (doc.substring(0, header.length) + data);
            
            return new TwoDDoc(header, message, signature, signedData);
        } else {
            throw new Error("Binary code not supported fully yet");
        }
    }

    signatureIsValid(keychain) {
        /**
         * Check signature against given keychain. If key is not
         * available, KeyError is raised.
         */
        const cert = keychain.lookup(this.header.caId, this.header.certId);
        return cert.pubkey.signatureIsValid(this.signedData, this.signature);
    }
}

export default TwoDDoc;
