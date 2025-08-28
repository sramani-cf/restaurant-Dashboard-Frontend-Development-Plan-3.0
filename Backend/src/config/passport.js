const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const database = require('./database');
const logger = require('./logger');

class PassportConfig {
  constructor() {
    this.initialize();
  }

  initialize() {
    // Configure Google OAuth Strategy
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/v1/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        await this.handleGoogleAuthCallback(accessToken, refreshToken, profile, done);
      } catch (error) {
        logger.error('Google OAuth error:', error);
        return done(error, null);
      }
    }));

    // Serialize user for session
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
      try {
        const prisma = database.getClient();
        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            picture: true,
            role: true,
            status: true,
            provider: true,
            isEmailVerified: true,
          }
        });
        done(null, user);
      } catch (error) {
        logger.error('User deserialization error:', error);
        done(error, null);
      }
    });
  }

  async handleGoogleAuthCallback(accessToken, refreshToken, profile, done) {
    const prisma = database.getClient();
    
    try {
      // Extract user data from Google profile
      const googleData = {
        googleId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        picture: profile.photos[0]?.value,
        provider: 'google'
      };

      // Check if user already exists with this Google ID
      let user = await prisma.user.findUnique({
        where: { googleId: googleData.googleId }
      });

      if (user) {
        // Update existing Google user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            picture: googleData.picture,
            // Update name if changed in Google
            firstName: googleData.firstName,
            lastName: googleData.lastName,
          }
        });

        logger.info('Existing Google user logged in:', { userId: user.id, email: user.email });
        return done(null, user);
      }

      // Check if user exists with same email (different provider)
      const existingEmailUser = await prisma.user.findUnique({
        where: { email: googleData.email }
      });

      if (existingEmailUser) {
        // Link Google account to existing email account
        user = await prisma.user.update({
          where: { id: existingEmailUser.id },
          data: {
            googleId: googleData.googleId,
            provider: 'google', // Update provider to Google
            providerAccountId: googleData.googleId,
            picture: googleData.picture,
            isEmailVerified: true, // Google emails are already verified
            emailVerifiedAt: new Date(),
            emailVerificationCode: null,
            emailVerificationExpiry: null,
            lastLoginAt: new Date(),
          }
        });

        // Create account record for OAuth
        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleData.googleId,
            accessToken: accessToken,
            refreshToken: refreshToken,
            tokenType: 'Bearer',
            scope: 'email profile',
          }
        });

        logger.info('Linked Google account to existing user:', { userId: user.id, email: user.email });
        return done(null, user);
      }

      // Create new user with Google account
      user = await prisma.user.create({
        data: {
          email: googleData.email,
          firstName: googleData.firstName,
          lastName: googleData.lastName,
          googleId: googleData.googleId,
          provider: 'google',
          providerAccountId: googleData.googleId,
          picture: googleData.picture,
          isEmailVerified: true, // Google emails are already verified
          emailVerifiedAt: new Date(),
          password: null, // No password for OAuth users
          role: 'STAFF', // Default role
          status: 'ACTIVE',
          lastLoginAt: new Date(),
        }
      });

      // Create account record for OAuth
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: googleData.googleId,
          accessToken: accessToken,
          refreshToken: refreshToken,
          tokenType: 'Bearer',
          scope: 'email profile',
        }
      });

      logger.info('New Google user created:', { userId: user.id, email: user.email });
      return done(null, user);

    } catch (error) {
      logger.error('Error in Google OAuth callback:', error);
      return done(error, null);
    }
  }
}

// Initialize and export passport config
const passportConfig = new PassportConfig();

module.exports = {
  passport,
  PassportConfig
};