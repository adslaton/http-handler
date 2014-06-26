'use strict';
var http = require('http'),
    https = require('https'),
    defaultTimeout = 6 * 1000,
    ObjectUtils = require('./utils/ObjectUtils'),
    log = require('bunyan').createLogger({ name: 'http-utility', level: 10, src: true });

/**
 * Http request events handler function
 * @typedef {function}
 * @private
 * @param {object} httpOpts options used when making a request
 * @param {object} response http request object
 * @param {function} callback a function that will handle the response
 */
function handleRequestEvents(server, httpOpts, request, callback) {
    var timeout = httpOpts.timeout || defaultTimeout,
        sockets;

    request.on('socket', function (socket) {
        socket.setTimeout(timeout);

        socket.on('error', function (error) {
            log.error('Socket error handling request. host(%s) port(%s) path(%s):', httpOpts.host, httpOpts.port, httpOpts.path);
            log.error(error.message);
            log.error(error.stack);
            socket.destroy();
            request.end();
        });

        socket.on('timeout', function () {
            log.info('Request took over %sms to return. Request timed out.', timeout);
            log.info('host(%s) port(%s) path(%s)', httpOpts.host, httpOpts.port, httpOpts.path);
            log.info('heapdump being created');
            socket.destroy();
            request.end();
        });
    });

    request.on('error', function (error) {
        log.error('HTTP error: host(%s) port(%s) path(%s)', httpOpts.host, httpOpts.port, httpOpts.path);
        log.error(error.stack)
        request.end();
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
        log.error('Response error with http options (%j)', httpOpts);
        log.error(error.stack);
        request.abort();
        callback(error, null);
    });

    response.on('end', function () {
        var status = response.statusCode;
        if (parseInt(status / 100, 10) === 2) {
            callback(null, data);
        } else {
            callback({
                error: {
                    message: new Error('Bad satus code'),
                    statusCode: status
                },
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
        request,
        data;

    server.globalAgent.maxSockets = 10;

    request = server.get(httpOpts, function (response) {
        handleResponseEvents(httpOpts, response, request, callback);
    });

    handleRequestEvents(server, httpOpts, request, callback);

    if (httpOpts.method === 'POST' && ObjectUtils.exists(httpOpts.post_data)) {
        data = httpOpts.post_data;

        /* Make sure data is a string */
        if (typeof data !== 'string') {
            data = ObjectUtils.stringifyJSON(data);
        }

        request.write(data);
    }

    request.end();
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
