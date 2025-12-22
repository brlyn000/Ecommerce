-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 22, 2025 at 07:07 AM
-- Server version: 12.0.2-MariaDB
-- PHP Version: 8.4.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `e-commerce`
--

-- --------------------------------------------------------

--
-- Table structure for table `carousel`
--

CREATE TABLE `carousel` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `button_text` varchar(100) DEFAULT NULL,
  `button_link` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `carousel`
--

INSERT INTO `carousel` (`id`, `title`, `description`, `image`, `button_text`, `button_link`, `created_at`) VALUES
(1, 'Selamat Datang di E-Kraft', 'Temukan produk berkualitas untuk kebutuhan Anda', 'http://localhost:5006/uploads/carousel/image-1760098186827-687204851.jpg', 'Jelajahi Produk', '#', '2025-12-02 06:43:02');

-- --------------------------------------------------------

--
-- Table structure for table `carousel_items`
--

CREATE TABLE `carousel_items` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 1,
  `button_text` varchar(50) DEFAULT NULL,
  `button_link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `carousel_items`
--

INSERT INTO `carousel_items` (`id`, `title`, `description`, `image`, `active`, `display_order`, `button_text`, `button_link`, `created_at`) VALUES
(4, 'Menu Terbaru', 'Nasi Kuning + Es Blewah hanya 10k rupiah', 'http://localhost:5006/uploads/carousel/carousel-1766338728377-130203252.png', 1, 1, 'Shop Now', '/products', '2025-12-21 17:39:30');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `link` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `icon`, `link`, `created_at`) VALUES
(1, 'Tools', 'Peralatan dan teknologi terkini', 'FaTools', '/category/tools', '2025-12-01 13:53:23'),
(2, 'Food', 'Makanan dan minuman berkualitas', 'FaUtensils', '/category/food', '2025-12-01 13:53:23'),
(3, 'Digital Product', 'Produk digital dan elektronik', 'FaLaptop', '/category/digital-product', '2025-12-01 13:53:23'),
(4, 'Fashion', 'Pakaian dan aksesoris trendy', 'FaTshirt', '/category/fashion', '2025-12-01 13:53:23'),
(5, 'Books', 'Buku dan media pembelajaran', 'FaBook', '/category/books', '2025-12-01 13:53:23');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `comment` text NOT NULL,
  `rating` int(11) DEFAULT 5,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `comment_type` enum('review','comment') DEFAULT 'comment',
  `user_id` int(11) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `product_id`, `name`, `email`, `comment`, `rating`, `created_at`, `comment_type`, `user_id`, `is_verified`) VALUES
(12, 5, 'Regular User', 'user@ekraft.com', '---', 4, '2025-12-05 09:12:50', 'review', 3, 0),
(14, 5, 'Regular User', 'user@ekraft.com', 'tes', 5, '2025-12-05 10:11:23', 'comment', 3, 0),
(15, 5, 'Regular User', 'user@ekraft.com', 'sss', 3, '2025-12-05 10:21:41', 'review', 3, 0),
(16, 5, 'Regular User', 'user@ekraft.com', 'tttt', 5, '2025-12-05 10:58:25', 'comment', 3, 0),
(19, 7, 'Regular User', 'user@ekraft.com', 'soalnya babi halal', 2, '2025-12-05 17:50:22', 'review', 3, 0),
(20, 6, 'Regular User', 'user@ekraft.com', 'AAA', 5, '2025-12-05 18:16:25', 'review', 3, 0),
(23, 5, 'Regular User', 'user@ekraft.com', 'tes', 5, '2025-12-08 05:04:02', 'comment', 3, 0);

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(200) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('new','read','replied') DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `name`, `email`, `subject`, `message`, `status`, `created_at`) VALUES
(1, 'hallooooo', 'asdasdasdasdsa@gmail.com', 'asdasdasda', 'asdasdasdasdasd', 'replied', '2025-12-09 12:06:27');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `type` enum('comment','checkout','order','like','review') NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `order_id` varchar(50) DEFAULT NULL,
  `message` text NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('pending','accepted','completed','confirmed','rejected','disputed','mixed') DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_id`, `user_id`, `customer_name`, `total`, `status`, `rejection_reason`, `created_at`) VALUES
(30, 'ORD1764925747934', 3, 'Regular User', 180000.00, 'confirmed', NULL, '2025-12-05 09:09:07'),
(31, 'ORD1764925906047', 3, 'Regular User', 180000.00, 'confirmed', NULL, '2025-12-05 09:11:46'),
(32, 'ORD1764926057150', 3, 'Regular User', 720000.00, 'confirmed', NULL, '2025-12-05 09:14:17'),
(33, 'ORD1764929516261', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 10:11:56'),
(34, 'ORD1764929567682', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 10:12:47'),
(35, 'ORD1764929660953', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 10:14:20'),
(36, 'ORD1764929664107', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 10:14:24'),
(37, 'ORD1764929701934', 3, 'Regular User', 360000.00, 'confirmed', NULL, '2025-12-05 10:15:01'),
(38, 'ORD1764929748605', 3, 'Regular User', 360000.00, 'confirmed', NULL, '2025-12-05 10:15:48'),
(39, 'ORD1764930916050', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 10:35:16'),
(40, 'ORD1764930949083', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 10:35:49'),
(41, 'ORD1764930999660', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 10:36:39'),
(42, 'ORD1764931041389', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 10:37:21'),
(43, 'ORD1764931140653', 3, 'Regular User', 360000.00, 'pending', NULL, '2025-12-05 10:39:00'),
(44, 'ORD1764931301026', 3, 'Regular User', 540000.00, 'pending', NULL, '2025-12-05 10:41:41'),
(45, 'ORD1764931405361', 3, 'Regular User', 540000.00, 'pending', NULL, '2025-12-05 10:43:25'),
(46, 'ORD1764931912097', 3, 'Regular User', 3600000.00, 'confirmed', NULL, '2025-12-05 10:51:52'),
(47, 'ORD1764931965783', 3, 'Regular User', 360000.00, 'pending', NULL, '2025-12-05 10:52:45'),
(48, 'ORD1764932180267', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 10:56:20'),
(49, 'ORD1764932296034', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 10:58:16'),
(50, 'ORD1764952351530', 3, 'Regular User', 58800.00, 'confirmed', NULL, '2025-12-05 16:32:31'),
(51, 'ORD1764952608720', 3, 'Regular User', 19600.00, 'confirmed', NULL, '2025-12-05 16:36:48'),
(52, 'ORD1764954664185', 3, 'Regular User', 19600.00, 'confirmed', NULL, '2025-12-05 17:11:04'),
(53, 'ORD1764956970741', 3, 'Regular User', 213300.00, 'confirmed', NULL, '2025-12-05 17:49:30'),
(54, 'ORD1764957056871', 3, 'Regular User', 19600.00, 'confirmed', NULL, '2025-12-05 17:50:56'),
(55, 'ORD1764957127234', 3, 'Regular User', 199600.00, 'confirmed', NULL, '2025-12-05 17:52:07'),
(56, 'ORD1764957365850', 3, 'Regular User', 142200.00, 'confirmed', NULL, '2025-12-05 17:56:05'),
(57, 'ORD1764957423660', 3, 'Regular User', 509500.00, 'confirmed', NULL, '2025-12-05 17:57:03'),
(58, 'ORD1764957789311', 3, 'Regular User', 720000.00, 'accepted', NULL, '2025-12-05 18:03:09'),
(59, 'ORD1764957789320', 3, 'Regular User', 201000.00, 'confirmed', NULL, '2025-12-05 18:03:09'),
(60, 'ORD1764957914570', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 18:05:14'),
(61, 'ORD1764957914586', 3, 'Regular User', 90700.00, 'accepted', NULL, '2025-12-05 18:05:14'),
(62, 'ORD1764958017175', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 18:06:57'),
(63, 'ORD1764958017183', 3, 'Regular User', 90700.00, 'confirmed', NULL, '2025-12-05 18:06:57'),
(64, 'ORD1764958218041', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 18:10:18'),
(65, 'ORD1764958218051', 3, 'Regular User', 90700.00, 'confirmed', NULL, '2025-12-05 18:10:18'),
(66, 'ORD1764958318685', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 18:11:58'),
(67, 'ORD1764958318694', 3, 'Regular User', 90700.00, 'confirmed', NULL, '2025-12-05 18:11:58'),
(68, 'ORD1764958867414', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 18:21:07'),
(69, 'ORD1764958867422', 3, 'Regular User', 90700.00, 'pending', NULL, '2025-12-05 18:21:07'),
(70, 'ORD1764958973819', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 18:22:53'),
(71, 'ORD1764958973826', 3, 'Regular User', 90700.00, 'mixed', NULL, '2025-12-05 18:22:53'),
(72, 'ORD1764960237346', 3, 'Regular User', 71100.00, 'pending', NULL, '2025-12-05 18:43:57'),
(73, 'ORD1764960269745', 3, 'Regular User', 71100.00, 'pending', NULL, '2025-12-05 18:44:29'),
(74, 'ORD1764960449386', 3, 'Regular User', 71100.00, 'pending', NULL, '2025-12-05 18:47:29'),
(75, 'ORD1764960599388', 3, 'Regular User', 71100.00, 'pending', NULL, '2025-12-05 18:49:59'),
(76, 'ORD1764960634743', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-05 18:50:34'),
(77, 'ORD1764960634756', 3, 'Regular User', 90700.00, 'pending', NULL, '2025-12-05 18:50:34'),
(78, 'ORD1764960716342', 3, 'Regular User', 71100.00, 'pending', NULL, '2025-12-05 18:51:56'),
(79, 'ORD1765170223992', 3, 'Regular User', 180000.00, 'pending', NULL, '2025-12-08 05:03:43');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('pending','accepted','completed','confirmed','rejected','disputed') DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `status`, `rejection_reason`) VALUES
(30, 'ORD1764925747934', 5, 1, 300000.00, 'confirmed', NULL),
(31, 'ORD1764925906047', 5, 1, 300000.00, 'confirmed', NULL),
(32, 'ORD1764926057150', 5, 4, 300000.00, 'confirmed', NULL),
(33, 'ORD1764929516261', 5, 1, 300000.00, 'pending', NULL),
(34, 'ORD1764929567682', 5, 1, 300000.00, 'pending', NULL),
(35, 'ORD1764929660953', 5, 1, 300000.00, 'pending', NULL),
(36, 'ORD1764929664107', 5, 1, 300000.00, 'pending', NULL),
(37, 'ORD1764929701934', 5, 2, 300000.00, 'confirmed', NULL),
(38, 'ORD1764929748605', 5, 2, 300000.00, 'confirmed', NULL),
(39, 'ORD1764930916050', 5, 1, 300000.00, 'pending', NULL),
(40, 'ORD1764930949083', 5, 1, 300000.00, 'pending', NULL),
(41, 'ORD1764930999660', 5, 1, 300000.00, 'pending', NULL),
(42, 'ORD1764931041389', 5, 1, 300000.00, 'pending', NULL),
(43, 'ORD1764931140653', 5, 2, 300000.00, 'pending', NULL),
(44, 'ORD1764931301026', 5, 3, 300000.00, 'pending', NULL),
(45, 'ORD1764931405361', 5, 3, 180000.00, 'pending', NULL),
(46, 'ORD1764931912097', 5, 20, 180000.00, 'confirmed', NULL),
(47, 'ORD1764931965783', 5, 2, 180000.00, 'pending', NULL),
(48, 'ORD1764932180267', 5, 1, 180000.00, 'pending', NULL),
(49, 'ORD1764932296034', 5, 1, 180000.00, 'pending', NULL),
(50, 'ORD1764952351530', 6, 3, 19600.00, 'confirmed', NULL),
(51, 'ORD1764952608720', 6, 1, 19600.00, 'confirmed', NULL),
(52, 'ORD1764954664185', 6, 1, 19600.00, 'confirmed', NULL),
(53, 'ORD1764956970741', 7, 3, 71100.00, 'confirmed', NULL),
(54, 'ORD1764957056871', 6, 1, 19600.00, 'confirmed', NULL),
(55, 'ORD1764957127234', 6, 1, 19600.00, 'confirmed', NULL),
(56, 'ORD1764957127234', 5, 1, 180000.00, 'confirmed', NULL),
(57, 'ORD1764957365850', 7, 2, 71100.00, 'confirmed', NULL),
(58, 'ORD1764957423660', 7, 1, 71100.00, 'confirmed', NULL),
(59, 'ORD1764957423660', 5, 2, 180000.00, 'confirmed', NULL),
(60, 'ORD1764957423660', 6, 4, 19600.00, 'confirmed', NULL),
(61, 'ORD1764957789311', 5, 4, 180000.00, 'accepted', NULL),
(62, 'ORD1764957789320', 7, 2, 71100.00, 'confirmed', NULL),
(63, 'ORD1764957789320', 6, 3, 19600.00, 'confirmed', NULL),
(64, 'ORD1764957914570', 5, 1, 180000.00, 'pending', NULL),
(65, 'ORD1764957914586', 7, 1, 71100.00, 'accepted', NULL),
(66, 'ORD1764957914586', 6, 1, 19600.00, 'accepted', NULL),
(67, 'ORD1764958017175', 5, 1, 180000.00, 'pending', NULL),
(68, 'ORD1764958017183', 7, 1, 71100.00, 'accepted', NULL),
(69, 'ORD1764958017183', 6, 1, 19600.00, 'accepted', NULL),
(70, 'ORD1764958218041', 5, 1, 180000.00, 'pending', NULL),
(71, 'ORD1764958218051', 7, 1, 71100.00, 'confirmed', NULL),
(72, 'ORD1764958218051', 6, 1, 19600.00, 'confirmed', NULL),
(73, 'ORD1764958318685', 5, 1, 180000.00, 'pending', NULL),
(74, 'ORD1764958318694', 7, 1, 71100.00, 'confirmed', NULL),
(75, 'ORD1764958318694', 6, 1, 19600.00, 'confirmed', NULL),
(76, 'ORD1764958867414', 5, 1, 180000.00, 'pending', NULL),
(77, 'ORD1764958867422', 7, 1, 71100.00, 'pending', NULL),
(78, 'ORD1764958867422', 6, 1, 19600.00, 'pending', NULL),
(79, 'ORD1764958973819', 5, 1, 180000.00, 'pending', NULL),
(80, 'ORD1764958973826', 7, 1, 71100.00, 'completed', NULL),
(81, 'ORD1764958973826', 6, 1, 19600.00, 'pending', NULL),
(82, 'ORD1764960237346', 7, 1, 71100.00, 'pending', NULL),
(83, 'ORD1764960269745', 7, 1, 71100.00, 'pending', NULL),
(84, 'ORD1764960449386', 7, 1, 71100.00, 'pending', NULL),
(85, 'ORD1764960599388', 7, 1, 71100.00, 'pending', NULL),
(86, 'ORD1764960634743', 5, 1, 180000.00, 'pending', NULL),
(87, 'ORD1764960634756', 7, 1, 71100.00, 'pending', NULL),
(88, 'ORD1764960634756', 6, 1, 19600.00, 'pending', NULL),
(89, 'ORD1764960716342', 7, 1, 71100.00, 'pending', NULL),
(90, 'ORD1765170223992', 5, 1, 180000.00, 'pending', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `long_description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `rating` int(11) DEFAULT 0,
  `stock_status` enum('available','limited','sold-out') DEFAULT 'available',
  `stock` int(11) DEFAULT 0,
  `category_id` int(11) DEFAULT NULL,
  `discount` varchar(10) DEFAULT NULL,
  `whatsapp` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `likes_count` int(11) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `long_description`, `price`, `image`, `rating`, `stock_status`, `stock`, `category_id`, `discount`, `whatsapp`, `created_at`, `likes_count`, `created_by`) VALUES
(5, 'AS', 'ASDF34REFDFS', NULL, 300000.00, '/uploads/products/image-1764846659753-760713642.jpg', 0, 'sold-out', 0, 2, '40', 'https://dasdad', '2025-12-04 11:10:59', 1, 2),
(6, 'Barang ilegal tapi ws legal', 'lorem 12 kali bang', 'lorem 12 kali bang tapi lebih detail', 20000.00, '/uploads/products/image-1764952304781-995651849.webp', 5, 'sold-out', 0, 5, '2', 'https://wa.me/628123456789', '2025-12-05 16:31:44', 1, 7),
(7, 'Semuanya halal kecuali babi', 'lorem ipsum dolor sit amet consectur adipsinc', 'lorem ipsum dolor sit amet consectur adipsinc sama aja cuman lebih banyak', 90000.00, '/uploads/products/product-1764956954525-949851536.png', 2, 'available', 103, 1, '21', 'https://apajalah', '2025-12-05 17:49:14', 1, 7);

-- --------------------------------------------------------

--
-- Table structure for table `product_likes`
--

CREATE TABLE `product_likes` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_likes`
--

INSERT INTO `product_likes` (`id`, `product_id`, `user_id`, `created_at`) VALUES
(73, 5, 3, '2025-12-05 10:58:10'),
(76, 6, 3, '2025-12-05 18:58:28'),
(80, 7, 3, '2025-12-09 11:57:46');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','tenant','user') DEFAULT 'user',
  `full_name` varchar(100) DEFAULT NULL,
  `store_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `payment_methods` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payment_methods`)),
  `contact_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`contact_info`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `full_name`, `store_name`, `phone`, `address`, `status`, `created_at`, `updated_at`, `payment_methods`, `contact_info`) VALUES
(1, 'admin', 'admin@ekraft.com', '$2b$10$lsLum7ExNFcpeH6bOqUv7Of/iWcXzHosAPyY1UYj0JMV2DuNmiwT.', 'admin', 'Administrator', NULL, NULL, NULL, 'active', '2025-12-01 13:59:14', '2025-12-04 11:16:30', NULL, NULL),
(2, 'tenant1', 'tenant@ekraf.com', '$2b$10$gWledUx.iWBe0PHFfwGduu90/8nYHRJyZaQ7EXHTqx9GoUiPNeOzK', 'tenant', 'Badan Eksekutif Mahasiswa Divisi EKRAF', 'EKRAF STORE', NULL, NULL, 'active', '2025-12-01 13:59:14', '2025-12-08 06:15:19', NULL, NULL),
(3, 'user1', 'user@ekraft.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Brillianhernandez', NULL, '', '', 'active', '2025-12-01 13:59:14', '2025-12-08 05:13:49', NULL, NULL),
(4, 'newuser', 'newuser@test.com', '$2b$10$TNrVk4HrZS7BtxdoKqbAL.33.68cag31ciPTuYYtV7yNEJVgRj3hS', 'user', 'New User', NULL, NULL, NULL, 'active', '2025-12-02 07:11:25', '2025-12-02 07:11:25', NULL, NULL),
(5, 'newtenant', 'tenant@test.com', '$2b$10$dQd7MWWHwwwggKhN8J4w2uiWd3KRfeFZGSunijdtE1VoAkyhN4bqK', 'tenant', 'New Tenant', NULL, '081234567890', 'Jl. Test No. 1', 'active', '2025-12-02 07:11:36', '2025-12-02 07:11:36', NULL, NULL),
(7, 'Arifin', 'arifin@gmail.com', '$2b$10$7ft/DhX8dqqBxo8XjqVGPu3sQkJxLg5/V2P.phT9yiFwOioXCkxvG', 'tenant', 'Muhammad Arifin', NULL, '0881025097388', 'Gresik, Jawa Timur', 'active', '2025-12-05 12:53:00', '2025-12-17 02:35:46', '{\"dana\":{\"enabled\":true,\"number\":\"088102783189\"},\"ovo\":{\"enabled\":false,\"number\":\"\"},\"shopeepay\":{\"enabled\":true,\"number\":\"123424234234\"},\"bca\":{\"enabled\":false,\"number\":\"\",\"name\":\"\"},\"bri\":{\"enabled\":false,\"number\":\"\",\"name\":\"\"},\"mandiri\":{\"enabled\":false,\"number\":\"\",\"name\":\"\"},\"qris\":{\"enabled\":true,\"image\":\"/uploads/qris/qris-1764956361710-143075496.png\"}}', '{\"whatsapp\":\"62881025097388\",\"instagram\":\"brlyn.dv\"}'),
(8, 'tenant2', 'tenant2@gmail.com', '$2b$10$I.R/JZe0ezvSyv1P0gK1FOpvkcmpB.kxMivjduMFdekZuEQK4WWmS', 'tenant', 'tenant', NULL, '01883239834', NULL, 'active', '2025-12-08 07:17:04', '2025-12-08 07:17:04', NULL, NULL),
(9, 'tenant3', 'tenant3@gmail.com', '$2b$10$rMOccp0Lj/4/MZYkVSV1uuKQQIqIwCKX.Lq3bTNLirlbHtikK4VJq', 'tenant', 'full name', NULL, '08810029292', NULL, 'active', '2025-12-08 07:24:05', '2025-12-08 07:24:05', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carousel`
--
ALTER TABLE `carousel`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `carousel_items`
--
ALTER TABLE `carousel_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tenant_id` (`tenant_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_order_id` (`order_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `product_likes`
--
ALTER TABLE `product_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`product_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `carousel`
--
ALTER TABLE `carousel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `carousel_items`
--
ALTER TABLE `carousel_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product_likes`
--
ALTER TABLE `product_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_likes`
--
ALTER TABLE `product_likes`
  ADD CONSTRAINT `product_likes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
