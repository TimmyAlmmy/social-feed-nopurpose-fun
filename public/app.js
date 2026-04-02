const form = document.getElementById("uploadForm");
const postsDiv = document.getElementById("posts");

async function loadPosts() {
  const res = await fetch("http://localhost:3000/posts");
  const posts = await res.json();
  postsDiv.innerHTML = "";

  posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.description}</p>
      <img src="${post.image}" style="max-width:300px;">
    `;
    postsDiv.appendChild(div);
  });
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const data = new FormData();
  data.append("title", form.title.value);
  data.append("description", form.description.value);
  data.append("image", document.getElementById("imageInput").files[0]);

  const res = await fetch("http://localhost:3000/upload", {
    method: "POST",
    body: data
  });
  const result = await res.json();

  console.log("UPLOAD RESULT:", result);

  if (result.success) {
    form.reset();
    loadPosts();
  } else {
    alert("Upload failed: " + result.error);
  }
});

// Load posts on page load
loadPosts();