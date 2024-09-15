CREATE TABLE users
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255)        NOT NULL,
    last_name  VARCHAR(255)        NOT NULL,
    email      VARCHAR(255) UNIQUE NOT NULL,
    mobile     VARCHAR(255)        NOT NULL,
    password   VARCHAR(255)        NOT NULL,
    role       ENUM('admin', 'sales_agent', 'sales_coach') NOT NULL,
    is_active  BOOLEAN   DEFAULT TRUE,
    is_deleted BOOLEAN   DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);