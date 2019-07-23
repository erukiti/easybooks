import unified from 'unified'
import reviewPlugin from './review'
import { parseMarkdown } from './markdown'

const review = unified().use(reviewPlugin)
const mdToReview = (src: string) => review.stringify(parseMarkdown(src))

describe('heading', () => {
  test('standard heading', async () => {
    expect(mdToReview(`# hoge`)).toBe(`= hoge\n`)
    expect(mdToReview(`## fuga`)).toBe(`== fuga\n`)
  })

  test('with option', () => {
    expect(mdToReview(`### [column] コラム`)).toBe(`===[column] コラム\n`)
  })
})

describe('paragraph', () => {
  test('inline code', () => {
    expect(mdToReview('ほげは`hoge`です')).toBe(`\nほげは@<code>{hoge}です\n`)
  })

  test('', () => {
    expect(mdToReview('ほげ\n')).toBe('\nほげ\n')
    expect(mdToReview('ほげ\nほげ\n')).toBe('\nほげ\nほげ\n')
    // expect(mdToReview('ほげ\n\nふが')).toBe('\nほげ\n\nふが\n')
  })

  test('link', () => {
    expect(mdToReview('[ほげ](http://example.com)')).toBe(
      '\n@<href>{http://example.com, ほげ}\n',
    )
  })
})

describe('code block', () => {
  test('no lang', () => {
    expect(mdToReview('```\nほげ\n```\n')).toBe('//listnum[][]{\nほげ\n//}\n')
  })
  test('lang js', () => {
    expect(mdToReview('```js\nconst a = 1\n```\n')).toBe(
      '//listnum[][][js]{\nconst a = 1\n//}\n',
    )
  })
  test('lang sh', () => {
    expect(mdToReview('```sh\n$ hoge\n```\n')).toBe('//cmd{\n$ hoge\n//}\n')
  })

  test('caption', () => {
    expect(mdToReview('```js {caption="ほげ"}\nconst a = 1\n```\n')).toBe(
      '//listnum[][ほげ][js]{\nconst a = 1\n//}\n',
    )
  })

  test('caption', () => {
    expect(mdToReview('```js {id=hoge caption=ほげ}\nconst a = 1\n```\n')).toBe(
      '//listnum[hoge][ほげ][js]{\nconst a = 1\n//}\n',
    )
  })
})

describe('list', () => {
  test('', () => {
    expect(mdToReview('* hoge\n* fuga')).toBe(' * hoge\n * fuga\n\n')
    expect(mdToReview('* hoge\n  - fuga')).toBe(' * hoge\n ** fuga\n\n')
  })
})

describe('thematic break', () => {
  test('', () => {
    expect(mdToReview('---\n')).toBe('')
  })
})

describe('blockquote', () => {
  test('', () => {
    expect(mdToReview('> hoge\n')).toBe('//quote{\n\nhoge\n}\n')
  })
})

describe('link reference [list:ID] format', () => {
  test('@<img>{image}', () => {
    expect(mdToReview('hoge[img:image]fuga')).toBe(`\nhoge@<img>{image}fuga\n`)
  })
})

describe('footnote reference', () => {
  test('', () => {
    expect(mdToReview('fuga[^hoge]piyo')).toBe('\nfuga@<fn>{hoge}piyo\n')
  })
})

describe('footnote definition', () => {
  test('', () => {
    expect(mdToReview('[^hoge]: hoge とは「ほげ」である。\n')).toBe(
      '//footnote[hoge][hoge とは「ほげ」である。]\n',
    )
  })
})

describe('emphasis', () => {
  test('', () => {
    expect(mdToReview('hoge*fuga*piyo')).toBe('\nhoge@<em>{fuga}piyo\n')
  })
})

describe('strong', () => {
  test('', () => {
    expect(mdToReview('hoge**fuga**piyo')).toBe('\nhoge@<strong>{fuga}piyo\n')
  })
})

describe('table', () => {
  test('', () => {
    expect(mdToReview(`|title1|title2|\n|-----|-----|\n|hoge|fuga|\n`)).toBe(
      '//table[][]{\ntitle1\ttitle2\n--------------------------\nhoge\tfuga\n//}\n',
    )
  })
})
