const { networkInterfaces } = require('os');

function getNetworkIP() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push({
          interface: name,
          ip: net.address
        });
      }
    }
  }

  return results;
}

console.log('🌐 Network Information:');
console.log('='.repeat(50));

const networkIPs = getNetworkIP();
if (networkIPs.length > 0) {
  networkIPs.forEach(({ interface, ip }) => {
    console.log(`📡 ${interface}: http://${ip}:3000`);
  });
  console.log('='.repeat(50));
  console.log('ℹ️  Use any of these URLs to access the server from other devices on your network');
  console.log('ℹ️  Update your client .env file with: VITE_API_BASE_URL=http://[IP]:3000');
} else {
  console.log('❌ No network interfaces found');
}