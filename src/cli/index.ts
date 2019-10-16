import path from 'path'

import { buildBook } from '../'
import { readConfig } from '../adapters/review/config'
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
    buildBook(config, path.dirname(args._[0]), pres)
  } catch (e) {
    console.error(e)
  }
}

cli({
  _: process.argv.slice(2),
})
