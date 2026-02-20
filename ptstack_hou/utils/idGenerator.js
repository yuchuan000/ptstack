import { customAlphabet } from 'nanoid'
import dotenv from 'dotenv'

dotenv.config()

const ALPHABETS = {
  letter: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digit: '0123456789',
  symbol: '_-',
  alphanumeric: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  all: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'
}

function generateIdByPattern(pattern) {
  const regex = /\{([a-z]+)\}\{(\d+)\}/g
  let result = pattern
  let match
  
  while ((match = regex.exec(pattern)) !== null) {
    const type = match[1]
    const length = parseInt(match[2])
    const placeholder = match[0]
    const alphabet = ALPHABETS[type] || ALPHABETS.alphanumeric
    const generator = customAlphabet(alphabet, length)
    result = result.replace(placeholder, generator())
  }
  
  return result
}

export function generateUserId() {
  const pattern = process.env.USER_ID_PATTERN || 'user_{digit}{12}'
  return generateIdByPattern(pattern)
}

export function generateArticleId() {
  const pattern = process.env.ARTICLE_ID_PATTERN || 'article_{digit}{12}'
  return generateIdByPattern(pattern)
}

export function generateAnnouncementId() {
  const pattern = process.env.ANNOUNCEMENT_ID_PATTERN || 'announce_{digit}{12}'
  return generateIdByPattern(pattern)
}
