## API Documentation module

This module is used to maintain and serve API documentation, using the [Swagger API specification](http://swagger.io).

### Serving via API

This module exposes a `serve()` function, that can be used to serve the documentation UI from an [express](http://expressjs.com/) app.
The Ui will be served at `/docs` API path and YAML doc file will be served at `/docs/yaml` API path.

Example:

    var express = require('express');
    var app = express();

    var docs = require(<path to docs module directory>);
    docs.serve(app);

    app.listen(8080);

In case of an already existing express app instance, just call `docs.serve(app);`, providing the express app as input.

The `serve` method also accepts a express.Router object.

### Browsing documentation

After Ui is served. Point a browser to `/docs` path on the API url.
