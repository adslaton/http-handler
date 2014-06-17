http-utility
============

A wrapper for handling events around http requests and responses. This includes the following events:

    request.connect
    request.error
    request.finish
    request.socket

    response.data
    response.end
    response.error

    socket.connection
    socket.error
    socket.timeout


## Install

```
npm install http-utility
```

## Usage

### Get Method

```
var Http = require('http-utility'),
    // See http://nodejs.org/api/http.html#http_http_request_options_callback
    options = {
        host: 'your-host-name'
    },
    request;

    request = Http.get(options, function callback (error, data) {
        // do something
    });
```

### Post Method

```
var Http = require('http-utility'),
    // See http://nodejs.org/api/http.html#http_http_request_options_callback
    options = {
        host: 'your-host-name',
        path: 'your/post/path',
        post_data: {data: "your data"},
        headers: {
            'Content-Type': 'your/content',
            'Content-Length': 'your-data-length'
        }
    },
    request;

    request = Http.post(options, function callback (error, data) {
        // do something
    });
```
