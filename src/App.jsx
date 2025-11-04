import React, { useEffect, useState } from "react";
import PostForm from "./components/PostForm";
import { getPosts, deletePost, createPost } from "./api"; // Make sure to update api.js too!
import "./App.css";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);

  async function loadPosts() {
    try {
      const data = await getPosts();
      const sorted = data.sort((a, b) => b.id - a.id); // newest first
      setPosts(sorted);
    } catch (err) {
      console.error("Failed to load posts", err);
    }
  }

  useEffect(() => {
    loadPosts();
    window.addEventListener("posts:updated", loadPosts);
    return () => window.removeEventListener("posts:updated", loadPosts);
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost(id);
      loadPosts();
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  }

  function handleEdit(post) {
    setEditing(post);
  }

  async function handleSaveEdit(updatedPost) {
    try {
      // --- THIS URL HAS BEEN UPDATED ---
      await fetch(`https://facebookapi-zo8g.onrender.com/api/posts/${updatedPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPost),
      });
      setEditing(null);
      loadPosts();
    } catch (err) {
      alert("Failed to update post: " + err.message);
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Facebook-like Posts</h1>
      </header>

      <main className="app-main">
        <div className="post-form-wrapper">
          <PostForm />
        </div>

        <section className="post-list">
          <h2>Recent posts</h2>
          {posts.length === 0 ? (
            <p className="no-posts">No posts yet!</p>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="post-card">
                <div className="post-header">
                  <div>
                    <h3>{p.author}</h3>
                    <span className="post-date">
                      {new Date(p.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <div className="post-controls">
                    <button onClick={() => handleEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </div>
                <p>{p.content}</p>
                {p.imageUrl && <img src={p.imageUrl} alt="Post" />}
              </div>
            ))
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>
          <strong>facebook-posts-ui</strong>
        </p>
      </footer>

      {editing && (
        <EditModal
          post={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

/* ------------------- Edit Modal ------------------- */
function EditModal({ post, onCancel, onSave }) {
  const [author, setAuthor] = useState(post.author);
  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState(post.imageUrl || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...post, author, content, imageUrl });
    setSaving(false);
  }

  return (
    <div className="modal-backdrop">
      <form className="modal card" onSubmit={handleSubmit}>
        <h3>Edit post</h3>

        <label>
          Author
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </label>

        <label>
          Content
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </label>

        <label>
          Image URL
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>

        <div className="actions">
          <button type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}