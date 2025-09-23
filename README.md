[![Tests](https://github.com/ddev/github-action-setup-ddev/workflows/tests/badge.svg?event=push)](https://github.com/ddev/github-action-setup-ddev/actions)

# Setup and start DDEV action

This **GitHub action** starts [DDEV](https://github.com/drud/ddev/) with your project's configuration from the directory `.ddev`.

The idea is to reuse the same environment that you are maintaining for development anyways for automated acceptance testing, thus saving on maintaining a separate CI-configuration.

Any additional services that you might have configured will be started and any post-start hooks etc. will be run.

## Example GitHub workflow

```yaml
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-22.04    # tested on: 20.04/22.04
    steps:
      - uses: actions/checkout@v1
      - name: Setup DDEV
        uses: ddev/github-action-setup-ddev@v1

      # example: composer install
      - run: ddev composer install

      # example: fill database
      - run: ddev mysql < data/db.sql

      # ... and so on. For example:
      - run: ddev exec bin/myAcceptanceTests.sh
      - run: ddev exec make tests
      - run: ddev composer ci:tests
      - run: ddev composer ci:tests:acceptance:${{ matrix.browser }}
      - run: ddev yarn --frozen-lockfile --no-progress --non-interactive && ddev yarn mocha-tests
      - run: ddev npm ci && ddev npm run mocha-tests
      - run: test 'test for expected output' = "$(curl --silent https://my-ddev-project.ddev.site)"

      # use different PHP version in a test matrix
      - run: |
         sed -i -e 's/^php_version:.*/php_version: ${{ matrix.php-version }}/g' .ddev/config.yaml \
           && ddev start
```

### Options

#### ddevDir

Path to your DDEV project. This path needs to contain the `.ddev/` directory.

default: `.` (root directory)

```yaml
  - name: Setup DDEV
    uses: ddev/github-action-setup-ddev@v1
    with:
      ddevDir: ".devbox"
  - name: 'You need to switch to that directory to use the `ddev` command'
    run: ddev composer install
    working-directory: .devbox
```

#### autostart

Starts your DDEV project immediately.

default: `true`

```yaml
  - uses: ddev/github-action-setup-ddev@v1
    with:
      autostart: false
```

#### version

Install a specific ddev version. The version must be available in ddev's apt repository.

default: `latest`

```yaml
  - uses: ddev/github-action-setup-ddev@v1
    with:
      version: 1.22.4
```

### installScriptUrl

URL to the DDEV installation script. This allows you to specify a custom or alternative source for the DDEV installation script.

default: `https://ddev.com/install.sh`

```
  - uses: ddev/github-action-setup-ddev@v1
    with:
      installScriptUrl: "https://raw.githubusercontent.com/ddev/ddev/v1.22.4/scripts/install_ddev.sh"
```

This option is useful for:
- Using a specific version of the installation script from a tagged release
- Testing with a development version from a specific branch
- Using a forked or modified version of the installation script
- Working with air-gapped environments that require local script hosting

Example with custom script source:

```
  - name: Setup DDEV with custom installation script
    uses: ddev/github-action-setup-ddev@v1
    with:
      installScriptUrl: "https://my-company.com/scripts/custom_ddev_install.sh"
      version: "v1.22.4"
      retryAttempts: 3
```

### Retry configuration options

The action includes built-in retry logic with exponential backoff for improved reliability in CI/CD environments. These options are all optional and have sensible defaults.

#### retryAttempts

Maximum number of retry attempts for DDEV installation and operations.

default: `5`

```
  - uses: ddev/github-action-setup-ddev@v1
    with:
      retryAttempts: 5
```

#### initialDelay

Initial delay in seconds between retries.

default: `2`

```
  - uses: ddev/github-action-setup-ddev@v1
    with:
      initialDelay: 5
```

#### maxDelay

Maximum delay in seconds between retries. This prevents the delay from growing too large with exponential backoff.

default: `30`

```
  - uses: ddev/github-action-setup-ddev@v1
    with:
      maxDelay: 60
```

#### retryMultiplier

Delay multiplier for exponential backoff. Each retry will multiply the previous delay by this value.

default: `2`

```
  - uses: ddev/github-action-setup-ddev@v1
    with:
      retryMultiplier: 3
```

#### jitterPercent

Jitter percentage (0-100) to add randomness to retry delays. This helps prevent thundering herd problems when multiple jobs retry simultaneously.

default: `25`

```
  - uses: ddev/github-action-setup-ddev@v1
    with:
      jitterPercent: 50
```

## Common recipes

### SSH keys

If your workflow needs to reach remote destinations that require private SSH keys,
we recommend adding SSH keys that you have entered as [GitHub "secrets"](https://docs.github.com/en/actions/security-guides/encrypted-secrets):

```
- name: Setup SSH keys
  run: |
    mkdir -p .ddev/homeadditions/.ssh
    echo "${{ secrets.MY_KEY }}" > .ddev/homeadditions/.ssh/id_rsa
    chmod 700 .ddev/homeadditions/.ssh
    chmod 600 .ddev/homeadditions/.ssh/id_rsa
- name 'optional: set up host keys'
  run: |
    echo "${{ secrets.MY_KNOWN_HOSTS }}" > .ddev/homeadditions/.ssh/known_hosts
- name: Setup DDEV
  uses: ddev/github-action-setup-ddev@v1
```

## Contact

For **bugs** and **feature requests** use the [GitHub bug tracker](https://github.com/ddev/github-action-setup-ddev/issues).

Pull requests are very welcome.
