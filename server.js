const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const submissionsDir = path.join(__dirname, 'submissions');

app.use(express.static('public'));
app.use('/submissions', express.static('submissions'));
app.use(express.json({ limit: '10mb' }));

if (!fs.existsSync(submissionsDir)) fs.mkdirSync(submissionsDir);

app.post('/submit', (req, res) => {
  const imageData = req.body.image;
  const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
  const filename = `reprintable-${Date.now()}.png`;
  const filepath = path.join(submissionsDir, filename);

  fs.writeFile(filepath, base64Data, 'base64', err => {
    if (err) return res.status(500).send('Error saving image.');
    res.sendStatus(200);
  });
});

app.get('/admin', (req, res) => {
  fs.readdir(submissionsDir, (err, files) => {
    if (err) return res.sendStatus(500);
    const images = files.map(file => 
      `<div><img src="/submissions/${file}" width="300" style="margin:10px;"></div>`
    ).join('');
    res.send(`<h1>Reprintables Admin Panel</h1>${images}`);
  });
});

app.listen(PORT, () => {
  console.log(`Reprintables server running at http://localhost:${PORT}`);
});
