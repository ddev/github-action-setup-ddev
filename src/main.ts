import * as core from '@actions/core';
import {spawn} from 'child_process'
import * as path from 'path';

/**
 * Executes a shell command and return it as a Promise.
 */
function execShellCommand(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const process = spawn(cmd, [], {shell: true})
        let stdout = ""
        process.stdout.on('data', (data) => {
            console.log(data.toString());
            stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        process.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(code ? code.toString() : undefined))
            }
            resolve(stdout)
        });
    });
}

async function run() {
    try {
        await execShellCommand('echo \'dir: ' + __dirname + '\'');
        let cmd = 'sudo apt-get update'
        console.log(cmd);
        await execShellCommand(cmd);
        cmd = 'sudo apt-get -y -o Dpkg::Options::="--force-confnew" install libnss3-tools'
        console.log(cmd);
        await execShellCommand(cmd);
        cmd = 'curl -LO https://raw.githubusercontent.com/drud/ddev/master/scripts/install_ddev.sh && bash install_ddev.sh\n';
        console.log(cmd);
        await execShellCommand(cmd);
        cmd = 'ddev config global --instrumentation-opt-in=false --omit-containers=dba,ddev-ssh-agent';
        console.log(cmd);
        await execShellCommand(cmd);
        let _nginxTmplPath = path.join(__dirname, '..', '.ddev', 'patches', 'ddev-router', 'nginx.tmpl');
        cmd = 'ddev start || ( ' +
            '    docker cp ' + _nginxTmplPath + ' ddev-router:/app/nginx.tmpl ' +
            '    && ddev start ' +
            ')';
        console.log(cmd);
        await execShellCommand(cmd);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
