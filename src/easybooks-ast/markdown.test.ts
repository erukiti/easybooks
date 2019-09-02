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
  test('Code', () => {
    const children = parseMarkdown(
      '```js {id=1 caption=hoge}\nconsole.log(1)\n```\n',
    ).children as any[]
    expect(children[0]).toEqual(
      expect.objectContaining({
        type: 'code',
        lang: 'js',
        id: '1',
        caption: 'hoge',
        value: 'console.log(1)',
      }),
    )
  })
})
