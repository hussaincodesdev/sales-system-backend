CREATE TABLE commissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sales_agent_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('due', 'paid') DEFAULT 'due',
  is_deleted BOOLEAN   DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sales_agent_id) REFERENCES sales_agents(id)
);