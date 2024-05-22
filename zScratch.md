
lets create a static site generator tool to create our blog

using modern javascript, markdown, handlebars for templating


heres our template
```js
const fs = require('fs');
const path = require('path');
const anchor = require('markdown-it-anchor')
const MarkdownIt = require('markdown-it');
const Handlebars = require('handlebars');

const md = MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
})

md.use(anchor, {
    permalink: anchor.permalink.headerLink()
})
```

### directory formatting

/w/2024/5/
/w/2024/4/
/w/2024/3/

### article formatting

written in markdown
with custom header for params

/w/2024/1/hello_world.md

```md
@@Title: Hello World
@@URL: hello
@@Tags: py
@@Date: 1/1/24
@@TLDR: new dawn day me
@@Wordcount: 200
```

### Handlebar templates

```html

<!-- article -->
 <main class="content">
        <section>
        <h1 class="title">{{{Title}}}</h1>
        <div class="snip">{{{HumanDate}}} - {{{WordCount}}} words - {{{ReadEstimate}}} mins</div>
        <div class="content">{{{content}}}</div>
        <div class="tags">{{{tags}}}</div>
        </section>
    </main>
    <footer>
        <!-- Your site's footer content -->
        
        {{#each Tags}}
            <a href="/tags/{{this}}/">{{this}}</a>
        {{/each}}
    </footer>

<!-- tags snippet -->
<section>
    <div class="tags-container">
        {{#each tags}}
        <a href="/tags/{{tag}}/" class="tag" data-count="{{count}}">
            {{tag}} <span>({{count}})</span>
        </a>
        {{/each}}
    </div>
</section>

<!-- tag -->
<main class="content">
        <h1>{{tag}}</h1>
        <ul>
            {{#each articles}}
             <li>
                    <span class="date">{{date}}</span>
                    <a href="/{{url}}">{{title}}</a>
            </li>


            {{/each}}
        </ul>
</main>

<!-- homepage snippet -->
<section class="latest-articles">
    {{#each articles}}
    <article>
        <a href="{{url}}">
            <div class="title_box">
                <div class="title">{{title}}</div>
                <div class="date"><time datetime="{{date}}">{{humandate}}</time></div>
            </div>
            <div class="tldr">{{tldr}}</div>
        </a>
    </article>
    {{/each}}
    {{!-- button here for more articles --}}
    <div class="older_posts_container">
        <a href="/archive" class="more-articles-button">Older Posts</a>
    </div>
```

### link formatting

/w/2024/1/hello/

### Pages to generate

1. Tags
   1. extract "tags" from all articles
   2. store as json with counter
2. Each Tag Page
   1. for each tag use the tag.hbs to make a page with a list of articles under that tag
   2. list should have link to article, article titles, and the tldr
3. Homepage
   1. latest 5 articles.
4. Archive
   1. All articles in groups the same as the folder structure

### Other Output

json with article with time, link, title, tag, tldr, for parsing externally