import { exec } from 'child_process';

const executeCommand = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
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

export const shutdownPC = async () => {
  return executeCommand('shutdown /s /t 0');
};

export const restartPC = async () => {
  return executeCommand('shutdown /r /t 0');
};

export const lockPC = async () => {
  return executeCommand('rundll32.exe user32.dll,LockWorkStation');
};

export const sleepPC = async () => {
  // Note: Hibernate must be disabled for this to actually sleep instead of hibernate:
  // powercfg -h off
  return executeCommand('rundll32.exe powrprof.dll,SetSuspendState 0,1,0');
};
