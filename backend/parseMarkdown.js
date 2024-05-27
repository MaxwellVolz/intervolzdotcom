const fs = require('fs-extra');
const path = require('path');

const articlesDir = path.join(__dirname, '../public/articles');
const outputDir = path.join(__dirname, '../public/data');

const requiredFields = ['Title', 'URL', 'Date', 'TLDR', 'Tags', 'WordCount', 'ReadEstimate'];

function parseMetadata(content) {
    const metadata = {};
    const regex = /^@@(\w+):\s*(.+)$/gm;
    let match;

    while ((match = regex.exec(content)) !== null) {
        metadata[match[1]] = match[2];
    }

    // Convert WordCount and ReadEstimate to numbers
    if (metadata.WordCount) metadata.WordCount = parseInt(metadata.WordCount, 10);
    if (metadata.ReadEstimate) metadata.ReadEstimate = parseInt(metadata.ReadEstimate, 10);

    return metadata;
}

function validateArticle(data) {
    const errors = [];

    for (const field of requiredFields) {
        if (!data[field]) {
            errors.push(`Missing field: ${field}`);
        } else if (field === 'WordCount' || field === 'ReadEstimate') {
            if (typeof data[field] !== 'number' || isNaN(data[field])) {
                errors.push(`Incorrect type for field: ${field}. Expected number.`);
            }
        } else {
            if (typeof data[field] !== 'string') {
                errors.push(`Incorrect type for field: ${field}. Expected string.`);
            }
        }
    }

    return errors;
}

async function parseArticles() {
    try {
        const files = await fs.readdir(articlesDir);
        const articles = [];

        for (const file of files) {
            const filePath = path.join(articlesDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const data = parseMetadata(content);

            const validationErrors = validateArticle(data);
            if (validationErrors.length === 0) {
                articles.push(data);
            } else {
                console.warn(`Article ${file} has errors:\n${validationErrors.join('\n')}\nSkipping.`);
            }
        }

        await fs.ensureDir(outputDir);
        await fs.writeJson(path.join(outputDir, 'articles.json'), articles, { spaces: 2 });
        console.log('Articles parsed successfully.');
    } catch (err) {
        console.error('Error parsing articles:', err);
    }
}

parseArticles();
