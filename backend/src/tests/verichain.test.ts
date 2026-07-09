import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { ItemInstance } from '../models/ItemInstance';
import { Complaint } from '../models/Complaint';
import { Invitation } from '../models/Invitation';

describe('VeriChain Backend Integration Tests', () => {
  // Test globals
  let buyerToken: string;
  let buyerId: string;
  let factoryToken: string;
  let factoryId: string;
  let adminToken: string;
  let adminId: string;
  let testProduct: any;
  let testItem: any;
  let testComplaint: any;

  beforeAll(async () => {
    // Ensure we are connected to Mongoose
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/verichain_test';
      await mongoose.connect(mongoUri);
    }

    // Clean test data space
    await User.deleteMany({ email: /test-.*@verichain\.io/ });
    await Product.deleteMany({ sku: /TEST-SKU-.*/ });
    await Invitation.deleteMany({ email: /test-.*@verichain\.io/ });

    // Seed a bootstrap admin
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('password123', salt);
    
    const admin = await User.create({
      name: 'Test Admin',
      email: 'test-admin@verichain.io',
      role: 'admin',
      passwordHash: adminHash,
      verified: true,
    });
    adminId = admin._id.toString();

    // Log in admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test-admin@verichain.io', password: 'password123' });
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    // Clean up collections and close connection
    await User.deleteMany({ email: /test-.*@verichain\.io/ });
    await Product.deleteMany({ sku: /TEST-SKU-.*/ });
    await Invitation.deleteMany({ email: /test-.*@verichain\.io/ });
    if (testProduct) {
      await ItemInstance.deleteMany({ product: testProduct._id });
      await Product.deleteOne({ _id: testProduct._id });
    }
    if (testComplaint) {
      await Complaint.deleteOne({ _id: testComplaint._id });
    }
    await mongoose.connection.close();
  });

  describe('1. Authentication Tests', () => {
    it('should successfully register a new Buyer', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test Buyer',
          email: 'test-buyer@verichain.io',
          password: 'password123',
          role: 'buyer',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('buyer');
      expect(res.body.user.verified).toBe(true); // Buyers are auto-verified
      
      buyerToken = res.body.token;
      buyerId = res.body.user.id;
    });

    it('should successfully register a new Factory (requires admin verification)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test Factory Corp',
          email: 'test-factory@verichain.io',
          password: 'password123',
          role: 'factory',
          factoryLocation: 'Gwangju, South Korea',
          factoryCapacity: '50000 units/mo',
          factoryCertificateNo: 'ISO-9001-KOR-TEST',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('factory');
      expect(res.body.user.verified).toBe(false); // Factories need verification
      
      factoryToken = res.body.token;
      factoryId = res.body.user.id;
    });

    it('should fail registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Duplicate Buyer',
          email: 'test-buyer@verichain.io',
          password: 'password123',
          role: 'buyer',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should allow authenticating with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-buyer@verichain.io',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should deny authentication with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-buyer@verichain.io',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Admin Verification & Invitation Flow Tests', () => {
    it('should approve the pending Factory registration', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${factoryId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ verified: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.verified).toBe(true);
    });

    it('should send a pending invitation to a new Moderator', async () => {
      const res = await request(app)
        .post('/api/admin/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test-mod@verichain.io',
          name: 'Test Moderator',
          role: 'moderator',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.invitation.status).toBe('pending');
      expect(res.body.invitation.token).toBeDefined();
    });

    it('should accept the invitation, set password and activate account', async () => {
      const invitesRes = await request(app)
        .get('/api/admin/invitations')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const invite = invitesRes.body.invitations[0];
      expect(invite).toBeDefined();

      const activateRes = await request(app)
        .post('/api/auth/accept-invite')
        .send({
          token: invite.token,
          password: 'moderatorpwd123',
        });

      expect(activateRes.status).toBe(200);
      expect(activateRes.body.success).toBe(true);
      expect(activateRes.body.token).toBeDefined();
      expect(activateRes.body.user.role).toBe('moderator');
      expect(activateRes.body.user.verified).toBe(true);
    });
  });

  describe('3. Product & Batch Creation Tests', () => {
    it('should register a new product template under the verified Factory', async () => {
      const res = await request(app)
        .post('/api/products/register')
        .set('Authorization', `Bearer ${factoryToken}`)
        .send({
          name: 'Test Smart Watch',
          description: 'A high-fidelity smartwatch.',
          category: 'Wearables',
          sku: 'TEST-SKU-WATCH-001',
          imageUrl: 'https://verichain.io/watch.jpg',
          certificateUrl: 'https://ipfs.io/ipfs/QmWatchCertificate',
          specs: { battery: '400mAh', screen: 'OLED' },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.product.verifiedStatus).toBe('pending');
      
      testProduct = res.body.product;
    });

    it('should allow admin to verify the product template', async () => {
      const res = await request(app)
        .patch(`/api/admin/products/${testProduct._id}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ verifiedStatus: 'verified' });

      expect(res.status).toBe(200);
      expect(res.body.product.verifiedStatus).toBe('verified');
    });

    it('should generate a batch of items under the product template', async () => {
      const res = await request(app)
        .post(`/api/products/${testProduct._id}/batch`)
        .set('Authorization', `Bearer ${factoryToken}`)
        .send({
          count: 3,
          prefix: 'TST',
          startingSerial: 200001,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.itemsCount).toBe(3);
    });

    it('should fail to generate batch if duplicate serials are detected (pre-insert check)', async () => {
      const res = await request(app)
        .post(`/api/products/${testProduct._id}/batch`)
        .set('Authorization', `Bearer ${factoryToken}`)
        .send({
          count: 3,
          prefix: 'TST',
          startingSerial: 200001,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Duplicate serial number(s) detected');
    });
  });

  describe('4. Marketplace Listing & Transfer Tests', () => {
    it('should list generated items on the marketplace', async () => {
      // Find the items we just generated
      const items = await ItemInstance.find({ product: testProduct._id });
      expect(items.length).toBe(3);
      testItem = items[0];

      // Update status to listed
      const res = await request(app)
        .patch(`/api/items/${testItem._id}/status`)
        .set('Authorization', `Bearer ${factoryToken}`)
        .send({
          status: 'listed',
          location: 'In-Factory Storefront',
        });

      expect(res.status).toBe(200);
      expect(res.body.item.status).toBe('listed');
    });

    it('should reject status update from an unauthorized factory (non-owner/non-responsible)', async () => {
      // Register a second factory
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test Factory 2',
          email: 'test-factory2@verichain.io',
          password: 'password123',
          role: 'factory',
          factoryLocation: 'Seoul, South Korea',
          factoryCapacity: '10000 units/mo',
          factoryCertificateNo: 'ISO-9001-KOR-TEST2',
        });
      expect(signupRes.status).toBe(201);
      const factory2Id = signupRes.body.user.id;
      const factory2Token = signupRes.body.token;

      // Admin verifies the second factory
      const verifyRes = await request(app)
        .patch(`/api/admin/users/${factory2Id}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ verified: true });
      expect(verifyRes.status).toBe(200);

      // Try to update status of testItem using factory2Token
      const updateRes = await request(app)
        .patch(`/api/items/${testItem._id}/status`)
        .set('Authorization', `Bearer ${factory2Token}`)
        .send({
          status: 'in_transit',
          location: 'Intermediary Hub',
        });

      expect(updateRes.status).toBe(403);
      expect(updateRes.body.success).toBe(false);
      expect(updateRes.body.message).toContain('Access denied');
    });

    it('should reject status update from an admin who is not the owner/responsible', async () => {
      const res = await request(app)
        .patch(`/api/items/${testItem._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'recalled',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });

    it('should allow a buyer to purchase the listed item', async () => {
      const res = await request(app)
        .post(`/api/items/${testItem._id}/buy`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.item.status).toBe('sold');
      expect(res.body.item.currentOwner.toString()).toBe(buyerId);
    });
  });

  describe('5. Complaint & Disputes Tests (Auto-Lookup)', () => {
    it('should file a dispute against the factory using auto-lookup of seller', async () => {
      const res = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          productInstanceId: testItem._id.toString(),
          reason: 'Counterfeit Suspicion',
          description: 'The serial matches but the battery specifications do not line up.',
          evidenceUrl: 'https://ipfs.io/ipfs/QmComplaintEvidenceReport',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.complaint.buyer.toString()).toBe(buyerId);
      expect(res.body.complaint.seller.toString()).toBe(factoryId); // Automatically traced back to factory!
      expect(res.body.complaint.transactionHash).toBeDefined(); // Saved acquisition tx hash!

      testComplaint = res.body.complaint;
    });

    it('should fetch the list of complaints for logged-in user', async () => {
      const res = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.complaints.length).toBeGreaterThan(0);
    });
  });

  describe('6. Rate Limiting Tests', () => {
    it('should rate limit auth requests after 20 attempts', async () => {
      // Make 20 auth requests (should return normal validation/auth errors, not 429)
      for (let i = 0; i < 20; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ email: 'rate-limit-test@verichain.io', password: 'wrong' });
      }

      // The 21st request should be rate-limited and return 429
      const limitRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'rate-limit-test@verichain.io', password: 'wrong' });

      expect(limitRes.status).toBe(429);
      expect(limitRes.body.success).toBe(false);
      expect(limitRes.body.message).toContain('Too many login or signup attempts');
    });
  });

  describe('7. Security Headers & CORS Tests', () => {
    it('should set secure HTTP headers (Helmet)', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
    });

    it('should restrict CORS in production if origin not allowed', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalOrigins = process.env.ALLOWED_ORIGINS;
      
      try {
        process.env.NODE_ENV = 'production';
        process.env.ALLOWED_ORIGINS = 'https://verichain.io,https://app.verichain.io';
        
        // Allowed origin
        const resAllowed = await request(app)
          .get('/api/health')
          .set('Origin', 'https://verichain.io');
        
        expect(resAllowed.headers['access-control-allow-origin']).toBe('https://verichain.io');

        // Disallowed origin should return CORS error (handled by custom callback throwing error)
        const resDisallowed = await request(app)
          .get('/api/health')
          .set('Origin', 'https://malicious-site.com');

        expect(resDisallowed.status).toBe(500);
        expect(resDisallowed.body.message).toContain('Not allowed by CORS');
      } finally {
        process.env.NODE_ENV = originalEnv;
        process.env.ALLOWED_ORIGINS = originalOrigins;
      }
    });
  });
});
