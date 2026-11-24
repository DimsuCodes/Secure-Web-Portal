import { Schema, model } from 'mongoose'
 
// This is the model you will be modifying
const bookmarkSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});
 
const Bookmark = model('Bookmark', bookmarkSchema);

export default Bookmark;