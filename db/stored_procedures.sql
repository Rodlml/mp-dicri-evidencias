USE DICRI_EVIDENCIAS;
GO

-- ============================================
--  SP: LOGIN DE USUARIO
--  (El backend usará esto para obtener el usuario por email)
-- ============================================
IF OBJECT_ID('sp_usuarios_login', 'P') IS NOT NULL
    DROP PROCEDURE sp_usuarios_login;
GO

CREATE PROCEDURE sp_usuarios_login
    @Email NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        id_usuario,
        nombre,
        email,
        password_hash,
        rol,
        activo
    FROM Usuarios
    WHERE email = @Email
      AND activo = 1;
END
GO

-- ============================================
--  SP: CREAR EXPEDIENTE
-- ============================================
IF OBJECT_ID('sp_expediente_crear', 'P') IS NOT NULL
    DROP PROCEDURE sp_expediente_crear;
GO

CREATE PROCEDURE sp_expediente_crear
    @numero_expediente NVARCHAR(50),
    @id_tecnico_registra INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Expediente (numero_expediente, id_tecnico_registra, estado)
    VALUES (@numero_expediente, @id_tecnico_registra, 'en_revision');

    DECLARE @new_id INT;
    SET @new_id = SCOPE_IDENTITY();

    SELECT @new_id AS id_expediente;
END
GO

-- ============================================
--  SP: OBTENER EXPEDIENTE POR ID
-- ============================================
IF OBJECT_ID('sp_expediente_obtener', 'P') IS NOT NULL
    DROP PROCEDURE sp_expediente_obtener;
GO

CREATE PROCEDURE sp_expediente_obtener
    @id_expediente INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        e.id_expediente,
        e.numero_expediente,
        e.fecha_registro,
        e.id_tecnico_registra,
        u.nombre AS nombre_tecnico,
        e.estado,
        e.justificacion_rechazo
    FROM Expediente e
    INNER JOIN Usuarios u ON e.id_tecnico_registra = u.id_usuario
    WHERE e.id_expediente = @id_expediente;
END
GO

-- ============================================
--  SP: LISTAR EXPEDIENTES (CON FILTROS OPCIONALES)
--  filtros: fecha_inicio, fecha_fin, estado
-- ============================================
IF OBJECT_ID('sp_expediente_listar', 'P') IS NOT NULL
    DROP PROCEDURE sp_expediente_listar;
GO

CREATE PROCEDURE sp_expediente_listar
    @fecha_inicio DATETIME = NULL,
    @fecha_fin DATETIME = NULL,
    @estado NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        e.id_expediente,
        e.numero_expediente,
        e.fecha_registro,
        e.estado,
        u.nombre AS nombre_tecnico
    FROM Expediente e
    INNER JOIN Usuarios u ON e.id_tecnico_registra = u.id_usuario
    WHERE
        (@fecha_inicio IS NULL OR e.fecha_registro >= @fecha_inicio)
        AND (@fecha_fin IS NULL OR e.fecha_registro <= @fecha_fin)
        AND (@estado IS NULL OR e.estado = @estado)
    ORDER BY e.fecha_registro DESC;
END
GO

-- ============================================
--  SP: CAMBIAR ESTADO DE EXPEDIENTE (APROBAR / RECHAZAR / EN REVISIÓN)
-- ============================================
IF OBJECT_ID('sp_expediente_cambiar_estado', 'P') IS NOT NULL
    DROP PROCEDURE sp_expediente_cambiar_estado;
GO

CREATE PROCEDURE sp_expediente_cambiar_estado
    @id_expediente INT,
    @nuevo_estado NVARCHAR(20),
    @justificacion_rechazo NVARCHAR(MAX) = NULL,
    @id_usuario_accion INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar estado permitido
    IF (@nuevo_estado NOT IN ('en_revision', 'aprobado', 'rechazado'))
    BEGIN
        RAISERROR ('Estado no permitido', 16, 1);
        RETURN;
    END

    UPDATE Expediente
    SET 
        estado = @nuevo_estado,
        justificacion_rechazo = CASE 
                                    WHEN @nuevo_estado = 'rechazado' THEN @justificacion_rechazo
                                    ELSE NULL
                                END
    WHERE id_expediente = @id_expediente;
END
GO

-- ============================================
--  SP: CREAR INDICIO
-- ============================================
IF OBJECT_ID('sp_indicio_crear', 'P') IS NOT NULL
    DROP PROCEDURE sp_indicio_crear;
GO

CREATE PROCEDURE sp_indicio_crear
    @id_expediente INT,
    @descripcion NVARCHAR(300),
    @color NVARCHAR(100) = NULL,
    @tamano NVARCHAR(100) = NULL,
    @peso_libras NVARCHAR(50) = NULL,
    @ubicacion NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Indicio (
        id_expediente,
        descripcion,
        color,
        tamano,
        peso_libras,
        ubicacion
    )
    VALUES (
        @id_expediente,
        @descripcion,
        @color,
        @tamano,
        @peso_libras,
        @ubicacion
    );

    DECLARE @new_id INT;
    SET @new_id = SCOPE_IDENTITY();

    SELECT @new_id AS id_indicio;
END
GO

-- ============================================
--  SP: LISTAR INDICIOS POR EXPEDIENTE
-- ============================================
IF OBJECT_ID('sp_indicio_listar_por_expediente', 'P') IS NOT NULL
    DROP PROCEDURE sp_indicio_listar_por_expediente;
GO

CREATE PROCEDURE sp_indicio_listar_por_expediente
    @id_expediente INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.id_indicio,
        i.descripcion,
        i.color,
        i.tamano,
        i.peso_libras,
        i.ubicacion,
        i.fecha_registro
    FROM Indicio i
    WHERE i.id_expediente = @id_expediente
    ORDER BY i.fecha_registro DESC;
END
GO

-- ============================================
--  SP: REPORTE DE EXPEDIENTES (POR FECHAS Y ESTADO)
--  Devuelve conteos por estado
-- ============================================
IF OBJECT_ID('sp_reporte_expedientes', 'P') IS NOT NULL
    DROP PROCEDURE sp_reporte_expedientes_resumen;
GO

CREATE PROCEDURE sp_reporte_expedientes_resumen
    @fecha_inicio DATETIME = NULL,
    @fecha_fin DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        estado,
        COUNT(*) AS cantidad
    FROM Expediente
    WHERE
        (@fecha_inicio IS NULL OR fecha_registro >= @fecha_inicio)
        AND (@fecha_fin IS NULL OR fecha_registro <= @fecha_fin)
    GROUP BY estado;
END
GO

-- ============================================
--  SP: REPORTE DE EXPEDIENTES DETALLADO
-- ============================================

CREATE OR ALTER PROCEDURE sp_reporte_expedientes_detalle
    @fecha_inicio DATETIME = NULL,
    @fecha_fin    DATETIME = NULL,
    @estado       NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        id_expediente,
        numero_expediente,
        estado,
        fecha_registro
    FROM Expediente
    WHERE (@fecha_inicio IS NULL OR fecha_registro >= @fecha_inicio)
      AND (@fecha_fin    IS NULL OR fecha_registro <= @fecha_fin)
      AND (@estado IS NULL OR estado = @estado)
    ORDER BY fecha_registro DESC, id_expediente DESC;
END;
GO