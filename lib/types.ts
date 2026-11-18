export type Color = 'perto' | 'quase' | 'longe';

export interface LatLon {
  lat: number;
  lon: number;
}

/** Photo as sent to the client before the guess (no answers). */
export interface PhotoPublic {
  imageUrl: string;
  isPrototype: boolean;
}

export interface EditionPublic {
  editionNumber: number;
  editionDate: string; // YYYY-MM-DD (Brasília)
  formattedDate: string; // "quarta, 18 de novembro"
  photos: PhotoPublic[];
  /** Token de progresso assinado pelo servidor (foto 0). */
  token: string;
}

/** Correct answer for a photo, revealed after the guess. */
export interface Reveal {
  title: string;
  year: number;
  city: string;
  state: string;
  lat: number;
  lon: number;
  caption: string;
  archive: string;
  sourceUrl?: string | null;
}

export interface Guess {
  yearGuess: number | null;
  locationGuess: LatLon | null;
}

export interface PhotoResult {
  yearGuess: number;
  locationGuess: LatLon;
  yearScore: number;
  locationScore: number;
  yearDiff: number;
  distanceKm: number;
  yearColor: Color;
  locationColor: Color;
}

export interface GameState {
  editionNumber: number;
  editionDate: string;
  photos: PhotoPublic[];
  currentPhotoIndex: number;
  phase: 'guessing' | 'revealing' | 'completed';
  guesses: Guess[];
  results: (PhotoResult | null)[];
  /** Respostas só entram aqui depois que o jogador palpita a foto. */
  reveals: (Reveal | null)[];
  /** Token de progresso assinado pelo servidor. */
  token: string;
}

export interface LocalStats {
  gamesPlayed: number;
  currentStreak: number;
  bestStreak: number;
  totalPoints: number;
  lastPlayedDate: string | null;
  history: {
    [date: string]: {
      editionNumber: number;
      totalScore: number;
      photos: PhotoResult[];
    };
  };
}
