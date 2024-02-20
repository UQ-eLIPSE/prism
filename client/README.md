**PRISM client**

_Techstack_

- React
- Node 20

## Running Locally

yarn && yarn start

### configure env variables

Client side use standardized env.js which located inside `client/public/` folder including configuration for:

- `API_URL`: Backend API
- `PROJECT_TITLE`: (for products deployment, will be resign a value via Ansible Playbook script)
- `SSO` (for products, SSO will be resign a value via Ansible Playbook script)

## Running on zone

yarn && yarn build

## Linting and Prettier

It is always good practice to lint and prettier your code prior to review,
use this command to check that all linting errors are fixed and the code
is prettied
`yarn lint:pretty`

## Running Cypress Tests

1. navigate to test folder: `cd prism/client/`
2. start tests:

- for local test run:
  `yarn cypress:run:local`: for project: AEB, ANLB, Camphill, Kingston, UqLakes
  `yarn cypress:run:local-agco360`: for project AGCO360
  `yarn cypress:run:local-uwmt`: for project Urban Water
- for UAT test run:
  `yarn cypress:run:uat`: for project: AEB, ANLB, Camphill, Kingston, UqLakes
  `yarn cypress:run:uat-agco360`: for project AGCO360
  `yarn cypress:run:uat-uwmt`: for project Urban Water

3. trouble-shooting:
   To watch cypress run on browser, you can use:

- launch browsers: `-headed`, `-browser chrome`
- with `no-exit`, you can stay on current test case in browsers to debug

** Note ** : for some project, you may need run --spec if only one test failed, to just run this specific test case, you can use:

- `--spec cypress/e2e/<testfilename>`

(refer to https://docs.cypress.io/guides/guides/command-line)
