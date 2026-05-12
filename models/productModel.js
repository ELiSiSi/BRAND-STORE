import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'يجب أن يحتوي المنتج على اسم'],
      trim: true,
      unique: [true, 'اسم المنتج يجب أن يكون فريداً'],
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
      required: [true, 'يجب أن يحتوي المنتج على سعر'],
    },
    image: {
      type: String,
      required: [true, 'يجب أن يحتوي المنتج على صورة'],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'يجب أن يحتوي المنتج على فئة'],
      trim: true,
    },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
