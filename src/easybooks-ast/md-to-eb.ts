import MDAST from 'mdast'

import * as EBAST from './ebast'
import { traverse } from './utils'

const reKeyValue = /^(([a-zA-Z0-9]+)(?:=([^" ]+)|="([^"]+)")?)/
export const parseMeta = (meta: string): { [props: string]: any } => {
  if (!meta) {
    return {}
  }
  meta = meta.trim().replace(/^\{(.*)\}$/, '$1')

  const results: { [props: string]: any } = {}
  let matched
  while ((matched = reKeyValue.exec(meta))) {
    const key = matched[2]
    const value = matched[3] || matched[4] || true
    results[key] = value
    meta = meta.slice(matched[1].length).trimLeft()
  }
  return results
}

const enterCode = (node: MDAST.Code & EBAST.Code) => {
  const { id, caption } = parseMeta(node.meta || '')
  node.id = id
  node.caption = caption
}

const enterHeading = (node: MDAST.Heading & EBAST.Heading) => {
  node.options = []
  const children = node.children
    .map(child => {
      if (child.type === 'linkReference') {
        // FIXME: 本当に ref の時用の処理を追加する
        // console.log(child)
        node.options!.push(child.identifier as string)
        return null
      } else {
        return child
      }
    })
    .filter(child => child) as MDAST.PhrasingContent[] & EBAST.PhrasingContent[]
  node.children = children
}

const enterHtml = (node: MDAST.HTML & EBAST.Comment) => {
  if (!node.value.trim().startsWith('<!--')) {
    throw new Error(`unsupported HTML.\n${node.value}`)
  }

  const value = node.value
    .trim()
    .replace(/^<!--/, '')
    .replace(/-->$/, '')
    .trim()
  ;(node as EBAST.Comment).type = 'comment'
  node.value = value
}

const transformer = (tree: MDAST.Root) => {
  traverse(tree, {
    code: {
      enter: enterCode,
    },
    heading: {
      enter: enterHeading,
    },
    html: {
      enter: enterHtml,
    },
  })
}

export default function mdToEb() {
  return transformer as any
}
