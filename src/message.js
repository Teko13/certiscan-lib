/**
 * Message part - JavaScript port of message.py
 */

const GS = '\x1d';
const RS = '\x1e';

export class Data {
    constructor(group, definition, value) {
        this.group = group;
        this.definition = definition;
        this.value = value;
    }
}

export class VariableData extends Data {
    constructor(group, definition, value, complete = true) {
        super(group, definition, value);
        this.complete = complete;
    }
}

export class FixedData extends Data {
    constructor(group, definition, value) {
        super(group, definition, value);
    }
}

export class Message {
    constructor(perimeterId, dataset) {
        this.perimeterId = perimeterId;
        this.dataset = [...dataset];
    }
}

export class C40Message extends Message {
    encode(maxLength = null) {
        throw new Error("Not implemented");
    }

    static async fromCode(perimeterId, code) {
        /**
         * Load a message from a C40 code string, for a given perimeter ID.
         */
        const self = new C40Message(perimeterId, []);
        let remainingCode = code;
        
        while (remainingCode && remainingCode.length > 0) {
            const [data, newCode] = await self.codeExtract(remainingCode);
            self.dataset.push(data);
            remainingCode = newCode;
            
            // Protection contre les boucles infinies
            if (remainingCode === code) {
                console.warn("Boucle infinie détectée, arrêt du parsing");
                break;
            }
        }
        
        return self;
    }

    static fixedParse(group, definition, code) {
        /**
         * Parse a fixed size data item in the stream
         */
        const value = definition.encoding.parse(code.substring(2, 2 + definition.fixed));
        const data = new FixedData(group, definition, value);
        
        if (code[2 + definition.fixed] === GS) {
            return [data, code.substring(2 + definition.fixed + 1)];
        }
        return [data, code.substring(2 + definition.fixed)];
    }

    static variableParse(group, definition, code) {
        /**
         * Parse a variable size data item in the stream
         */
        let endPos;
        let complete = false;
        
        // Chercher RS d'abord
        endPos = code.indexOf(RS);
        if (endPos === -1) {
            complete = true;
            // Si pas de RS, chercher GS
            endPos = code.indexOf(GS);
            if (endPos === -1) {
                endPos = null;
            }
        }

        if (definition.encoding.sizeMax !== null &&
            (endPos === null || endPos > 2 + definition.encoding.sizeMax)) {
            endPos = 2 + definition.encoding.sizeMax;
            complete = true;
        }

        let value;
        if (endPos === null) {
            value = definition.encoding.parse(code.substring(2));
        } else {
            value = definition.encoding.parse(code.substring(2, endPos));
        }
        
        const data = new FixedData(group, definition, value);
        
        if (endPos === null) {
            return [data, ''];
        } else {
            return [data, code.substring(endPos + 1)];
        }
    }

    async codeExtract(code) {
        /**
         * Parse next data item in the stream
         */
        if (code.length < 2) {
            return [null, ''];
        }
        
        const { c40 } = await import('./dataDefinition.js');
        const fieldId = code.substring(0, 2);
        const [group, definition] = c40.datatypeGet(this.perimeterId, fieldId);
        
        if (definition.fixed !== null) {
            return C40Message.fixedParse(group, definition, code);
        }
        return C40Message.variableParse(group, definition, code);
    }
}
