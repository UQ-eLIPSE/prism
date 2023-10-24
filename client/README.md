**PRISM client**

This README should contain details on how to configure the server of the PRISM client.

_Techstack_

- React
- Node 16

## List of files to configure

- .env
  - SKIP_PREFLIGHT_CHECK - Skips preflight checks
  - REACT_APP_BASE_URL - Project base url

## Running

git clone git@bitbucket.org:elipse-team/prism-client.git
cd prism-client
cp .env.develop.example .env

### Running Locally

yarn && yarn start

### Running on zone

yarn && yarn build

### Linting and Prettier

It is always good practice to lint and prettier your code prior to review,
use this command to check that all linting errors are fixed and the code
is prettied
`yarn lint:pretty`
