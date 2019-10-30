import unified from 'unified'
import reviewParserPlugin, { parseLine } from './review-parser'

const review = unified().use(reviewParserPlugin)
const parse = (lines: string[]) => review.parse(lines.join('\n')).children

describe('heading', () => {
  test('standard heading', () => {
    expect(parse(['= hoge'])).toEqual([
      {
        type: 'heading',
        depth: 1,
        children: [{ type: 'text', value: 'hoge' }],
        options: [],
      },
    ])
  })

  test('column', () => {
    expect(parse(['====[column] hoge'])).toEqual([
      {
        type: 'heading',
        depth: 4,
        children: [{ type: 'text', value: 'hoge' }],
        options: ['column'],
      },
    ])
  })

  test('column,notoc', () => {
    expect(parse(['=[column,notoc] hoge'])).toEqual([
      {
        type: 'heading',
        depth: 1,
        children: [{ type: 'text', value: 'hoge' }],
        options: ['column', 'notoc'],
      },
    ])
  })

  test('with Ref', () => {
    expect(parse(['={ref} hoge'])).toEqual([
      {
        type: 'heading',
        depth: 1,
        children: [{ type: 'text', value: 'hoge' }],
        options: [],
        reference: 'ref',
      },
    ])
  })

  test('column with Ref', () => {
    expect(parse(['=[column]{ref} hoge'])).toEqual([
      {
        type: 'heading',
        depth: 1,
        children: [{ type: 'text', value: 'hoge' }],
        options: ['column'],
        reference: 'ref',
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

describe('parse2', () => {
  // test('#@', () => { })
  test('heading', () => {
    // /\A=+[\[\s\{]/
    expect(parseLine('= hoge')).toEqual({
      type: 'heading',
      depth: 1,
      _caption: 'hoge'
    })
    expect(parseLine('=[hoge] fuga')).toEqual({
      type: 'heading',
      depth: 1,
      _tag: 'hoge',
      _caption: 'fuga'
    })
    expect(parseLine('={hoge} fuga')).toEqual({
      type: 'heading',
      depth: 1,
      _label: 'hoge',
      _caption: 'fuga'
    })
  })

  test('ul', () => {
    // /\A\s+\*/
    expect(parseLine('       * hoge')).toEqual({
      type: 'list',
      _depth: 1,
      _content: 'hoge'
    })
  })

  test('ol', () => {
    // /\A\s+\d+\./
    expect(parseLine(' 1. hoge')).toEqual({
      type: 'list',
      ordered: true,
      _number: 1,
      content: 'hoge'
    })
  })

  test('block end', () => {
    // %r{\A//\}}
    expect(parseLine('//}')).toEqual({type: '_blockend'})
  })

  test('block command', () => {
    // %r{\A//[a-z]+}
    expect(parseLine('//hoge')).toEqual({
      type: '_blockopen',
      command: 'hoge'
    })
  })
})
