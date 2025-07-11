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
