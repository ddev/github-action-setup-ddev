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
            let cmd = 'sudo apt-get -qq update && sudo apt-get -qq -y install libnss3-tools';
            console.log(cmd);
            yield execShellCommand(cmd);
            cmd = 'curl -LO https://raw.githubusercontent.com/drud/ddev/master/scripts/install_ddev.sh && bash install_ddev.sh\n';
            console.log(cmd);
            yield execShellCommand(cmd);
            cmd = 'ddev config global --instrumentation-opt-in=false --omit-containers=dba,ddev-ssh-agent';
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
