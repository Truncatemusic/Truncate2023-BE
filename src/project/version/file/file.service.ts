import {createReadStream, existsSync, writeFileSync} from 'fs';
import * as wav from 'node-wav';
import { createCanvas } from 'canvas';
import {Injectable, StreamableFile} from '@nestjs/common';
import {createHash} from 'crypto';
import {join} from 'path';
import {PrismaClient} from "@prisma/client";
import {extension as mimeExtension} from 'mime-types';

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

    static getTypeFromMIME(mimetype: string) {
        return mimeExtension(mimetype) || undefined
    }

    static generateFileId(buffer: Buffer) {
        return createHash('sha512')
            .update(buffer)
            .digest('hex')
            .substring(0, 128)
    }

    constructor(private readonly prisma: PrismaClient) {}

    private async generateWaveform(audioBuffer: Buffer, waveformOptions?: object) {
        const options = {
            width:           8000,
            height:          1000,
            frames:          8000,
            maxLineWidth:    10,
            backgroundColor: "#00000000",
            lineColor:       "#000000",
            ...waveformOptions
        }

        const wavData = wav.decode(audioBuffer)
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

        return canvas.toBuffer('image/png')
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

    private async saveAudioFile(buffer: Buffer, type: string) {
        const id = FileService.generateFileId(buffer),
              audioFilePath = FileService.getAudioFilePath(id, type),
              waveformPath = FileService.getWaveformFilePath(id)

        let addedWaveform = false
        if (!existsSync(waveformPath)) {
            writeFileSync(FileService.getWaveformFilePath(id), await this.generateWaveform(buffer))
            addedWaveform = true
        }

        let addedAudio = false
        if (!existsSync(audioFilePath)) {
            writeFileSync(audioFilePath, buffer)
            addedAudio = true
        }

        return {id, addedAudio, addedWaveform}
    }

    async addAudioFile(versionId: number, buffer: Buffer, type: string) {
        const {id} = await this.saveAudioFile(buffer, type)
        const result = await this.prisma.tprojectversionfile.findFirst({
            where: {
                id, type,
                projectversion_id: versionId,
            },
            select: { projectversion_id: true }
        })

        if (!result?.projectversion_id)
            await this.prisma.tprojectversionfile.create({
                data: {
                    id, type,
                    projectversion_id: versionId,
                }
            })

        return id
    }
}
