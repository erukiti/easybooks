import os from 'os'
import path from 'path'

import { Config } from './ports/build-book'
import { Presentation } from './ports/presentation'
import { ProjectFilesPort } from './ports/project-files'
import { FetchTemplatesPort } from './ports/fetch-templates'
import { createBuildBookByReviewPort } from './adapters/review'
import { createLocalFilesPort } from './adapters/local-files'
import { createFetchTemplatesPort } from './adapters/template-files'

export { Config }
export { Presentation }
export { ProjectFilesPort }

export const buildBook = async (
  config: Config,
  pres: Presentation,
  files: ProjectFilesPort,
  fetchTemplates: FetchTemplatesPort,
) => {
  const buildBook = createBuildBookByReviewPort({
    pres,
    files,
    fetchTemplates,
  })
  await buildBook.buildPdf(config)
}

export const buildBookFromDisk = async (
  config: Config,
  projectDir: string,
  pres: Presentation,
  fetchTemplates: FetchTemplatesPort = createFetchTemplatesPort({
    cacheDir: path.join(os.homedir(), 'easybooks', 'cache'),
  }),
) => {
  const files = createLocalFilesPort({ projectDir })
  return buildBook(config, pres, files, fetchTemplates)
}
