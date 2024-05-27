import React, { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import Hero from '../components/Hero';
// import ArticleList from '../components/ArticleList';
// import articles from '../articles';
import { Link } from 'react-router-dom';

const Home = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 3000); // simulate loading delay
    }, []);

    // const latestArticles = articles.slice(0, 5);

    return (
        <div>
            {loading ? <LoadingScreen /> : (
                <>
                    <Hero />
                    <Link to="/article/big-o-no">Read Big O No</Link>
                    {/* <ArticleList articles={latestArticles} /> */}
                </>
            )}
        </div>
    );
};

export default Home;
