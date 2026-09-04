#!/usr/bin/env node
/**
 * Seed ~30 Japanese TTS voices into the Cloudflare D1 + R2 backend.
 *
 * Required: OPENAI_API_KEY=...
 * Optional: TTS_MODEL, TTS_VOICE, THREAD_TITLE, DEVICE_ID, CATEGORY_ID
 *
 * Usage (from apps/web-vue):
 *   node scripts/seed-tts.mjs
 *   node scripts/seed-tts.mjs --remote
 *
 * The app stores WAV bytes inside the RGB PNG envelope used by pngbytes.ts.
 * Wrangler performs the Cloudflare writes; no Cloudflare API token is stored here.
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { deflateSync } from 'node:zlib'
import { randomUUID } from 'node:crypto'

const MODEL = process.env.TTS_MODEL || 'gpt-4o-mini-tts'
const VOICE = process.env.TTS_VOICE || 'alloy'
const DEVICE_ID = process.env.DEVICE_ID || 'seed-tts'
const CATEGORY_ID = process.env.CATEGORY_ID || 'want'
const THREAD_TITLE = process.env.THREAD_TITLE || '日本語TTSサンプル'
const remote = process.argv.includes('--remote')
const workDir = join(process.cwd(), '.seed-tts')
const dbName = 'voice-bbs-db'
const bucket = 'vonsaiapps'

const samples = [
  'こんにちは。今日もいい一日になりそうですね。', 'おはようございます。ゆっくり始めましょう。',
  'こんにちは。ここでは声で気軽に話せます。', 'こんばんは。今日も一日おつかれさまでした。',
  'はじめまして。よろしくお願いします。', '元気ですか。私は元気です。', 'ちょっと休憩しませんか。',
  '無理をしないで、自分のペースで進みましょう。', '明日の予定を確認しておきましょう。',
  '今日は何を食べようかな。', 'おすすめのお店があったら教えてください。',
  'このアイデア、なかなか面白いと思います。', 'まずは小さく試してみましょう。',
  '失敗しても大丈夫。もう一度やってみましょう。', '困ったことがあれば、気軽に声をかけてください。',
  '探しているものが見つかるといいですね。', 'こんなのがあったら便利だと思いませんか。',
  '今日は少しだけ前に進めました。', '焦らず、一つずつ片づけていきましょう。',
  '新しいことを始めるのは、いつでも遅くありません。', 'いい質問ですね。いっしょに考えてみましょう。',
  'なるほど、それは興味深いですね。', 'その方法なら、かなり簡単にできそうです。',
  'まず現状を整理してから考えましょう。', 'データを見れば、次にやることが見えてきます。',
  '小さな改善を積み重ねることが大切です。', '今日はここまでにして、続きは明日にしましょう。',
  'おつかれさまでした。また明日お会いしましょう。', 'あなたのアイデアを聞かせてください。',
  '声を残しておくと、あとから思い出せます。',
]

function crc32(bytes) {
  let crc = 0xffffffff
  for (const b of bytes) {
    crc ^= b
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  Buffer.from(type).copy(out, 4)
  data.copy(out, 8)
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length)
  return out
}

function wavToPng(wav) {
  const payload = Buffer.alloc(4 + wav.length)
  payload.writeUInt32BE(wav.length, 0)
  wav.copy(payload, 4)
  const pixels = Math.ceil(payload.length / 3)
  const width = Math.ceil(Math.sqrt(pixels))
  const height = Math.ceil(pixels / width)
  const rgba = Buffer.alloc(width * height * 4, 0)
  for (let i = 0; i < width * height; i++) {
    const src = i * 3, dst = i * 4
    rgba[dst] = src < payload.length ? payload[src] : 0
    rgba[dst + 1] = src + 1 < payload.length ? payload[src + 1] : 0
    rgba[dst + 2] = src + 2 < payload.length ? payload[src + 2] : 0
    rgba[dst + 3] = 255
  }
  const stride = 1 + width * 4
  const raw = Buffer.alloc(height * stride)
  for (let y = 0; y < height; y++) rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4)
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([Buffer.from('\x89PNG\r\n\x1a\n', 'binary'), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

function durationFromWav(wav) {
  if (wav.length < 44 || wav.toString('ascii', 0, 4) !== 'RIFF') return 1
  const byteRate = wav.readUInt32LE(28), dataSize = wav.readUInt32LE(40)
  return byteRate > 0 ? Number((dataSize / byteRate).toFixed(3)) : 1
}

async function tts(text) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY is required')
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, voice: VOICE, input: text, response_format: 'wav' }),
  })
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`)
  return Buffer.from(await res.arrayBuffer())
}

function wrangler(args) {
  execFileSync('pnpm', ['exec', 'wrangler', ...args], { cwd: process.cwd(), stdio: 'inherit' })
}

function sqlEscape(value) { return String(value).replaceAll("'", "''") }

async function main() {
  mkdirSync(workDir, { recursive: true })
  const threadId = randomUUID(), rows = []
  console.log(`Generating ${samples.length} Japanese TTS samples (${MODEL}/${VOICE})...`)

  for (let i = 0; i < samples.length; i++) {
    const text = samples[i]
    console.log(`${String(i + 1).padStart(2, '0')}/${samples.length} ${text}`)
    const wav = await tts(text)
    const id = randomUUID(), file = join(workDir, `${id}.png`)
    writeFileSync(file, wavToPng(wav))
    rows.push({ id, text, duration: durationFromWav(wav), file })
  }

  const sql = [
    `INSERT OR IGNORE INTO threads (id, category_id, title, device_id) VALUES ('${threadId}', '${sqlEscape(CATEGORY_ID)}', '${sqlEscape(THREAD_TITLE)}', '${sqlEscape(DEVICE_ID)}');`,
    ...rows.map((r) => `INSERT OR IGNORE INTO posts (id, thread_id, device_id, audio_url, duration, content) VALUES ('${r.id}', '${threadId}', '${sqlEscape(DEVICE_ID)}', '/api/audio/${r.id}.png', ${r.duration}, '${sqlEscape(r.text)}');`),
  ].join('\n')

  if (remote) {
    for (const r of rows) wrangler(['r2', 'object', 'put', `${bucket}/posts/${r.id}.png`, '--file', r.file, '--remote', '--content-type', 'image/png'])
    wrangler(['d1', 'execute', dbName, '--remote', '--command', sql])
  } else {
    writeFileSync(join(workDir, 'seed.sql'), sql)
    console.log(`Generated ${join(workDir, 'seed.sql')}`)
    console.log('Local mode: no Cloudflare resources changed. Use --remote to seed D1 + R2.')
    return
  }

  rmSync(workDir, { recursive: true, force: true })
  console.log(`Seed complete: ${rows.length} voices in thread ${threadId}`)
}

main().catch((err) => { console.error(err instanceof Error ? err.message : err); process.exit(1) })
