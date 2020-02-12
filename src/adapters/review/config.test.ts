import { preparingConfig } from './config'

describe('prepareConfig', () => {
  test('catalog only', () => {
    const conf = {
      catalog: { CHAPS: ['hoge.md'] },
    }

    const { catalog, templates, sty_templates } = preparingConfig(conf)
    expect(conf).toEqual({})
    expect(catalog).toEqual({ CHAPS: ['hoge.md'] })
    expect(templates).toEqual([])
    expect(sty_templates).toBeUndefined()
  })

  test('catalog & template', () => {
    const conf = {
      catalog: { CHAPS: ['hoge.md'] },
      templates: ['sty', 'images'],
    }

    const { catalog, templates, sty_templates } = preparingConfig(conf)
    expect(conf).toEqual({})
    expect(catalog).toEqual({ CHAPS: ['hoge.md'] })
    expect(templates).toEqual(['sty', 'images'])
    expect(sty_templates).toBeUndefined()
  })

  test('catalog & sty_template', () => {
    const conf = {
      catalog: { CHAPS: ['hoge.md'] },
      sty_templates: { url: 'https://hoge/fuga', dir: 'piyo' },
    }

    const { catalog, templates, sty_templates } = preparingConfig(conf)
    expect(conf).toEqual({})
    expect(catalog).toEqual({ CHAPS: ['hoge.md'] })
    expect(templates).toEqual([])
    expect(sty_templates).toEqual({ url: 'https://hoge/fuga', dir: 'piyo' })
  })

  test('catalog & review settings', () => {
    const conf = {
      catalog: { CHAPS: ['hoge.md'] },
      review_version: '3.0',
    }

    const { catalog, templates, sty_templates } = preparingConfig(conf)
    expect(conf).toEqual({ review_version: '3.0' })
    expect(catalog).toEqual({ CHAPS: ['hoge.md'] })
    expect(templates).toEqual([])
    expect(sty_templates).toBeUndefined()
  })

  test('nested catalog', () => {
    const conf = {
      catalog: { CHAPS: ['0.md', {'sec1': ['1-1.md', '1-2.md']}, {'sec2': ['2-1.md', '2-2.md']}] },
    }

    const { catalog, templates, sty_templates } = preparingConfig(conf)
    expect(conf).toEqual({})
    expect(catalog).toEqual({ CHAPS: ['0.md', {'sec1': ['1-1.md', '1-2.md']}, {'sec2': ['2-1.md', '2-2.md']}] })
    expect(templates).toEqual([])
    expect(sty_templates).toBeUndefined()
  })
})
