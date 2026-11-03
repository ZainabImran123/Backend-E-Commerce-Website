import productModel from "../models/products.model.js";

export const demoProducts = [
  {
    name: "Everyday Sneakers",
    desc: "A comfortable classic for wherever the day takes you.",
    price: 64.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Minimalist Watch",
    desc: "A clean, easy-to-wear design with a timeless feel.",
    price: 89,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Studio Headphones",
    desc: "Settle into your favorite music with soft over-ear cushions.",
    price: 54.5,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Canvas Tote",
    desc: "A roomy everyday carryall for errands and weekend plans.",
    price: 28,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Instant Camera",
    desc: "Capture little moments and keep them close.",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Ceramic Table Lamp",
    desc: "A warm, gentle glow for your reading nook or bedside.",
    price: 42,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
  },
];

export async function seedDemoProducts(adminId) {
  if (await productModel.exists({})) return 0;

  const seeded = await productModel.insertMany(
    demoProducts.map((product) => ({ ...product, admin: adminId })),
  );
  return seeded.length;
}
