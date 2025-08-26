const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../../src/app');
const { generateTestToken } = require('../helpers/auth');

const prisma = new PrismaClient();

describe('Complete Reservation Flow Integration Tests', () => {
  let testRestaurant;
  let testUser;
  let testTables;
  let authToken;

  beforeAll(async () => {
    // Setup comprehensive test environment
    testUser = await prisma.user.create({
      data: {
        email: 'integration@restaurant.com',
        firstName: 'Integration',
        lastName: 'Tester',
        password: 'hashedpassword',
        role: 'MANAGER',
        status: 'ACTIVE'
      }
    });

    testRestaurant = await prisma.restaurant.create({
      data: {
        name: 'Integration Test Restaurant',
        email: 'integration@restaurant.com',
        phone: '+1234567890',
        isActive: true,
        address: {
          create: {
            street: '789 Integration Blvd',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'US'
          }
        },
        settings: {
          create: {
            maxAdvanceBookingDays: 30,
            minAdvanceBookingMinutes: 60,
            minPartySize: 1,
            maxPartySize: 12,
            minReservationDuration: 60,
            maxReservationDuration: 240
          }
        },
        operatingHours: {
          create: [
            {
              dayOfWeek: 1, // Monday
              isOpen: true,
              openTime: 17 * 60, // 5:00 PM
              closeTime: 22 * 60  // 10:00 PM
            },
            {
              dayOfWeek: 2, // Tuesday
              isOpen: true,
              openTime: 17 * 60,
              closeTime: 22 * 60
            },
            {
              dayOfWeek: 3, // Wednesday
              isOpen: true,
              openTime: 17 * 60,
              closeTime: 22 * 60
            },
            {
              dayOfWeek: 4, // Thursday
              isOpen: true,
              openTime: 17 * 60,
              closeTime: 22 * 60
            },
            {
              dayOfWeek: 5, // Friday
              isOpen: true,
              openTime: 17 * 60,
              closeTime: 23 * 60  // 11:00 PM
            },
            {
              dayOfWeek: 6, // Saturday
              isOpen: true,
              openTime: 16 * 60, // 4:00 PM
              closeTime: 23 * 60  // 11:00 PM
            },
            {
              dayOfWeek: 0, // Sunday
              isOpen: true,
              openTime: 16 * 60,
              closeTime: 22 * 60
            }
          ]
        }
      }
    });

    // Create diverse table layout
    testTables = await Promise.all([
      // Small tables
      prisma.table.create({
        data: {
          restaurantId: testRestaurant.id,
          number: 1,
          capacity: 2,
          location: 'Window',
          section: 'Front',
          isActive: true
        }
      }),
      prisma.table.create({
        data: {
          restaurantId: testRestaurant.id,
          number: 2,
          capacity: 2,
          location: 'Window',
          section: 'Front',
          isActive: true
        }
      }),
      // Medium tables
      prisma.table.create({
        data: {
          restaurantId: testRestaurant.id,
          number: 3,
          capacity: 4,
          location: 'Center',
          section: 'Main',
          isActive: true
        }
      }),
      prisma.table.create({
        data: {
          restaurantId: testRestaurant.id,
          number: 4,
          capacity: 4,
          location: 'Center',
          section: 'Main',
          isActive: true
        }
      }),
      // Large tables
      prisma.table.create({
        data: {
          restaurantId: testRestaurant.id,
          number: 5,
          capacity: 6,
          location: 'Back',
          section: 'Private',
          isActive: true
        }
      }),
      prisma.table.create({
        data: {
          restaurantId: testRestaurant.id,
          number: 6,
          capacity: 8,
          location: 'Back',
          section: 'Private',
          isActive: true
        }
      }),
      // VIP table
      prisma.table.create({
        data: {
          restaurantId: testRestaurant.id,
          number: 7,
          capacity: 10,
          location: 'VIP Room',
          section: 'VIP',
          isActive: true
        }
      })
    ]);

    authToken = generateTestToken(testUser);
  });

  afterAll(async () => {
    await prisma.waitlistEntry.deleteMany({});
    await prisma.reservation.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.table.deleteMany({});
    await prisma.operatingHours.deleteMany({});
    await prisma.restaurantSettings.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.restaurant.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('Scenario 1: Peak Hour Rush - Multiple Simultaneous Bookings', () => {
    it('should handle Friday night rush with optimal table assignments', async () => {
      const fridayEvening = new Date();
      const daysUntilFriday = (5 + 7 - fridayEvening.getDay()) % 7 || 7;
      fridayEvening.setDate(fridayEvening.getDate() + daysUntilFriday);
      const fridayString = fridayEvening.toISOString().split('T')[0];

      // Simulate rush hour - multiple parties trying to book prime time slots
      const rushBookings = [
        {
          customerInfo: { name: 'VIP Customer', phone: '+1555001001', email: 'vip@email.com' },
          date: fridayString,
          time: '19:00', // Prime time
          partySize: 8,
          specialRequests: 'VIP treatment, quiet table'
        },
        {
          customerInfo: { name: 'Date Night Couple', phone: '+1555001002', email: 'date@email.com' },
          date: fridayString,
          time: '19:00', // Same prime time
          partySize: 2,
          specialRequests: 'Window seat, romantic setting'
        },
        {
          customerInfo: { name: 'Business Dinner', phone: '+1555001003', email: 'business@email.com' },
          date: fridayString,
          time: '19:00', // Same prime time
          partySize: 4,
          specialRequests: 'Quiet area for business discussion'
        },
        {
          customerInfo: { name: 'Family Celebration', phone: '+1555001004', email: 'family@email.com' },
          date: fridayString,
          time: '19:15', // Slightly later
          partySize: 6,
          specialRequests: 'Birthday celebration'
        },
        {
          customerInfo: { name: 'Large Group', phone: '+1555001005', email: 'group@email.com' },
          date: fridayString,
          time: '19:00',
          partySize: 12, // Very large party
          specialRequests: 'Company event'
        }
      ];

      const responses = await Promise.all(
        rushBookings.map(booking =>
          request(app)
            .post(`/restaurants/${testRestaurant.id}/reservations`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(booking)
        )
      );

      // Analyze results
      const successes = responses.filter(r => r.status === 201);
      const conflicts = responses.filter(r => r.status === 409);

      expect(successes.length).toBeGreaterThan(0);
      expect(successes.length + conflicts.length).toBe(5);

      // Verify optimal table assignments
      successes.forEach(response => {
        const reservation = response.body.reservation;
        const assignedTable = testTables.find(t => t.id === reservation.tableId);
        
        if (assignedTable) {
          expect(assignedTable.capacity).toBeGreaterThanOrEqual(reservation.partySize);
        }
      });

      // Check that conflicts provide alternatives
      conflicts.forEach(response => {
        expect(response.body.suggestedTimes).toBeDefined();
        expect(response.body.suggestedTimes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Scenario 2: Complete Customer Journey - Booking to Completion', () => {
    it('should handle complete customer lifecycle', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      // Step 1: Create reservation
      const reservationData = {
        customerInfo: {
          name: 'Journey Customer',
          phone: '+1555002001',
          email: 'journey@email.com'
        },
        date: tomorrowString,
        time: '18:00',
        partySize: 4,
        duration: 120,
        specialRequests: 'Anniversary dinner'
      };

      const createResponse = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(201);

      const reservationId = createResponse.body.reservation.id;
      expect(createResponse.body.reservation.status).toBe('CONFIRMED');

      // Step 2: Customer calls to modify reservation
      const modifyResponse = await request(app)
        .put(`/restaurants/${testRestaurant.id}/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          partySize: 6, // Changed party size
          specialRequests: 'Anniversary dinner with extra guests',
          notes: 'Customer called to add 2 more guests'
        })
        .expect(200);

      expect(modifyResponse.body.reservation.partySize).toBe(6);

      // Step 3: Customer arrives
      const arrivalResponse = await request(app)
        .put(`/restaurants/${testRestaurant.id}/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'ARRIVED' })
        .expect(200);

      expect(arrivalResponse.body.reservation.status).toBe('ARRIVED');

      // Step 4: Customer is seated
      const seatingResponse = await request(app)
        .put(`/restaurants/${testRestaurant.id}/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'SEATED' })
        .expect(200);

      expect(seatingResponse.body.reservation.status).toBe('SEATED');

      // Step 5: Complete the dining experience
      const completionResponse = await request(app)
        .put(`/restaurants/${testRestaurant.id}/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          status: 'COMPLETED',
          notes: 'Excellent service, happy anniversary couple'
        })
        .expect(200);

      expect(completionResponse.body.reservation.status).toBe('COMPLETED');

      // Verify final reservation state
      const finalResponse = await request(app)
        .get(`/restaurants/${testRestaurant.id}/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const finalReservation = finalResponse.body;
      expect(finalReservation.status).toBe('COMPLETED');
      expect(finalReservation.confirmedAt).toBeDefined();
      expect(finalReservation.arrivedAt).toBeDefined();
      expect(finalReservation.seatedAt).toBeDefined();
      expect(finalReservation.completedAt).toBeDefined();
    });
  });

  describe('Scenario 3: Waitlist to Reservation Flow', () => {
    it('should handle full waitlist workflow during peak demand', async () => {
      const busyDate = new Date();
      busyDate.setDate(busyDate.getDate() + 3);
      const busyDateString = busyDate.toISOString().split('T')[0];

      // Step 1: Fill all tables for prime time
      const reservationPromises = testTables.slice(0, 5).map((table, index) =>
        request(app)
          .post(`/restaurants/${testRestaurant.id}/reservations`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerInfo: {
              name: `Booked Customer ${index + 1}`,
              phone: `+155500${1000 + index}`,
              email: `booked${index + 1}@email.com`
            },
            date: busyDateString,
            time: '19:00',
            partySize: table.capacity,
            tableId: table.id
          })
      );

      const reservationResponses = await Promise.all(reservationPromises);
      reservationResponses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Step 2: Try to make reservation when fully booked
      const waitlistCustomer = {
        customerInfo: {
          name: 'Waitlist Customer',
          phone: '+1555003001',
          email: 'waitlist@email.com'
        },
        date: busyDateString,
        time: '19:00',
        partySize: 4
      };

      const conflictResponse = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(waitlistCustomer)
        .expect(409);

      expect(conflictResponse.body.error).toBe('Time slot not available');
      expect(conflictResponse.body.conflicts.length).toBeGreaterThan(0);

      // Step 3: Add customer to waitlist
      const waitlistResponse = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerInfo: waitlistCustomer.customerInfo,
          partySize: waitlistCustomer.partySize,
          preferredTime: waitlistCustomer.time,
          priority: 8
        })
        .expect(201);

      const waitlistId = waitlistResponse.body.waitlistEntry.id;
      expect(waitlistResponse.body.waitlistEntry.status).toBe('WAITING');
      expect(waitlistResponse.body.waitlistEntry.estimatedWaitTime).toBeGreaterThan(0);

      // Step 4: Complete one existing reservation to free up a table
      const firstReservation = reservationResponses[0].body.reservation;
      
      await request(app)
        .put(`/restaurants/${testRestaurant.id}/reservations/${firstReservation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'COMPLETED' })
        .expect(200);

      // Step 5: Promote waitlist customer to reservation
      const promotionResponse = await request(app)
        .post(`/restaurants/${testRestaurant.id}/waitlist/${waitlistId}/promote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tableId: firstReservation.tableId,
          time: new Date().toISOString()
        })
        .expect(200);

      expect(promotionResponse.body.reservation).toBeDefined();
      expect(promotionResponse.body.reservation.status).toBe('CONFIRMED');
      expect(promotionResponse.body.waitlistEntry.status).toBe('SEATED');

      // Step 6: Verify waitlist entry is properly updated
      const waitlistCheck = await request(app)
        .get(`/restaurants/${testRestaurant.id}/waitlist`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const promotedEntry = waitlistCheck.body.entries.find(e => e.id === waitlistId);
      expect(promotedEntry.status).toBe('SEATED');
    });
  });

  describe('Scenario 4: Analytics and Reporting Throughout Operations', () => {
    it('should provide accurate analytics after full day operations', async () => {
      const analyticsDate = new Date();
      analyticsDate.setDate(analyticsDate.getDate() + 5);
      const analyticsDateString = analyticsDate.toISOString().split('T')[0];

      // Create diverse reservation scenarios for analytics
      const scenarios = [
        // Completed reservations
        { status: 'COMPLETED', count: 8, outcomes: ['COMPLETED'] },
        // No-shows
        { status: 'NO_SHOW', count: 2, outcomes: ['NO_SHOW'] },
        // Cancellations
        { status: 'CANCELLED', count: 1, outcomes: ['CANCELLED'] },
        // Currently active
        { status: 'SEATED', count: 3, outcomes: ['CONFIRMED', 'ARRIVED', 'SEATED'] }
      ];

      let reservationCounter = 0;

      for (const scenario of scenarios) {
        for (let i = 0; i < scenario.count; i++) {
          reservationCounter++;
          
          // Create base reservation
          const reservationData = {
            customerInfo: {
              name: `Analytics Customer ${reservationCounter}`,
              phone: `+155500${4000 + reservationCounter}`,
              email: `analytics${reservationCounter}@email.com`
            },
            date: analyticsDateString,
            time: `${17 + (reservationCounter % 4)}:${(reservationCounter % 2) * 30}`,
            partySize: 2 + (reservationCounter % 4),
            duration: 90 + (reservationCounter % 3) * 30
          };

          const createResponse = await request(app)
            .post(`/restaurants/${testRestaurant.id}/reservations`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(reservationData);

          if (createResponse.status === 201) {
            const reservationId = createResponse.body.reservation.id;

            // Progress through statuses for this scenario
            for (const status of scenario.outcomes) {
              if (status !== 'CONFIRMED') { // Skip initial status
                await request(app)
                  .put(`/restaurants/${testRestaurant.id}/reservations/${reservationId}`)
                  .set('Authorization', `Bearer ${authToken}`)
                  .send({ status })
                  .expect(200);
              }
            }
          }
        }
      }

      // Request analytics
      const analyticsResponse = await request(app)
        .get(`/restaurants/${testRestaurant.id}/reservations/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: analyticsDateString,
          endDate: analyticsDateString,
          period: 'day'
        })
        .expect(200);

      const analytics = analyticsResponse.body;

      // Verify analytics accuracy
      expect(analytics.summary.totalReservations).toBeGreaterThan(0);
      expect(analytics.summary.completedReservations).toBeGreaterThan(0);
      expect(analytics.summary.completionRate).toBeGreaterThan(0);
      expect(analytics.summary.cancellationRate).toBeGreaterThanOrEqual(0);

      // Check data structure
      expect(analytics.statusDistribution).toBeInstanceOf(Array);
      expect(analytics.dailyTrends).toBeInstanceOf(Array);
      expect(analytics.peakHours).toBeInstanceOf(Array);
      expect(analytics.tableUtilization).toBeInstanceOf(Array);

      // Verify peak hours analysis
      const peakHour = analytics.peakHours.find(h => h.reservations > 0);
      expect(peakHour).toBeDefined();
      expect(peakHour.hour).toBeGreaterThanOrEqual(17);
      expect(peakHour.hour).toBeLessThanOrEqual(22);

      // Verify table utilization
      analytics.tableUtilization.forEach(table => {
        expect(table.tableId).toBeDefined();
        expect(table.tableNumber).toBeDefined();
        expect(table.capacity).toBeGreaterThan(0);
        expect(table.utilizationRate).toBeGreaterThanOrEqual(0);
        expect(table.utilizationRate).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Scenario 5: Error Recovery and Edge Cases', () => {
    it('should gracefully handle system failures and edge cases', async () => {
      const edgeCaseDate = new Date();
      edgeCaseDate.setDate(edgeCaseDate.getDate() + 7);
      const edgeCaseDateString = edgeCaseDate.toISOString().split('T')[0];

      // Test 1: Handle extremely large party that exceeds largest table
      const oversizedPartyResponse = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerInfo: {
            name: 'Oversized Party',
            phone: '+1555005001',
            email: 'oversized@email.com'
          },
          date: edgeCaseDateString,
          time: '18:00',
          partySize: 15 // Larger than largest table (capacity 10)
        });

      // Should either succeed with table combination or provide alternatives
      if (oversizedPartyResponse.status === 409) {
        expect(oversizedPartyResponse.body.suggestedTimes).toBeDefined();
      }

      // Test 2: Multiple concurrent modifications of same reservation
      const baseReservationResponse = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerInfo: {
            name: 'Concurrent Mod Test',
            phone: '+1555005002',
            email: 'concurrent@email.com'
          },
          date: edgeCaseDateString,
          time: '19:00',
          partySize: 4
        })
        .expect(201);

      const reservationId = baseReservationResponse.body.reservation.id;

      // Attempt concurrent modifications
      const concurrentMods = await Promise.all([
        request(app)
          .put(`/restaurants/${testRestaurant.id}/reservations/${reservationId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ partySize: 6, notes: 'Modification 1' }),
        request(app)
          .put(`/restaurants/${testRestaurant.id}/reservations/${reservationId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: 'ARRIVED', notes: 'Modification 2' }),
        request(app)
          .put(`/restaurants/${testRestaurant.id}/reservations/${reservationId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ specialRequests: 'Updated requests', notes: 'Modification 3' })
      ]);

      // At least one should succeed
      const successfulMods = concurrentMods.filter(r => r.status === 200);
      expect(successfulMods.length).toBeGreaterThan(0);

      // Test 3: Availability check with invalid data
      const invalidAvailabilityResponse = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations/availability`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: 'invalid-date',
          time: '25:00', // Invalid time
          partySize: -1 // Invalid party size
        })
        .expect(400);

      expect(invalidAvailabilityResponse.body.errors).toBeDefined();

      // Test 4: Recovery from partial failures
      const partialFailureData = {
        customerInfo: {
          name: 'Partial Failure Test',
          phone: '+1555005003',
          email: 'invalid-email-format' // Invalid email
        },
        date: edgeCaseDateString,
        time: '20:00',
        partySize: 2
      };

      const partialFailureResponse = await request(app)
        .post(`/restaurants/${testRestaurant.id}/reservations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialFailureData);

      // Should handle email validation gracefully
      expect([201, 400]).toContain(partialFailureResponse.status);
      
      if (partialFailureResponse.status === 400) {
        expect(partialFailureResponse.body.errors).toBeDefined();
      }
    });
  });

  describe('Performance Benchmarking', () => {
    it('should maintain performance under load', async () => {
      const performanceDate = new Date();
      performanceDate.setDate(performanceDate.getDate() + 10);
      const performanceDateString = performanceDate.toISOString().split('T')[0];

      // Generate heavy load
      const startTime = Date.now();
      
      const loadTestRequests = Array.from({ length: 50 }, (_, i) => 
        request(app)
          .post(`/restaurants/${testRestaurant.id}/reservations`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerInfo: {
              name: `Load Test ${i}`,
              phone: `+155500${6000 + i}`,
              email: `load${i}@email.com`
            },
            date: performanceDateString,
            time: `${17 + (i % 5)}:${(i % 4) * 15}`,
            partySize: 2 + (i % 6)
          })
      );

      const loadTestResponses = await Promise.all(loadTestRequests);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const avgResponseTime = totalTime / loadTestRequests.length;

      // Performance assertions
      expect(avgResponseTime).toBeLessThan(1000); // Average under 1 second
      expect(totalTime).toBeLessThan(30000); // Total under 30 seconds

      // All requests should complete (success or expected business logic failures)
      loadTestResponses.forEach(response => {
        expect([201, 400, 409]).toContain(response.status);
      });

      const successfulReservations = loadTestResponses.filter(r => r.status === 201);
      const conflicts = loadTestResponses.filter(r => r.status === 409);

      // Should have some successes and handle conflicts gracefully
      expect(successfulReservations.length).toBeGreaterThan(0);
      
      console.log(`Load test results:
        - Total requests: ${loadTestRequests.length}
        - Successful: ${successfulReservations.length}
        - Conflicts: ${conflicts.length}
        - Average response time: ${avgResponseTime.toFixed(2)}ms
        - Total time: ${totalTime}ms`);
    });
  });
});