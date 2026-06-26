-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: e-commerce
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carousel`
--

DROP TABLE IF EXISTS `carousel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carousel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_text` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carousel`
--

LOCK TABLES `carousel` WRITE;
/*!40000 ALTER TABLE `carousel` DISABLE KEYS */;
INSERT INTO `carousel` VALUES (1,'Selamat Datang di E-Kraft','Temukan produk berkualitas untuk kebutuhan Anda','http://localhost:5006/uploads/carousel/image-1760098186827-687204851.jpg','Jelajahi Produk','#','2025-12-02 06:43:02');
/*!40000 ALTER TABLE `carousel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carousel_items`
--

DROP TABLE IF EXISTS `carousel_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carousel_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `display_order` int DEFAULT '1',
  `button_text` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carousel_items`
--

LOCK TABLES `carousel_items` WRITE;
/*!40000 ALTER TABLE `carousel_items` DISABLE KEYS */;
INSERT INTO `carousel_items` VALUES (4,'Menu Terbaru','Nasi Kuning + Es Blewah hanya 10k rupiah','http://localhost:5006/uploads/carousel/carousel-1766338728377-130203252.png',1,1,'Shop Now','/products','2025-12-21 17:39:30');
/*!40000 ALTER TABLE `carousel_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Tools','Peralatan dan teknologi terkini','FaTools','/category/tools','2025-12-01 13:53:23'),(2,'Food','Makanan dan minuman berkualitas','FaUtensils','/category/food','2025-12-01 13:53:23'),(3,'Digital Product','Produk digital dan elektronik','FaLaptop','/category/digital-product','2025-12-01 13:53:23'),(4,'Fashion','Pakaian dan aksesoris trendy','FaTshirt','/category/fashion','2025-12-01 13:53:23'),(5,'Books','Buku dan media pembelajaran','FaBook','/category/books','2025-12-01 13:53:23');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int DEFAULT '5',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `comment_type` enum('review','comment') COLLATE utf8mb4_unicode_ci DEFAULT 'comment',
  `user_id` int DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (12,5,'Regular User','user@ekraft.com','---',4,'2025-12-05 09:12:50','review',3,0),(14,5,'Regular User','user@ekraft.com','tes',5,'2025-12-05 10:11:23','comment',3,0),(15,5,'Regular User','user@ekraft.com','sss',3,'2025-12-05 10:21:41','review',3,0),(16,5,'Regular User','user@ekraft.com','tttt',5,'2025-12-05 10:58:25','comment',3,0),(19,7,'Regular User','user@ekraft.com','soalnya babi halal',2,'2025-12-05 17:50:22','review',3,0),(20,6,'Regular User','user@ekraft.com','AAA',5,'2025-12-05 18:16:25','review',3,0),(23,5,'Regular User','user@ekraft.com','tes',5,'2025-12-08 05:04:02','comment',3,0);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `status` enum('new','read','replied') COLLATE utf8mb4_unicode_ci DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,'hallooooo','asdasdasdasdsa@gmail.com','asdasdasda','asdasdasdasdasd','replied','2025-12-09 12:06:27');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('comment','checkout','order','like','review') NOT NULL,
  `tenant_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `order_id` varchar(50) DEFAULT NULL,
  `message` text NOT NULL,
  `data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('pending','accepted','completed','confirmed','rejected','disputed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (30,'ORD1764925747934',5,1,300000.00,'confirmed',NULL,NULL),(31,'ORD1764925906047',5,1,300000.00,'confirmed',NULL,NULL),(32,'ORD1764926057150',5,4,300000.00,'confirmed',NULL,NULL),(33,'ORD1764929516261',5,1,300000.00,'pending',NULL,NULL),(34,'ORD1764929567682',5,1,300000.00,'pending',NULL,NULL),(35,'ORD1764929660953',5,1,300000.00,'pending',NULL,NULL),(36,'ORD1764929664107',5,1,300000.00,'pending',NULL,NULL),(37,'ORD1764929701934',5,2,300000.00,'confirmed',NULL,NULL),(38,'ORD1764929748605',5,2,300000.00,'confirmed',NULL,NULL),(39,'ORD1764930916050',5,1,300000.00,'pending',NULL,NULL),(40,'ORD1764930949083',5,1,300000.00,'pending',NULL,NULL),(41,'ORD1764930999660',5,1,300000.00,'pending',NULL,NULL),(42,'ORD1764931041389',5,1,300000.00,'pending',NULL,NULL),(43,'ORD1764931140653',5,2,300000.00,'pending',NULL,NULL),(44,'ORD1764931301026',5,3,300000.00,'pending',NULL,NULL),(45,'ORD1764931405361',5,3,180000.00,'pending',NULL,NULL),(46,'ORD1764931912097',5,20,180000.00,'confirmed',NULL,NULL),(47,'ORD1764931965783',5,2,180000.00,'pending',NULL,NULL),(48,'ORD1764932180267',5,1,180000.00,'pending',NULL,NULL),(49,'ORD1764932296034',5,1,180000.00,'pending',NULL,NULL),(50,'ORD1764952351530',6,3,19600.00,'confirmed',NULL,NULL),(51,'ORD1764952608720',6,1,19600.00,'confirmed',NULL,NULL),(52,'ORD1764954664185',6,1,19600.00,'confirmed',NULL,NULL),(53,'ORD1764956970741',7,3,71100.00,'confirmed',NULL,NULL),(54,'ORD1764957056871',6,1,19600.00,'confirmed',NULL,NULL),(55,'ORD1764957127234',6,1,19600.00,'confirmed',NULL,NULL),(56,'ORD1764957127234',5,1,180000.00,'confirmed',NULL,NULL),(57,'ORD1764957365850',7,2,71100.00,'confirmed',NULL,NULL),(58,'ORD1764957423660',7,1,71100.00,'confirmed',NULL,NULL),(59,'ORD1764957423660',5,2,180000.00,'confirmed',NULL,NULL),(60,'ORD1764957423660',6,4,19600.00,'confirmed',NULL,NULL),(61,'ORD1764957789311',5,4,180000.00,'accepted',NULL,NULL),(62,'ORD1764957789320',7,2,71100.00,'confirmed',NULL,NULL),(63,'ORD1764957789320',6,3,19600.00,'confirmed',NULL,NULL),(64,'ORD1764957914570',5,1,180000.00,'pending',NULL,NULL),(65,'ORD1764957914586',7,1,71100.00,'accepted',NULL,NULL),(66,'ORD1764957914586',6,1,19600.00,'accepted',NULL,NULL),(67,'ORD1764958017175',5,1,180000.00,'pending',NULL,NULL),(68,'ORD1764958017183',7,1,71100.00,'accepted',NULL,NULL),(69,'ORD1764958017183',6,1,19600.00,'accepted',NULL,NULL),(70,'ORD1764958218041',5,1,180000.00,'pending',NULL,NULL),(71,'ORD1764958218051',7,1,71100.00,'confirmed',NULL,NULL),(72,'ORD1764958218051',6,1,19600.00,'confirmed',NULL,NULL),(73,'ORD1764958318685',5,1,180000.00,'pending',NULL,NULL),(74,'ORD1764958318694',7,1,71100.00,'confirmed',NULL,NULL),(75,'ORD1764958318694',6,1,19600.00,'confirmed',NULL,NULL),(76,'ORD1764958867414',5,1,180000.00,'pending',NULL,NULL),(77,'ORD1764958867422',7,1,71100.00,'pending',NULL,NULL),(78,'ORD1764958867422',6,1,19600.00,'pending',NULL,NULL),(79,'ORD1764958973819',5,1,180000.00,'pending',NULL,NULL),(80,'ORD1764958973826',7,1,71100.00,'completed',NULL,NULL),(81,'ORD1764958973826',6,1,19600.00,'pending',NULL,NULL),(82,'ORD1764960237346',7,1,71100.00,'pending',NULL,NULL),(83,'ORD1764960269745',7,1,71100.00,'pending',NULL,NULL),(84,'ORD1764960449386',7,1,71100.00,'pending',NULL,NULL),(85,'ORD1764960599388',7,1,71100.00,'pending',NULL,NULL),(86,'ORD1764960634743',5,1,180000.00,'pending',NULL,NULL),(87,'ORD1764960634756',7,1,71100.00,'pending',NULL,NULL),(88,'ORD1764960634756',6,1,19600.00,'pending',NULL,NULL),(89,'ORD1764960716342',7,1,71100.00,'pending',NULL,NULL),(90,'ORD1765170223992',5,1,180000.00,'pending',NULL,NULL);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('pending','accepted','completed','confirmed','rejected','disputed','mixed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (30,'ORD1764925747934',3,'Regular User',180000.00,'confirmed',NULL,'2025-12-05 09:09:07'),(31,'ORD1764925906047',3,'Regular User',180000.00,'confirmed',NULL,'2025-12-05 09:11:46'),(32,'ORD1764926057150',3,'Regular User',720000.00,'confirmed',NULL,'2025-12-05 09:14:17'),(33,'ORD1764929516261',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 10:11:56'),(34,'ORD1764929567682',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 10:12:47'),(35,'ORD1764929660953',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 10:14:20'),(36,'ORD1764929664107',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 10:14:24'),(37,'ORD1764929701934',3,'Regular User',360000.00,'confirmed',NULL,'2025-12-05 10:15:01'),(38,'ORD1764929748605',3,'Regular User',360000.00,'confirmed',NULL,'2025-12-05 10:15:48'),(39,'ORD1764930916050',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 10:35:16'),(40,'ORD1764930949083',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 10:35:49'),(41,'ORD1764930999660',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 10:36:39'),(42,'ORD1764931041389',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 10:37:21'),(43,'ORD1764931140653',3,'Regular User',360000.00,'pending',NULL,'2025-12-05 10:39:00'),(44,'ORD1764931301026',3,'Regular User',540000.00,'pending',NULL,'2025-12-05 10:41:41'),(45,'ORD1764931405361',3,'Regular User',540000.00,'pending',NULL,'2025-12-05 10:43:25'),(46,'ORD1764931912097',3,'Regular User',3600000.00,'confirmed',NULL,'2025-12-05 10:51:52'),(47,'ORD1764931965783',3,'Regular User',360000.00,'pending',NULL,'2025-12-05 10:52:45'),(48,'ORD1764932180267',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 10:56:20'),(49,'ORD1764932296034',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 10:58:16'),(50,'ORD1764952351530',3,'Regular User',58800.00,'confirmed',NULL,'2025-12-05 16:32:31'),(51,'ORD1764952608720',3,'Regular User',19600.00,'confirmed',NULL,'2025-12-05 16:36:48'),(52,'ORD1764954664185',3,'Regular User',19600.00,'confirmed',NULL,'2025-12-05 17:11:04'),(53,'ORD1764956970741',3,'Regular User',213300.00,'confirmed',NULL,'2025-12-05 17:49:30'),(54,'ORD1764957056871',3,'Regular User',19600.00,'confirmed',NULL,'2025-12-05 17:50:56'),(55,'ORD1764957127234',3,'Regular User',199600.00,'confirmed',NULL,'2025-12-05 17:52:07'),(56,'ORD1764957365850',3,'Regular User',142200.00,'confirmed',NULL,'2025-12-05 17:56:05'),(57,'ORD1764957423660',3,'Regular User',509500.00,'confirmed',NULL,'2025-12-05 17:57:03'),(58,'ORD1764957789311',3,'Regular User',720000.00,'accepted',NULL,'2025-12-05 18:03:09'),(59,'ORD1764957789320',3,'Regular User',201000.00,'confirmed',NULL,'2025-12-05 18:03:09'),(60,'ORD1764957914570',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 18:05:14'),(61,'ORD1764957914586',3,'Regular User',90700.00,'accepted',NULL,'2025-12-05 18:05:14'),(62,'ORD1764958017175',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 18:06:57'),(63,'ORD1764958017183',3,'Regular User',90700.00,'confirmed',NULL,'2025-12-05 18:06:57'),(64,'ORD1764958218041',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 18:10:18'),(65,'ORD1764958218051',3,'Regular User',90700.00,'confirmed',NULL,'2025-12-05 18:10:18'),(66,'ORD1764958318685',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 18:11:58'),(67,'ORD1764958318694',3,'Regular User',90700.00,'confirmed',NULL,'2025-12-05 18:11:58'),(68,'ORD1764958867414',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 18:21:07'),(69,'ORD1764958867422',3,'Regular User',90700.00,'pending',NULL,'2025-12-05 18:21:07'),(70,'ORD1764958973819',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 18:22:53'),(71,'ORD1764958973826',3,'Regular User',90700.00,'mixed',NULL,'2025-12-05 18:22:53'),(72,'ORD1764960237346',3,'Regular User',71100.00,'pending',NULL,'2025-12-05 18:43:57'),(73,'ORD1764960269745',3,'Regular User',71100.00,'pending',NULL,'2025-12-05 18:44:29'),(74,'ORD1764960449386',3,'Regular User',71100.00,'pending',NULL,'2025-12-05 18:47:29'),(75,'ORD1764960599388',3,'Regular User',71100.00,'pending',NULL,'2025-12-05 18:49:59'),(76,'ORD1764960634743',3,'Regular User',180000.00,'pending',NULL,'2025-12-05 18:50:34'),(77,'ORD1764960634756',3,'Regular User',90700.00,'pending',NULL,'2025-12-05 18:50:34'),(78,'ORD1764960716342',3,'Regular User',71100.00,'pending',NULL,'2025-12-05 18:51:56'),(79,'ORD1765170223992',3,'Regular User',180000.00,'pending',NULL,'2025-12-08 05:03:43');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_likes`
--

DROP TABLE IF EXISTS `product_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`product_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `product_likes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_likes`
--

LOCK TABLES `product_likes` WRITE;
/*!40000 ALTER TABLE `product_likes` DISABLE KEYS */;
INSERT INTO `product_likes` VALUES (73,5,3,'2025-12-05 10:58:10'),(76,6,3,'2025-12-05 18:58:28'),(80,7,3,'2025-12-09 11:57:46');
/*!40000 ALTER TABLE `product_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `long_description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int DEFAULT '0',
  `stock_status` enum('available','limited','sold-out') COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `stock` int DEFAULT '0',
  `category_id` int DEFAULT NULL,
  `discount` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `likes_count` int DEFAULT '0',
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (5,'AS','ASDF34REFDFS',NULL,300000.00,'/uploads/products/image-1764846659753-760713642.jpg',0,'sold-out',0,2,'40','https://dasdad','2025-12-04 11:10:59',1,2),(6,'Barang ilegal tapi ws legal','lorem 12 kali bang','lorem 12 kali bang tapi lebih detail',20000.00,'/uploads/products/image-1764952304781-995651849.webp',5,'sold-out',0,5,'2','https://wa.me/628123456789','2025-12-05 16:31:44',1,7),(7,'Semuanya halal kecuali babi','lorem ipsum dolor sit amet consectur adipsinc','lorem ipsum dolor sit amet consectur adipsinc sama aja cuman lebih banyak',90000.00,'/uploads/products/product-1764956954525-949851536.png',2,'available',103,1,'21','https://apajalah','2025-12-05 17:49:14',1,7);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','tenant','user') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `store_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_methods` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `contact_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nim` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `student_card_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `users_chk_1` CHECK (json_valid(`payment_methods`)),
  CONSTRAINT `users_chk_2` CHECK (json_valid(`contact_info`))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@ekraft.com','$2b$10$lsLum7ExNFcpeH6bOqUv7Of/iWcXzHosAPyY1UYj0JMV2DuNmiwT.','admin','Administrator',NULL,NULL,NULL,'active','2025-12-01 13:59:14','2025-12-04 11:16:30',NULL,NULL,NULL,NULL,NULL),(2,'tenant1','tenant@ekraf.com','$2b$10$gWledUx.iWBe0PHFfwGduu90/8nYHRJyZaQ7EXHTqx9GoUiPNeOzK','tenant','Badan Eksekutif Mahasiswa Divisi EKRAF','EKRAF STORE',NULL,NULL,'active','2025-12-01 13:59:14','2025-12-08 06:15:19',NULL,NULL,NULL,NULL,NULL),(3,'user1','user@ekraft.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','user','Brillianhernandez',NULL,'','','active','2025-12-01 13:59:14','2025-12-08 05:13:49',NULL,NULL,NULL,NULL,NULL),(4,'newuser','newuser@test.com','$2b$10$TNrVk4HrZS7BtxdoKqbAL.33.68cag31ciPTuYYtV7yNEJVgRj3hS','user','New User',NULL,NULL,NULL,'active','2025-12-02 07:11:25','2025-12-02 07:11:25',NULL,NULL,NULL,NULL,NULL),(5,'newtenant','tenant@test.com','$2b$10$dQd7MWWHwwwggKhN8J4w2uiWd3KRfeFZGSunijdtE1VoAkyhN4bqK','tenant','New Tenant',NULL,'081234567890','Jl. Test No. 1','active','2025-12-02 07:11:36','2025-12-02 07:11:36',NULL,NULL,NULL,NULL,NULL),(7,'Arifin','arifin@gmail.com','$2b$10$7ft/DhX8dqqBxo8XjqVGPu3sQkJxLg5/V2P.phT9yiFwOioXCkxvG','tenant','Muhammad Arifin',NULL,'0881025097388','Gresik, Jawa Timur','active','2025-12-05 12:53:00','2025-12-17 02:35:46','{\"dana\":{\"enabled\":true,\"number\":\"088102783189\"},\"ovo\":{\"enabled\":false,\"number\":\"\"},\"shopeepay\":{\"enabled\":true,\"number\":\"123424234234\"},\"bca\":{\"enabled\":false,\"number\":\"\",\"name\":\"\"},\"bri\":{\"enabled\":false,\"number\":\"\",\"name\":\"\"},\"mandiri\":{\"enabled\":false,\"number\":\"\",\"name\":\"\"},\"qris\":{\"enabled\":true,\"image\":\"/uploads/qris/qris-1764956361710-143075496.png\"}}','{\"whatsapp\":\"62881025097388\",\"instagram\":\"brlyn.dv\"}',NULL,NULL,NULL),(8,'tenant2','tenant2@gmail.com','$2b$10$I.R/JZe0ezvSyv1P0gK1FOpvkcmpB.kxMivjduMFdekZuEQK4WWmS','tenant','tenant',NULL,'01883239834',NULL,'active','2025-12-08 07:17:04','2025-12-08 07:17:04',NULL,NULL,NULL,NULL,NULL),(9,'tenant3','tenant3@gmail.com','$2b$10$rMOccp0Lj/4/MZYkVSV1uuKQQIqIwCKX.Lq3bTNLirlbHtikK4VJq','tenant','full name',NULL,'08810029292',NULL,'active','2025-12-08 07:24:05','2025-12-08 07:24:05',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-26  4:16:14
