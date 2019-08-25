import * as childProcess from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)
const writeFile = promisify(fs.writeFile)
const copyFile = promisify(fs.copyFile)
const readDir = promisify(fs.readdir)

import unified from 'unified'
import yaml from 'js-yaml'
import mkdirp from 'mkdirp'

import mdastToReviewPlugin from './review'
import { parseMarkdown } from './markdown'
import { fetchTemplates } from './fetch-templates'

import vFile from 'vfile'

const review = unified().use(mdastToReviewPlugin)

const copyFileRecursive = async (srcDir: string, destDir: string) => {
  const entries = await readDir(srcDir)
  mkdirp.sync(destDir)
  await Promise.all(
    entries.map(async entry => {
      const filename = path.join(srcDir, entry)
      const st = await stat(filename)
      if (st.isDirectory()) {
        return copyFileRecursive(filename, path.join(destDir, entry))
      } else {
        return copyFile(filename, path.join(destDir, entry))
      }
    }),
  )
}

export interface ConfigYaml {
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
  [p: string]: any
}

export interface Catalog {
  [props: string]: string[]
}

export type ConfigJson = ConfigYaml & {
  catalog: Catalog
  templates: string[]
  sty_templates?: {
    url: string
    dir: string
  }
}

const convert = async (src: string, dest: string) => {
  const markdownText = await readFile(src, { encoding: 'utf-8' })
  const root = parseMarkdown(markdownText)
  console.log('wrote:', dest)
  mkdirp.sync(path.dirname(dest))
  await writeFile(
    dest,
    review.stringify(
      root,
      vFile({ data: path.basename(dest).replace(/\.[a-zA-Z0-9]+$/, '') }),
    ),
    {
      encoding: 'utf-8',
    },
  )
}

const writeYaml = async (filename: string, data: any) => {
  console.log('wrote:', filename)
  mkdirp.sync(path.dirname(filename))
  await writeFile(filename, yaml.dump(data))
}

const readConfig = async (configFilename: string): Promise<ConfigJson> => {
  return JSON.parse(await readFile(configFilename, { encoding: 'utf-8' }))
}

const toDesination = (filename: string) => path.join('.review', filename)

const createCatalog = (catalog: Catalog) => {
  const tasks: Promise<any>[] = []
  Object.keys(catalog).map(key => {
    catalog[key] = catalog[key].map(filename => {
      if (filename.endsWith('.md')) {
        const reviewFilename = filename.replace(/\.md$/, '.re')
        tasks.push(convert(filename, toDesination(reviewFilename)))
        return reviewFilename
      } else {
        const copy = async () => {
          console.log('copyed:', toDesination(filename))
          await copyFile(filename, toDesination(filename))
        }
        tasks.push(copy())
        return filename
      }
    })
  })

  return { catalog, tasks }
}

const copyTemplates = async (templates: string[]) => {
  if (templates.length === 0) {
    return
  }
  await templates.map(dir => copyFileRecursive(dir, toDesination(dir)))
}

const makePdfByReview = () => {
  return new Promise((resolve, reject) => {
    console.log('Re:VIEW compile start')
    childProcess
      .spawn('review-pdfmaker', ['config.yml'], {
        cwd: '.review',
        stdio: 'inherit',
      })
      .on('close', code => {
        if (code !== 0) {
          reject(`error: ${code}`)
        } else {
          resolve()
        }
      })
  })
}

const extractTemplates = async (url: string, dir: string, dest: string) => {
  mkdirp.sync(dest)
  console.log('fetch TeX sty templates from:', url)
  const files = await fetchTemplates(url, dir)
  console.log('fetch done')
  return Promise.all(
    files.map(async file => {
      console.log(file.name)
      await writeFile(path.join(dest, file.name), file.text)
      console.log('TeX sty extracted:', path.join(dest, file.name))
    }),
  )
}

export const buildBook = async (
  configFilename: string,
  projectDir = path.dirname(configFilename),
) => {
  const config: ConfigJson = await readConfig(configFilename)

  process.chdir(projectDir)
  mkdirp.sync('.review')

  const { catalog, tasks } = createCatalog(config.catalog)
  delete config.catalog

  const templates = config.templates || []
  delete config.templates

  if (config.sty_templates) {
    const { url, dir } = config.sty_templates
    console.log(url, dir)
    await extractTemplates(url, dir, '.review/sty')
    // 上書きの都合上、ここで先に実行しておく
  }

  await Promise.all([
    writeYaml('.review/catalog.yml', catalog),
    writeYaml('.review/config.yml', config),
    ...tasks,
    copyTemplates(templates),
  ])

  await makePdfByReview()
  console.log('Re:VIEW compile done')
}
