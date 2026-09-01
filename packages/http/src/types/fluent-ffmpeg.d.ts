declare module "fluent-ffmpeg" {
  export interface FfmpegCommand {
    input(input: Buffer | string): this;
    inputFormat(format: string): this;
    outputOptions(options: string[]): this;
    format(format: string): this;
    on(event: string, callback: (...args: any[]) => void): this;
    pipe(callback: (err: Error | null, stdout: NodeJS.ReadableStream) => void): this;
  }

  export function createFFmpeg(input: string): FfmpegCommand;
  const ffmpeg: (input: Buffer | string) => FfmpegCommand;
  export default ffmpeg;
}
