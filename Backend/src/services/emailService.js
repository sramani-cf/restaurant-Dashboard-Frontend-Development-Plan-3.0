const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');
const crypto = require('crypto');

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
      // Configure email transporter for Gmail SMTP
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // Mailslurp port 2525 doesn't use SSL
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });

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
        'waitlist-promotion.hbs',
        'email-verification.hbs'
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

    // Email verification template - Simple & Professional Design
    const verificationTemplate = handlebars.compile(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #1f2937; letter-spacing: -0.5px;">AURA 2030</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Neural Restaurant OS</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Title -->
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #1f2937; text-align: center;">Email Verification</h2>
              
              <!-- Greeting -->
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                Hello {{userName}},<br><br>
                Welcome to AURA 2030! Please verify your email address to complete your account setup.
              </p>
              
              <!-- Verification Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <div style="background-color: #eff6ff; border: 2px solid #2563eb; border-radius: 8px; padding: 30px; display: inline-block; margin: 0 auto;">
                      <p style="margin: 0 0 15px; font-size: 14px; color: #374151; font-weight: 600;">YOUR VERIFICATION CODE</p>
                      <div style="font-size: 36px; font-weight: 700; color: #2563eb; letter-spacing: 6px; font-family: 'Courier New', monospace;">{{verificationCode}}</div>
                      <p style="margin: 15px 0 0; font-size: 12px; color: #6b7280;">Expires in {{expiryMinutes}} minutes</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Instructions -->
              <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0;">
                <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #1f2937;">How to verify:</p>
                <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #4b5563;">
                  <li style="margin-bottom: 8px;">Return to the verification page</li>
                  <li style="margin-bottom: 8px;">Enter the 6-digit code above</li>
                  <li>Complete your account setup</li>
                </ol>
              </div>
              
              <!-- Security Notice -->
              <p style="margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; line-height: 1.5; color: #6b7280; text-align: center;">
                If you didn't create this account, please ignore this email.<br>
                This verification code will expire automatically for your security.
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                © 2024 AURA 2030 - Neural Restaurant OS<br>
                <span style="color: #16a34a; font-weight: 600;">🔒 Secure Email Verification</span>
              </p>
            </td>
          </tr>
          
        </table>
      </body>
      </html>
    `);
    this.templates.set('email-verification', verificationTemplate);
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
   * Generate 6-digit verification code
   */
  generateVerificationCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Send email verification code
   */
  async sendVerificationCode(userEmail, userName, verificationCode) {
    if (!this.transporter) {
      logger.warn('Email service not available, skipping verification email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const template = this.templates.get('email-verification');
      if (!template) {
        throw new Error('Email verification template not found');
      }

      // Prepare template data
      const templateData = {
        userName: userName,
        verificationCode: verificationCode,
        expiryMinutes: process.env.EMAIL_VERIFICATION_EXPIRY_MINUTES || 10
      };

      const htmlContent = template(templateData);

      const mailOptions = {
        from: `${process.env.FROM_NAME || 'AURA 2030'} <${process.env.FROM_EMAIL}>`,
        to: userEmail,
        subject: 'Verify Your AURA 2030 Account - Neural Restaurant OS',
        html: htmlContent,
        text: this.generateTextVersionForVerification(templateData)
      };

      // Log email details for debugging
      logger.info('Sending email with details:', {
        to: userEmail,
        from: mailOptions.from,
        subject: mailOptions.subject,
        hasHtmlContent: !!mailOptions.html
      });
      
      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Verification email sent successfully:', {
        messageId: result.messageId,
        to: userEmail,
        response: result.response
      });
      return { success: true, messageId: result.messageId };

    } catch (error) {
      logger.error('Failed to send verification email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate text version of verification email
   */
  generateTextVersionForVerification(data) {
    return `
AURA 2030 - Neural Restaurant OS
=====================================

EMAIL VERIFICATION

Hello ${data.userName},

Welcome to AURA 2030! Please verify your email address to complete your account setup.

YOUR VERIFICATION CODE: ${data.verificationCode}

This code expires in ${data.expiryMinutes} minutes.

HOW TO VERIFY:
1. Return to the verification page
2. Enter the 6-digit code above  
3. Complete your account setup

SECURITY NOTICE:
If you didn't create this account, please ignore this email.
This verification code will expire automatically for your security.

© 2024 AURA 2030 - Neural Restaurant OS
🔒 Secure Email Verification
    `;
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
  generateVerificationCode: () => emailService.generateVerificationCode(),
  sendVerificationCode: (userEmail, userName, verificationCode) => emailService.sendVerificationCode(userEmail, userName, verificationCode),
  testEmailService: () => emailService.testEmailService(),
  emailService
};