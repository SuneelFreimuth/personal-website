import { useLoaderData } from 'react-router-dom'
import { ReactElement } from 'react'

import Tex from '@matejmazur/react-katex'
import { Tooltip } from 'react-tooltip'
import useConstant from 'use-constant'
import { doc, getDoc } from 'firebase/firestore/lite'

import hljs from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import cpp from 'highlight.js/lib/languages/cpp'
import c from 'highlight.js/lib/languages/c'
import python from 'highlight.js/lib/languages/c'
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c', c)
hljs.registerLanguage('python', python)

import { db } from '../firestore'

import styles from './BlogPost.module.scss'

export function BlogPost() {
  const { post } = useLoaderData() as LoaderData

  const s = 'Things and *other things **and more** things*.'

  return (
    <div className={styles.blogPost}>
      <Post post={post}/>
    </div>
  )
}

export function Post({ post }: { post: Post }) {
  const { title, date, body } = post

  return (
    <main className={styles.post}>
      <h1>{title}</h1>
      <h3>{formatData(date)}</h3>
      <Markup content={body}/>
    </main>
  )
}

export interface LoaderData {
  post: Post
}

export interface Post {
  id: string,
  title: string,
  date: Date,
  body: string
}

export async function loader({ params }): Promise<LoaderData> {
  const { postId } = params;
  const d = await getDoc(doc(db, 'blog-posts', 'test'));
  const { title, date, body } = d.data();
  return {
    post: {
      id: postId,
      title,
      date: date.toDate(),
      body,
    }
  }
}

const EXAMPLE_POST = `
*This is italic*, **this is bold**, and ***this is both***!
_This, on the other hand, is underlined_.
The Pythagorean theorem states that $a^2 + b^2 = c^2$.
$$
x^2 = 1
$$
\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello, world!\\n");
}
\`\`\`
\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello, world!\\n");
}
\`\`\`
`

export function Markup({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks = collectBlocks(lines);
  
  const rendered =
    blocks
      .map((block, i) => {
        const key = `markupLine${i}`
        if (block instanceof ParagraphBlock)
          return (
            <ParagraphBlock.Component
              key={key}
              paragraph={block as ParagraphBlock}
            />
          )

        if (block instanceof MathBlock)
          return (
            <MathBlock.Component
              key={key}
              math={block as MathBlock}
            />
          )

        if (block instanceof CodeBlock) {
          return (
            <CodeBlock.Component
              key={key}
              code={block as CodeBlock}
            />
          )
        }

        if (block instanceof UnorderedListBlock) {
          return (
            <UnorderedListBlock.Component
              key={key}
              list={block as UnorderedListBlock}
            />
          )
        }

        unreachable();
      });

  return <article>{rendered}</article>;
}

abstract class Block {}

class ParagraphBlock extends Block {
  static Component({ paragraph }: { paragraph: ParagraphBlock }) {
    const richText = parseRichText(paragraph.text);
    let i = 0;
    const rendered = richText.map(function render({ kind, content }) {
      i += 1;
      const key = `richText${i}`;
      switch (kind) {
        case RichTextKind.Plain:
          return content as string;
          
        case RichTextKind.Bold:
          return <b key={key}>{content.map(render)}</b>;

        case RichTextKind.Italic:
          return <em key={key}>{content.map(render)}</em>;

        case RichTextKind.Underline:
          return <U key={key}>{content.map(render)}</U>;

        case RichTextKind.InlineMath:
          return (
            <>
              <Tex
                key={key}
                className={styles.inlineMath}
                math={`\\color{white}${content as string}`}
                onClick={() => {
                  navigator.clipboard.writeText(content as string)
                }}
                data-tooltip-id={`tooltip${i}`}
                data-tooltip-content='Copy Markup'
              />
              <StyledTooltip id={`tooltip${i}`}/>
            </>
          );
      }
    })
    return <p>{rendered}</p>;
  }

  readonly text: string

  constructor(text: string) {
    super();
    this.text = text;
  }
}

function U({ children }) {
  return (
    <span style={{
      textDecoration: 'underline',
      textUnderlinePosition: 'under'
    }}>
      {children}
    </span>
  )
}

export enum RichTextKind {
  Plain,
  Bold,
  Italic,
  Underline,
  InlineMath,
}

export interface RichText {
  kind: RichTextKind,
  rawText: string,
  content: string | RichText[],
}

export interface RichText {
  kind: RichTextKind,
  value: RichTextValue
}

export type RichTextValue =
  string


function formatAsSExpr(richText: RichText[]): string {
  const elems = richText.map(function formatElem({ kind, content }) {
    switch (kind) {
      case RichTextKind.Plain:
        return `"${content as string}"`;

      case RichTextKind.Bold:
        return `(bold ${content.map(formatElem).join(' ')})`;

      case RichTextKind.Italic:
        return `(italic ${content.map(formatElem).join(' ')})`;

      case RichTextKind.Underline:
        return `(underline ${content.map(formatElem).join(' ')})`;

      case RichTextKind.InlineMath:
        return `(math ${content.map(formatElem).join(' ')})`;
    }
  });
  return `(${elems.join(' ')})`;
}

export const parseRichText = (text: string): RichText[] => {
  const tokens = tokenizeRichText(text);
  return (function recurse(tokens: string[]): RichText[] {
    const richText = [];
    let i = 0;
    while (i < tokens.length) {
      switch (tokens[i]) {
        case '*':
        case '**':
        case '_': {
          const kind =
            tokens[i] === '*' ?
              RichTextKind.Italic :
            tokens[i] === '**' ?
              RichTextKind.Bold :
            tokens[i] === '_' ?
              RichTextKind.Underline :
              unreachable();
          const closing = 
            findClosingDelim(tokens, tokens[i], i + 1)
            ?? tokens.length;
          richText.push({
            kind,
            rawText: tokens.slice(i, closing + 1).join(''),
            content: recurse(tokens.slice(i + 1, closing))
          });
          i = closing + 1;
          break;
        }

        case '$': {
          const closing = arrIndexOf(tokens, '$', i + 1) ?? tokens.length
          richText.push({
            kind: RichTextKind.InlineMath,
            rawText: tokens.slice(i, closing + 1).join(''),
            content: tokens.slice(i + 1, closing).join('')
          });
          i = closing + 1;
          break;
        }

        default:
          richText.push({
            kind: RichTextKind.Plain,
            rawText: tokens[i],
            content: tokens[i]
          });
          i++;
      }
    }
    return richText;
  })(tokens);
}

function unreachable(message='Reached unreachable statement.'): never {
  throw new Error(message);
}

const DELIMITERS = new Set(['*', '**', '_', '$']);

const findClosingDelim = (tokens: string[], delim: string, startIndex: number = 0): number | null => {
  const openDelimStack = [delim];
  for (let i = startIndex; i < tokens.length; i++) {
    if (!DELIMITERS.has(tokens[i]))
      continue;

    if (tokens[i] === last(openDelimStack))
      openDelimStack.pop();
    else
      openDelimStack.push(tokens[i]);

    if (openDelimStack.length === 0)
      return i;
  }
  return null;
}

function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

export const tokenizeRichText = (text: string): string[] => {
  const tokens: string[] = [];
  let i = 0;
  while (i < text.length) {
    if (text.slice(i, i + 3) === '***') {
      tokens.push('***')
      i += 3;
    } else if (text.slice(i, i + 2) === '**') {
      tokens.push('**');
      i += 2;
    } else if (['*', '$', '_'].includes(text[i])) {
      tokens.push(text[i]);
      i++;
    } else {
      const end = indexOfAny(text, ['*', '**', '$', '_'], i) ?? text.length;
      tokens.push(text.slice(i, end));
      i = end;
    }
  }
  return splitTripleAsterisks(tokens);
}

const splitTripleAsterisks = (tokens: string[]): string[] => {
  const openDelimStack: string[] = []
  const newTokens = [];
  for (const [i, token] of enumerate(tokens)) {
    switch (token) {
      case '*':
      case '**':
        if (token === last(openDelimStack))
          openDelimStack.pop();
        else
          openDelimStack.push(token);
        newTokens.push(token)
        break;

      case '***':
        if (openDelimStack.length >= 2) {
          const [secondToLast, last] = openDelimStack.slice(-2)
          if (secondToLast === '**' && last === '*')
            newTokens.push('*', '**');
          else
            newTokens.push('**', '*');
        } else if (openDelimStack.length === 0) {
          const nextAsteriskDelim = tokens[indexOfAny(tokens, ['*', '**', '***'], i)];
          switch (nextAsteriskDelim) {
            case '*':
              newTokens.push('**', '*');
              break;
            case '**':
            case '***':
              newTokens.push('*', '**');
              break;
          }
        } else {
          throw new Error(`A *** cannot close a ${last(openDelimStack)}`);
        }
        break;

      default:
        newTokens.push(token)
    }
  }
  return newTokens;
}

function* enumerate<T>(it: Iterable<T>): Iterable<[number, T]> {
  let i = 0;
  for (const el of it) {
    yield [i, el];
    i++;
  }
}

// Returning null is better than -1, since you can do
//     const i = indexOf(arr, 'Thing') ?? 3
function arrIndexOf(arr: any[], elem: any, startIndex: number = 0): number | null {
  for (let i = startIndex; i < arr.length; i++)
    if (arr[i] === elem)
      return i;
  return null;
}

function strIndexOf(str: string, seq: string, startIndex: number = 0): number | null {
  for (let i = startIndex; i < str.length; i++) {
    let found = true;
    for (let j = 0; j < seq.length; j++) {
      if (str[i + j] !== seq[j]) {
        found = false;
        break;
      }
    }
    if (found)
      return i;
  }
  return null;
}

const indexOfAny = (collection: string | Array<string>, search: string[], startIndex: number = 0): number | null => {
  for (let i = startIndex; i < collection.length; i++)
    for (const s of search)
      if (Array.isArray(collection) && collection[i] === s)
        return i;
      else if (typeof collection === 'string' && collection.slice(i, i + s.length) === s)
        return i;
  return null;
}

class MathBlock extends Block {
  static Component({ math }: { math: MathBlock }) {
    const content = math.lines.join('\\\\\\\n');
    return <Tex block math={content}/>;
  }

  readonly lines: string[];

  constructor(lines: string[]) {
    super()
    this.lines = lines
  }
}

const CLIPBOARD_ICON = new URL('../assets/clipboard.svg', import.meta.url)

class CodeBlock extends Block {
  readonly language: string;
  readonly lines: string[];

  constructor(language: string, lines: string[]) {
    super()
    this.language = language
    this.lines = lines
  }

  static Component({ code }: { code: CodeBlock }) {
    const tooltipId = useConstant(() => `copy-to-clipboard-tooltip-${Math.floor(Math.random() * 1e4)}`)
    const text = code.lines.join('\n');
    const copyTextToClipboard = async () => {
      await navigator.clipboard.writeText(text)
    };
    return (
      <pre className={styles.codeBlock}>
        <button
          className={styles.copyToClipboard}
          onClick={copyTextToClipboard}
          data-tooltip-id={tooltipId}
          data-tooltip-content='Copy to Clipboard'
        >
          <img src={CLIPBOARD_ICON.toString()}/>
        </button>
        <StyledTooltip id={tooltipId}/>
        <code
          className='hljs'
          style={{
            display: 'block',
            overflowX: 'auto',
            padding: '1.2em',
          }}
          dangerouslySetInnerHTML={{
            __html: hljs.highlight(text, { language: code.language }).value
          }}
        />
      </pre>
    );
  }
}

const StyledTooltip = ({ ...props }) => (
  <Tooltip
    style={{
      fontFamily: 'Inter, sans-serif',
      color: 'white',
      backgroundColor: '#7f849c',
    }}
    {...props}
  />
)

class UnorderedListBlock extends Block {
  readonly items: string[];

  constructor(lines: string[]) {
    super();
    this.items = lines
  }

  static Component({ list }: { list: UnorderedListBlock }) {
    return (
      <ul>
        {list.items.map((item, i) => (
          <li key={`li${i}`}>{item}</li>)
        )}
      </ul>
    )
  }
}

const WHITESPACE = '\u0009\u000A\u000C\u000D\u0020'

function strip(str: string, unwanted: string) {
  let start = 0
  while (start < str.length && unwanted.includes(str[start]))
    start++
  let end = str.length
  while (end > 0 && unwanted.includes(str[end - 1]))
    end--
  return str.slice(start, end)
}

export function collectBlocks(lines: Array<string>): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    if (strip(lines[i], WHITESPACE).length === 0) {
      i++;
      continue;
    }

    switch (lineType(lines[i])) {
      case LineType.Paragraph: {
        blocks.push( new ParagraphBlock(lines[i]) );
        i++;
        break;
      }

      case LineType.CodeFence: {
        const language = lines[i].slice(3);
        const start = i + 1;
        do {
          i++;
        } while (i < lines.length && lineType(lines[i]) === LineType.CodeFence);
        blocks.push( new CodeBlock(language, lines.slice(start, i)) );
        i++;
        break;
      }
      
      case LineType.MathFence: {
        const start = i + 1
        do
          i++;
        while (i < lines.length && lineType(lines[i]) === LineType.MathFence);
        blocks.push( new MathBlock(lines.slice(start, i)) );
        i++;
        break;
      }

      case LineType.UnorderedListItem: {
        const start = i;
        do
          i++;
        while (i < lines.length && lineType(lines[i]) === LineType.UnorderedListItem);
        const listItems = lines.slice(start, i).map(trimLeadingHyphen);
        blocks.push( new UnorderedListBlock(listItems) );
      }
    }
  }
  return blocks;
}

const trimLeadingHyphen = (line: string): string =>
  line.slice(1);

export enum LineType {
  Paragraph,
  MathFence,
  CodeFence,
  UnorderedListItem,
  EmptyLine,
}

export function lineType(line: string): LineType {
  if (line.startsWith('$$'))
    return LineType.MathFence;

  if (line.startsWith('```'))
    return LineType.CodeFence;

  if (line.startsWith('-'))
    return LineType.UnorderedListItem;

  return LineType.Paragraph;
}

const formatData = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    dateStyle: 'long'
  });