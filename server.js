const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware to parse form submissions and JSON
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// Initial default content
const DEFAULT_CONTENT = {
    socials: {
        facebook: "https://www.facebook.com/mdis.bijnor.2025",
        instagram: "https://www.instagram.com/mdis_bijnor?xtok=MXNycm1reG9jOWg2dA==",
        youtube: "https://youtube.com/@mdinternationalschool99?si=vRI_djiKAlL4mlSZ"
    },
    contact: {
        phone: "+91 98765 43210",
        email: "info@mdinternationalschool.in",
        address: "Bijnor, Uttar Pradesh - 246701"
    },
    gallery: [
        "1000009902.jpg",
        "1000009902.jpg",
        "1000009902.jpg",
        "1000009902.jpg"
    ],
    notices: [
        { day: "26", month: "Aug", title: "Mid Term Exam Schedule 2026-27" },
        { day: "18", month: "Aug", title: "School Reopening Notice" },
        { day: "10", month: "Aug", title: "Fee Payment Guidelines" },
        { day: "02", month: "Aug", title: "Health & Safety Guidelines" }
    ],
    events: [
        { day: "05", month: "Sep", title: "Teachers' Day Celebration", time: "10:00 AM | School Auditorium" },
        { day: "12", month: "Sep", title: "Annual Sports Day", time: "8:00 AM | School Ground" },
        { day: "20", month: "Sep", title: "Parent-Teacher Meeting", time: "10:00 AM | Classrooms" },
        { day: "28", month: "Sep", title: "Inter-School Cultural Fest", time: "4:00 PM | School Auditorium" }
    ],
    toppers: [
        { name: "BHAVYA BHARDWAJ", class: "Class - X", percent: "98%" },
        { name: "DIVYANSHI & VEDANSH", class: "Class - XII", percent: "97%" },
        { name: "ANSHIKA SHARMA", class: "Class - X", percent: "96%" }
    ]
};

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_CONTENT, null, 2));
}

// 1. Logo serving route
app.get('/api/logo', (req, res) => {
    const possiblePaths = [
        path.join(__dirname, 'public', 'MD International School Logo (3).html'),
        path.join(__dirname, 'MD International School Logo (3).html')
    ];

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            try {
                const content = fs.readFileSync(p, 'utf8');
                const match = content.match(/data:image\/[^;]+;base64,([^\s"']+)/);
                if (match && match[1]) {
                    const imgBuffer = Buffer.from(match[1], 'base64');
                    res.setHeader('Content-Type', 'image/jpeg');
                    res.setHeader('Cache-Control', 'public, max-age=86400');
                    return res.send(imgBuffer);
                }
            } catch (err) {
                console.error("Error reading logo HTML:", err);
            }
        }
    }

    const imgPath = path.join(__dirname, 'public', '1000009874.jpg');
    if (fs.existsSync(imgPath)) {
        return res.sendFile(imgPath);
    }

    res.status(404).send('Logo not found');
});

// 2. Direct Form Submission Route (Fixes "Cannot POST /login-endpoint")
app.post('/login-endpoint', (req, res) => {
    const { identifier, password } = req.body;
    
    // Check Admin credentials
    if (identifier === 'Shagun' && password === 'Developer') {
        return res.redirect('/admin.html?auth=admin-auth-session-token-9988');
    }

    // Guest login
    if (identifier === 'GUEST-USER') {
        return res.redirect('/home.html');
    }

    // Invalid credentials
    return res.status(401).send('<script>alert("Invalid Username or Password!"); window.location.href="/";</script>');
});

// 3. AJAX/API Login Route
app.post('/api/login', (req, res) => {
    const { identifier, password } = req.body;
    
    if (identifier === 'Shagun' && password === 'Developer') {
        return res.json({
            success: true,
            role: 'Admin',
            token: 'admin-auth-session-token-9988',
            redirect: '/admin.html?auth=admin-auth-session-token-9988'
        });
    }

    if (identifier === 'GUEST-USER') {
        return res.json({
            success: true,
            role: 'Guest',
            redirect: '/home.html'
        });
    }

    return res.status(401).json({
        success: false,
        message: 'Invalid Username or Password!'
    });
});

// 4. Content APIs
app.get('/api/content', (req, res) => {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(raw));
    } catch (e) {
        res.json(DEFAULT_CONTENT);
    }
});

app.post('/api/content', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer admin-auth-session-token-9988') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true, message: 'Content updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to write data' });
    }
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
