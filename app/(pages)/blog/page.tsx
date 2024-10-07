import React from 'react';

const BlogPage: React.FC = () => {
    
    const blogPosts = [
        {
            id: 1,
            title: "Sample Blog Post 1",
            author: "John Doe",
            date: "July 18, 2024",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla convallis libero et dui accumsan, et ultrices nisi elementum. Sed vehicula semper lorem, nec faucibus neque consequat sit amet."
        },
        {
            id: 2,
            title: "Sample Blog Post 2",
            author: "Jane Smith",
            date: "July 17, 2024",
            content: "Pellentesque nec justo nec mauris tempus finibus a id ligula. Donec quis libero vel dolor posuere dictum. Vestibulum sagittis lorem sed dui interdum placerat."
        }
       
    ];

    return (
        <div className="blog-page">
            <h1>Blog</h1>
            <div className="blog-posts">
                {blogPosts.map(post => (
                    <div key={post.id} className="blog-post">
                        <h2>{post.title}</h2>
                        <p><strong>Author:</strong> {post.author}</p>
                        <p><strong>Date:</strong> {post.date}</p>
                        <p>{post.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BlogPage;
