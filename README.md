[![Tests](https://github.com/jonaseberle/github-action-setup-ddev/workflows/tests/badge.svg?event=push)](https://github.com/jonaseberle/github-action-setup-ddev/actions)

# Setup and start ddev action

This **Github action** starts [drud](https://www.ddev.com/) [ddev](https://github.com/drud/ddev/) with your project's configuration from the directory `.ddev`.

The idea is to reuse the same environment that you are maintaining for development anyways for automated acceptance testing, thus saving on maintaining a separate CI-configuration.

## What it does

The action installs dependencies and applies a workaround for a docker-gen problem with Github actions ([issue](https://github.com/jwilder/docker-gen/issues/315)).

Then it starts ddev. Any additional services that you might have configured will be started and any post-start hooks etc. will be run.

## Example usage

This is a full example that you could copy to `.github/workflows/test.yml`: 
```yaml
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-18.04    # tested on: ubuntu-16.04/18.04/20.04
    steps:
      - uses: actions/checkout@v1
      - uses: jonaseberle/github-action-setup-ddev@v1
      # example: composer install
      - run: ddev composer install
      # example: fill database
      - run: ddev mysql < data/db.sql
      # example: install TYPO3 with helhum/typo3-console
      - run: ddev exec vendor/bin/typo3cms install:setup --admin-user-name=admin --admin-password=adminadmin --no-interaction
      # example: run something in the "web" container
      - run: ddev exec Build/runTests.sh
```
In short (for experienced Github Actioneers): 
```
  - uses: jonaseberle/github-action-setup-ddev@v1
```

If you have your `.ddev` folder outside of the repository root, you can specify it with following option:
```yaml
  - uses: jonaseberle/github-action-setup-ddev@v1
    with:
      ddevDir: ".devbox"
```

This will ensure that the initial setup will be done correctly. 

If you run additional ddev commands like `- run: ddev composer install` it's important to switch directories 
manually first, in each `- run`-section.

Can be done like this:

```yaml
   ...
      - uses: jonaseberle/github-action-setup-ddev@v1
        with:
          ddevDir: ".devbox"
      # example: composer install
      - run: |
          cd .devbox
          ddev composer install
```

If you don't want ddev to start automatically, you can specify it with the following option:
```yaml
  - uses: jonaseberle/github-action-setup-ddev@v1
    with:
      autostart: false
```



## Contact

For **bugs** and **feature requests** use the [Github bug tracker](https://github.com/jonaseberle/github-action-setup-ddev/issues).

Well-tested pull requests are very welcome.
