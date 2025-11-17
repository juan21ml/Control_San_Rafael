
DROP DATABASE IF EXISTS hospital_pds006;

CREATE DATABASE hospital_pds006 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE hospital_pds006;


CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    rol ENUM('admin', 'guardia', 'supervisor') DEFAULT 'guardia',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;


CREATE TABLE equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_equipo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    serial VARCHAR(100) NOT NULL,
    tipo_equipo ENUM('tecnologico', 'biomedico') NOT NULL,
    propietario VARCHAR(150) NOT NULL,
    tipo_propietario ENUM('personal', 'proveedor', 'contratista') NOT NULL,
    frecuencia ENUM('frecuente', 'esporadico') NOT NULL,
    codigo_qr VARCHAR(100) UNIQUE,
    estado_actual ENUM('dentro', 'fuera') DEFAULT 'fuera',
    foto_url VARCHAR(255) NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_registro_id INT,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_registro_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_codigo_equipo (codigo_equipo),
    INDEX idx_codigo_qr (codigo_qr),
    INDEX idx_tipo_equipo (tipo_equipo),
    INDEX idx_estado_actual (estado_actual),
    INDEX idx_serial (serial)
) ENGINE=InnoDB;


CREATE TABLE movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_log VARCHAR(50) NOT NULL UNIQUE,
    equipo_id INT NOT NULL,
    tipo_movimiento ENUM('registro', 'ingreso', 'salida') NOT NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_responsable_id INT,
    observaciones TEXT NULL,
    ubicacion VARCHAR(100) NULL,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_equipo_id (equipo_id),
    INDEX idx_tipo_movimiento (tipo_movimiento),
    INDEX idx_fecha_hora (fecha_hora),
    INDEX idx_codigo_log (codigo_log)
) ENGINE=InnoDB;


CREATE TABLE reportes_generados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_reporte VARCHAR(200) NOT NULL,
    tipo_reporte ENUM('general', 'por_fecha', 'por_equipo', 'por_usuario') NOT NULL,
    fecha_inicio DATE NULL,
    fecha_fin DATE NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_generador_id INT,
    ruta_archivo VARCHAR(255) NULL,
    total_registros INT DEFAULT 0,
    FOREIGN KEY (usuario_generador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_fecha_generacion (fecha_generacion),
    INDEX idx_tipo_reporte (tipo_reporte)
) ENGINE=InnoDB;


CREATE TABLE configuraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descripcion VARCHAR(255) NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE sesiones_auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50) NULL,
    registro_id INT NULL,
    ip_address VARCHAR(45) NULL,
    detalles JSON NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_hora (fecha_hora),
    INDEX idx_accion (accion)
) ENGINE=InnoDB;


INSERT INTO usuarios (nombre, email, rol) VALUES
('Admin Usuario', 'admin@hospital.com', 'admin'),
('Guardia Principal', 'guardia1@hospital.com', 'guardia'),
('Juan García', 'jgarcia@hospital.com', 'guardia'),
('Supervisor General', 'supervisor@hospital.com', 'supervisor');

INSERT INTO equipos (
    codigo_equipo, nombre, serial, tipo_equipo, propietario, 
    tipo_propietario, frecuencia, codigo_qr, estado_actual, usuario_registro_id
) VALUES
('EQ001', 'Laptop Dell Latitude 5420', 'DLL123456', 'tecnologico', 'Dr. Juan Pérez', 'personal', 'frecuente', 'QR-EQ001', 'dentro', 1),
('EQ002', 'Monitor de Signos Vitales', 'MSV789012', 'biomedico', 'Proveedor MedTech', 'proveedor', 'esporadico', 'MSV789012', 'fuera', 1),
('EQ003', 'Tablet Samsung Galaxy Tab S8', 'SGT456789', 'tecnologico', 'Dra. María López', 'personal', 'frecuente', 'QR-EQ003', 'fuera', 1),
('EQ004', 'Ventilador Mecánico', 'VM-2024-001', 'biomedico', 'Hospital', 'personal', 'frecuente', 'QR-EQ004', 'dentro', 1),
('EQ005', 'Equipo de Ultrasonido Portátil', 'USP-2024-045', 'biomedico', 'Contratista Tech Medical', 'contratista', 'esporadico', 'USP-2024-045', 'fuera', 1);

INSERT INTO movimientos (codigo_log, equipo_id, tipo_movimiento, usuario_responsable_id, observaciones) VALUES
('LOG001', 1, 'registro', 1, 'Registro inicial del equipo'),
('LOG002', 1, 'ingreso', 2, 'Ingreso autorizado'),
('LOG003', 2, 'registro', 1, 'Registro inicial del equipo'),
('LOG004', 3, 'registro', 1, 'Registro inicial del equipo'),
('LOG005', 4, 'registro', 1, 'Registro inicial del equipo'),
('LOG006', 4, 'ingreso', 2, 'Ingreso para mantenimiento preventivo'),
('LOG007', 5, 'registro', 1, 'Registro inicial del equipo');

INSERT INTO configuraciones (clave, valor, descripcion) VALUES
('hospital_nombre', 'Hospital San Rafael de Tunja', 'Nombre oficial del hospital'),
('sistema_version', '1.0.0', 'Versión actual del sistema'),
('tiempo_permanencia_maximo', '72', 'Tiempo máximo de permanencia de equipos en horas'),
('requiere_foto_esporadico', 'true', 'Indica si los equipos esporádicos requieren foto'),
('email_notificaciones', 'notificaciones@hospital.com', 'Email para notificaciones del sistema');


CREATE VIEW vista_equipos_completa AS
SELECT 
    e.id,
    e.codigo_equipo,
    e.nombre,
    e.serial,
    e.tipo_equipo,
    e.propietario,
    e.tipo_propietario,
    e.frecuencia,
    e.codigo_qr,
    e.estado_actual,
    e.fecha_registro,
    u.nombre AS usuario_registro,
    COUNT(m.id) AS total_movimientos,
    MAX(m.fecha_hora) AS ultimo_movimiento
FROM equipos e
LEFT JOIN usuarios u ON e.usuario_registro_id = u.id
LEFT JOIN movimientos m ON e.id = m.equipo_id
WHERE e.activo = TRUE
GROUP BY e.id;

CREATE VIEW vista_movimientos_hoy AS
SELECT 
    m.id,
    m.codigo_log,
    e.codigo_equipo,
    e.nombre AS equipo_nombre,
    e.tipo_equipo,
    m.tipo_movimiento,
    m.fecha_hora,
    u.nombre AS usuario_responsable,
    e.propietario
FROM movimientos m
JOIN equipos e ON m.equipo_id = e.id
LEFT JOIN usuarios u ON m.usuario_responsable_id = u.id
WHERE DATE(m.fecha_hora) = CURDATE()
ORDER BY m.fecha_hora DESC;

CREATE VIEW vista_equipos_dentro AS
SELECT 
    e.id,
    e.codigo_equipo,
    e.nombre,
    e.serial,
    e.tipo_equipo,
    e.propietario,
    e.codigo_qr,
    MAX(m.fecha_hora) AS hora_ingreso,
    u.nombre AS usuario_ingreso
FROM equipos e
JOIN movimientos m ON e.id = m.equipo_id
LEFT JOIN usuarios u ON m.usuario_responsable_id = u.id
WHERE e.estado_actual = 'dentro' 
  AND e.activo = TRUE
  AND m.tipo_movimiento = 'ingreso'
GROUP BY e.id
ORDER BY hora_ingreso DESC;


DELIMITER //

CREATE PROCEDURE sp_registrar_equipo(
    IN p_codigo_equipo VARCHAR(50),
    IN p_nombre VARCHAR(200),
    IN p_serial VARCHAR(100),
    IN p_tipo_equipo VARCHAR(20),
    IN p_propietario VARCHAR(150),
    IN p_tipo_propietario VARCHAR(20),
    IN p_frecuencia VARCHAR(20),
    IN p_codigo_qr VARCHAR(100),
    IN p_usuario_id INT,
    OUT p_equipo_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_equipo_id = -1;
    END;
    
    START TRANSACTION;
    
    INSERT INTO equipos (
        codigo_equipo, nombre, serial, tipo_equipo, propietario,
        tipo_propietario, frecuencia, codigo_qr, usuario_registro_id
    ) VALUES (
        p_codigo_equipo, p_nombre, p_serial, p_tipo_equipo, p_propietario,
        p_tipo_propietario, p_frecuencia, p_codigo_qr, p_usuario_id
    );
    
    SET p_equipo_id = LAST_INSERT_ID();
    
    INSERT INTO movimientos (
        codigo_log, equipo_id, tipo_movimiento, usuario_responsable_id
    ) VALUES (
        CONCAT('LOG', LPAD(p_equipo_id, 6, '0')), 
        p_equipo_id, 
        'registro', 
        p_usuario_id
    );
    
    COMMIT;
END //

CREATE PROCEDURE sp_registrar_ingreso(
    IN p_equipo_id INT,
    IN p_usuario_id INT,
    IN p_observaciones TEXT,
    OUT p_resultado INT
)
BEGIN
    DECLARE v_estado_actual VARCHAR(20);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_resultado = -1;
    END;
    
    START TRANSACTION;
    
    SELECT estado_actual INTO v_estado_actual
    FROM equipos WHERE id = p_equipo_id;
    
    IF v_estado_actual = 'dentro' THEN
        SET p_resultado = -2;
        ROLLBACK;
    ELSE
        
        UPDATE equipos 
        SET estado_actual = 'dentro' 
        WHERE id = p_equipo_id;
        
        INSERT INTO movimientos (
            codigo_log, equipo_id, tipo_movimiento, 
            usuario_responsable_id, observaciones
        ) VALUES (
            CONCAT('LOG', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')),
            p_equipo_id,
            'ingreso',
            p_usuario_id,
            p_observaciones
        );
        
        SET p_resultado = 1; 
        COMMIT;
    END IF;
END //

CREATE PROCEDURE sp_registrar_salida(
    IN p_equipo_id INT,
    IN p_usuario_id INT,
    IN p_observaciones TEXT,
    OUT p_resultado INT
)
BEGIN
    DECLARE v_estado_actual VARCHAR(20);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_resultado = -1;
    END;
    
    START TRANSACTION;
    
    SELECT estado_actual INTO v_estado_actual
    FROM equipos WHERE id = p_equipo_id;
    
    IF v_estado_actual = 'fuera' THEN
        SET p_resultado = -2;
        ROLLBACK;
    ELSE
        UPDATE equipos 
        SET estado_actual = 'fuera' 
        WHERE id = p_equipo_id;
        
        INSERT INTO movimientos (
            codigo_log, equipo_id, tipo_movimiento, 
            usuario_responsable_id, observaciones
        ) VALUES (
            CONCAT('LOG', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')),
            p_equipo_id,
            'salida',
            p_usuario_id,
            p_observaciones
        );
        
        SET p_resultado = 1; 
        COMMIT;
    END IF;
END //

CREATE FUNCTION fn_total_equipos_dentro()
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total 
    FROM equipos 
    WHERE estado_actual = 'dentro' AND activo = TRUE;
    RETURN total;
END //

CREATE FUNCTION fn_total_movimientos_hoy()
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total 
    FROM movimientos 
    WHERE DATE(fecha_hora) = CURDATE();
    RETURN total;
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_equipos_insert_audit
AFTER INSERT ON equipos
FOR EACH ROW
BEGIN
    INSERT INTO sesiones_auditoria (
        usuario_id, accion, tabla_afectada, registro_id, detalles
    ) VALUES (
        NEW.usuario_registro_id,
        'INSERT',
        'equipos',
        NEW.id,
        JSON_OBJECT('codigo_equipo', NEW.codigo_equipo, 'nombre', NEW.nombre)
    );
END //

CREATE TRIGGER trg_equipos_update_audit
AFTER UPDATE ON equipos
FOR EACH ROW
BEGIN
    INSERT INTO sesiones_auditoria (
        usuario_id, accion, tabla_afectada, registro_id, detalles
    ) VALUES (
        NEW.usuario_registro_id,
        'UPDATE',
        'equipos',
        NEW.id,
        JSON_OBJECT(
            'campo_modificado', 'estado_actual',
            'valor_anterior', OLD.estado_actual,
            'valor_nuevo', NEW.estado_actual
        )
    );
END //

DELIMITER ;


CREATE INDEX idx_equipos_tipo_estado ON equipos(tipo_equipo, estado_actual);
CREATE INDEX idx_movimientos_fecha_tipo ON movimientos(fecha_hora, tipo_movimiento);


SELECT 'Tablas creadas exitosamente' AS status;
SHOW TABLES;

SELECT 'Usuarios insertados:' AS info, COUNT(*) AS total FROM usuarios;
SELECT 'Equipos insertados:' AS info, COUNT(*) AS total FROM equipos;
SELECT 'Movimientos insertados:' AS info, COUNT(*) AS total FROM movimientos;

SELECT 'Vista de equipos completa:' AS info;
SELECT * FROM vista_equipos_completa LIMIT 5;

SELECT 'Vista de movimientos hoy:' AS info;
SELECT * FROM vista_movimientos_hoy LIMIT 5;

