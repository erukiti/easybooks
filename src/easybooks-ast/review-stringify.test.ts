import unified from 'unified'
import reviewStringifyPlugin from './review-stringify'
import { parseMarkdown } from './markdown'

const review = unified().use(reviewStringifyPlugin)
const mdToReview = (src: string) =>
  parseMarkdown(src).then(node => review.stringify(node))

describe('heading', () => {
  test('standard heading', async () => {
    expect(await mdToReview(`# hoge`)).toBe(`= hoge\n`)
    expect(await mdToReview(`## fuga`)).toBe(`== fuga\n`)
  })

  test('with option', async () => {
    expect(await mdToReview(`### [column] コラム`)).toBe(
      `===[column] コラム\n`,
    )
  })
})

describe('paragraph', () => {
  test('inline code', async () => {
    expect(await mdToReview('ほげは`hoge`です')).toBe(
      `\nほげは@<code>{hoge}です\n`,
    )
  })

  test('', async () => {
    expect(await mdToReview('ほげ\n')).toBe('\nほげ\n')
    expect(await mdToReview('ほげ\nほげ\n')).toBe('\nほげ\nほげ\n')
    // expect(mdToReview('ほげ\n\nふが')).toBe('\nほげ\n\nふが\n')
  })

  test('link', async () => {
    expect(await mdToReview('[ほげ](http://example.com)')).toBe(
      '\n@<href>{http://example.com, ほげ}\n',
    )
  })
})

describe('code block', () => {
  test('no lang', async () => {
    expect(await mdToReview('```\nほげ\n```\n')).toBe(
      '//listnum[-000][]{\nほげ\n//}\n',
    )
  })
  test('lang js', async () => {
    expect(await mdToReview('```js\nconst a = 1\n```\n')).toBe(
      '//listnum[-000][][js]{\nconst a = 1\n//}\n',
    )
  })
  test('lang sh', async () => {
    expect(await mdToReview('```sh\n$ hoge\n```\n')).toBe(
      '//cmd{\n$ hoge\n//}\n',
    )
  })

  test('caption', async () => {
    expect(
      await mdToReview('```js {caption="ほげ"}\nconst a = 1\n```\n'),
    ).toBe('//listnum[-000][ほげ][js]{\nconst a = 1\n//}\n')
  })

  test('caption & id', async () => {
    expect(
      await mdToReview('```js {id=hoge caption=ほげ}\nconst a = 1\n```\n'),
    ).toBe('//listnum[hoge][ほげ][js]{\nconst a = 1\n//}\n')
  })
})

describe('list', () => {
  test('', async () => {
    expect(await mdToReview('* hoge\n* fuga')).toBe(' * hoge\n * fuga\n\n')
    expect(await mdToReview('* hoge\n  - fuga')).toBe(
      ' * hoge\n ** fuga\n\n',
    )
  })
})

describe('thematic break', () => {
  test('', () => {
    expect(mdToReview('---\n')).resolves.toBe('')
  })
})

describe('blockquote', () => {
  test('', () => {
    expect(mdToReview('> hoge\n')).resolves.toBe(
      ['//quote{', '', 'hoge', '//}', ''].join('\n'),
    )
  })
})

describe('link reference [list:ID] format', () => {
  test('@<img>{image}', () => {
    expect(mdToReview('hoge[img:image]fuga')).resolves.toBe(
      `\nhoge@<img>{image}fuga\n`,
    )
  })
})

describe('footnote reference', () => {
  test('', () => {
    expect(mdToReview('fuga[^hoge]piyo')).resolves.toBe(
      '\nfuga@<fn>{hoge}piyo\n',
    )
  })
})

describe('footnote definition', () => {
  test('', () => {
    expect(
      mdToReview('[^hoge]: hoge とは「ほげ」である。\n'),
    ).resolves.toBe('//footnote[hoge][hoge とは「ほげ」である。]\n')
  })
})

describe('emphasis', () => {
  test('', () => {
    expect(mdToReview('hoge*fuga*piyo')).resolves.toBe(
      '\nhoge@<em>{fuga}piyo\n',
    )
  })
})

describe('strong', () => {
  test('', () => {
    expect(mdToReview('hoge**fuga**piyo')).resolves.toBe(
      '\nhoge@<strong>{fuga}piyo\n',
    )
  })
})

describe('image', () => {
  test('', () => {
    expect(mdToReview('![fuga](hoge.png)')).resolves.toBe(
      '\n//image[hoge][fuga]\n\n',
    )
  })
  test('no alt', () => {
    expect(mdToReview('![](piyo.png)')).resolves.toBe(
      '\n//image[piyo]\n\n',
    )
  })
})

describe('table', () => {
  test('GFM table', () => {
    expect(
      mdToReview(
        [
          '|title1|title2|title3|',
          '|-----|-----|----|',
          '|hoge|fuga|piyo|',
          '',
        ].join('\n'),
      ),
    ).resolves.toBe(
      [
        '//tsize[|latex||l|l|l|]',
        '//table[-000][]{',
        'title1\ttitle2\ttitle3',
        '--------------------------',
        'hoge\tfuga\tpiyo',
        '//}',
        '',
      ].join('\n'),
    )
  })

  test('GFM table left/center/right align', () => {
    expect(
      mdToReview(
        [
          '|left|center|right|',
          '|:-----|:-----:|---:|',
          '|hoge|fuga|piyo|',
          '',
        ].join('\n'),
      ),
    ).resolves.toBe(
      [
        '//tsize[|latex||l|c|r|]',
        '//table[-000][]{',
        'left\tcenter\tright',
        '--------------------------',
        'hoge\tfuga\tpiyo',
        '//}',
        '',
      ].join('\n'),
    )
  })
})

describe('comment', () => {
  test('single line', () => {
    expect(mdToReview('<!-- ほげ -->')).resolves.toBe('#@# ほげ')
  })
  test('single line', () => {
    expect(mdToReview('<!-- ほげ\nふが -->')).resolves.toBe(
      '#@# ほげ\n#@# ふが',
    )
  })
})

describe('div', () => {
  test('div className => re:view block', () => {
    expect(mdToReview('<div class="flushright">ほげ</div>')).resolves.toBe(
      ['//flushright{', 'ほげ', '//}', ''].join('\n'),
    )
  })
})
