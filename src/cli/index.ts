import path from 'path'

import { createEasyBooksBuilderLocal, readConfig } from '../services'
import { Presentation } from '../ports/presentation'

const cli = async (args: any) => {
  const pres: Presentation = {
    progress: state => console.log(state),
    info: message => console.log(message),
    warn: msg =>
      console.log(`warn: ${msg.file}:${msg.line}: ${msg.message}`),
    error: msg =>
      console.log(`error: ${msg.file}:${msg.line}: ${msg.message}`),
  }

  try {
    const config = await readConfig(args._[0])
    const { buildPdf } = await createEasyBooksBuilderLocal(
      config,
      path.dirname(args._[0]),
      pres,
    )
    await buildPdf()
  } catch (e) {
    console.error(e)
  }
}

cli({
  _: process.argv.slice(2),
})
