import "./App.css";
import { createContext, useEffect, useState, useContext } from "react";

export const RouterContext = createContext(null);

export const routes = [
  {
    id: crypto.randomUUID(),
    name: "Home",
    url: "#/",
    element: <PostPage />,
  },
  {
    id: crypto.randomUUID(),
    name: "About",
    url: "#/about",
    element: <About />,
  },
];

function getRoute(routeUrl) {
  const route = routes.find((x) => x.url === routeUrl);
  return route ?? routes[0];
}

function setTitle(pageTitle) {
  document.title = `${pageTitle}`;
}

export default function App() {
  const [route, setRoute] = useState(() => {
    if (location.hash.length < 2) {
      return routes[0];
    }

    return getRoute(location.hash);
  });

  useEffect(() => {
    setTitle(route.name);
  }, [route]);

  useEffect(() => {
    window.addEventListener("hashchange", function () {
      setRoute(getRoute(location.hash));
    });
  }, []);

  return (
    <>
      <div className="container">
        <RouterContext.Provider value={{ route }}>
          <Header />
          <Main />
        </RouterContext.Provider>
      </div>
      <Footer />
    </>
  );
}

function Header() {
  return (
    <div className="header">
      <h2>LOGO</h2>
      <Nav />
    </div>
  );
}

function Nav() {
  const { route } = useContext(RouterContext);
  return (
    <ul className="nav">
      {routes.map((x) => (
        <li key={x.id}>
          <a href={x.url} className={route.url === x.url ? "selected" : ""}>
            {x.name}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Main() {
  return (
    <div className="main">
      <Content />
    </div>
  );
}

function Content() {
  const { route } = useContext(RouterContext);
  return (
    <div className="content">
      <h1>{route.name}</h1>
      {route.element}
    </div>
  );
}

function PostPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    async function getPosts() {
      try {
        const response = await fetch("http://localhost:3000/api/posts");
        const data = await response.json();
        setPosts(data);
        setIsLoading(false);
      } catch (e) {
        setError("Postlar alınırken bir hata oluştu");
        setIsLoading(false);
      }
    }
    getPosts();
  }, []);

  const handlePostClick = async (postId) => {
    setIsLoading(true);
    try {
      const postResponse = await fetch(
        `http://localhost:3000/api/posts/${postId}`
      );
      const postData = await postResponse.json();
      setSelectedPost(postData);

      const commentsResponse = await fetch(
        `http://localhost:3000/api/comments?postId=${postId}`
      );
      const commentsData = await commentsResponse.json();
      setComments(commentsData);

      setIsLoading(false);
    } catch (e) {
      setError("Detaylar alınırken bir hata oluştu");
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    setSelectedPost(null);
    setComments([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newComment === "") {
      alert("Lütfen yorumunuzu doldurun.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: selectedPost.id,
          content: newComment,
        }),
      });

      if (!response.ok) {
        throw new Error("Yorum eklenirken bir hata oluştu");
      }

      const addedComment = await response.json();
      setComments((prevComments) => [...prevComments, addedComment]);
      setNewComment("");
    } catch (error) {
      alert("Yorum eklenirken bir hata oluştu.");
    }
  };

  return (
    <div className="postContainer">
      {selectedPost ? (
        <PostDetail
          selectedPost={selectedPost}
          comments={comments}
          newComment={newComment}
          handleBackClick={handleBackClick}
          handleSubmit={handleSubmit}
          setNewComment={setNewComment}
        />
      ) : (
        <PostList posts={posts} handlePostClick={handlePostClick} />
      )}
    </div>
  );
}

function PostDetail({
  selectedPost,
  comments,
  newComment,
  handleBackClick,
  handleSubmit,
  setNewComment,
}) {
  return (
    <div>
      <h1>{selectedPost.title}</h1>
      <strong>{new Date(selectedPost.updatedAt).toLocaleString("tr")}</strong>
      <p>{selectedPost.content}</p>
      <div className="comments">
        <h2>Yorumlar</h2>
        {comments.length === 0 ? (
          <p>Henüz yorum yok.</p>
        ) : (
          comments.map((comment) => (
            <div className="commentItem" key={comment.id}>
              <p>{comment.content}</p>
              <span>Beğeni: {comment.likes}</span>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <h3>Yeni Yorum Ekle</h3>
        <textarea
          placeholder="Yorumunuz"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        />
        <button type="submit">Yorum Ekle</button>
      </form>
      <button onClick={handleBackClick}>Back</button>
    </div>
  );
}

function PostList({ posts, handlePostClick }) {
  return (
    <div className="postList">
      <h1>Post Listesi</h1>
      {posts.length === 0 ? (
        <div>Yükleniyor...</div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="post-item">
            <h2>
              <button onClick={() => handlePostClick(post.id)}>
                {post.title}
              </button>
            </h2>
            <p>{post.content.substring(0, 100)}...</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}

function About() {
  return (
    <>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus
        harum mollitia veniam, quidem fugiat corporis ab voluptatum odit sequi
        voluptate.
      </p>
    </>
  );
}

function Footer() {
  return (
    <div className="footer">
      <div className="links">
        <ul className="socialLink">
          <li>
            <a href="#">Twitter</a>
          </li>
          <li>
            <a href="#">Instagram</a>
          </li>
          <li>
            <a href="#">Pinterest</a>
          </li>
          <li>
            <a href="#">Linkedin</a>
          </li>
        </ul>
        <ul className="quickLinks">
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">About Us</a>
          </li>
          <li>
            <a href="#">Contact</a>
          </li>
          <li>
            <a href="#">Project</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
