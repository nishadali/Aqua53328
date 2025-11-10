<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Vulnerable Demo App</title>
</head>
<body>
  <h1>Vulnerable Demo App</h1>

  <h2>Post a comment (stored XSS)</h2>
  <form action="/comment" method="post">
    <input name="name" placeholder="Name"><br>
    <textarea name="comment" placeholder="Comment"></textarea><br>
    <button type="submit">Post</button>
  </form>

  <h2>Search comments (SQLi)</h2>
  <form method="get" action="/search">
    <input name="q" placeholder="search query"><button>Search</button>
  </form>

  <h2>Upload a file (insecure)</h2>
  <form action="/upload" method="post" enctype="multipart/form-data">
    <input type="file" name="file">
    <button type="submit">Upload</button>
  </form>

  <h2>Comments</h2>
  <ul>
    <% comments.forEach(function(c) { %>
      <li>
        <strong><%= c.name %></strong>:
        <div><%- c.comment %></div>
      </li>
    <% }); %>
  </ul>

  <hr>
  <p>API: GET /api/comments (requires header x-api-token: super-secret-token or ?token=)</p>
  <p>Crash demo: <a href="/crash">/crash</a></p>
</body>
</html>
