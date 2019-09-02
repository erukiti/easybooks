import * as EBAST from './ebast'

interface Context {
  list: number
  id: number
  chapter: string
}

const getId = (context: Context) => {
  const id = context.id++
  return `${context.chapter}-${id.toString().padStart(3, '0')}`
}

const escape = (s: string) => {
  return s
    .replace('#', '#')
    .replace('%', '%')
    .replace('&', '&')
    .replace('{', '\\{')
    .replace('}', '\\}')
    .replace('-', '{-}')
    .replace('$', '\textdollar{}')
    .replace('_', '\\textunderscore{}')
    .replace('|', '\\textbar{}')
    .replace('^', '\\textasciicircum{}')
    .replace('~', '\\textasciitilde{}')
    .replace('<', '\\textless{}')
    .replace('>', '\\textgreater{}')
    .replace('\\', '\\reviewbackslash{}')
}

const root = (tree: EBAST.Root, context: Context) => {
  return tree.children.map(child => compiler(child, context)).join('\n')
}

const heading = (tree: EBAST.Heading, context: Context) => {
  const options: string[] = []
  const s = tree.children
    .map(child => {
      if (child.type === 'linkReference') {
        options.push(child.identifier as string)
      } else {
        return compiler(child, context)
      }
    })
    .join('')
    .trim()
  const option = options.length === 0 ? '' : `[${options.join(',')}]`

  switch (tree.depth) {
    case 1: {
      return `\\chapter{${escape(s)}}\n`
    }
    case 2: {
      return `\\section{${escape(s)}}\n`
    }
    case 3: {
      return `\\subsection{${escape(s)}}\n`
    }
    case 4: {
      return `\\subsubsection(${escape(s)}}\n`
    }
    case 5: {
      return `\\paragraph(${escape(s)}}\n`
    }
    case 6: {
      return `\\subparagraph(${escape(s)}}\n`
    }
    default: {
      throw new Error(`unkonwn level ${tree.depth}`)
    }
  }
}

const text = (tree: EBAST.Text) => {
  return escape(tree.value)
}

const paragraph = (tree: EBAST.Paragraph, context: Context) => {
  return `\n${tree.children.map(child => compiler(child, context)).join('')}\n`
}

const inlineCode = (tree: EBAST.InlineCode) => {
  return `\\reviewcode{${escape(tree.value)}}`
}

const breakNode = () => {
  return `\n`
}

const code = (tree: EBAST.Code, context: Context) => {
  const lang = tree.lang ? `[${tree.lang}]` : ''
  if (lang === 'sh') {
    const lines: string[] = []
    lines.push('\\begin{reviewlistblock}')
    lines.push('\\begin{reviewcmd}')
    lines.push(escape(tree.value))
    lines.push('\\end{reviewcmd}')
    lines.push('\\end{reviewlistblock}')
    return lines.join('\n')
  }

  const lines: string[] = []
  lines.push('\\begin{reviewlistblock}')
  if (tree.caption) {
    lines.push(`\\reviewlistcaption{リスト****${escape(tree.caption)}}`)
  }
  lines.push('\\begin{reviewlist}')
  lines.push(escape(tree.value))
  lines.push('\\end{reviewlist}')
  lines.push('\\end{reviewlistblock}')

  return lines.join('\n')
  /*
  return `//listnum[${(meta.id || getId(context)).replace(
    '}',
    '\\}',
  )}][${meta.caption || ''}]${lang}{\n${tree.value}\n//}\n`
*/
}

const link = (tree: EBAST.Link, context: Context) => {
  const s = tree.children.map(child => compiler(child, context)).join('')
  return `@<href>{${tree.url}${s ? `, ${s}` : ''}}`
}

const linkReference = (tree: EBAST.LinkReference, context: Context) => {
  const [tag, id] = (tree.identifier as string).split(':')
  if (tag !== '' && id !== '') {
    return `@<${tag}>{${id.replace('}', '\\}')}}`
  }
  throw new Error('linkRef: [tag:id] format is only supported.')
}

const list = (tree: EBAST.List, context: Context) => {
  return (
    tree.children
      .map(child => compiler(child, { ...context, list: context.list + 1 }))
      .join('') + '\n'
  )
}

const listItem = (tree: EBAST.ListItem, context: Context) => {
  return ` ${'*'.repeat(context.list)} ${tree.children
    .map(child => compiler(child, context))
    .join('')
    .trim()}\n`
}

const ignore = (tree: any, context: Context) => ''

const blockquote = (tree: EBAST.Blockquote, context: Context) => {
  return `//quote{\n${tree.children.map(child => compiler(child, context))}}\n`
}

const footnoteReference = (tree: EBAST.FootnoteReference, context: Context) => {
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
  return `@<strong>{${tree.children.map(child => compiler(child, context))}}`
}

const html = (tree: EBAST.HTML, context: Context) => {
  if (tree.value.startsWith('<!--')) {
    return tree.value
      .replace(/^<!--/, '')
      .replace(/-->$/, '')
      .trim()
      .split('\n')
      .map(line => `#@# ${line}`)
      .join('\n')
  } else {
    throw new Error(`supported HTML is comment only.\n${tree.value}`)
  }
}

const image = (tree: EBAST.Image, context: Context) => {
  const url = tree.url.replace(/^images\//, '').replace(/\.[a-zA-Z0-9]$/, '')
  return `//image[${url}][${tree.alt}]\n`
}

const TableAlign = {
  left: 'l',
  center: 'c',
  right: 'r',
}

const table = (tree: EBAST.Table, context: Context) => {
  const [header, ...rows] = tree.children.map(child => compiler(child, context))

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

const compilers = {
  root,
  paragraph,
  heading,
  thematicBreak: ignore,
  blockquote,
  text,
  inlineCode,
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
  html,
  image,
  table,
  tableRow,
  tableCell,
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

export default function mdToTex() {
  // @ts-ignore
  this.Compiler = (tree: EBAST.Root, vfile: any) => {
    return compiler(tree, {
      list: 0,
      id: 0,
      chapter: typeof vfile.data === 'string' ? vfile.data : '',
    })
  }
}
