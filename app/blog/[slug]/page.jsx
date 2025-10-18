import { supabaseServer } from "../../../lib/supabase/serverClient";

export async function generateMetadata({ params }) {
  const { slug } = params;
  const supabase = supabaseServer();
  const [{ data: bp }, { data: tp }] = await Promise.all([
    supabase.from('blog_posts').select('title, excerpt, featured_image_url, tags').eq('slug', slug).limit(1).maybeSingle(),
    supabase.from('tutorial_posts').select('title, excerpt, featured_image_url, tags').eq('slug', slug).limit(1).maybeSingle(),
  ]);
  
  const item = bp || tp;
  const isTutorial = !!tp;
  const type = isTutorial ? 'Tutorial' : 'Blog';
  
  if (!item) {
    return {
      title: 'Contenido no encontrado | Eybitech',
      description: 'El contenido que buscas no existe o ha sido eliminado.',
      robots: { index: false, follow: true },
    };
  }

  const title = `${item.title}`;
  const description = item.excerpt || `${type} de tecnología en Eybitech`;
  const image = item.featured_image_url || '/logo.png';
  
  return {
    title,
    description,
    keywords: [
      ...(item.tags || []),
      'tecnología',
      'blog',
      isTutorial ? 'tutorial' : 'artículo',
      'Cuba',
      'Eybitech'
    ],
    openGraph: {
      type: 'article',
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'Eybitech',
      locale: 'es_CU',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@eybitech',
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = params;
  const supabase = supabaseServer();
  const [{ data: post }, { data: tutorial }] = await Promise.all([
    supabase.from('blog_posts').select('*').eq('slug', slug).eq('is_published', true).limit(1).maybeSingle(),
    supabase.from('tutorial_posts').select('*').eq('slug', slug).eq('is_published', true).limit(1).maybeSingle(),
  ]);

  const item = post || tutorial;
  const type = post ? 'blog' : tutorial ? 'tutorial' : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="container-page py-6 md:py-10">
          {!item ? (
            <div className="card p-6"><p className="text-red-600">No encontrado</p></div>
          ) : (
            <article className="prose max-w-none prose-headings:scroll-mt-28">
              <div className="mb-4 text-xs font-medium text-blue-600 uppercase tracking-wide">{type === 'blog' ? 'Blog' : 'Tutorial'}</div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{item.title}</h1>
              {item.featured_image_url && (
                <img src={item.featured_image_url} alt={item.title} className="w-full h-auto rounded-lg border border-gray-200 my-4" />
              )}
              {item.published_at && (
                <div className="text-xs text-gray-500 mb-6">{new Date(item.published_at).toLocaleDateString('es-ES')}</div>
              )}
              {/* Render básico; si el content viene en Markdown/HTML podemos mejorar esto luego */}
              <div className="text-gray-800 leading-7 whitespace-pre-wrap">{item.content}</div>
              {item.youtube_video_id && (
                <div className="mt-6 aspect-video">
                  <iframe className="w-full h-full rounded-lg" src={`https://www.youtube.com/embed/${item.youtube_video_id}`} title={item.title} frameBorder="0" allowFullScreen></iframe>
                </div>
              )}
              {Array.isArray(item.download_files) && item.download_files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900">Descargas</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {item.download_files.map((f, idx) => (
                      <li key={idx}><a className="text-blue-600 hover:underline" href={f.url} target="_blank" rel="noopener noreferrer">{f.name || f.url}</a></li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(item.tags) && item.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {item.tags.map((t, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">#{t}</span>
                  ))}
                </div>
              )}
              <div className="mt-10">
                <a href="/blog" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                  Volver al blog
                </a>
              </div>
            </article>
          )}
        </div>
      </main>
    </div>
  );
}
