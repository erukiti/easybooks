import { EasyBooksUsecase } from '../usecases/easybooks'
import { Presentation } from '../ports/presentation'
import {
  createEasyBooksBuilderLocal,
  readConfig,
  getProjectPath,
} from '../services'

export const createEasyBooksForCli = async (
  configPath: string,
  pres: Presentation,
): Promise<EasyBooksUsecase> => {
  const config = await readConfig(configPath)
  const projectPath = getProjectPath(configPath)
  const builder = await createEasyBooksBuilderLocal(
    config,
    projectPath,
    pres,
  )

  return builder
}
