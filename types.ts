
export interface Chapter {
  id: number;
  title: string;
  startTime: number;
}

export interface TranscriptItem {
  time: number;
  text: string;
}

export interface Audiobook {
  title: string;
  author: string;
  narrator: string;
  cover: string;
  chapters: Chapter[];
  audioUrl: string | null;
  transcript: TranscriptItem[];
}

export interface Bookmark {
  id: number;
  time: number;
  title: string;
  chapter: number;
}

export interface Clip {
  id: number;
  startTime: number;
  endTime: number;
  duration: number;
  text: string;
  title: string;
  chapter: number;
  createdAt: string;
  originalAudioUrl: string | null;
  originalStartTime: number;
  originalEndTime: number;
}

export interface BluetoothControls {
    previousFile: string;
    nextFile: string;
    swapButtons: boolean;
}

export interface BookStats {
  duration: number;
}

export interface Stats {
  listeningActivity: { [date: string]: number };
  books: { [filename: string]: BookStats };
}