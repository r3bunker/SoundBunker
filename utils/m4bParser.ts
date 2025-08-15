import type { Chapter } from '../types';

// Type declaration for the global mp4box.js library
declare const MP4Box: any;

export const parseM4BChapters = (fileBuffer: ArrayBuffer): Promise<Chapter[]> => {
  return new Promise((resolve, reject) => {
    if (typeof MP4Box === 'undefined') {
        reject(new Error("MP4Box.js library not loaded. Please check your internet connection."));
        return;
    }
    const mp4boxfile = MP4Box.createFile();
    
    mp4boxfile.onError = (error: string) => {
      reject(new Error(`MP4Box parsing error: ${error}`));
    };

    mp4boxfile.onReady = (info: any) => {
      // Find the chapter track (often a text track in M4B files)
      const chapterTrack = info.tracks.find(
        (track: any) => track.handler_type === 'text' || (track.codec && track.codec.startsWith('text'))
      );

      if (!chapterTrack) {
        // Resolve with a default "Introduction" chapter if no track is found.
        resolve([{ id: 1, title: 'Introduction', startTime: 0 }]);
        return;
      }
      
      const timescale = chapterTrack.timescale;
      mp4boxfile.setExtractionOptions(chapterTrack.id, null, { nbSamples: chapterTrack.nb_samples });

      const parsedChapters: Omit<Chapter, 'id'>[] = [];
      let sampleIndex = 0;

      mp4boxfile.onSamples = (track_id: number, user: any, samples: any[]) => {
        if (track_id !== chapterTrack.id) return;
        
        for (const sample of samples) {
          sampleIndex++;
          const startTime = sample.cts / timescale;
          
          const dataView = new DataView(sample.data.buffer, sample.data.byteOffset, sample.data.byteLength);

          if (dataView.byteLength < 2) continue;

          const titleLength = dataView.getUint16(0);
          const titleBytes = new Uint8Array(sample.data.buffer, sample.data.byteOffset + 2, titleLength);
          const title = new TextDecoder('utf-8').decode(titleBytes);
          
          parsedChapters.push({
            title: title || `Chapter ${sampleIndex}`,
            startTime: startTime,
          });
        }
        
        parsedChapters.sort((a, b) => a.startTime - b.startTime);

        let finalChapters: Omit<Chapter, 'id'>[];

        // If the parsed chapters list is empty or doesn't start at the beginning,
        // create a new list with an Introduction at the start.
        if (parsedChapters.length === 0 || parsedChapters[0].startTime > 1) {
            finalChapters = [
                { title: 'Introduction', startTime: 0 },
                ...parsedChapters
            ];
        } else {
            // Otherwise, rename the first chapter to "Introduction" and keep the rest.
            const restOfChapters = parsedChapters.slice(1);
            finalChapters = [
                { ...parsedChapters[0], title: 'Introduction' },
                ...restOfChapters
            ];
        }
        
        resolve(finalChapters.map((chap, index) => ({...chap, id: index + 1})));
      };

      mp4boxfile.start();
    };

    const buffer = fileBuffer as any;
    buffer.fileStart = 0;
    mp4boxfile.appendBuffer(buffer);
    mp4boxfile.flush();
  });
};