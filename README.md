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

Path to your ddev project.

default: `.` (root directory)

```yaml
  - uses: jonaseberle/github-action-setup-ddev@v1
    with:
      ddevDir: ".devbox"
  # run `ddev` project commands from that directory
  - run: ddev composer install
    working-directory: .devbox
```

#### autostart

Starts your ddev project immediately.

default: `true`

```yaml
  - uses: jonaseberle/github-action-setup-ddev@v1
    with:
      autostart: false
```

## Common recipes

### SSH keys

If your workflow needs to reach remote destinations that require private SSH keys, here is a snippet showing how you might add SSH keys that you have entered as Github "secrets":

```
- name: Set up SSH keys
  run: |
    mkdir -p .ddev/homeadditions/.ssh
    echo "${{ secrets.MY_KEY }}" > .ddev/homeadditions/.ssh/id_rsa
    echo "${{ secrets.MY_KNOWN_HOSTS }}" > .ddev/homeadditions/.ssh/known_hosts
    chmod 700 .ddev/homeadditions/.ssh
    chmod 600 .ddev/homeadditions/.ssh/id_rsa
- name: Set up ddev
  uses: jonaseberle/github-action-setup-ddev@v1
```

## Contact

For **bugs** and **feature requests** use the [Github bug tracker](https://github.com/jonaseberle/github-action-setup-ddev/issues).

Pull requests are very welcome.
