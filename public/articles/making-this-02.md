@@Title: Walkthrough - React + Material UI with Express 2
@@URL: making-this-02
@@Date: 5/27/2024
@@TLDR: The journey continues...
@@Tags: web,js,node
@@WordCount: 152
@@ReadEstimate: 12


# React + Material UI with an Express backend 2


## Bonus Stuff

```sh
npm install react-syntax-highlighter react-copy-to-clipboard
```

## Why? It's just a blog

- **React is Awesome:** The flexibility and power of React make it a joy to work with, plus I know it a bit

Our backend script `parseMarkdown.js` takes the articles and outputs a JSON file contains metadata about each article, such as the title, URL, date, and tags.

### Output:

```json
[
    {
        "Title": "Big O No",
        "URL": "big-o-no",
        "Date": "11/14/2023",
        "Tags": "web,js,node",
        "TLDR": "Understanding Big O notation is critical for writing efficient code.",
        "WordCount": 151,
        "ReadEstimate": 12
    },
    // more articles...
]
```