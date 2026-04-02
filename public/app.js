// Get form and feed container
const postForm = document.getElementById("postForm");
const feed = document.getElementById("feed");

// Submit new post
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(postForm);

  try {
    const res = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();
    console.log(data);

    if (data.success) {
      alert("Post uploaded!");
      postForm.reset();
      loadPosts(); // Refresh feed
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Upload failed!");
  }
});

// Load posts from server
async function loadPosts() {
  try {
    const res = await fetch("/posts");
    const posts = await res.json();

    feed.innerHTML = ""; // Clear feed

    posts.forEach(post => {
      const div = document.createElement("div");
      div.classList.add("post");

      div.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.description}</p>
        ${post.image ? `<img src="${post.image}" alt="Post Image" />` : ""}
      `;

      feed.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    feed.innerHTML = "<p>Failed to load posts</p>";
  }
}

// Initial load
loadPosts();