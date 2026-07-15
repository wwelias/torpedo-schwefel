'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ClubLogo from '@/components/ClubLogo';
import Button from '@/components/ui/Button';
import { ClubData, ClubInfo, Post, Player } from '@/lib/db';
import { 
  loginAdmin, 
  updateClubInfo, 
  upsertPost, 
  deletePost, 
  updateSquad 
} from '@/app/actions';

interface AdminDashboardProps {
  initialData: ClubData;
}

type TabType = 'info' | 'posts' | 'squad';

export default function AdminDashboard({ initialData }: AdminDashboardProps) {
  // Session management
  const [password, setPassword] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Club Data States
  const [clubInfo, setClubInfo] = useState<ClubInfo>(initialData.clubInfo);
  const [posts, setPosts] = useState<Post[]>(initialData.posts);
  const [squad, setSquad] = useState<Player[]>(initialData.squad);

  // Status message
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Post Editor States
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);
  const [postForm, setPostForm] = useState<Partial<Post>>({
    title: '',
    category: 'News',
    content: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    time: ''
  });

  // Squad Editor States
  const [editingPlayerIdx, setEditingPlayerIdx] = useState<number | null>(null);
  const [isCreatingPlayer, setIsCreatingPlayer] = useState<boolean>(false);
  const [playerForm, setPlayerForm] = useState<Player>({
    name: '',
    position: 'Mittelfeld',
    number: 10
  });

  const verifySavedPassword = async (pw: string) => {
    setIsLoggingIn(true);
    const res = await loginAdmin(pw);
    if (res.success) {
      setIsLoggedIn(true);
      setPassword(pw); // Set password state asynchronously
    } else {
      sessionStorage.removeItem('torpedo_admin_pw');
    }
    setIsLoggingIn(false);
  };

  // Load password from sessionStorage on mount
  useEffect(() => {
    const savedPw = sessionStorage.getItem('torpedo_admin_pw');
    if (savedPw) {
      const timer = setTimeout(() => {
        verifySavedPassword(savedPw);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    const res = await loginAdmin(password);
    if (res.success) {
      setIsLoggedIn(true);
      sessionStorage.setItem('torpedo_admin_pw', password);
    } else {
      setLoginError(res.error || 'Ungültiges Passwort');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
    sessionStorage.removeItem('torpedo_admin_pw');
    setStatus(null);
  };

  // Helper to show temporary status alerts
  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 4000);
  };

  // Save General Club Info
  const handleSaveClubInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateClubInfo(clubInfo, password);
    if (res.success) {
      showStatus('success', 'Vereinsinformationen erfolgreich aktualisiert!');
    } else {
      showStatus('error', res.error || 'Fehler beim Aktualisieren der Daten.');
    }
    setIsSaving(false);
  };

  // Handle Training Times Input changes
  const handleTrainingChange = (index: number, value: string) => {
    const updated = [...clubInfo.training];
    updated[index] = value;
    setClubInfo({ ...clubInfo, training: updated });
  };

  const addTrainingRow = () => {
    setClubInfo({ ...clubInfo, training: [...clubInfo.training, ''] });
  };

  const removeTrainingRow = (index: number) => {
    const updated = clubInfo.training.filter((_, idx) => idx !== index);
    setClubInfo({ ...clubInfo, training: updated });
  };

  // Save/Upsert Post
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title || !postForm.content || !postForm.date) {
      showStatus('error', 'Bitte fülle alle Pflichtfelder (Titel, Inhalt, Datum) aus.');
      return;
    }

    const postToSave: Post = {
      id: postForm.id || '', // Server action generates ID if empty
      title: postForm.title,
      category: postForm.category as 'News' | 'Turnier' | 'Training',
      content: postForm.content,
      date: postForm.date,
      location: postForm.category === 'Turnier' ? postForm.location : '',
      time: postForm.category === 'Turnier' ? postForm.time : ''
    };

    setIsSaving(true);
    const res = await upsertPost(postToSave, password);
    if (res.success) {
      // Update local state
      if (postForm.id) {
        setPosts(posts.map(p => p.id === postForm.id ? postToSave : p));
      } else {
        setPosts([postToSave, ...posts]);
      }
      showStatus('success', 'Beitrag erfolgreich gespeichert!');
      closePostEditor();
    } else {
      showStatus('error', res.error || 'Fehler beim Speichern des Beitrags.');
    }
    setIsSaving(false);
  };

  const startEditPost = (post: Post) => {
    setEditingPost(post);
    setPostForm(post);
    setIsCreatingPost(true);
  };

  const startCreatePost = () => {
    setEditingPost(null);
    setPostForm({
      title: '',
      category: 'News',
      content: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      time: ''
    });
    setIsCreatingPost(true);
  };

  const closePostEditor = () => {
    setIsCreatingPost(false);
    setEditingPost(null);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Möchtest du diesen Beitrag wirklich löschen?')) return;
    
    setIsSaving(true);
    const res = await deletePost(postId, password);
    if (res.success) {
      setPosts(posts.filter(p => p.id !== postId));
      showStatus('success', 'Beitrag erfolgreich gelöscht.');
    } else {
      showStatus('error', res.error || 'Fehler beim Löschen des Beitrags.');
    }
    setIsSaving(false);
  };

  // Squad updates
  const handleSaveSquad = async (updatedSquad: Player[]) => {
    setIsSaving(true);
    const res = await updateSquad(updatedSquad, password);
    if (res.success) {
      setSquad(updatedSquad);
      showStatus('success', 'Kader erfolgreich aktualisiert!');
    } else {
      showStatus('error', res.error || 'Fehler beim Speichern des Kaders.');
    }
    setIsSaving(false);
  };

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.name || playerForm.number === undefined) {
      showStatus('error', 'Bitte Name und Rückennummer eingeben.');
      return;
    }

    const updatedSquad = [...squad];
    if (editingPlayerIdx !== null) {
      updatedSquad[editingPlayerIdx] = playerForm;
    } else {
      updatedSquad.push(playerForm);
    }
    
    // Sort squad by jersey number
    updatedSquad.sort((a, b) => a.number - b.number);
    
    handleSaveSquad(updatedSquad);
    closePlayerEditor();
  };

  const startEditPlayer = (player: Player, index: number) => {
    setEditingPlayerIdx(index);
    setPlayerForm(player);
    setIsCreatingPlayer(true);
  };

  const startCreatePlayer = () => {
    setEditingPlayerIdx(null);
    setPlayerForm({
      name: '',
      position: 'Mittelfeld',
      number: squad.length > 0 ? Math.max(...squad.map(p => p.number)) + 1 : 10
    });
    setIsCreatingPlayer(true);
  };

  const closePlayerEditor = () => {
    setIsCreatingPlayer(false);
    setEditingPlayerIdx(null);
  };

  const handleDeletePlayer = (index: number) => {
    if (!confirm('Diesen Spieler wirklich aus dem Kader entfernen?')) return;
    const updatedSquad = squad.filter((_, idx) => idx !== index);
    handleSaveSquad(updatedSquad);
  };


  // LOGIN INTERFACE
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-primary-green-dark text-white px-4">
        <div className="w-full max-w-md bg-card-bg text-foreground rounded-2xl shadow-xl border border-card-border p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <ClubLogo className="w-20 h-20" />
            <h1 className="text-2xl font-black tracking-wide text-primary-green-light">Admin-Bereich</h1>
            <p className="text-sm text-foreground/60">
              Melde dich an, um News, Kader und Trainingszeiten von <strong>Torpedo Schwefel</strong> zu verwalten.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password-field" className="block text-sm font-semibold mb-1">Passwort</label>
              <input
                id="password-field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin-Passwort eingeben"
                className="w-full px-4 py-3 rounded-lg border border-card-border focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none bg-background text-foreground"
                disabled={isLoggingIn}
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg text-center font-medium">
                ⚠️ {loginError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3 flex items-center justify-center gap-2"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Anmelden'
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-primary-green-light hover:text-gold transition-colors font-bold uppercase tracking-wider">
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    );
  }


  // MAIN DASHBOARD INTERFACE
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Admin Navbar */}
      <header className="bg-primary-green text-white py-4 px-6 border-b border-gold/30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClubLogo className="w-10 h-10" />
            <div>
              <span className="font-extrabold tracking-wide text-lg block">TORPEDO ADMIN</span>
              <span className="text-xs text-gold uppercase tracking-widest block -mt-1">Inhalte pflegen</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="hidden sm:inline-flex bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
            >
              Startseite ansehen
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-md transition-colors"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* Admin Main Body */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Status Alerts */}
        {status && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
            status.type === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
          }`}>
            <span className="text-xl">{status.type === 'success' ? '✓' : '⚠️'}</span>
            <span className="font-medium text-sm">{status.message}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-card-border overflow-x-auto gap-2">
          <button
            onClick={() => { setActiveTab('info'); closePostEditor(); closePlayerEditor(); }}
            className={`py-3 px-6 font-bold text-sm uppercase tracking-wider border-b-2 transition-all flex-shrink-0 ${
              activeTab === 'info' 
                ? 'border-gold text-primary-green-light' 
                : 'border-transparent text-foreground/60 hover:text-foreground hover:border-foreground/30'
            }`}
          >
            ℹ️ Vereinsinfos
          </button>
          <button
            onClick={() => { setActiveTab('posts'); closePostEditor(); closePlayerEditor(); }}
            className={`py-3 px-6 font-bold text-sm uppercase tracking-wider border-b-2 transition-all flex-shrink-0 ${
              activeTab === 'posts' 
                ? 'border-gold text-primary-green-light' 
                : 'border-transparent text-foreground/60 hover:text-foreground hover:border-foreground/30'
            }`}
          >
            📰 Beiträge & Turniere
          </button>
          <button
            onClick={() => { setActiveTab('squad'); closePostEditor(); closePlayerEditor(); }}
            className={`py-3 px-6 font-bold text-sm uppercase tracking-wider border-b-2 transition-all flex-shrink-0 ${
              activeTab === 'squad' 
                ? 'border-gold text-primary-green-light' 
                : 'border-transparent text-foreground/60 hover:text-foreground hover:border-foreground/30'
            }`}
          >
            👥 Spielerkader
          </button>
        </div>


        {/* TAB 1: CLUB INFO FORM */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveClubInfo} className="bg-card-bg rounded-xl border border-card-border p-6 sm:p-8 shadow-md space-y-6">
            <h2 className="text-2xl font-extrabold text-primary-green-light mb-4">Allgemeine Vereinsinfos bearbeiten</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-1">Vereinsname</label>
                <input
                  type="text"
                  value={clubInfo.name}
                  onChange={(e) => setClubInfo({ ...clubInfo, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Gegründet im Jahr</label>
                <input
                  type="text"
                  value={clubInfo.founded}
                  onChange={(e) => setClubInfo({ ...clubInfo, founded: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold mb-1">Standort / Platzname</label>
                <input
                  type="text"
                  value={clubInfo.location}
                  onChange={(e) => setClubInfo({ ...clubInfo, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold mb-1">Motto / Slogan (Tagline)</label>
                <input
                  type="text"
                  value={clubInfo.tagline}
                  onChange={(e) => setClubInfo({ ...clubInfo, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold mb-1">Vereinsbeschreibung / Geschichte</label>
                <textarea
                  value={clubInfo.description}
                  onChange={(e) => setClubInfo({ ...clubInfo, description: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none whitespace-pre-wrap leading-relaxed"
                  required
                />
              </div>

              {/* Training list editing */}
              <div className="sm:col-span-2 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold">Trainingszeiten</label>
                  <button
                    type="button"
                    onClick={addTrainingRow}
                    className="bg-primary-green hover:bg-primary-green-light text-white text-xs font-bold px-3 py-1.5 rounded"
                  >
                    + Zeile hinzufügen
                  </button>
                </div>
                
                {clubInfo.training.map((time, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => handleTrainingChange(idx, e.target.value)}
                      placeholder="z.B. Jeden Dienstag ab 18:30 Uhr am Funkenplatz"
                      className="flex-grow px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeTrainingRow(idx)}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-2 rounded-lg border border-red-500/30 transition-all font-bold"
                    >
                      Entfernen
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-card-border pt-6 flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 flex items-center gap-2"
              >
                {isSaving ? 'Speichert...' : 'Infos speichern'}
              </Button>
            </div>
          </form>
        )}


        {/* TAB 2: POSTS MANAGER */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {!isCreatingPost ? (
              <div className="bg-card-bg rounded-xl border border-card-border p-6 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-extrabold text-primary-green-light">Beiträge & Turniere</h2>
                  <Button
                    onClick={startCreatePost}
                    size="sm"
                  >
                    + Neuen Beitrag erstellen
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-card-border text-foreground/60 text-sm font-semibold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Datum</th>
                        <th className="pb-3 px-4">Kategorie</th>
                        <th className="pb-3 px-4">Titel</th>
                        <th className="pb-3 px-4">Ort/Zeit</th>
                        <th className="pb-3 pl-4 text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border text-sm">
                      {posts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-foreground/50">
                            Keine Beiträge vorhanden. Erstelle deinen ersten Beitrag!
                          </td>
                        </tr>
                      ) : (
                        posts.map((post) => (
                          <tr key={post.id} className="hover:bg-primary-green/5 transition-colors">
                            <td className="py-4 pr-4 whitespace-nowrap">
                              {new Date(post.date).toLocaleDateString('de-DE')}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                post.category === 'Turnier'
                                  ? 'bg-gold/15 text-gold-dark border border-gold/30'
                                  : 'bg-primary-green/15 text-primary-green-light border border-primary-green/30'
                              }`}>
                                {post.category}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-bold text-foreground/90 max-w-xs truncate">
                              {post.title}
                            </td>
                            <td className="py-4 px-4 text-foreground/70">
                              {post.category === 'Turnier' ? (
                                <span className="block truncate max-w-xs">
                                  {post.location ? `📍 ${post.location}` : ''} {post.time ? `| 🕒 ${post.time}` : ''}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="py-4 pl-4 text-right space-x-2 whitespace-nowrap">
                              <Button
                                onClick={() => startEditPost(post)}
                                variant="edit"
                                size="sm"
                              >
                                Bearbeiten
                              </Button>
                              <Button
                                onClick={() => handleDeletePost(post.id)}
                                variant="danger"
                                size="sm"
                              >
                                Löschen
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* CREATE / EDIT POST FORM */
              <form onSubmit={handleSavePost} className="bg-card-bg rounded-xl border border-card-border p-6 sm:p-8 shadow-md space-y-6 animate-fade-in">
                <h2 className="text-2xl font-extrabold text-primary-green-light mb-4">
                  {editingPost ? 'Beitrag bearbeiten' : 'Neuen Beitrag erstellen'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold mb-1">Titel <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={postForm.title}
                      onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                      placeholder="z.B. Nächstes Turnier in Schwefel-Süd"
                      className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1">Kategorie <span className="text-red-500">*</span></label>
                    <select
                      value={postForm.category}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value as 'News' | 'Turnier' })}
                      className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none"
                    >
                      <option value="News">Allgemeine News</option>
                      <option value="Turnier">Turnier & Spiel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1">Datum <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={postForm.date}
                      onChange={(e) => setPostForm({ ...postForm, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none"
                      required
                    />
                  </div>

                  {postForm.category === 'Turnier' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold mb-1">Spielort (Location)</label>
                        <input
                          type="text"
                          value={postForm.location || ''}
                          onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
                          placeholder="z.B. Sportplatz Funkenplatz"
                          className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1">Uhrzeit</label>
                        <input
                          type="text"
                          value={postForm.time || ''}
                          onChange={(e) => setPostForm({ ...postForm, time: e.target.value })}
                          placeholder="z.B. 14:00 Uhr - 18:00 Uhr"
                          className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none"
                        />
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold mb-1">Inhalt <span className="text-red-500">*</span></label>
                    <textarea
                      value={postForm.content}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                      rows={8}
                      placeholder="Beschreibe die News oder das Turnier..."
                      className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none leading-relaxed"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-card-border pt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={closePostEditor}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Speichert...' : 'Beitrag speichern'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}


        {/* TAB 3: SQUAD MANAGER */}
        {activeTab === 'squad' && (
          <div className="space-y-6">
            {!isCreatingPlayer ? (
              <div className="bg-card-bg rounded-xl border border-card-border p-6 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-extrabold text-primary-green-light">Spielerkader pflegen</h2>
                  <Button
                    onClick={startCreatePlayer}
                    size="sm"
                  >
                    + Spieler hinzufügen
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-card-border text-foreground/60 text-sm font-semibold uppercase tracking-wider">
                        <th className="pb-3 pr-4 w-16">Nummer</th>
                        <th className="pb-3 px-4">Name</th>
                        <th className="pb-3 px-4">Position</th>
                        <th className="pb-3 pl-4 text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border text-sm">
                      {squad.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-foreground/50">
                            Derzeit keine Spieler im Kader. Füge neue Spieler hinzu!
                          </td>
                        </tr>
                      ) : (
                        squad.map((player, index) => (
                          <tr key={index} className="hover:bg-primary-green/5 transition-colors">
                            <td className="py-4 pr-4 font-bold text-center">
                              <span className="inline-block w-8 h-8 rounded-full bg-primary-green text-gold text-xs font-black leading-8 text-center border border-gold">
                                {player.number}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-semibold text-foreground/90">
                              {player.name}
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-xs uppercase tracking-widest font-bold text-foreground/60">
                                {player.position}
                              </span>
                            </td>
                            <td className="py-4 pl-4 text-right space-x-2 whitespace-nowrap">
                              <Button
                                onClick={() => startEditPlayer(player, index)}
                                variant="edit"
                                size="sm"
                              >
                                Bearbeiten
                              </Button>
                              <Button
                                onClick={() => handleDeletePlayer(index)}
                                variant="danger"
                                size="sm"
                              >
                                Löschen
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* CREATE / EDIT PLAYER FORM */
              <form onSubmit={handleSavePlayer} className="bg-card-bg rounded-xl border border-card-border p-6 sm:p-8 shadow-md space-y-6 max-w-xl mx-auto animate-fade-in">
                <h2 className="text-2xl font-extrabold text-primary-green-light mb-4">
                  {editingPlayerIdx !== null ? 'Spielerdaten bearbeiten' : 'Neuen Spieler anlegen'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Spielername <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={playerForm.name}
                      onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                      placeholder="z.B. Thomas 'Raumdeuter' Müller"
                      className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">Rückennummer <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={playerForm.number}
                        onChange={(e) => setPlayerForm({ ...playerForm, number: parseInt(e.target.value) || 10 })}
                        className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-1">Position <span className="text-red-500">*</span></label>
                      <select
                        value={playerForm.position}
                        onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-card-border bg-background focus:ring-2 focus:ring-primary-green outline-none"
                      >
                        <option value="Torwart">Torwart</option>
                        <option value="Abwehr">Abwehr</option>
                        <option value="Mittelfeld">Mittelfeld</option>
                        <option value="Sturm">Sturm</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-card-border pt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={closePlayerEditor}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Speichert...' : 'Spieler speichern'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
