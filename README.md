http-handler
============

A wrapper for handling http requests

## Get Method

```
var Http = require('http-handler'),
    // See http://nodejs.org/api/http.html#http_http_request_options_callback
    options = {
        host: 'your-host-name'
    },
    request;
    
    request = Http.get(options, function callback () {
        // do something
    });
```

## Post Method

```
var Http = require('http-handler'),
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
    
    request = Http.post(options, function callback () {
        // do something
    });
```
