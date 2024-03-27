const { APP_NAME, APP_AUTHOR, APP_VERSION, APP_DESCRIPTION, DEFAULT_ROUTE_ADMIN, DEFAULT_PROFILE_ADMIN, DIRECTUS_URL, DEFAULT_PROFILE_INTERMED, DEFAULT_ROUTE_INTERMED, DEFAULT_ROUTE_AGENT, DEFAULT_PROFILE_AGENT } = require('./consts');
const { client, admin, intermed, agent } = require('./tabsidebase');
const moment = require('moment')
const randomstring = require("randomstring");
moment.locale("fr");

const CryptoJS = require("crypto-js");

require('dotenv').config()


class Utils {

    constructor() {

    }

    static getEnvnow(req) {
        return req.app.settings.env
    }

    static getDirectusUrl() {
        return DIRECTUS_URL
    }

    static getMoment() {
        return moment
    }

    static getTabSideBase(profile) {
        if (profile == DEFAULT_PROFILE_ADMIN) {
            return admin()
        }
        if (profile == DEFAULT_PROFILE_INTERMED) {
            return intermed()
        }
        if (profile == DEFAULT_PROFILE_AGENT) {
            return agent()
        }
        return []
    }

    static getRouteDeBase(profile) {
        if (profile == DEFAULT_PROFILE_ADMIN) {
            return DEFAULT_ROUTE_ADMIN
        }
        if (profile == DEFAULT_PROFILE_INTERMED) {
            return DEFAULT_ROUTE_INTERMED
        }
        if (profile == DEFAULT_PROFILE_AGENT) {
            return DEFAULT_ROUTE_AGENT
        }
        return ""
    }

    static generateCode(keyword) {
        let now = moment()
        let suffix = now.format("YYYYMMDDHH_mmss").substr(2) + "_" + Utils.generateNumberCodeSpecial()
        // remove 2 first chars
        let code = keyword + suffix
        return code
    }

    static genUserCode() {
        return Utils.generateCode("USR")
    }

    static genDocumentCode() {
        return Utils.generateCode("DOC")
    }

    static generateNumberCodeSpecial() {
        return randomstring.generate({
            length: 4,
            charset: '1234567890'
        });
    }

    static generateHash(buff) {
        // console.log(buff.toString());
        let hash = CryptoJS.SHA256(buff.toString("utf-8"));
        // let hash2 = CryptoJS.SHA256();
        return hash.toString(CryptoJS.enc.Hex)
    }


    static isInteger(value) {
        return typeof value === 'number' && Number.isInteger(value);
    }

    static isNumber(value) {
        return typeof value === 'number';
    }

    static isBoolean(value) {
        return typeof value === 'boolean';
    }

    static isString(value) {
        return typeof value === 'string';
    }

    static isObject(value) {
        return value !== null && typeof value === 'object';
    }

    static isArray(value) {
        return value !== null && typeof value === 'object' && value.constructor === Array;
    }

    static isArrayOfString(value) {
        return Utils.isArray(value) && value.every(Utils.isString) && value.length > 0;
    }

    static isArrayOfObject(value) {
        return Utils.isArray(value) && value.every(Utils.isObject) && value.length > 0;
    }

    static isArrayOfInteger(value) {
        return Utils.isArray(value) && value.every(Utils.isInteger) && value.length > 0;
    }

    static isArrayOfNumber(value) {
        return Utils.isArray(value) && value.every(Utils.isNumber) && value.length > 0;
    }

    static isArrayOfBoolean(value) {
        return Utils.isArray(value) && value.every(Utils.isBoolean) && value.length > 0;
    }

    static isValidUrl(value) {
        return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
    }

    static validateServiceRoute(value) {
        const regex = /^(?!_)(?!.*_$)[a-zA-Z0-9_]+$/g;
        return regex.test(value)
    }

    /**
     * 
     * @param {*} str 
     * @returns 
     */
    static removeExtraSpace(str) {
        //str = str.replace(/[\s]{1,}/g, ""); // Enlève les espaces doubles, triples, etc.
        str = str.replace(/^[\s]{1,}/, ""); // Enlève les espaces au début
        str = str.replace(/[\s]{1,}$/, ""); // Enlève les espaces à la fin
        return str;
    }

    static cleanBlank(str) {
        return String(str).split(' ').join('') || "NA"
    }

    /* static formatDate(str) {
        console.log(str);
        let ndate = new Date(str)
        return moment(ndate).format('YYYY-MM-DD')
    } */

    static formatDate(str) {
        return moment(str, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }

}

module.exports = Utils