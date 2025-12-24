-- ============================================
--  SCHEMA SQL - GESTIÓN DE EVIDENCIAS DICRI
-- ============================================

-- Crear base de datos
CREATE DATABASE DICRI_EVIDENCIAS;
GO

USE DICRI_EVIDENCIAS;
GO

-- ============================================
--  TABLA: USUARIOS
-- ============================================
CREATE TABLE Usuarios (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    rol NVARCHAR(20) NOT NULL CHECK (rol IN ('tecnico', 'coordinador')),
    activo BIT NOT NULL DEFAULT 1
);
GO

-- ============================================
--  TABLA: EXPEDIENTE
-- ============================================
CREATE TABLE Expediente (
    id_expediente INT IDENTITY(1,1) PRIMARY KEY,
    numero_expediente NVARCHAR(50) NOT NULL UNIQUE,
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE(),
    id_tecnico_registra INT NOT NULL,
    estado NVARCHAR(20) NOT NULL 
        CHECK (estado IN ('registrado','en_revision','aprobado','rechazado')),
    justificacion_rechazo NVARCHAR(MAX) NULL,

    FOREIGN KEY (id_tecnico_registra) REFERENCES Usuarios(id_usuario)
);
GO


-- ============================================
--  TABLA: INDICIO
-- ============================================
CREATE TABLE Indicio (
    id_indicio INT IDENTITY(1,1) PRIMARY KEY,
    id_expediente INT NOT NULL,
    descripcion NVARCHAR(300) NOT NULL,
    color NVARCHAR(100),
    tamano NVARCHAR(100),
    peso_libras NVARCHAR(50),
    ubicacion NVARCHAR(200),
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (id_expediente) REFERENCES Expediente(id_expediente),
);
GO