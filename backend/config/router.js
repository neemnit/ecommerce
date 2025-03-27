import express from 'express';
import passport from 'passport';
import upload from '../middleware/multerConfig.js';
import { validateProduct } from '../middleware/validateProduct.js';

// Import Controllers
import productController from '../controllers/product.js';
import passportController from '../controllers/passport.js';
import addressController from '../controllers/address.js';
import orderController from '../controllers/order.js';
import paymentController from '../controllers/payment.js';

const router = express.Router();

// Middleware for protecting routes
const authenticate = passport.authenticate('jwt', { session: false });

// Middleware for logging authenticated user
const authLogger = (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: No user found' });
  }
  next();
};

/**
 * 🛒 Product Routes
 */
router.post(
  '/addproduct',
  upload.array('images', 5), // Allows up to 5 images
  validateProduct,
  productController.createProduct
);
router.get('/getProduct', productController.getProduct);
router.delete('/products/:id',productController.deleteProduct)
/**
 * 🔑 Authentication Routes (Google & JWT)
 */
router.get('/auth/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { session: false }), passportController.getAuthenticate);
router.get('/auth/session/:sessionId', passportController.getSessionId);
router.post('/refresh-token', passportController.getRefresh);

router.get('/users/:userId', authenticate, authLogger, passportController.getUser);
/**
 * 🔑 Authentication Routes (Google & JWT)
 */
router.get('/auth/logout', passportController.logout);

/**
 * 📍 Address Routes
 */
router.post('/addAddress', authenticate, (req, res, next) => {
  req.body.userId = req.user.id; // Attach userId from authenticated user
  addressController.addAddress(req, res, next);
});
router.get('/getAddress', authenticate, (req, res, next) => {
  req.body.userId = req.user.id;
  addressController.getAddress(req, res, next);
});
router.put('/api/addresses/:addressId', authenticate, (req, res, next) => {
  req.body.userId = req.user.id;
  addressController.editAddress(req, res, next);
}
);

/**
 * 📦 Order Routes
 */
router.post('/createOrder', authenticate, authLogger, orderController.createOrder);
router.get('/orders/:orderId', authenticate, orderController.getOrder);
router.get('/orders/user/:userId', authenticate, orderController.getUserOrder);

/**
 * 💳 Payment Routes (Stripe)
 */
router.post('/payments',authenticate, paymentController.createPayment); // Step 1: Create payment and get paymentId
router.get('/payments/:paymentId',authenticate, paymentController.handlePayment); // Step 2: Redirect to Stripe Checkout
router.get('/success',paymentController.handleSuccess); // Step 3: Handle success after Stripe payment

export default router;
