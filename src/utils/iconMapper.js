import { FaTools, FaUtensils, FaLaptop, FaTshirt, FaBook, FaShoppingBag, FaHome, FaCar, FaGamepad, FaCamera, FaMobile, FaHeadphones } from 'react-icons/fa';
import { FiGrid, FiPackage, FiUsers, FiImage, FiSettings, FiTool } from 'react-icons/fi';

export const iconMapper = {
  'FaTools': FaTools,
  'FaUtensils': FaUtensils,
  'FaLaptop': FaLaptop,
  'FaTshirt': FaTshirt,
  'FaBook': FaBook,
  'FaShoppingBag': FaShoppingBag,
  'FaHome': FaHome,
  'FaCar': FaCar,
  'FaGamepad': FaGamepad,
  'FaCamera': FaCamera,
  'FaMobile': FaMobile,
  'FaHeadphones': FaHeadphones,
  'FiGrid': FiGrid,
  'FiPackage': FiPackage,
  'FiUsers': FiUsers,
  'FiImage': FiImage,
  'FiSettings': FiSettings,
  'FiTool': FiTool,
};

export const getIcon = (iconName) => {
  return iconMapper[iconName] || FaShoppingBag;
};

export default iconMapper;