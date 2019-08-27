import unified from 'unified'
import reviewParserPlugin from './review-parser'

const review = unified().use(reviewParserPlugin)
const parse = (lines: string[]) => review.parse(lines.join('\n')).children

describe('heading', () => {
  test('standard heading', () => {
    expect(parse(['= hoge'])).toEqual([
      {
        type: 'heading',
        depth: '1',
        children: [{ type: 'text', value: 'hoge' }],
      },
    ])
  })
})

describe('list', () => {
  test('cmd', () => {
    expect(parse(['//cmd{', '$ hoge', '//}'])).toEqual([
      {
        type: 'code',
        lang: 'sh',
        value: '$ hoge',
      },
    ])
  })

  test('emlist', () => {
    expect(
      parse(['//emlist[id][コメント][js]{', 'console.log(1);', '//}']),
    ).toEqual([
      {
        type: 'code',
        lang: 'js',
        value: 'console.log(1);',
        meta: 'id="id" description="コメント"',
      },
    ])
  })
})
