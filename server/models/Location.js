import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Hostels', 'Mess', 'Departments', 'Others'],
      default: 'Others',
    },
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field for friendly id
locationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

locationSchema.set('toJSON', {
  virtuals: true,
});

const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);

export default Location;
