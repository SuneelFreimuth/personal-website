import { useState } from 'react'
import { useLoaderData } from 'react-router-dom'

import Editor from 'react-simple-code-editor'
import { LoremIpsum } from 'lorem-ipsum'

import { parseRichText, lineType, LineType, Post, LoaderData, RichText, RichTextKind, tokenizeRichText, collectBlocks } from './BlogPost'

import styles from './EditBlogPost.module.scss'

export function EditBlogPost() {
  const lorem = new LoremIpsum({
    seed: 'catboy ranch'
  });

  // const { post } = useLoaderData() as LoaderData
  const [postBody, setPostBody] = useState(
    `Plain, *italic, **bold-italic***, plain.\n` +
    `Plain, **bold, *bold-italic***, plain.\n` + 
    `This is the Pythagorean Theorem: $a^2 + b^2 = c^2$\n` +
    '\n' +
    `- ${lorem.generateSentences(3)}\n` +
    `- ${lorem.generateSentences(2)}\n` +
    `-${lorem.generateSentences(3)}`)

  const post = {
    id: 'x',
    title: "Ray-Plane Intersection",
    date: new Date(),
    body: postBody
  }

  return (
    <div className={styles.editBlogPost}>
      <Editor
        value={postBody}
        onValueChange={setPostBody}
        highlight={value => {
          return value
            .split('\n')
            .map(line => {
              if (line.length > 0 && lineType(line) === LineType.Paragraph) {
                const richText = parseRichText(line);
                console.log(richText);
                return highlightRichText(richText);
              }
              return line;
            })
            .join('\n');
        }}
        className={styles.blogPostEditor}
        padding={8}
      />
      <Post post={post}/>
    </div>
  )
}

const highlightRichText = (richText: RichText[]) => {
  return richText.map(function recurse({ kind, content: children }) {
    switch (kind) {
      case RichTextKind.Plain:
        return children as string;

      case RichTextKind.Bold:
        return `<span style="color:blue;">${children.map(recurse).join('')}</span>`;

      case RichTextKind.Italic:
        return `<span style="color:green;">${children.map(recurse).join('')}</span>`;

      case RichTextKind.Underline:
        return `<span style="color:red;">${children.map(recurse).join('')}</span>`;

      case RichTextKind.InlineMath:
        return `<span style="color:yellow;">${children}</span>`;
    }
  }).join('');
};