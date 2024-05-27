@@Title: Walkthrough - React + Material UI with Express
@@URL: making-this-01
@@Date: 5/27/2024
@@TLDR: Spent a few more hours than I'd like to admit rolling my own over the weekend. miss the features, miss the fun, miss the hooks, it's react time...
@@Tags: web,js,node
@@WordCount: 151
@@ReadEstimate: 12

# React + Material UI with an Express backend

## Why? It's just a blog

- **React is Awesome:** The flexibility and power of React make it a joy to work with, plus I know it a bit
- **Build Process:** I was having lots of issues with webpack (usererror) React's build process is dialed in
- **Dev Setup:** Development environment with React is ready to go
- **MVC Stack:** Easy to manage state and UI
- **DOM Control:** Fine-grained and generated DOM control
- **Pretty:** Look around! Maybe it's me, maybe it's Material UI

## Setup

### Base dependencies

First, let's set up our React application using `create-react-app` and create the necessary directories for our backend:

```sh
npx create-react-app intervolzdotcom
cd intervolzdotcom

mkdir backend
```
### Additional dependencies

Now, let's install the additional dependencies we'll need for our project. This includes both runtime dependencies and development dependencies.

```sh
npm install @mui/material @emotion/react @emotion/styled react-router-dom markdown-to-jsx chart.js react-chartjs-2
npm install --save-dev @mui/icons-material
```

### Backend

For the Express backend, initialize a new Node.js project and install the required packages:

```sh
mkdir backend
cd backend
npm init -y
npm install express cors
```

### Project Structure

Here's the structure of our project. Organizing your files and directories in a clear and logical manner is crucial for maintaining and scaling your application.

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

## Architecture Decisions

### Frontend <--> Backend

One of the primary reasons for choosing this architecture is the separation of concerns. By using React for the frontend and Express for the backend, we can keep the frontend logic separate from the backend logic. This makes the application easier to maintain and scale.

- **Frontend:** Handles the presentation layer, user interactions, and application state.
- **Backend:** Parses article data and serves locally, ready to scale.

### Component-Based Architecture

React promotes a component-based architecture, which aligns well with our goal of creating reusable and maintainable UI components. Each component is responsible for a specific part of the UI, making it easier to manage and develop.

### Material UI for Styling

Material UI provides a rich set of components and theming capabilities that allow us to create a visually appealing and consistent UI. It integrates seamlessly with React, making it an excellent choice for our frontend.

### Express for Flexibility

Using Express as our backend framework gives us the flexibility to serve static files, handle API requests, and manage middleware with ease. It's lightweight and highly customizable, which makes it a great fit for our needs.

For now, we are simple parsing and serving the articles data. Which is kind of lame. But! It is ready to serve anything!

## Backend Setup and Serving Articles

### Setting Up the Express Server
Let's set up a basic Express server that will serve our static files and provide an API endpoint for fetching articles.

```js
// backend/server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Use the CORS middleware
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// API endpoint to get articles
app.get('/api/articles', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/data/articles.json'));
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
```

### Parsing and Serving Articles

The articles are stored in markdown for ease of writing and located in the `public/articles` directory. 

We use custom identifiers `@@` in the **markdown** to specify params for the articles:

### Example of Markdown articles

```markdown
@@Title: Walkthrough - Making this website with React + Material UI with an Express backend
@@URL: making-this-01
@@Date: 5/27/2024
@@TLDR: spent a few more hours than I'd like to admit rolling my own over the weekend. miss the features, miss the fun, miss the hooks, it's react time...
@@Tags: web,js,node
@@WordCount: 151
@@ReadEstimate: 12
```

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

## Fetching Articles in the Frontend

In the frontend, we use a custom hook (useArticles) to fetch the articles from the backend and manage the loading state.

```js
// src/hooks/useArticles.js
import { useState, useEffect } from 'react';

const useArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/articles')
            .then(response => response.json())
            .then(data => {
                const sortedArticles = data.sort((a, b) => new Date(b.Date) - new Date(a.Date));
                setArticles(sortedArticles);
                setLoading(false);
            });
    }, []);

    return { articles, loading };
};

export default useArticles;
```

In the next part of this series, we'll dive into creating and styling the frontend components using Material UI and React. Stay tuned for more!