## Connecting Users
User's can send connect requests to other Users. Other users can then accept or reject to be connected.
Once connection graph starts to build, the complex queries can yield results such as "Suggested connections".

#### Connection Request
A user specifies the id of the target user. This creates a `ConnectRequest` node related to both `User` nodes.
The `ConnectRequest` node also stores from,to user ids as well as timestamp.

![Nodes Connect Request](nodes_request.puml)

*Repeated connect request do not create new `ConnectRequest` nodes if one already exists for User's.*

#### Cancel Request
The `ConnectRequest` node deleted and its relations to user's removed.

#### Accept or Reject Request
The target user can accept or reject the connection request,
by specifying `ConnectRequest` node's id and a true/false value'.

1. If accepted:
    1. The `ConnectRequest` node is deleted and its relations to user's removed.
    2. `CONNECTED_TO` relation is created from requesting user to target user. (if not existing already)
    3. ![Nodes Connected](nodes_connected.puml)
2. If rejected:
    1. The `ConnectRequest` node is deleted and its relations to user's removed. (if exists)
    2. ![Nodes Rejected](nodes_rejected.puml)

#### Disconnect
A user can specify a target user id to disconnect from.
The `CONNECTED_TO` relation, if exists, is removed between users (irrespective of relation direction).

#### Events
The following events are generated:
1. Connection Request.
2. Connected. (Request accepted)

And appropriate notification should be sent to user's via appropriate medium.