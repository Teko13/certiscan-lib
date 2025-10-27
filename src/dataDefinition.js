/**
 * 2D-Doc data definitions from
 * "Specifications-techniques-des-codes-a-barres_2D-Doc_v3.1.3.pdf" from
 * ANTS website. This only defines perimeter ID 1.
 */

class Format {
    constructor(sizeMin, sizeMax) {
        this.sizeMin = sizeMin;
        this.sizeMax = sizeMax;
    }

    parse(text) {
        return text;
    }

    serialize(text) {
        if (this.sizeMin !== null && text.length < this.sizeMin) {
            throw new Error("Too small");
        }
        if (this.sizeMax !== null && text.length > this.sizeMax) {
            throw new Error("Too long");
        }
        return text;
    }
}

class String extends Format {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /.*/;
        this.padPost = null;
        this.padPre = null;
    }

    parse(text) {
        if (this.padPre !== null) {
            return text.replace(new RegExp(`^${this.padPre}+`), '');
        }
        if (this.padPost !== null) {
            return text.replace(new RegExp(`${this.padPost}+$`), '');
        }
        return text;
    }

    serialize(text) {
        if (this.sizeMin === this.sizeMax && text.length !== this.sizeMin) {
            if (this.padPre) {
                text = text.padStart(this.sizeMin, this.padPre);
            } else if (this.padPost) {
                text = text.padEnd(this.sizeMin, this.padPost);
            }
        }
        if (this.sizeMin !== null && text.length < this.sizeMin) {
            throw new Error("Too small");
        }
        if (this.sizeMax !== null && text.length > this.sizeMax) {
            throw new Error("Too long");
        }
        return text;
    }
}

class StringAZ extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[A-Z]*/;
    }
}

class StringAZ09 extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[A-Z0-9]*/;
    }
}

class StringAZSp extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[A-Z ]*/;
    }
}

class StringAZ09Sp extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[A-Z0-9 ]*/;
    }
}

class StringAZ09SpSl extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[A-Z0-9 /]*/;
    }
}

class StringAZSpSl extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[A-Z /]*/;
    }
}

class StringAZ09Dash extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[A-Z0-9-]*/;
    }
}

class StringAZ09DashSl extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[A-Z0-9/-]*/;
    }
}

class StringAZ09SpAtDash extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[A-Z0-9@' -]*/;
    }
}

class Numeric extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[0-9]*/;
    }
}

class Numeric0 extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[0-9]*/;
        this.padPre = '0';
    }
}

class NumericSp extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[0-9 ]*/;
    }
}

class NumericSl extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[0-9/]*/;
    }
}

class Hex extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[0-9A-F -]*/;
        this.padPre = '0';
    }
}

const QualName = StringAZ09SpSl;
const Iso3166_2 = String;

class Decimal extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[0-9.-]*/;
        this.padPre = '0';
    }
}

class PhoneNumber extends String {
    constructor(sizeMin, sizeMax) {
        super(sizeMin, sizeMax);
        this.allowedFormat = /[0-9 ]*/;
        this.padPre = ' ';
    }
}

class Date4 extends Format {
    static EPOCH = new Date(2000, 0, 1); // January 1, 2000

    parse(text) {
        const v = parseInt(text, 16);
        const date = new Date(Date4.EPOCH);
        date.setDate(date.getDate() + v);
        return date;
    }

    serialize(d) {
        const daysDiff = Math.floor((d - Date4.EPOCH) / (1000 * 60 * 60 * 24));
        return daysDiff.toString(16).toUpperCase().padStart(4, '0');
    }
}

class Boolean extends Format {
    parse(text) {
        return text === "1";
    }

    serialize(v) {
        return v ? "1" : "0";
    }
}

class JJMMAAAA extends Format {
    parse(text) {
        const j = parseInt(text.substring(0, 2), 10);
        const m = parseInt(text.substring(2, 4), 10);
        const a = parseInt(text.substring(4, 8), 10);
        return new Date(a, m - 1, j);
    }

    serialize(d) {
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear().toString();
        return `${day}${month}${year}`;
    }
}

class JJMMAAAAHHMM extends Format {
    parse(text) {
        const j = parseInt(text.substring(0, 2), 10);
        const m = parseInt(text.substring(2, 4), 10);
        const a = parseInt(text.substring(4, 8), 10);
        const h = parseInt(text.substring(8, 10), 10);
        const mi = parseInt(text.substring(10, 12), 10);
        return new Date(a, m - 1, j, h, mi);
    }

    serialize(d) {
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear().toString();
        const hour = d.getHours().toString().padStart(2, '0');
        const minute = d.getMinutes().toString().padStart(2, '0');
        return `${day}${month}${year}${hour}${minute}`;
    }
}

class HexInt extends Format {
    parse(text) {
        return parseInt(text, 16);
    }

    serialize(v) {
        if (this.sizeMin === this.sizeMax) {
            return v.toString(16).toUpperCase().padStart(this.sizeMin, '0');
        }
        return v.toString(16).toUpperCase();
    }
}

class Time6 extends Format {
    parse(text) {
        const h = parseInt(text.substring(0, 2), 10);
        const m = parseInt(text.substring(2, 4), 10);
        const s = parseInt(text.substring(4, 6), 10);
        return { hour: h, minute: m, second: s };
    }

    serialize(d) {
        const hour = d.hour.toString().padStart(2, '0');
        const minute = d.minute.toString().padStart(2, '0');
        const second = d.second.toString().padStart(2, '0');
        return `${hour}${minute}${second}`;
    }
}

class HHMM extends Format {
    parse(text) {
        const h = parseInt(text.substring(0, 2), 10);
        const m = parseInt(text.substring(2, 4), 10);
        return { hour: h, minute: m };
    }

    serialize(d) {
        const hour = d.hour.toString().padStart(2, '0');
        const minute = d.minute.toString().padStart(2, '0');
        return `${hour}${minute}`;
    }
}

class StringBase32 extends Format {
    parse(text) {
        // Simple base32 decode implementation
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let result = '';
        let bits = 0;
        let value = 0;
        
        for (const char of text) {
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

    serialize(text) {
        // Simple base32 encode implementation
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let result = '';
        let bits = 0;
        let value = 0;
        
        for (const char of text) {
            value = (value << 8) | char.charCodeAt(0);
            bits += 8;
            
            while (bits >= 5) {
                result += alphabet[(value >> (bits - 5)) & 0x1F];
                bits -= 5;
            }
        }
        
        if (bits > 0) {
            result += alphabet[(value << (5 - bits)) & 0x1F];
        }
        
        return result;
    }
}

class Base36 extends Format {
    parse(text) {
        return parseInt(text, 36);
    }

    serialize(text) {
        throw new Error("Not implemented");
    }
}

class Definition {
    constructor(id, name, sizeMin, sizeMax, encoding, description = "") {
        this.id = id;
        this.name = name;
        this.fixed = sizeMin === sizeMax ? sizeMin : null;
        this.encoding = new encoding(sizeMin, sizeMax);
        this.description = description;
    }
}

class Group {
    constructor(name, ...definitions) {
        this.name = name;
        this.definitions = definitions;
    }
}

class Doctype {
    constructor(id, userType, emitterType) {
        this.id = id;
        this.userType = userType;
        this.emitterType = emitterType;
    }
}

class Perimeter {
    constructor(id, ...items) {
        this.id = id;
        this.groups = [];
        this.datatypes = {};
        this.doctypes = {};
        
        for (const i of items) {
            if (i instanceof Group) {
                this.groups.push(i);
                for (const d of i.definitions) {
                    this.datatypes[d.id] = [i, d];
                }
            } else if (i instanceof Doctype) {
                this.doctypes[i.id] = i;
            }
        }
    }

    datatypeGet(id) {
        const [group, definition] = this.datatypes[id];
        return [group, definition];
    }

    doctypeGet(id) {
        return this.doctypes[id];
    }
}

class Definitions {
    constructor(...perimeters) {
        this.perimeters = {};
        for (const p of perimeters) {
            this.perimeters[p.id] = p;
        }
    }

    datatypeGet(perimeter, id) {
        try {
            const p = this.perimeters[perimeter];
            return p.datatypeGet(id);
        } catch (e) {
            return [new Group("Unknown group"), new Definition(id, "Unknown " + id, 0, null, String)];
        }
    }

    doctypeGet(perimeter, id) {
        try {
            const p = this.perimeters[perimeter];
            return p.doctypeGet(id);
        } catch (e) {
            return new Doctype(id, "Unknown " + id, "Unknown");
        }
    }
}

// Create the C40 definitions
const c40 = new Definitions(
    new Perimeter(1,
        new Doctype("00", "Justificatif de domicile", "Spécifique"),
        new Doctype("01", "Justificatif de domicile", "Facture"),
        new Doctype("02", "Justificatif de domicile", "Avis TH"),
        new Doctype("03", "Justificatif de domiciliation bancaire", "RIB"),
        new Doctype("05", "Justificatif de domiciliation bancaire", "SEPAmail"),
        new Doctype("04", "Justificatif de ressources", "Avis IR"),
        new Doctype("06", "Justificatif de ressources", "Bulletin de salaire"),
        new Doctype("11", "Justificatif de ressources", "Relevé de compte"),
        new Doctype("07", "Justificatif d'identité", "Titre d'identité"),
        new Doctype("08", "Justificatif d'identité", "MRZ"),
        new Doctype("13", "Justificatif d'identité", "Document étranger"),
        new Doctype("09", "Justificatif fiscal", "Facture étendue"),
        new Doctype("10", "Justificatif d'emploi", "Contrat de travail"),
        new Doctype("15", "Justificatif d'emploi", "Attestation de décision favorable d'une demande d'autorisation de travail"),
        new Doctype("A0", "Justificatif de véhicule", "Certificat de qualité de l'air"),
        new Doctype("A7", "Justificatif de véhicule", "Certificat de qualité de l'air (V2)"),
        new Doctype("14", "Justificatif de véhicule", "Attestation DICEM"),
        new Doctype("A1", "Justificatif permis de conduire", "Courrier Permis à points"),
        new Doctype("A2", "Justificatif de santé", "Carte Mobilité Inclusion"),
        new Doctype("A3", "Justificatif d'activité", "Macaron VTC"),
        new Doctype("A5", "Justificatif d'activité", "Carte T3P"),
        new Doctype("A6", "Justificatif d'activité", "Carte Professionnelle Sapeur-Pompier"),
        new Doctype("A9", "Justificatif d'activité", "Permis de chasser"),
        new Doctype("A4", "Justificatif médical", "Certificat de décès"),
        new Doctype("B0", "Justificatif académique", "Diplôme"),
        new Doctype("B1", "Justificatif académique", "Attestation de Versement de la Contribution à la Vie Etudiante"),
        new Doctype("12", "Justificatif juridique/judiciaire", "Acte d'huissier"),
        new Doctype("A8", "Certificat d'immatriculation", "Certificat de session électronique"),
        new Doctype("C1", "Autorisations douanière", "Renseignement Tarifaire Contraignant"),
        new Doctype("C2", "Autorisations douanière", "Accord Préalable pour le transfert d'armes"),
        new Doctype("C3", "Autorisations douanière", "Permis de transfert d'armes à feu et de munitions"),
        new Doctype("C4", "Autorisations douanière", "Autorisation d'importation de matériels de guerre"),
        new Doctype("C5", "Autorisations douanière", "Licence d'exportation d'armes à feu"),
        new Doctype("C6", "Autorisations douanière", "Agrément de transfert d'armes à feu et de munitions"),
        new Doctype("B2", "Résultats des tests virologiques", "Test COVID"),
        new Doctype("L1", "Attestation Vaccinale", "Attestation Vaccinale"),
        new Doctype("16", "Justificatif d'Asile", "Attestation de Demande d'Asile"),
        new Doctype("17", "Justificatif d'Asile", "Attestation de fin de droit à l'allocation pour demandeur d'asile (ADA)"),
        new Doctype("L1", "Caducée Infirmier", "Caducée Infirmier"),

        new Group("Identifiants de données complémentaires du code 2D-DOC",
            new Definition("01", "Identifiant unique du document", 0, null, String),
            new Definition("02", "Catégorie de document", 0, null, String),
            new Definition("03", "Sous-catégorie de document", 0, null, String),
            new Definition("04", "Application de composition", 0, null, String),
            new Definition("05", "Version de l'application de composition", 0, null, String),
            new Definition("06", "Date de l'association entre le document et le code 2D-Doc", 4, 4, Date4),
            new Definition("07", "Heure de l'association entre le document et le code 2D-Doc", 6, 6, Time6),
            new Definition("08", "Date d'expiration du document", 4, 4, Date4),
            new Definition("09", "Nombre de pages du document", 4, 4, Numeric0),
            new Definition("0A", "Editeur du 2D-Doc", 9, 9, Numeric0),
            new Definition("0B", "Intégrateur du 2D-Doc", 9, 9, Numeric0),
            new Definition("0C", "URL du document", 0, null, StringBase32),
            new Definition("0D", "UUID du document", 36, 36, Hex),
        ),

        new Group("Identifiants de données propres aux factures",
            new Definition("10", "Ligne 1 de la norme adresse postale du bénéficiaire de la prestation", 0, 38, QualName),
            new Definition("11", "Qualité et/ou titre de la personne bénéficiaire de la prestation", 0, 38, StringAZSp),
            new Definition("12", "Prénom de la personne bénéficiaire de la prestation", 0, 38, StringAZSp),
            new Definition("13", "Nom de la personne bénéficiaire de la prestation", 0, 38, StringAZSp),
            new Definition("14", "Ligne 1 de la norme adresse postale du destinataire de la facture", 0, 38, QualName),
            new Definition("15", "Qualité et/ou titre de la personne destinataire de la facture", 0, 38, StringAZSp),
            new Definition("16", "Prénom de la personne destinataire de la facture", 0, 38, StringAZSp),
            new Definition("17", "Nom de la personne destinataire de la facture", 0, 38, StringAZSp),
            new Definition("18", "Numéro de la facture", 0, null, StringAZSp),
            new Definition("19", "Numéro de client", 0, null, StringAZSp),
            new Definition("1A", "Numéro du contrat", 0, null, StringAZSp),
            new Definition("1B", "Identifiant du souscripteur du contrat", 0, null, StringAZSp),
            new Definition("1C", "Date d'effet du contrat", 8, 8, JJMMAAAA),
            new Definition("1D", "Montant TTC de la facture", 0, 16, Decimal),
            new Definition("1E", "Numéro de téléphone du bénéficiaire de la prestation", 0, 30, PhoneNumber),
            new Definition("1F", "Numéro de téléphone du destinataire de la facture", 0, 30, PhoneNumber),
            new Definition("1G", "Présence d'un co-bénéficiaire de la prestation non mentionné dans le code", 1, 1, Boolean),
            new Definition("1H", "Présence d'un co-destinataire de la facture non mentionné dans le code", 1, 1, Boolean),
            new Definition("1I", "Ligne 1 de la norme adresse postale du co-bénéficiaire de la prestation", 0, 38, QualName),
            new Definition("1J", "Qualité et/ou titre du co-bénéficiaire de la prestation", 0, 38, StringAZSp),
            new Definition("1K", "Prénom du co-bénéficiaire de la prestation", 0, 38, StringAZSp),
            new Definition("1L", "Nom du co-bénéficiaire de la prestation", 0, 38, StringAZSp),
            new Definition("1M", "Ligne 1 de la norme adresse postale du co-destinataire de la facture", 0, 38, QualName),
            new Definition("1N", "Qualité et/ou titre du co-destinataire de la facture", 0, 38, StringAZSp),
            new Definition("1O", "Prénom du co-destinataire de la facture", 0, 38, StringAZSp),
            new Definition("1P", "Nom du co-destinataire de la facture", 0, 38, StringAZSp),
            new Definition("20", "Ligne 2 de la norme adresse postale du point de service des prestations", 0, 38, StringAZ09Sp),
            new Definition("21", "Ligne 3 de la norme adresse postale du point de service des prestations", 0, 38, StringAZ09Sp),
            new Definition("22", "Ligne 4 de la norme adresse postale du point de service des prestations", 0, 38, StringAZ09Sp),
            new Definition("23", "Ligne 5 de la norme adresse postale du point de service des prestations", 0, 38, StringAZ09Sp),
            new Definition("24", "Code postal ou code cedex du point de service des prestations", 5, 5, Numeric0),
            new Definition("25", "Localité de destination ou libellé cedex du point de service des prestations", 0, 32, StringAZSp),
            new Definition("26", "Pays de service des prestations", 2, 2, Iso3166_2),
            new Definition("27", "Ligne 2 de la norme adresse postale du destinataire de la facture", 0, 38, StringAZ09Sp),
            new Definition("28", "Ligne 3 de la norme adresse postale du destinataire de la facture", 0, 38, StringAZ09Sp),
            new Definition("29", "Ligne 4 de la norme adresse postale du destinataire de la facture", 0, 38, StringAZ09Sp),
            new Definition("2A", "Ligne 5 de la norme adresse postale du destinataire de la facture", 0, 38, StringAZ09Sp),
            new Definition("2B", "Code postal ou code cedex du destinataire de la facture", 5, 5, Numeric0),
            new Definition("2C", "Localité de destination ou libellé cedex du destinataire de la facture", 0, 32, StringAZSp),
            new Definition("2D", "Pays du destinataire de la facture", 2, 2, Iso3166_2),
        ),

        new Group("Identifiants de données bancaires",
            new Definition("30", "Qualité Nom et Prénom", 0, 140, QualName),
            new Definition("31", "Code IBAN", 14, 38, StringAZ09),
            new Definition("32", "Code BIC/SWIFT", 8, 11, StringAZ09),
            new Definition("33", "Code BBAN", 0, 30, StringAZ09),
            new Definition("34", "Pays de localisation du compte", 2, 2, Iso3166_2),
            new Definition("35", "Identifiant SEPAmail (QXBAN)", 14, 34, StringAZ09),
            new Definition("36", "Date de début de période", 4, 4, Date4),
            new Definition("37", "Date de fin de période", 4, 4, Date4),
            new Definition("38", "Solde compte début de période", 0, 11, Decimal),
            new Definition("39", "Solde compte fin de période", 0, 11, Decimal),
        ),

        new Group("Identifiants de données fiscales",
            new Definition("40", "Numéro fiscal", 13, 13, Numeric0),
            new Definition("41", "Revenu fiscal de référence", 0, 12, Numeric),
            new Definition("42", "Situation du foyer", 0, null, StringAZSp),
            new Definition("43", "Nombre de parts", 0, 5, Decimal),
            new Definition("44", "Référence d'avis d'impôt", 13, 13, StringAZ09Sp),
            new Definition("45", "Année des revenus", 4, 4, Numeric0),
            new Definition("46", "Déclarant 1", 0, 38, StringAZ),
            new Definition("47", "Numéro fiscal du déclarant 1", 13, 13, Numeric0),
            new Definition("48", "Déclarant 2", 0, 38, StringAZ),
            new Definition("49", "Numéro fiscal du déclarant 2", 13, 13, Numeric0),
            new Definition("4A", "Date de mise en recouvrement", 8, 8, StringAZ),
            new Definition("4B", "Date de la déclaration", 8, 8, JJMMAAAA),
            new Definition("4C", "Date d'enregistrement", 8, 8, JJMMAAAA),
            new Definition("4D", "Montant du don (en €)", 0, 12, Numeric),
            new Definition("4E", "Montant des droits payés (en €)", 0, 12, Numeric),
            new Definition("4F", "Référence d'enregistrement", 15, 15, StringAZ09),
            new Definition("4G", "Nom du donataire", 0, 38, StringAZ09Dash),
            new Definition("4H", "Nom(s) du(es) donateur(s)", 0, 77, StringAZ09SpSl),
            new Definition("4I", "Montant Taxable (en €)", 0, 12, Numeric),
            new Definition("4J", "Montant de la cession (en €)", 0, 12, Numeric),
            new Definition("4K", "Nom du cessionnaire", 0, 38, StringAZ09SpAtDash),
            new Definition("4L", "Nom du cédant", 0, 38, StringAZ09SpAtDash),
            new Definition("4M", "Taux applicable", 0, 3, Decimal),
            new Definition("4N", "Nom et prénoms du déclarant", 0, 38, StringAZSp),
            new Definition("4O", "Ligne 4 d'adresse du déclarant", 0, 38, StringAZSp),
            new Definition("4P", "Code postal du déclarant", 5, 5, Numeric0),
            new Definition("4Q", "Commune du déclarant", 0, 32, StringAZSp),
            new Definition("4R", "SIP gestionnaire", 0, 30, StringAZSp),
            new Definition("4S", "Millésime", 4, 4, Numeric0),
            new Definition("4T", "Administration cantonale suisse", 0, 30, StringAZSp),
            new Definition("4U", "Dénomination sociale de l'employeur", 0, 38, StringAZ09Sp),
        ),

        new Group("Identifiants de données relatives à l'activité professionnelle",
            new Definition("50", "SIRET de l'employeur", 14, 14, Numeric0),
            new Definition("51", "Nombre d'heures travaillées", 6, 6, Decimal),
            new Definition("52", "Cumul du nombre d'heures travaillées", 7, 7, Decimal),
            new Definition("53", "Début de période", 4, 4, Date4),
            new Definition("54", "Fin de période", 4, 4, Date4),
            new Definition("55", "Date de début de contrat", 8, 8, JJMMAAAA),
            new Definition("56", "Date de fin de contrat", 8, 8, JJMMAAAA),
            new Definition("57", "Date de signature du contrat", 8, 8, JJMMAAAA),
            new Definition("58", "Salaire net imposable", 0, 11, Decimal),
            new Definition("59", "Cumul du salaire net imposable", 0, 12, Decimal),
            new Definition("5A", "Salaire brut du mois", 0, 11, Decimal),
            new Definition("5B", "Cumul du salaire brut", 0, 12, Decimal),
            new Definition("5C", "Salaire net", 0, 11, Decimal),
            new Definition("5D", "Ligne 2 de la norme adresse postale de l'employeur", 0, 38, StringAZ09Sp),
            new Definition("5E", "Ligne 3 de la norme adresse postale de l'employeur", 0, 38, StringAZ09Sp),
            new Definition("5F", "Ligne 4 de la norme adresse postale de l'employeur", 0, 38, StringAZ09Sp),
            new Definition("5G", "Ligne 5 de la norme adresse postale de l'employeur", 0, 38, StringAZ09Sp),
            new Definition("5H", "Code postal ou code cedex de l'employeur", 5, 5, Numeric0),
            new Definition("5I", "Localité de destination ou libellé cedex de l'employeur", 0, 32, StringAZSp),
            new Definition("5J", "Pays de l'employeur", 2, 2, Iso3166_2),
            new Definition("5K", "Identifiant Cotisant Prestations Sociales", 0, 50, StringAZ09Sp),
            new Definition("5L", "Numéro de SIRET ou RNA", 9, 14, StringAZ09),
            new Definition("5M", "Dénomination sociale", 0, 38, StringAZ09Sp),
            new Definition("5N", "Numéro de dossier d'autorisation de travail", 21, 21, Numeric0),
            new Definition("5O", "Nom de l'employeur", 0, 38, StringAZSp),
            new Definition("5P", "Prénom de l'employeur", 0, 38, StringAZSp),
            new Definition("5Q", "Nom du déclarant", 0, 38, StringAZSp),
            new Definition("5R", "Prénom du déclarant", 0, 38, StringAZSp),
            new Definition("5S", "Fonction du déclarant", 0, 40, StringAZSp),
            new Definition("5T", "Type de contrat de travail", 1, 1, StringAZ),
            new Definition("5U", "Durée du contrat", 0, 12, StringAZ09Sp),
        ),

        new Group("Identifiants de données relatives aux titres d'identité",
            new Definition("60", "Liste des prénoms", 0, 60, StringAZSpSl),
            new Definition("61", "Prénom", 0, 20, StringAZSp),
            new Definition("62", "Nom patronymique", 0, 38, StringAZSp),
            new Definition("63", "Nom d'usage", 0, 38, StringAZSp),
            new Definition("64", "Nom d'épouse/époux", 0, 38, StringAZSp),
            new Definition("65", "Type de pièce d'identité", 2, 2, StringAZSp),
            new Definition("66", "Numéro de la pièce d'identité", 0, 20, StringAZ09),
            new Definition("67", "Nationalité", 2, 2, Iso3166_2),
            new Definition("68", "Genre", 1, 1, StringAZ),
            new Definition("69", "Date de naissance", 8, 8, JJMMAAAA),
            new Definition("6A", "Lieu de naissance", 0, 32, StringAZSp),
            new Definition("6B", "Département du bureau émetteur", 3, 3, StringAZ09),
            new Definition("6C", "Pays de naissance", 2, 2, Iso3166_2),
            new Definition("6D", "Nom et prénom du père", 0, 60, StringAZ09SpSl),
            new Definition("6E", "Nom et prénom de la mère", 0, 60, StringAZ09SpSl),
            new Definition("6F", "Machine Readable Zone (Zone de Lecture Automatique, ZLA)", 0, 90, StringAZ09Sp),
            new Definition("6G", "Nom", 1, 38, StringAZSp),
            new Definition("6H", "Civilité", 1, 10, StringAZSp),
            new Definition("6I", "Pays émetteur", 2, 2, Iso3166_2),
            new Definition("6J", "Type de document étranger", 1, 1, Numeric0),
            new Definition("6K", "Numéro de la demande de document étranger", 19, 19, Numeric0),
            new Definition("6L", "Date de dépôt de la demande", 8, 8, JJMMAAAA),
            new Definition("6M", "Catégorie du titre", 0, 40, StringAZSp),
            new Definition("6N", "Date de début de validité", 8, 8, JJMMAAAA),
            new Definition("6O", "Date de fin de validité", 8, 8, JJMMAAAA),
            new Definition("6P", "Autorisation", 0, 40, StringAZSp),
            new Definition("6Q", "Numéro d'étranger", 0, 10, StringAZ09),
            new Definition("6R", "Numéro de visa", 12, 12, StringAZ09),
            new Definition("6S", "Ligne 2 de l'adresse postale du domicile", 0, 38, StringAZ09Sp),
            new Definition("6T", "Ligne 3 de l'adresse postale du domicile", 0, 38, StringAZ09Sp),
            new Definition("6U", "Ligne 4 de l'adresse postale du domicile", 0, 38, StringAZ09Sp),
            new Definition("6V", "Ligne 5 de l'adresse postale du domicile", 0, 38, StringAZ09Sp),
            new Definition("6W", "Code postal ou code cedex de l'adresse postale du domicile", 5, 5, Numeric0),
            new Definition("6X", "Commune de l'adresse postale du domicile", 0, 32, StringAZSp),
            new Definition("6Y", "Code pays de l'adresse postale du domicile", 2, 2, Iso3166_2),
            new Definition("6Z", "Numéro d'étranger de l'autorisation de travail", 9, 11, StringAZ09),
        ),

        new Group("Identifiants de données relatives aux données de santé",
            new Definition("70", "Date et heure du décès", 12, 12, JJMMAAAAHHMM),
            new Definition("71", "Date et heure du constat de décès", 12, 12, JJMMAAAAHHMM),
            new Definition("72", "Nom du défunt", 1, 38, StringAZSp),
            new Definition("73", "Prénoms du défunt", 0, 60, StringAZSpSl),
            new Definition("74", "Nom de jeune fille du défunt", 0, 38, StringAZSp),
            new Definition("75", "Date de naissance du défunt", 8, 8, JJMMAAAA),
            new Definition("76", "Genre du défunt", 1, 1, StringAZ),
            new Definition("77", "Commune de décès", 0, 45, StringAZSp),
            new Definition("78", "Code postal de la commune de décès", 5, 5, Numeric0),
            new Definition("79", "Adresse du domicile du défunt", 0, 114, StringAZ09Sp),
            new Definition("7A", "Code postal du domicile du défunt", 5, 5, Numeric0),
            new Definition("7B", "Commune du domicile du défunt", 0, 45, StringAZSp),
            new Definition("7C", "Obstacle médico-légal", 1, 1, Boolean),
            new Definition("7D", "Mise en bière", 1, 1, StringAZ),
            new Definition("7E", "Obstacle aux soins de conservation", 1, 1, Boolean),
            new Definition("7F", "Obstacle aux dons du corps", 1, 1, Boolean),
            new Definition("7G", "Recherche de la cause du décès", 1, 1, Boolean),
            new Definition("7H", "Délai de transport du corps", 2, 2, HexInt),
            new Definition("7I", "Prothèse avec pile", 1, 1, Boolean),
            new Definition("7J", "Retrait de la pile de prothèse", 1, 1, Boolean),
            new Definition("7K", "Code NNC", 13, 13, StringAZ09),
            new Definition("7L", "Code Finess de l'organisme agréé", 9, 9, StringAZ09),
            new Definition("7M", "Identification du médecin", 0, 64, StringAZ09Sp),
            new Definition("7N", "Lieu de validation du certificat de décès", 0, 128, StringAZ09Sp),
            new Definition("7O", "Certificat de décès supplémentaire", 1, 1, Boolean),
            new Definition("7P", "Identifiant du certificat", 16, 16, StringAZ09),
        ),

        new Group("Identifiants relatifs aux activités professionnelles",
            new Definition("80", "Nom", 0, 38, StringAZSp),
            new Definition("81", "Prénoms", 0, 60, StringAZSpSl),
            new Definition("82", "Numéro de carte", 0, 20, StringAZ09Sp),
            new Definition("83", "Organisme de tutelle", 0, 40, StringAZ09Sp),
            new Definition("84", "Profession", 0, 40, StringAZ09Sp),
            new Definition("85", "Numéro de permis de chasser", 17, 17, StringAZ09Dash),
            new Definition("86", "Numéro de licence", 12, 12, StringAZ09),
        ),

        new Group("Identifiants relatifs aux données juridiques/judiciaires",
            new Definition("90", "Identité de l'huissier de justice", 0, 38, StringAZSpSl),
            new Definition("91", "Identité ou raison sociale du demandeur", 0, 38, StringAZSpSl),
            new Definition("92", "Identité ou raison sociale du destinataire", 0, 38, StringAZSpSl),
            new Definition("93", "Identité ou raison sociale de tiers concerné", 0, 38, StringAZSpSl),
            new Definition("94", "Intitulé de l'acte", 0, 38, StringAZ09Sp),
            new Definition("95", "Numéro de l'acte", 0, 18, StringAZ09),
            new Definition("96", "Date de signature de l'acte", 8, 8, JJMMAAAA),
        ),

        new Group("Identifiants de données relatives aux véhicules",
            new Definition("A0", "Pays ayant émis l'immatriculation du véhicule", 2, 2, Iso3166_2),
            new Definition("A1", "Immatriculation du véhicule", 0, 17, StringAZ09Dash),
            new Definition("A2", "Marque du véhicule", 0, 17, StringAZ09Sp),
            new Definition("A3", "Nom commercial du véhicule", 0, 17, StringAZ09Sp),
            new Definition("A4", "Numéro de série du véhicule (VIN)", 17, 17, StringAZ09Sp),
            new Definition("A5", "Catégorie du véhicule", 3, 3, StringAZ09Sp),
            new Definition("A6", "Carburant", 2, 2, StringAZ09),
            new Definition("A7", "Taux d'émission de CO2 du véhicule (en g/km)", 3, 3, HexInt),
            new Definition("A8", "Indication de la classe environnementale de réception CE", 0, 12, StringAZ09SpSl),
            new Definition("A9", "Classe d'émission polluante", 3, 3, String),
            new Definition("AA", "Date de première immatriculation du véhicule", 8, 8, JJMMAAAA),
            new Definition("AB", "Type de lettre", 0, 8, StringAZ09),
            new Definition("AC", "N° Dossier", 0, 19, StringAZ09),
            new Definition("AD", "Date Infraction", 4, 4, Date4),
            new Definition("AE", "Heure de l'infraction", 4, 4, HHMM),
            new Definition("AF", "Nombre de points retirés lors de l'infraction", 1, 1, Base36),
            new Definition("AG", "Solde de points", 1, 1, Base36),
            new Definition("AH", "Numéro de la carte", 0, 30, StringAZ09),
            new Definition("AI", "Date d'expiration initiale", 8, 8, JJMMAAAA),
            new Definition("AJ", "Numéro EVTC", 13, 13, StringAZ09),
            new Definition("AK", "Numéro de macaron", 7, 7, Numeric0),
            new Definition("AL", "Numéro de la carte", 11, 11, StringAZ09),
            new Definition("AM", "Motif de sur-classement", 0, 5, StringAZ09Sp),
            new Definition("AN", "Kilométrage", 8, 8, Numeric0),
            new Definition("AO", "Numéro d'identification", 6, 6, Numeric0),
            new Definition("AP", "Type d'engin", 0, 60, StringAZSp),
            new Definition("AQ", "Numéro de série", 0, 25, StringAZ09),
            new Definition("AR", "Modèle", 0, 35, StringAZ09Sp),
            new Definition("AS", "Couleur dominante", 0, 10, StringAZ),
            new Definition("AT", "Type de propriétaire", 1, 1, Numeric),
            new Definition("AU", "Ligne 2 de l'adresse postale du propriétaire", 0, 38, StringAZ09Sp),
            new Definition("AV", "Ligne 3 de l'adresse postale du propriétaire", 0, 38, StringAZ09Sp),
            new Definition("AW", "Ligne 4 de l'adresse postale du propriétaire", 0, 38, StringAZ09Sp),
            new Definition("AX", "Ligne 5 de l'adresse postale du propriétaire", 0, 38, StringAZ09Sp),
            new Definition("AY", "Code postal ou code cedex de l'adresse postale du propriétaire", 5, 5, Numeric0),
            new Definition("AZ", "Commune de l'adresse postale du propriétaire", 0, 32, StringAZSp),
        ),

        new Group("Identifiants de données pour les justificatifs académiques",
            new Definition("B0", "Liste des prénoms", 0, 60, StringAZSpSl),
            new Definition("B1", "Prénom", 0, 20, StringAZSp),
            new Definition("B2", "Nom patronymique", 0, 38, StringAZSp),
            new Definition("B3", "Nom d'usage", 0, 38, StringAZSp),
            new Definition("B4", "Nom d'épouse/époux", 0, 38, StringAZSp),
            new Definition("B5", "Nationalité", 2, 2, Iso3166_2),
            new Definition("B6", "Genre", 1, 1, StringAZ),
            new Definition("B7", "Date de naissance", 8, 8, JJMMAAAA),
            new Definition("B8", "Lieu de naissance", 0, 32, StringAZ09Sp),
            new Definition("B9", "Pays de naissance", 2, 2, Iso3166_2),
            new Definition("BA", "Mention obtenue", 1, 1, Numeric),
            new Definition("BB", "Numéro ou code d'identification de l'étudiant", 0, 50, StringAZ09Sp),
            new Definition("BC", "Numéro du diplôme", 0, 20, StringAZ09Sp),
            new Definition("BD", "Niveau du diplôme selon la classification CEC", 1, 1, Numeric),
            new Definition("BE", "Crédits ECTS obtenus", 3, 3, Numeric0),
            new Definition("BF", "Année universitaire", 3, 3, HexInt),
            new Definition("BG", "Type de diplôme", 2, 2, StringAZ),
            new Definition("BH", "Domaine", 0, 30, StringAZ09Sp),
            new Definition("BI", "Mention", 0, 30, StringAZ09Sp),
            new Definition("BJ", "Spécialité", 0, 30, StringAZ09Sp),
            new Definition("BK", "Numéro de l'Attestation de versement de la CVE", 14, 14, StringAZ09Dash),
        ),

        new Group("Identifiants de données relatives au certificat de cession électronique",
            new Definition("C0", "Genre du vendeur", 1, 1, StringAZ),
            new Definition("C1", "Nom patronymique du vendeur", 0, 38, StringAZSp),
            new Definition("C2", "Prénom du vendeur", 0, 20, StringAZSp),
            new Definition("C3", "Date et heure de la cession", 12, 12, JJMMAAAAHHMM),
            new Definition("C4", "Date de la signature du vendeur", 8, 8, JJMMAAAA),
            new Definition("C5", "Genre de l'acheteur", 1, 1, StringAZ),
            new Definition("C6", "Nom patronymique de l'acheteur", 0, 38, StringAZSp),
            new Definition("C7", "Prénom de l'acheteur", 0, 20, StringAZSp),
            new Definition("C8", "Ligne 4 de la norme adresse postale du domicile de l'acheteur", 0, 38, StringAZ09Sp),
            new Definition("C9", "Code postal ou code cedex du domicile de l'acheteur", 5, 5, Numeric0),
            new Definition("CA", "Commune du domicile de l'acheteur", 0, 45, StringAZSp),
            new Definition("CB", "N° d'enregistrement", 10, 10, Numeric0),
            new Definition("CC", "Date et heure d'enregistrement dans le SIV", 12, 12, JJMMAAAAHHMM),
        ),

        new Group("Identifiants de données relatives aux autorisations douanières",
            new Definition("D0", "Référence RTC", 17, 17, String),
            new Definition("D1", "Nom du titulaire", 0, 50, String),
            new Definition("D2", "EORI", 0, 20, StringAZ09),
            new Definition("D3", "Date de début de validité", 8, 8, JJMMAAAA),
            new Definition("D4", "Date de fin de validité", 8, 8, JJMMAAAA),
            new Definition("D5", "Code marchandise", 8, 10, String),
            new Definition("D6", "Numéro de décision", 8, 8, Numeric0),
            new Definition("D7", "Date de décision", 8, 8, JJMMAAAA),
            new Definition("D8", "Durée de validité", 2, 2, Numeric0),
            new Definition("D9", "Date de fin de validité de la licence", 8, 8, JJMMAAAA),
            new Definition("DA", "Numéro de licence", 8, 8, Numeric0),
            new Definition("DB", "Nom de l'expéditeur", 0, 50, StringAZSp),
            new Definition("DC", "Prénom de l'expéditeur", 0, 50, StringAZSp),
            new Definition("DD", "Date de naissance de l'expéditeur", 8, 8, JJMMAAAA),
            new Definition("DE", "Raison sociale de l'expéditeur", 0, 50, StringAZ09Sp),
            new Definition("DF", "SIREN de l'expéditeur", 9, 9, Numeric0),
            new Definition("DG", "SIRET de l'expéditeur", 14, 14, Numeric0),
            new Definition("DH", "EORI de l'expéditeur", 0, 20, StringAZ09),
            new Definition("DI", "TIN de l'expéditeur", 4, 30, StringAZ09),
            new Definition("DJ", "Nom de l'exportateur", 0, 50, StringAZSp),
            new Definition("DK", "Prénom de l'exportateur", 0, 50, StringAZSp),
            new Definition("DL", "Date de naissance de l'exportateur", 8, 8, JJMMAAAA),
            new Definition("DM", "Raison sociale de l'exportateur", 0, 50, StringAZ09Sp),
            new Definition("DN", "SIREN de l'exportateur", 9, 9, Numeric0),
            new Definition("DO", "SIRET de l'exportateur", 14, 14, Numeric0),
            new Definition("DP", "EORI de l'exportateur", 0, 20, StringAZ09),
            new Definition("DQ", "Nom du destinataire", 0, 50, StringAZSp),
            new Definition("DR", "Prénom du destinataire", 0, 50, StringAZSp),
            new Definition("DS", "Date de naissance du destinataire", 8, 8, JJMMAAAA),
            new Definition("DT", "Raison sociale du destinataire", 0, 50, StringAZ09Sp),
            new Definition("DU", "SIREN du destinataire", 9, 9, Numeric0),
            new Definition("DV", "SIRET du destinataire", 14, 14, Numeric0),
            new Definition("DW", "EORI du destinataire", 0, 50, StringAZ09),
            new Definition("DX", "TIN du destinataire", 4, 30, StringAZ09),
            new Definition("DY", "Nombre de lignes articles", 3, 3, Numeric0),
            new Definition("DZ", "Numéro du bon de livraison", 0, 10, StringAZ09),
            new Definition("H0", "Commune de l'expéditeur", 0, 38, Numeric0),
            new Definition("H1", "Pays de l'expéditeur", 2, 2, StringAZ),
            new Definition("H2", "Commune du destinataire", 0, 38, StringAZSp),
            new Definition("H3", "Pays du destinataire", 2, 2, StringAZ),
            new Definition("H4", "Date de départ", 8, 8, JJMMAAAA),
            new Definition("H5", "Date prévisionnelle d'arrivée", 8, 8, JJMMAAAA),
            new Definition("H6", "Numéro de plomb", 0, 40, Numeric),
            new Definition("H7", "Codes douaniers", 0, 53, NumericSl),
            new Definition("H8", "Nombre d'emballages articles", 7, 7, Numeric0),
            new Definition("H9", "Poids brut articles", 8, 8, Numeric0),
            new Definition("HA", "Poids net articles", 8, 8, Numeric0),
            new Definition("HB", "Valeur douanière articles", 9, 9, Numeric0),
            new Definition("HC", "But de la livraison", 0, 38, StringAZSp),
            new Definition("HD", "Adresse de l'expéditeur", 0, 38, StringAZSp),
            new Definition("HE", "Code postal et commune de l'expéditeur", 0, 38, StringAZSp),
            new Definition("HF", "Adresse du destinataire", 0, 38, StringAZSp),
            new Definition("HG", "Code postal et commune du destinataire", 0, 38, StringAZSp),
            new Definition("HH", "Numéro d'identification du transport", 0, 20, StringAZ09DashSl),
            new Definition("HI", "Numéro, extension et libellé de voie de l'adresse de résidence", 0, 38, StringAZSp),
            new Definition("HJ", "Code postal de l'adresse de résidence", 5, 5, NumericSp),
            new Definition("HK", "Commune de l'adresse de résidence", 0, 32, StringAZSp),
            new Definition("HL", "Code pays de l'adresse de résidence", 2, 2, StringAZ),
            new Definition("HM", "Numéro de la CEAF", 15, 18, StringAZSp),
            new Definition("HN", "Date et heure d'édition", 12, 12, JJMMAAAAHHMM),
            new Definition("HO", "Date d'expiration", 8, 8, JJMMAAAA),
            new Definition("HP", "Numéro SIA", 12, 12, StringAZSp),
            new Definition("HQ", "Nombre d'armes de catégorie A", 2, 2, Numeric0),
            new Definition("HR", "Nombre d'armes de catégorie B", 2, 2, Numeric0),
            new Definition("HS", "Nombre d'armes de catégorie C", 2, 2, Numeric0),
        ),

        new Group("Identifiants de données relatives aux résultats des tests virologiques",
            new Definition("F0", "Liste des prénoms", 0, 38, String),
            new Definition("F1", "Nom patronymique", 0, 60, String),
            new Definition("F2", "Date de naissance", 8, 8, JJMMAAAA),
            new Definition("F3", "Genre", 1, 1, StringAZ),
            new Definition("F4", "Code analyse", 3, 7, StringAZ09),
            new Definition("F5", "Résultat de l'analyse", 1, 1, StringAZ),
            new Definition("F6", "Date et heure du prélèvement", 12, 12, JJMMAAAAHHMM),
        ),

        new Group("Identifiants de données relatives à une attestation vaccinale",
            new Definition("L0", "Nom Patronymique du patient", 0, 80, String),
            new Definition("L1", "Liste des prénoms du patient", 0, 80, String),
            new Definition("L2", "Date de naissance du patient", 8, 8, JJMMAAAA),
            new Definition("L3", "Nom de la maladie couverte", 0, 30, String),
            new Definition("L4", "Agent prophylactique", 5, 15, String),
            new Definition("L5", "Nom du vaccin", 5, 30, String),
            new Definition("L6", "Fabricant du vaccin", 5, 30, String),
            new Definition("L7", "Rang du dernier état de vaccination effectué", 1, 1, Numeric0),
            new Definition("L8", "Nombre de doses attendues pour un cycle complet", 1, 1, Numeric0),
            new Definition("L9", "Date du dernier état du cycle de vaccination", 8, 8, JJMMAAAA),
            new Definition("LA", "Etat du cycle de vaccination", 2, 2, StringAZ),
        ),

        new Group("Identifiants de données relatives à l'asile",
            new Definition("G0", "Type de procédure", 2, 2, StringAZ),
            new Definition("G1", "Orientation régionale", 2, 2, StringAZ),
            new Definition("G2", "Numéro d'usager", 0, 20, StringAZ09),
            new Definition("G3", "Date de fin des droits", 8, 8, JJMMAAAA),
            new Definition("G4", "Somme des montants versés au titre de l'ADA", 0, 10, Decimal),
            new Definition("G5", "Information de la Direction Territoriale", 0, 45, StringAZ09),
        ),

        new Group("Identifiants de données relatives au permis de conduire",
            new Definition("E0", "Type d'arrêtés Permis de conduire", 2, 2, StringAZ09),
            new Definition("E1", "Date édition du document", 4, 4, Date4),
            new Definition("E2", "Date de fin de sanction", 4, 4, Date4),
            new Definition("E3", "Date de notification", 4, 4, Date4),
            new Definition("E4", "Type de relevé de permis de conduire", 3, 3, StringAZ),
            new Definition("E5", "Etat du permis de conduire du conducteur", 2, 2, Numeric0),
            new Definition("E6", "Catégories présentes de permis de conduire", 0, 65, StringAZ09Sp),
            new Definition("E7", "SIREN du demandeur du document", 9, 9, Numeric0),
            new Definition("E8", "Date des données issues du SNCP", 12, 12, JJMMAAAAHHMM),
        ),

        new Group("Identifiants de données relatives au caducée infirmier",
            new Definition("I0", "Année du caducée", 4, 4, JJMMAAAA),
            new Definition("I1", "Numéro ordinal", 7, 7, Numeric0),
            new Definition("I2", "Mention spécifique", 16, 16, StringAZ09),
            new Definition("I3", "Nom d'exercice", 1, 54, StringAZ09SpAtDash),
            new Definition("I4", "Prénom d'exercice", 1, 37, StringAZ09SpAtDash),
            new Definition("I5", "Mode d'exercice", 5, 13, StringAZ09Dash),
            new Definition("I6", "Numéro RPPS", 11, 11, Numeric0),
        ),
    )
);

export { c40 };
export default { c40 };

