import { ReportMessage } from '../../ports/presentation'

const reReviewError = /^WARN: review-[a-z]+: (.+\.re):([0-9]+): error: (.+)$/
const reTeXError = /\n([^\n:]+\.tex):([0-9]+): (.+)/s

const stripAfterBlankLine = (s: string) => {
  return s.replace(/\n\n.*$/s, '')
}

export const parseTeXMessage = (s: string) => {
  const matched = reTeXError.exec(s)
  if (!matched) {
    return []
  }

  return [
    {
      file: matched[1],
      line: Number.parseInt(matched[2]),
      message: stripAfterBlankLine(matched[3]),
    },
  ]
}

export const parseReviewMessage = (s: string) => {
  return s
    .split('\n')
    .map(line => {
      const matched = reReviewError.exec(line)
      if (!matched) {
        return null
      } else {
        return {
          file: matched[1],
          line: Number.parseInt(matched[2]),
          message: matched[3],
        }
      }
    })
    .filter(v => v !== null) as ReportMessage[]
}
