import path from 'path'

import { buildBook } from '../build-book'
import { readConfig } from '../build-book/config'

const cli = async (args: any) => {
  try {
    const config = await readConfig(args._[0])
    buildBook(config, path.dirname(args._[0]))
  } catch (e) {
    console.error(e)
  }
}

cli({
  _: process.argv.slice(2),
})
