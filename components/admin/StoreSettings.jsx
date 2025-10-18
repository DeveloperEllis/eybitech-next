"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/browserClient';

export default function StoreSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rowId, setRowId] = useState(null);
  const [form, setForm] = useState({
    store_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    locality: '',
    schedule: '',
    facebook_url: '',
    instagram_url: '',
    tiktok_url: '',
    youtube_url: '',
    twitter_url: '',
    whatsapp_url: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data) {
          setRowId(data.id);
          setForm({
            store_name: data.store_name || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
            email: data.email || '',
            address: data.address || '',
            locality: data.locality || '',
            schedule: data.schedule || '',
            facebook_url: data.facebook_url || '',
            instagram_url: data.instagram_url || '',
            tiktok_url: data.tiktok_url || '',
            youtube_url: data.youtube_url || '',
            twitter_url: data.twitter_url || '',
            whatsapp_url: data.whatsapp_url || ''
          });
        }
      } catch (e) {
        console.error('Error cargando ajustes:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (rowId) {
        const { error } = await supabase.from('store_settings').update(form).eq('id', rowId);
        if (error) throw error;
        alert('✅ Ajustes actualizados');
      } else {
        const { data, error } = await supabase.from('store_settings').insert([form]).select().single();
        if (error) throw error;
        setRowId(data.id);
        alert('✅ Ajustes guardados');
      }
    } catch (e) {
      console.error(e);
      alert('❌ No se pudieron guardar los ajustes: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ajustes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Ajustes de la Tienda</h2>
          <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <section>
            <h3 className="font-semibold text-gray-900 mb-3">Información básica</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre de la tienda" value={form.store_name} onChange={v => handleChange('store_name', v)} placeholder="EYBITECH" />
              <Field label="Correo" type="email" value={form.email} onChange={v => handleChange('email', v)} placeholder="contacto@dominio.com" />
              <Field label="Teléfono" value={form.phone} onChange={v => handleChange('phone', v)} placeholder="+53 ..." />
              <Field label="WhatsApp" value={form.whatsapp} onChange={v => handleChange('whatsapp', v)} placeholder="+53 ..." />
              <Field label="Dirección" value={form.address} onChange={v => handleChange('address', v)} placeholder="Calle, número, ciudad" />
              <Field label="Localidad/Ciudad" value={form.locality} onChange={v => handleChange('locality', v)} placeholder="La Habana" />
              <Field label="Horario" value={form.schedule} onChange={v => handleChange('schedule', v)} placeholder="Lun–Vie 9:00–18:00" />
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-3">Redes sociales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Facebook" value={form.facebook_url} onChange={v => handleChange('facebook_url', v)} placeholder="https://facebook.com/tu_pagina" />
              <Field label="Instagram" value={form.instagram_url} onChange={v => handleChange('instagram_url', v)} placeholder="https://instagram.com/tu_pagina" />
              <Field label="TikTok" value={form.tiktok_url} onChange={v => handleChange('tiktok_url', v)} placeholder="https://tiktok.com/@tu_pagina" />
              <Field label="YouTube" value={form.youtube_url} onChange={v => handleChange('youtube_url', v)} placeholder="https://youtube.com/@tu_canal" />
              <Field label="Twitter/X" value={form.twitter_url} onChange={v => handleChange('twitter_url', v)} placeholder="https://twitter.com/tu_usuario" />
              <Field label="Enlace WhatsApp" value={form.whatsapp_url} onChange={v => handleChange('whatsapp_url', v)} placeholder="https://wa.me/53..." />
            </div>
          </section>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
    </div>
  );
}
