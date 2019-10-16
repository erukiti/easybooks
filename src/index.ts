import { Config } from './ports/build-book'
import { Presentation } from './ports/presentation'
import { createBuildBookByReviewPort } from './adapters/review'

export const buildBook = async (
  config: Config,
  projectDir: string,
  pres: Presentation,
) => {
  const buildBook = createBuildBookByReviewPort({ pres }, { projectDir })
  await buildBook.buildPdf(config)
}
