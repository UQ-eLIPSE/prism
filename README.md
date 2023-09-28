**Prism**

This README should contain details on how to configure the server of the Prism Site.

_Techstack_

- MongoDB - DB of choice
- Express - HTTP Router of choice
- Manta - Object Storage of choice
- Node 16

## List of files to configure

- .env (use .env.ANLB.sample or .env.kingston.sample or .env.urban_water.sample as a reference)

  - Use Conf.ts to act as a guide if .env.\*.sample is not up to date
  - DATABASE_URL - The location where MongoDB is (e.g. 'mongodb://localhost:27017/andrew-liveris')
  - PORT_NUM - The port to host the application (e.g. port 8000)
  - USE_SENTRY - Set to false to disable (useful for dev mode). Otherwise true for production.
  - SENTRY_DSN - See the Sentry site for the value of the DSN to be used.
  - TMP_FOLDER - Where the tmp folder is located (i.e. C:\Users\...\prism\tmp)
  - JWT_Hash - JWT salt hash
  - USE_SSO - Set to false for local development
  - MANTA_HOST_NAME - The location where Manta should be hosted. E.g. https://stluc.manta.uqcloud.net
  - MANTA_KEY_FILE - Where the public/private keys are to authenticate self to Manta i.e. in C://.ssh/id_rsa or C:\.ssh\id_rsa (PLEASE NOTE: you will need to create this file if it does not exist - private key found on LastPass).
  - MANTA_KEY_ID - The id of the key. E.g. SHA256:Some_Hashed_String
  - MANTA_SUB_USER - The subuser associated with the keys. Generally empty
  - MANTA_ROLES - The roles the user would have on Manta. Generally an empty array
  - MANTA_USER - The username associated with the Manta keys
  - MANTA_ROOT_FOLDER - Where the public folder is located on Manta. E.g. public/user_name/files

- .env-development (use .env.ANLB.sample as a reference)
  - Use Conf.ts to act as a guide if .env.urban_water.sample is not up to date
  - DATABASE_URL - The location where MongoDB is (e.g. 'mongodb://mongodb:27017/andrew-liveris')
  - PORT_NUM - The port to host the application (e.g. port 8000)
  - USE_SENTRY - Set to false to disable (useful for dev mode). Otherwise true for production.
  - SENTRY_DSN - See the Sentry site for the value of the DSN to be used.
  - AUTH_HOST - the zone site name (e.g 'prism-{tag}.uqcloud.net')

Make sure before running this server, you have the `prism-tst-id_rsa` key in the `tmp/` folder in order to use the Manta functionality. The key can be found on Lastpass.

## Quick Running locally with `run_docker.sh`
1. Navigate to the server-side project folder:
```
cd prism-server
```
2. Execute the script:
```
- ./run_docker.sh <yourUQname> <EnvFileName> <local data folder (where the local seed folder is)> <local seed folder> 
```
For an AGCO360 data seed project, replace <yourUQname> and use:
```
./run_docker.sh <yourUQname> .env.AGCO360.example agco360 2023_05_10_agco
```
**Note**: 
- Ensure install wget:
  - for mac: 
  ```
  brew install wget
  ```
  - for Debian/Ubuntu: 
  ```
  sudo apt update
  sudo apt install wget
  ```
- Ensure `./run_docker.sh` is executable. If not, execute `chmod +x ./run_docker.sh`.
- To rerun the container, if data files already exist, answer "no" when asked, "Do you want to download Mongo dump data?"
- On the initial build, answer "y" when prompted to build the Docker images.
- Docker container will run background use `docker logs -f CONTAINER_ID` to monitor
- Test data DB output with `docker exec -it mongodb mongosh --eval 'db = db.getSiblingDB("agco360"); var cursor = db.sites.find().limit(1); while(cursor.hasNext()) { printjson(cursor.next()); }'`

## Running
cd prism-server
cp .env.<project-name>.sample .env

### Running Locally 

before running locally you need to get the manta keys run

```
./get_mantakey.sh
```

and this should put the key in the correct directory

docker-compose up --build

### Running on Zone

yarn && yarn build

### Restoring mongobackups

Retrieve the dump files by using the `get_mongodumps.sh` script.

- Run:

  - `./get_mongodumps.sh <mango username> <output directory>`
  - navigate to `<outupt directory>` from here you can run `monogorestore <chooose a directory to restore>`

  example

  - prism_mongodumps
    - anlb_dump
    - agco360_dump
  - run `mongorestore anlb_dump` to restore the anlb backup

Download mongo database tools from this link if you do not have mongorestore

https://www.mongodb.com/try/download/database-tools

### Linting and Prettier

It is always good practice to lint and prettier your code prior to review,
use this command to check that all linting errors are fixed and the code
is prettied
`yarn lint:pretty`
