import * as childProcess from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)
const writeFile = promisify(fs.writeFile)
const copyFile = promisify(fs.copyFile)
const readDir = promisify(fs.readdir)
const mkdtemp = promisify(fs.mkdtemp)

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
  templates?: string[]
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

const makePdfByReview = (reviewDir: string) => {
  return new Promise<{ code: number; data: string }>((resolve, reject) => {
    console.log('Re:VIEW compile start')
    let data = ''
    const cp = childProcess
      .spawn('review-pdfmaker', ['config.yml'], {
        cwd: reviewDir,
      })
      .on('close', code => {
        if (code !== 0) {
          reject({ code, data })
        } else {
          resolve({ code: 0, data })
        }
      })
    cp.stdout.on('data', chunk => {
      data += chunk.toString()
    })
    cp.stderr.on('data', chunk => {
      data += chunk.toString()
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

export const preparingConfig = (config: any) => {
  const catalog = { ...config.catalog }
  const templates = [...(config.templates || [])]
  const sty_templates = { ...config.sty_templates }
  delete config.catalog
  delete config.templates
  delete config.sty_templates

  return { catalog, templates, sty_templates }
}

export const debugBook = async (configFilename: string) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'easybooks-'))
  const config: ConfigJson = await readConfig(configFilename)

  const { catalog, templates, sty_templates } = preparingConfig(config)

  await copyFileRecursive('.', tmpDir)
  const { code, data } = await buildBookWithPrepared(
    config,
    catalog,
    templates,
    sty_templates,
    tmpDir,
  ).catch(({ code, data }) => ({ code, data }))
  return { code, data }
}

export const buildBookWithPrepared = async (
  config: any,
  catalog: any,
  templates: string[],
  sty_templates: any,
  projectDir: string,
) => {
  process.chdir(projectDir)
  mkdirp.sync('.review')

  const { tasks } = createCatalog(catalog)

  // 1. まず Re:VIEW sty ファイルを展開しておく
  // 上書きの都合上、先にやる必要がある
  if ('url' in sty_templates) {
    const { url, dir } = sty_templates
    console.log(url, dir)
    await extractTemplates(url, dir, '.review/sty')
    // 上書きの都合上、ここで先に実行しておく
  }

  // 大半の書き出しタスクは平行で行える
  await Promise.all([
    writeYaml('.review/catalog.yml', catalog),
    writeYaml('.review/config.yml', config),
    ...tasks,
    copyTemplates(templates),
  ])

  // .review ディレクトリが全てそろったのでコンパイルする
  const { code, data } = await makePdfByReview('.review')
  console.log('Re:VIEW compile done')
  return { code, data }
}
export const buildBook = async (
  configFilename: string,
  projectDir = path.dirname(configFilename),
) => {
  const config: ConfigJson = await readConfig(configFilename)

  const { catalog, templates, sty_templates } = preparingConfig(config)
  await buildBookWithPrepared(
    config,
    catalog,
    templates,
    sty_templates,
    projectDir,
  )
}
