**Prism**

This README should contain details on how to configure the server of the Prism Site.

_Techstack_

- MongoDB - DB of choice
- Express - HTTP Router of choice
- Manta - Object Storage of choice
- Node 20

## Quickly Get Started in Development Environment

Please run the application only inside docker with the following guidance during the application development.

1. Navigate to the prism project folder root:

```
cd prism
```

2. Execute the bash command:

```
./run_project_docker.sh
```

**Note**: When you run this script, you'll see the following information:

- Choose whether to download or re-download dump data.
- Enter your unique username (UQ username).
- Run docker-compose with / without --build

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
- Ensure `./run_server_docker.sh` is executable. If not, execute `chmod +x ./run_server_docker.sh`.
- To re-run the container, if data files already exist, answer "no" when asked, "Do you want to download Mongo dump data?"
- On the initial build, answer "y" when prompted to build the Docker images.
- Docker container will run background use `docker logs -f CONTAINER_ID` to monitor
- Test data DB output with `docker exec -it mongodb mongosh --eval 'db = db.getSiblingDB("agco360"); var cursor = db.sites.find().limit(1); while(cursor.hasNext()) { printjson(cursor.next()); }'`

## List of files to configure

- .env (use .env.prism_uat.example as a reference)

  - Use Conf.ts to act as a guide if .env.\*.sample is not up to date
  - DATABASE_URL - The location where MongoDB is (e.g. 'mongodb://localhost:27017/andrew-liveris')
  - PORT_NUM - The port to host the application (e.g. port 8000)
  - TMP_FOLDER - Where the tmp folder is located (i.e. ./prism/server/opt/tmp)
  - JWT_Hash - JWT salt hash
  - USE_SSO - Set to false for local development
  - MANTA_HOST_NAME - The location where Manta should be hosted. E.g. https://stluc.manta.uqcloud.net
  - MANTA_KEY_FILE - Where the public/private keys are to authenticate self to Manta i.e. ./prism/server/opt/tmp
  - MANTA_KEY_ID - The id of the key. E.g. SHA256:Some_Hashed_String
  - MANTA_SUB_USER - The subuser associated with the keys. Generally empty
  - MANTA_ROLES - The roles the user would have on Manta. Generally an empty array
  - MANTA_USER - The username associated with the Manta keys
  - MANTA_ROOT_FOLDER - Where the public folder is located on Manta. E.g. public/user_name/files

Make sure before running this server, you have the `prism-tst-id_rsa` key in the `server/opt/tmp/` folder in order to use the Manta functionality. The key can be found on Lastpass.

## Get dumpdata

### Get prism_uat dumpdata

In principle, development process will based on the test database `prism_uat`. When you run the bash script `run_project_docker.sh`, you will get latest dumpdata from prism_uat zone.

### Get product dumpdata

In some case, the product database will be needed to test in a development environment, you can get the dumpdata by:

- navigate to prism root
- run `./server/get_mongodumps.sh` to get product dumpdata
- restore by `mongorestore ./server/prism_mongodumps/<project-name>/<restore-file-name>`

## Creating a new PRISM UAT zone with Ansible

First configure inventory.ini with new UAT zone in both mango and newuatzone.
In other words replace prism-023 with the new instance prism-xxx to be created.
Set deployed=false in both mango and newuatzone sections to ensure a controlled deployment and then run playbook.
Controlled deployment prevents immediate changes to the active environment.
This deliberate step allows deployment users to review and validate configurations before applying them, minimizing the risk of unintended disruptions.
The flag is initially set to false to prioritize cautious deployment particularly in production or UAT environments.

`export PROXY_JUMP_USER=<UQuser>@mango.eait.uq.edu.au`

`ansible-playbook -i inventory/create_prism_zone/inventory.ini create-prism-zone.yml`

If zone was created and deleted earlier then scp command in playbook could give warning
`WARNING: POSSIBLE DNS SPOOFING DETECTED!`

The solution to this is to remove the host from known hosts in mango
`ssh-keygen -R prism-xxx.zones.eait.uq.edu.au`

Once PRISM is deployed to the new UAT zone then update inventory.ini for the host as deployed
`deployed=true`

## Deploying changes to PRISM UAT zone with Ansible

Install ansible and run playbook.

**Ubuntu**

```bash
sudo apt update
sudo apt install ansible
```

**MacOS**

`brew install ansible`

**pip**

`pip install ansible`

To test site accessibility run

`ansible all -m ping -i inventory/deploy/inventory.ini`

or

`ansible <server-group-name> -m ping -i inventory/deploy/inventory.ini`

**Running ansible-playbook**

To deploy PRISM on all uatzones

`export PROXY_JUMP_USER=<UQuser>@mango.eait.uq.edu.au`

`ansible-playbook -i inventory/deploy/inventory.ini deploy-prism.yml`

To deploy PRISM on 1 or more uatzones

`ansible-playbook -i inventory/deploy/inventory.ini -l prism-023.zones.eait.uq.edu.au deploy-prism.yml`

`ansible-playbook -i inventory/deploy/inventory.ini -l prism-021.zones.eait.uq.edu.au,prism-023.zones.eait.uq.edu.au deploy-prism.yml`

`ansible-playbook -i inventory/deploy/inventory.ini -l 'prism-02[13]*.zones.eait.uq.edu.au' deploy-prism.yml`

To re-deploy PRISM with any updates

`ansible-playbook -i inventory/deploy/inventory.ini -l prism-023.zones.eait.uq.edu.au deploy-prism.yml -e 'update_prism=true'`

If need to build and compress in tar.gz file

`ansible-playbook -i inventory/deploy/inventory.ini deploy-prism.yml -e "generate_compressed_build=true"`

If need to build and compress in tar.gz file as well as re-deploy PRISM with any updates

`ansible-playbook -i inventory/deploy/inventory.ini -l prism-023.zones.eait.uq.edu.au deploy-prism.yml -e 'update_prism=true generate_compressed_build=true'`

## Running workflow with Github Actions

Currently Github Actions UI displays Actions in the default branch ie main branch or Actions that have been triggered as a result of a push.

If a new workflow is added in .github/workflow dir and pushed in a new feature branch, we might not be able to view it in Github Actions.
To view and test a new workflow in a feature branch, ensure workflow gets trigerred when changes are pushed to feature branch.

```
on:
  workflow_dispatch:
  push:
    branches:
      - <feature_branch_placeholder>
```

`workflow_dispatch:` ensures manual triggering of the workflow is also possible.
Run Workflow button will be available as long as workflow_dispatch is present.
Clicking Run Workflow button after selecting feature branch will run this workflow manually from feature branch.
We might have a scenario where we want to run workflow without pushing to branch and in such cases its helpful.
