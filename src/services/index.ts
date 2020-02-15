import os from 'os'
import path from 'path'

import { Config } from '../ports/build-book'
import { Presentation } from '../ports/presentation'
import { ProjectFilesPort } from '../ports/project-files'
import { FetchTemplatesPort } from '../ports/fetch-templates'

import { createBuildBookByReviewPort } from '../adapters/review'
import { createLocalFilesPort } from '../adapters/local-files'
import { createFetchTemplatesPort } from '../adapters/template-files'

export { readConfig } from '../adapters/review/config'

export const createEasyBooksBuilder = (
  config: Config,
  pres: Presentation,
  files: ProjectFilesPort,
  fetchTemplates: FetchTemplatesPort,
) => {
  const builder = createBuildBookByReviewPort({
    pres,
    files,
    fetchTemplates,
  })
  return {
    buildPdf: () => builder.buildPdf(config),
  }
}

export const createEasyBooksBuilderLocal = async (
  config: Config,
  projectDir: string,
  pres: Presentation,
) => {
  const fetchTemplates = createFetchTemplatesPort(
    {
      cacheDir: path.join(os.homedir(), 'easybooks', 'cache'),
    },
    pres,
  )
  const files = createLocalFilesPort({ projectDir })
  const builder = createBuildBookByReviewPort({
    pres,
    files,
    fetchTemplates,
  })
  return {
    buildPdf: () => builder.buildPdf(config),
  }
}

export const getProjectPath = (configPath: string) => {
  return path.dirname(configPath)
}
