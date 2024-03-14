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
./run_project_docker.sh (download from [get prism run on your local](https://elipse-uq.atlassian.net/wiki/spaces/URBAN/pages/2705358849/Run+Prism+on+your+local) )
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
