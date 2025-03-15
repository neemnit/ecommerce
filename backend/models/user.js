import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false,
  }],
  address:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Address",
    required:false
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User
