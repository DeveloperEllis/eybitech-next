"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/browserClient';

function CurrencyManagement() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    currency_from: 'USD',
    currency_to: 'CUP',
    rate: ''
  });

  const currencies = [
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', flag: '🇺🇸' },
    { code: 'CUP', name: 'Peso Cubano', symbol: '$', flag: '🇨🇺' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'MLC', name: 'MLC (Cuba)', symbol: 'MLC', flag: '🇨🇺' }
  ];

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('currency_from', { ascending: true });

      if (error) throw error;
      setRates(data || []);
    } catch (error) {
      console.error('Error cargando tasas:', error);
      alert('Error al cargar las tasas de cambio');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRate(null);
    setFormData({
      currency_from: 'USD',
      currency_to: 'CUP',
      rate: ''
    });
    setShowModal(true);
  };

  const handleEdit = (rate) => {
    setEditingRate(rate);
    setFormData({
      currency_from: rate.currency_from,
      currency_to: rate.currency_to,
      rate: rate.rate.toString()
    });
    setShowModal(true);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      alert('La tasa de cambio debe ser mayor a 0');
      return;
    }

    if (formData.currency_from === formData.currency_to) {
      alert('Las monedas de origen y destino deben ser diferentes');
      return;
    }

    try {
      setLoading(true);

      const rateData = {
        currency_from: formData.currency_from,
        currency_to: formData.currency_to,
        rate: parseFloat(formData.rate)
      };

      if (editingRate) {
        // Actualizar tasa existente
        const { error } = await supabase
          .from('exchange_rates')
          .update(rateData)
          .eq('id', editingRate.id);

        if (error) throw error;
        alert('✅ Tasa actualizada correctamente');
      } else {
        // Crear nueva tasa
        const { error } = await supabase
          .from('exchange_rates')
          .insert([rateData]);

        if (error) {
          if (error.code === '23505') {
            alert('❌ Ya existe una tasa para este par de monedas');
          } else {
            throw error;
          }
          return;
        }
        alert('✅ Tasa creada correctamente');
      }

      setShowModal(false);
      fetchRates();
    } catch (error) {
      console.error('Error guardando tasa:', error);
      alert('❌ Error al guardar la tasa: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rateId, currencyFrom, currencyTo) => {
    if (!confirm(`¿Estás seguro de eliminar la tasa ${currencyFrom} → ${currencyTo}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('exchange_rates')
        .delete()
        .eq('id', rateId);

      if (error) throw error;
      alert('✅ Tasa eliminada correctamente');
      fetchRates();
    } catch (error) {
      console.error('Error eliminando tasa:', error);
      alert('❌ Error al eliminar la tasa: ' + error.message);
    }
  };

  const getCurrencyInfo = (code) => {
    return currencies.find(c => c.code === code) || { name: code, symbol: '', flag: '💱' };
  };

  if (loading && rates.length === 0) {
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Convertidor de Moneda</h2>
          <p className="text-sm text-gray-600 mt-1">Administra las tasas de cambio</p>
        </div>
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Tasa</span>
        </button>
      </div>

      {/* Información de actualización */}
      {rates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900">Última actualización</h3>
              <p className="text-sm text-blue-700 mt-1">
                {new Date(rates[0].updated_at).toLocaleString('es-ES', {
                  dateStyle: 'long',
                  timeStyle: 'short'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de tasas - Responsive */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">De</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"></th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">A</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tasa</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No hay tasas configuradas</p>
                      <p className="text-sm mt-1">Crea la primera tasa de cambio</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rates.map((rate) => {
                  const fromInfo = getCurrencyInfo(rate.currency_from);
                  const toInfo = getCurrencyInfo(rate.currency_to);
                  return (
                    <tr key={rate.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{fromInfo.flag}</span>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{rate.currency_from}</div>
                            <div className="text-xs text-gray-500">{fromInfo.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <svg className="w-5 h-5 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{toInfo.flag}</span>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{rate.currency_to}</div>
                            <div className="text-xs text-gray-500">{toInfo.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">{rate.rate}</div>
                        <div className="text-xs text-gray-500">1 {rate.currency_from} = {rate.rate} {rate.currency_to}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(rate)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(rate.id, rate.currency_from, rate.currency_to)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {rates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium mb-1">No hay tasas configuradas</p>
              <p className="text-sm">Crea la primera tasa de cambio</p>
            </div>
          ) : (
            rates.map((rate) => {
              const fromInfo = getCurrencyInfo(rate.currency_from);
              const toInfo = getCurrencyInfo(rate.currency_to);
              return (
                <div key={rate.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{fromInfo.flag}</span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="text-3xl">{toInfo.flag}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{rate.rate}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">{rate.currency_from}</span> ({fromInfo.name}) → <span className="font-semibold">{rate.currency_to}</span> ({toInfo.name})
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      1 {rate.currency_from} = {rate.rate} {rate.currency_to}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(rate)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(rate.id, rate.currency_from, rate.currency_to)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de crear/editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)}></div>

            <div className="inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <form onSubmit={handleSave}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 sm:px-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {editingRate ? 'Editar Tasa' : 'Nueva Tasa'}
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
                <div className="px-6 py-6 sm:px-8 space-y-5">
                  {/* Moneda origen */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Moneda de origen *</label>
                    <select
                      value={formData.currency_from}
                      onChange={(e) => handleChange('currency_from', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!!editingRate}
                    >
                      {currencies.map(curr => (
                        <option key={curr.code} value={curr.code}>
                          {curr.flag} {curr.code} - {curr.name}
                        </option>
                      ))}
                    </select>
                    {editingRate && (
                      <p className="text-xs text-gray-500 mt-1">No se puede cambiar en edición</p>
                    )}
                  </div>

                  {/* Moneda destino */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Moneda de destino *</label>
                    <select
                      value={formData.currency_to}
                      onChange={(e) => handleChange('currency_to', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!!editingRate}
                    >
                      {currencies.map(curr => (
                        <option key={curr.code} value={curr.code}>
                          {curr.flag} {curr.code} - {curr.name}
                        </option>
                      ))}
                    </select>
                    {editingRate && (
                      <p className="text-xs text-gray-500 mt-1">No se puede cambiar en edición</p>
                    )}
                  </div>

                  {/* Tasa */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tasa de cambio *</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.rate}
                      onChange={(e) => handleChange('rate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 120.50"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">1 {formData.currency_from} = {formData.rate || '?'} {formData.currency_to}</p>
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
                    {loading ? 'Guardando...' : (editingRate ? 'Actualizar' : 'Crear Tasa')}
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

export default CurrencyManagement;
