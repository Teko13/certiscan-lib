/**
 * Documentation representation - JavaScript port of doc.py
 */

import { Header } from './header.js';
import { C40Message } from './message.js';

// Simple base32 decode implementation
function b32Decode(str) {
    const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let index = 0;
    const result = [];
    
    // Add padding if needed
    while (str.length % 8 !== 0) {
        str += '=';
    }
    
    for (let i = 0; i < str.length; i++) {
        const char = str[i].toUpperCase();
        if (char === '=') break;
        
        const charIndex = base32Alphabet.indexOf(char);
        if (charIndex === -1) continue;
        
        value = (value << 5) | charIndex;
        bits += 5;
        
        if (bits >= 8) {
            result[index++] = (value >>> (bits - 8)) & 0xFF;
            bits -= 8;
        }
    }
    
    return new Uint8Array(result);
}

export class TwoDDoc {
    constructor(header, message, signature, signedData = null, extra = null) {
        this.header = header;
        this.message = message;
        this.signature = signature;
        this.signedData = signedData;
        this.extra = extra;
    }

    static async fromCode(doc) {
        /**
         * Load a 2D-Doc from its ASCII form, as outputted by a barcode reader
         */
        const header = Header.fromCode(doc);
        
        if (header.mode === "c40") {
            const remainingData = doc.substring(header.length);
            
            // Try different separators
            let dataAndSign = remainingData.split('\x1f', 2);
            if (dataAndSign.length < 2) {
                // Look for the pattern where signature starts with digit followed by base32
                const base32Pattern = /[0-9][A-Z2-7]{20,}$/;
                const match = remainingData.match(base32Pattern);
                
                if (match) {
                    const signatureStart = remainingData.lastIndexOf(match[0]);
                    const data = remainingData.substring(0, signatureStart);
                    const sign = remainingData.substring(signatureStart);
                    dataAndSign = [data, sign];
                } else {
                    dataAndSign = remainingData.split('U', 2);
                }
            }
            
            const data = dataAndSign[0];
            const sign = dataAndSign[1];
            if (!sign) {
                throw new Error("Invalid 2D-Doc format: missing signature separator");
            }
            const signature = b32Decode(sign + "=");
            const message = await C40Message.fromCode(header.perimeterId, data);
            const signedData = new TextEncoder().encode(doc.substring(0, header.length) + data);
            
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
