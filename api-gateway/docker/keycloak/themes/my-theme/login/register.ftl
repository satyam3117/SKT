<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Register - SKT Store</title>
    <link rel="stylesheet" href="${url.resourcesPath}/css/styles.css">
</head>
<body>
    <div class="container">
        <h2>Create Account</h2>

        <form action="${url.registrationAction}" method="post">

            <input type="text" name="firstName" placeholder="First Name" required />

            <input type="text" name="lastName" placeholder="Last Name" required />

            <input type="text" name="username" placeholder="Username" required />

            <input type="email" name="email" placeholder="Email" required />

            <input type="password" name="password" placeholder="Password" required />

            <input type="password" name="password-confirm" placeholder="Confirm Password" required />

            <button type="submit">Register</button>
        </form>

        <p>
            Already have an account?
            <a href="${url.loginUrl}">Login</a>
        </p>
    </div>
</body>
</html>