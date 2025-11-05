-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: recipe_costing_db
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.22.04.2

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
-- Dumping data for table `recipes`
--

LOCK TABLES `recipes` WRITE;
/*!40000 ALTER TABLE `recipes` DISABLE KEYS */;
INSERT INTO `recipes` VALUES (1,'Dal Tadka','Spiced lentil curry','2025-11-05 14:12:02','2025-11-05 14:12:02'),(2,'Jeera Rice','Cumin flavored rice','2025-11-05 14:12:02','2025-11-05 14:12:02'),(3,'Kadhi','Yogurt-based curry','2025-11-05 14:12:02','2025-11-05 14:12:02'),(4,'Aloo Sabzi','Simple potato curry','2025-11-05 14:36:30','2025-11-05 14:36:30'),(5,'Dal Tadka','Yellow lentils with tempering','2025-11-05 14:36:37','2025-11-05 14:36:37'),(6,'Jeera Rice','Cumin flavored rice','2025-11-05 14:36:37','2025-11-05 14:36:37'),(7,'Roti','Whole wheat flatbread','2025-11-05 14:36:37','2025-11-05 14:36:37'),(8,'Paneer Butter Masala','Rich and creamy paneer curry','2025-11-05 16:01:40','2025-11-05 16:01:40'),(9,'Chole Masala','Spicy chickpea curry','2025-11-05 16:01:40','2025-11-05 16:01:40'),(10,'Mix Veg Curry','Seasonal vegetables in curry','2025-11-05 16:01:40','2025-11-05 16:01:40'),(11,'Palak Paneer','Spinach and cottage cheese curry','2025-11-05 16:01:40','2025-11-05 16:01:40'),(12,'Bhindi Masala','Okra stir fry with spices','2025-11-05 16:01:40','2025-11-05 16:01:40'),(13,'Baingan Bharta','Roasted eggplant curry','2025-11-05 16:01:40','2025-11-05 16:01:40'),(14,'Moong Dal','Yellow lentil soup','2025-11-05 16:01:40','2025-11-05 16:01:40'),(15,'Masoor Dal','Red lentil curry','2025-11-05 16:01:40','2025-11-05 16:01:40'),(16,'Rajma','Kidney beans curry','2025-11-05 16:01:40','2025-11-05 16:01:40'),(17,'Veg Pulao','Flavored rice with vegetables','2025-11-05 16:01:40','2025-11-05 16:01:40'),(18,'Lemon Rice','Tangy rice with peanuts','2025-11-05 16:01:40','2025-11-05 16:01:40'),(19,'Curd Rice','Yogurt rice with tempering','2025-11-05 16:01:40','2025-11-05 16:01:40'),(20,'Chapati','Whole wheat flatbread','2025-11-05 16:01:40','2025-11-05 16:01:40'),(21,'Paratha','Layered flatbread','2025-11-05 16:01:40','2025-11-05 16:01:40'),(22,'Puri','Deep fried bread','2025-11-05 16:01:40','2025-11-05 16:01:40'),(23,'Gulab Jamun','Sweet milk dumplings','2025-11-05 16:01:40','2025-11-05 16:01:40'),(24,'Kheer','Rice pudding','2025-11-05 16:01:40','2025-11-05 16:01:40'),(25,'Raita','Yogurt with vegetables','2025-11-05 16:01:40','2025-11-05 16:01:40'),(26,'Papad','Crispy lentil wafers','2025-11-05 16:01:40','2025-11-05 16:01:40'),(27,'Pickle','Spicy mango pickle','2025-11-05 16:01:40','2025-11-05 16:01:40');
/*!40000 ALTER TABLE `recipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `recipe_images`
--

LOCK TABLES `recipe_images` WRITE;
/*!40000 ALTER TABLE `recipe_images` DISABLE KEYS */;
INSERT INTO `recipe_images` VALUES (1,8,'/uploads/recipe-images/paneer-butter-masala.jpg',NULL,1,1200,800,251000,'2025-11-05 16:02:36','2025-11-05 16:02:36'),(2,9,'/uploads/recipe-images/chole-masala.jpg',NULL,1,1456,2184,631000,'2025-11-05 16:02:36','2025-11-05 16:02:36'),(3,11,'/uploads/recipe-images/palak-paneer.jpg',NULL,1,660,1000,122000,'2025-11-05 16:02:36','2025-11-05 16:02:36'),(4,1,'/uploads/recipe-images/dal-tadka.webp',NULL,1,800,800,82000,'2025-11-05 16:02:36','2025-11-05 16:02:36'),(5,2,'/uploads/recipe-images/jeera-rice.jpg',NULL,1,800,600,130000,'2025-11-05 16:02:36','2025-11-05 16:02:36'),(6,17,'/uploads/recipe-images/veg-pulao.jpg',NULL,1,1200,1798,152000,'2025-11-05 16:02:36','2025-11-05 16:02:36');
/*!40000 ALTER TABLE `recipe_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `weekly_menus`
--

LOCK TABLES `weekly_menus` WRITE;
/*!40000 ALTER TABLE `weekly_menus` DISABLE KEYS */;
INSERT INTO `weekly_menus` VALUES (1,1,'2025-11-04','Surti Fusion Weekly Menu','Authentic Gujarati and North Indian fusion tiffin menu',NULL,'DAG32D4N-fo','/canva_samples/surti-fusion-menu.png',1,'2025-11-05 14:22:48','2025-11-05 16:05:49');
/*!40000 ALTER TABLE `weekly_menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `weekly_menu_items`
--

LOCK TABLES `weekly_menu_items` WRITE;
/*!40000 ALTER TABLE `weekly_menu_items` DISABLE KEYS */;
INSERT INTO `weekly_menu_items` VALUES (22,1,1,8,'Sabzi',0,NULL,'2025-11-05 16:03:11'),(23,1,1,20,'Roti',3,NULL,'2025-11-05 16:03:11'),(24,1,1,14,'Dal',1,NULL,'2025-11-05 16:03:11'),(25,1,1,2,'Rice',2,NULL,'2025-11-05 16:03:11'),(26,1,2,19,'Roti',3,NULL,'2025-11-05 16:03:11'),(27,1,1,24,'Special',4,NULL,'2025-11-05 16:03:11'),(28,1,2,11,'Sabzi',5,NULL,'2025-11-05 16:03:11'),(29,1,2,1,'Dal',1,NULL,'2025-11-05 16:03:11'),(30,1,2,17,'Rice',2,NULL,'2025-11-05 16:03:11'),(31,1,2,25,'Special',4,NULL,'2025-11-05 16:03:11'),(32,1,3,10,'Sabzi',10,NULL,'2025-11-05 16:03:11'),(33,1,3,15,'Dal',1,NULL,'2025-11-05 16:03:11'),(34,1,3,18,'Rice',2,NULL,'2025-11-05 16:03:11'),(35,1,3,7,'Roti',3,NULL,'2025-11-05 16:03:11'),(36,1,3,23,'Special',4,NULL,'2025-11-05 16:03:11'),(37,1,4,9,'Sabzi',15,NULL,'2025-11-05 16:03:11'),(38,1,4,16,'Dal',1,NULL,'2025-11-05 16:03:11'),(39,1,4,2,'Rice',2,NULL,'2025-11-05 16:03:11'),(40,1,4,21,'Roti',3,NULL,'2025-11-05 16:03:11'),(41,1,4,22,'Special',4,NULL,'2025-11-05 16:03:11'),(42,1,5,12,'Sabzi',20,NULL,'2025-11-05 16:03:11'),(43,1,5,1,'Dal',1,NULL,'2025-11-05 16:03:11'),(44,1,5,17,'Rice',2,NULL,'2025-11-05 16:03:11'),(45,1,5,20,'Roti',3,NULL,'2025-11-05 16:03:11'),(46,1,5,23,'Special',4,NULL,'2025-11-05 16:03:11'),(47,1,6,13,'Sabzi',25,NULL,'2025-11-05 16:03:11'),(48,1,6,3,'Dal',1,NULL,'2025-11-05 16:03:11'),(49,1,6,19,'Rice',2,NULL,'2025-11-05 16:03:11'),(50,1,6,21,'Roti',3,NULL,'2025-11-05 16:03:11'),(51,1,6,22,'Special',4,NULL,'2025-11-05 16:03:11');
/*!40000 ALTER TABLE `weekly_menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `canva_templates`
--

LOCK TABLES `canva_templates` WRITE;
/*!40000 ALTER TABLE `canva_templates` DISABLE KEYS */;
INSERT INTO `canva_templates` VALUES (1,NULL,'Weekly Menu Delight','DAG32D4N-fo',NULL,'flyer',1,0,'modern',NULL,'Professional tiffin service weekly menu with food images, modern layout, warm colors, Indian cuisine',1,'2025-11-05 16:04:54','2025-11-05 16:04:54');
/*!40000 ALTER TABLE `canva_templates` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-05 11:10:28
