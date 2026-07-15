'use server';

import { getClubData, saveClubData, ClubInfo, Post, Player } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function verifyPassword(password: string): boolean {
  if (!password) return false;
  return password === ADMIN_PASSWORD;
}

// XSS Protection: Strip HTML tags from user inputs to prevent script injection
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

function sanitizeClubInfo(info: ClubInfo): ClubInfo {
  return {
    name: sanitizeString(info.name),
    location: sanitizeString(info.location),
    founded: sanitizeString(info.founded),
    tagline: sanitizeString(info.tagline),
    description: sanitizeString(info.description),
    colors: {
      primary: sanitizeString(info.colors?.primary || '#000000'),
      secondary: sanitizeString(info.colors?.secondary || '#ffffff'),
      accent: sanitizeString(info.colors?.accent || '#dc2626'),
    },
    training: Array.isArray(info.training) ? info.training.map(sanitizeString) : []
  };
}

function sanitizePost(post: Post): Post {
  return {
    id: sanitizeString(post.id),
    title: sanitizeString(post.title),
    date: sanitizeString(post.date),
    category: post.category, // Enum constraint handles validation
    content: sanitizeString(post.content),
    location: post.location ? sanitizeString(post.location) : undefined,
    time: post.time ? sanitizeString(post.time) : undefined,
  };
}

function sanitizePlayer(player: Player): Player {
  return {
    name: sanitizeString(player.name),
    position: sanitizeString(player.position),
    number: Math.max(1, Math.min(99, Number(player.number) || 1))
  };
}

export async function loginAdmin(password: string) {
  if (verifyPassword(password)) {
    return { success: true };
  }
  return { success: false, error: 'Ungültiges Passwort' };
}

export async function updateClubInfo(info: ClubInfo, password: string) {
  if (!verifyPassword(password)) {
    return { success: false, error: 'Ungültiges Passwort' };
  }

  // Sanitize input to protect against XSS
  const sanitizedInfo = sanitizeClubInfo(info);

  const data = await getClubData();
  data.clubInfo = sanitizedInfo;
  
  const saved = await saveClubData(data);
  if (saved) {
    revalidatePath('/');
    return { success: true };
  }
  return { success: false, error: 'Fehler beim Speichern der Daten' };
}

export async function upsertPost(post: Post, password: string) {
  if (!verifyPassword(password)) {
    return { success: false, error: 'Ungültiges Passwort' };
  }

  // Sanitize input to protect against XSS
  const sanitizedPost = sanitizePost(post);

  // Generate unique ID on the server if not provided
  if (!sanitizedPost.id) {
    sanitizedPost.id = `post-${Date.now()}`;
  }

  const data = await getClubData();
  const index = data.posts.findIndex(p => p.id === sanitizedPost.id);
  
  if (index > -1) {
    data.posts[index] = sanitizedPost;
  } else {
    data.posts.unshift(sanitizedPost); // Add to the beginning
  }

  const saved = await saveClubData(data);
  if (saved) {
    revalidatePath('/');
    return { success: true };
  }
  return { success: false, error: 'Fehler beim Speichern des Beitrags' };
}

export async function deletePost(postId: string, password: string) {
  if (!verifyPassword(password)) {
    return { success: false, error: 'Ungültiges Passwort' };
  }

  const data = await getClubData();
  data.posts = data.posts.filter(p => p.id !== postId);

  const saved = await saveClubData(data);
  if (saved) {
    revalidatePath('/');
    return { success: true };
  }
  return { success: false, error: 'Fehler beim Löschen des Beitrags' };
}

export async function updateSquad(squad: Player[], password: string) {
  if (!verifyPassword(password)) {
    return { success: false, error: 'Ungültiges Passwort' };
  }

  // Sanitize squad list
  const sanitizedSquad = Array.isArray(squad) ? squad.map(sanitizePlayer) : [];

  const data = await getClubData();
  data.squad = sanitizedSquad;

  const saved = await saveClubData(data);
  if (saved) {
    revalidatePath('/');
    return { success: true };
  }
  return { success: false, error: 'Fehler beim Speichern des Kaders' };
}
