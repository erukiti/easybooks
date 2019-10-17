import { Presentation } from './presentation'
import { ProjectFilesPort } from './project-files'
import { FetchTemplatesPort } from './fetch-templates'

export interface ConfigReview {
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

export type BuildBookPortsFactory = (ports: {
  pres: Presentation
  files: ProjectFilesPort
  fetchTemplates: FetchTemplatesPort
}) => BuildBookPorts
