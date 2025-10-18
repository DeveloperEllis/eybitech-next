"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/browserClient';

function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    icon: '',
    title: '',
    short_desc: '',
    description: '',
    benefits: [''],
    urgency: '',
    cta: '',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    display_order: 0,
    is_active: true
  });

  const colorOptions = [
    { name: 'Azul', value: 'blue', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Morado', value: 'purple', gradient: 'from-purple-500 to-pink-500' },
    { name: 'Verde', value: 'green', gradient: 'from-green-500 to-emerald-500' },
    { name: 'Rojo', value: 'red', gradient: 'from-red-500 to-orange-500' },
    { name: 'Rosa', value: 'pink', gradient: 'from-pink-500 to-rose-500' },
    { name: 'Amarillo', value: 'yellow', gradient: 'from-yellow-500 to-orange-500' },
    { name: 'Índigo', value: 'indigo', gradient: 'from-indigo-500 to-purple-500' },
    { name: 'Teal', value: 'teal', gradient: 'from-teal-500 to-cyan-500' }
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error cargando servicios:', error);
      alert('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      icon: '',
      title: '',
      short_desc: '',
      description: '',
      benefits: [''],
      urgency: '',
      cta: '',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      display_order: services.length + 1,
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      icon: service.icon,
      title: service.title,
      short_desc: service.short_desc,
      description: service.description,
      benefits: service.benefits || [''],
      urgency: service.urgency || '',
      cta: service.cta || '',
      color: service.color || 'blue',
      gradient: service.gradient || 'from-blue-500 to-cyan-500',
      display_order: service.display_order,
      is_active: service.is_active
    });
    setShowModal(true);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData(prev => ({ ...prev, benefits: newBenefits }));
  };

  const addBenefit = () => {
    setFormData(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
  };

  const removeBenefit = (index) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, benefits: newBenefits.length > 0 ? newBenefits : [''] }));
  };

  const handleColorChange = (colorValue) => {
    const selectedColor = colorOptions.find(c => c.value === colorValue);
    setFormData(prev => ({
      ...prev,
      color: colorValue,
      gradient: selectedColor?.gradient || 'from-blue-500 to-cyan-500'
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.short_desc) {
      alert('El título y la descripción corta son obligatorios');
      return;
    }

    const cleanedBenefits = formData.benefits.filter(b => b.trim() !== '');

    try {
      setLoading(true);
      const dataToSave = {
        ...formData,
        benefits: cleanedBenefits
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(dataToSave)
          .eq('id', editingService.id);

        if (error) throw error;
        alert('✅ Servicio actualizado correctamente');
      } else {
        const { error } = await supabase
          .from('services')
          .insert([dataToSave]);

        if (error) throw error;
        alert('✅ Servicio creado correctamente');
      }

      setShowModal(false);
      fetchServices();
    } catch (error) {
      console.error('Error guardando servicio:', error);
      alert('❌ Error al guardar el servicio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;
      fetchServices();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('❌ Error al actualizar el estado');
    }
  };

  const handleDelete = async (serviceId, serviceTitle) => {
    if (!confirm(`¿Estás seguro de eliminar el servicio "${serviceTitle}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      alert('✅ Servicio eliminado correctamente');
      fetchServices();
    } catch (error) {
      console.error('Error eliminando servicio:', error);
      alert('❌ Error al eliminar el servicio: ' + error.message);
    }
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Servicios</h2>
          <p className="text-sm text-gray-600 mt-1">Administra los servicios que ofreces</p>
        </div>
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Grid de servicios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div 
            key={service.id} 
            className={`bg-white rounded-lg shadow-sm border-2 transition-all hover:shadow-md ${
              service.is_active ? 'border-gray-200' : 'border-gray-300 bg-gray-50 opacity-60'
            }`}
          >
            <div className="p-4">
              {/* Header con icono y estado */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${service.gradient} rounded-lg flex items-center justify-center text-3xl flex-shrink-0`}>
                    {service.icon || '🛠️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{service.title}</h3>
                    <span className="text-xs text-gray-500">Orden: {service.display_order}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(service)}
                  className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                    service.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {service.is_active ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              {/* Descripción corta */}
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {service.short_desc}
              </p>

              {/* CTA y Urgencia */}
              {service.cta && (
                <div className="text-xs text-blue-600 font-medium mb-2">
                  📞 {service.cta}
                </div>
              )}

              {/* Beneficios */}
              {service.benefits && service.benefits.length > 0 && (
                <div className="text-xs text-gray-500 mb-3">
                  ✓ {service.benefits.length} beneficios
                </div>
              )}

              {/* Acciones */}
              <div className="flex space-x-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(service.id, service.title)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de crear/editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)}></div>

            <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <form onSubmit={handleSave}>
                {/* Header */}
                <div className={`bg-gradient-to-r ${formData.gradient} px-6 py-5 sm:px-8`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6 sm:px-8 space-y-5 max-h-[70vh] overflow-y-auto">
                  {/* Icono y Título */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Icono *
                      </label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => handleChange('icon', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-3xl"
                        placeholder="🛠️"
                        maxLength="2"
                        required
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Título del servicio *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Reparación de Laptops"
                        required
                      />
                    </div>
                  </div>

                  {/* Descripción corta */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción corta * (Para la card)
                    </label>
                    <textarea
                      value={formData.short_desc}
                      onChange={(e) => handleChange('short_desc', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="2"
                      placeholder="Descripción breve y atractiva..."
                      required
                    />
                  </div>

                  {/* Descripción completa */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción completa
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="3"
                      placeholder="Descripción detallada del servicio..."
                    />
                  </div>

                  {/* Beneficios */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Beneficios del servicio
                    </label>
                    <div className="space-y-2">
                      {formData.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => handleBenefitChange(index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder={`Beneficio ${index + 1}`}
                          />
                          {formData.benefits.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBenefit(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addBenefit}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Agregar beneficio
                      </button>
                    </div>
                  </div>

                  {/* Urgencia y CTA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mensaje de urgencia
                      </label>
                      <input
                        type="text"
                        value={formData.urgency}
                        onChange={(e) => handleChange('urgency', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="¡Oferta limitada!"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Texto del botón (CTA)
                      </label>
                      <input
                        type="text"
                        value={formData.cta}
                        onChange={(e) => handleChange('cta', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Solicitar ahora"
                      />
                    </div>
                  </div>

                  {/* Color y Orden */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Color del tema
                      </label>
                      <select
                        value={formData.color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {colorOptions.map(color => (
                          <option key={color.value} value={color.value}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Orden de visualización
                      </label>
                      <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => handleChange('display_order', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Estado activo */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Servicio activo (visible en el sitio)
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 sm:px-8 flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : (editingService ? 'Actualizar' : 'Crear Servicio')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServicesManagement;
