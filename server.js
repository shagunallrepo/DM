const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Fallback route to ensure index.html loads
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Example route for login form submission
app.post('/login-endpoint', (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    // Add your authentication logic here
    res.send('Login submitted successfully!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
