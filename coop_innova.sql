-- Script SQL para MySQL Workbench
-- Base de datos y las tablas principales para Coop-Innova

CREATE DATABASE IF NOT EXISTS coop_innova;
USE coop_innova;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  usuario VARCHAR(50) UNIQUE,
  password VARCHAR(255),
  rol ENUM('asociado','admin') NOT NULL
);

CREATE TABLE IF NOT EXISTS movimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  tipo ENUM('deposito','retiro','credito','pago'),
  monto DECIMAL(10,2),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS creditos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  monto DECIMAL(10,2),
  estado ENUM('pendiente','aprobado','rechazado'),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS ahorros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  monto DECIMAL(10,2),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

INSERT INTO usuarios (nombre, usuario, password, rol) VALUES
('Admin General', 'admin1', 'admin123', 'admin'),
('Leidy Salgado', 'leidys', 'lady123', 'asociado'),
('Fabian', 'Gonzalez', 'fabian123', 'asociado');

INSERT INTO ahorros (usuario_id, monto) VALUES
(2, 150000.00),
(3, 275000.00);

INSERT INTO creditos (usuario_id, monto, estado) VALUES
(2, 5000.00, 'pendiente'),
(3, 3000.00, 'aprobado');

INSERT INTO movimientos (usuario_id, tipo, monto) VALUES
(2, 'deposito', 1000.00),
(2, 'retiro', 200.00),
(2, 'credito', 5000.00),
(2, 'pago', 250.00),
(3, 'deposito', 1500.00),
(3, 'retiro', 250.00),
(3, 'credito', 3000.00),
(3, 'pago', 1000.00);
