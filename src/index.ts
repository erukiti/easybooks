import { Config } from './ports/build-book'
import { Presentation } from './ports/presentation'
import { ProjectFilesPort } from './ports/project-files'
import { createBuildBookByReviewPort } from './adapters/review'
import { createLocalFilesPort } from './adapters/local-files'

export { Config }
export { Presentation }
export { ProjectFilesPort }

export const buildBook = async (
  config: Config,
  pres: Presentation,
  files: ProjectFilesPort,
) => {
  const buildBook = createBuildBookByReviewPort({ pres, files })
  await buildBook.buildPdf(config)
}

export const buildBookFromDisk = async (
  config: Config,
  projectDir: string,
  pres: Presentation,
) => {
  const files = createLocalFilesPort({ projectDir })
  return buildBook(config, pres, files)
}
