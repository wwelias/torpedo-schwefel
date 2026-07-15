import fs from 'fs/promises';
import path from 'path';
import { sql } from '@vercel/postgres';

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

// Hardcoded barebones fallback if local club-data.json is completely absent
const INLINE_FALLBACK_DATA: ClubData = {
  clubInfo: {
    name: "Torpedo Schwefel",
    location: "Funkenplatz Schwefel",
    founded: "2018",
    tagline: "Zukünftige Champions-League-Sieger",
    description: "Torpedo Schwefel wurde 2018 von einer Gruppe fußballbegeisterter Freunde am legendären Funkenplatz Schwefel ins Leben gerufen.",
    colors: {
      primary: "#000000",
      secondary: "#ffffff",
      accent: "#dc2626"
    },
    training: [
      "Jeden Dienstag ab 18:30 Uhr am Funkenplatz",
      "Jeden Donnerstag ab 19:00 Uhr (Taktik & Ausdauer)"
    ]
  },
  posts: [],
  squad: []
};

// Load default data dynamically from club-data.json backup if available
async function getDefaultClubData(): Promise<ClubData> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent) as ClubData;
  } catch {
    return INLINE_FALLBACK_DATA;
  }
}

// Check if database URL is set (indicating Vercel environment with Postgres addon)
function isDatabaseEnabled(): boolean {
  return !!(process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL);
}

export async function getClubData(): Promise<ClubData> {
  if (isDatabaseEnabled()) {
    try {
      // Ensure the storage table exists securely
      await sql`
        CREATE TABLE IF NOT EXISTS club_data (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL
        );
      `;

      // Retrieve database settings row
      const result = await sql`
        SELECT data FROM club_data WHERE id = 'main';
      `;

      if (result.rows && result.rows.length > 0) {
        return result.rows[0].data as ClubData;
      } else {
        // Initialize the database with initial settings from club-data.json if missing
        const defaultData = await getDefaultClubData();
        const stringified = JSON.stringify(defaultData);
        await sql`
          INSERT INTO club_data (id, data) VALUES ('main', ${stringified})
          ON CONFLICT (id) DO UPDATE SET data = ${stringified};
        `;
        return defaultData;
      }
    } catch (error) {
      console.error('Error reading club data from Postgres:', error);
      return getDefaultClubData();
    }
  }

  // Fallback to local file operations (for local development)
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent) as ClubData;
  } catch (error) {
    // If the file does not exist, initialize it locally with our fallback template
    const err = error as Error & { code?: string };
    if (err.code === 'ENOENT') {
      try {
        await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(INLINE_FALLBACK_DATA, null, 2), 'utf-8');
      } catch (writeErr) {
        console.error('Failed to initialize local club-data.json file:', writeErr);
      }
    } else {
      console.warn('Postgres connection not found, fallback to local JSON file:', err.message);
    }
    return INLINE_FALLBACK_DATA;
  }
}

export async function saveClubData(data: ClubData): Promise<boolean> {
  if (isDatabaseEnabled()) {
    try {
      const stringified = JSON.stringify(data);
      
      // Ensure the table exists securely
      await sql`
        CREATE TABLE IF NOT EXISTS club_data (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL
        );
      `;

      // Upsert data securely (parameterized input prevents SQL injection)
      await sql`
        INSERT INTO club_data (id, data) VALUES ('main', ${stringified})
        ON CONFLICT (id) DO UPDATE SET data = ${stringified};
      `;
      return true;
    } catch (error) {
      console.error('Error saving club data to Postgres:', error);
      return false;
    }
  }

  // Fallback to local file operations
  try {
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving local club data file:', error);
    return false;
  }
}
