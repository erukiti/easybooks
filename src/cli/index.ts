import { buildBook } from '../build-book'

const cli = (args: any) => {
  buildBook(args._[0])
}

cli({
  _: process.argv.slice(2),
})
