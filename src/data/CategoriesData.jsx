import { FaTools, FaLaptopCode, FaPalette } from 'react-icons/fa';
import { FaBurger, FaShirt, FaBook } from 'react-icons/fa6';

const CategoriesData = [
  {
    id: 1,
    name: 'Food',
    description: 'Berbagai macam makanan dan minuman lezat untuk setiap kesempatan.',
    icon: FaBurger,
    link: '/category/food'
  },
  {
    id: 2,
    name: 'Digital Product',
    description: 'Produk digital inovatif termasuk software, template, dan aset kreatif.',
    icon: FaLaptopCode,
    link: '/category/digital-product'
  },
  {
    id: 3,
    name: 'Tools',
    description: 'Peralatan berkualitas untuk kebutuhan rumah tangga dan profesional.',
    icon: FaTools,
    link: '/category/tools'
  },
  {
    id: 4,
    name: 'Fashion',
    description: 'Pakaian dan aksesoris trendy untuk gaya sehari-hari.',
    icon: FaShirt,
    link: '/category/fashion'
  },
  {
    id: 5,
    name: 'Books',
    description: 'Koleksi buku dari berbagai genre untuk hiburan dan pengetahuan.',
    icon: FaBook,
    link: '/category/books'
  }
];

export default CategoriesData;