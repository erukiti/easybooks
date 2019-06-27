import * as childProcess from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import unified from 'unified'
import yaml from 'js-yaml'

import mdastToReviewPlugin from './review'
import { parseMarkdown } from './markdown'
// import { parseActualCode } from './codeblock'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const review = unified().use(mdastToReviewPlugin)

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

export type ConfigJson = ConfigYml & {
  catalog: { [props: string]: string[] }
}

const compile = async (src: string, dest: string) => {
  const markdownText = await readFile(src, { encoding: 'utf-8' })
  const root = parseMarkdown(markdownText)
  console.log('wrote:', dest)
  await writeFile(dest, review.stringify(root), { encoding: 'utf-8' })
}

const writeCatalogYml = async (filename: string, catalog: any) => {
  console.log('wrote:', filename)
  await writeFile(filename, yaml.dump(catalog))
}

export const buildBook = async (configFilename: string) => {
  const catalog: any = {}
  const files: string[] = []
  const config: ConfigJson = JSON.parse(
    await readFile(configFilename, { encoding: 'utf-8' }),
  )
  process.chdir(path.dirname(configFilename))
  Object.keys(config.catalog).forEach(key => {
    config.catalog[key].forEach(filename => {
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
