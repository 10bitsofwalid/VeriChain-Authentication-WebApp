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
});
