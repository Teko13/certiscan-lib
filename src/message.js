/**
 * Message part
 */

import { c40 } from './dataDefinition.js';

const GS = '\x1d';
const RS = '\x1e';

export class Data {
    "A data entry"
    constructor(group, definition, value) {
        this.group = group;
        this.definition = definition;
        this.value = value;
    }
}

export class VariableData extends Data {
    "A variable length data entry"
    constructor(group, definition, value, complete = true) {
        super(group, definition, value);
        this.complete = complete;
    }
}

export class FixedData extends Data {
    "A fixed length data entry"
}

export class Message {
    "A message"
    constructor(perimeterId, dataset) {
        // Convert perimeterId to number if it's a string
        this.perimeterId = typeof perimeterId === 'string' ? parseInt(perimeterId) : perimeterId;
        this.dataset = [...dataset];
    }
}

export class C40Message extends Message {
    "A C40 message"
    encode(maxLength = null) {
        throw new Error("Not implemented");
    }

    static fromCode(perimeterId, code) {
        /**
         * Load a message from a C40 code string, for a given perimeter ID.
         */
        const self = new C40Message(perimeterId, []);
        let remainingCode = code;
        let iterations = 0;
        while (remainingCode && iterations < 100) { // Protection against infinite loop
            const [data, newCode] = self.codeExtract(remainingCode);
            self.dataset.push(data);
            if (newCode === remainingCode) {
                // No progress made, break to avoid infinite loop
                break;
            }
            remainingCode = newCode;
            iterations++;
        }
        return self;
    }

    static fixedParse(group, definition, code) {
        /**
         * Parse a fixed size data item in the stream
         */
        const value = definition.encoding.parse(code.substring(2, 2 + definition.fixed));
        const data = new FixedData(group, definition, value);
        if (code.substring(2 + definition.fixed, 2 + definition.fixed + 1) === GS) {
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
        
        endPos = code.indexOf(RS);
        if (endPos === -1) {
            complete = true;
            endPos = code.indexOf(GS);
            if (endPos === -1) {
                endPos = null;
            }
        }

        if (definition.encoding.sizeMax !== null &&
            (endPos === null || endPos > 2 + definition.encoding.sizeMax)) {
            endPos = definition.encoding.sizeMax + 1;
            complete = true;
        }

        const value = definition.encoding.parse(code.substring(2, endPos || code.length));
        const data = new FixedData(group, definition, value);
        if (endPos === null) {
            return [data, ''];
        } else {
            return [data, code.substring(endPos + 1)];
        }
    }

    codeExtract(code) {
        /**
         * Parse next data item in the stream
         */
        const [group, definition] = c40.datatypeGet(this.perimeterId, code.substring(0, 2));
        if (definition.fixed !== null) {
            return C40Message.fixedParse(group, definition, code);
        }
        return C40Message.variableParse(group, definition, code);
    }
}

export default { Data, VariableData, FixedData, Message, C40Message };
