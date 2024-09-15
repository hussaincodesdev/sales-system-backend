CREATE TABLE bank_details
(
    id             INT AUTO_INCREMENT PRIMARY KEY,
    bank_name      VARCHAR(255),
    account_number VARCHAR(50) UNIQUE,
    iban           VARCHAR(34) UNIQUE,
    is_deleted     BOOLEAN   DEFAULT FALSE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);