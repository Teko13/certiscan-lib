/**
 * C40 codec
 */

// Just arbitrarily map FNC1 to u0080
const FNC1 = '\u0080';

class Codec {
    constructor(sets) {
        this.sets = sets;
        this.reverse = this._reverseGen(sets);
    }

    _reverseGen(sets) {
        const r = {};
        for (let i = 0; i < sets.length; i++) {
            const set = sets[i];
            for (const [code, char] of Object.entries(set)) {
                r[char] = [i, parseInt(code)];
            }
        }
        return r;
    }

    static streamExtract(cw) {
        const cw2 = [];
        for (let off = 0; off < cw.length; off += 2) {
            const c = (cw[off] << 8) | cw[off + 1];
            if (c === 254) {
                break;
            }
            cw2.push(c);
        }
        return cw2;
    }

    static unpack(s) {
        const c = [];
        for (const v of s) {
            const c1 = Math.floor((v - 1) / 1600);
            const c2 = Math.floor(((v - 1) / 40) % 40);
            const c3 = (v - 1) % 40;

            c.push(c1);
            c.push(c2);
            c.push(c3);
        }
        return c;
    }

    static asciiDecode(cs, sets) {
        let lock = false;
        let s = 0;

        let ret = '';
        for (const c of cs) {
            if (s === 0 && c <= 2) {
                s = c + 1;
                continue;
            }
            if (s === 2 && c === 30) {
                lock = true;
                s = 0;
            }
            try {
                ret += sets[s][c];
            } catch (e) {
                throw new Error("Bad encoding");
            }
            if (!lock) {
                s = 0;
            }
        }

        return ret;
    }

    parse(c40) {
        const cw = Codec.streamExtract(c40);
        const cs = Codec.unpack(cw);
        return Codec.asciiDecode(cs, this.sets);
    }

    static textEncode(text, mapping) {
        let s = 0;
        const ret = [];
        for (const c of text) {
            const [set, code] = mapping[c];
            if (s !== set) {
                if (s === 0) {
                    ret.push(set - 1);
                } else {
                    throw new Error(`Cannot encode ${set} ${c}`);
                }
            }
            ret.push(code);
        }
        return ret;
    }

    static pack(cs) {
        if (cs.length % 3 === 2) {
            cs = [...cs, 0];
        } else if (cs.length % 3 === 1) {
            cs = [...cs, 1, 30];
        }

        const ret = [];
        for (let off = 0; off < cs.length; off += 3) {
            const v = cs[off] * 1600 + cs[off + 1] * 40 + cs[off + 2] + 1;
            ret.push(v);
        }
        return ret;
    }

    static streamFormat(cw) {
        const buffer = new Uint8Array(cw.length * 2);
        for (let i = 0; i < cw.length; i++) {
            buffer[i * 2] = (cw[i] >> 8) & 0xFF;
            buffer[i * 2 + 1] = cw[i] & 0xFF;
        }
        return buffer;
    }

    format(text) {
        const cs = Codec.textEncode(text, this.reverse);
        const cw = Codec.pack(cs);
        return Codec.streamFormat(cw);
    }
}

// Create character sets
const set0_c40 = {};
for (let i = 0; i < " 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".length; i++) {
    set0_c40[i + 3] = " 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"[i];
}

const set0_text = {};
for (const [k, v] of Object.entries(set0_c40)) {
    set0_text[k] = v.toLowerCase();
}

const set1 = {};
for (let i = 0; i < 32; i++) {
    set1[i] = String.fromCharCode(i);
}

const set2 = {};
const set2Chars = "!\"#$%&'()*+,-./:;<=>?@[\\]^_" + FNC1;
for (let i = 0; i < set2Chars.length; i++) {
    set2[i] = set2Chars[i];
}

const set3_c40 = {};
const set3Chars = "`abcdefghijklmnopqrstuvwxyz{|}~\x7f";
for (let i = 0; i < set3Chars.length; i++) {
    set3_c40[i] = set3Chars[i];
}

const set3_text = {};
for (const [k, v] of Object.entries(set3_c40)) {
    set3_text[k] = v.toUpperCase();
}

// Define both C40 and Text mode, even if this project only uses C40.
export const c40 = new Codec([set0_c40, set1, set2, set3_c40]);
export const text = new Codec([set0_text, set1, set2, set3_text]);

export default { c40, text };
