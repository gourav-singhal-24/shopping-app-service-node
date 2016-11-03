### Architecture
For API implementation details view the [Architecture documentation](arch/index.md).

### Content type
The API primarily receives and responds data in JSON format (`application/json`).
However, for a few operations like POST requests with file attachments, content type is multipart (`multipart/form-data`).

### API Access
All clients are required to send an `api_key` header with its value being Client API key explicitly provided to clients.
No request is to be entertained without a valid `api_key`.
The key can alternatively be sent as a url query parameter as well.

### Authorized Access
To make a request as an authorised user, a `auth_token` header is required,
with its value being a token provided as the response of a successful authorization (login).
The token can alternatively be sent as a url query parameter as well.

### Api Response
API response conveys the state of the resource(s) the request concerned or affected:

#### Success
The API response with HTTP status code 200 is considered success. And the returned data is expected to match the
intent of the request.

#### Failure
The API responses with HTTP status code 400 to 500 are considered errors. Of which the following are primary:

1. 400 - Bad Request. When input data does not match as expected by Service.
2. 401 - UnAuthorized. When access to a secure resource is denied, due to failure to establish authorisation.
3. 403 - Forbidden. When the operation intended by request is not permitted due to one or more condition in force.
4. 404 - Not Found. When the requested resource is not available on API or not found in Database etc.
5. 500 - Internal Server Error. A failure in service's request processing logic.

[See list of defined Api Errors](api_errors)

The HTTP status codes can immediately indicate a request failure. But further details can be found in the
standard error response returned. The error response structure is same for all errors, and contains an `error_code`
which can be mapped to a specific error.

### file storage support
The API offers a single `files` resource endpoint to upload, and later access, binary file data by its
unique identifier which will be generated by server for each upload.
The API is expected to support multiple file attachments in a single multi-part request.
The API is expected to return a `304`(not modified) status by honoring the `If-Modified-Since` request header,
so as to support efficient updates to cached file resource.

### Data Formats

#### Object ID
Entity id's are of type Number and are present as `id` property inside object json.
Clients are adviced to use 64bit primitives such as `long` to represent id values.

#### Dates and Times
The API uses [UTC](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) as the time reference.
Hence all timestamps are accepted, stored and delivered in form of milliseconds elapsed since unix epoch.
Textual representation, if transmitted or accepted, shall be in the format defined by the
[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#UTC) standard.

### Real time Data
Some API resources will allow `SocketIO` based connections and clients will be able to listen to events about
changes to that resource in real time.

### Events
Events generated on API due to user interaction can be delivered as "notifications", via an optimum delivery medium
such as email, push notification, sms or even socket.

[See list of defined Api Events](api_events)

### Paginated Data
When a Listing of resources is to be provided, the results shall support pagination. Clients can request a page by
providing `start` and `count` parameters in the url query. With each page of data, server shall also send:
 1. `total` items in result set.
 2. `next` URL link, whenever applicable, for clients to easily load next page of data.
 3. `previous` URL link, whenever applicable, for clients to easily load previous page of data.

### Input Schemas
For most requests, all field in input schema are required, unless specified by documentation.

### Exploring the API
The sections below contain documented listing of API resources, that can also be run from this UI.
`api_key` and `auth_token` to be used with requests can be set in fields provided at top of this page.
