"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleepPC = exports.lockPC = exports.restartPC = exports.shutdownPC = void 0;
const child_process_1 = require("child_process");
const executeCommand = (command) => {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            if (stderr) {
                console.warn(`Command stderr: ${stderr}`);
            }
            resolve(stdout);
        });
    });
};
const shutdownPC = async () => {
    return executeCommand('shutdown /s /t 0');
};
exports.shutdownPC = shutdownPC;
const restartPC = async () => {
    return executeCommand('shutdown /r /t 0');
};
exports.restartPC = restartPC;
const lockPC = async () => {
    return executeCommand('rundll32.exe user32.dll,LockWorkStation');
};
exports.lockPC = lockPC;
const sleepPC = async () => {
    // Note: Hibernate must be disabled for this to actually sleep instead of hibernate:
    // powercfg -h off
    return executeCommand('rundll32.exe powrprof.dll,SetSuspendState 0,1,0');
};
exports.sleepPC = sleepPC;
