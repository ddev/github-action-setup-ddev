"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
/**
 * Executes a shell command and return it as a Promise.
 */
function execShellCommand(cmd) {
    return new Promise((resolve, reject) => {
        const process = child_process_1.spawn(cmd, [], { shell: true });
        let stdout = "";
        process.stdout.on('data', (data) => {
            console.log(data.toString());
            stdout += data.toString();
        });
        process.stderr.on('data', (data) => {
            console.error(data.toString());
        });
        process.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(code ? code.toString() : undefined));
            }
            resolve(stdout);
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield execShellCommand('echo \'dir: ' + __dirname + '\'');
            let cmd = 'curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -';
            yield execShellCommand('echo \'' + cmd + '\'');
            yield execShellCommand(cmd);
            cmd = 'sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"';
            yield execShellCommand('echo \'' + cmd + '\'');
            yield execShellCommand(cmd);
            cmd = 'sudo apt-get update';
            yield execShellCommand('echo \'' + cmd + '\'');
            yield execShellCommand(cmd);
            cmd = 'sudo apt-get -y -o Dpkg::Options::="--force-confnew" install docker-ce libnss3-tools';
            yield execShellCommand('echo \'' + cmd + '\'');
            yield execShellCommand(cmd);
            core.addPath('/home/linuxbrew/.linuxbrew/bin');
            cmd = 'sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)"';
            yield execShellCommand('echo \'' + cmd + '\'');
            yield execShellCommand(cmd);
            cmd = 'brew tap drud/ddev';
            yield execShellCommand('echo \'' + cmd + '\'');
            yield execShellCommand(cmd);
            cmd = 'brew install ddev docker-compose mkcert nss';
            yield execShellCommand('echo \'' + cmd + '\'');
            yield execShellCommand(cmd);
            cmd = 'mkcert -install';
            yield execShellCommand('echo \'' + cmd + '\'');
            yield execShellCommand(cmd);
            cmd = 'ddev config global --instrumentation-opt-in=false';
            yield execShellCommand('echo \'' + cmd + '\'');
            yield execShellCommand(cmd);
            cmd = 'ddev config global --omit-containers=dba,ddev-ssh-agent';
            yield execShellCommand('echo \'' + cmd + '\'');
            yield execShellCommand(cmd);
            let _nginxTmplPath = path.join(__dirname, '..', '.ddev', 'patches', 'ddev-router', 'nginx.tmpl');
            cmd = 'ddev start || ( ' +
                '    docker cp ' + _nginxTmplPath + ' ddev-router:/app/nginx.tmpl ' +
                '    && ddev start ' +
                ')';
            yield execShellCommand('echo \'' + cmd + '\'');
            yield execShellCommand(cmd);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
