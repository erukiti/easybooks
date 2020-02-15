import { ReportMessage } from '../../ports/presentation'

const reError = /^WARN: review-pdfmaker: (.*\.re):([0-9]+): error: (.+)$/

export const parseReviewMessage = (s: string) => {
  return s
    .split('\n')
    .map(line => {
      const matched = reError.exec(line)
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
