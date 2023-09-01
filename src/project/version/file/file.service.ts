import {createReadStream, existsSync, writeFileSync, readFileSync, unlinkSync} from 'fs';
import * as wav from 'node-wav';
import { createCanvas } from 'canvas';
import {Injectable, StreamableFile} from '@nestjs/common';
import {createHash} from 'crypto';
import {join} from 'path';
import {PrismaClient} from "@prisma/client";
import * as Mp32Wav from "mp3-to-wav"

@Injectable()
export class FileService {

    static ROOT_PATH_AUDIO = "files/audio"
    static ROOT_PATH_AUDIO_TMP = FileService.ROOT_PATH_AUDIO + "/tmp"
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

        const wavData = wav.decode(audioBuffer),
              samplesPerFrame = Math.floor(wavData["channelData"][0].length / options.width)

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

    private isWaveBuffer(buffer: Buffer) {
        try {
            wav.decode(buffer)
            return true
        } catch (_) { return false }
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

    private async saveAudioFile(buffer: Buffer) {
        let mp3Id = undefined
        if (!this.isWaveBuffer(buffer)) {
            mp3Id = FileService.generateFileId(buffer)

            const mp3AudioFilePath = FileService.getAudioFilePath(mp3Id, "mp3")
            if (!existsSync(mp3AudioFilePath))
                writeFileSync(mp3AudioFilePath, buffer)

            await (new Mp32Wav(mp3AudioFilePath, FileService.ROOT_PATH_AUDIO_TMP)).exec(undefined)
            const mp3ToWaveAudioFilePath = join(FileService.ROOT_PATH_AUDIO_TMP, mp3Id + ".wav")
            buffer = readFileSync(mp3ToWaveAudioFilePath)
            unlinkSync(mp3ToWaveAudioFilePath)
        }

        const waveId = FileService.generateFileId(buffer),
              waveAudioFilePath = FileService.getAudioFilePath(waveId, "wav"),
              waveformPath = FileService.getWaveformFilePath(waveId)

        let addedWaveform = false
        if (!existsSync(waveformPath)) {
            writeFileSync(FileService.getWaveformFilePath(waveId), await this.generateWaveform(buffer))
            addedWaveform = true
        }

        let addedWaveAudio = false
        if (!existsSync(waveAudioFilePath)) {
            writeFileSync(waveAudioFilePath, buffer)
            addedWaveAudio = true
        }

        return {waveId, mp3Id, addedWaveAudio, addedMP3Audio: !!mp3Id, addedWaveform}
    }

    async addAudioFile(versionId: number, buffer: Buffer) {
        const {waveId, mp3Id, addedMP3Audio} = await this.saveAudioFile(buffer)

        if (!((await this.prisma.tprojectversionfile.findFirst({
            where: {
                id: waveId,
                type: "wav",
                projectversion_id: versionId,
            },
            select: { projectversion_id: true }
        }))?.projectversion_id))
            await this.prisma.tprojectversionfile.create({
                data: {
                    id: waveId,
                    type: "wav",
                    projectversion_id: versionId,
                }
            })

        if (addedMP3Audio && !((await this.prisma.tprojectversionfile.findFirst({
            where: {
                id: mp3Id,
                type: "mp3",
                projectversion_id: versionId,
            },
            select: { projectversion_id: true }
        }))?.projectversion_id))
            await this.prisma.tprojectversionfile.create({
                data: {
                    id: mp3Id,
                    type: "mp3",
                    projectversion_id: versionId,
                }
            })

        return {waveId, mp3Id}
    }
}
