import { preparingConfig } from './build-book'

describe('prepareConfig', () => {
  test('none', () => {
    const conf = {
      aut: ['なまえ'],
    }

    const { catalog, templates, sty_templates } = preparingConfig(conf)
    expect(conf).toEqual({ aut: ['なまえ'] })
    expect(catalog).toEqual({})
    expect(templates).toEqual([])
    expect(sty_templates).toEqual({})
  })

  test('catalog only', () => {
    const conf = {
      aut: ['なまえ'],
      catalog: { CHAPS: ['hoge.md'] },
    }

    const { catalog, templates, sty_templates } = preparingConfig(conf)
    expect(conf).toEqual({ aut: ['なまえ'] })
    expect(catalog).toEqual({ CHAPS: ['hoge.md'] })
    expect(templates).toEqual([])
    expect(sty_templates).toEqual({})
  })

  test('template only', () => {
    const conf = {
      aut: ['なまえ'],
      templates: ['sty', 'images'],
    }

    const { catalog, templates, sty_templates } = preparingConfig(conf)
    expect(conf).toEqual({ aut: ['なまえ'] })
    expect(catalog).toEqual({})
    expect(templates).toEqual(['sty', 'images'])
    expect(sty_templates).toEqual({})
  })

  test('sty_template only', () => {
    const conf = {
      aut: ['なまえ'],
      sty_templates: { url: 'https://hoge/fuga', dir: 'piyo' },
    }

    const { catalog, templates, sty_templates } = preparingConfig(conf)
    expect(conf).toEqual({ aut: ['なまえ'] })
    expect(catalog).toEqual({})
    expect(templates).toEqual([])
    expect(sty_templates).toEqual({ url: 'https://hoge/fuga', dir: 'piyo' })
  })
})
