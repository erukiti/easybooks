import fs from 'fs'
import path from 'path'

import { parseTeXMessage } from './parse-message'

describe('parseTeXMessage', () => {
  test('Tex error ', () => {
    const message = fs
      .readFileSync(path.join(__dirname, 'tex-error-1.log'))
      .toString()
    expect(parseTeXMessage(message)).toEqual([
      {
        file: './chap-guidebook.tex',
        line: 99,
        message:
          'Package inputenc Error: Unicode character ^^H (U+8)\n' +
          '(inputenc)                not set up for use with LaTeX.',
      },
    ])
  })
})
