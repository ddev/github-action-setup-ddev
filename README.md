[![Tests](https://github.com/jonaseberle/github-action-setup-ddev/workflows/tests/badge.svg?event=push)](https://github.com/jonaseberle/github-action-setup-ddev/actions)

# Setup and start ddev action

This **Github action** starts [ddev](https://github.com/drud/ddev/) with your project's configuration from the directory `.ddev`.

The idea is to reuse the same environment that you are maintaining for development anyways for automated acceptance testing, thus saving on maintaining a separate CI-configuration.

Any additional services that you might have configured will be started and any post-start hooks etc. will be run.

## Example Github workflow

```yaml
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-18.04    # tested on: 18.04/20.04
    steps:
      - uses: actions/checkout@v1
      - uses: jonaseberle/github-action-setup-ddev@v1
      # example: composer install
      - run: ddev composer install
      # example: fill database
      - run: ddev mysql < data/db.sql
      # ... and so on.
```

### Options

#### ddevDir

`default: ./.ddev`

If the `.ddev` folder is outside of the repository root, you can specify it with the option `ddevDir`:
```yaml
  - uses: jonaseberle/github-action-setup-ddev@v1
    with:
      ddevDir: ".devbox"
  # make sure to cd into that directory before using `ddev` commands
  - run: |
      cd .devbox
      ddev composer install
```
#### autostart

`default: true`

If you don't want ddev to start automatically, you can specify it with the following option:
```yaml
  - uses: jonaseberle/github-action-setup-ddev@v1
    with:
      autostart: false
```


## Contact

For **bugs** and **feature requests** use the [Github bug tracker](https://github.com/jonaseberle/github-action-setup-ddev/issues).

Pull requests are very welcome.
