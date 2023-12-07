class FlickFlip {
  constructor() {
    this.mp4 = {
      setCodec: 'libx265',
      setBitrate: '1000k',
      setSegments: 16,
      setOptions: '-crf 28',
    }
    this.webm = {
      setCodec: 'libvpx-vp9',
      setBitrate: '800k',
      setSegments: 16,
      setOptions: '-crf 29',
    }
    this.fs = require('fs');
    this.ffmpeg = require('fluent-ffmpeg');
    this.ffmpegPath = require('ffmpeg-static');
    this.inputFolder = 'input/';
    this.outputFolder = 'output/';
    this.ffmpeg.setFfmpegPath(this.ffmpegPath);
    this.inputFiles = this.fs.readdirSync(this.inputFolder);
    this.mp4Files = this.inputFiles.filter(file => file.endsWith('.mp4'));

    if (this.mp4Files.length === 0) {
      console.error('Нет доступных файлов формата *.mp4');

      return;
    }

    this.mp4Paths = this.mp4Files.map(file => `${ this.inputFolder + file }`);
    this.clearOutput(this.outputFolder);
  }

  clearOutput(directory) {
    this.fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        this.fs.unlinkSync(`${ directory }/${ file }`);
      }

      console.log('Директория output очищена...');
    });
  }

  convert(format, codec, bitrate, segments, options, output, input) {
    const fileName = input.split('/').pop().split('.mp4')[0];

    return new Promise((resolve, reject) => {
      this.ffmpeg(input)
        .output(output)
        .videoCodec(codec)
        .videoBitrate(bitrate, segments)
        .outputOptions(options)
        .noAudio()
        .on('end', () => {
          console.log(`Файл ${ fileName }.${ format } создан...`);

          resolve();
        })
        .on('error', (err) => {
          console.error(`во время преобразования в ${ format }:`, err);

          reject(err);
        })
        .run();
    });
  }

  init() {
    const promises = this.mp4Paths.map((input) => {
      const fileName = input.split('/').pop().split('.mp4')[0];
      const mp4Output = `${ this.outputFolder + fileName }.mp4`;
      const webmOutput = `${ this.outputFolder + fileName }.webm`;

      return Promise.all([
        this.convert(
          'MP4',
          this.mp4.setCodec,
          this.mp4.setBitrate,
          this.mp4.setSegments,
          this.mp4.setOptions,
          mp4Output,
          input,
        ),
        this.convert(
          'WEBM',
          this.webm.setCodec,
          this.webm.setBitrate,
          this.webm.setSegments,
          this.webm.setOptions,
          webmOutput,
          input,
        )
      ]);
    });

    return Promise.all(promises)
      .then(() => {
        console.log('Все конвертации выполнены!');
      })
      .catch((err) => {
        console.error('Одна или несколько конвертаций не удалась:', err);
      });
  }
}

const flickFlip = new FlickFlip();

flickFlip.init().then();
