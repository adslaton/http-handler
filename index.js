'use strict';
var http = require('http'),
    https = require('https'),
    defaultTimeout = 6 * 1000,
    ObjectUtils = require('./utils/ObjectUtils'),
    log = console;

/**
 * Http request events handler function
 * @typedef {function}
 * @private
 * @param {object} httpOpts options used when making a request
 * @param {object} response http request object
 * @param {function} callback a function that will handle the response
 */
function handleRequestEvents(httpOpts, request, callback) {
    var timeout = httpOpts.timeout || defaultTimeout;

    request.on('socket', function (socket) {
        socket.setTimeout(timeout);

        socket.on('error', function (error) {
            log.error('Socket error handling request. Options(%j):', httpOpts);
            log.error(error.message);
            log.error(error.stack);
            request.abort();
            /* request.abort emits 'error' event which is handled below */
        });

        socket.on('timeout', function () {
            log.debug('Request took over %sms to return. Request timed out.', timeout);
            log.debug('Options(%j):', httpOpts);
            request.abort();
            /* request.abort emits 'error' event which is handled below */
        });
    });

    request.on('error', function (error) {
        log.error('Error: options(%j)', httpOpts);
        log.error(error.message);
        log.error(error.stack);
        callback(error, null);
    });
}

/**
 * Http response events function
 * @typedef {function}
 * @private
 * @param {object} httpOpts options used when making a request
 * @param {object} response http response object
 * @param {object} response http request object
 * @param {function} callback a function that will handle the response
 */
function handleResponseEvents(httpOpts, response, request, callback) {
    var data = '';

    response.on('data', function (d) {
        data += d;
    });

    response.on('error', function (error) {
        log.error('Response error. Options(%j)', httpOpts);
        log.error(error.message);
        log.error(error.stack);
        request.abort();
        callback(error, null);
    });

    response.on('end', function () {
        if (parseInt(response.statusCode / 100, 10) === 2) {
            callback(null, data);
        } else {
            callback({
                error: new Error('Bad satus code: %s', response.statusCode),
                data: data
            });
        }
    });
}

/**
 * Http request get function
 * @typedef {function}
 * @private
 * @param {object} httpOpts options used when making a request
 * @param {function} callback a function that will handle the response
 */
function getData(httpOpts, callback) {
    var server = /^https:/.test(httpOpts) ? https : http,
        request = server.get(httpOpts, function (response) {
            handleResponseEvents(httpOpts, response, request, callback);
        }),
        data;

    handleRequestEvents(httpOpts, request, callback);

    if (httpOpts.method === 'POST' && ObjectUtils.exists(httpOpts.post_data)) {
        data = httpOpts.post_data;

        /* Make sure data is a string */
        if (typeof data !== 'string') {
            data = ObjectUtils.stringifyJSON(data);
        }

        request.write(data);
    }
}

/**
 * Http request function
 * @typedef {function}
 * @private
 * @param {object} httpOpts options used when making a request
 * @param {function} callback a function that will handle the response
 */
function httpRequest(httpOpts, callback) {
    getData(httpOpts, callback);
}

/**
 * @module http-handler
 */
module.exports = {
    /**
     * Http get function
     * @typedef {function}
     * @param {object} httpOpts options used when making a request
     * @param {function} callback a function that will handle the response
     */
    get: function get(httpOpts, callback) {
        if (!ObjectUtils.exists(httpOpts)) {
            callback(new Error('Param httpOpts is required'));
            return;
        }

        httpOpts.method = 'GET';
        httpRequest(httpOpts, callback);
    },
    /**
     * Http post function
     * @typedef {function}
     * @param {object} httpOpts options used when making a request
     * @param {function} callback a function that will handle the response
     */
    post: function post(httpOpts, callback) {
        if (!ObjectUtils.exists(httpOpts)) {
            callback(new Error('Param httpOpts is required'));
            return;
        }

        httpOpts.method = 'POST';
        httpRequest(httpOpts, callback);
    }
};
