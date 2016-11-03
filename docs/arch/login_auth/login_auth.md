## User Login and Authentication
`User` node is linked to `Credential` node at the time of registration. A Credential has a type (like 'password')
and a value (hash of the user password).

![Auth Nodes](nodes_auth.puml)

An Auth node is created and granted back to user on a successful login.
Normal user's `Auth` node has `scope` as `['api']` and `level` as `user`.

![Auth Nodes](flow_login.puml)

An auth node contains the `auth_token` which can be sent in a request to claim a request is an authentic request by a valid user.

![Auth Nodes](flow_auth.puml)

Since a valid authentication attaches the corresponding `Auth` node to request object,
the server code further processing that request, can obtain more information about the request from
`Auth` object attached to it such as user id, auth scope, auth level (admin/user) etc.
