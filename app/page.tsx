import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClubLogo from '@/components/ClubLogo';
import { getClubData } from '@/lib/db';

// Force dynamic rendering so edits made in the admin panel are visible immediately
export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getClubData();
  const { clubInfo, posts, squad } = data;

  return (
    <>
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary-green-dark text-white py-24 sm:py-32">
          {/* Decorative Soccer Net Grid */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(var(--color-gold)_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-primary-green-light/20 blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-grow text-center md:text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold text-sm font-semibold tracking-wider uppercase border border-gold/30">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  Hobby-Verein seit {clubInfo.founded}
                </div>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
                  <span className="block text-white">Torpedo</span>
                  <span className="block text-gold mt-1">{clubInfo.name.split(' ')[1] || 'Schwefel'}</span>
                </h1>
                <p className="text-xl sm:text-2xl font-medium text-white/95 italic max-w-xl">
                  🏆 &quot;{clubInfo.tagline}&quot;
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <span>📍</span>
                    <span>{clubInfo.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 relative">
                {/* Soft red background glow to replace CSS drop-shadow filter on the SVG image itself */}
                <div className="absolute inset-0 bg-gold/15 rounded-full blur-3xl transform scale-75" />
                <ClubLogo className="relative z-10 w-64 h-64 md:w-80 md:h-80" />
              </div>
            </div>
          </div>
        </section>

        {/* Aktuelles & Turniere */}
        <section id="aktuelles" className="py-20 bg-background text-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight border-b-4 border-gold inline-block pb-2">
                Aktuelles & Turniere
              </h2>
              <p className="text-foreground/75 max-w-2xl mx-auto">
                Bleib auf dem Laufenden über unsere kommenden Spiele am Funkenplatz und die neuesten Vereinsnews.
              </p>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12 bg-card-bg rounded-xl border border-card-border">
                <p className="text-foreground/50">Derzeit liegen keine aktuellen Meldungen vor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <article 
                    key={post.id} 
                    className="bg-card-bg rounded-xl shadow-md overflow-hidden border border-card-border flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  >
                    {/* Header Category and Date */}
                    <div className="p-6 flex-grow space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          post.category === 'Turnier' 
                            ? 'bg-gold/15 text-gold-dark border border-gold/40' 
                            : 'bg-primary-green/15 text-primary-green-light border border-primary-green/30'
                        }`}>
                          {post.category}
                        </span>
                        <time className="text-xs text-foreground/50 font-medium">
                          {new Date(post.date).toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                      </div>

                      <h3 className="text-xl font-bold group-hover:text-gold transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-sm text-foreground/80 line-clamp-4 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    {/* Metadata footer for tournaments */}
                    {post.category === 'Turnier' && (post.location || post.time) && (
                      <div className="bg-primary-green/5 border-t border-card-border p-4 text-xs text-foreground/75 space-y-1.5">
                        {post.location && (
                          <div className="flex items-center gap-2">
                            <span className="text-gold">📍</span>
                            <span className="font-semibold">{post.location}</span>
                          </div>
                        )}
                        {post.time && (
                          <div className="flex items-center gap-2">
                            <span className="text-gold">🕒</span>
                            <span>{post.time}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Ueber Uns Section */}
        <section id="ueber-uns" className="py-20 bg-primary-green/5 text-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Story */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Die Legende vom <span className="text-gold">Funkenplatz</span>
                </h2>
                <div className="w-16 h-1 bg-gold" />
                <p className="text-base sm:text-lg leading-relaxed text-foreground/85 whitespace-pre-wrap">
                  {clubInfo.description}
                </p>
              </div>

              {/* Training and Fast Facts Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-card-bg p-8 rounded-2xl shadow-md border border-card-border relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-gold/5 rounded-full -mr-8 -mt-8" />
                  <h3 className="text-xl font-bold mb-4 text-gold flex items-center gap-2">
                    <span>🏃‍♂️</span> Trainingszeiten
                  </h3>
                  <ul className="space-y-3">
                    {clubInfo.training.map((time, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-foreground/90">
                        <span className="text-gold font-bold">✓</span>
                        <span>{time}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-primary-green text-white p-8 rounded-2xl shadow-md border border-gold/25 relative overflow-hidden">
                  <h3 className="text-xl font-bold mb-3 text-gold">Auf einen Blick</h3>
                  <div className="grid grid-cols-2 gap-4 text-center mt-6">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="text-3xl font-black text-gold">2018</div>
                      <div className="text-xs text-white/70 mt-1">Gegründet</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="text-3xl font-black text-gold">{squad.length}</div>
                      <div className="text-xs text-white/70 mt-1">Kader-Spieler</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Squad Section */}
        <section id="kader" className="py-20 bg-background text-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight border-b-4 border-gold inline-block pb-2">
                Der Torpedo-Kader
              </h2>
              <p className="text-foreground/75 max-w-2xl mx-auto">
                Unsere Aufstellung für den Erfolg. Jeder Einzelne bereit, alles auf dem Platz zu geben!
              </p>
            </div>

            {squad.length === 0 ? (
              <div className="text-center py-12 bg-card-bg rounded-xl border border-card-border">
                <p className="text-foreground/50">Der Kader wird derzeit aktualisiert.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {squad.map((player, idx) => (
                  <div 
                    key={idx} 
                    className="bg-card-bg rounded-xl shadow-md border border-card-border p-6 flex flex-col items-center text-center relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                  >
                    {/* Jersey background effect */}
                    <div className="absolute right-0 top-0 w-16 h-16 bg-primary-green/5 rounded-full -mr-6 -mt-6 group-hover:bg-primary-green/10 transition-colors" />
                    
                    {/* Jersey number */}
                    <div className="w-14 h-14 rounded-full bg-primary-green text-gold flex items-center justify-center text-2xl font-black mb-4 border-2 border-gold shadow-md">
                      {player.number}
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-gold transition-colors leading-tight text-center break-words w-full px-1">
                      {player.name}
                    </h3>
                    
                    <span className="text-xs text-foreground/60 uppercase tracking-widest font-semibold mt-1">
                      {player.position}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
