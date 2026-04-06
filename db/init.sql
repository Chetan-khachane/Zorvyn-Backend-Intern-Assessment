CREATE DATABASE IF NOT EXISTS finance;
USE finance;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  refresh_token TEXT,
  PRIMARY KEY (id),
  UNIQUE KEY (email),
  CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES access_roles (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type_id INT DEFAULT NULL,
  category_id INT DEFAULT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY (user_id),
  KEY (type_id),
  KEY (category_id),
  CONSTRAINT fk_category_type FOREIGN KEY (category_id) REFERENCES category (cat_id) ON DELETE CASCADE,
  CONSTRAINT fk_transaction_type FOREIGN KEY (type_id) REFERENCES transaction_type (id) ON DELETE CASCADE,
  CONSTRAINT transactions_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transaction_type (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trans_type ENUM('INCOME', 'EXPENSE') DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS category (
  cat_id INT AUTO_INCREMENT PRIMARY KEY,
  category TEXT,
  trans_id INT DEFAULT NULL,
  KEY (trans_id),
  CONSTRAINT category_ibfk_1 FOREIGN KEY (trans_id) REFERENCES transaction_type (id) ON DELETE CASCADE
);

INSERT INTO transaction_type (trans_type) VALUES ("INCOME"),
                                                 ("EXPENSE")

INSERT INTO category (category,trans_id) VALUES ("FOOD",2),
                                                ("ENTERTAINMENT",2),
                                                ("HEALTH",2),
                                                ("TRAVEL",2),
                                                ("CLOTHING",2),
                                                ("SALARY",1),
                                                ("RENTAL_INCOME",1),
                                                ("BUSINESS",1),
                                                ("INVESTMENTS",1);


INSERT INTO category (category,trans_id) VALUES ("OTHER",1),
                                                ("OTHER",2);

CREATE TABLE IF NOT EXISTS access_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role TEXT NOT NULL
);

INSERT INTO access_roles (role) VALUES ("ADMIN");
INSERT INTO access_roles (role) VALUES ("ANALYST");
INSERT INTO access_roles (role) VALUES ("CUSTOMER");
