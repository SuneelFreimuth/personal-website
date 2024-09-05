import { useState } from 'react'
import { useLoaderData } from 'react-router-dom'

import Editor from 'react-simple-code-editor'
import { LoremIpsum } from 'lorem-ipsum'
import seedrandom from 'seedrandom'

import { parseRichText, lineType, LineType, Post, LoaderData, RichText, RichTextKind, tokenizeRichText, collectBlocks } from './BlogPost'
import catppuccin from '../catppuccin'

import styles from './EditBlogPost.module.scss'

const random = seedrandom('catboy ranch')

export function EditBlogPost() {
  const lorem = new LoremIpsum({ random });

  // const { post } = useLoaderData() as LoaderData
  const [postBody, setPostBody] = useState(
    `Plain, *italic, **bold-italic***, plain.\n` +
    `Plain, **bold, *bold-italic***, plain.\n` + 
    `This is the Pythagorean Theorem: $a^2 + b^2 = c^2$.\n` +
    `\`console.log()\` logs its input to the browser console.\n` +
    '\n' +
    `- ${lorem.generateSentences(3)}\n` +
    `- ${lorem.generateSentences(2)}\n` +
    `-${lorem.generateSentences(3)}`
  );

  const post = {
    id: 'x',
    title: "Ray-Plane Intersection",
    date: new Date(),
    body: postBody
  };

  return (
    <div className={styles.editBlogPost}>
      <Editor
        className={styles.blogPostEditor}
        value={postBody}
        onValueChange={setPostBody}
        highlight={highlightMarkup}
        padding={8}
      />
      <Post post={post}/>
    </div>
  );
}

const { sapphire, yellow, pink, green } = catppuccin;

const highlightMarkup = (markup: string): string => {
  return markup
    .split('\n')
    .map(line => {
      if (line.length > 0) {
        switch (lineType(line)) {
          case LineType.Paragraph:
            return highlightRichText(line);
            
          case LineType.CodeFence:
            return `<span style="color:${pink};">${line}</span>`;

          case LineType.MathFence:
            return `<span style="color:${yellow};">${line}</span>`;

          case LineType.UnorderedListItem:
            return line.replace('-', `<span style="color:${green};">-</span>`);
        }
      }
      return line;
    })
    .join('\n');
}

const highlightRichText = (text: string) => {
  const richText = parseRichText(text);
  return richText.map(function recurse({ kind, openDelim, closeDelim, content }) {
    const open = openDelim ?? '';
    const close = closeDelim ?? '';
    switch (kind) {
      case RichTextKind.Plain:
        return content as string;

      case RichTextKind.Italic:
      case RichTextKind.Bold: {
        const text = content.map(recurse).join('');
        return `<span style="color:${sapphire};">${open}${text}${close}</span>`;
      }

      case RichTextKind.Underline: {
        const text = content.map(recurse).join('');
        return `<span style="color:${pink};">${open}${text}${close}</span>`;
      }

      case RichTextKind.InlineMath:
        return `<span style="color:${yellow};">${open}${content}${close}</span>`;

      case RichTextKind.InlinePreformatted:
        return `<span style="color:${yellow};">${open}${content}${close}</span>`;
    }
  }).join('');
};
