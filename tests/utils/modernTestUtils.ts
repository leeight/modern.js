import path from 'path';
import spawn from 'cross-spawn';
import treeKill from 'tree-kill';
import portfinder from 'portfinder';

const kModernBin = path.join(
  __dirname,
  '../node_modules/@modern-js/core/bin/modern-js',
);

export function runModernCommand(argv: any[], options: any = {}) {
  const { cwd } = options;
  const cmd = argv[0];
  const env = {
    ...process.env,
    ...options.env,
  };

  return new Promise<{ code: number; stdout: string; stderr: string }>(
    (resolve, reject) => {
      // console.log(`Running command "modern ${argv.join(' ')}"`);
      const instance = spawn(process.execPath, [kModernBin, ...argv], {
        ...options.spawnOptions,
        cwd,
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      if (typeof options.instance === 'function') {
        options.instance(instance);
      }

      let stderrOutput = '';
      if (options.stderr) {
        instance.stderr?.on('data', (chunk: string) => {
          stderrOutput += chunk;
        });
      }

      let stdoutOutput = '';
      // if (options.stdout) {
      instance.stdout?.on('data', async (chunk: string) => {
        let marker = options.marker || /compiled successfully/i;
        if (cmd === 'deploy') {
          marker = /end deploy!/i;
        }
        stdoutOutput += chunk;
        const message = chunk.toString();
        if (marker.test(message)) {
          resolve({
            code: 0,
            stdout: stdoutOutput,
            stderr: '',
          });
          await killApp(instance);
        }
      });
      // }

      instance.on('close', (code: number) => {
        resolve({
          code,
          stdout: stdoutOutput,
          stderr: stderrOutput,
        });
      });

      instance.on('error', (err: any) => {
        err.stdout = stdoutOutput;
        err.stderr = stderrOutput;
        reject(err);
      });
    },
  );
}

export function runModernCommandDev(
  argv: any[],
  stdOut: any,
  options: any = {},
) {
  const { cwd } = options;
  const env = {
    ...process.env,
    ...options.env,
  };

  return new Promise<void>((resolve, reject) => {
    const instance = spawn(process.execPath, [kModernBin, ...argv], {
      cwd,
      env,
    });

    let didResolve = false;

    function handleStdout(data: any) {
      const message = data.toString();
      const bootupMarkers = {
        dev: /App running at/i,
        start: /App running at/i,
      };
      if (bootupMarkers[options.modernStart ? 'start' : 'dev'].test(message)) {
        if (!didResolve) {
          didResolve = true;
          resolve(stdOut ? message : instance);
        }
      }

      if (typeof options.onStdout === 'function') {
        options.onStdout(message);
      }

      if (options.stdout !== false) {
        process.stdout.write(message);
      }
    }

    instance.stdout?.on('data', handleStdout);

    instance.on('error', (error: any) => {
      reject(error);
    });

    instance.on('close', () => {
      instance.stdout?.removeListener('data', handleStdout);
      if (!didResolve) {
        didResolve = true;
        resolve();
      }
    });
  });
}

export function modernBuild(dir: string, args = [], opts = {}) {
  return runModernCommand(['build', ...args], {
    ...opts,
    cwd: dir,
    stdout: true,
    stderr: true,
    env: {
      NODE_ENV: 'production',
    },
  });
}

export function modernDeploy(dir: string, mode = '', opts = {}) {
  return runModernCommand(['deploy', `--dir=${dir}`, `--mode=${mode}`], {
    ...opts,
    stdout: true,
    cwd: dir,
    env: {
      NODE_ENV: 'production',
      BUILD_PATH: '',
    },
    cmd: 'deploy',
  });
}

export function launchApp(
  dir: string,
  port: string | number,
  opts = {},
  env = {},
) {
  return runModernCommandDev(['dev'], undefined, {
    ...opts,
    cwd: dir,
    env: {
      PORT: port,
      NODE_ENV: 'development',
      ...env,
    },
  });
}

export function modernStart(dir: string, port: string | number, opts = {}) {
  return runModernCommandDev(['start'], undefined, {
    ...opts,
    cwd: dir,
    env: {
      PORT: port,
      NODE_ENV: 'production',
    },
    modernStart: true,
  });
}

export async function killApp(instance: any) {
  await new Promise<void>((resolve, reject) => {
    if (!instance) {
      resolve();
    }

    treeKill(instance.pid, err => {
      if (err) {
        if (
          process.platform === 'win32' &&
          typeof err.message === 'string' &&
          (err.message.includes(`no running instance of the task`) ||
            err.message.includes(`not found`))
        ) {
          // Windows throws an error if the process is already dead
          //
          // Command failed: taskkill /pid 6924 /T /F
          // ERROR: The process with PID 6924 (child process of PID 6736) could not be terminated.
          // Reason: There is no running instance of the task.
          return resolve();
        }
        return reject(err);
      }
      return resolve();
    });
  });
}

export function markGuardian() {
  // IGNORE
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function installDeps(dir: string) {
  // console.log(`Installing dependencies in ${dir}`);
  // FIXME: 跳过本地依赖的安装，因为在根目录执行 pnpm install --ignore-scripts 的时候已经安装好了
  // spawn.sync('pnpm', ['install', '--filter', './', '--ignore-scripts'], {
  //   stdio: 'inherit',
  //   cwd: dir,
  // });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function clearBuildDist(dir: string) {
  // console.log(`Clearing build dist in ${dir}`);
  // not support nested projects
  // const _clearBuildDist = _dir => {
  //   const isProjectRoot = fs.existsSync(path.join(_dir, 'package.json'));
  //   if (isProjectRoot) {
  //     rimraf.sync(path.join(_dir, 'dist'));
  //   } else {
  //     const files = fs.readdirSync(_dir);
  //     files.forEach(f => {
  //       const curPath = path.join(_dir, f);
  //       const isDir = fs.statSync(curPath).isDirectory();
  //       if (f !== 'node_modules' && isDir) {
  //         _clearBuildDist(curPath);
  //       }
  //     });
  //   }
  // };
  // _clearBuildDist(dir);
}

export async function getPort() {
  return portfinder.getPortPromise({ port: 8080 });
}

export function sleep(t: number) {
  return new Promise(resolve => setTimeout(resolve, t));
}
