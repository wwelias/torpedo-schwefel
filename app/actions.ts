'use server';

import { getClubData, saveClubData, ClubInfo, Post, Player } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
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

  const data = await getClubData();
  data.clubInfo = info;
  
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

  const data = await getClubData();
  const index = data.posts.findIndex(p => p.id === post.id);
  
  if (index > -1) {
    data.posts[index] = post;
  } else {
    data.posts.unshift(post); // Add to the beginning
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

  const data = await getClubData();
  data.squad = squad;

  const saved = await saveClubData(data);
  if (saved) {
    revalidatePath('/');
    return { success: true };
  }
  return { success: false, error: 'Fehler beim Speichern des Kaders' };
}
