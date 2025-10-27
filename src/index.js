/**
 * 2D-Doc parser library - JavaScript version
 * Author: Nicolas Pouillon (translated to JS)
 */

export { TwoDDoc } from './doc.js';
export { Header } from './header.js';
export { C40Message, Data, VariableData, FixedData, Message } from './message.js';
export { c40 } from './dataDefinition.js';
export { c40 as c40Codec, text } from './c40.js';
export { PublicKey, Dn, Certificate, KeyChain, internal } from './keychain.js';
export { dump } from './dump.js';
export { decoderQrCode } from './scan.js';

// Import all modules for default export
import { TwoDDoc } from './doc.js';
import { Header } from './header.js';
import { C40Message, Data, VariableData, FixedData, Message } from './message.js';
import { c40 } from './dataDefinition.js';
import { c40 as c40Codec, text } from './c40.js';
import { PublicKey, Dn, Certificate, KeyChain, internal } from './keychain.js';
import { dump } from './dump.js';
import { decoderQrCode } from './scan.js';

export default {
    TwoDDoc,
    Header,
    C40Message,
    Data,
    VariableData,
    FixedData,
    Message,
    c40,
    c40Codec,
    text,
    PublicKey,
    Dn,
    Certificate,
    KeyChain,
    internal,
    dump,
    decoderQrCode
};
