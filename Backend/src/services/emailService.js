const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = new Map();
    this.initialize();
  }

  /**
   * Initialize email service with configuration
   */
  async initialize() {
    try {
      // Configure email transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production configuration (e.g., SendGrid, AWS SES, etc.)
        this.transporter = nodemailer.createTransporter({
          service: process.env.EMAIL_SERVICE || 'sendgrid',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      } else {
        // Development configuration (e.g., Ethereal Email for testing)
        this.transporter = nodemailer.createTransporter({
          host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
          port: process.env.EMAIL_PORT || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
            pass: process.env.EMAIL_PASSWORD || 'ethereal.pass'
          }
        });
      }

      // Verify connection
      await this.transporter.verify();
      logger.info('Email service initialized successfully');
      
      // Load email templates
      await this.loadTemplates();
      
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.transporter = null;
    }
  }

  /**
   * Load email templates from filesystem
   */
  async loadTemplates() {
    const templatesPath = path.join(__dirname, '../templates/emails');
    
    try {
      const templateFiles = [
        'reservation-confirmation.hbs',
        'reservation-reminder.hbs',
        'reservation-cancelled.hbs',
        'waitlist-promotion.hbs'
      ];

      for (const file of templateFiles) {
        try {
          const templatePath = path.join(templatesPath, file);
          const templateContent = await fs.readFile(templatePath, 'utf8');
          const template = handlebars.compile(templateContent);
          
          const templateName = file.replace('.hbs', '');
          this.templates.set(templateName, template);
        } catch (fileError) {
          logger.warn(`Template file not found: ${file}, using default template`);
          // Use default templates if files don't exist
          this.createDefaultTemplate(file.replace('.hbs', ''));
        }
      }
    } catch (error) {
      logger.warn('Templates directory not found, using default templates');
      this.createDefaultTemplates();
    }
  }

  /**
   * Create default email templates
   */
  createDefaultTemplates() {
    // Reservation confirmation template
    const confirmationTemplate = handlebars.compile(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Reservation Confirmed</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Dear {{customerName}},</h3>
          <p>Your reservation has been confirmed! Here are the details:</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Restaurant:</strong> {{restaurantName}}<br>
            <strong>Date:</strong> {{formatDate date}}<br>
            <strong>Time:</strong> {{formatTime time}}<br>
            <strong>Party Size:</strong> {{partySize}} guests<br>
            <strong>Table:</strong> {{#if tableNumber}}Table {{tableNumber}}{{else}}To be assigned{{/if}}<br>
            <strong>Confirmation Code:</strong> <span style="font-size: 18px; font-weight: bold; color: #059669;">{{confirmationCode}}</span>
          </div>
          
          {{#if specialRequests}}
          <div style="background: #fef3c7; padding: 10px; border-radius: 5px; margin: 15px 0;">
            <strong>Special Requests:</strong> {{specialRequests}}
          </div>
          {{/if}}
          
          <p style="margin-top: 20px;">
            <strong>Contact Information:</strong><br>
            Phone: {{restaurantPhone}}<br>
            Email: {{restaurantEmail}}<br>
            Address: {{restaurantAddress}}
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Please arrive on time. If you need to cancel or modify your reservation, 
            please contact us at least 2 hours in advance.
          </p>
        </div>
      </div>
    `);
    this.templates.set('reservation-confirmation', confirmationTemplate);

    // Reservation reminder template
    const reminderTemplate = handlebars.compile(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Reservation Reminder</h2>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Hello {{customerName}},</h3>
          <p>This is a friendly reminder about your upcoming reservation:</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Restaurant:</strong> {{restaurantName}}<br>
            <strong>Date:</strong> {{formatDate date}}<br>
            <strong>Time:</strong> {{formatTime time}}<br>
            <strong>Party Size:</strong> {{partySize}} guests<br>
            <strong>Confirmation Code:</strong> {{confirmationCode}}
          </div>
          
          <p>We look forward to serving you!</p>
        </div>
      </div>
    `);
    this.templates.set('reservation-reminder', reminderTemplate);
  }

  /**
   * Create a specific default template
   */
  createDefaultTemplate(templateName) {
    switch (templateName) {
      case 'reservation-confirmation':
        this.createDefaultTemplates();
        break;
      case 'reservation-reminder':
        this.createDefaultTemplates();
        break;
      default:
        logger.warn(`No default template available for: ${templateName}`);
    }
  }

  /**
   * Send reservation confirmation email
   */
  async sendReservationConfirmation(reservation) {
    if (!this.transporter) {
      logger.warn('Email service not available, skipping confirmation email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const template = this.templates.get('reservation-confirmation');
      if (!template) {
        throw new Error('Confirmation template not found');
      }

      // Prepare template data
      const templateData = {
        customerName: `${reservation.customer.firstName} ${reservation.customer.lastName}`,
        restaurantName: reservation.restaurant.name,
        date: reservation.date,
        time: reservation.time,
        partySize: reservation.partySize,
        tableNumber: reservation.table?.number,
        specialRequests: reservation.specialRequests,
        confirmationCode: reservation.id.slice(-6).toUpperCase(),
        restaurantPhone: reservation.restaurant.phone,
        restaurantEmail: reservation.restaurant.email,
        restaurantAddress: `${reservation.restaurant.address.street}, ${reservation.restaurant.address.city}, ${reservation.restaurant.address.state} ${reservation.restaurant.address.zipCode}`
      };

      // Register Handlebars helpers
      this.registerHandlebarsHelpers();

      const htmlContent = template(templateData);

      const mailOptions = {
        from: process.env.EMAIL_FROM || reservation.restaurant.email,
        to: reservation.customer.email,
        subject: `Reservation Confirmed - ${reservation.restaurant.name}`,
        html: htmlContent,
        text: this.generateTextVersion(templateData, 'confirmation')
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Confirmation email sent:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      logger.error('Failed to send confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send reservation reminder email
   */
  async sendReservationReminder(reservation) {
    if (!this.transporter) {
      logger.warn('Email service not available, skipping reminder email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const template = this.templates.get('reservation-reminder');
      if (!template) {
        throw new Error('Reminder template not found');
      }

      const templateData = {
        customerName: `${reservation.customer.firstName} ${reservation.customer.lastName}`,
        restaurantName: reservation.restaurant.name,
        date: reservation.date,
        time: reservation.time,
        partySize: reservation.partySize,
        confirmationCode: reservation.id.slice(-6).toUpperCase()
      };

      this.registerHandlebarsHelpers();

      const htmlContent = template(templateData);

      const mailOptions = {
        from: process.env.EMAIL_FROM || reservation.restaurant.email,
        to: reservation.customer.email,
        subject: `Reservation Reminder - ${reservation.restaurant.name}`,
        html: htmlContent,
        text: this.generateTextVersion(templateData, 'reminder')
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Reminder email sent:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      logger.error('Failed to send reminder email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send reservation cancellation email
   */
  async sendReservationCancellation(reservation, reason = '') {
    if (!this.transporter || !reservation.customer.email) {
      return { success: false, error: 'Email service not available or no customer email' };
    }

    try {
      const templateData = {
        customerName: `${reservation.customer.firstName} ${reservation.customer.lastName}`,
        restaurantName: reservation.restaurant.name,
        date: reservation.date,
        time: reservation.time,
        confirmationCode: reservation.id.slice(-6).toUpperCase(),
        reason: reason || 'No reason provided'
      };

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Reservation Cancelled</h2>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px;">
            <h3>Dear ${templateData.customerName},</h3>
            <p>Your reservation has been cancelled:</p>
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Restaurant:</strong> ${templateData.restaurantName}<br>
              <strong>Date:</strong> ${new Date(templateData.date).toLocaleDateString()}<br>
              <strong>Time:</strong> ${new Date(templateData.time).toLocaleTimeString()}<br>
              <strong>Confirmation Code:</strong> ${templateData.confirmationCode}<br>
              <strong>Reason:</strong> ${templateData.reason}
            </div>
            <p>We apologize for any inconvenience. Please feel free to make a new reservation at your convenience.</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || reservation.restaurant.email,
        to: reservation.customer.email,
        subject: `Reservation Cancelled - ${reservation.restaurant.name}`,
        html: htmlContent,
        text: `Your reservation at ${templateData.restaurantName} on ${new Date(templateData.date).toLocaleDateString()} at ${new Date(templateData.time).toLocaleTimeString()} has been cancelled. Reason: ${templateData.reason}`
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Cancellation email sent:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      logger.error('Failed to send cancellation email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register Handlebars helpers for template rendering
   */
  registerHandlebarsHelpers() {
    // Format date helper
    handlebars.registerHelper('formatDate', function(date) {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });

    // Format time helper
    handlebars.registerHelper('formatTime', function(time) {
      return new Date(time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    });
  }

  /**
   * Generate text version of email for better accessibility
   */
  generateTextVersion(data, type) {
    switch (type) {
      case 'confirmation':
        return `
Reservation Confirmed

Dear ${data.customerName},

Your reservation has been confirmed!

Restaurant: ${data.restaurantName}
Date: ${new Date(data.date).toLocaleDateString()}
Time: ${new Date(data.time).toLocaleTimeString()}
Party Size: ${data.partySize} guests
Table: ${data.tableNumber || 'To be assigned'}
Confirmation Code: ${data.confirmationCode}

${data.specialRequests ? `Special Requests: ${data.specialRequests}` : ''}

Contact Information:
Phone: ${data.restaurantPhone}
Email: ${data.restaurantEmail}
Address: ${data.restaurantAddress}

Please arrive on time. If you need to cancel or modify your reservation, please contact us at least 2 hours in advance.
        `;
      
      case 'reminder':
        return `
Reservation Reminder

Hello ${data.customerName},

This is a friendly reminder about your upcoming reservation:

Restaurant: ${data.restaurantName}
Date: ${new Date(data.date).toLocaleDateString()}
Time: ${new Date(data.time).toLocaleTimeString()}
Party Size: ${data.partySize} guests
Confirmation Code: ${data.confirmationCode}

We look forward to serving you!
        `;
      
      default:
        return 'Reservation notification from ' + (data.restaurantName || 'Restaurant');
    }
  }

  /**
   * Test email configuration
   */
  async testEmailService() {
    if (!this.transporter) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const testMail = {
        from: process.env.EMAIL_FROM || 'test@restaurant-dashboard.com',
        to: process.env.EMAIL_TEST_TO || 'admin@restaurant-dashboard.com',
        subject: 'Email Service Test',
        text: 'This is a test email from the Restaurant Dashboard email service.',
        html: '<p>This is a test email from the <strong>Restaurant Dashboard</strong> email service.</p>'
      };

      const result = await this.transporter.sendMail(testMail);
      
      return { 
        success: true, 
        messageId: result.messageId,
        message: 'Test email sent successfully' 
      };

    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export individual functions for backward compatibility
module.exports = {
  sendReservationConfirmation: (reservation) => emailService.sendReservationConfirmation(reservation),
  sendReservationReminder: (reservation) => emailService.sendReservationReminder(reservation),
  sendReservationCancellation: (reservation, reason) => emailService.sendReservationCancellation(reservation, reason),
  testEmailService: () => emailService.testEmailService(),
  emailService
};