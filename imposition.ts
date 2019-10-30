import childProcess from 'child_process'

const calcImpotision = (pagesLength: number) => {
  if (pagesLength % 4 !== 0) {
    throw new Error('pages needs multiples of 4.')
  }

  const pages = []

  let min = 1
  let max = pagesLength
  let isFront = true

  while (min < max) {
    if (isFront) {
      pages.push(max, min)
    } else {
      pages.push(min, max)
    }
    isFront = !isFront

    min++
    max--
  }
  return pages
}

const readPagesLength = (filename: string) => {
  const buf = childProcess.execSync(`pdfinfo ${filename}`)
  // FIXME: need shell escape

  for (const line of buf.toString().split('\n')) {
    const arr = line.split(':')
    if (arr[0] === 'Pages') {
      return Number.parseInt(arr[1].trim())
    }
  }
  console.log(buf.toString())
  throw new Error('pages not found')
}

const run = (filename: string, outputFile:string) => {
  const pagesLength = readPagesLength(filename)
  console.log(`pdftk ${filename} cat ${calcImpotision(pagesLength).join(' ')} output ${outputFile}`)
}

run(process.argv[2], process.argv[3])
