"use client";
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase/browserClient';

const TYPES = [
  { key: 'blog', label: 'Blog' },
  { key: 'tutorial', label: 'Tutorial' },
];

export default function BlogManagement() {
  const [activeType, setActiveType] = useState('blog');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    tags: '', // comma separated
    is_published: true,
    is_featured: false,
  });
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [activeType]);

  const tableName = useMemo(() => (activeType === 'blog' ? 'blog_posts' : 'tutorial_posts'), [activeType]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (e) {
      console.error('Error cargando posts:', e);
      alert('Error al cargar posts');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter(p =>
      p.title?.toLowerCase().includes(term) ||
      p.slug?.toLowerCase().includes(term) ||
      p.tags?.some?.(t => t.toLowerCase().includes(term))
    );
  }, [posts, search]);

  const openCreate = () => {
    setEditingPost(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', cover_image: '', tags: '', is_published: true, is_featured: false });
    setShowModal(true);
  };

  const openEdit = (post) => {
    setEditingPost(post);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      cover_image: post.cover_image || '',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      is_published: !!post.is_published,
      is_featured: !!post.is_featured,
    });
    setShowModal(true);
  };

  const toTagsArray = (value) => value.split(',').map(t => t.trim()).filter(Boolean);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      alert('El título es obligatorio');
      return;
    }
    try {
      setLoading(true);
      // Optional upload of cover image file
      let coverUrl = form.cover_image?.trim() || null;
      if (coverFile) {
        const fname = `${Date.now()}-${Math.random().toString(36).slice(2)}-${coverFile.name.replace(/\s+/g,'-')}`;
        const { data: up, error: upErr } = await supabase.storage.from('post-covers').upload(fname, coverFile);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('post-covers').getPublicUrl(fname);
        coverUrl = pub.publicUrl;
      }
      const base = {
        title: form.title.trim(),
        slug: form.slug?.trim() || null,
        excerpt: form.excerpt?.trim() || null,
        content: form.content?.trim() || null,
        cover_image: coverUrl,
        tags: toTagsArray(form.tags),
        is_published: !!form.is_published,
        is_featured: !!form.is_featured,
      };
      if (editingPost) {
        const { error } = await supabase.from(tableName).update(base).eq('id', editingPost.id);
        if (error) throw error;
        alert('✅ Publicación actualizada');
      } else {
        // Optional RPC to generate unique slug if available
        let payload = base;
        if (!base.slug) {
          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc('generate_unique_slug', { base_title: base.title });
            if (!rpcError && rpcData) payload = { ...payload, slug: rpcData };
          } catch (_) {}
        }
        const { error } = await supabase.from(tableName).insert([payload]);
        if (error) throw error;
        alert('✅ Publicación creada');
      }
      setShowModal(false);
      fetchPosts();
    } catch (e) {
      console.error('Error guardando publicación:', e);
      alert('❌ Error al guardar: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (post) => {
    try {
      const { error } = await supabase.from(tableName).update({ is_published: !post.is_published }).eq('id', post.id);
      if (error) throw error;
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: !p.is_published } : p));
    } catch (e) {
      console.error(e);
      alert('No se pudo actualizar el estado');
    }
  };

  const toggleFeatured = async (post) => {
    try {
      const { error } = await supabase.from(tableName).update({ is_featured: !post.is_featured }).eq('id', post.id);
      if (error) throw error;
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_featured: !p.is_featured } : p));
    } catch (e) {
      console.error(e);
      alert('No se pudo actualizar destacado');
    }
  };

  const handleDelete = async (post) => {
    if (!confirm(`¿Eliminar "${post.title}"?`)) return;
    try {
      const { error } = await supabase.from(tableName).delete().eq('id', post.id);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== post.id));
    } catch (e) {
      console.error(e);
      alert('No se pudo eliminar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {TYPES.map(t => (
            <button key={t.key} onClick={() => setActiveType(t.key)} className={`px-3 py-2 rounded-md text-sm font-medium ${activeType === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 sm:flex-none w-full sm:w-auto flex items-center gap-2">
          <div className="relative flex-1">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por título, slug o tag..." className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
          </div>
          <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium">Nueva publicación</button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Título</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Publicación</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Destacado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="font-medium text-gray-900">{p.title}</div>
                    <div className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{p.slug}</td>
                  <td className="px-6 py-3">
                    <button onClick={() => togglePublished(p)} className={`px-3 py-1 rounded-full text-xs font-semibold ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.is_published ? 'Publicado' : 'Borrador'}
                    </button>
                  </td>
                  <td className="px-6 py-3">
                    <button onClick={() => toggleFeatured(p)} className={`px-3 py-1 rounded-full text-xs font-semibold ${p.is_featured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.is_featured ? 'Sí' : 'No'}
                    </button>
                  </td>
                  <td className="px-6 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => handleDelete(p)} className="text-red-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Sin resultados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-gray-200">
          {filtered.map(p => (
            <div key={p.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{p.title}</div>
                  <div className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-right space-x-2">
                  <button onClick={() => openEdit(p)} className="text-blue-600 text-sm">Editar</button>
                  <button onClick={() => handleDelete(p)} className="text-red-600 text-sm">Eliminar</button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <button onClick={() => togglePublished(p)} className={`px-2 py-1 rounded ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {p.is_published ? 'Publicado' : 'Borrador'}
                </button>
                <button onClick={() => toggleFeatured(p)} className={`px-2 py-1 rounded ${p.is_featured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  Destacado: {p.is_featured ? 'Sí' : 'No'}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-500">Sin resultados</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">{editingPost ? 'Editar' : 'Nueva'} {activeType === 'blog' ? 'Publicación' : 'Tutorial'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Título *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
                  <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto si lo dejas vacío" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (separados por coma)</label>
                  <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="nextjs, supabase, tips" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Extracto</label>
                <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows="2" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contenido</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows="6" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Imagen de portada (URL)</label>
                <input value={form.cover_image} onChange={e => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <div className="mt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">o subir archivo</label>
                  <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {coverFile && <p className="text-xs text-gray-500 mt-1">{coverFile.name}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} />
                  Publicado
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
                  Destacado
                </label>
              </div>
              <div className="sticky bottom-0 bg-white pt-4">
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100">Cancelar</button>
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">{editingPost ? 'Actualizar' : 'Crear'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
