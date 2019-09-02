import * as EBAST from './ebast'

const reHeading = /^(={1,6})(\[[^]+\])?(\{[^}]+\})?\s+([^\n]+)$/
const reStartBlock = /^\/\/([^[]+)(?:\[([^\]]*)\])?(?:\[([^\]]*)\])?(?:\[([^\]]*)\])?\s*\{\s*$/
const reEndBlock = /^\/\/\s*\}\s*$/

type ParseStateBlock = {
  state: 'block'
  type: string
  meta: string[]
  lines: string[]
}

type ParseStateParagraph = {
  state: 'paragraph'
  lines: string[]
}

type ParseState = ParseStateBlock | ParseStateParagraph

const parseText = (s: string): EBAST.PhrasingContent[] => {
  return [
    {
      type: 'text',
      value: s,
    },
  ]
}

const createBlock = (
  type: string,
  value: string,
  meta: string[],
): EBAST.BlockContent => {
  switch (type) {
    case 'cmd': {
      return {
        type: 'code',
        lang: 'sh',
        value,
      }
    }
    case 'emlist': {
      // console.log(meta)
      return {
        type: 'code',
        lang: meta[2],
        value,
        meta: `id="${meta[0]}" description="${meta[1]}"`,
      }
    }
    default: {
      throw new Error(`unknown type ${type}`)
    }
  }
}

const createContent = (state: ParseState): EBAST.Content => {
  switch (state.state) {
    case 'block':
      return createBlock(state.type, state.lines.join('\n'), state.meta)
    case 'paragraph':
      return { type: 'paragraph', children: parseText(state.lines.join('\n')) }
  }
}

const parse = (s: string): EBAST.Content[] => {
  const initState: ParseState = {
    state: 'paragraph',
    lines: [],
  }

  let state: ParseState = initState
  const contents: EBAST.Content[] = []

  const addContent = () => {
    if (state.state === 'paragraph' && state.lines.join('\n').trim() === '') {
      return
    }

    contents.push(createContent(state))
  }

  // inline のフェンスに対応
  // https://github.com/kmuto/review/blob/master/doc/format.ja.md#%E3%82%A4%E3%83%B3%E3%83%A9%E3%82%A4%E3%83%B3%E5%91%BD%E4%BB%A4%E3%81%AE%E3%83%95%E3%82%A7%E3%83%B3%E3%82%B9%E8%A8%98%E6%B3%95

  s.trim()
    .split('\n')
    .forEach(line => {
      // console.log(`[${line}]`, state.state)
      if (state.state === 'block') {
        if (reEndBlock.test(line)) {
          addContent()
          state = initState
        } else {
          state.lines.push(line)
        }
      } else {
        if (reHeading.test(line)) {
          addContent()
          const matched = reHeading.exec(line)!
          const options = !matched[2]
            ? []
            : matched[2].replace(/^\[(.*)\]$/, '$1').split(',')
          const children: EBAST.PhrasingContent[] = []
          const reference = matched[3]
            ? matched[3].replace(/^\{([^}]+)\}$/, '$1')
            : undefined
          children.push(...parseText(matched[4]))

          contents.push({
            type: 'heading',
            depth: matched[1].length.toString() as any,
            children,
            options,
            reference,
          })
          state = initState
        } else if (reStartBlock.test(line)) {
          addContent()

          const matched = reStartBlock.exec(line)
          // console.log(matched)
          state = {
            state: 'block',
            type: matched![1],
            meta: matched!.slice(2),
            lines: [],
          }
        } else {
          state.lines.push(line)
        }
      }
    })
  addContent()
  return contents
}

export default function parseReview() {
  //@ts-ignore
  this.Parser = (doc: any, vfile: any): EBAST.Root => {
    return {
      type: 'root',
      children: parse(doc),
    }
  }
}
