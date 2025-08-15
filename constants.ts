
import { Audiobook } from './types';

export const DEFAULT_AUDIOBOOK: Audiobook = {
    title: "Select an Audio Book",
    author: "Unknown Author",
    narrator: "Unknown Narrator",
    cover: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23374151'/%3E%3Ctext x='100' y='140' text-anchor='middle' fill='white' font-size='14' font-family='sans-serif'%3ESelect Audio%3C/text%3E%3Ctext x='100' y='160' text-anchor='middle' fill='white' font-size='14' font-family='sans-serif'%3EBook File%3C/text%3E%3C/svg%3E",
    chapters: [
      { id: 1, title: "Chapter 1", startTime: 0 }
    ],
    audioUrl: null,
    transcript: []
};

export const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export const BLUETOOTH_ACTION_OPTIONS = [
    'Rewind 10 s',
    'Rewind 30 s',
    'Rewind 45 s',
    'Rewind 60 s',
    'Fast forward 10 s',
    'Fast forward 30 s',
    'Fast forward 60 s',
    'Add bookmark',
    'Create clip',
    'Previous chapter',
    'Next chapter',
    'Play/Pause',
    'Volume up',
    'Volume down',
    'Nothing'
];