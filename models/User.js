import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

 

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Must use a valid email address'],
  },
  password: {
    type: String,
    minlength: 5,
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true // only check that it's unique for users who have one
  }
});
 
// hash user password
userSchema.pre('save', async function () {
   if (!this.password) return;
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  } 
});
 
// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password) {
  if (!this.password) return false;  //for github users that will not have a password thats hashable
  return bcrypt.compare(password, this.password);
};
 
const User = model('User', userSchema);
 
export default User;