import app from './app';
import prisma from './config/database';
import { networkInterfaces } from 'os';
import { bookingCleanupService } from './services/booking-cleanup.service';

const PORT = parseInt(process.env.PORT || '3000', 10);

function getNetworkIP(): string | null {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    const networkIP = getNetworkIP();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      if (networkIP) {
        console.log(`🌐 API exposed at http://${networkIP}:${PORT}/api (accessible from network)`);
      }
      console.log(`🏥 Health check at http://${networkIP}:${PORT}/api/health`);
      
      // Start the booking cleanup service
      const cleanupInterval = parseInt(process.env.BOOKING_CLEANUP_INTERVAL || '60000', 10);
      bookingCleanupService.start(cleanupInterval);
      console.log(`🧹 Booking cleanup service started (interval: ${cleanupInterval / 1000}s)`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  bookingCleanupService.stop();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  bookingCleanupService.stop();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();