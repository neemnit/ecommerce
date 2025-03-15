import * as yup from 'yup';

export const addressValidationSchema = yup.object({
  userId: yup.string().required('User ID is required'),
  
  fullName: yup
    .string()
    .trim()
    .min(3, 'Full name must be at least 3 characters')
    .required('Full name is required'),

  phone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, 'Invalid phone number')
    .required('Phone number is required'),

  pincode: yup
    .string()
    .matches(/^\d{6}$/, 'Pincode must be exactly 6 digits')
    .required('Pincode is required'),

  state: yup.string().trim().required('State is required'),
  city: yup.string().trim().required('City is required'),
  houseNo: yup.string().trim().required('House number is required'),

  road: yup.string().trim().notRequired(),
  area: yup.string().trim().notRequired(),

  deliveryStatus: yup
    .string()
    .oneOf(['Pending', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'], 'Invalid delivery status')
    .default('Pending'),

  trackingNumber: yup
    .string()
    .trim()
    .nullable()
    .notRequired(),
});
