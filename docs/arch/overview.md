## Overview

Top level structure of system consists of components shown below.

![Overview](overview.puml)

### Clients
Web and mobile clients interact via same API service.

### Api Service
Api Service contains following capabilities:

#### Server
NodeJS server receives clients requests and responds.

#### Storage

1. Database: Neo4j is used to store and query business data.
2. Files: AWS S3 storage is used to store files on cloud.

##### Events:

1. Email: Service can send out emails.
2. SMS: Service can send out SMS.
3. Push: Service can send out push notifications via APNS and GCM.
4. Socket: Service lets clients open socket connections and listen as well as send events.