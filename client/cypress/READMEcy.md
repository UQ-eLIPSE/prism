**Prism ATDD TEST**
_Quick Start_

1. navigate to test folder: `cd prism/atdd/`
2. install packages: `yarn`
3. (optional) for site need authentication and single session:
   firstly run bash in your terminal(this need to be done each time when you start VScode):
   `export CYPRESS_USERNAME=your-user-name`
   `export CYPRESS_PASSWORD=your-password`
   then continue with step 4.
4. start tests:`yarn cypress:run` or `yarn cypress run --headed --no-exit` (optional: `--spec <path/to/specific/testfilename>`)
