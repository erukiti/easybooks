import fs from 'fs'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

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

export const readConfig = async (
  configFilename: string,
): Promise<ConfigJson> => {
  return JSON.parse(await readFile(configFilename, { encoding: 'utf-8' }))
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
