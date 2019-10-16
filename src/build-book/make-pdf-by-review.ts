import childProcess from 'child_process'

export const makePdfByReview = (reviewDir: string) => {
  return new Promise<{ code: number; data: string }>((resolve, reject) => {
    console.log('Re:VIEW compile start')
    let data = ''
    const cp = childProcess
      .spawn('review-pdfmaker', ['config.yml'], {
        cwd: reviewDir,
      })
      .on('close', code => {
        resolve({ code, data })
      })
      .on('error', err => {
        reject(data)
      })
    cp.stdout.on('data', chunk => {
      data += chunk.toString()
    })
    cp.stderr.on('data', chunk => {
      data += chunk.toString()
    })
  })
}
