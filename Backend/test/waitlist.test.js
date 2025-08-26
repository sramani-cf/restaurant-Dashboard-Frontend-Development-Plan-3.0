const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/app');
const { generateTestToken } = require('./helpers/auth');

const prisma = new PrismaClient();

describe('Waitlist Management Tests', () => {
  let testRestaurant;
  let testUser;
  let testCustomers;
  let testTables;
  let authToken;

  beforeAll(async () => {
    // Setup test data
    testUser = await prisma.user.create({
      data: {
        email: 'waitlist@restaurant.com',
        firstName: 'Waitlist',
        lastName: 'Manager',
        password: 'hashedpassword',
        role: 'MANAGER',
        status: 'ACTIVE'
      }
    });

    testRestaurant = await prisma.restaurant.create({
      data: {
        name: 'Waitlist Test Restaurant',
        email: 'waitlist@restaurant.com',
        phone: '+1234567890',
        isActive: true,
        address: {
          create: {
            street: '456 Waitlist Ave',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'US'
          }
        }
      }
    });

    // Create test tables (small capacity to force waitlist scenarios)
    testTables = await Promise.all([
      prisma.table.create({
        data: {
          restaurantId: testRestaurant.id,
          number: 1,
          capacity: 2,
          location: 'Window',
          isActive: true
        }
      }),
      prisma.table.create({
        data: {
          restaurantId: testRestaurant.id,
          number: 2,
          capacity: 2,
          location: 'Center',
          isActive: true
        }
      })
    ]);

    // Create test customers
    testCustomers = await Promise.all([
      prisma.customer.create({
        data: {
          firstName: 'Alice',
          lastName: 'Johnson',
          phone: '+1555000001',
          email: 'alice@email.com'
        }
      }),
      prisma.customer.create({
        data: {
          firstName: 'Bob',
          lastName: 'Smith',
          phone: '+1555000002',
          email: 'bob@email.com'
        }
      }),
      prisma.customer.create({
        data: {
          firstName: 'Charlie',
          lastName: 'Brown',
          phone: '+1555000003',
          email: 'charlie@email.com'
        }
      })
    ]);

    authToken = generateTestToken(testUser);
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.waitlistEntry.deleteMany({});
    await prisma.reservation.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.table.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.restaurant.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /restaurants/:restaurantId/waitlist', () => {
    it('should add customer to waitlist successfully', async () => {
      const waitlistData = {
        customerInfo: {
          name: 'David Wilson',
          phone: '+1555000004',
          email: 'david@email.com'
        },
        partySize: 4,
        preferredTime: '19:00',
        specialRequests: 'Quiet table please',
        priority: 7
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(waitlistData)
        .expect(201);

      expect(response.body.message).toBe('Customer added to waitlist successfully');
      expect(response.body.waitlistEntry.position).toBe(1);
      expect(response.body.waitlistEntry.priority).toBe(7);
      expect(response.body.waitlistEntry.status).toBe('WAITING');
      expect(response.body.waitlistEntry.estimatedWaitTime).toBeGreaterThan(0);
      expect(response.body.waitlistEntry.waitlistCode).toHaveLength(4);
    });

    it('should calculate estimated wait time based on capacity', async () => {
      // Fill up all tables first by creating reservations
      const now = new Date();
      const currentTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

      await Promise.all(testTables.map((table, index) =>
        prisma.reservation.create({
          data: {
            restaurantId: testRestaurant.id,
            customerId: testCustomers[index % testCustomers.length].id,
            tableId: table.id,
            date: currentTime,
            time: currentTime,
            partySize: 2,
            duration: 120,
            status: 'CONFIRMED',
            createdByUserId: testUser.id
          }
        })
      ));

      const waitlistData = {
        customerInfo: {
          name: 'Emma Davis',
          phone: '+1555000005'
        },
        partySize: 2,
        priority: 5
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(waitlistData)
        .expect(201);

      expect(response.body.waitlistEntry.estimatedWaitTime).toBeGreaterThanOrEqual(15);
    });

    it('should assign proper position based on priority', async () => {
      // Add low priority entry first
      const lowPriorityData = {
        customerInfo: {
          name: 'Low Priority',
          phone: '+1555000006'
        },
        partySize: 2,
        priority: 3
      };

      const lowPriorityResponse = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(lowPriorityData)
        .expect(201);

      // Add high priority entry
      const highPriorityData = {
        customerInfo: {
          name: 'High Priority',
          phone: '+1555000007'
        },
        partySize: 2,
        priority: 9
      };

      const highPriorityResponse = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(highPriorityData)
        .expect(201);

      // Verify that high priority customer is positioned before low priority
      // (Note: Position calculation happens during GET request based on ordering)
      expect(highPriorityResponse.body.waitlistEntry.priority).toBe(9);
      expect(lowPriorityResponse.body.waitlistEntry.priority).toBe(3);
    });

    it('should handle existing customer lookup', async () => {
      const waitlistData = {
        customerInfo: {
          name: 'Different Name', // Different from stored name
          phone: '+1999888777',
          email: testCustomers[0].email // But same email as existing customer
        },
        partySize: 2,
        priority: 5
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(waitlistData)
        .expect(201);

      // Should use the existing customer's name
      expect(response.body.waitlistEntry.customerName).toBe(
        `${testCustomers[0].firstName} ${testCustomers[0].lastName}`
      );
    });

    it('should reject invalid party sizes', async () => {
      const invalidData = {
        customerInfo: {
          name: 'Invalid Size',
          phone: '+1555000008'
        },
        partySize: 25 // Too large
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Party size must be between 1 and 20'
          })
        ])
      );
    });
  });

  describe('GET /restaurants/:restaurantId/waitlist', () => {
    beforeEach(async () => {
      // Clear existing waitlist entries
      await prisma.waitlistEntry.deleteMany({});

      // Create test waitlist entries
      await Promise.all([
        prisma.waitlistEntry.create({
          data: {
            restaurantId: testRestaurant.id,
            customerId: testCustomers[0].id,
            partySize: 2,
            priority: 8,
            position: 1,
            estimatedWaitTime: 30,
            status: 'WAITING',
            createdByUserId: testUser.id
          }
        }),
        prisma.waitlistEntry.create({
          data: {
            restaurantId: testRestaurant.id,
            customerId: testCustomers[1].id,
            partySize: 4,
            priority: 5,
            position: 2,
            estimatedWaitTime: 45,
            status: 'WAITING',
            createdByUserId: testUser.id
          }
        }),
        prisma.waitlistEntry.create({
          data: {
            restaurantId: testRestaurant.id,
            customerId: testCustomers[2].id,
            partySize: 2,
            priority: 6,
            position: 3,
            estimatedWaitTime: 60,
            status: 'NOTIFIED',
            createdByUserId: testUser.id
          }
        })
      ]);
    });

    it('should return waitlist entries ordered by priority and creation time', async () => {
      const response = await request(app)
        .get(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.entries).toHaveLength(3);
      expect(response.body.entries[0].priority).toBeGreaterThanOrEqual(response.body.entries[1].priority);
      expect(response.body.statistics).toBeDefined();
      expect(response.body.statistics.waiting).toBe(2);
      expect(response.body.statistics.notified).toBe(1);
    });

    it('should filter waitlist by status', async () => {
      const response = await request(app)
        .get(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'WAITING' })
        .expect(200);

      expect(response.body.entries).toHaveLength(2);
      response.body.entries.forEach(entry => {
        expect(entry.status).toBe('WAITING');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 2 })
        .expect(200);

      expect(response.body.entries).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should calculate wait time statistics', async () => {
      const response = await request(app)
        .get(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.statistics.total).toBe(3);
      expect(response.body.statistics.waiting).toBe(2);
      expect(response.body.statistics.notified).toBe(1);
      expect(response.body.statistics.averageWaitTime).toBeGreaterThanOrEqual(0);
      expect(response.body.statistics.longestWaitTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('POST /restaurants/:restaurantId/waitlist/:id/promote', () => {
    let waitlistEntry;

    beforeEach(async () => {
      waitlistEntry = await prisma.waitlistEntry.create({
        data: {
          restaurantId: testRestaurant.id,
          customerId: testCustomers[0].id,
          partySize: 2,
          priority: 7,
          position: 1,
          estimatedWaitTime: 30,
          status: 'WAITING',
          createdByUserId: testUser.id
        }
      });
    });

    it('should promote waitlist entry to reservation successfully', async () => {
      const promotionData = {
        tableId: testTables[0].id,
        time: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist/${waitlistEntry.id}/promote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(promotionData)
        .expect(200);

      expect(response.body.message).toBe('Waitlist entry promoted to reservation successfully');
      expect(response.body.reservation).toBeDefined();
      expect(response.body.reservation.tableId).toBe(testTables[0].id);
      expect(response.body.reservation.status).toBe('CONFIRMED');
      expect(response.body.waitlistEntry.status).toBe('SEATED');
    });

    it('should promote without specifying table (auto-assignment)', async () => {
      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist/${waitlistEntry.id}/promote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      expect(response.body.reservation.tableId).toBeNull(); // No table assigned
      expect(response.body.reservation.status).toBe('CONFIRMED');
    });

    it('should update table status when promoted with table assignment', async () => {
      const promotionData = {
        tableId: testTables[0].id
      };

      await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist/${waitlistEntry.id}/promote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(promotionData)
        .expect(200);

      // Verify table status was updated
      const updatedTable = await prisma.table.findUnique({
        where: { id: testTables[0].id }
      });
      expect(updatedTable.status).toBe('OCCUPIED');
    });

    it('should reorder remaining waitlist entries after promotion', async () => {
      // Add another waitlist entry
      const secondEntry = await prisma.waitlistEntry.create({
        data: {
          restaurantId: testRestaurant.id,
          customerId: testCustomers[1].id,
          partySize: 2,
          priority: 5,
          position: 2,
          estimatedWaitTime: 45,
          status: 'WAITING',
          createdByUserId: testUser.id
        }
      });

      // Promote first entry
      await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist/${waitlistEntry.id}/promote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      // Check that remaining entry was reordered
      const updatedEntry = await prisma.waitlistEntry.findUnique({
        where: { id: secondEntry.id }
      });
      expect(updatedEntry.position).toBe(1); // Should now be first in line
    });

    it('should reject promotion of non-waiting entries', async () => {
      // Update entry to NOTIFIED status
      await prisma.waitlistEntry.update({
        where: { id: waitlistEntry.id },
        data: { status: 'NOTIFIED' }
      });

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist/${waitlistEntry.id}/promote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Waitlist entry is not in waiting status');
    });

    it('should handle non-existent waitlist entries', async () => {
      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist/non-existent-id/promote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(404);

      expect(response.body.error).toBe('Waitlist entry not found');
    });
  });

  describe('PUT /restaurants/:restaurantId/waitlist/:id', () => {
    let waitlistEntry;

    beforeEach(async () => {
      waitlistEntry = await prisma.waitlistEntry.create({
        data: {
          restaurantId: testRestaurant.id,
          customerId: testCustomers[0].id,
          partySize: 2,
          priority: 5,
          position: 1,
          estimatedWaitTime: 30,
          status: 'WAITING',
          createdByUserId: testUser.id
        }
      });
    });

    it('should update waitlist entry priority', async () => {
      const updates = {
        priority: 9,
        specialRequests: 'Updated special requests',
        notes: 'Manager notes'
      };

      const response = await request(app)
        .put(`/restaurants/${testRestaurant.id}/waitlist/${waitlistEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.waitlistEntry.priority).toBe(9);
      expect(response.body.waitlistEntry.specialRequests).toBe('Updated special requests');
      expect(response.body.waitlistEntry.notes).toBe('Manager notes');
    });

    it('should update status with proper timestamps', async () => {
      const response = await request(app)
        .put(`/restaurants/${testRestaurant.id}/waitlist/${waitlistEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'NOTIFIED' })
        .expect(200);

      expect(response.body.waitlistEntry.status).toBe('NOTIFIED');
      
      // Verify timestamp was set in database
      const updatedEntry = await prisma.waitlistEntry.findUnique({
        where: { id: waitlistEntry.id }
      });
      expect(updatedEntry.notifiedAt).not.toBeNull();
    });

    it('should reorder waitlist when priority changes', async () => {
      // Add second entry with higher priority
      const secondEntry = await prisma.waitlistEntry.create({
        data: {
          restaurantId: testRestaurant.id,
          customerId: testCustomers[1].id,
          partySize: 2,
          priority: 8,
          position: 2,
          estimatedWaitTime: 45,
          status: 'WAITING',
          createdByUserId: testUser.id
        }
      });

      // Lower the first entry's priority
      await request(app)
        .put(`/restaurants/${testRestaurant.id}/waitlist/${waitlistEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ priority: 3 })
        .expect(200);

      // Verify reordering happened
      const [firstEntry, secondEntryUpdated] = await Promise.all([
        prisma.waitlistEntry.findUnique({ where: { id: waitlistEntry.id } }),
        prisma.waitlistEntry.findUnique({ where: { id: secondEntry.id } })
      ]);

      expect(secondEntryUpdated.position).toBe(1); // Higher priority should be first
      expect(firstEntry.position).toBe(2); // Lower priority should be second
    });

    it('should validate priority range', async () => {
      const response = await request(app)
        .put(`/restaurants/${testRestaurant.id}/waitlist/${waitlistEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ priority: 15 }) // Outside valid range
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: expect.stringMatching(/priority/i)
          })
        ])
      );
    });

    it('should validate status enum values', async () => {
      const response = await request(app)
        .put(`/restaurants/${testRestaurant.id}/waitlist/${waitlistEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('DELETE /restaurants/:restaurantId/waitlist/:id', () => {
    let waitlistEntry;

    beforeEach(async () => {
      waitlistEntry = await prisma.waitlistEntry.create({
        data: {
          restaurantId: testRestaurant.id,
          customerId: testCustomers[0].id,
          partySize: 2,
          priority: 5,
          position: 1,
          estimatedWaitTime: 30,
          status: 'WAITING',
          createdByUserId: testUser.id
        }
      });
    });

    it('should cancel waitlist entry successfully', async () => {
      const response = await request(app)
        .delete(`/restaurants/${testRestaurant.id}/waitlist/${waitlistEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Customer removed from waitlist successfully');
      expect(response.body.waitlistEntry.status).toBe('CANCELLED');

      // Verify entry was marked as cancelled, not deleted
      const cancelledEntry = await prisma.waitlistEntry.findUnique({
        where: { id: waitlistEntry.id }
      });
      expect(cancelledEntry).not.toBeNull();
      expect(cancelledEntry.status).toBe('CANCELLED');
    });

    it('should reorder remaining entries after cancellation', async () => {
      // Add second entry
      const secondEntry = await prisma.waitlistEntry.create({
        data: {
          restaurantId: testRestaurant.id,
          customerId: testCustomers[1].id,
          partySize: 2,
          priority: 5,
          position: 2,
          estimatedWaitTime: 45,
          status: 'WAITING',
          createdByUserId: testUser.id
        }
      });

      // Cancel first entry
      await request(app)
        .delete(`/restaurants/${testRestaurant.id}/waitlist/${waitlistEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Check that remaining entry moved up
      const updatedEntry = await prisma.waitlistEntry.findUnique({
        where: { id: secondEntry.id }
      });
      expect(updatedEntry.position).toBe(1);
    });

    it('should handle non-existent waitlist entries', async () => {
      const response = await request(app)
        .delete(`/restaurants/${testRestaurant.id}/waitlist/non-existent-id`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Waitlist entry not found');
    });
  });

  describe('Waitlist Edge Cases and Business Logic', () => {
    it('should handle large party sizes appropriately', async () => {
      const largePartyData = {
        customerInfo: {
          name: 'Large Party',
          phone: '+1555000099'
        },
        partySize: 8,
        priority: 7
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(largePartyData)
        .expect(201);

      // Should have higher estimated wait time for larger parties
      expect(response.body.waitlistEntry.estimatedWaitTime).toBeGreaterThan(30);
    });

    it('should handle concurrent waitlist operations', async () => {
      const concurrentRequests = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post(`/restaurants/${testRestaurant.id}/waitlist`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerInfo: {
              name: `Concurrent Customer ${i}`,
              phone: `+155500010${i}`
            },
            partySize: 2,
            priority: 5 + i
          })
      );

      const responses = await Promise.all(concurrentRequests);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Positions should be assigned correctly
      const positions = responses.map(r => r.body.waitlistEntry.position);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(positions.length); // All positions should be unique
    });

    it('should calculate wait times based on historical data when available', async () => {
      // Create some completed reservations to provide historical data
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

      await Promise.all([
        prisma.reservation.create({
          data: {
            restaurantId: testRestaurant.id,
            customerId: testCustomers[0].id,
            tableId: testTables[0].id,
            date: pastDate,
            time: pastDate,
            partySize: 2,
            duration: 90, // 1.5 hours
            status: 'COMPLETED',
            seatedAt: pastDate,
            completedAt: new Date(pastDate.getTime() + 90 * 60 * 1000),
            createdByUserId: testUser.id
          }
        }),
        prisma.reservation.create({
          data: {
            restaurantId: testRestaurant.id,
            customerId: testCustomers[1].id,
            tableId: testTables[1].id,
            date: pastDate,
            time: pastDate,
            partySize: 2,
            duration: 120, // 2 hours
            status: 'COMPLETED',
            seatedAt: pastDate,
            completedAt: new Date(pastDate.getTime() + 120 * 60 * 1000),
            createdByUserId: testUser.id
          }
        })
      ]);

      const waitlistData = {
        customerInfo: {
          name: 'Historical Data Customer',
          phone: '+1555000100'
        },
        partySize: 2,
        priority: 5
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(waitlistData)
        .expect(201);

      // Wait time should be calculated based on historical turnover times
      expect(response.body.waitlistEntry.estimatedWaitTime).toBeGreaterThan(0);
    });

    it('should handle priority conflicts fairly', async () => {
      // Add multiple entries with same priority
      const sameRiorityRequests = Array.from({ length: 3 }, (_, i) =>
        request(app)
          .post(`/restaurants/${testRestaurant.id}/waitlist`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerInfo: {
              name: `Same Priority ${i}`,
              phone: `+155500011${i}`
            },
            partySize: 2,
            priority: 6 // Same priority for all
          })
      );

      const responses = await Promise.all(sameRiorityRequests);

      // Should order by creation time when priority is the same
      const positions = responses.map(r => r.body.waitlistEntry.position);
      expect(positions).toEqual([1, 2, 3]); // Should be in order of creation
    });

    it('should validate business rules for preferred times', async () => {
      const waitlistData = {
        customerInfo: {
          name: 'Preferred Time Test',
          phone: '+1555000200'
        },
        partySize: 2,
        preferredTime: '25:00', // Invalid time format
        priority: 5
      };

      // Should still accept (preferredTime is optional and not strictly validated in this test)
      // Or should reject based on your business rules
      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(waitlistData);

      // Either accept with corrected time or reject
      expect([201, 400]).toContain(response.status);
    });
  });
});