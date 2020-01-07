import * as EBAST from './ebast'
import { traverse } from './utils'
import { ImporterPort } from '../ports/importer'

const createTransformer = (importer: ImporterPort) => {
  async function enterCode(node: EBAST.Code) {
    if (!node.src) {
      return
    }
    const text = await importer.fetchText(node.src.url)
    const lines = text.split('\n')
    const startLine = node.src.startLine || 0
    const endLine = node.src.endLine || lines.length - 1

    node.value = lines.slice(startLine - 1, endLine).join('\n')
  }

  async function transformer(tree: EBAST.Root) {
    await traverse(tree, {
      code: {
        enter: enterCode,
      },
    })
  }

  return transformer
}

export default function ebastImportSourcePlugin(conf: { importerPort: ImporterPort }) {
  return createTransformer(conf.importerPort) as any
}
