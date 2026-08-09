<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="${url.resourcesPath}/css/styles.css">
</head>
<body>
    <div class="container">
    <h1 style="color:red;">CUSTOM THEME WORKING</h1>
        <h2>Welcome to SKT Store</h2>

        <form action="${url.loginAction}" method="post">
            <input type="text" name="username" placeholder="Username" />
            <input type="password" name="password" placeholder="Password" />
            <button type="submit">Login</button>
        </form>

        <a href="${url.registrationUrl}">Register</a>
    </div>
</body>
</html>