import React, { useState, useEffect } from 'react';
import { Camera, QrCode, Download, Search, Plus, LogOut, LogIn, FileText, Shield, Clock, Package, AlertCircle, CheckCircle, XCircle, Filter, Calendar, User, Printer, RefreshCw, BarChart3, TrendingUp, Settings, Activity, Wrench } from 'lucide-react';
import { api } from './services/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [equipment, setEquipment] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    equipos_dentro: 0,
    equipos_fuera: 0,
    total_equipos: 0,
    movimientos_hoy: 0
  });

  const [formData, setFormData] = useState({
    equipmentType: 'tecnologico',
    name: '',
    serial: '',
    owner: '',
    ownerType: 'personal',
    frequency: 'frecuente',
    photo: null,
    qrCode: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadEquipment(),
        loadMovements(),
        loadStatistics()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotificationMessage('Error al cargar datos del servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadEquipment = async () => {
    try {
      const response = await api.getEquipos();
      console.log('📦 Respuesta de equipos:', response);
      
      if (response.success && response.data) {
        const mappedEquipment = response.data.map(eq => ({
          id: eq.id,
          code: eq.codigo_equipo,
          name: eq.nombre,
          serial: eq.serial,
          type: eq.tipo_equipo,
          owner: eq.propietario,
          ownerType: eq.tipo_propietario,
          frequency: eq.frecuencia,
          qrCode: eq.codigo_qr,
          status: eq.estado_actual === 'dentro' ? 'inside' : 'outside',
          entryTime: eq.fecha_registro,
          photo: eq.foto_url
        }));
        
        console.log('✅ Equipos mapeados:', mappedEquipment);
        setEquipment(mappedEquipment);
      }
    } catch (error) {
      console.error('❌ Error al cargar equipos:', error);
      showNotificationMessage('Error al cargar equipos', 'error');
    }
  };

  const loadMovements = async () => {
    try {
      const response = await api.getMovimientos();
      if (response.success && response.data) {
        const mappedLogs = response.data.map(mov => ({
          id: mov.id,
          equipmentId: mov.codigo_equipo,
          equipmentName: mov.equipo_nombre,
          action: mov.tipo_movimiento === 'ingreso' ? 'entry' : 
                  mov.tipo_movimiento === 'salida' ? 'exit' : 'registered',
          timestamp: mov.fecha_hora,
          user: mov.usuario_responsable || 'Sistema',
          owner: mov.propietario
        }));
        setLogs(mappedLogs);
      }
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await api.getEstadisticas();
      if (response.success && response.data) {
        setEstadisticas(response.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const generateQRCode = () => {
    return `QR-${Date.now().toString(36).toUpperCase()}`;
  };

  const handleRegisterEquipment = async () => {
    if (!formData.name || !formData.serial || !formData.owner) {
      showNotificationMessage('Por favor complete todos los campos obligatorios', 'error');
      return;
    }

    setLoading(true);
    try {
      const qrCode = formData.frequency === 'frecuente' ? generateQRCode() : formData.serial;
      const codigoEquipo = `EQ${Date.now().toString().slice(-6)}`;

      const equipoData = {
        codigo_equipo: codigoEquipo,
        nombre: formData.name,
        serial: formData.serial,
        tipo_equipo: formData.equipmentType,
        propietario: formData.owner,
        tipo_propietario: formData.ownerType,
        frecuencia: formData.frequency,
        codigo_qr: qrCode,
        usuario_id: 1
      };

      const response = await api.createEquipo(equipoData);
      
      if (response.success) {
        showNotificationMessage(`Equipo ${formData.name} registrado exitosamente`, 'success');
        resetForm();
        await loadAllData();
      }
    } catch (error) {
      console.error('Error al registrar equipo:', error);
      showNotificationMessage('Error al registrar equipo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEntry = async (eq) => {
    setLoading(true);
    try {
      const response = await api.registrarIngreso(eq.id, 1, 'Ingreso autorizado');
      
      if (response.success) {
        showNotificationMessage(`✓ Ingreso autorizado: ${eq.name}`, 'success');
        await loadAllData();
      }
    } catch (error) {
      console.error('Error al registrar ingreso:', error);
      const errorMsg = error.response?.data?.message || 'Error al registrar ingreso';
      showNotificationMessage(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExit = async (eq) => {
    setLoading(true);
    try {
      const response = await api.registrarSalida(eq.id, 1, 'Salida autorizada');
      
      if (response.success) {
        showNotificationMessage(`✓ Salida registrada: ${eq.name}`, 'success');
        await loadAllData();
      }
    } catch (error) {
      console.error('Error al registrar salida:', error);
      const errorMsg = error.response?.data?.message || 'Error al registrar salida';
      showNotificationMessage(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      equipmentType: 'tecnologico',
      name: '',
      serial: '',
      owner: '',
      ownerType: 'personal',
      frequency: 'frecuente',
      photo: null,
      qrCode: ''
    });
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await api.generarReporte(dateFilter.start, dateFilter.end);
      
      if (response.success) {
        const reportData = response.data;
        
        const reportContent = `
═══════════════════════════════════════════════════════════════
    HOSPITAL SAN RAFAEL DE TUNJA
    REPORTE DE CONTROL DE EQUIPOS
═══════════════════════════════════════════════════════════════

Generado: ${new Date().toLocaleString('es-CO')}
Período: ${reportData.periodo}

RESUMEN:
- Total de Movimientos: ${reportData.total_registros}
- Ingresos: ${reportData.movimientos.filter(m => m.tipo_movimiento === 'ingreso').length}
- Salidas: ${reportData.movimientos.filter(m => m.tipo_movimiento === 'salida').length}

DETALLE:
${reportData.movimientos.map(mov => `
${mov.codigo_log} | ${new Date(mov.fecha_hora).toLocaleString('es-CO')}
Equipo: ${mov.equipo_nombre} (${mov.codigo_equipo})
Serial: ${mov.serial}
Acción: ${mov.tipo_movimiento.toUpperCase()}
Propietario: ${mov.propietario}
Usuario: ${mov.usuario_responsable || 'Sistema'}
`).join('\n')}
═══════════════════════════════════════════════════════════════
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_HSR_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        showNotificationMessage('✓ Reporte descargado exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
      showNotificationMessage('Error al generar reporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter(eq => 
    eq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const insideEquipment = equipment.filter(eq => eq.status === 'inside');
  const outsideEquipment = equipment.filter(eq => eq.status === 'outside');

  return (
    <div className="app-container">
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <RefreshCw style={{ animation: 'spin 1s linear infinite' }} size={32} />
            <span style={{ fontWeight: 600 }}>Cargando...</span>
          </div>
        </div>
      )}

      {showNotification && (
        <div className="notification-toast">
          <div className={`toast ${notificationType}`}>
            {notificationType === 'success' ? <CheckCircle /> : <XCircle />}
            <span>{notificationMessage}</span>
          </div>
        </div>
      )}

      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Shield />
            </div>
            <div className="sidebar-logo-text">
              <h2>Hospital Control</h2>
              <p>Equipment System</p>
            </div>
          </div>
        </div>

        <div className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <BarChart3 />
            <span>Dashboard</span>
          </button>
          <button className={`nav-item ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
            <Plus />
            <span>Equipos</span>
          </button>
          <button className={`nav-item ${activeTab === 'entry-exit' ? 'active' : ''}`} onClick={() => setActiveTab('entry-exit')}>
            <Activity />
            <span>Monitoreo</span>
          </button>
          <button className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <Clock />
            <span>Mantenimiento</span>
          </button>
          <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <Settings />
            <span>Configuración</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">AU</div>
            <div className="user-details">
              <h4>Admin Usuario</h4>
              <p>admin@hospital.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="top-header">
          <div className="header-content">
            <div className="header-title">
              <h1>Panel de Control</h1>
              <p>Gestión de equipos médicos</p>
            </div>
            <div className="header-status">
              <div className="status-dot"></div>
              <span>Sistema Activo</span>
            </div>
          </div>
        </div>

        <div className="content-area">
          {activeTab === 'dashboard' && (
            <div>
              <div className="stats-grid">
                <div className="stat-card green">
                  <div className="stat-card-header">
                    <div>
                      <div className="stat-label">En Mantenimiento</div>
                      <div className="stat-value">{estadisticas.equipos_dentro}</div>
                      <div className="stat-description">{estadisticas.movimientos_hoy} movimientos hoy</div>
                    </div>
                    <div className="stat-icon"><Wrench /></div>
                  </div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-card-header">
                    <div>
                      <div className="stat-label">Fuera de Servicio</div>
                      <div className="stat-value">{estadisticas.equipos_fuera}</div>
                      <div className="stat-description">Requieren atención urgente</div>
                    </div>
                    <div className="stat-icon"><AlertCircle /></div>
                  </div>
                </div>
                <div className="stat-card purple">
                  <div className="stat-card-header">
                    <div>
                      <div className="stat-label">Total Equipos</div>
                      <div className="stat-value">{estadisticas.total_equipos}</div>
                      <div className="stat-description">Registrados en sistema</div>
                    </div>
                    <div className="stat-icon"><Package /></div>
                  </div>
                </div>
                <div className="stat-card orange">
                  <div className="stat-card-header">
                    <div>
                      <div className="stat-label">Movimientos</div>
                      <div className="stat-value">{logs.length}</div>
                      <div className="stat-description">Registros totales</div>
                    </div>
                    <div className="stat-icon"><TrendingUp /></div>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <div className="table-header">
                  <div className="table-header-content">
                    <div className="table-title">
                      <h2>Equipos Críticos</h2>
                      <p>Estado actual de equipos prioritarios</p>
                    </div>
                    <div className="table-badge">{insideEquipment.length} equipos</div>
                  </div>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Equipo</th>
                      <th>Serial</th>
                      <th>Propietario</th>
                      <th>Hora Ingreso</th>
                      <th>Código QR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insideEquipment.length === 0 ? (
                      <tr>
                        <td colSpan="6">
                          <div className="empty-state">
                            <Package />
                            <p>No hay equipos dentro del hospital</p>
                            <p>Los equipos aparecerán aquí cuando se registre su ingreso</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      insideEquipment.map(eq => (
                        <tr key={eq.id}>
                          <td><strong>{eq.code || eq.id}</strong></td>
                          <td>
                            <div className="equipment-info">
                              <div className={`equipment-icon ${eq.type === 'tecnologico' ? 'tech' : 'bio'}`}>
                                <Package />
                              </div>
                              <div>
                                <div className="equipment-name">{eq.name}</div>
                                <div className="equipment-type">{eq.type === 'tecnologico' ? 'Tecnológico' : 'Biomédico'}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="serial-badge">{eq.serial}</span></td>
                          <td>
                            <div>
                              <div className="equipment-name">{eq.owner}</div>
                              <div className="equipment-type">{eq.ownerType}</div>
                            </div>
                          </td>
                          <td>{eq.entryTime ? new Date(eq.entryTime).toLocaleTimeString('es-CO') : 'N/A'}</td>
                          <td>
                            <div className="qr-badge">
                              <QrCode size={16} />
                              <span>{eq.qrCode}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="form-container">
              <div className="form-header">
                <div className="form-header-icon"><Plus size={24} /></div>
                <div>
                  <h2>Registrar Nuevo Equipo</h2>
                  <p>Complete el formulario para agregar un equipo</p>
                </div>
              </div>
              <div className="form-body">
                <div className="form-grid">
                  <div className="form-group half">
                    <label className="form-label">Tipo de Equipo *</label>
                    <select value={formData.equipmentType} onChange={(e) => setFormData({...formData, equipmentType: e.target.value})} className="form-select">
                      <option value="tecnologico">🖥️ Tecnológico</option>
                      <option value="biomedico">🏥 Biomédico</option>
                    </select>
                  </div>
                  <div className="form-group half">
                    <label className="form-label">Frecuencia *</label>
                    <select value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})} className="form-select">
                      <option value="frecuente">⭐ Frecuente (con QR)</option>
                      <option value="esporadico">📅 Esporádico (sin QR)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nombre del Equipo *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ej: Laptop Dell Latitude 5420" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Serial/Código *</label>
                    <input type="text" value={formData.serial} onChange={(e) => setFormData({...formData, serial: e.target.value})} placeholder="Ej: DLL123456789" className="form-input" />
                  </div>
                  <div className="form-group half">
                    <label className="form-label">Propietario *</label>
                    <input type="text" value={formData.owner} onChange={(e) => setFormData({...formData, owner: e.target.value})} placeholder="Nombre completo" className="form-input" />
                  </div>
                  <div className="form-group half">
                    <label className="form-label">Tipo *</label>
                    <select value={formData.ownerType} onChange={(e) => setFormData({...formData, ownerType: e.target.value})} className="form-select">
                      <option value="personal">👤 Personal</option>
                      <option value="proveedor">🏢 Proveedor</option>
                      <option value="contratista">🔧 Contratista</option>
                    </select>
                  </div>
                  {formData.frequency === 'esporadico' && (
                    <div className="form-group">
                      <div className="form-alert">
                        <div className="alert-icon"><Camera size={20} /></div>
                        <div className="alert-content">
                          <p>Registro Fotográfico Requerido</p>
                          <p>Para equipos esporádicos es obligatorio adjuntar fotografía</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-actions">
                  <button onClick={handleRegisterEquipment} className="btn btn-success">
                    <Plus size={20} />
                    Registrar Equipo
                  </button>
                  <button onClick={resetForm} className="btn btn-secondary">
                    <RefreshCw size={20} />
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'entry-exit' && (
            <div className="table-container">
              <div className="table-header">
                <div className="table-header-content">
                  <div className="table-title">
                    <h2>Control de Ingreso/Salida</h2>
                    <p>Gestión de movimientos en tiempo real</p>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="search-container">
                      <Search className="search-icon" size={20} />
                      <input type="text" placeholder="Buscar equipo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                    </div>
                    <button className="btn btn-primary">
                      <QrCode size={20} />
                      Escanear QR
                    </button>
                  </div>
                </div>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Equipo</th>
                    <th>Serial</th>
                    <th>Propietario</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state">
                          <AlertCircle />
                          <p>No se encontraron equipos</p>
                          <p>Intente con otros términos de búsqueda</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEquipment.map(eq => (
                      <tr key={eq.id}>
                        <td><strong>{eq.code || eq.id}</strong></td>
                        <td>
                          <div className="equipment-info">
                            <div className={`equipment-icon ${eq.type === 'tecnologico' ? 'tech' : 'bio'}`}>
                              <Package />
                            </div>
                            <div>
                              <div className="equipment-name">{eq.name}</div>
                              <div className="equipment-type">{eq.type === 'tecnologico' ? 'Tecnológico' : 'Biomédico'}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="serial-badge">{eq.serial}</span></td>
                        <td>
                          <div>
                            <div className="equipment-name">{eq.owner}</div>
                            <div className="equipment-type">{eq.ownerType}</div>
                          </div>
                        </td>
                        <td>
                          <div className={`status-badge ${eq.status}`}>
                            <div className="status-indicator"></div>
                            {eq.status === 'inside' ? 'Dentro' : 'Fuera'}
                          </div>
                        </td>
                        <td>
                          {eq.status === 'outside' ? (
                            <button onClick={() => handleEntry(eq)} className="btn btn-success">
                              <LogIn size={16} />
                              Ingreso
                            </button>
                          ) : (
                            <button onClick={() => handleExit(eq)} className="btn btn-danger">
                              <LogOut size={16} />
                              Salida
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="table-container">
              <div className="table-header">
                <div className="table-header-content">
                  <div className="table-title">
                    <h2>Historial de Transacciones</h2>
                    <p>Registro completo de movimientos</p>
                  </div>
                </div>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Log</th>
                    <th>Fecha/Hora</th>
                    <th>Equipo</th>
                    <th>Acción</th>
                    <th>Propietario</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state">
                          <FileText />
                          <p>No hay registros</p>
                          <p>Los logs aparecerán aquí</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.slice().reverse().map(log => (
                      <tr key={log.id}>
                        <td><strong>{log.id}</strong></td>
                        <td>
                          <div>
                            <div className="equipment-name">{new Date(log.timestamp).toLocaleDateString('es-CO')}</div>
                            <div className="equipment-type">{new Date(log.timestamp).toLocaleTimeString('es-CO')}</div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="equipment-name">{log.equipmentName}</div>
                            <div className="equipment-type">{log.equipmentId}</div>
                          </div>
                        </td>
                        <td>
                          <div className={`status-badge ${log.action === 'entry' ? 'inside' : 'outside'}`}>
                            {log.action === 'entry' ? <LogIn size={14} /> : <LogOut size={14} />}
                            {log.action === 'entry' ? 'INGRESO' : log.action === 'exit' ? 'SALIDA' : 'REGISTRO'}
                          </div>
                        </td>
                        <td>{log.owner}</td>
                        <td>{log.user}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="form-container">
              <div className="form-header">
                <div className="form-header-icon"><Download size={24} /></div>
                <div>
                  <h2>Generación de Reportes</h2>
                  <p>Exportar informes para auditoría</p>
                </div>
              </div>
              <div className="form-body">
                <div className="form-grid">
                  <div className="form-group half">
                    <label className="form-label">Fecha Inicio</label>
                    <input type="date" value={dateFilter.start} onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})} className="form-input" />
                  </div>
                  <div className="form-group half">
                    <label className="form-label">Fecha Fin</label>
                    <input type="date" value={dateFilter.end} onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})} className="form-input" />
                  </div>
                </div>
                <div className="stats-grid" style={{ marginTop: '24px' }}>
                  <div className="stat-card blue">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Total Registros</div>
                        <div className="stat-value">{logs.length}</div>
                      </div>
                      <div className="stat-icon"><FileText /></div>
                    </div>
                  </div>
                  <div className="stat-card green">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Ingresos</div>
                        <div className="stat-value">{logs.filter(l => l.action === 'entry').length}</div>
                      </div>
                      <div className="stat-icon"><LogIn /></div>
                    </div>
                  </div>
                  <div className="stat-card orange">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Salidas</div>
                        <div className="stat-value">{logs.filter(l => l.action === 'exit').length}</div>
                      </div>
                      <div className="stat-icon"><LogOut /></div>
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={generateReport} className="btn btn-success">
                    <Download size={20} />
                    Descargar Reporte
                  </button>
                  <button onClick={() => setDateFilter({ start: '', end: '' })} className="btn btn-secondary">
                    <RefreshCw size={20} />
                    Limpiar
                  </button>
                  <button className="btn btn-primary">
                    <Printer size={20} />
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;