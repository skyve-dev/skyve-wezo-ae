import dotenv from 'dotenv';

// Ensure dotenv is loaded before accessing environment variables
dotenv.config();

// Singleton JWT configuration to prevent multiple instances
class JWTConfig {
  private static instance: JWTConfig;
  private static initialized: boolean = false;
  
  public readonly secret: string;
  public readonly expiresIn: string;
  public readonly passwordResetExpiresIn: string;

  private constructor() {
    this.secret = process.env.JWT_SECRET || 'default-secret-change-this';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.passwordResetExpiresIn = process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN || '1h';
    
    // Debug logging - remove in production
    if (!JWTConfig.initialized) {
      console.log('🔐 JWT Config initialized (singleton):');
      console.log('  - Secret loaded:', this.secret ? 'YES' : 'NO');
      console.log('  - Secret hash:', this.secret ? this.secret.substring(0, 10) + '...' : 'NONE');
      console.log('  - Expires in:', this.expiresIn);
      JWTConfig.initialized = true;
    }

    // Validate required configuration
    if (!this.secret || this.secret === 'default-secret-change-this') {
      console.warn('⚠️  WARNING: Using default JWT secret! Set JWT_SECRET environment variable in production.');
    }
  }

  public static getInstance(): JWTConfig {
    if (!JWTConfig.instance) {
      JWTConfig.instance = new JWTConfig();
    }
    return JWTConfig.instance;
  }
}

// Export singleton instance
const JWT_CONFIG = JWTConfig.getInstance();
export default JWT_CONFIG;