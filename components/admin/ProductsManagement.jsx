"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/browserClient';

function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name'); // 'name', 'category', 'id'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    discount_percentage: 0,
    currency: 'USD',
    stock: '',
    vendor_id: '',
    category_id: '',
    review_url: '',
    review_type: 'youtube',
    is_on_sale: false,
    is_new_in_box: false,
    is_featured: false,
    sale_start_date: '',
    sale_end_date: '',
    external_link: '',
    external_link_label: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchVendors();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, searchBy, products]);

  const filterProducts = () => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }
    const term = searchTerm.toLowerCase().trim();
    const filtered = products.filter(product => {
      switch (searchBy) {
        case 'name':
          return product.name.toLowerCase().includes(term);
        case 'category':
          return product.category_id?.name?.toLowerCase().includes(term) || false;
        case 'id':
          return product.id.toLowerCase().includes(term);
        default:
          return true;
      }
    });
    setFilteredProducts(filtered);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          vendor_id(id, name),
          category_id(id, name, icon)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase.from('vendors').select('*');
      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      discount_percentage: 0,
      currency: 'USD',
      stock: '',
      vendor_id: '',
      category_id: '',
      review_url: '',
      review_type: 'youtube',
      is_on_sale: false,
      is_new_in_box: false,
      is_featured: false,
      sale_start_date: '',
      sale_end_date: '',
      external_link: '',
      external_link_label: ''
    });
    setImageFiles([]);
    setPreviewUrls([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setShowModal(true);
  };

  const handleEdit = async (product) => {
    setEditingProduct(product);
    let vendorId = '';
    if (product.vendor_id) {
      if (typeof product.vendor_id === 'object' && product.vendor_id.id) {
        vendorId = product.vendor_id.id;
      } else if (typeof product.vendor_id === 'string') {
        vendorId = product.vendor_id;
      }
    }
    let categoryId = '';
    if (product.category_id) {
      if (typeof product.category_id === 'object' && product.category_id.id) {
        categoryId = product.category_id.id;
      } else if (typeof product.category_id === 'string') {
        categoryId = product.category_id;
      }
    }
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      discount_percentage: product.discount_percentage || 0,
      currency: product.currency,
      stock: product.stock?.toString() || '0',
      vendor_id: vendorId,
      category_id: categoryId,
      review_url: product.review_url || '',
      review_type: product.review_type || 'youtube',
      is_on_sale: product.is_on_sale || false,
      is_new_in_box: product.is_new_in_box || false,
      is_featured: product.is_featured || false,
      sale_start_date: product.sale_start_date ? new Date(product.sale_start_date).toISOString().slice(0, 16) : '',
      sale_end_date: product.sale_end_date ? new Date(product.sale_end_date).toISOString().slice(0, 16) : '',
      external_link: product.external_link || '',
      external_link_label: product.external_link_label || ''
    });
    setImageFiles([]);
    setPreviewUrls([]);
    setImagesToDelete([]);
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('display_order', { ascending: true });
      if (error) throw error;
      setExistingImages(data || []);
    } catch (error) {
      console.error('Error cargando imágenes:', error);
      setExistingImages([]);
    }
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length - imagesToDelete.length + imageFiles.length + files.length;
    if (totalImages > 5) {
      alert('No puedes tener más de 5 imágenes por producto');
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const markImageForDeletion = (imageId) => {
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const unmarkImageForDeletion = (imageId) => {
    setImagesToDelete(prev => prev.filter(id => id !== imageId));
  };

  const moveImageUp = (index) => {
    if (index > 0) {
      setExistingImages(prev => {
        const newImages = [...prev];
        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
        // Actualizar display_order
        newImages.forEach((img, idx) => {
          img.display_order = idx + 1;
        });
        return newImages;
      });
    }
  };

  const moveImageDown = (index) => {
    setExistingImages(prev => {
      if (index < prev.length - 1) {
        const newImages = [...prev];
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        // Actualizar display_order
        newImages.forEach((img, idx) => {
          img.display_order = idx + 1;
        });
        return newImages;
      }
      return prev;
    });
  };

  const saveImageOrder = async () => {
    if (!editingProduct) return;
    
    try {
      // Actualizar el orden de las imágenes en la base de datos
      for (let i = 0; i < existingImages.length; i++) {
        await supabase
          .from('product_images')
          .update({ 
            display_order: i + 1,
            is_primary: i === 0 
          })
          .eq('id', existingImages[i].id);
      }
      
      // Actualizar image_url del producto con la primera imagen
      if (existingImages.length > 0) {
        await supabase
          .from('products')
          .update({ image_url: existingImages[0].image_url })
          .eq('id', editingProduct.id);
      }
      
      alert('✅ Orden de imágenes actualizado');
    } catch (error) {
      console.error('Error actualizando orden:', error);
      alert('❌ Error al actualizar el orden de las imágenes');
    }
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    setUploadProgress(0);
    const uploadPromises = imageFiles.map(async (file, index) => {
      try {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s+/g, '-')}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);
        if (error) {
          console.error(`Error subiendo imagen ${index + 1}:`, error);
          return null;
        }
        const { data: publicData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        setUploadProgress(Math.round(((index + 1) / imageFiles.length) * 100));
        return publicData.publicUrl;
      } catch (err) {
        console.error(`Error en imagen ${index + 1}:`, err);
        return null;
      }
    });
    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null);
  };

  const deleteMarkedImages = async () => {
    if (imagesToDelete.length === 0) return;
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .in('id', imagesToDelete);
      if (error) throw error;
    } catch (error) {
      console.error('Error eliminando imágenes:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.vendor_id || !formData.stock || !formData.category_id) {
      alert('Por favor completa todos los campos obligatorios (Nombre, precio, proveedor, cantidad y categoría)');
      return;
    }
    try {
      setLoading(true);
      const newImageUrls = await uploadImages();
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        discount_percentage: parseInt(formData.discount_percentage) || 0,
        currency: formData.currency,
        stock: parseInt(formData.stock),
        vendor_id: formData.vendor_id,
        category_id: formData.category_id,
        review_url: formData.review_url || null,
        review_type: formData.review_type || 'youtube',
        is_on_sale: formData.is_on_sale,
        is_new_in_box: formData.is_new_in_box,
        is_featured: formData.is_featured,
        sale_start_date: formData.sale_start_date ? new Date(formData.sale_start_date).toISOString() : null,
        sale_end_date: formData.sale_end_date ? new Date(formData.sale_end_date).toISOString() : null,
        external_link: formData.external_link || null,
        external_link_label: formData.external_link_label || null
      };
      let productId = editingProduct?.id;
      if (editingProduct) {
        // Primero eliminamos las imágenes marcadas para eliminación
        await deleteMarkedImages();
        
        // Insertar nuevas imágenes si las hay
        if (newImageUrls.length > 0) {
          const currentMaxOrder = existingImages.length > 0
            ? Math.max(...existingImages.map(img => img.display_order || 0))
            : 0;
          const imageRecords = newImageUrls.map((url, index) => ({
            product_id: editingProduct.id,
            image_url: url,
            display_order: currentMaxOrder + index + 1,
            is_primary: false // Se determinará después cuál es la primaria
          }));
          const { error: imgError } = await supabase
            .from('product_images')
            .insert(imageRecords);
          if (imgError) console.error('Error insertando imágenes:', imgError);
        }
        
        // Obtener todas las imágenes actuales después de las operaciones
        const { data: allCurrentImages } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', editingProduct.id)
          .order('display_order', { ascending: true });
        
        // Determinar la imagen primaria (la primera por orden de display_order)
        let primaryImageUrl = null;
        if (allCurrentImages && allCurrentImages.length > 0) {
          primaryImageUrl = allCurrentImages[0].image_url;
          
          // Actualizar las marcas de is_primary
          await supabase
            .from('product_images')
            .update({ is_primary: false })
            .eq('product_id', editingProduct.id);
          
          await supabase
            .from('product_images')
            .update({ is_primary: true })
            .eq('id', allCurrentImages[0].id);
        }
        
        // Actualizar el producto con la imagen primaria
        const { error } = await supabase
          .from('products')
          .update({
            ...productData,
            image_url: primaryImageUrl
          })
          .eq('id', editingProduct.id);
        if (error) throw error;
        
        // Revalidar el caché de la página principal
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (process.env.NEXT_PUBLIC_REVALIDATE_TOKEN) {
            headers['x-revalidate-token'] = process.env.NEXT_PUBLIC_REVALIDATE_TOKEN;
          }
          const revalidateRes = await fetch('/api/revalidate', {
            method: 'POST',
            headers,
            body: JSON.stringify({ path: '/' })
          });
          const revalidateData = await revalidateRes.json();
          console.log('✅ Revalidate response:', revalidateData);
        } catch (revalError) {
          console.warn('❌ No se pudo revalidar el caché:', revalError);
        }
        // Additionally request the products API to refresh its in-memory cache (if used)
        try {
          const productsRes = await fetch('/api/products', { method: 'POST' });
          const productsData = await productsRes.json();
          console.log('✅ Products cache refresh response:', productsData);
        } catch (prodRefreshErr) {
          console.warn('❌ No se pudo refrescar el cache de /api/products:', prodRefreshErr);
        }
        
        alert('✅ Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([{
            ...productData,
            image_url: newImageUrls.length > 0 ? newImageUrls[0] : null
          }])
          .select()
          .single();
        if (error) throw error;
        productId = newProduct.id;
        
        // Insertar imágenes del producto
        if (newImageUrls.length > 0) {
          const imageRecords = newImageUrls.map((url, index) => ({
            product_id: productId,
            image_url: url,
            display_order: index + 1,
            is_primary: index === 0
          }));
          const { error: imgError } = await supabase
            .from('product_images')
            .insert(imageRecords);
          if (imgError) console.error('Error insertando imágenes:', imgError);
        }
        
        // Revalidar el caché de la página principal
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (process.env.NEXT_PUBLIC_REVALIDATE_TOKEN) {
            headers['x-revalidate-token'] = process.env.NEXT_PUBLIC_REVALIDATE_TOKEN;
          }
          const revalidateRes = await fetch('/api/revalidate', {
            method: 'POST',
            headers,
            body: JSON.stringify({ path: '/' })
          });
          const revalidateData = await revalidateRes.json();
          console.log('✅ Revalidate response (create):', revalidateData);
        } catch (revalError) {
          console.warn('❌ No se pudo revalidar el caché:', revalError);
        }
        // Additionally request the products API to refresh its in-memory cache (if used)
        try {
          const productsRes = await fetch('/api/products', { method: 'POST' });
          const productsData = await productsRes.json();
          console.log('✅ Products cache refresh response (create):', productsData);
        } catch (prodRefreshErr) {
          console.warn('❌ No se pudo refrescar el cache de /api/products:', prodRefreshErr);
        }
        
        alert('✅ Producto creado correctamente');
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('❌ Error al guardar el producto: ' + error.message);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!confirm(`¿Estás seguro de eliminar "${productName}"?\n\nSe eliminarán también todas las imágenes, vistas y registros relacionados.`)) {
      return;
    }
    try {
      setLoading(true);
      const { data: images } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) throw error;
      if (images && images.length > 0) {
        for (const img of images) {
          try {
            const fileName = img.image_url.split('/').pop();
            await supabase.storage
              .from('product-images')
              .remove([fileName]);
          } catch (storageError) {
            console.warn('Error eliminando imagen del storage:', storageError);
          }
        }
      }
      // Revalidar el caché de la página principal
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (process.env.NEXT_PUBLIC_REVALIDATE_TOKEN) {
            headers['x-revalidate-token'] = process.env.NEXT_PUBLIC_REVALIDATE_TOKEN;
          }
          const revalidateRes = await fetch('/api/revalidate', {
            method: 'POST',
            headers,
            body: JSON.stringify({ path: '/' })
          });
          const revalidateData = await revalidateRes.json();
          console.log('✅ Revalidate response (delete):', revalidateData);
        } catch (revalError) {
          console.warn('❌ No se pudo revalidar el caché:', revalError);
        }
        // Additionally request the products API to refresh its in-memory cache (if used)
        try {
          const productsRes = await fetch('/api/products', { method: 'POST' });
          const productsData = await productsRes.json();
          console.log('✅ Products cache refresh response (delete):', productsData);
        } catch (prodRefreshErr) {
          console.warn('❌ No se pudo refrescar el cache de /api/products:', prodRefreshErr);
        }
        
      
      alert('✅ Producto eliminado correctamente');
      fetchProducts();
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('❌ Error al eliminar el producto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón crear */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Productos</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
            {searchTerm && ` encontrado${filteredProducts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium"
          >
            <option value="name">Por Nombre</option>
            <option value="category">Por Categoría</option>
            <option value="id">Por ID</option>
          </select>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                searchBy === 'name' ? 'Buscar por nombre...' :
                searchBy === 'category' ? 'Buscar por categoría...' :
                'Buscar por ID...'
              }
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600">
            {filteredProducts.length === 0 ? (
              <span className="text-red-600">No se encontraron productos</span>
            ) : (
              <span>
                Mostrando <span className="font-semibold">{filteredProducts.length}</span> de <span className="font-semibold">{products.length}</span> productos
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabla/Cards de productos */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Proveedor</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-lg font-medium">
                        {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
                      </p>
                      <p className="text-sm mt-1">
                        {searchTerm ? 'Intenta con otro término de búsqueda' : 'Crea tu primer producto para comenzar'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-12 w-12 object-cover" />
                          ) : (
                            <div className="h-12 w-12 flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{product.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.category_id ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">{product.category_id.icon}</span>
                          <span className="text-sm text-gray-700">{product.category_id.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Sin categoría</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{product.price} {product.currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' :
                        product.stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                        product.stock > 0 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock || 0} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.vendor_id?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="text-red-600 hover:text-red-900 inline-flex items-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-gray-200">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg font-medium mb-1">{searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}</p>
              <p className="text-sm">{searchTerm ? 'Intenta con otro término de búsqueda' : 'Crea tu primer producto para comenzar'}</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover" />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-400 font-mono mb-2">{product.id.substring(0, 8)}...</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">{product.price} {product.currency}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' :
                        product.stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                        product.stock > 0 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm mb-3">
                  {product.category_id && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>{product.category_id.icon} {product.category_id.name}</span>
                    </div>
                  )}
                  {product.vendor_id?.name && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{product.vendor_id.name}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(product)} className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Editar</span>
                  </button>
                  <button onClick={() => handleDelete(product.id, product.name)} className="flex-1 flex items-center justify-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text_sm font-semibold text-gray-700 mb-2">Nombre del producto *</label>
                <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ej: iPhone 15 Pro" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="4" placeholder="Describe las características del producto..." />
                {formData.description && (<p className="text-xs text-gray-500 mt-1">{formData.description.split(' ').length} palabras</p>)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Precio *</label>
                  <input type="number" value={formData.price} onChange={(e) => handleChange('price', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0.00" step="0.01" min="0" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Moneda *</label>
                  <select value={formData.currency} onChange={(e) => handleChange('currency', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="USD">USD ($)</option>
                    <option value="CUP">CUP (₱)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad disponible (Stock) *</label>
                <input type="number" value={formData.stock} onChange={(e) => handleChange('stock', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ej: 10" min="0" step="1" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
                <select value={formData.category_id} onChange={(e) => handleChange('category_id', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.icon && `${cat.icon} `}{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Proveedor *</label>
                <select value={formData.vendor_id} onChange={(e) => handleChange('vendor_id', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                  <option value="">Selecciona un proveedor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>
              <div className="border-t border-gray-200 pt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">📹 Video de demostración/review (opcional)</label>
                <p className="text-xs text-gray-500 mb-3">Agrega un enlace a YouTube, Facebook o Instagram donde los clientes puedan ver el producto en acción</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="col-span-2">
                    <input type="url" value={formData.review_url} onChange={(e) => handleChange('review_url', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://youtube.com/watch?v=..." />
                  </div>
                  <div>
                    <select value={formData.review_type} onChange={(e) => handleChange('review_type', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="youtube">📺 YouTube</option>
                      <option value="facebook">👍 Facebook</option>
                      <option value="instagram">📸 Instagram</option>
                      <option value="other">🎬 Otro</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2">🌎 Enlace de Compra Internacional (Opcional)</label>
                <p className="text-xs text-gray-500 mb-3">Agrega tu enlace de referido de Amazon, AliExpress, Shein, Alibaba, etc. para recibir comisiones por ventas internacionales</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tienda</label>
                    <select value={formData.external_link_label} onChange={(e) => handleChange('external_link_label', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                      <option value="">Selecciona una tienda</option>
                      <option value="Amazon">🛒 Amazon</option>
                      <option value="AliExpress">📦 AliExpress</option>
                      <option value="Shein">👗 Shein</option>
                      <option value="Alibaba">🏭 Alibaba</option>
                      <option value="eBay">🏪 eBay</option>
                      <option value="Wish">⭐ Wish</option>
                      <option value="Otro">🔗 Otro</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">URL del producto con tu código de referido</label>
                    <input type="url" value={formData.external_link} onChange={(e) => handleChange('external_link', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="https://amzn.to/tu-codigo-referido" />
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-5 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">🔥 Ofertas y Promociones</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">💰 Precio original (sin descuento)</label>
                    <input type="number" value={formData.original_price} onChange={(e) => handleChange('original_price', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="80.00" step="0.01" min="0" />
                    <p className="text-xs text-gray-500 mt-1">Precio que aparecerá tachado</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">🔥 % Descuento</label>
                    <input type="number" value={formData.discount_percentage} onChange={(e) => handleChange('discount_percentage', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="5" min="0" max="100" />
                    <p className="text-xs text-gray-500 mt-1">Ej: 5% sobre precio original</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Inicio de oferta (opcional)</label>
                    <input type="datetime-local" value={formData.sale_start_date} onChange={(e) => handleChange('sale_start_date', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fin de oferta (opcional)</label>
                    <input type="datetime-local" value={formData.sale_end_date} onChange={(e) => handleChange('sale_end_date', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Características especiales:</h4>
                  <label className="flex items-center gap-3 p-4 border-2 border-red-200 bg-red-50 rounded-xl hover:bg-red-100 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]">
                    <input type="checkbox" checked={formData.is_on_sale} onChange={(e) => handleChange('is_on_sale', e.target.checked)} className="w-6 h-6 text-red-600 border-red-300 rounded-lg focus:ring-red-500 focus:ring-2" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl animate-pulse">🔥</span>
                        <span className="font-bold text-red-800 text-lg">Producto en OFERTA</span>
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">HOT</span>
                      </div>
                      <p className="text-sm text-red-600 font-medium mt-1">Badge rojo llamativo en las tarjetas</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-green-200 bg-green-50 rounded-xl hover:bg-green-100 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]">
                    <input type="checkbox" checked={formData.is_new_in_box} onChange={(e) => handleChange('is_new_in_box', e.target.checked)} className="w-6 h-6 text-green-600 border-green-300 rounded-lg focus:ring-green-500 focus:ring-2" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">📦</span>
                        <span className="font-bold text-green-800 text-lg">Nuevo en CAJA</span>
                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
                      </div>
                      <p className="text-sm text-green-600 font-medium mt-1">Producto completamente nuevo, sin abrir</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-yellow-200 bg-yellow-50 rounded-xl hover:bg-yellow-100 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]">
                    <input type="checkbox" checked={formData.is_featured} onChange={(e) => handleChange('is_featured', e.target.checked)} className="w-6 h-6 text-yellow-600 border-yellow-300 rounded-lg focus:ring-yellow-500 focus:ring-2" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl animate-bounce">⭐</span>
                        <span className="font-bold text-yellow-800 text-lg">Producto DESTACADO</span>
                        <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">VIP</span>
                      </div>
                      <p className="text-sm text-yellow-600 font-medium mt-1">Se mostrará con estrella en el catálogo</p>
                    </div>
                  </label>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Imágenes del producto (máximo 5)</label>
                  {existingImages.length > 1 && (
                    <button 
                      type="button" 
                      onClick={saveImageOrder}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium hover:bg-green-200 transition-colors"
                    >
                      💾 Guardar orden
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  La primera imagen será la que aparezca en las tarjetas del catálogo. Puedes reordenar las imágenes existentes.
                </p>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
                {(previewUrls.length > 0 || existingImages.length > 0) && (
                  <div className="mt-4 space-y-4">
                    {/* Imágenes existentes con controles de orden */}
                    {existingImages.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          📸 Imágenes actuales 
                          {existingImages.length > 0 && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                              La primera es la principal
                            </span>
                          )}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {existingImages.map((img, index) => (
                            <div key={img.id} className={`relative group rounded-lg overflow-hidden border-2 ${
                              index === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            } ${imagesToDelete.includes(img.id) ? 'opacity-50 grayscale' : ''}`}>
                              <div className="flex items-center space-x-3 p-3">
                                <div className="relative">
                                  <img src={img.image_url} alt={`Imagen ${index + 1}`} className="w-20 h-20 object-cover rounded" />
                                  {index === 0 && (
                                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                      1
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    Imagen {index + 1} {index === 0 && '(Principal)'}
                                  </p>
                                  <p className="text-xs text-gray-500">Orden: {img.display_order || index + 1}</p>
                                </div>
                                <div className="flex flex-col space-y-1">
                                  {/* Controles de orden */}
                                  {existingImages.length > 1 && !imagesToDelete.includes(img.id) && (
                                    <div className="flex space-x-1">
                                      <button
                                        type="button"
                                        onClick={() => moveImageUp(index)}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Mover arriba"
                                      >
                                        ⬆️
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => moveImageDown(index)}
                                        disabled={index === existingImages.length - 1}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Mover abajo"
                                      >
                                        ⬇️
                                      </button>
                                    </div>
                                  )}
                                  {/* Botón eliminar */}
                                  {imagesToDelete.includes(img.id) ? (
                                    <button 
                                      type="button" 
                                      onClick={() => unmarkImageForDeletion(img.id)} 
                                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium hover:bg-green-200"
                                    >
                                      ↩️ Deshacer
                                    </button>
                                  ) : (
                                    <button 
                                      type="button" 
                                      onClick={() => markImageForDeletion(img.id)} 
                                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium hover:bg-red-200"
                                    >
                                      🗑️ Eliminar
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Imágenes nuevas */}
                    {previewUrls.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          ✨ Nuevas imágenes
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            Se agregarán al final
                          </span>
                        </h4>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {previewUrls.map((url, index) => (
                            <div key={`new-${index}`} className="relative rounded-lg overflow-hidden border border-green-200 bg-green-50">
                              <img src={url} alt={`Nueva imagen ${index + 1}`} className="w-full h-28 object-cover" />
                              <div className="absolute top-1 left-1 bg-green-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                +
                              </div>
                              <button 
                                type="button" 
                                onClick={() => removeNewImage(index)} 
                                className="absolute top-1 right-1 bg-white/90 hover:bg-white text-red-600 rounded-full p-1 shadow"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 bg-white pt-4">
                <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-200 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">Cancelar</button>
                  <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear Producto')}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsManagement;
