# Setup and start ddev action

This action starts [ddev](https://github.com/drud/ddev/) with your project's configuration from the directory `.ddev`.

The idea is to reuse the same environment that you are maintaining for development anyways for automated acceptance testing, thus saving on maintaining a separate CI-configuration.

## What it does

It installs all dependencies and applies a workaround for a docker-gen (which is used in ddev-router) problem in Github actions <https://github.com/jwilder/docker-gen/issues/315>.

Then it starts ddev. Any additional services that you might have configured will be started and any post-start hooks etc. will be run.

## Example usage

This is a full example that you could copy to `.github/workflows/test.yml`: 
```
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-18.04    # supported: ubuntu-16.04 and ubuntu-18.04
    steps:
      - uses: actions/checkout@v1
      - uses: jonaseberle/github-action-setup-ddev@v1
      # example: composer install
      - run: ddev composer install
      # example: fill database
      - run: ddev mysql < data/db.sql
      # example: install TYPO3 with helhum/typo3-console
      - run: ddev composer typo3cms install:setup --admin-user-name=admin --admin-password=adminadmin --no-interaction
      # example: run something in the "web" container
      - run: ddev exec Build/runTests.sh
```
## Contact

For **bugs** and **feature requests** use the [Github bug tracker](https://github.com/jonaseberle/github-action-setup-ddev/issues).

Well-tested pull requests are very welcome.