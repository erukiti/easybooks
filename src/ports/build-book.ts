import { Presentation } from './presentation'

export interface ConfigReview {
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

export type Config = ConfigReview & {
  catalog: Catalog
  templates?: string[]
  sty_templates?: {
    url: string
    dir: string
  }
}

export interface BuildBookPorts {
  buildPdf: (config: Config) => Promise<void>
}

export type BuildBookPortsFactory<T = unknown> = (
  ports: {
    pres: Presentation
  },
  context: T,
) => BuildBookPorts
