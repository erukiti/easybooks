import fetch from 'node-fetch'

import * as EBAST from './ebast'
import { traverse } from './utils'

const enterCode = async (node: EBAST.Code) => {
  if (!node.src) {
    return
  }
  const res = await fetch(node.src.url)
  const text = await res.text()
  const lines = text.split('\n')
  const startLine = node.src.startLine || 0
  const endLine = node.src.endLine || lines.length - 1

  node.value = lines.slice(startLine - 1, endLine).join('\n')
}

const transformer = async (tree: EBAST.Root) => {
  await traverse(tree, {
    code: {
      enter: enterCode,
    },
  })
}

export default function ebastImportSourcePlugin() {
  return transformer as any
}
