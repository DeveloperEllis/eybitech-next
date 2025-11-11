"use client";

import { useState, useEffect } from "react";
// Asegúrate de que esta ruta sea correcta para tu cliente
import { supabase } from '../../lib/supabase/browserClient'; 
import { FileEdit, Trash2, Plus, X, Upload } from "lucide-react";
import imageCompression from 'browser-image-compression'; 

// Nombre del bucket de Supabase Storage
const ADS_BUCKET = "ads-images"; 

// Definición del estado inicial del formulario de anuncios
const initialFormState = {
  title: "",
  description: "",
  image_url: "",
  image_path: "", 
  link_url: "",
  cta_text: "",
  start_date: "",
  end_date: "",
  is_active: true,
};

function AdsManagement() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  
  // 🛠️ Nuevo estado para la subida de archivos
  const [imageFile, setImageFile] = useState(null); 

  useEffect(() => {
    fetchAds();
  }, []);

  // --- Funciones de Data (Supabase) ---

  const fetchAds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ads") 
        .select(`*`) 
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error cargando anuncios:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🛠️ Lógica de subida de imagen a Supabase Storage con compresión automática
   * @returns {Object|null} Devuelve { path, url } si es exitoso, o null.
   */
  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      // Opciones de compresión optimizadas para anuncios
      const options = {
        maxSizeMB: 0.8, // Máximo 800KB (anuncios pueden ser un poco más grandes)
        maxWidthOrHeight: 2048, // Anuncios necesitan mejor resolución
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.88, // Calidad ligeramente superior para anuncios
      };

      console.log(`Comprimiendo imagen de anuncio...`);
      console.log(`Tamaño original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      
      // Comprimir la imagen
      const compressedFile = await imageCompression(file, options);
      
      console.log(`Tamaño comprimido: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Reducción: ${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`);

      // Generar un nombre de archivo único (siempre .jpg)
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
      const filePath = `public/${fileName}`;

      // Subir el archivo comprimido
      const { data, error } = await supabase.storage
        .from(ADS_BUCKET)
        .upload(filePath, compressedFile);

      if (error) {
        throw error;
      }
      
      // Obtener la URL pública del archivo subido
      const { data: publicUrlData } = supabase.storage
        .from(ADS_BUCKET)
        .getPublicUrl(filePath);

      return { 
          path: data.path, // 'public/nombre-archivo.jpg'
          url: publicUrlData.publicUrl 
      };

    } catch (error) {
      console.error("Error procesando/subiendo imagen:", error.message);
      alert("❌ Error al subir la imagen. Intenta de nuevo.");
      return null;
    }
  };
  
  // Borrar imagen anterior (opcional, pero buena práctica)
  const deleteOldImage = async (path) => {
    if (!path || path.includes('http')) return; // No borrar si es una URL externa o nulo
    try {
      await supabase.storage.from(ADS_BUCKET).remove([path]);
    } catch (e) {
      console.warn("No se pudo eliminar la imagen anterior:", e.message);
      // No bloqueamos el proceso si la eliminación falla
    }
  }


  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      alert('El título del anuncio es obligatorio');
      return;
    }

    setLoading(true);
    let imageInfo = {};

    // 1. Manejar la subida de archivos (solo si se seleccionó uno nuevo)
    if (imageFile) {
      // Si estamos editando y hay una imagen anterior, la borramos
      if (editingAd && editingAd.image_path) {
          await deleteOldImage(editingAd.image_path);
      }
      
      const uploadResult = await uploadImage(imageFile);
      
      if (!uploadResult) {
        setLoading(false);
        return; // Detiene el guardado si la subida falla
      }
      imageInfo = uploadResult;
    } else if (editingAd) {
      // Si no se sube una nueva, mantenemos la anterior
      imageInfo.path = editingAd.image_path;
      imageInfo.url = editingAd.image_url;
    }

    // 2. Preparar el payload de la base de datos
    const payload = {
      title: formData.title,
      description: formData.description,
      link_url: formData.link_url,
      cta_text: formData.cta_text,
      is_active: formData.is_active,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      
      // 🛠️ Actualizar los campos de imagen
      image_path: imageInfo.path || null,
      image_url: imageInfo.url || null, 
    };

    try {
      if (editingAd) {
        // Actualizar
        const { error } = await supabase
          .from('ads')
          .update(payload)
          .eq('id', editingAd.id);

        if (error) throw error;
        alert('✅ Anuncio actualizado correctamente');
      } else {
        // Crear
        const { error } = await supabase
          .from('ads')
          .insert([payload]);

        if (error) throw error;
        alert('✅ Anuncio creado correctamente');
      }

      handleCloseModal(); // Cierra y limpia estados
      fetchAds();
    } catch (error) {
      console.error('Error guardando anuncio:', error);
      alert('❌ Error al guardar el anuncio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adId, adTitle, adImagePath) => {
    if (!confirm(`¿Estás seguro de eliminar el anuncio "${adTitle}"? Esto también eliminará la imagen asociada.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // 1. Eliminar el registro en la DB
      const { error: dbError } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

      if (dbError) throw dbError;
      
      // 2. Eliminar el archivo del Storage
      if (adImagePath) {
          await deleteOldImage(adImagePath);
      }
      
      alert('✅ Anuncio y archivo eliminados correctamente');
      fetchAds();
    } catch (error) {
      console.error('Error eliminando anuncio:', error);
      alert('❌ Error al eliminar el anuncio: ' + error.message);
    } finally {
        setLoading(false);
    }
  };

  // --- Funciones de UI/Formulario ---

  const handleCreate = () => {
    setEditingAd(null);
    setFormData(initialFormState);
    setImageFile(null); // Limpiar archivo
    setShowModal(true);
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    const start_date = ad.start_date ? new Date(ad.start_date).toISOString().slice(0, 16) : '';
    const end_date = ad.end_date ? new Date(ad.end_date).toISOString().slice(0, 16) : '';

    setFormData({
      ...ad,
      start_date,
      end_date,
    });
    setImageFile(null); // Limpiar archivo al abrir en edición
    setShowModal(true);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
      setImageFile(e.target.files[0]);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAd(null);
    setFormData(initialFormState);
    setImageFile(null); // Limpiar archivo
  };

  // --- Renderizado del Componente (La tabla y estructura general no cambian) ---

  if (loading && ads.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER Y BOTÓN DE CREAR (sin cambios) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Anuncios</h2>
          <p className="text-sm text-gray-600 mt-1">
            {ads.length} {ads.length === 1 ? 'anuncio' : 'anuncios'}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Anuncio</span>
        </button>
      </div>

      {/* 2. LISTA DE ANUNCIOS (sin cambios funcionales, solo la llamada a handleDelete) */}
      {/* ... (Contenido de la lista de anuncios, omitido por brevedad) ... */}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                    Título
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                    Descripción
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">
                    Activo
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                    Vigencia
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider w-[100px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ads.length > 0 ? ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{ad.title}</div>
                      <div className="text-xs text-blue-600">{ad.cta_text || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {ad.description || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                          ad.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ad.is_active ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ad.start_date ? new Date(ad.start_date).toLocaleDateString() : 'N/A'} - 
                      {ad.end_date ? new Date(ad.end_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(ad)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <FileEdit className="w-5 h-5" />
                        </button>
                        <button
                          // 🛠️ Pasamos image_path para la eliminación del archivo
                          onClick={() => handleDelete(ad.id, ad.title, ad.image_path)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                    <tr>
                         <td colSpan={5} className="p-4 text-center text-gray-500">
                             No se encontraron anuncios.
                         </td>
                     </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Cards para móvil */}
          <div className="md:hidden divide-y divide-gray-200">
            {ads.length > 0 && ads.map((ad) => (
              <div key={ad.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{ad.title}</h3>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      ad.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ad.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="space-y-2 text-sm mb-3 text-gray-600">
                    <p className="truncate">Descripción: {ad.description || '-'}</p>
                    <p>Vigencia: {ad.start_date ? new Date(ad.start_date).toLocaleDateString() : 'N/A'} - {ad.end_date ? new Date(ad.end_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(ad)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    <FileEdit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id, ad.title, ad.image_path)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>


      {/* -------------------- 3. MODAL DE CREAR/EDITAR -------------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCloseModal}></div>

            {/* Contenido del Modal */}
            <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <form onSubmit={handleSave}>
                {/* Header del Modal */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 sm:px-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {editingAd ? 'Editar Anuncio' : 'Nuevo Anuncio'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Body del Modal (Scrollable) */}
                <div className="px-6 py-6 sm:px-8 space-y-5 max-h-[60vh] overflow-y-auto">
                  
                  {/* Título y CTA (sin cambios) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Título *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Título del anuncio (máx. 255 caracteres)"
                        maxLength={255}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Texto del Botón (CTA)</label>
                      <input
                        type="text"
                        value={formData.cta_text}
                        onChange={(e) => handleChange('cta_text', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ej: Comprar ahora (máx. 100 caracteres)"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  {/* Descripción (sin cambios) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows="2"
                      placeholder="Breve descripción del anuncio"
                    />
                  </div>

                  {/* 🛠️ CAMPO DE SUBIDA DE IMAGEN Y PREVIEW */}
                  <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Imagen del Anuncio
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                          {/* Input de archivo */}
                          <label 
                              htmlFor="image-upload" 
                              className="w-full sm:w-auto flex-1 cursor-pointer flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 p-4 rounded-lg hover:border-green-500 transition-colors text-gray-600 hover:text-green-600"
                          >
                              <Upload className="w-5 h-5" />
                              <span className="text-sm font-medium">
                                  {imageFile ? imageFile.name : (editingAd ? 'Selecciona una nueva imagen' : 'Selecciona un archivo (JPG, PNG)')}
                              </span>
                              <input
                                  id="image-upload"
                                  type="file"
                                  accept="image/png, image/jpeg, image/webp"
                                  onChange={handleFileChange}
                                  className="hidden"
                                  disabled={loading}
                              />
                          </label>

                          {/* Preview o Imagen Actual */}
                          {(imageFile || formData.image_url) && (
                              <div className="w-20 h-20 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden">
                                  {/* Mostrar el archivo recién seleccionado o la URL existente */}
                                  <img 
                                      src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url} 
                                      alt="Preview" 
                                      className="w-full h-full object-cover"
                                  />
                              </div>
                          )}
                      </div>
                      
                      {/* Campo de URL de Destino */}
                      <div className="mt-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">URL de Destino (Link)</label>
                          <input
                            type="url"
                            value={formData.link_url}
                            onChange={(e) => handleChange('link_url', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="https://..."
                          />
                      </div>
                      {/* Nota sobre campos ocultos (image_url y image_path) */}
                       <p className="mt-2 text-xs text-gray-500">
                          La URL de la imagen y la ruta de almacenamiento se completan automáticamente al subir.
                       </p>
                  </div>
                  
                  {/* Fechas (sin cambios) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha y Hora de Inicio</label>
                      <input
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => handleChange('start_date', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha y Hora de Fin</label>
                      <input
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => handleChange('end_date', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Checkbox Activo (sin cambios) */}
                  <div className="flex items-center pt-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm font-semibold text-gray-700">
                      Anuncio Activo (Controla si se muestra o no)
                    </label>
                  </div>
                </div>

                {/* Footer del Modal (Botones) */}
                <div className="bg-gray-50 px-6 py-4 sm:px-8 flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : (editingAd ? 'Actualizar Anuncio' : 'Crear Anuncio')}
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

export default AdsManagement;