import ImageKit from '@imagekit/nodejs';

async function uploadFile(buffer, fileName = `product-${Date.now()}.jpg`) {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is missing. Add your ImageKit private key to backend/.env.");
  }
  const client = new ImageKit({ privateKey });
  const response = await client.files.upload({
    file: buffer.toString("base64"),
    fileName,
    folder: "products"
  });
  return response
}
export default uploadFile