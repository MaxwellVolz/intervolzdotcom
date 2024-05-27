import { useState, useEffect } from 'react';

const useArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/data/articles.json') // Use relative path to the public directory
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const sortedArticles = data.sort((a, b) => new Date(b.Date) - new Date(a.Date));
                setArticles(sortedArticles);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching the articles:', error);
                setLoading(false);
            });
    }, []);

    return { articles, loading };
};

export default useArticles;
