import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, Type, Eraser, TextQuote } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '@/contexts/PreferencesContext'
import PageSEO from '@/components/PageSEO'

const COMMON_ABBREVIATIONS = [
  'Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Rev.', 'Sr.', 'Jr.',
  'St.', 'Ave.', 'Blvd.', 'Rd.', 'Ln.', 'Ct.', 'Pl.',
  'vs.', 'Vol.', 'vol.', 'Inc.', 'Ltd.', 'Corp.',
  'e.g.', 'i.e.', 'et al.', 'etc.', 'a.m.', 'p.m.', 'A.M.', 'P.M.',
  'U.S.', 'U.K.', 'U.N.', 'E.U.', 'N.A.S.A.', 'N.A.T.O.',
  'No.', 'no.', 'Fig.', 'fig.', 'Ch.', 'ch.',
  'Jan.', 'Feb.', 'Mar.', 'Apr.', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.',
  'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.', 'Sun.',
  'Ave.', 'Blvd.', 'Rd.', 'Ln.', 'Ct.', 'Pl.',
]

function isAbbreviation(text: string, pos: number): boolean {
  // Check if the period at `pos` is part of a known abbreviation
  // Look backwards for a word boundary
  let start = pos - 1
  while (start >= 0 && /[a-zA-Z.]/.test(text[start])) start--
  const word = text.slice(start + 1, pos + 1)
  return COMMON_ABBREVIATIONS.some(abbr => abbr.toLowerCase() === word.toLowerCase())
}

function segmentEnglishText(input: string): string {
  const lines = input.split('\n')
  const paragraphs: string[] = []
  let currentParagraphLines: string[] = []

  // First, group lines into paragraphs (blank lines = paragraph break)
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '') {
      if (currentParagraphLines.length > 0) {
        paragraphs.push(currentParagraphLines.join(' '))
        currentParagraphLines = []
      }
    } else {
      currentParagraphLines.push(trimmed)
    }
  }
  if (currentParagraphLines.length > 0) {
    paragraphs.push(currentParagraphLines.join(' '))
  }

  // If no paragraph breaks were found (single block of text), try to detect paragraph boundaries
  // Paragraph boundary heuristic: end of sentence + capital letter + new topic indicators
  if (paragraphs.length === 1 && paragraphs[0].length > 300) {
    const splitParagraphs = splitIntoParagraphs(paragraphs[0])
    paragraphs.splice(0, 1, ...splitParagraphs)
  }

  // Split each paragraph into sentences
  const resultParagraphs: string[][] = []
  for (const paragraph of paragraphs) {
    const sentences = splitIntoSentences(paragraph)
    resultParagraphs.push(sentences)
  }

  // Join: sentences with single newline, paragraphs with double newline
  return resultParagraphs.map(sentences => sentences.join('\n')).join('\n\n')
}

function splitIntoParagraphs(text: string): string[] {
  // Heuristic: split when we see a sentence end followed by a capital letter
  // and the previous sentence seems like a complete thought
  const result: string[] = []
  let current = ''
  let i = 0

  while (i < text.length) {
    const char = text[i]
    current += char

    if (char === '.' || char === '!' || char === '?') {
      // Check if next non-space is a capital letter (potential new sentence)
      let j = i + 1
      while (j < text.length && text[j] === ' ') j++

      if (j < text.length && /[A-Z]/.test(text[j]) && !isAbbreviation(text, i)) {
        // Potential paragraph break: check if the sentence before this is reasonably long
        const sentenceLength = current.trim().length
        // If sentence is long enough, it's likely a paragraph break
        if (sentenceLength > 100) {
          result.push(current.trim())
          current = ''
          i = j - 1 // -1 because loop will increment
        }
      }
    }
    i++
  }

  if (current.trim()) result.push(current.trim())
  return result.length > 0 ? result : [text]
}

function splitIntoSentences(text: string): string[] {
  const sentences: string[] = []
  let current = ''
  let i = 0

  while (i < text.length) {
    const char = text[i]
    current += char

    if (char === '.' || char === '!' || char === '?') {
      // Check if this is part of an abbreviation
      if (isAbbreviation(text, i)) {
        i++
        continue
      }

      // Check if next non-space is a capital letter or end of string
      let j = i + 1
      while (j < text.length && text[j] === ' ') j++

      // If next is capital, end of string, or quote
      if (j >= text.length || /[A-Z]/.test(text[j]) || text[j] === '"' || text[j] === "'") {
        sentences.push(current.trim())
        current = ''
        i = j - 1 // -1 because loop will increment
      }
    }
    i++
  }

  if (current.trim()) sentences.push(current.trim())
  return sentences.length > 0 ? sentences : [text]
}

export default function TextSegmenter() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSegment = useCallback(() => {
    if (!inputText.trim()) return
    const result = segmentEnglishText(inputText)
    setOutputText(result)
  }, [inputText])

  const handleCopy = useCallback(async () => {
    if (!outputText) return
    try {
      await navigator.clipboard.writeText(outputText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }, [outputText])

  const handleClear = useCallback(() => {
    setInputText('')
    setOutputText('')
  }, [])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
      // Auto-segment on paste
      setTimeout(() => {
        const result = segmentEnglishText(text)
        setOutputText(result)
      }, 0)
    } catch {
      // Clipboard read failed
    }
  }, [])

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-Parchment dark:bg-Graphite">
      <PageSEO
        title="英文分段器"
        description="智能英文文本分段工具，自动将连续文本按句子换行、段落空行分隔。"
      />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate('/tools')}
            className="flex items-center gap-1.5 text-sm text-Slate hover:text-Amber transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            {t('tools.title')}
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-Amber/10 dark:bg-white/10 flex items-center justify-center text-Amber/60 dark:text-white/40">
              <TextQuote size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-Ink dark:text-white">
                英文分段器
              </h1>
              <p className="text-sm text-Slate dark:text-white/40">
                输入连续英文文本，自动按句子换行、段落空行分隔，方便在 Obsidian 中阅读
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Input panel */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-Ink/70 dark:text-white/60">输入文本</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePaste}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-Slate hover:text-Amber border border-Sand dark:border-white/10 rounded-md hover:border-Amber/30 transition-colors"
                  title="从剪贴板粘贴"
                >
                  <Type size={12} />
                  粘贴
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-Slate hover:text-Rose border border-Sand dark:border-white/10 rounded-md hover:border-Rose/30 transition-colors"
                  title="清空"
                >
                  <Eraser size={12} />
                  清空
                </button>
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="将没有换行的英文文本粘贴到这里..."
              className="flex-1 min-h-[300px] lg:min-h-[500px] p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-Sand dark:border-white/10 text-[0.9375rem] text-Ink dark:text-white leading-relaxed font-body focus:outline-none focus:border-Amber/50 resize-y placeholder:text-Slate/40"
              spellCheck={false}
            />
            <div className="mt-2 text-xs text-Slate/50 text-right">
              {inputText.length} 字符
            </div>
          </div>

          {/* Output panel */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-Ink/70 dark:text-white/60">分段结果</span>
              <button
                onClick={handleCopy}
                disabled={!outputText}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs border rounded-md transition-colors ${
                  outputText
                    ? 'text-Slate hover:text-Amber border-Sand dark:border-white/10 hover:border-Amber/30'
                    : 'text-Slate/30 border-transparent cursor-not-allowed'
                }`}
              >
                {copied ? <Check size={12} className="text-Sage" /> : <Copy size={12} />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
            <textarea
              value={outputText}
              readOnly
              placeholder="分段后的文本会显示在这里..."
              className="flex-1 min-h-[300px] lg:min-h-[500px] p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-Sand dark:border-white/10 text-[0.9375rem] text-Ink dark:text-white leading-relaxed font-body focus:outline-none resize-y placeholder:text-Slate/40"
              spellCheck={false}
            />
            <div className="mt-2 text-xs text-Slate/50 text-right">
              {outputText.length} 字符
            </div>
          </div>
        </motion.div>

        {/* Action button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 flex justify-center"
        >
          <button
            onClick={handleSegment}
            disabled={!inputText.trim()}
            className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              inputText.trim()
                ? 'bg-Amber text-white shadow-lg shadow-Amber/25 hover:bg-Amber/90 hover:shadow-Amber/30 hover:scale-[1.02]'
                : 'bg-Sand/50 text-Slate/40 cursor-not-allowed'
            }`}
          >
            一键分段
          </button>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 p-6 rounded-xl bg-white/40 dark:bg-white/[0.03] border border-Sand dark:border-white/10"
        >
          <h3 className="text-sm font-medium text-Ink dark:text-white/80 mb-3">分段规则</h3>
          <ul className="space-y-2 text-sm text-Slate dark:text-white/50">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-Amber/60 mt-1.5 shrink-0" />
              <span>段落之间保留空行（双击换行），保持原有段落结构</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-Amber/60 mt-1.5 shrink-0" />
              <span>每个句子单独一行，句末标点（. ! ?）后换行</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-Amber/60 mt-1.5 shrink-0" />
              <span>自动识别常见缩写（Mr. / Dr. / e.g. / U.S. 等），避免误分段</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-Amber/60 mt-1.5 shrink-0" />
              <span>粘贴文本后自动分段，也可手动点击「一键分段」按钮</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
