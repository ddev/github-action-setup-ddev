# AGENTS.md

Guidance for AI agents working on `ddev/github-action-setup-ddev`, the GitHub
Action that installs [DDEV](https://github.com/ddev/ddev) on a runner and
optionally starts a project. Users run it as `ddev/github-action-setup-ddev@v1`.

DDEV's
[organization-wide patterns](https://raw.githubusercontent.com/ddev/.github/main/AGENTS.md)
cover boundaries, writing style, branches, commits, PRs, and AI attribution.
Read them first. This file adds what is specific to this repository, and
**wins where they differ**.

Fetch GitHub files through `raw.githubusercontent.com`, not
`github.com/.../blob/...` pages, which wrap the file in markup.

## Layout

| Path | What it is |
| --- | --- |
| `action.yml` | The whole action: a composite action of `bash` steps |
| `README.md` | User docs, with one section per input |
| `.github/workflows/main.yml` | The `tests` workflow, which runs the action from `./` |
| `tests/fixtures/ddevProj1/` | The DDEV project that the tests start |
| `.github/workflows/update-main-version.yml` | Moves the `v1` tag when a `v*` release tag is pushed |

## Changing the action

- Users pin `@v1`, so every change on `main` reaches them with the next
  release. Keep inputs and behavior compatible. A breaking change needs a new
  major version, and maintainers decide that.
- Document each new or changed input in `README.md`, with its default and a
  short example.
- In `run:` scripts, pass inputs through `env:` and quote the variables. Don't
  put `${{ inputs.* }}` inside the script, because the value becomes shell
  code.
- Each composite step needs `shell: bash`.
- `version` takes `latest`, `head`, or a release number without the `v`,
  such as `1.24.8`. The install step adds the `v` for `install.sh`.

## Testing

There is no local test suite. The `tests` workflow is the test. It runs on
pull requests, on pushes to `main`, nightly at 00:00 UTC, and on
`workflow_dispatch`. Its matrix covers `ubuntu-24.04` and `ubuntu-24.04-arm`
with `version` set to `latest`, `head`, and `1.24.8`.

- Changes that touch only `*.md` files skip the workflow (`paths-ignore`).
- To run it on a pushed branch without a PR:

  ```bash
  gh workflow run main.yml -R ddev/github-action-setup-ddev --ref <branch>
  ```

- Before you push, check that `action.yml` still parses:
  `yq '.runs.steps[].name' action.yml`.
- When you change what the action installs or starts, add an assertion to
  `main.yml`, as the `ddev version` step does for `1.24.8`.
- For a remote shell on the runner, run the workflow by hand with
  `debug_enabled` set. It opens an upterm session that only the person who
  started the run can join.

### Nightly failures

The nightly run often fails for reasons outside this repository, such as a
DDEV `main` build that broke, or a download service that failed. Find the
first error in the failed step's log before you change anything here. Check
whether the same job passed on the previous nights with the same commit.
DDEV maintainers can use `/ddev:ci-failure` from
[ddev/agent-skills](https://github.com/ddev/agent-skills) for this.

## Releases

Maintainers release by publishing a GitHub release with a `vX.Y.Z` tag.
`update-main-version.yml` then moves `v1` to that release. Don't create,
move, or delete tags yourself.
