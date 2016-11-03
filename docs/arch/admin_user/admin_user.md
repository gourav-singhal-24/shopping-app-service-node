### Admin Users
Admin level users are represented by special nodes `AdminUser`. Node contains simple details such as name, email.

#### Admin credentials and auth
Admin credentials and authorization use `Credential` and `Auth` nodes, (similar to normal users).

![Nodes Admin User](nodes_auth_admin.puml)

#### Root Admin
One particular `AdminUser` node always exists in API, and is always there by default (along with its `Credential` node),
It cannot be added or removed by any API. It is differentiated from other admin user nodes by extra property `root : true`.

The other difference from normal, non root `AdminUser`'s is that root Admin can manage
(list/add/update/delete) other `AdminUser` nodes (except itself, of course).

#### Admin login
This is similar to [normal user login](../login_auth/login_auth.md), But the difference is that the `Auth` node
generated and/or granted for an admin user has `scope` as `['all']` and `level`as `admin`.



