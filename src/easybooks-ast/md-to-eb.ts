import MDAST from 'mdast'

import * as EBAST from './ebast'
import { traverse } from './utils'

const reKeyValue = /^(([a-zA-Z0-9]+)(?:=([^" ]+)|="([^"]+)")?)/

const parseKeyValue = (meta: string): { [props: string]: string } => {
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

export const parseMeta = (meta: string): { [props: string]: string } => {
  if (!meta) {
    return {}
  }

  return parseKeyValue(meta.trim().replace(/^\{(.*)\}$/, '$1'))
}

const enterCode = (node: MDAST.Code & EBAST.Code) => {
  const { id, caption, src, filename } = parseMeta(node.meta || '')
  node.id = id
  node.caption = caption
  node.filename = filename

  if (src) {
    const [url, lines] = src.split('#')
    if (!lines) {
      node.src = { url }
    } else {
      const [startLine, endLine] = lines
        .split('-')
        .map(n => Number.parseInt(n.replace(/^L/, '')))
      node.src = { url, startLine, endLine }
    }
  }
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

const enterTable = (node: MDAST.Table & EBAST.Table) => {
  const children: MDAST.TableRow[] = node.children
  if (children) {
    const row = children[children.length - 1]
    if (
      row.children.length === 1 &&
      row.children[0].children.length === 1 &&
      row.children[0].children[0].type === 'text'
    ) {
      const { caption, id } = parseKeyValue(row.children[0].children[0].value)
      node.caption = caption
      node.id = id
      node.children.pop() // remove last element
    }
  }
}

const transformer = async (tree: MDAST.Root) => {
  await traverse(tree, {
    code: {
      enter: enterCode,
    },
    heading: {
      enter: enterHeading,
    },
    html: {
      enter: enterHtml,
    },
    table: {
      enter: enterTable,
    },
  })
}

export default function mdToEb() {
  return transformer as any
}
