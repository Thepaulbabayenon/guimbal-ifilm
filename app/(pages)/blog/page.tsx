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
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center relative overflow-hidden sm:py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 text-center">Blog</h1>
                <div className="mt-6">
                    <div className="bg-white shadow-lg rounded-lg divide-y divide-gray-200">
                        {blogPosts.map(post => (
                            <div key={post.id} className="py-4 px-6">
                                <h2 className="text-2xl font-semibold text-gray-800">{post.title}</h2>
                                <p className="text-gray-600">
                                    <strong>Author:</strong> {post.author}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Date:</strong> {post.date}
                                </p>
                                <p className="mt-2 text-gray-700">{post.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlogPage;
