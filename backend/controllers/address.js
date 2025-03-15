import Address from '../models/address.js';
import { addressValidationSchema } from '../middleware/validateAddress.js';

const addressController = {
  addAddress: async (req, res) => {
    try {
      // Attach userId from req.user
      const requestData = { ...req.body, userId: req.user.id };
      
      // Validate request body using Yup
      const validatedData = await addressValidationSchema.validate(requestData, { abortEarly: false });

      // Save the validated data to the database
      const newAddress = new Address(validatedData);
      await newAddress.save();

      res.status(201).json({ success: true, message: 'Address added successfully', data: newAddress });
    } catch (error) {
      res.status(400).json({ success: false, message: error.errors || 'Validation failed' });
    }
  },

  getAddress: async (req, res) => {
    try {
      // Fetch addresses only for the logged-in user
      const addresses = await Address.find({ userId: req.user.id });
      res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default addressController;