import path from 'path'

import { createEasyBooksBuilderLocal, readConfig } from '../services'
import { Presentation } from '../ports/presentation'

const cli = async (args: any) => {
  const pres: Presentation = {
    progress: state => console.log(state),
    info: message => console.log(message),
    warn: msg => console.log(JSON.stringify(msg)),
    error: msg => console.log(JSON.stringify(msg)),
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
