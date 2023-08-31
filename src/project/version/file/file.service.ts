import {createReadStream, existsSync, promises as fsPromises} from 'fs';
import * as wav from 'node-wav';
import { createCanvas } from 'canvas';
import {Injectable, StreamableFile} from '@nestjs/common';
import {createHash} from 'crypto';
import {join} from 'path';

@Injectable()
export class FileService {

    static ROOT_PATH_AUDIO = "files/audio"
    static ROOT_PATH_WAVEFORM = "files/waveform"

    static getAudioFilePath(fileOrId: string, type?: string) {
        return join(
            this.ROOT_PATH_AUDIO,
            type? fileOrId + "." + type
                : fileOrId)
    }

    static getWaveformFilePath(id: string) {
        return join(this.ROOT_PATH_WAVEFORM, id+".png")
    }

    static generateFileId() {
        return createHash('sha512')
            .update(new Date().getTime().toString())
            .digest('hex')
            .substring(0, 128)
    }

    static async generateWaveform(audioFile: string, waveformFile: string, waveformOptions?: object) {
        const options = {
            width:           8000,
            height:          1000,
            frames:          8000,
            maxLineWidth:    10,
            backgroundColor: "#00000000",
            lineColor:       "#000000",
            ...waveformOptions
        }

        audioFile    = this.getAudioFilePath(audioFile)
        waveformFile = this.getWaveformFilePath(waveformFile)

        const wavData = wav.decode(await fsPromises.readFile(audioFile))
        const samplesPerFrame = Math.floor(wavData["channelData"][0].length / options.width)

        const averageLoudnessArray = []
        let   highestLoudness = 0
        for (let i = 0; i < options.width; i++) {
            const frame = wavData["channelData"][0].slice(i * samplesPerFrame, (i + 1) * samplesPerFrame),
                  averageLoudness = frame.reduce((sum: number, sample: number) => sum + sample, 0) / frame.length

            if (averageLoudness > highestLoudness)
                highestLoudness = averageLoudness
            averageLoudnessArray.push(averageLoudness)
        }

        const canvas = createCanvas(options.width, options.height),
              context = canvas.getContext('2d')

        context.fillStyle = options.backgroundColor
        context.fillRect(0, 0, options.width, options.height)

        context.strokeStyle = options.lineColor
        context.beginPath()
        for (let i = 0; i < options.frames; i++) {
            const x = i,
                  y = options.height / 2 - (averageLoudnessArray[i] * (1 - highestLoudness + 1)) * (options.height / 2)
            context.lineWidth = options.maxLineWidth - ((averageLoudnessArray[i+1] + .5) * (options.maxLineWidth / 2))
            if (!i)
                 context.moveTo(x, y)
            else context.lineTo(x, y)
        }
        context.stroke()

        await fsPromises.writeFile(waveformFile, canvas.toBuffer('image/png'))
    }

    getWaveformImage(id: string) {
        const waveformFilePath = FileService.getWaveformFilePath(id)
        return existsSync(waveformFilePath)
            ? new StreamableFile(createReadStream(FileService.getWaveformFilePath(id)))
            : null
    }

    getAudio(id: string, type: string) {
        const audioFilePath = FileService.getAudioFilePath(id, type)
        return existsSync(audioFilePath)
            ? new StreamableFile(createReadStream(audioFilePath))
            : null
    }
}
