// @ts-ignore
import request from 'supertest';
import app from '../app';
// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from 'path';
import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';

describe('Static File Serving', () => {
  const testImagePath = path.join(process.cwd(), 'uploads', 'photos', 'test-static.txt');
  
  beforeAll(() => {
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'uploads', 'photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Create a test file
    fs.writeFileSync(testImagePath, 'This is a test file for static serving');
  });

  afterAll(() => {
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  it('should serve static files from /uploads/photos/ without authentication', async () => {
    const response = await request(app)
      .get('/uploads/photos/test-static.txt')
      .expect(200);

    expect(response.text).toBe('This is a test file for static serving');
  });

  it('should return 404 for non-existent files', async () => {
    await request(app)
      .get('/uploads/photos/non-existent-file.jpg')
      .expect(404);
  });

  it('should set appropriate CORS headers for static files', async () => {
    const response = await request(app)
      .get('/uploads/photos/test-static.txt')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe('*');
    expect(response.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });

  it('should serve files without requiring authentication headers', async () => {
    // Test that we can access files without any auth headers
    await request(app)
      .get('/uploads/photos/test-static.txt')
      .expect(200);
  });

  it('should set cache headers for better performance', async () => {
    const response = await request(app)
      .get('/uploads/photos/test-static.txt')
      .expect(200);

    expect(response.headers['cache-control']).toContain('max-age');
    expect(response.headers['etag']).toBeDefined();
  });
});