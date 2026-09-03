declare module "fluent-ffmpeg" {
  type ffmpegCommand = {
    input(input: string | Buffer): ffmpegCommand;
    inputFormat(format: string): ffmpegCommand;
    outputOptions(options: string[]): ffmpegCommand;
    format(format: string): ffmpegCommand;
    on(event: string, handler: (...args: any[]) => void): ffmpegCommand;
    pipe(error: Error | null, stdout: NodeJS.ReadableStream): ffmpegCommand;
  };

  function ffmpeg(input?: string | Buffer): ffmpegCommand;
  export default ffmpeg;
}
