CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sales_agent_id INT,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  cpr VARCHAR(20) NOT NULL,
  application_status ENUM('completed', 'incomplete') DEFAULT 'incomplete',
  date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN   DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sales_agent_id) REFERENCES sales_agents(id)
);