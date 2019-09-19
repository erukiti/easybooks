import fs from 'fs'
import path from 'path'
import os from 'os'
import { promisify } from 'util'

import mkdirp from 'mkdirp'

import { extractTemplates } from './template-files'
import { copyFileRecursive } from '../files'
import { writeYaml, createCatalog, copyTemplates } from './tasks'
import { makePdfByReview } from './make-pdf-by-review'

const readFile = promisify(fs.readFile)
const mkdtemp = promisify(fs.mkdtemp)

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

const readConfig = async (configFilename: string): Promise<ConfigJson> => {
  return JSON.parse(await readFile(configFilename, { encoding: 'utf-8' }))
}

export const toDesination = (filename: string) => path.join('.review', filename)

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
  )
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
