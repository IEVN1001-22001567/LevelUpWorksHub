-- ============================================================================
-- Script para crear las tablas de la funcionalidad SOCIAL Y RESEÑAS
-- ============================================================================
-- IMPORTANTE: Ejecutar en phpMyAdmin en la base de datos de LevelUpWorksHub
-- ============================================================================

-- Tabla: AMIGOS (gestiona relaciones de amistad entre usuarios)
CREATE TABLE IF NOT EXISTS `amigos` (
  `amistad_id` INT NOT NULL AUTO_INCREMENT,
  `usuario1_id` INT NOT NULL,
  `usuario2_id` INT NOT NULL,
  `estado` ENUM('pendiente', 'aceptado', 'bloqueado') DEFAULT 'pendiente',
  `fecha_solicitud` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_aceptacion` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`amistad_id`),
  KEY `idx_usuario1_id` (`usuario1_id`),
  KEY `idx_usuario2_id` (`usuario2_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: MENSAJES (gestiona mensajes privados entre usuarios)
CREATE TABLE IF NOT EXISTS `mensajes` (
  `mensaje_id` INT NOT NULL AUTO_INCREMENT,
  `remitente_id` INT NOT NULL,
  `destinatario_id` INT NOT NULL,
  `contenido` VARCHAR(500) NOT NULL,
  `fecha_envio` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `leido` BOOLEAN DEFAULT FALSE,
  `fecha_lectura` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`mensaje_id`),
  KEY `idx_remitente_id` (`remitente_id`),
  KEY `idx_destinatario_id` (`destinatario_id`),
  KEY `idx_fecha_envio` (`fecha_envio`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: ESTADO_USUARIO (rastrea estado online/offline y juego actual)
CREATE TABLE IF NOT EXISTS `estado_usuario` (
  `usuarioid` INT NOT NULL,
  `estado` ENUM('online', 'offline', 'jugando') DEFAULT 'offline',
  `juego_actual` VARCHAR(255) DEFAULT NULL,
  `ultima_actividad` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuarioid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: BIBLIOTECA (juegos en la biblioteca/librería del usuario)
CREATE TABLE IF NOT EXISTS `biblioteca` (
  `bibliotecaID` INT NOT NULL AUTO_INCREMENT,
  `usuarioid` INT NOT NULL,
  `juegoID` INT NOT NULL,
  `nombreproducto` VARCHAR(100) NOT NULL,
  `descripción` TEXT,
  `precio` DECIMAL(10, 2) NOT NULL,
  `divisa` VARCHAR(10) NOT NULL,
  `fechaagregada` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `estado` VARCHAR(20) DEFAULT 'activo',
  PRIMARY KEY (`bibliotecaID`),
  KEY `idx_usuarioid` (`usuarioid`),
  KEY `idx_juegoID` (`juegoID`),
  KEY `idx_fechaagregada` (`fechaagregada`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: RESEÑAS (reseñas y calificaciones de juegos)
CREATE TABLE IF NOT EXISTS `resenas` (
  `resenaID` INT NOT NULL AUTO_INCREMENT,
  `juegoID` INT NOT NULL,
  `usuarioid` INT NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `contenido` LONGTEXT NOT NULL,
  `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `estado` ENUM('pendiente', 'publicada', 'rechazada') DEFAULT 'pendiente',
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_publicacion` TIMESTAMP NULL DEFAULT NULL,
  `util` INT DEFAULT 0,
  `reportes` INT DEFAULT 0,
  PRIMARY KEY (`resenaID`),
  KEY `idx_juegoID` (`juegoID`),
  KEY `idx_usuarioid` (`usuarioid`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_creacion` (`fecha_creacion`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Instrucciones:
-- 1. Abre phpMyAdmin
-- 2. Selecciona tu base de datos de LevelUpWorksHub
-- 3. Ve a la pestaña "SQL"
-- 4. Pega este script completo
-- 5. Haz clic en "Ejecutar"
-- ============================================================================
