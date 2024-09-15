USE sales_system;

# ************************************************************
# Sequel Ace SQL dump
# Version 20071
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# Host: 127.0.0.1 (MySQL 8.0.33)
# Database: sales_system
# Generation Time: 2024-08-31 17:51:11 +0000
# ************************************************************
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;

/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;

/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;

SET
  NAMES utf8mb4;

/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */
;

/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */
;

/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */
;

# Dump of table applications
# ------------------------------------------------------------
DROP TABLE IF EXISTS `applications`;

CREATE TABLE `applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sales_agent_id` int DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `cpr` varchar(20) NOT NULL,
  `application_status` enum('completed', 'incomplete') DEFAULT 'incomplete',
  `date_submitted` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sales_agent_id` (`sales_agent_id`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`sales_agent_id`) REFERENCES `sales_agents` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

LOCK TABLES `applications` WRITE;

/*!40000 ALTER TABLE `applications` DISABLE KEYS */
;

INSERT INTO
  `applications` (
    `id`,
    `sales_agent_id`,
    `first_name`,
    `last_name`,
    `mobile`,
    `cpr`,
    `application_status`,
    `date_submitted`,
    `is_deleted`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    1,
    'John',
    'Doe',
    '97333123123',
    '1234567890',
    'incomplete',
    '2024-08-31 20:32:04',
    1,
    '2024-08-31 20:32:04',
    '2024-08-31 20:39:08'
  );

/*!40000 ALTER TABLE `applications` ENABLE KEYS */
;

UNLOCK TABLES;

# Dump of table bank_details
# ------------------------------------------------------------
DROP TABLE IF EXISTS `bank_details`;

CREATE TABLE `bank_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `iban` varchar(34) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_number` (`account_number`),
  UNIQUE KEY `iban` (`iban`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

LOCK TABLES `bank_details` WRITE;

/*!40000 ALTER TABLE `bank_details` DISABLE KEYS */
;

INSERT INTO
  `bank_details` (
    `id`,
    `bank_name`,
    `account_number`,
    `iban`,
    `is_deleted`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    'BBK',
    '1234567890',
    'BHNBOB10000004',
    0,
    '2024-08-31 19:09:14',
    '2024-08-31 19:48:15'
  ),
  (
    2,
    '',
    '',
    '',
    0,
    '2024-08-31 20:08:17',
    '2024-08-31 20:08:17'
  ),
  (
    4,
    'NBB',
    '10000',
    '0000011',
    0,
    '2024-08-31 20:08:39',
    '2024-08-31 20:08:39'
  ),
  (
    5,
    'BBK',
    '123456',
    '654321',
    0,
    '2024-08-31 20:13:09',
    '2024-08-31 20:13:09'
  );

/*!40000 ALTER TABLE `bank_details` ENABLE KEYS */
;

UNLOCK TABLES;

# Dump of table commissions
# ------------------------------------------------------------
DROP TABLE IF EXISTS `commissions`;

CREATE TABLE `commissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sales_agent_id` int DEFAULT NULL,
  `amount` decimal(10, 2) NOT NULL,
  `status` enum('due', 'paid') DEFAULT 'due',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sales_agent_id` (`sales_agent_id`),
  CONSTRAINT `commissions_ibfk_1` FOREIGN KEY (`sales_agent_id`) REFERENCES `sales_agents` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# Dump of table sales_agents
# ------------------------------------------------------------
DROP TABLE IF EXISTS `sales_agents`;

CREATE TABLE `sales_agents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `bank_details_id` int DEFAULT NULL,
  `coach_id` int DEFAULT NULL,
  `status` enum('active', 'freeze', 'deleted') DEFAULT 'active',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `coach_id` (`coach_id`),
  KEY `bank_details_id` (`bank_details_id`),
  CONSTRAINT `sales_agents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `sales_agents_ibfk_2` FOREIGN KEY (`coach_id`) REFERENCES `users` (`id`),
  CONSTRAINT `sales_agents_ibfk_3` FOREIGN KEY (`bank_details_id`) REFERENCES `bank_details` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

LOCK TABLES `sales_agents` WRITE;

/*!40000 ALTER TABLE `sales_agents` DISABLE KEYS */
;

INSERT INTO
  `sales_agents` (
    `id`,
    `user_id`,
    `bank_details_id`,
    `coach_id`,
    `status`,
    `is_deleted`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    3,
    5,
    2,
    'active',
    0,
    '2024-08-31 19:09:00',
    '2024-08-31 20:13:09'
  );

/*!40000 ALTER TABLE `sales_agents` ENABLE KEYS */
;

UNLOCK TABLES;

# Dump of table system_meta
# ------------------------------------------------------------
DROP TABLE IF EXISTS `system_meta`;

CREATE TABLE `system_meta` (
  `id` varchar(45) NOT NULL,
  `value` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

LOCK TABLES `system_meta` WRITE;

/*!40000 ALTER TABLE `system_meta` DISABLE KEYS */
;

INSERT INTO
  `system_meta` (`id`, `value`)
VALUES
  ('schema_version', '5');

/*!40000 ALTER TABLE `system_meta` ENABLE KEYS */
;

UNLOCK TABLES;

# Dump of table users
# ------------------------------------------------------------
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin', 'sales_agent', 'sales_coach') NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

LOCK TABLES `users` WRITE;

/*!40000 ALTER TABLE `users` DISABLE KEYS */
;

INSERT INTO
  `users` (
    `id`,
    `first_name`,
    `last_name`,
    `email`,
    `mobile`,
    `password`,
    `role`,
    `is_active`,
    `is_deleted`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    'Admin',
    'User',
    'admin@example.com',
    '33123125',
    '$2a$10$iOX/3zysac6wbhA7L/pthudl3zp/FmUMk4Zvgc66R.SrkyyszWmY2',
    'admin',
    1,
    0,
    '2024-08-31 19:08:38',
    '2024-08-31 19:08:38'
  ),
  (
    2,
    'Coach',
    'User',
    'coach@example.com',
    '33123124',
    '$2a$10$OmVxv/bA0CF8ASdlNaqrRunFpSlOWj6ThERlmpJ/mN1wei079aLCa',
    'sales_coach',
    1,
    0,
    '2024-08-31 19:08:42',
    '2024-08-31 19:08:42'
  ),
  (
    3,
    'Agent',
    'User',
    'agent@example.com',
    '33123129',
    '$2a$10$OFuUryqGLgsmnhiU0EP2yO03tuSPITI8.1nw4m2ORuHMw.0tI6X7a',
    'sales_agent',
    1,
    0,
    '2024-08-31 19:08:45',
    '2024-08-31 20:08:23'
  );

/*!40000 ALTER TABLE `users` ENABLE KEYS */
;

UNLOCK TABLES;

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */
;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */
;

/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */
;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;

/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;

/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;