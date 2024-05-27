// src/hooks/useArticles.js
import { useState, useEffect } from 'react';

const useArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/public/data/articles.json') // Adjust the path to your articles API or static files
            .then(response => response.json())
            .then(data => {
                const sortedArticles = data.sort((a, b) => new Date(b.Date) - new Date(a.Date));
                setArticles(sortedArticles);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching articles:', error);
                setLoading(false);
            });
    }, []);

    return { articles, loading };
};

export default useArticles;
