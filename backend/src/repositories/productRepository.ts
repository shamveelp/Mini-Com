import Product, { type IProduct } from '../models/Product.js';

class ProductRepository {
  async getAll(): Promise<IProduct[]> {
    return await Product.find();
  }

  async getById(id: string): Promise<IProduct | null> {
    return await Product.findById(id);
  }

  async create(productData: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(productData);
    return await product.save();
  }

  async count(): Promise<number> {
    return await Product.countDocuments();
  }

  async seed(products: any[]): Promise<void> {
    await Product.insertMany(products);
  }
}

export default new ProductRepository();
