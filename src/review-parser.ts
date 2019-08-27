import MDAST from 'mdast'

const reHeading = /^(={1,6})\s+([^\n]+)$/
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

const parseText = (s: string): MDAST.PhrasingContent[] => {
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
): MDAST.BlockContent => {
  switch (type) {
    case 'cmd': {
      return {
        type: 'code',
        lang: 'sh',
        value,
      }
    }
    case 'emlist': {
      console.log(meta)
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

const createContent = (state: ParseState): MDAST.Content => {
  switch (state.state) {
    case 'block':
      return createBlock(state.type, state.lines.join('\n'), state.meta)
    case 'paragraph':
      return { type: 'paragraph', children: parseText(state.lines.join('\n')) }
  }
}

const parse = (s: string): MDAST.Content[] => {
  const initState: ParseState = { state: 'paragraph', lines: [] }

  let state: ParseState = initState
  const contents: MDAST.Content[] = []

  const addContent = () => {
    if (state.state === 'paragraph' && state.lines.join('\n').trim() === '') {
      return
    }

    contents.push(createContent(state))
  }

  s.trim()
    .split('\n')
    .forEach(line => {
      console.log(`[${line}]`, state.state)
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
          const matched = reHeading.exec(line)
          contents.push({
            type: 'heading',
            depth: matched![1].length.toString() as any,
            children: parseText(matched![2]),
          })
          state = initState
        } else if (reStartBlock.test(line)) {
          addContent()

          const matched = reStartBlock.exec(line)
          console.log(matched)
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
  this.Parser = (doc: any, vfile: any): MDAST.Root => {
    return {
      type: 'root',
      children: parse(doc),
    }
  }
}
