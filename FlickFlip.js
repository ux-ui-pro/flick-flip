const fs = require('fs').promises;
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

class FlickFlip {
  constructor() {
    this.mp4 = {
      small: {
        resolution: '1000x625',
        codec: 'libx264',
        segments: 10,
        options: '-crf 25',
      },
      big: {
        resolution: '1600x1000',
        codec: 'libx264',
        segments: 10,
        options: '-crf 25',
      }
    }

    this.webm = {
      small: {
        resolution: '1000x625',
        codec: 'libvpx-vp9',
        segments: 16,
        options: '-crf 36',
      },
      big: {
        resolution: '1600x1000',
        codec: 'libvpx-vp9',
        segments: 16,
        options: '-crf 36',
      }
    }

    this.ffmpeg = ffmpeg;
    this.ffmpeg.setFfmpegPath(ffmpegPath);
    this.inputFolder = 'input/';
    this.outputFolder = 'output/';
  }

  async clearOutput(directory) {
    try {
      const files = await fs.readdir(directory);

      for (const file of files) {
        await fs.unlink(`${directory}/${file}`);
      }

      console.log('Директория output очищена...');
    } catch (err) {
      throw err;
    }
  }

  async convert({format, codec, options, resolution, output, input}) {
    const fileName = input.split('/').pop().split('.mp4')[0];

    return new Promise((resolve, reject) => {
      this.ffmpeg(input)
        .output(output)
        .videoCodec(codec)
        .size(resolution)
        .outputOptions(options)
        .noAudio()
        .on('end', () => {
          console.log(`(${ fileName }) ${ format } ${ resolution } создан...`);

          resolve();
        })
        .on('error', (err) => {
          console.error(`во время преобразования в ${ format }:`, err);

          reject(err);
        })
        .run();
    });
  }

  async init() {
    try {
      const inputFiles = await fs.readdir(this.inputFolder);

      this.mp4Source = inputFiles.filter(file => file.endsWith('.mp4'));

      if (this.mp4Source.length === 0) {
        console.error('Нет доступных файлов формата *.mp4');

        return;
      }

      await this.clearOutput(this.outputFolder);

      const promises = this.mp4Source.map((input) => {
        const fileName = input.split('/').pop().split('.mp4')[0];
        const mp4SmallOutput = `${ this.outputFolder + fileName }_small.mp4`;
        const webmSmallOutput = `${ this.outputFolder + fileName }_small.webm`;
        const mp4BigOutput = `${ this.outputFolder + fileName }_big.mp4`;
        const webmBigOutput = `${ this.outputFolder + fileName }_big.webm`;

        return Promise.all([
          this.convert({
            format: 'MP4',
            codec: this.mp4.small.codec,
            options: this.mp4.small.options,
            resolution: this.mp4.small.resolution,
            output: mp4SmallOutput,
            input: `${ this.inputFolder }${ input }`,
          }),
          this.convert({
            format: 'MP4',
            codec: this.mp4.big.codec,
            options: this.mp4.big.options,
            resolution: this.mp4.big.resolution,
            output: mp4BigOutput,
            input: `${ this.inputFolder }${ input }`,
          }),
          this.convert({
            format: 'WEBM',
            codec: this.webm.small.codec,
            options: this.webm.small.options,
            resolution: this.webm.small.resolution,
            output: webmSmallOutput,
            input: `${ this.inputFolder }${ input }`,
          }),
          this.convert({
            format: 'WEBM',
            codec: this.webm.big.codec,
            options: this.webm.big.options,
            resolution: this.webm.big.resolution,
            output: webmBigOutput,
            input: `${ this.inputFolder }${ input }`,
          }),
        ]);
      });

      await Promise.all(promises);

      console.log('Все конвертации выполнены!');
    } catch (err) {
      console.error('Одна или несколько конвертаций не удались:', err);
    }
  }
}

const flickFlip = new FlickFlip();

flickFlip.init().then();
