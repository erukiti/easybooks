import path from 'path'

import * as EBAST from './ebast'

interface Context {
  list: number
  id: number
  chapter: string
  index?: number
  ordered?: boolean
}

const getId = (context: Context) => {
  const id = context.id++
  return `${context.chapter}-${id.toString().padStart(3, '0')}`
}

const root = (tree: EBAST.Root, context: Context) => {
  return tree.children.map(child => compiler(child, context)).join('\n')
}

const heading = (tree: EBAST.Heading, context: Context) => {
  const s = tree.children
    .map(child => compiler(child, context))
    .join('')
    .trim()
  const option =
    tree.options.length === 0 ? '' : `[${tree.options.join(',')}]`
  return `${'='.repeat(tree.depth)}${option} ${s}\n`
}

const text = (tree: EBAST.Text) => {
  return tree.value
}

const paragraph = (tree: EBAST.Paragraph, context: Context) => {
  return `\n${tree.children
    .map(child => compiler(child, context))
    .join('')}\n`
}

const inlineCode = (tree: EBAST.InlineCode) => {
  return `@<code>{${tree.value.replace('}', '\\}')}}`
}

const ruby = (tree: EBAST.Ruby) => {
  return `@<ruby>{${tree.base}, ${tree.text}}`
}

const breakNode = () => {
  return `\n`
}

// FIXME 全オプションに対応する、適切な場所に移動する
const escapeOption = (opt: string) => {
  // FIXME: エスケープしないといけないのって、] だけ？なら、もっとダイレクトな書き方に書き換える
  return opt.replace(/([\]])/g, '\\$1')
}

const code = (tree: EBAST.Code, context: Context) => {
  if (tree.lang === 'sh') {
    return `//cmd{\n${tree.value}\n//}\n`
  }

  const command = tree.num ? 'listnum' : 'list'
  const id = (tree.id || getId(context)).replace('}', '\\}')
  const caption = escapeOption(tree.caption || tree.filename || '')
  const lang = tree.lang ? `[${tree.lang}]` : ''

  const header = `//${command}[${id}][${caption}]${lang}{`
  return [header, tree.value, '//}\n'].join('\n')
}

const link = (tree: EBAST.Link, context: Context) => {
  const s = tree.children.map(child => compiler(child, context)).join('')
  return `@<href>{${tree.url}${s ? `, ${s}` : ''}}`
}

const linkReference = (tree: EBAST.LinkReference, context: Context) => {
  const [tag, id] = (tree.identifier as string).split(':')
  if (tag && id) {
    return `@<${tag}>{${id.replace('}', '\\}')}}`
  }
  throw new Error(
    `linkRef: [tag:id] format is only supported. ${tree.identifier}`,
  )
}

const list = (tree: EBAST.List, context: Context) => {
  return (
    tree.children
      .map((child, index) =>
        compiler(child, {
          ...context,
          list: context.list + 1,
          ordered: tree.ordered || false,
          index: index + 1,
        }),
      )
      .join('') + '\n'
  )
}

const listItem = (tree: EBAST.ListItem, context: Context) => {
  const children = tree.children
    .map(child => compiler(child, context))
    .join('')
    .trim()
    .split('\n')
  const content = children.length > 1 ? children.slice(1).join('\n') : ''
  if (/^\s*\/\//m.test(content)) {
    const bullet = context.ordered ? `${context.index}.` : '*'
    const tag = context.ordered ? 'ol' : 'ul'
    return ` ${bullet} ${children[0]}\n//child[${tag}]\n${content}\n//child[/${tag}]\n`
  } else {
    const bullet = context.ordered
      ? `${context.index}.`
      : '*'.repeat(context.list)
    return ` ${bullet} ${children.join('\n')}\n`
  }
}

const ignore = (tree: any, context: Context) => ''

const blockquote = (tree: EBAST.Blockquote, context: Context) => {
  return `//quote{\n${tree.children.map(child =>
    compiler(child, context),
  )}//}\n`
}

const footnoteReference = (
  tree: EBAST.FootnoteReference,
  context: Context,
) => {
  return `@<fn>{${tree.identifier}}`
}

const footnoteDefinition = (
  tree: EBAST.FootnoteDefinition,
  context: Context,
) => {
  return `//footnote[${tree.identifier}][${tree.children
    .map(child => compiler(child, context))
    .join('')
    .trim()}]\n`
}

const emphasis = (tree: EBAST.Emphasis, context: Context) => {
  return `@<em>{${tree.children.map(child => compiler(child, context))}}`
}

const strong = (tree: EBAST.Strong, context: Context) => {
  return `@<strong>{${tree.children.map(child =>
    compiler(child, context),
  )}}`
}

const comment = (tree: EBAST.Comment, context: Context) => {
  return tree.value
    .trim()
    .split('\n')
    .map(line => `#@# ${line}`)
    .join('\n')
}

const image = (tree: EBAST.Image, context: Context) => {
  const matched = /^[^?]+\?(scale=[0-9.]+)$/.exec(tree.url)

  const url = path.basename(
    tree.url
      .replace(/\?(scale=[0-9.]+)$/, '')
      .replace(/\.[a-zA-Z0-9]+$/, ''),
  )

  if (matched) {
    return `//image[${url}][${tree.alt || ''}][${matched[1]}]`
  } else if (tree.alt) {
    return `//image[${url}][${tree.alt}]`
  } else {
    return `//image[${url}]`
  }
}

const TableAlign = {
  left: 'l',
  center: 'c',
  right: 'r',
}

const table = (tree: EBAST.Table, context: Context) => {
  const [header, ...rows] = tree.children.map(child =>
    compiler(child, context),
  )

  const lines: string[] = []

  if (tree.align) {
    lines.push(
      `//tsize[|latex||${tree.align
        .map(align => TableAlign[align || 'left'])
        .join('|')}|]`,
    )
  }

  // FIXME: caption!!!!
  lines.push(`//table[${getId(context)}][]{`)
  lines.push(header)
  lines.push('--------------------------')
  lines.push(...rows)
  lines.push('//}')
  lines.push('')

  return lines.join('\n')
}

const tableRow = (tree: EBAST.TableRow, context: Context) => {
  return tree.children.map(child => compiler(child, context)).join('\t')
}

const tableCell = (tree: EBAST.TableCell, context: Context) => {
  return tree.children.map(child => compiler(child, context)).join('')
}

const div = (tree: EBAST.Div, context: Context) => {
  if (tree.value) {
    return `//${tree.className}{\n${tree.value}\n//}\n`
  } else {
    return `//${tree.className}\n`
  }
}

const compilers = {
  root,
  paragraph,
  heading,
  thematicBreak: ignore,
  blockquote,
  text,
  inlineCode,
  ruby,
  break: breakNode,
  code,
  link,
  linkReference,
  list,
  listItem,
  footnoteReference,
  footnoteDefinition,
  emphasis,
  strong,
  image,
  table,
  tableRow,
  tableCell,
  comment,
  div,
}

export const compiler = (tree: EBAST.Node, context: Context): string => {
  if (tree.type in compilers) {
    const key = tree.type as keyof typeof compilers
    return compilers[key](tree, context)
  } else {
    console.log(tree)
    throw new Error(`Not implemented: ${tree.type}`)
  }
}

export default function mdToReview() {
  // @ts-ignore
  this.Compiler = (tree: EBAST.Root, vfile: any) => {
    return compiler(tree, {
      list: 0,
      id: 0,
      chapter: typeof vfile.data === 'string' ? vfile.data : '',
    })
  }
}
