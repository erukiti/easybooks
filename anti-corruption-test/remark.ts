import unified from 'unified'

const parseMarkdown = require('remark-parse')
import math from 'remark-math'
import hljs from 'remark-highlight.js'
import breaks from 'remark-breaks'
import katex from 'remark-html-katex'
import frontmatter from 'remark-frontmatter'
import stringify from 'remark-stringify'

export const markdown = unified()
  .data('settings', { footnotes: true, gfm: true })
  .use(parseMarkdown)
  .use(breaks)
  .use(math)
  .use(katex)
  .use(hljs)
  .use(frontmatter, ['yaml'])
  .use(stringify)

const parse = (s: string) => {
  const parsed = markdown.parse(s).children as object[]

  const stripPosition = (o: object) => {
    if (!o) {
      return
    }
    if (Array.isArray(o)) {
      o.forEach((v: object) => stripPosition(v))
      return
    }

    Object.keys(o).forEach(key => {
      if (key === 'position') {
        delete o[key]
        return
      }
      const v = o[key]
      if (v && typeof v === 'object') {
        stripPosition(v)
      }
    })
  }
  stripPosition(parsed)
  return parsed
}

describe('ul', () => {
  test('list', async () => {
    expect(parse('* hoge\n* fuga\n')).toEqual([
      {
        type: 'list',
        ordered: false,
        start: null,
        spread: false,
        children: [
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: 'hoge',
                  },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: 'fuga',
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
  })

  test('nested list', async () => {
    expect(parse('* hoge\n  * fuga\n')).toEqual([
      {
        type: 'list',
        ordered: false,
        start: null,
        spread: false,
        children: [
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: 'hoge',
                  },
                ],
              },
              {
                type: 'list',
                ordered: false,
                start: null,
                spread: false,
                children: [
                  {
                    type: 'listItem',
                    spread: false,
                    checked: null,
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            value: 'fuga',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
  })
})
