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
        
        let cmd = 'curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -';
        console.log('echo \'' + cmd + '\'');
        await execShellCommand(cmd);
        cmd = 'sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"';
        await execShellCommand('echo \'' + cmd + '\'');
        await execShellCommand(cmd);
        cmd = 'sudo apt-get update'
        await execShellCommand('echo \'' + cmd + '\'');
        await execShellCommand(cmd);
        cmd = 'sudo apt-get -y -o Dpkg::Options::="--force-confnew" install docker-ce libnss3-tools'
        await execShellCommand('echo \'' + cmd + '\'');
        await execShellCommand(cmd);
        core.addPath('/home/linuxbrew/.linuxbrew/bin');
        cmd = 'sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)"';
        await execShellCommand('echo \'' + cmd + '\'');
        await execShellCommand(cmd);
        cmd = 'brew tap drud/ddev';
        await execShellCommand('echo \'' + cmd + '\'');
        await execShellCommand(cmd);
        cmd = 'brew install ddev docker-compose mkcert nss';
        await execShellCommand('echo \'' + cmd + '\'');
        await execShellCommand(cmd);
        cmd = 'mkcert -install';
        await execShellCommand('echo \'' + cmd + '\'');
        await execShellCommand(cmd);
        cmd = 'ddev config global --instrumentation-opt-in=false';
        await execShellCommand('echo \'' + cmd + '\'');
        await execShellCommand(cmd);
        cmd = 'ddev config global --omit-containers=dba,ddev-ssh-agent';
        await execShellCommand('echo \'' + cmd + '\'');
        await execShellCommand(cmd);
        let _nginxTmplPath = path.join(__dirname, '..', '.ddev', 'patches', 'ddev-router', 'nginx.tmpl');
        cmd = 'ddev start || ( ' +
            '    docker cp ' + _nginxTmplPath + ' ddev-router:/app/nginx.tmpl ' +
            '    && ddev start ' +
            ')';
        await execShellCommand('echo \'' + cmd + '\'');
        await execShellCommand(cmd);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
