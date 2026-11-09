export const ARTICLE_HTML_SAMPLE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Building a reliable application</title>
  <meta name="article-category" content="Engineering">
  <meta name="article-date" content="2026-11-09">
  <meta name="article-slug" content="building-a-reliable-application">
  <meta name="description" content="Practical lessons for building reliable applications.">
</head>
<body>
  <article>
    <h1>Building a reliable application</h1>
    <img data-cover src="/images/placeholders/journal-1.jpg" alt="Article cover">
    <section>
      <h2>Start with a clear goal</h2>
      <p>Write the opening paragraph here.</p>
      <p>Explain the idea with a practical example.</p>
      <img src="/images/placeholders/detail-1.jpg" alt="A supporting illustration">
    </section>
    <section>
      <h2>Show the result</h2>
      <p>Explain what the reader should notice in the video.</p>
      <!-- Optional: uncomment after replacing src with a real HTTPS video URL.
      <video src="https://example.com/demo.mp4" poster="/images/placeholders/detail-2.jpg" aria-label="Application demonstration" controls></video>
      -->
    </section>
  </article>
</body>
</html>
`;

export const ARTICLE_AI_PROMPT = `Write a journal article about [YOUR TOPIC] as one UTF-8 HTML file. Return only HTML, without Markdown fences.

Follow this import format exactly:
- One <article> and exactly one <h1> (article title, maximum 200 characters).
- In <head>, use <meta name="article-category" content="..."> (max 120 characters), <meta name="article-date" content="YYYY-MM-DD">, optional <meta name="article-slug" content="lowercase-hyphenated-slug"> (max 80 characters), and <meta name="description" content="..."> (max 300 characters).
- Mark one cover <img> or <video> with data-cover. Put it before the sections. Use meaningful alt text on images and aria-label on videos (max 300 characters).
- Use up to 40 <section> elements. Each section contains one <h2> (max 120 characters), then <p> paragraphs, then up to two <img> images, then up to two <video> videos, in that order. Start a new section if text follows media.
- Each section may have up to 50 paragraphs, each at most 5000 characters. Use plain text. HTML entities are allowed. Inline formatting and links become plain text; they do not retain formatting or clickable links.
- Media src and video poster must use real https:// URLs or existing site paths starting with a single /. Local files, relative paths, data URLs and iframe/YouTube embeds are unsupported. Use direct video URLs such as MP4. A video may use <source src="..."> instead of a src attribute.
- Do not invent media URLs. Ask me for real URLs, or omit optional media and leave the cover to be added in the editor. Upload local media using the admin Media library first and use its URL.
- Do not include CSS, fonts, style/class attributes, scripts, event handlers, tables, forms, navigation or external page layouts. The journal supplies all fonts, spacing, numbered sections and image layouts.
- Put captions in a <p> before media. Use normal closing tags. The import always starts as an editable draft.

Example structure (replace the content and media URLs):

${ARTICLE_HTML_SAMPLE}`;
