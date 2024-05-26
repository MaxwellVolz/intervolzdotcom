const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const Handlebars = require('handlebars');

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

// Handlebar components
const navbarTemplate = fs.readFileSync('templates/navbar.hbs', 'utf8');

// Register partials
Handlebars.registerPartial('navbar', navbarTemplate);

Handlebars.registerHelper('formatDate', dateString => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
});

const log = (message, type = 'info') => console.log(`[${type.toUpperCase()}]: ${message}`);

const ensureDirectoryExists = async directory => {
    try {
        await fs.promises.mkdir(directory, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
};

const readMarkdownFiles = async dir => {
    try {
        const files = await fs.promises.readdir(dir);
        log(`Found ${files.length} markdown files in directory: ${dir}`);

        return Promise.all(files.map(async file => {
            const filePath = path.join(dir, file);
            if (!filePath.endsWith('.md')) return null;

            const content = await fs.promises.readFile(filePath, 'utf-8');
            const metadata = extractMetadata(content);
            metadata.url = metadata.url ? `w/${metadata.url}` : metadata.url;

            const htmlContent = md.render(content.replace(/@@[^\n]+/g, ''));
            const tags = metadata.Tags ? metadata.Tags.split(',').map(tag => tag.trim()) : [];

            return { ...metadata, content: htmlContent, Tags: tags };
        })).then(results => results.filter(article => article !== null));
    } catch (err) {
        log(`Error reading markdown files: ${err}`, 'error');
        return [];
    }
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

const renderTemplate = async (templatePath, data) => {
    const source = await fs.promises.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(source);
    return template(data);
};

const generateArticlePages = async articles => {
    for (const article of articles) {
        const outputPath = `./public/w/${article.URL}/index.html`;
        await ensureDirectoryExists(path.dirname(outputPath));
        const htmlContent = await renderTemplate('templates/article.hbs', article);
        await fs.promises.writeFile(outputPath, htmlContent);
    }
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

const generateSite = async articles => {
    if (!articles.length) return log("No articles to process.", 'error');

    const tags = articles.reduce((acc, article) => {
        article.Tags.forEach(tag => {
            acc[tag] = acc[tag] || [];
            acc[tag].push(article);
        });
        return acc;
    }, {});

    await ensureDirectoryExists("public/tags");

    for (const tag of Object.keys(tags)) {
        const tagPageHtml = await renderTemplate('templates/tag.hbs', { tag, articles: tags[tag] });
        await fs.promises.writeFile(`./public/tags/${tag}.html`, tagPageHtml);
    }
    log(`Generated ${Object.keys(tags).length} tag pages.`);

    await generateArticlePages(articles);
    log(`Generated ${articles.length} article pages.`);

    const tagsData = Object.keys(tags).map(tag => ({ tag, count: tags[tag].length }));
    await fs.promises.writeFile('./public/tags/index.html', await renderTemplate('templates/tags.hbs', { Tags: tagsData }));
    log("Tags overview page generated.");

    const sortedArticles = articles.sort((a, b) => new Date(b.Date) - new Date(a.Date));
    await fs.promises.writeFile('./public/index.html', await renderTemplate('templates/homepage.hbs', { articles: sortedArticles.slice(0, 5) }));
    log("Homepage generated with latest 5 articles.");

    const groupedArticles = groupArticlesByYear(articles);
    await fs.promises.writeFile('./public/archive.html', await renderTemplate('templates/archive.hbs', { years: groupedArticles }));
    log("Archive page generated with articles organized by year.");
};

const generateMetadataJson = async articles => {
    const metadata = articles.map(article => {
        const date = new Date(article.Date);
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const fullPath = `intervolz.com/w/${year}/${month}/${article.URL}`;

        return { title: article.Title, url: fullPath, date: article.Date, tags: article.Tags, tldr: article.TLDR };
    });

    await fs.promises.writeFile('./public/articles.json', JSON.stringify(metadata, null, 2));
    log("Metadata JSON generated.");
};

const blogDirectory = './articles';

const main = async () => {
    const articles = await readMarkdownFiles(blogDirectory);

    if (articles.length) {
        await generateSite(articles);
        await generateMetadataJson(articles);
        log("Site generation completed successfully.");
    } else {
        log("No markdown files found to generate the site.", 'error');
    }
    await fs.promises.writeFile(`./public/about.html`, await renderTemplate('templates/about.hbs', []));
};

main();
