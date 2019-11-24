# Setup ddev action

This action starts ddev <https://github.com/drud/ddev/> with your project's configuration from the directory `.ddev`.

It installs all dependencies and applies a workaround around a docker-gen problem in Github actions: <https://github.com/jwilder/docker-gen/issues/315>

## Example usage

uses: jonaseberle/github-action-setup-ddev@v1
