-- Paso 1: Crear la base de datos (solo si no existe)
CREATE DATABASE IF NOT EXISTS iamzerotrust;
-- Paso 2: Seleccionar la base de datos
USE iamzerotrust;
-- Paso 3: Crear la tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);
-- Paso 4: Crear la tabla de perfiles (con foreign key hacia roles)
CREATE TABLE IF NOT EXISTS profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
-- Paso 5: Insertar datos de prueba en roles
INSERT INTO roles (name) VALUES 
    ('admin'),
    ('editor'),
    ('viewer');
    -- Paso 6: Insertar datos de prueba en profiles
INSERT INTO profiles (username, email, role_id) VALUES
    ('danny', 'danny@example.com', 1),
    ('maria', 'maria@example.com', 2),
    ('juan', 'juan@example.com', 3);
    -- Paso 7: Consultar perfiles con su rol
SELECT p.id, p.username, p.email, r.name AS role
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id;
USE iamzerotrust;
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50),        -- Ej: "LOGIN_SUCCESS", "LOGIN_FAILURE", "ROLE_UPDATE"
  user_id INT NULL,              -- ID del usuario si aplica
  description TEXT,              -- Detalle del evento
  ip_address VARCHAR(45),        -- IP del cliente
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(255) NULL,
  description TEXT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);-- Cambiar/Restablecer la contraseña del usuario iam_user
ALTER USER 'iam_user'@'localhost' IDENTIFIED BY 'tu_nueva_contraseña';

-- Otorgar todos los permisos sobre tu base de datos
GRANT ALL PRIVILEGES ON nombre_de_tu_bd.* TO 'iam_user'@'localhost';

-- Aplicar los cambios
FLUSH PRIVILEGES;