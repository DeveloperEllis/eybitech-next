import { supabaseServer } from "../../lib/supabase/serverClient";
import { Suspense } from "react";
import { LoadingSpinner } from "../../components/LoadingComponents";

export const revalidate = 600; // Revalidar cada 10 minutos

export const metadata = {
  title: "Blog & Tutoriales",
  description: "Noticias, artículos y guías paso a paso sobre tecnología. Consejos, reviews y tutoriales de productos tecnológicos en Cuba.",
  keywords: ['blog', 'tutoriales', 'tecnología', 'guías', 'reviews', 'Cuba', 'Eybitech'],
  openGraph: {
    type: "website",
    title: "Blog & Tutoriales | Eybitech",
    description: "Descubre noticias, artículos y guías paso a paso sobre tecnología. Reviews y tutoriales de productos tecnológicos.",
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Blog Eybitech - Tutoriales de tecnología',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Tutoriales | Eybitech",
    description: "Noticias, artículos y guías paso a paso sobre tecnología.",
    images: ['/logo.png'],
  },
};

export default async function BlogPage({ searchParams }) {
  const tipo = (searchParams?.tipo || "todos").toString(); // todos | blog | tutorial
  const supabase = supabaseServer();

  const [{ data: posts, error: postsError }, { data: tutorials, error: tutsError }] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, title, excerpt, featured_image_url, slug, published_at, is_published")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(50),
    supabase
      .from("tutorial_posts")
      .select("id, title, excerpt, featured_image_url, slug, published_at, is_published")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(50),
  ]);

  const normalize = (items, type) =>
    (items || []).map((i) => ({
      id: i.id,
      title: i.title,
      excerpt: i.excerpt,
      cover_image_url: i.featured_image_url,
      slug: i.slug,
      published_at: i.published_at,
      type,
    }));

  const all = [...normalize(posts, "blog"), ...normalize(tutorials, "tutorial")]
    .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));

  const filtered = tipo === "todos" ? all : all.filter((x) => x.type === (tipo === "blog" ? "blog" : "tutorial"));
  const error = postsError || tutsError;

  const chip = (label, value) => {
    const isActive = tipo === value;
    const href = value === "todos" ? "/blog" : `/blog?tipo=${value}`;
    return (
      <a key={value} href={href} className={`px-3 py-1 rounded-full text-sm border ${isActive ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"}`}>
        {label}
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="container-page py-6 md:py-10">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Blog & Tutoriales</h1>
            <p className="text-gray-600 mt-1">Noticias, lanzamientos, tips y guías prácticas.</p>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2">
            {chip("Todos", "todos")}
            {chip("Blog", "blog")}
            {chip("Tutoriales", "tutorial")}
          </div>

          {error ? (
            <div className="text-center py-12 px-4">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 text-red-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error cargando contenido</h3>
                <p className="text-gray-600">No se pudo cargar el blog y tutoriales. Intenta recargar la página.</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay contenido disponible
                </h3>
                <p className="text-gray-600">
                  {tipo === "todos" 
                    ? "Aún no hay posts publicados en el blog." 
                    : `No hay ${tipo === "blog" ? "artículos de blog" : "tutoriales"} disponibles.`
                  }
                </p>
              </div>
            </div>
          ) : (
            <Suspense fallback={<LoadingSpinner text="Cargando contenido..." />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filtered.map((item) => (
                  <a key={`${item.type}-${item.id}`} href={`/blog/${item.slug || item.id}`} className="card overflow-hidden flex flex-col group hover:shadow-lg transition-shadow">
                    {item.cover_image_url ? (
                      <img src={item.cover_image_url} alt={item.title} className="h-40 w-full object-cover" />
                    ) : (
                      <div className="h-40 w-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <div className="text-4xl text-gray-400">
                          {item.type === "blog" ? "📝" : "🎓"}
                        </div>
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className={`text-xs font-medium ${item.type === "blog" ? "text-blue-600" : "text-purple-600"}`}>
                        {item.type === "blog" ? "📝 Blog" : "🎓 Tutorial"}
                      </div>
                      <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                      {item.excerpt && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{item.excerpt}</p>
                      )}
                      <div className="mt-3 text-xs text-gray-500 flex items-center gap-3">
                        {item.published_at && (
                          <span>📅 {new Date(item.published_at).toLocaleDateString('es-ES')}</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}
