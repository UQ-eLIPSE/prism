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

- Create ".env.prism_uat.example" in your `server/`, copy script from the url [get prism run on your local](https://elipse-uq.atlassian.net/wiki/spaces/URBAN/pages/2705358849/Run+Prism+on+your+local).
- Download and create a bash script "run_project_docker.sh" under your prism root from the url above [get prism run on your local].

```
./chmod +x run_project_docker.sh
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

## Linting and Prettier

It is always good practice to lint and prettier your code prior to review,
use this command to check that all linting errors are fixed and the code
is prettied
`cd client && yarn lint:pretty`
`cd server && yarn lint:pretty`

## Running Cypress Tests

1. navigate to test folder: `cd prism/client/`
2. start tests:

- for local test run:
  `yarn cypress:run:local`: for single site project: AEB, ANLB, Camphill, Kingston, UqLakes
  `yarn cypress:run:local-multi`: for multi sites project

- for UAT test run:
  `yarn cypress:run:uat`: for project: AEB, ANLB, Camphill, Kingston, UqLakes
  `yarn cypress:run:uat-multi`: for project AGCO360

3. trouble-shooting:
   To watch cypress run on browser, you can use:

- launch browsers: `-headed`, `-browser chrome`
- with `no-exit`, you can stay on current test case in browsers to debug

** Note ** : for some project, you may need run --spec if only one test failed, to just run this specific test case, you can use:

- `--spec cypress/e2e/<testfilename>`

(refer to https://docs.cypress.io/guides/guides/command-line)
