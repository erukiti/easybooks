import childProcess from 'child_process'
import fs from 'fs'
import { promisify } from 'util'
import yaml from 'js-yaml'
import unified from 'unified'

import { parseMarkdown } from '../markdown'
import reviewPlugin from '../md2review'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const exec = promisify(childProcess.exec)

const review = unified().use(reviewPlugin)
// const mdToReview = (src: string) => review.stringify(parseMarkdown(src))

export interface ConfigYml {
  bookname: string
  booktitle: string
  language: string
  aut: string[]
  review_version: string
  toc: boolean
  rights: string
  colophon: boolean
  history: string[][]
  prt: string
  pbl: string
  secnolevel: number
  titlepage: boolean
  coverimage: string
  urnid: string
  pdfmaker: {
    backcover: string
    texdocumentclass: string[]
    texstyle: string
    texcommand: string
  }
}

const compile = async (src: string, dest: string) => {
  const md = await readFile(src, { encoding: 'utf-8' })
  const root = parseMarkdown(md)

  console.log('wrote:', dest)
  await writeFile(dest, review.stringify(root), { encoding: 'utf-8' })
}

const writeCatalogYml = async (filename: string, catalog: any) => {
  console.log('wrote:', filename)
  await writeFile(filename, yaml.dump(catalog))
}

const run = async (configFilename: string) => {
  const catalog: any = {}
  const files: string[] = []
  const config = JSON.parse(
    await readFile(configFilename, { encoding: 'utf-8' }),
  )
  Object.keys(config.catalog).forEach(key => {
    config.catalog[key].forEach((filename: string) => {
      if (!(key in catalog)) {
        catalog[key] = []
      }
      files.push(filename)
      catalog[key].push(filename.replace(/\.md$/, '.re'))
    })
  })
  await Promise.all([
    writeCatalogYml('.review/catalog.yml', catalog),
    ...files.map(filename =>
      compile(filename, `.review/${filename.replace(/\.md$/, '.re')}`),
    ),
  ])
  console.log('Re:VIEW compile start')
  childProcess
    .spawn('review-pdfmaker', ['config.yml'], {
      cwd: '.review',
      stdio: 'inherit',
    })
    .on('close', code => {
      if (code !== 0) {
        console.error('error:', code)
      } else {
        console.log('Re:VIEW compile done')
      }
    })
}

run('effective-react-hooks.json')
