// server.js - Backend API para Sistema PDS006
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de Base de Datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hospital_pds006',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado a MySQL exitosamente');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión a MySQL:', err);
  });

// GET: Obtener todos los equipos
app.get('/api/equipos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
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
        e.foto_url,
        u.nombre AS usuario_registro,
        COUNT(m.id) AS total_movimientos,
        MAX(m.fecha_hora) AS ultimo_movimiento
      FROM equipos e
      LEFT JOIN usuarios u ON e.usuario_registro_id = u.id
      LEFT JOIN movimientos m ON e.id = m.equipo_id
      WHERE e.activo = TRUE
      GROUP BY e.id
      ORDER BY e.fecha_registro DESC
    `);
    
    console.log(`📊 Equipos encontrados: ${rows.length}`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener equipos' });
  }
});

// GET: Obtener equipo por ID
app.get('/api/equipos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM equipos WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    res.status(500).json({ success: false, message: 'Error al obtener equipo' });
  }
});

// POST: Registrar nuevo equipo
app.post('/api/equipos', async (req, res) => {
  try {
    const {
      codigo_equipo,
      nombre,
      serial,
      tipo_equipo,
      propietario,
      tipo_propietario,
      frecuencia,
      codigo_qr,
      usuario_id = 1
    } = req.body;

    if (!nombre || !serial || !propietario) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(`
        INSERT INTO equipos (
          codigo_equipo, nombre, serial, tipo_equipo, propietario,
          tipo_propietario, frecuencia, codigo_qr, usuario_registro_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        codigo_equipo,
        nombre,
        serial,
        tipo_equipo,
        propietario,
        tipo_propietario,
        frecuencia,
        codigo_qr,
        usuario_id
      ]);

      const equipoId = result.insertId;

      await connection.query(`
        INSERT INTO movimientos (
          codigo_log, equipo_id, tipo_movimiento, usuario_responsable_id
        ) VALUES (?, ?, 'registro', ?)
      `, [
        `LOG${String(equipoId).padStart(6, '0')}`,
        equipoId,
        usuario_id
      ]);

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Equipo registrado exitosamente',
        data: { id: equipoId }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al registrar equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar equipo',
      error: error.message
    });
  }
});

// POST: Registrar ingreso
app.post('/api/movimientos/ingreso', async (req, res) => {
  try {
    const { equipo_id, usuario_id = 1, observaciones = '' } = req.body;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const [equipo] = await connection.query(
        'SELECT estado_actual FROM equipos WHERE id = ?',
        [equipo_id]
      );

      if (equipo.length === 0) {
        throw new Error('Equipo no encontrado');
      }

      if (equipo[0].estado_actual === 'dentro') {
        return res.status(400).json({
          success: false,
          message: 'El equipo ya está dentro del hospital'
        });
      }

      await connection.query(
        'UPDATE equipos SET estado_actual = "dentro" WHERE id = ?',
        [equipo_id]
      );

      const codigo_log = `LOG${Date.now()}`;
      await connection.query(`
        INSERT INTO movimientos (
          codigo_log, equipo_id, tipo_movimiento, 
          usuario_responsable_id, observaciones
        ) VALUES (?, ?, 'ingreso', ?, ?)
      `, [codigo_log, equipo_id, usuario_id, observaciones]);

      await connection.commit();

      res.json({
        success: true,
        message: 'Ingreso registrado exitosamente'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al registrar ingreso:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al registrar ingreso'
    });
  }
});

// POST: Registrar salida
app.post('/api/movimientos/salida', async (req, res) => {
  try {
    const { equipo_id, usuario_id = 1, observaciones = '' } = req.body;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const [equipo] = await connection.query(
        'SELECT estado_actual FROM equipos WHERE id = ?',
        [equipo_id]
      );

      if (equipo.length === 0) {
        throw new Error('Equipo no encontrado');
      }

      if (equipo[0].estado_actual === 'fuera') {
        return res.status(400).json({
          success: false,
          message: 'El equipo ya está fuera del hospital'
        });
      }

      await connection.query(
        'UPDATE equipos SET estado_actual = "fuera" WHERE id = ?',
        [equipo_id]
      );

      const codigo_log = `LOG${Date.now()}`;
      await connection.query(`
        INSERT INTO movimientos (
          codigo_log, equipo_id, tipo_movimiento, 
          usuario_responsable_id, observaciones
        ) VALUES (?, ?, 'salida', ?, ?)
      `, [codigo_log, equipo_id, usuario_id, observaciones]);

      await connection.commit();

      res.json({
        success: true,
        message: 'Salida registrada exitosamente'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al registrar salida:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al registrar salida'
    });
  }
});

// GET: Obtener todos los movimientos
app.get('/api/movimientos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.id,
        m.codigo_log,
        m.tipo_movimiento,
        m.fecha_hora,
        m.observaciones,
        e.codigo_equipo,
        e.nombre AS equipo_nombre,
        e.propietario,
        u.nombre AS usuario_responsable
      FROM movimientos m
      JOIN equipos e ON m.equipo_id = e.id
      LEFT JOIN usuarios u ON m.usuario_responsable_id = u.id
      ORDER BY m.fecha_hora DESC
    `);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener movimientos' });
  }
});

// GET: Estadísticas del dashboard
app.get('/api/estadisticas', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM equipos WHERE estado_actual = 'dentro' AND activo = TRUE) AS equipos_dentro,
        (SELECT COUNT(*) FROM equipos WHERE estado_actual = 'fuera' AND activo = TRUE) AS equipos_fuera,
        (SELECT COUNT(*) FROM equipos WHERE activo = TRUE) AS total_equipos,
        (SELECT COUNT(*) FROM movimientos WHERE DATE(fecha_hora) = CURDATE()) AS movimientos_hoy,
        (SELECT COUNT(*) FROM movimientos WHERE tipo_movimiento = 'ingreso' AND DATE(fecha_hora) = CURDATE()) AS ingresos_hoy,
        (SELECT COUNT(*) FROM movimientos WHERE tipo_movimiento = 'salida' AND DATE(fecha_hora) = CURDATE()) AS salidas_hoy
    `);

    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
});

// GET: Generar reporte
app.get('/api/reportes/generar', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT 
        m.codigo_log,
        m.tipo_movimiento,
        m.fecha_hora,
        e.codigo_equipo,
        e.nombre AS equipo_nombre,
        e.serial,
        e.propietario,
        u.nombre AS usuario_responsable
      FROM movimientos m
      JOIN equipos e ON m.equipo_id = e.id
      LEFT JOIN usuarios u ON m.usuario_responsable_id = u.id
    `;

    const params = [];

    if (fecha_inicio && fecha_fin) {
      query += ' WHERE DATE(m.fecha_hora) BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    query += ' ORDER BY m.fecha_hora DESC';

    const [rows] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: {
        periodo: fecha_inicio && fecha_fin ? `${fecha_inicio} al ${fecha_fin}` : 'Todos los registros',
        total_registros: rows.length,
        movimientos: rows
      }
    });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ success: false, message: 'Error al generar reporte' });
  }
});

// GET: Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, email, rol, estado FROM usuarios WHERE estado = "activo"'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API Sistema PDS006 - Hospital San Rafael de Tunja',
    version: '1.0.0',
    endpoints: {
      equipos: '/api/equipos',
      movimientos: '/api/movimientos',
      estadisticas: '/api/estadisticas',
      reportes: '/api/reportes/generar',
      usuarios: '/api/usuarios'
    }
  });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  🏥 Sistema PDS006 - Hospital San Rafael de Tunja     ║
║  🚀 Servidor Backend corriendo en:                    ║
║  📡 http://localhost:${PORT}                             ║
║  📊 Base de Datos: MySQL (hospital_pds006)            ║
╚════════════════════════════════════════════════════════╝
  `);
});