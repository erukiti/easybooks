import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import fetch from 'node-fetch'
import JSZip from 'jszip'
import mkdirp from 'mkdirp'

import { Presentation } from '../ports/presentation'

// FIXME: キャッシュの仕組みを導入する

const writeFile = promisify(fs.writeFile)

const fetchTemplates = async (url: string, dir: string) => {
  const tasks: Promise<{ text: string; name: string }>[] = []
  const res = await fetch(url)
  const zip = new JSZip()
  const buf = await res.arrayBuffer()
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

export const extractTemplates = async (
  url: string,
  dir: string,
  dest: string,
  pres: Presentation,
) => {
  mkdirp.sync(dest)
  pres.info(`fetch TeX sty templates from: ${url}`)
  const files = await fetchTemplates(url, dir)
  pres.info('fetch done')
  return Promise.all(
    files.map(async file => {
      pres.info(file.name)
      await writeFile(path.join(dest, file.name), file.text)
      pres.info(`TeX sty extracted: ${path.join(dest, file.name)}`)
    }),
  )
}
