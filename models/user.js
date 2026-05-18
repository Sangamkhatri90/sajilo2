
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: false,
    unique:true
  },
  
  email: {
    type: String,
    required: true,
    unique: true
  },

 id: {
    type: String,
    required: true
  },

  password: {
  type: String,
  require: true
}

});

const User = mongoose.model('user', userSchema);
export default User;
