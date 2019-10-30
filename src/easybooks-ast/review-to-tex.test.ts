import unified from 'unified'
import reviewParser from './review-parser'
import texStringify from './tex-stringify'

const r2t = unified().use(reviewParser).use(texStringify)

describe('heading', () => {
  test('section', () => {
    const node = r2t.parse('= hoge')
    expect(r2t.stringify(node)).toEqual('\\chapter{hoge}\n')
  })
})

// describe('href', () => {
//   test('without label', () => {
//     const node = r2t.parse('@<href>{http://github.com}')
//     console.log(node)
//     expect(r2t.stringify(node)).toEqual('\\url{http://github.com}')
//   })

// })