import fs from 'fs'
import { promisify } from 'util'

import { Config } from '../../ports/build-book'

const readFile = promisify(fs.readFile)

export const readConfig = async (
  configFilename: string,
): Promise<Config> => {
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
