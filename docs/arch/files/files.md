## File Uploads
User can upload a file using `multipart/form-data` upload. In return user is provided a `File` node.
The node has file url and associated metadata about file: id, object_key, MIME type, size, timestamp etc.

![Upload Flow](flow_files.puml)

The upload is streamed to Storage Service, and a corresponding `File` node is created in database.

![Upload Sequence](seq_files.puml)

A `File` node is also linked to the Uploading `User` Node, for reference.

![Upload Nodes](nodes_files.puml)

User's can then access the file download streams via file's url.

## Serving protected files through StorageService
User makes a request with usual auth_token to File API endpoint.
The API checks auth_token and if valid generates a "signed" url.
When signing url, a time limit can also be set. API then re-directs client to the generated url.

![Download Sequence](seq_download.puml)

