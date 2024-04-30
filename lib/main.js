"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
            const ddevDir = core.getInput('ddevDir') || '.';
            const autostart = core.getBooleanInput('autostart');
            yield execShellCommand('echo \'dir: ' + __dirname + '\'');
            let cmd = 'sudo install -m 0755 -d /etc/apt/keyrings';
            console.log(cmd);
            yield execShellCommand(cmd);
            cmd = 'curl -fsSL https://pkg.ddev.com/apt/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/ddev.gpg > /dev/null';
            console.log(cmd);
            yield execShellCommand(cmd);
            cmd = 'sudo chmod a+r /etc/apt/keyrings/ddev.gpg';
            console.log(cmd);
            yield execShellCommand(cmd);
            cmd = 'echo "deb [signed-by=/etc/apt/keyrings/ddev.gpg] https://pkg.ddev.com/apt/ * *" | sudo tee /etc/apt/sources.list.d/ddev.list >/dev/null';
            console.log(cmd);
            yield execShellCommand(cmd);
            const version = core.getInput('version') || 'latest';
            let ddevPackage = 'ddev';
            if (version !== 'latest') {
                ddevPackage += `=${version}`;
            }

            cmd = `sudo apt-get update && sudo apt-get install -y ${ddevPackage} && mkcert -install`;
            console.log(cmd);
            yield execShellCommand(cmd);

            if (version !== 'latest') {
                cmd = 'sudo apt-mark hold ddev';
                console.log(cmd);
                yield execShellCommand(cmd);
            }

            cmd = 'ddev --version';
            console.log(cmd);
            yield execShellCommand(cmd);
            cmd = 'ddev config global --instrumentation-opt-in=false --omit-containers=ddev-ssh-agent';
            console.log(cmd);
            yield execShellCommand(cmd);
            if(autostart){
                if (ddevDir != '.') {
                    cmd = 'cd ' + ddevDir + ' && ddev start';
                } else {
                    cmd = 'ddev start';
                }
                console.log(cmd);
                yield execShellCommand(cmd);
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
