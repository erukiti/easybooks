import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { createHash } from 'crypto'

import fetch from 'node-fetch'
import JSZip from 'jszip'
import mkdirp from 'mkdirp'

import {
  FetchTemplatesPort,
  FetchTemplatesPortFactory,
} from '../ports/fetch-templates'

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

export interface FetchContext {
  cacheDir: string
}

const getHash = (buf: string | Buffer) => {
  const sha256 = createHash('sha256')
  sha256.write(buf)
  return sha256.digest().toString('hex')
}

export const createFetchTemplatesPort: FetchTemplatesPortFactory<
  FetchContext
> = ({ cacheDir }, pres) => {
  const fetchTemplates: FetchTemplatesPort['fetch'] = async (
    url: string,
    dir: string,
  ) => {
    const cacheFilename = path.join(cacheDir, `${getHash(url)}.zip`)

    const tasks: Promise<{ text: string; name: string }>[] = []
    let buf: ArrayBuffer

    try {
      buf = new Uint8Array(await readFile(cacheFilename)).buffer
      pres.info(`read templates from cache`)
    } catch (e) {
      if (e.code !== 'ENOENT') {
        throw e
      }
      pres.info(`fetch templates`)

      const res = await fetch(url)
      buf = await res.arrayBuffer()
      mkdirp.sync(path.dirname(cacheFilename))
      await writeFile(cacheFilename, Buffer.from(buf))
    }

    const zip = new JSZip()
    await zip.loadAsync(buf)
    zip.forEach((relPath, file) => {
      if (!relPath.startsWith(dir) || relPath === dir) {
        return
      }
      tasks.push(
        new Promise((resolve, reject) => {
          let text: string = ''
          const st = file.nodeStream()
          st.on('data', data => (text += data.toString()))
          st.on('error', err => reject(err))
          st.on('end', () =>
            resolve({ text, name: relPath.slice(dir.length) }),
          )
        }),
      )
    })
    return Promise.all(tasks)
  }
  return { fetch: fetchTemplates }
}
