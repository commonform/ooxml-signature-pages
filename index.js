import capitalize from 'capitalize'
import escape from 'xml-escape'
import indefinite from 'indefinite-article'
import repeat from 'string-repeat'

// OOXML Paragraph
function p (content) {
  return '<w:p>' + content + '</w:p>'
}

// OOXML Paragraph Properties
function pPr (content) {
  return '<w:pPr>' + content + '</w:pPr>'
}

// OOXML Run
function run (content) {
  return '<w:r>' + content + '</w:r>'
}

// OOXML Text
function t (text) {
  return '<w:t xml:space="preserve">' + escape(text) + '</w:t>'
}

// A paragraph containing just a page break
const PAGE_BREAK = p(run('<w:br w:type="page"/>'))

const LINE_BREAK = '<w:br/>'

// [Signature pages follow.], centered
const PAGES_FOLLOW = p(
  pPr('<w:jc w:val="center" />') +
  run(t('[Signature pages follow.]'))
)

// [Signature page follows.], centered
const PAGE_FOLLOWS = p(
  pPr('<w:jc w:val="center" />') +
  run(t('[Signature page follows.]'))
)

// [Document ends here.], centered
const DOCUMENT_ENDS_HERE = p(
  pPr('<w:jc w:val="center" />') +
  run(t('[Document ends here.]'))
)

// [Signature follows.], centered
const SIGNATURE_FOLLOWS = p(
  pPr('<w:jc w:val="center" />') +
  run(t('[Signature follows.]'))
)

// [Signature follows.], centered
const SIGNATURES_FOLLOW = p(
  pPr('<w:jc w:val="center" />') +
  run(t('[Signatures follow.]'))
)

const HEADER_INDENT = '0'

// Generate a header paragraph. The part that usually says "The parties
// are entering into...".
function header (text) {
  return p(
    pPr(
      '<w:ind w:firstLine="' + HEADER_INDENT + '" />' +
      '<w:keepNext/>' +
      '<w:jc w:val="both" />'
    ) +
    run(t(text))
  )
}

const BLOCK_INDENT = '4320'

// Generate an indented paragraph.
function indentedParagraph (text) {
  return p(
    pPr('<w:ind w:left="' + BLOCK_INDENT + '" />') +
    pPr('<w:jc w:val="left" />') +
    pPr('<w:keepNext/>') +
    run(
      text
        .split('\n')
        .map(t)
        .join(LINE_BREAK)
    )
  )
}

// Generate indented paragraphs for each of the entities in a block.
function entityParagraphs (entities) {
  return entities.reduce(function (returned, element, index, list) {
    const first = index === 0
    return returned.concat(indentedParagraph(
      (first ? '' : 'By:') +
      (element.name ? (element.name + ',') : '') + '\n' +
      indefinite(element.jurisdiction || 'Delaware') + ' ' +
      (element.jurisdiction || '') + ' ' +
      (element.form || '') +
      (first ? '' : ('\nits ' + (list[index - 1].by || ''))))
    )
  }, [])
}

const BOLD = '<w:rPr><w:b /></w:rPr>'

// Generate an indented paragraph with the defined term for the signing
// party in bold type.
function termParagraph (term) {
  return p(
    pPr('<w:ind w:left="' + BLOCK_INDENT + '" />') +
      pPr('<w:keepNext/>') +
    run(BOLD + t(term)) +
    run(t(':'))
  )
}

// Generate a signature page.
function page (argument) {
  const hasEntities = (
    'entities' in argument &&
    Array.isArray(argument.entities) &&
    argument.entities.length !== 0
  )
  const lastTitle = hasEntities
    ? argument.entities[argument.entities.length - 1].by
    : null
  return (
    ('header' in argument ? header(argument.header) : '') +
    ('term' in argument ? termParagraph(argument.term) : '') +
    (hasEntities ? entityParagraphs(argument.entities) : '') +
    indentedParagraph(
      '\n\n' +
      (argument.prompt ? argument.prompt : 'By:') +
      (argument.conformed ? ('\t' + argument.conformed) : '') +
      ('meta' in argument ? '' : '\n')
    ) +
    (
      'meta' in argument
        ? indentedParagraph(argument.meta + '\n')
        : ''
    ) +
    indentedParagraph(
      'Name:' +
      (argument.name ? ('\t' + argument.name) : '') +
      '\n'
    ) + (
      hasEntities
        ? indentedParagraph(
          'Title:' + (lastTitle ? ('\t' + lastTitle) : '') + '\n'
        )
        : ''
    ) +
    (argument.information ? information(argument.information) : '')
  )
}

function information (data) {
  return (
    Array.isArray(data)
      ? data.map(function (element) {
        return informationParagraph(element, false)
      })
      : Object.keys(data).map(function (key) {
        return informationParagraph(key, data[key])
      })
  ).join('')
}

// How to display information fields
const fields = {
  address: ['Address', 4],
  date: ['Date', 0],
  email: ['Email', 0]
}

function informationParagraph (key, value) {
  const match = fields[key.toLowerCase()]
  if (match) {
    return indentedParagraph(
      match[0] + ':' + (
        (match[1] === 0 ? '\t' : '\n') +
        (value || repeat('\n', match[1])) +
        '\n'
      )
    )
  } else {
    return indentedParagraph(
      capitalize.words(key, true) + ':' + (
        value
          ? ('\t' + escape(value) + '\n')
          : repeat('\n', 2)
      )
    )
  }
}

export default function ooxmlSignaturePages (signatures) {
  if (!Array.isArray(signatures)) {
    throw new Error('Argument must be an Array of signatures.')
  }
  const signatureCount = signatures.length
  const pageCount = signatures.reduce(function (count, pageData) {
    return count + (pageData.samePage ? 0 : 1)
  }, 0)
  const firstSignature = signatures[0]
  return (
    (
      signatureCount === 0
        ? DOCUMENT_ENDS_HERE
        : firstSignature.samePage
          ? firstSignature.header
            ? ''
            : signatureCount === 1
              ? SIGNATURE_FOLLOWS
              : SIGNATURES_FOLLOW
          : pageCount === 1
            ? PAGE_FOLLOWS
            : PAGES_FOLLOW
    ) +
    signatures.map(function (pageData) {
      return (
        (pageData.samePage ? '' : PAGE_BREAK) +
        page(pageData)
      )
    })
  )
}
