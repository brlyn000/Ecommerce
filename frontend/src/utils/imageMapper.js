import product1 from '../assets/image/product/1.webp';
import product2 from '../assets/image/product/2.webp';
import product3 from '../assets/image/product/3.webp';
import product4 from '../assets/image/product/4.webp';

export const imageMapper = {
  'product1.webp': product1,
  'product2.webp': product2,
  'product3.webp': product3,
  'product4.webp': product4,
  '1.webp': product1,
  '2.webp': product2,
  '3.webp': product3,
  '4.webp': product4,
};

export const getProductImage = (imagePath) => {
  if (!imagePath) return product1;
  const filename = imagePath.split('/').pop();
  return imageMapper[filename] || product1;
};

export default imageMapper;