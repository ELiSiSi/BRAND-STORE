import mongoose from 'mongoose';
import slugify from 'slugify';

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'يجب أن يحتوي العرض على اسم'],
      trim: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'يجب أن يحتوي العرض على سعر'],
    },
    newprice: {
      type: Number,
      required: [true, 'يجب أن يحتوي العرض على سعر جديد'],
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

offerSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
