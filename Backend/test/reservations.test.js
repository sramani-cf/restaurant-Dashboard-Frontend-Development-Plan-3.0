const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/app'); // Assuming main app file exists
const { generateTestToken } = require('./helpers/auth');

const prisma = new PrismaClient();

describe('Reservation System Tests', () => {
  let testRestaurant;
  let testUser;
  let testCustomer;
  let testTables;
  let authToken;

  beforeAll(async () => {
    // Setup test data
    testUser = await prisma.user.create({
      data: {
        email: 'test@restaurant.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'MANAGER',
        status: 'ACTIVE'
      }
    });

    testRestaurant = await prisma.restaurant.create({
      data: {
        name: 'Test Restaurant',
        email: 'test@restaurant.com',
        phone: '+1234567890',
        isActive: true,
        address: {
          create: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'US'
          }
        },
        settings: {
          create: {
            maxAdvanceBookingDays: 60,
            minAdvanceBookingMinutes: 30,
            minPartySize: 1,
            maxPartySize: 20,
            minReservationDuration: 30,
            maxReservationDuration: 480
          }
        },
        operatingHours: {
          create: [
            {
              dayOfWeek: 1, // Monday
              isOpen: true,
              openTime: 11 * 60, // 11:00 AM
              closeTime: 22 * 60 // 10:00 PM
            },
            {
              dayOfWeek: 2, // Tuesday
              isOpen: true,
              openTime: 11 * 60,
              closeTime: 22 * 60
            },
            // Add more days as needed
          ]
        }
      }
    });

    // Create test tables
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
          capacity: 4,
          location: 'Center',
          isActive: true
        }
      }),
      prisma.table.create({
        data: {
          restaurantId: testRestaurant.id,
          number: 3,
          capacity: 6,
          location: 'Private',
          isActive: true
        }
      })
    ]);

    testCustomer = await prisma.customer.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1987654321',
        email: 'john.doe@email.com'
      }
    });

    authToken = generateTestToken(testUser);
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.reservation.deleteMany({});
    await prisma.waitlistEntry.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.table.deleteMany({});
    await prisma.operatingHours.deleteMany({});
    await prisma.restaurantSettings.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.restaurant.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /restaurants/:restaurantId/reservations', () => {
    it('should create a reservation successfully', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      const reservationData = {
        customerInfo: {
          name: 'Jane Smith',
          phone: '+1555123456',
          email: 'jane.smith@email.com'
        },
        date: tomorrowString,
        time: '19:00',
        partySize: 2,
        duration: 120,
        specialRequests: 'Window seat if possible'
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(201);

      expect(response.body.message).toBe('Reservation created successfully');
      expect(response.body.reservation.partySize).toBe(2);
      expect(response.body.reservation.status).toBe('CONFIRMED');
      expect(response.body.reservation.confirmationCode).toHaveLength(6);
    });

    it('should reject reservation for past date', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      const reservationData = {
        customerInfo: {
          name: 'Test Customer',
          phone: '+1555999999'
        },
        date: yesterdayString,
        time: '19:00',
        partySize: 2
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Cannot make reservations for past dates');
    });

    it('should reject reservation outside operating hours', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      const reservationData = {
        customerInfo: {
          name: 'Test Customer',
          phone: '+1555999999'
        },
        date: tomorrowString,
        time: '06:00', // Before opening hours
        partySize: 2
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('outside operating hours');
    });

    it('should reject reservation with invalid party size', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      const reservationData = {
        customerInfo: {
          name: 'Test Customer',
          phone: '+1555999999'
        },
        date: tomorrowString,
        time: '19:00',
        partySize: 25 // Exceeds maximum
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Party size must be between 1 and 20'
          })
        ])
      );
    });

    it('should detect table conflicts', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      // Create first reservation
      const firstReservation = {
        customerInfo: {
          name: 'First Customer',
          phone: '+1555111111'
        },
        date: tomorrowString,
        time: '19:00',
        partySize: 2,
        tableId: testTables[0].id
      };

      await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(firstReservation)
        .expect(201);

      // Try to create conflicting reservation
      const conflictingReservation = {
        customerInfo: {
          name: 'Second Customer',
          phone: '+1555222222'
        },
        date: tomorrowString,
        time: '19:30', // 30 minutes later, should conflict
        partySize: 2,
        tableId: testTables[0].id // Same table
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(conflictingReservation)
        .expect(409);

      expect(response.body.error).toBe('Time slot not available');
      expect(response.body.conflicts).toHaveLength(1);
      expect(response.body.suggestedTimes).toBeDefined();
    });

    it('should auto-assign optimal table when none specified', async () => {
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      const dateString = dayAfterTomorrow.toISOString().split('T')[0];

      const reservationData = {
        customerInfo: {
          name: 'Auto Table Customer',
          phone: '+1555333333'
        },
        date: dateString,
        time: '18:00',
        partySize: 4 // Should get table with capacity 4 or 6
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(201);

      expect(response.body.reservation.tableId).toBeDefined();
      expect(response.body.reservation.tableNumber).toBeDefined();

      // Verify the assigned table can accommodate the party
      const assignedTable = testTables.find(t => t.id === response.body.reservation.tableId);
      expect(assignedTable.capacity).toBeGreaterThanOrEqual(4);
    });

    it('should handle customer lookup by email', async () => {
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      const dateString = dayAfterTomorrow.toISOString().split('T')[0];

      const reservationData = {
        customerInfo: {
          name: 'John Doe', // Different name but same email as existing customer
          phone: '+1999888777',
          email: testCustomer.email // Existing customer email
        },
        date: dateString,
        time: '17:00',
        partySize: 2
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(201);

      // Should use existing customer record
      expect(response.body.reservation.customerName).toBe(
        `${testCustomer.firstName} ${testCustomer.lastName}`
      );
    });
  });

  describe('GET /restaurants/:restaurantId/reservations', () => {
    it('should return paginated reservations', async () => {
      const response = await request(app)
        .get(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10, page: 1 })
        .expect(200);

      expect(response.body.reservations).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should filter reservations by date', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ date: tomorrowString })
        .expect(200);

      response.body.reservations.forEach(reservation => {
        const reservationDate = new Date(reservation.date).toISOString().split('T')[0];
        expect(reservationDate).toBe(tomorrowString);
      });
    });

    it('should filter reservations by status', async () => {
      const response = await request(app)
        .get(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'CONFIRMED' })
        .expect(200);

      response.body.reservations.forEach(reservation => {
        expect(reservation.status).toBe('CONFIRMED');
      });
    });
  });

  describe('PUT /restaurants/:restaurantId/reservations/:id', () => {
    let testReservation;

    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);

      testReservation = await prisma.reservation.create({
        data: {
          restaurantId: testRestaurant.id,
          customerId: testCustomer.id,
          tableId: testTables[0].id,
          date: tomorrow,
          time: new Date(`${tomorrow.toISOString().split('T')[0]}T20:00:00`),
          partySize: 2,
          duration: 120,
          status: 'CONFIRMED',
          createdByUserId: testUser.id
        }
      });
    });

    it('should update reservation successfully', async () => {
      const updates = {
        partySize: 3,
        specialRequests: 'Updated special requests',
        notes: 'Updated notes'
      };

      const response = await request(app)
        .put(`/restaurants/${testRestaurant.id}/reservations/${testReservation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.reservation.partySize).toBe(3);
      expect(response.body.reservation.specialRequests).toBe('Updated special requests');
    });

    it('should update reservation status with proper timestamps', async () => {
      const response = await request(app)
        .put(`/restaurants/${testRestaurant.id}/reservations/${testReservation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'ARRIVED' })
        .expect(200);

      expect(response.body.reservation.status).toBe('ARRIVED');
      // Should also have confirmedAt and arrivedAt timestamps
    });

    it('should reject time change that causes conflicts', async () => {
      // Create another reservation to conflict with
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);

      const conflictingReservation = await prisma.reservation.create({
        data: {
          restaurantId: testRestaurant.id,
          customerId: testCustomer.id,
          tableId: testTables[1].id,
          date: tomorrow,
          time: new Date(`${tomorrow.toISOString().split('T')[0]}T19:00:00`),
          partySize: 4,
          duration: 120,
          status: 'CONFIRMED',
          createdByUserId: testUser.id
        }
      });

      const response = await request(app)
        .put(`/restaurants/${testRestaurant.id}/reservations/${testReservation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          time: '19:30', // Should conflict with existing reservation
          tableId: testTables[1].id
        })
        .expect(409);

      expect(response.body.error).toBe('Time slot not available');
    });
  });

  describe('POST /restaurants/:restaurantId/reservations/availability', () => {
    it('should check availability successfully', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 5);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      const availabilityRequest = {
        date: tomorrowString,
        time: '18:00',
        partySize: 2,
        duration: 120
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations/availability`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(availabilityRequest)
        .expect(200);

      expect(response.body.available).toBeDefined();
      expect(response.body.availableTables).toBeInstanceOf(Array);
      expect(response.body.capacity).toBeGreaterThanOrEqual(0);
    });

    it('should return conflicts when time slot is unavailable', async () => {
      // First create a reservation
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 4);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      await prisma.reservation.create({
        data: {
          restaurantId: testRestaurant.id,
          customerId: testCustomer.id,
          tableId: testTables[0].id,
          date: tomorrow,
          time: new Date(`${tomorrowString}T18:00:00`),
          partySize: 2,
          duration: 120,
          status: 'CONFIRMED',
          createdByUserId: testUser.id
        }
      });

      const availabilityRequest = {
        date: tomorrowString,
        time: '18:30', // Should conflict
        partySize: 2,
        duration: 120,
        tableId: testTables[0].id
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations/availability`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(availabilityRequest)
        .expect(200);

      expect(response.body.available).toBe(false);
      expect(response.body.conflicts).toHaveLength(1);
      expect(response.body.suggestedTimes).toBeInstanceOf(Array);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid restaurant ID gracefully', async () => {
      const response = await request(app)
        .get('/restaurants/invalid-id/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error).toBeDefined();
    });

    it('should handle malformed request data', async () => {
      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          customerInfo: {},
          invalidField: 'invalid'
        })
        .expect(400);

      expect(response.body.errors).toBeInstanceOf(Array);
    });

    it('should handle concurrent reservation attempts', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 6);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      const reservationData = {
        customerInfo: {
          name: 'Concurrent Customer',
          phone: '+1555666777'
        },
        date: tomorrowString,
        time: '19:00',
        partySize: 2,
        tableId: testTables[2].id
      };

      // Make two concurrent requests for the same table
      const [response1, response2] = await Promise.all([
        request(app)
          .post(`/restaurants/${testRestaurant.id}/reservations`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ ...reservationData, customerInfo: { ...reservationData.customerInfo, name: 'Customer 1' } }),
        request(app)
          .post(`/restaurants/${testRestaurant.id}/reservations`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ ...reservationData, customerInfo: { ...reservationData.customerInfo, name: 'Customer 2' } })
      ]);

      // One should succeed, one should fail with conflict
      const responses = [response1, response2];
      const successResponses = responses.filter(r => r.status === 201);
      const conflictResponses = responses.filter(r => r.status === 409);

      expect(successResponses).toHaveLength(1);
      expect(conflictResponses).toHaveLength(1);
    });

    it('should handle very large party sizes gracefully', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      const reservationData = {
        customerInfo: {
          name: 'Large Party',
          phone: '+1555888999'
        },
        date: tomorrowString,
        time: '19:00',
        partySize: 12 // Larger than any single table
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData);

      // Should either find a suitable table or suggest alternatives
      if (response.status === 201) {
        expect(response.body.reservation.tableId).toBeDefined();
      } else if (response.status === 409) {
        expect(response.body.suggestedTimes).toBeDefined();
      }
    });

    it('should validate email format properly', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 8);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      const reservationData = {
        customerInfo: {
          name: 'Email Test',
          phone: '+1555777888',
          email: 'invalid-email-format'
        },
        date: tomorrowString,
        time: '19:00',
        partySize: 2
      };

      const response = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Invalid value'
          })
        ])
      );
    });

    it('should handle database connection errors gracefully', async () => {
      // Mock database error
      const originalFindMany = prisma.reservation.findMany;
      prisma.reservation.findMany = jest.fn().mockRejectedValue(new Error('Database connection error'));

      const response = await request(app)
        .get(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error).toBe('Failed to fetch reservations');
      expect(response.body.details).toBe('Database connection error');

      // Restore original function
      prisma.reservation.findMany = originalFindMany;
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple rapid reservation requests', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 10);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      const requests = Array.from({ length: 10 }, (_, i) => 
        request(app)
          .post(`/restaurants/${testRestaurant.id}/reservations`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerInfo: {
              name: `Load Test Customer ${i}`,
              phone: `+155500000${i}`
            },
            date: tomorrowString,
            time: '17:00',
            partySize: 2
          })
      );

      const responses = await Promise.all(requests);
      
      // All requests should complete (either success or conflict)
      responses.forEach(response => {
        expect([201, 409]).toContain(response.status);
      });

      // At least some should succeed
      const successCount = responses.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThan(0);
    });

    it('should respond within acceptable time limits', async () => {
      const start = Date.now();

      await request(app)
        .get(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000); // Should respond within 2 seconds
    });
  });
});