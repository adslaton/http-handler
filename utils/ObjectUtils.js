'use strict';

/** @module ObjectUtils */

/**
 * Helper functions that help to manipulate objects.
 */

module.exports = {
    /**
     * @param {*} obj to test
     * @return {boolean} true if obj is not null or undefined
     */
    exists: function exists(obj) {
        return obj !== undefined && obj !== null;
    },
    
    /**
     * Take a json string representation and return json
     * @typedef {function}
     * @private
     * @param {array} json A string representation of json
     * @return {object} A json object
     */
    parseJSON: function parseJSON(json) {
        try {
            json = JSON.parse(json);
        } catch (error) {
            log.error('ObjectUtils.parseJSON unable to parse json', error);
        }
        return json;
    },

    /**
     * Take a json object representation and returns a string
     * @typedef {function}
     * @private
     * @param {object} json A json object
     * @return {string} A json string representation
     */
    stringifyJSON: function stringifyJSON(json) {
        try {
            json = JSON.stringify(json);
        } catch (error) {
            log.error('ObjectUtils.stringifyJSON unable to stringify json', error);
        }
        return json;
    }

};
