#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const os = require('os');

// Configuration
const SERVER_PORT = 3000;
const CLIENT_PORT = 3001;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logWithPrefix(prefix, message, color = 'reset') {
  console.log(`${colors[color]}[${prefix}]${colors.reset} ${message}`);
}

// Check if port is in use and kill the process
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const isWindows = os.platform() === 'win32';
    
    if (isWindows) {
      // Windows command to find and kill process on port
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (error || !stdout.trim()) {
          log(`Port ${port} is available`, 'green');
          resolve();
          return;
        }

        // Extract PID from netstat output
        const lines = stdout.trim().split('\n');
        const pids = new Set();
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0') {
              pids.add(pid);
            }
          }
        });

        if (pids.size === 0) {
          log(`Port ${port} is available`, 'green');
          resolve();
          return;
        }

        log(`Found ${pids.size} process(es) using port ${port}`, 'yellow');
        
        // Kill each process
        const killPromises = Array.from(pids).map(pid => {
          return new Promise((resolvePid) => {
            exec(`taskkill /PID ${pid} /F`, (killError) => {
              if (killError) {
                log(`Failed to kill process ${pid}: ${killError.message}`, 'red');
              } else {
                log(`Killed process ${pid}`, 'green');
              }
              resolvePid();
            });
          });
        });

        Promise.all(killPromises).then(() => {
          // Wait a moment for ports to be released
          setTimeout(resolve, 1000);
        });
      });
    } else {
      // Unix/Linux/Mac command
      exec(`lsof -ti:${port}`, (error, stdout) => {
        if (error || !stdout.trim()) {
          log(`Port ${port} is available`, 'green');
          resolve();
          return;
        }

        const pids = stdout.trim().split('\n').filter(pid => pid);
        log(`Found ${pids.length} process(es) using port ${port}`, 'yellow');
        
        // Kill each process
        const killCommand = `kill -9 ${pids.join(' ')}`;
        exec(killCommand, (killError) => {
          if (killError) {
            log(`Failed to kill processes: ${killError.message}`, 'red');
          } else {
            log(`Killed ${pids.length} process(es)`, 'green');
          }
          // Wait a moment for ports to be released
          setTimeout(resolve, 1000);
        });
      });
    }
  });
}

// Start a service (non-blocking)
function startService(name, command, args, cwd, color) {
  logWithPrefix(name, `Starting ${name}...`, color);
  
  const child = spawn(command, args, {
    cwd,
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  let hasStarted = false;

  // Handle stdout
  child.stdout.on('data', (data) => {
    const output = data.toString();
    
    // Check for startup indicators (only log once)
    if (!hasStarted) {
      if (
        (name === 'SERVER' && (
          output.includes('Server running on') || 
          output.includes('listening') ||
          output.includes('started')
        )) ||
        (name === 'CLIENT' && (
          output.includes('Local:') || 
          output.includes('ready in') ||
          output.includes('dev server running')
        ))
      ) {
        hasStarted = true;
        logWithPrefix(name, `✅ Ready!`, 'green');
      }
    }
    
    // Log output with prefix (filter out empty lines)
    output.split('\n').forEach(line => {
      if (line.trim()) {
        logWithPrefix(name, line.trim(), color);
      }
    });
  });

  // Handle stderr
  child.stderr.on('data', (data) => {
    const output = data.toString();
    output.split('\n').forEach(line => {
      if (line.trim()) {
        logWithPrefix(name, line.trim(), 'red');
      }
    });
  });

  // Handle process exit
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      logWithPrefix(name, `❌ Exited with code ${code}`, 'red');
    } else {
      logWithPrefix(name, `Stopped`, 'yellow');
    }
  });

  // Handle errors
  child.on('error', (error) => {
    logWithPrefix(name, `❌ Error: ${error.message}`, 'red');
  });

  return child;
}

// Main function
async function main() {
  log('🚀 Starting Wezo Development Environment', 'cyan');
  log('==========================================', 'cyan');

  const processes = [];

  try {
    // Kill processes on ports first
    log('\n📡 Checking and clearing ports...', 'blue');
    await Promise.all([
      killProcessOnPort(SERVER_PORT),
      killProcessOnPort(CLIENT_PORT)
    ]);

    log('\n🔧 Starting services in parallel...', 'blue');

    // Start both services in parallel
    const serverProcess = startService(
      'SERVER',
      'npm',
      ['run', 'dev:server'],
      process.cwd(),
      'magenta'
    );
    processes.push({ name: 'SERVER', process: serverProcess });

    const clientProcess = startService(
      'CLIENT',
      'npm',
      ['run', 'dev:client'],
      process.cwd(),
      'cyan'
    );
    processes.push({ name: 'CLIENT', process: clientProcess });

    // Give services a moment to start
    setTimeout(() => {
      log('\n✅ Development environment is starting!', 'green');
      log('==========================================', 'green');
      log('💡 Services are starting in parallel...', 'yellow');
      log('🛑 Press Ctrl+C to stop all services', 'yellow');
    }, 2000);

  } catch (error) {
    log(`\n❌ Failed to start development environment: ${error.message}`, 'red');
    
    // Kill any started processes
    processes.forEach(({ name, process }) => {
      logWithPrefix(name, 'Stopping...', 'yellow');
      process.kill();
    });
    
    process.exit(1);
  }

  // Handle graceful shutdown
  const shutdown = (signal) => {
    log(`\n\n🛑 Received ${signal}, shutting down...`, 'yellow');
    
    processes.forEach(({ name, process }) => {
      if (!process.killed) {
        logWithPrefix(name, 'Stopping...', 'yellow');
        
        // Try graceful shutdown first
        if (os.platform() === 'win32') {
          spawn('taskkill', ['/pid', process.pid, '/f', '/t'], { stdio: 'ignore' });
        } else {
          process.kill('SIGTERM');
        }
      }
    });

    setTimeout(() => {
      // Force kill if still running
      processes.forEach(({ process }) => {
        if (!process.killed) {
          process.kill('SIGKILL');
        }
      });
      
      log('👋 Development environment stopped', 'cyan');
      process.exit(0);
    }, 3000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle Windows Ctrl+C
  if (os.platform() === 'win32') {
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('SIGINT', () => shutdown('SIGINT'));
  }

  // Keep the process alive
  process.stdin.resume();
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    log(`💥 Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  });
}