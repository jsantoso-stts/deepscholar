<p align="center"><img src="https://github.com/paperai/deepscholar/blob/master/logo/deepscholar_logo.png" width="400"></p>

# DeepScholar

[![Build Status](https://travis-ci.org/paperai/deepscholar.svg?branch=master)](https://travis-ci.org/paperai/deepscholar)

`DeepScholar` is an AI-powered search engine for scholarly papers.

## Requirements

### Install Docker
- [Docker for Mac](https://www.docker.com/docker-mac)
- [Docker for Windows](https://www.docker.com/docker-windows)

### Install development dependencies

```
$ cd deepscholar
$ npm install
```

## Create .env to set environment variables to Docker

1. Copy from .env.example
    ```
    $ cd deepscholar
    $ cp .env.example .env
    ```

2. Edit .env  
    ```
    DS_FRONT_PORT=8080
    DS_CLIENT_PORT=3000
    DS_SERVER_PORT=3001
    DS_ES_PORT=9200
    DS_KIBANA_PORT=5601
    DS_ESHEAD_PORT=9100
    OAUTH_GITHUB_CLIENT_ID=12345678901234567890
    OAUTH_GITHUB_CLIENT_SECRET=1234567890123456789012345678901234567890
    DEEP_SCHOLAR_URL=http://localhost:8080
    DEEP_SCHOLAR_TOKEN_SECRET=12345678901234567890
    DEEP_SCHOLAR_TOKEN_ISSUER=DEEP_SCHOLAR
    DEEP_SCHOLAR_TOKEN_AUDIENCE=DEEP_SCHOLAR
    ```

## Run application

```
$ cd deepscholar
$ docker-compose up
```

You can see your application at [http://localhost:8080](http://localhost:8080)  
**The port 8080 depends on DS_FRONT_PORT setting.**

## Developer's Guide
```
tree client/src
client/src
├── api.js # API for Elasticsearch
├── components # Single React components
│   ├── index.js
│   └── style.css
├── containers # React components (container) for each page
│   ├── App # Entire application
│   │   ├── index.js
│   │   └── style.css
│   ├── Detail # Details of document
│   │   ├── index.js
│   │   └── style.css
│   └── Search # Search screen
│       └── index.js
├── index.js # Starting point of React
├── module.js # Related to Redux
└── registerServiceWorker.js # Something made by templates (not used yet)
```

### Papers
* Initialize
This command delete all papers indexes and initialize index mappings.

```
$ docker-compose exec deepscholar.server npm -s run es:initializePapers
  Papers' indexes have been initialized.
```

* Import
```
$ cat ~/sample.json | docker exec -i `docker-compose ps -q deepscholar.server` npm run -s es:importPapers
Now papers have been creating.
Inserted 482 papers.
Inserted 475 papers.
Inserted 514 papers.
...
```

`docker-compose exec` doesn't keep stdin open. So we need to use `docker exec` instead.
See https://github.com/docker/compose/issues/3352#issuecomment-284547977
    
Please define limit bytes to import Elasticsearch's Bulk API using `DS_BULK_LIMIT_BYTE_PER_REQUEST` in .env file.

### Entities
* Import
```
cat <entity-schema.json> <entities.json> | docker exec -i `docker-compose ps -q deepscholar.server` npm run -s es:importEntities
```

* Delete
```
docker-compose exec -T deepscholar.server npm -s run es:deleteEntities
```

### Database
* Delete
1. Open [mongo-express](http://localhost:8081)
2. Click `Del` button on `deepscholar` database. 

### Export search histories to tsv
```
$ docker-compose exec deepscholar.server npm -s run es:dump:searchHistories > searchHistories.tsv 
```

### Add DeepScholar application administrator role to a user  

1. Open [users collection](http://localhost:8081/db/deepscholar/users) on mongo-express.
2. Click `Find` with the following query
    - Key: profile.username
    - Value: Github username which you want to change him to administrator.
3. Click the matched row
4. Add `isAdmin` boolean property with `true`
    ```
    {
        "_id": ObjectID("XXXXXXXXXXXXXXXXXXXXXXXX"),
        "isAdmin": true,
        ...
    }
    ```
5. Click `Save`
 
**To remove this role, just set `isAdmin` to false, or remove the property**

### Change search fields' weight settings

1. Open [settings collection](http://localhost:8081/db/deepscholar/settings) on mongo-express.
2. Click `Find` with the following query
    - Key: name
    - Value: es:query:multi_match:fields
3. Click the matched row
4. Change weight numbers for each fields in `value` property. The value should be `{fieldName}^{weight}`. 
    ```
    {
        "_id": ObjectID("XXXXXXXXXXXXXXXXXXXXXXXX"),
        "name": "es:query:multi_match:fields",
        "value": [
            "articleTitle^10",
            "abstract^5",
            "authors^1"
        ]
    }
    ```
5. Click `Save`

**If the record is not found, search using deepscholar once. Then initial record will be created.**

### Development Tools

|        Name        |                      URL                       |
| ------------------ | ---------------------------------------------- |
| Kibana             | [http://localhost:5601](http://localhost:5601) |
| elasticsearch-head | [http://localhost:9100](http://localhost:9100) |
| mongo-express      | [http://localhost:8081](http://localhost:8081) |

The ports are changed using environment variables.
