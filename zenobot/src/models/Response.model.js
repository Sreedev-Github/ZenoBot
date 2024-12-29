import mongoose, { Schema } from 'mongoose';

const ResponseSchema = new Schema({
  query: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ResponseModel = mongoose.models.Response || mongoose.model('Response', ResponseSchema);

export default ResponseModel;