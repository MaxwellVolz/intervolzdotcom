const fs = require('fs');
const path = require('path');
const anchor = require('markdown-it-anchor')
const MarkdownIt = require('markdown-it');
const Handlebars = require('handlebars');
const hljs = require('highlight.js');


const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
}).use(anchor, { permalink: anchor.permalink.headerLink() });


Handlebars.registerHelper('formatDate', function (dateString) {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
});

Handlebars.registerHelper('formatMonth', date => {
    const month = new Date(date).getMonth() + 1;
    return month < 10 ? `0${month}` : month;
});

Handlebars.registerHelper('split', function (input, delimiter) {
    return input.split(delimiter);
});

// Utility functions
const log = (message, type = 'info') => console.log(`[${type.toUpperCase()}]: ${message}`);
const ensureDirectoryExists = directory => fs.existsSync(directory) || fs.mkdirSync(directory, { recursive: true });

// Handlebar components
const navbarTemplate = fs.readFileSync('templates/navbar.hbs', 'utf8');

// Register partials
Handlebars.registerPartial('navbar', navbarTemplate);

function readMarkdownFiles(dir) {
    // Ensure the directory exists to avoid runtime errors
    if (!fs.existsSync(dir)) {
        log(`Directory does not exist: ${dir}`, 'error');
        return [];
    }

    const files = fs.readdirSync(dir);
    log(`Found ${files.length} markdown files in directory: ${dir}`);

    const articles = files.map(file => {
        const filePath = path.join(dir, file);
        if (!filePath.endsWith('.md')) return null; // Skip non-markdown files

        const content = fs.readFileSync(filePath, 'utf-8');
        const metadata = extractMetadata(content);
        metadata.url = metadata.url ? `w/${metadata.url}` : metadata.url;

        const htmlContent = md.render(content.replace(/@@[^\n]+/g, ''));
        const tags = metadata.Tags ? metadata.Tags.split(',').map(tag => tag.trim()) : [];


        return { ...metadata, content: htmlContent, Tags: tags };
    }).filter(article => article !== null); // Filter out null values from non-markdown files

    return articles;
}

function copyCssFiles() {
    const srcPath = './styles';
    const destPath = './public/css';
    ensureDirectoryExists(destPath);
    const files = fs.readdirSync(srcPath);
    files.forEach(file => {
        if (file.endsWith('.css')) {
            fs.copyFileSync(path.join(srcPath, file), path.join(destPath, file));
        }
    });
    log('CSS files copied successfully.');
}

function copyImages() {
    const srcPath = './images';
    const destPath = './public/images';
    ensureDirectoryExists(destPath);
    const files = fs.readdirSync(srcPath);
    files.forEach(file => {
        if (file.endsWith('.png')) {
            fs.copyFileSync(path.join(srcPath, file), path.join(destPath, file));
        }
    });
    log('Images copied successfully.');
}


function extractMetadata(content) {
    const metadata = {};
    const lines = content.split('\n');
    for (let line of lines) {
        if (line.startsWith('@@')) {
            const [key, value] = line.slice(2).split(':');
            metadata[key.trim()] = value.trim();
        }
    }
    log(`Extracted metadata for article: ${metadata.Title || "Unknown Title"}`); // Log the title for reference
    return metadata;
}


function renderTemplate(templatePath, data) {
    const source = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(source);
    return template(data);
}

function generateArticlePages(articles) {
    articles.forEach(article => {
        const outputPath = `./public/w/${article.URL}/index.html`;
        ensureDirectoryExists(path.dirname(outputPath));
        fs.writeFileSync(outputPath, renderTemplate('templates/article.hbs', article));
    });
}

function groupArticlesByYear(articles) {
    const grouped = {};
    articles.forEach(article => {
        const year = new Date(article.Date).getFullYear();
        if (!grouped[year]) {
            grouped[year] = [];
        }
        grouped[year].push(article);
    });

    // Sort articles in each year group in reverse chronological order
    for (const year in grouped) {
        grouped[year].sort((a, b) => new Date(b.Date) - new Date(a.Date));
    }

    // Convert the grouped object into an array and sort by year in descending order
    const sortedYears = Object.keys(grouped).sort((a, b) => b - a).map(year => ({
        year: year,
        articles: grouped[year]
    }));

    return sortedYears;
}

function generateSite(articles) {
    if (!articles.length) {
        log("No articles to process.", 'error');
        return;
    }

    const tags = {};
    articles.forEach(article => {
        article.Tags.forEach(tag => {
            tag = tag.trim();
            if (!tags[tag]) tags[tag] = [];
            tags[tag].push(article);
        });
    });

    ensureDirectoryExists("public/tags");
    Object.keys(tags).forEach(tag => {
        const tagPageHtml = renderTemplate('templates/tag.hbs', { tag, articles: tags[tag] });
        fs.writeFileSync(`./public/tags/${tag}.html`, tagPageHtml);
    });
    log(`Generated ${Object.keys(tags).length} tag pages.`);


    generateArticlePages(articles);
    log(`Generated ${articles.length} article pages.`);

    // Generate Tags Page
    const tagsData = Object.keys(tags).map(tag => ({
        tag: tag,
        count: tags[tag].length
    }));

    const tagsHtml = renderTemplate('templates/tags.hbs', { Tags: tagsData });
    fs.writeFileSync('./public/tags/index.html', tagsHtml);
    log("Tags overview page generated.");


    // Generate homepage with latest 5 articles
    const sortedArticles = articles.sort((a, b) => new Date(b.Date) - new Date(a.Date));
    const homepageHtml = renderTemplate('templates/homepage.hbs', { articles: sortedArticles.slice(0, 5) });
    log(sortedArticles[0]["URL"])
    fs.writeFileSync('./public/index.html', homepageHtml);
    log("Homepage generated with latest 5 articles.");

    // Generate archive page
    const groupedArticles = groupArticlesByYear(articles);
    const archiveHtml = renderTemplate('templates/archive.hbs', { years: groupedArticles });
    fs.writeFileSync('./public/archive.html', archiveHtml);
    log("Archive page generated with articles organized by year.");

}

function generateMetadataJson(articles) {
    const metadata = articles.map(article => {
        const date = new Date(article.Date); // Parse the date to get year and month
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2); // Ensure two-digit month
        const fullPath = `intervolz.com/w/${year}/${month}/${article.URL}`; // Construct the full URL path

        return {
            title: article.Title,
            url: fullPath, // Use the full URL path instead of just the article.URL
            date: article.Date,
            tags: article.Tags,
            tldr: article.TLDR
        };
    });

    fs.writeFileSync('./public/articles.json', JSON.stringify(metadata, null, 2)); // Pretty print the JSON
    log("Metadata JSON generated."); // Log the success message
}

const blogDirectory = './articles';  // Assuming your blog articles are organized under 'w'

function main() {
    const articles = readMarkdownFiles(blogDirectory);

    if (articles.length) {
        generateSite(articles);
        generateMetadataJson(articles);
        copyCssFiles();
        copyImages();
        log("Site generation completed successfully.");
    } else {
        log("No markdown files found to generate the site.", 'error');
    }
}

main();  // Execute the script

