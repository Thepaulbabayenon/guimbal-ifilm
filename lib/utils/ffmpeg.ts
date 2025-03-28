import { exec } from "child_process";
import path from "path";

export const generateTrailer = (inputVideo: string, outputTrailer: string, duration: number = 30) => {
  return new Promise((resolve, reject) => {
    const inputPath = path.resolve("public/videos", inputVideo);
    const outputPath = path.resolve("public/trailers", outputTrailer);

    const ffmpegCommand = `ffmpeg -i ${inputPath} -t ${duration} -vf "fade=t=in:st=0:d=1, fade=t=out:st=${duration - 1}:d=1" ${outputPath}`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error("Error generating trailer:", stderr);
        reject(error);
      } else {
        console.log("Trailer generated successfully:", stdout);
        resolve(outputPath);
      }
    });
  });
};
