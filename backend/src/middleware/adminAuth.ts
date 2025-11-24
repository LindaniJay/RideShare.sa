import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken } from '../config/firebase';
import { User } from '../models';
import { logger } from '../utils/logger';

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    uid: string;
    email: string;
    name: string;
    role: 'admin';
    isAdmin: boolean;
  };
}

/**
 * Middleware to verify Firebase admin token and check admin privileges
 */
export const authenticateAdmin = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Admin access token required'
      });
    }

    // Verify Firebase token
    let decodedToken;
    try {
      const { getAuth } = require('../config/firebase');
      const auth = getAuth();
      decodedToken = await auth.verifyIdToken(token);
    } catch (firebaseError) {
      logger.error('Firebase token verification failed:', firebaseError);
      return res.status(401).json({
        success: false,
        error: 'Invalid admin token'
      });
    }
    
    // Find user in database by Firebase UID
    let user = await User.findOne({ where: { firebase_uid: decodedToken.uid } });
    
    // If not found by Firebase UID, try to find by email
    if (!user && decodedToken.email) {
      user = await User.findOne({ where: { email: decodedToken.email } });
      
      // If found by email, update Firebase UID
      if (user) {
        logger.info(`Updating Firebase UID for user ${user.email}`);
        await user.update({ firebase_uid: decodedToken.uid });
      }
    }
    
    if (!user) {
      logger.warn(`Admin authentication failed: User not found in database (Firebase UID: ${decodedToken.uid}, Email: ${decodedToken.email})`);
      return res.status(404).json({
        success: false,
        error: 'Admin user not found in database',
        details: 'User needs to be registered in the system. Please contact support or run the fix-admin-user script.',
        firebaseUid: decodedToken.uid,
        email: decodedToken.email
      });
    }

    // Verify user is admin in database (unified system)
    if (user.role !== 'admin') {
      logger.warn(`Admin authentication failed: User ${user.email} does not have admin role (current role: ${user.role})`);
      return res.status(403).json({
        success: false,
        error: 'Admin privileges required',
        details: `User role is '${user.role}' but 'admin' is required. Run: npm run fix:admin ${user.email}`,
        currentRole: user.role,
        requiredRole: 'admin'
      });
    }

    // Add admin info to request
    req.admin = {
      id: user.id.toString(),
      uid: user.firebase_uid || '',
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      role: 'admin',
      isAdmin: true
    };

    // Log admin action
    logger.info(`Admin access: ${user.email} (${user.firebase_uid}) - ${req.method} ${req.path}`);

    next();
  } catch (error) {
    logger.error('Admin authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid admin token'
    });
  }
};

/**
 * Rate limiting middleware for admin routes
 */
export const adminRateLimit = (req: AdminRequest, res: Response, next: NextFunction) => {
  // Simple in-memory rate limiting (in production, use Redis)
  const adminId = req.admin?.id;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // 100 requests per window

  if (!adminId) {
    return next();
  }

  // This is a simplified rate limiter - in production, use a proper rate limiting library
  next();
};

/**
 * Audit logging middleware for admin actions
 */
export const auditAdminAction = (action: string) => {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log admin action
      logger.info(`Admin Action: ${action}`, {
        adminId: req.admin?.id,
        adminEmail: req.admin?.email,
        action,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      // Store in audit log (you can implement this with a database table)
      // await AuditLog.create({ ... });

      return originalSend.call(this, data);
    };

    next();
  };
};
