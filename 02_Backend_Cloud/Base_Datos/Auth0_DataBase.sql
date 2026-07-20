CREATE DATABASE iam_zero_trust;
-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auth0_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100),
  email VARCHAR(150),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logs de acceso
CREATE TABLE access_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);
