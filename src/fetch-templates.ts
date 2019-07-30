import fetch from 'node-fetch'
import JSZip from 'jszip'

// FIXME: キャッシュの仕組みを導入する

export const fetchTemplates = async (url: string, dir: string) => {
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
        st.on('end', () => resolve({ text, name: relPath.slice(dir.length) }))
      }),
    )
  })
  return Promise.all(tasks)
}
