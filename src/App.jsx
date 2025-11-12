import React, { useState, useEffect } from 'react';
import { Camera, QrCode, Download, Search, Plus, LogOut, LogIn, FileText, Shield, Clock, Package, AlertCircle, CheckCircle, XCircle, Filter, Calendar, User, Printer, RefreshCw, BarChart3, TrendingUp } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [equipment, setEquipment] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  // Form states
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
    loadSampleData();
  }, []);

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const loadSampleData = () => {
    const sampleEquipment = [
      {
        id: 'EQ001',
        type: 'tecnologico',
        name: 'Laptop Dell Latitude 5420',
        serial: 'DLL123456',
        owner: 'Dr. Juan Pérez',
        ownerType: 'personal',
        frequency: 'frecuente',
        qrCode: 'QR-EQ001',
        status: 'inside',
        entryTime: new Date().toISOString(),
        photo: null
      },
      {
        id: 'EQ002',
        type: 'biomedico',
        name: 'Monitor de Signos Vitales',
        serial: 'MSV789012',
        owner: 'Proveedor MedTech',
        ownerType: 'proveedor',
        frequency: 'esporadico',
        qrCode: 'MSV789012',
        status: 'outside',
        entryTime: null,
        photo: null
      }
    ];

    const sampleLogs = [
      {
        id: 'LOG001',
        equipmentId: 'EQ001',
        equipmentName: 'Laptop Dell Latitude 5420',
        action: 'entry',
        timestamp: new Date().toISOString(),
        user: 'Guardia Principal - Juan García',
        owner: 'Dr. Juan Pérez'
      }
    ];

    setEquipment(sampleEquipment);
    setLogs(sampleLogs);
  };

  const generateQRCode = () => {
    return `QR-${Date.now().toString(36).toUpperCase()}`;
  };

  const handleRegisterEquipment = () => {
    if (!formData.name || !formData.serial || !formData.owner) {
      showNotificationMessage('Por favor complete todos los campos obligatorios', 'error');
      return;
    }

    const newEquipment = {
      id: `EQ${String(equipment.length + 1).padStart(3, '0')}`,
      ...formData,
      qrCode: formData.frequency === 'frecuente' ? generateQRCode() : formData.serial,
      status: 'outside',
      entryTime: null,
      exitTime: null
    };

    setEquipment([...equipment, newEquipment]);
    
    const log = {
      id: `LOG${String(logs.length + 1).padStart(3, '0')}`,
      equipmentId: newEquipment.id,
      equipmentName: newEquipment.name,
      action: 'registered',
      timestamp: new Date().toISOString(),
      user: 'Sistema Automatizado',
      owner: newEquipment.owner
    };
    
    setLogs([...logs, log]);
    
    showNotificationMessage(`Equipo ${newEquipment.name} registrado exitosamente`, 'success');
    resetForm();
  };

  const handleEntry = (eq) => {
    const updatedEquipment = equipment.map(e => 
      e.id === eq.id 
        ? { ...e, status: 'inside', entryTime: new Date().toISOString() }
        : e
    );
    
    setEquipment(updatedEquipment);
    
    const log = {
      id: `LOG${String(logs.length + 1).padStart(3, '0')}`,
      equipmentId: eq.id,
      equipmentName: eq.name,
      action: 'entry',
      timestamp: new Date().toISOString(),
      user: 'Guardia Principal - Juan García',
      owner: eq.owner
    };
    
    setLogs([...logs, log]);
    showNotificationMessage(`✓ Ingreso autorizado: ${eq.name}`, 'success');
  };

  const handleExit = (eq) => {
    const updatedEquipment = equipment.map(e => 
      e.id === eq.id 
        ? { ...e, status: 'outside', exitTime: new Date().toISOString() }
        : e
    );
    
    setEquipment(updatedEquipment);
    
    const log = {
      id: `LOG${String(logs.length + 1).padStart(3, '0')}`,
      equipmentId: eq.id,
      equipmentName: eq.name,
      action: 'exit',
      timestamp: new Date().toISOString(),
      user: 'Guardia Principal - Juan García',
      owner: eq.owner
    };
    
    setLogs([...logs, log]);
    showNotificationMessage(`✓ Salida registrada: ${eq.name}`, 'success');
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

  const generateReport = () => {
    let filteredLogs = logs;
    
    if (dateFilter.start && dateFilter.end) {
      filteredLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= new Date(dateFilter.start) && logDate <= new Date(dateFilter.end);
      });
    }
    
    const reportContent = `
═══════════════════════════════════════════════════════════════
    HOSPITAL SAN RAFAEL DE TUNJA
    REPORTE DE CONTROL DE EQUIPOS TECNOLÓGICOS Y BIOMÉDICOS
═══════════════════════════════════════════════════════════════

Fecha de Generación: ${new Date().toLocaleString('es-CO')}
${dateFilter.start && dateFilter.end ? `Período Analizado: ${dateFilter.start} al ${dateFilter.end}` : 'Período: Todos los registros históricos'}

───────────────────────────────────────────────────────────────
RESUMEN EJECUTIVO
───────────────────────────────────────────────────────────────
Total de Movimientos Registrados: ${filteredLogs.length}
Ingresos Totales: ${filteredLogs.filter(l => l.action === 'entry').length}
Salidas Totales: ${filteredLogs.filter(l => l.action === 'exit').length}
Equipos Actualmente Dentro: ${equipment.filter(e => e.status === 'inside').length}

───────────────────────────────────────────────────────────────
DETALLE DE MOVIMIENTOS
───────────────────────────────────────────────────────────────
${filteredLogs.map((log, idx) => `
${idx + 1}. REGISTRO ${log.id}
   ├─ Fecha/Hora: ${new Date(log.timestamp).toLocaleString('es-CO')}
   ├─ Equipo: ${log.equipmentName}
   ├─ ID Equipo: ${log.equipmentId}
   ├─ Acción: ${log.action === 'entry' ? '↓ INGRESO AL HOSPITAL' : log.action === 'exit' ? '↑ SALIDA DEL HOSPITAL' : '📋 NUEVO REGISTRO'}
   ├─ Propietario: ${log.owner}
   └─ Responsable: ${log.user}
`).join('\n')}

───────────────────────────────────────────────────────────────
EQUIPOS REGISTRADOS EN EL SISTEMA
───────────────────────────────────────────────────────────────
${equipment.map((eq, idx) => `
${idx + 1}. ${eq.name}
   ├─ ID: ${eq.id}
   ├─ Serial: ${eq.serial}
   ├─ Tipo: ${eq.type === 'tecnologico' ? 'Tecnológico' : 'Biomédico'}
   ├─ Propietario: ${eq.owner}
   ├─ QR: ${eq.qrCode}
   └─ Estado: ${eq.status === 'inside' ? '✓ Dentro del hospital' : '○ Fuera del hospital'}
`).join('\n')}

═══════════════════════════════════════════════════════════════
Sistema PDS006 - Hospital San Rafael de Tunja
Proyecto Integrador - Calidad de Software
═══════════════════════════════════════════════════════════════
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Equipos_HSR_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    showNotificationMessage('✓ Reporte generado y descargado exitosamente', 'success');
  };

  const filteredEquipment = equipment.filter(eq => 
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const insideEquipment = equipment.filter(eq => eq.status === 'inside');
  const outsideEquipment = equipment.filter(eq => eq.status === 'outside');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl ${
            notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {notificationType === 'success' ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
            <span className="font-medium">{notificationMessage}</span>
          </div>
        </div>
      )}

      {/* Header Premium */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-lg">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Hospital San Rafael de Tunja</h1>
                <p className="text-blue-100 text-base mt-1 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Sistema de Control de Equipos Médicos y Tecnológicos</span>
                  <span className="bg-blue-500/50 px-3 py-1 rounded-full text-xs font-semibold ml-2">PDS006</span>
                </p>
              </div>
            </div>
            <div className="text-right bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
              <div className="flex items-center space-x-3 mb-2">
                <User className="w-5 h-5 text-blue-200" />
                <p className="text-sm font-semibold text-blue-50">Guardia Principal</p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-blue-200">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Premium */}
      <div className="bg-white shadow-lg border-b-2 border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex space-x-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'blue' },
              { id: 'register', label: 'Registrar Equipo', icon: Plus, color: 'green' },
              { id: 'entry-exit', label: 'Control Ingreso/Salida', icon: LogIn, color: 'purple' },
              { id: 'logs', label: 'Historial de Logs', icon: FileText, color: 'orange' },
              { id: 'reports', label: 'Reportes', icon: Download, color: 'indigo' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-5 font-semibold transition-all relative group ${
                  activeTab === tab.id
                    ? `text-${tab.color}-600 bg-${tab.color}-50`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? `text-${tab.color}-600` : 'text-gray-500'}`} />
                <span className="hidden md:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600`}></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Stats Cards Premium */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-semibold uppercase tracking-wide">Equipos Dentro</p>
                    <p className="text-5xl font-bold mt-3">{insideEquipment.length}</p>
                    <p className="text-green-100 text-xs mt-2">Actualmente en instalaciones</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                    <LogIn className="w-10 h-10" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Total Equipos</p>
                    <p className="text-5xl font-bold mt-3">{equipment.length}</p>
                    <p className="text-blue-100 text-xs mt-2">Registrados en sistema</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                    <Package className="w-10 h-10" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-semibold uppercase tracking-wide">Movimientos</p>
                    <p className="text-5xl font-bold mt-3">{logs.length}</p>
                    <p className="text-purple-100 text-xs mt-2">Registros hoy</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="w-10 h-10" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-semibold uppercase tracking-wide">Equipos Fuera</p>
                    <p className="text-5xl font-bold mt-3">{outsideEquipment.length}</p>
                    <p className="text-orange-100 text-xs mt-2">Fuera de instalaciones</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                    <LogOut className="w-10 h-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment Table Premium */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Equipos Dentro del Hospital</h2>
                    <p className="text-blue-100 text-sm mt-1">Monitoreo en tiempo real de equipos en instalaciones</p>
                  </div>
                  <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <span className="text-white font-bold text-lg">{insideEquipment.length} equipos</span>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Equipo</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Serial</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Propietario</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Hora Ingreso</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Código QR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {insideEquipment.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">No hay equipos dentro del hospital actualmente</p>
                          <p className="text-gray-400 text-sm mt-2">Los equipos aparecerán aquí cuando se registre su ingreso</p>
                        </td>
                      </tr>
                    ) : (
                      insideEquipment.map(eq => (
                        <tr key={eq.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-gray-900">{eq.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{eq.name}</p>
                                <p className="text-xs text-gray-500">{eq.type === 'tecnologico' ? 'Tecnológico' : 'Biomédico'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700 font-mono bg-gray-100 px-3 py-1 rounded-lg">{eq.serial}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{eq.owner}</p>
                              <p className="text-xs text-gray-500 capitalize">{eq.ownerType}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {eq.entryTime ? new Date(eq.entryTime).toLocaleTimeString('es-CO') : 'N/A'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {eq.entryTime ? new Date(eq.entryTime).toLocaleDateString('es-CO') : ''}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg w-fit">
                              <QrCode className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-mono font-semibold text-blue-700">{eq.qrCode}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Register Equipment Tab */}
        {activeTab === 'register' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Registrar Nuevo Equipo</h2>
                    <p className="text-green-100 text-sm mt-1">Complete el formulario para agregar un equipo al sistema</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Tipo de Equipo *
                    </label>
                    <select
                      value={formData.equipmentType}
                      onChange={(e) => setFormData({...formData, equipmentType: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                    >
                      <option value="tecnologico">🖥️ Tecnológico</option>
                      <option value="biomedico">🏥 Biomédico</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Frecuencia de Ingreso *
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                    >
                      <option value="frecuente">⭐ Frecuente (con Código QR)</option>
                      <option value="esporadico">📅 Esporádico (sin Código QR)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Nombre del Equipo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Laptop Dell Latitude 5420, Monitor de Signos Vitales"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Serial/Código del Equipo *
                  </label>
                  <input
                    type="text"
                    value={formData.serial}
                    onChange={(e) => setFormData({...formData, serial: e.target.value})}
                    placeholder="Ej: DLL123456789, MSV-2024-001"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Propietario *
                    </label>
                    <input
                      type="text"
                      value={formData.owner}
                      onChange={(e) => setFormData({...formData, owner: e.target.value})}
                      placeholder="Nombre completo del propietario"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Tipo de Propietario *
                    </label>
                    <select
                      value={formData.ownerType}
                      onChange={(e) => setFormData({...formData, ownerType: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                    >
                      <option value="personal">👤 Personal del Hospital</option>
                      <option value="proveedor">🏢 Proveedor/Empresa</option>
                      <option value="contratista">🔧 Contratista Externo</option>
                    </select>
                  </div>
                </div>

                {formData.frequency === 'esporadico' && (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-yellow-400 p-3 rounded-xl">
                        <Camera className="w-6 h-6 text-yellow-800" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-yellow-900">Registro Fotográfico Requerido</p>
                        <p className="text-sm text-yellow-700 mt-2">
                          Para equipos de ingreso esporádico, es obligatorio adjuntar fotografía del equipo como medida de seguridad adicional según el protocolo PDS006.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4 pt-6 border-t-2 border-gray-100">
                  <button
                    onClick={handleRegisterEquipment}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-3"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Registrar Equipo en el Sistema</span>
                  </button>
                  
                  <button
                    onClick={resetForm}
                    className="px-8 py-4 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center space-x-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Limpiar Formulario</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entry/Exit Tab */}
        {activeTab === 'entry-exit' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                      <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Control de Ingreso y Salida</h2>
                      <p className="text-purple-100 text-sm mt-1">Gestión de movimientos de equipos en tiempo real</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre, serial o propietario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-white focus:border-white bg-white/20 backdrop-blur-sm text-white placeholder-white/70 font-medium w-80"
                      />
                    </div>
                    <button className="bg-white text-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 transition-all font-bold shadow-lg flex items-center space-x-2">
                      <QrCode className="w-5 h-5" />
                      <span>Escanear QR</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Información del Equipo</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Serial</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Propietario</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado Actual</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredEquipment.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium text-lg">No se encontraron equipos</p>
                          <p className="text-gray-400 text-sm mt-2">Intente con otros términos de búsqueda o registre un nuevo equipo</p>
                        </td>
                      </tr>
                    ) : (
                      filteredEquipment.map(eq => (
                        <tr key={eq.id} className="hover:bg-purple-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">{eq.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-3 rounded-xl ${eq.type === 'tecnologico' ? 'bg-blue-100' : 'bg-red-100'}`}>
                                <Package className={`w-6 h-6 ${eq.type === 'tecnologico' ? 'text-blue-600' : 'text-red-600'}`} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{eq.name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {eq.type === 'tecnologico' ? '🖥️ Tecnológico' : '🏥 Biomédico'} • 
                                  {eq.frequency === 'frecuente' ? ' ⭐ Frecuente' : ' 📅 Esporádico'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700 font-mono bg-gray-100 px-3 py-2 rounded-lg">{eq.serial}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{eq.owner}</p>
                                <p className="text-xs text-gray-500 capitalize">{eq.ownerType}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {eq.status === 'inside' ? (
                              <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-bold text-green-800">Dentro del Hospital</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                <span className="text-sm font-bold text-gray-800">Fuera del Hospital</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {eq.status === 'outside' ? (
                                <button
                                  onClick={() => handleEntry(eq)}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                                >
                                  <LogIn className="w-4 h-4" />
                                  <span>Registrar Ingreso</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleExit(eq)}
                                  className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                                >
                                  <LogOut className="w-4 h-4" />
                                  <span>Registrar Salida</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Historial de Transacciones</h2>
                  <p className="text-orange-100 text-sm mt-1">Registro completo de todos los movimientos del sistema</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID Log</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha y Hora</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Equipo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Acción Realizada</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Propietario</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Usuario Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium text-lg">No hay registros de transacciones</p>
                        <p className="text-gray-400 text-sm mt-2">Los logs aparecerán aquí cuando se registren movimientos</p>
                      </td>
                    </tr>
                  ) : (
                    logs.slice().reverse().map((log, index) => (
                      <tr key={log.id} className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono font-bold text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">{log.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(log.timestamp).toLocaleDateString('es-CO', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(log.timestamp).toLocaleTimeString('es-CO')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{log.equipmentName}</p>
                            <p className="text-xs text-gray-500 font-mono mt-1">{log.equipmentId}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {log.action === 'entry' ? (
                            <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                              <LogIn className="w-4 h-4 text-green-700" />
                              <span className="text-sm font-bold text-green-800">INGRESO</span>
                            </div>
                          ) : log.action === 'exit' ? (
                            <div className="inline-flex items-center space-x-2 bg-red-100 px-4 py-2 rounded-full">
                              <LogOut className="w-4 h-4 text-red-700" />
                              <span className="text-sm font-bold text-red-800">SALIDA</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full">
                              <Plus className="w-4 h-4 text-blue-700" />
                              <span className="text-sm font-bold text-blue-800">REGISTRO</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{log.owner}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{log.user}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Generación de Reportes</h2>
                    <p className="text-indigo-100 text-sm mt-1">Exportar informes detallados para auditoría y análisis</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-500 p-3 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-blue-900">Información del Reporte</p>
                      <p className="text-sm text-blue-700 mt-2">
                        Genere reportes personalizados de movimientos de equipos por rango de fechas. 
                        Ideal para procesos de auditoría, validación de cumplimiento y análisis estadístico.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Fecha de Inicio</span>
                    </label>
                    <input
                      type="date"
                      value={dateFilter.start}
                      onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Fecha de Fin</span>
                    </label>
                    <input
                      type="date"
                      value={dateFilter.end}
                      onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-6 text-lg">Resumen Estadístico</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-600">Total de Registros</p>
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{logs.length}</p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-green-600">Total de Ingresos</p>
                        <LogIn className="w-5 h-5 text-green-500" />
                      </div>
                      <p className="text-3xl font-bold text-green-700">
                        {logs.filter(l => l.action === 'entry').length}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-5 border-2 border-red-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-red-600">Total de Salidas</p>
                        <LogOut className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="text-3xl font-bold text-red-700">
                        {logs.filter(l => l.action === 'exit').length}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-700 text-sm">Equipos en el Sistema:</h4>
                    <div className="flex flex-wrap gap-2">
                      {equipment.slice(0, 8).map(eq => (
                        <span key={eq.id} className="bg-white px-4 py-2 rounded-full text-sm font-medium border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                          {eq.name}
                        </span>
                      ))}
                      {equipment.length > 8 && (
                        <span className="text-sm text-gray-500 px-4 py-2 font-semibold">
                          +{equipment.length - 8} equipos más
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={generateReport}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-3"
                  >
                    <Download className="w-6 h-6" />
                    <span>Descargar Reporte Completo</span>
                  </button>
                  
                  <button
                    onClick={() => setDateFilter({ start: '', end: '' })}
                    className="px-8 py-4 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center space-x-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Limpiar Filtros</span>
                  </button>

                  <button
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center space-x-2"
                  >
                    <Printer className="w-5 h-5" />
                    <span>Imprimir</span>
                  </button>
                </div>

                <div className="border-t-2 pt-6 mt-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Vista Previa de Registros Recientes</span>
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-80 overflow-y-auto border-2 border-gray-200">
                    {logs.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No hay registros disponibles</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {logs.slice(-15).reverse().map(log => (
                          <div key={log.id} className="bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg ${
                                  log.action === 'entry' ? 'bg-green-100' :
                                  log.action === 'exit' ? 'bg-red-100' : 'bg-blue-100'
                                }`}>
                                  {log.action === 'entry' ? (
                                    <LogIn className="w-4 h-4 text-green-600" />
                                  ) : log.action === 'exit' ? (
                                    <LogOut className="w-4 h-4 text-red-600" />
                                  ) : (
                                    <Plus className="w-4 h-4 text-blue-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-gray-900">{log.equipmentName}</p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {log.owner} • {log.action === 'entry' ? 'INGRESO' : log.action === 'exit' ? 'SALIDA' : 'REGISTRO'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-500 font-medium">
                                  {new Date(log.timestamp).toLocaleDateString('es-CO')}
                                </span>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(log.timestamp).toLocaleTimeString('es-CO')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Premium */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-gray-300">
                Sistema PDS006 - Hospital San Rafael de Tunja
              </p>
              <p className="text-sm text-gray-400 mt-2">
                © 2025 Todos los derechos reservados • Proyecto Integrador - Calidad de Software
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm font-semibold text-gray-300">Sistema Seguro y Certificado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;