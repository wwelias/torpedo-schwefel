import fs from 'fs/promises';
import path from 'path';

export interface ClubInfo {
  name: string;
  location: string;
  founded: string;
  tagline: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  training: string[];
}

export interface Post {
  id: string;
  title: string;
  date: string;
  category: 'Turnier' | 'News' | 'Training';
  content: string;
  location?: string;
  time?: string;
}

export interface Player {
  name: string;
  position: string;
  number: number;
}

export interface ClubData {
  clubInfo: ClubInfo;
  posts: Post[];
  squad: Player[];
}

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'club-data.json');

export async function getClubData(): Promise<ClubData> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent) as ClubData;
  } catch (error) {
    console.error('Error reading club data:', error);
    return {
      clubInfo: {
        name: "Torpedo Schwefel",
        location: "Funkenplatz Schwefel",
        founded: "2018",
        tagline: "Zukünftige Champions-League-Sieger",
        description: "Torpedo Schwefel wurde 2018 von einer Gruppe fußballbegeisterter Freunde am legendären Funkenplatz Schwefel ins Leben gerufen.",
        colors: {
          primary: "#0f5132",
          secondary: "#ffffff",
          accent: "#d4af37"
        },
        training: [
          "Jeden Dienstag ab 18:30 Uhr am Funkenplatz",
          "Jeden Donnerstag ab 19:00 Uhr (Taktik & Ausdauer)"
        ]
      },
      posts: [],
      squad: []
    };
  }
}

export async function saveClubData(data: ClubData): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving club data:', error);
    return false;
  }
}
