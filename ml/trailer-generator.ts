import { exec } from "child_process";
import path from "path";

export async function generateTrailer(moviePath: string, outputPath: string) {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -i ${moviePath} -vf "select='gt(scene,0.5)',setpts=N/FRAME_RATE/TB" -t 60 ${outputPath}`;
    
    exec(command, (error) => {
      if (error) reject(error);
      else resolve(outputPath);
    });
  });
}
