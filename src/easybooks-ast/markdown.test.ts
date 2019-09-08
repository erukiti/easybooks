import { parseMarkdown, markdown } from './markdown'
import { parseMeta } from './md-to-eb'

describe('parseMeta', () => {
  test('null', () => {
    expect(parseMeta('')).toEqual({})
  })

  test('single item', () => {
    expect(parseMeta('id=1')).toEqual({ id: '1' })
    expect(parseMeta('caption=きゃぷしょん')).toEqual({
      caption: 'きゃぷしょん',
    })
  })

  test('single item with quote', () => {
    expect(parseMeta('name="name"')).toEqual({ name: 'name' })
    expect(parseMeta('caption="hoge fuga"')).toEqual({
      caption: 'hoge fuga',
    })
  })

  test('items', () => {
    expect(parseMeta('id=1 name=name caption=きゃぷしょん')).toEqual({
      id: '1',
      name: 'name',
      caption: 'きゃぷしょん',
    })

    expect(parseMeta('name="ほげ ふが" caption=きゃぷしょん')).toEqual({
      name: 'ほげ ふが',
      caption: 'きゃぷしょん',
    })
  })
})

describe('parseMarkdown', () => {
  const parse = (md: string) =>
    parseMarkdown(md).then(node => (node.children as any[])[0])

  test('code', () => {
    expect(
      parse(['```js {id=1 caption=hoge}', 'console.log(1)', '```'].join('\n')),
    ).resolves.toEqual(
      expect.objectContaining({
        type: 'code',
        lang: 'js',
        id: '1',
        caption: 'hoge',
        value: 'console.log(1)',
      }),
    )
  })

  test('code with src', () => {
    expect(
      parse(
        [
          '```js {src=https://raw.githubusercontent.com/erukiti/easybooks/8b5168316d46504161dfb377fb9f4d3faa80b621/src/build-book.ts#L10-L20}',
          '```',
        ].join('\n'),
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        type: 'code',
        lang: 'js',
        src: {
          url:
            'https://raw.githubusercontent.com/erukiti/easybooks/8b5168316d46504161dfb377fb9f4d3faa80b621/src/build-book.ts',
          startLine: 10,
          endLine: 20,
        },
      }),
    )
  })

  test('table caption', () => {
    expect(
      parse(
        [, '|hoge|fuga|', '|----|----|', '|ほげ|ふが|', '|caption=hoge|'].join(
          '\n',
        ),
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        type: 'table',
        caption: 'hoge',
      }),
    )
  })

  test('table caption and id', () => {
    expect(
      parse(
        [
          ,
          '|hoge|fuga|',
          '|----|----|',
          '|ほげ|ふが|',
          '|caption=hoge id=fuga|',
        ].join('\n'),
      ),
    ).resolves.toEqual(
      expect.objectContaining({ type: 'table', caption: 'hoge', id: 'fuga' }),
    )
  })
})
