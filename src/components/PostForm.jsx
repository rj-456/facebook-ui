import React, { useState } from "react";
import { createPost } from "../api";

export default function PostForm() {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!author.trim() || !content.trim()) {
      setError("Author and content are required.");
      return;
    }

    try {
      setLoading(true);

      await createPost({
        author: author.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
      });

      // clear form
      setAuthor("");
      setContent("");
      setImageUrl("");

      // trigger reload for PostList
      window.dispatchEvent(new CustomEvent("posts:updated"));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="post-form card" onSubmit={handleSubmit}>
      <h2>Create post</h2>
      {error && <div className="error">{error}</div>}

      <label>
        Author
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
        />
      </label>

      <label>
        What's on your mind?
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something..."
        />
      </label>

      <label>
        Image URL (optional)
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </label>

      <div className="actions">
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
