CREATE TABLE sales_agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  bank_details_id INT DEFAULT NULL,
  coach_id INT DEFAULT NULL,
  status ENUM('active', 'freeze', 'deleted') DEFAULT 'active',
  is_deleted BOOLEAN   DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coach_id) REFERENCES users(id),
  FOREIGN KEY (bank_details_id) REFERENCES bank_details(id)
);