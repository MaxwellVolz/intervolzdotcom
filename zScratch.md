


ok...lets setup our basic application structure.

we are going to have a the following pages

1. homepage
   1. fullscreen "loading screen" on page load that looks like a console booting up
   2. basic hero display centered
   3. latest articles component
      1. displays 5 latest articles
2. archive
   1. displays all the articles
3. tags
   1. displays articles by tag

articles
collection of readme files with the following headers



we need to use markdown-to-jsx to parse the articles in App.js to construct the other pages
is this a good viable setup?

Project Installed
react materialui markdown-to-jsx

Project Structure:
```sh
src/
├── components/
│   ├── Article.js
│   ├── ArticleList.js
│   ├── Hero.js
│   ├── LoadingScreen.js
├── pages/
│   ├── Home.js
│   ├── Archive.js
│   ├── Tags.js
├── articles/
│   ├── big-o-no.md
├── App.js
├── index.css
└── index.js
backend/
├── public/
│   ├── data/
│   │   ├── articles.json
│   ├── parseMarkdown.css
└── server.js

```

```md
@@Title: Big O No
@@URL: big-o-no
@@Date: 11/14/2023
@@TLDR: optimized optimizing is optimal...
@@Tags: programming
@@WordCount: 151
@@ReadEstimate: 12
```

we will render the article content like this:
```js
import Markdown from 'markdown-to-jsx'
import React from 'react'
import { render } from 'react-dom'

render(<Markdown># Hello world!</Markdown>, document.body)

/*
    renders:

    <h1>Hello world!</h1>
 */
```

but we need a way to parse the article markdown into a json to use for the pages of the site. 

lets make this a backend task.

our currnet /backend is containing our express code we will implement later but lets keep that in mind


lets make a new component for our Home Page.

it should render to half the container width

it should be a line plot with articles 
x-axis is month
y-axis is num of articles

```json
  {
    "Title": "Big O No",
    "URL": "big-o-no",
    "Date": "11/14/2023",
```


- site needs uuid



mobiles

articles month and tag should be stackeed


tags horizontal bars with links back in

