/**
 * 2D-Doc header representation - JavaScript port of header.py
 */

import { c40 } from './c40.js';

const EPOCH = new Date(2000, 0, 1); // January 1, 2000

function dateParse(code) {
    if (code instanceof Uint8Array && code.length === 3) {
        const v = (code[0] << 16) | (code[1] << 8) | code[2];
        const year = v % 10000;
        const month = Math.floor(v / 1000000);
        const day = Math.floor((v / 10000) % 100);
        return new Date(year, month - 1, day);
    }
    if (typeof code === 'string') {
        const codeInt = parseInt(code, 16);
        const date = new Date(EPOCH);
        date.setDate(date.getDate() + codeInt);
        return date;
    }
    if (typeof code === 'number') {
        const date = new Date(EPOCH);
        date.setDate(date.getDate() + code);
        return date;
    }
    throw new Error(`Unparsable type ${typeof code}`);
}

function dateEncode(d, mode = "c40") {
    if (mode === "c40") {
        const days = Math.floor((d - EPOCH) / (1000 * 60 * 60 * 24));
        return days.toString(16).toUpperCase().padStart(4, '0');
    } else if (mode === "bin") {
        const v = d.getMonth() * 1000000 + d.getDate() * 10000 + d.getFullYear();
        const buffer = new Uint8Array(3);
        buffer[0] = (v >> 16) & 0xFF;
        buffer[1] = (v >> 8) & 0xFF;
        buffer[2] = v & 0xFF;
        return buffer;
    } else {
        throw new Error(mode);
    }
}

export class Header {
    constructor(version, caId, certId, emitDate, signDate, docTypeId, perimeterId = '01', countryId = "FR") {
        this.version = version;
        this.caId = caId;
        this.certId = certId;
        this.emitDate = emitDate;
        this.signDate = signDate;
        this.docTypeId = docTypeId;
        this.perimeterId = perimeterId;
        this.countryId = countryId;
    }

    static fromCode(code) {
        /**
         * Parse a header from raw data, either ascii string (C40 mode) or
         * blob (binary mode). Supports all versions from 1 to 4.
         */
        if (typeof code === 'string' && code.substring(0, 2) === "DC") {
            const version = parseInt(code.substring(2, 4), 10);
            if (!(1 <= version && version <= 4)) {
                throw new Error("Unsupported 2D-Doc version");
            }

            const caId = code.substring(4, 8);
            const certId = code.substring(8, 12);
            const emitDate = dateParse(code.substring(12, 16));
            const signDate = dateParse(code.substring(16, 20));
            const docTypeId = code.substring(20, 22);
            const perimeterId = version >= 3 ? parseInt(code.substring(22, 24)) : 1;
            const countryId = version >= 4 ? code.substring(24, 26) : "FR";

            return new Header(version, caId, certId, emitDate, signDate, docTypeId, perimeterId, countryId);

        } else if (code instanceof Uint8Array && code[0] === 0xdc) {
            const version = code[1];
            if (version !== 4) {
                throw new Error("Unsupported 2D-Doc version");
            }
            const countryId = c40.parse(code.slice(2, 4));
            const caCert = c40.parse(code.slice(4, 10));
            const caId = caCert.substring(0, 4);
            const certId = caCert.substring(4);
            const emitDate = dateParse(code.slice(10, 13));
            const signDate = dateParse(code.slice(13, 16));
            const docTypeId = code[16];
            const perimeterId = (code[17] << 8) | code[18];

            return new Header(version, caId, certId, emitDate, signDate, docTypeId, perimeterId, countryId);

        } else {
            throw new Error("Not a 2D-Doc");
        }
    }

    get length() {
        /**
         * Actual length of header, needed to know where data starts
         */
        if ([1, 2].includes(this.version)) {
            return 22;
        }
        if (this.version === 3) {
            return 24;
        }
        if (this.version === 4) {
            if (this.mode === "c40") {
                return 26;
            }
            return 19;
        }
        throw new Error("Unhandled version");
    }

    get mode() {
        /**
         * Actual mode of header ("c40" or "bin"). Needed to interpret
         * message part of document.
         */
        if (this.countryId.length === 2) {
            return "c40";
        }
        if (this.countryId.length === 3) {
            return "bin";
        }
        throw new Error("Invalid country ID length");
    }

    toCode() {
        "Serialize code"
        if (this.mode === "c40") {
            return `DC${this.version.toString().padStart(2, '0')}${this.caId}${this.certId}${dateEncode(this.emitDate)}${dateEncode(this.signDate)}${this.docTypeId}${this.version >= 3 ? this.perimeterId : ''}${this.version >= 4 ? this.countryId : ''}`;
        } else if (this.mode === "bin") {
            const buffer = new Uint8Array(19);
            buffer[0] = 0xdc;
            buffer[1] = 0x04;
            
            const countryIdBytes = c40.format(this.countryId);
            buffer.set(countryIdBytes, 2);
            
            const caCertBytes = c40.format(this.caId + this.certId);
            buffer.set(caCertBytes, 4);
            
            const emitDateBytes = dateEncode(this.emitDate, "bin");
            buffer.set(emitDateBytes, 10);
            
            const signDateBytes = dateEncode(this.signDate, "bin");
            buffer.set(signDateBytes, 13);
            
            buffer[16] = this.docTypeId;
            buffer[17] = (this.perimeterId >> 8) & 0xFF;
            buffer[18] = this.perimeterId & 0xFF;
            
            return buffer;
        }
    }

    async docType() {
        "Retrieve document type definition from internal database"
        const { c40 } = await import('./dataDefinition.js');
        return c40.doctypeGet(this.perimeterId, this.docTypeId);
    }
}
