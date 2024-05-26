const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const Handlebars = require('handlebars');

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

Handlebars.registerHelper('formatDate', dateString => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
});

// Handlebar components
const navbarTemplate = fs.readFileSync('templates/navbar.hbs', 'utf8');
Handlebars.registerPartial('navbar', navbarTemplate);

const log = (message, type = 'info') => console.log(`[${type.toUpperCase()}]: ${message}`);

const ensureDirectoryExists = directory => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

const readMarkdownFiles = dir => {
    if (!fs.existsSync(dir)) return log(`Directory does not exist: ${dir}`, 'error') || [];

    const files = fs.readdirSync(dir);
    log(`Found ${files.length} markdown files in directory: ${dir}`);

    return files.map(file => {
        const filePath = path.join(dir, file);
        if (!filePath.endsWith('.md')) return null;

        const content = fs.readFileSync(filePath, 'utf-8');
        const metadata = extractMetadata(content);
        metadata.url = metadata.url ? `w/${metadata.url}` : metadata.url;

        const htmlContent = md.render(content.replace(/@@[^\n]+/g, ''));
        const tags = metadata.Tags ? metadata.Tags.split(',').map(tag => tag.trim()) : [];

        return { ...metadata, content: htmlContent, Tags: tags };
    }).filter(article => article !== null);
};

const extractMetadata = content => {
    const metadata = {};
    content.split('\n').forEach(line => {
        if (line.startsWith('@@')) {
            const [key, value] = line.slice(2).split(':');
            metadata[key.trim()] = value.trim();
        }
    });
    log(`Extracted metadata for article: ${metadata.Title || "Unknown Title"}`);
    return metadata;
};

const renderTemplate = (templatePath, data) => {
    const source = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(source);
    return template(data);
};

const generateArticlePages = articles => {
    articles.forEach(article => {
        const outputPath = `./public/w/${article.URL}/index.html`;
        ensureDirectoryExists(path.dirname(outputPath));
        fs.writeFileSync(outputPath, renderTemplate('templates/article.hbs', article));
    });
};

const groupArticlesByYear = articles => {
    const grouped = articles.reduce((acc, article) => {
        const year = new Date(article.Date).getFullYear();
        acc[year] = acc[year] || [];
        acc[year].push(article);
        return acc;
    }, {});

    return Object.keys(grouped).sort((a, b) => b - a).map(year => ({
        year,
        articles: grouped[year].sort((a, b) => new Date(b.Date) - new Date(a.Date))
    }));
};

const generateSite = articles => {
    if (!articles.length) return log("No articles to process.", 'error');

    const tags = articles.reduce((acc, article) => {
        article.Tags.forEach(tag => {
            acc[tag] = acc[tag] || [];
            acc[tag].push(article);
        });
        return acc;
    }, {});

    ensureDirectoryExists("public/tags");

    Object.keys(tags).forEach(tag => {
        const tagPageHtml = renderTemplate('templates/tag.hbs', { tag, articles: tags[tag] });
        fs.writeFileSync(`./public/tags/${tag}.html`, tagPageHtml);
    });
    log(`Generated ${Object.keys(tags).length} tag pages.`);

    generateArticlePages(articles);
    log(`Generated ${articles.length} article pages.`);

    const tagsData = Object.keys(tags).map(tag => ({ tag, count: tags[tag].length }));
    fs.writeFileSync('./public/tags/index.html', renderTemplate('templates/tags.hbs', { Tags: tagsData }));
    log("Tags overview page generated.");

    const sortedArticles = articles.sort((a, b) => new Date(b.Date) - new Date(a.Date));
    fs.writeFileSync('./src/index.html', renderTemplate('templates/homepage.hbs', { articles: sortedArticles.slice(0, 5) }));
    log("Homepage generated with latest 5 articles.");

    const groupedArticles = groupArticlesByYear(articles);
    fs.writeFileSync('./public/archive.html', renderTemplate('templates/archive.hbs', { years: groupedArticles }));
    log("Archive page generated with articles organized by year.");
};

const generateMetadataJson = articles => {
    const metadata = articles.map(article => {
        const date = new Date(article.Date);
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const fullPath = `intervolz.com/w/${year}/${month}/${article.URL}`;

        return { title: article.Title, url: fullPath, date: article.Date, tags: article.Tags, tldr: article.TLDR };
    });

    fs.writeFileSync('./public/articles.json', JSON.stringify(metadata, null, 2));
    log("Metadata JSON generated.");
};

const blogDirectory = './articles';

const main = () => {
    const articles = readMarkdownFiles(blogDirectory);

    if (articles.length) {
        generateSite(articles);
        generateMetadataJson(articles);
        log("Site generation completed successfully.");
    } else {
        log("No markdown files found to generate the site.", 'error');
    }
    fs.writeFileSync(`./public/about.html`, renderTemplate('templates/about.hbs', []));
};

main();
