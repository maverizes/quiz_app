import { createServer } from 'http';
import { readFileSync, writeFileSync } from 'fs';
import { config } from 'dotenv';
import path from 'path';
import formidable from 'formidable';
import fs from 'fs';
import MIMETYPES from './constants/mime-type.constants.js'

config();

const port = Number(process.env.PORT);
const host = process.env.HOST;


const form = formidable({
  uploadDir: path.join(process.cwd(),"backend", 'uploads'),
  keepExtensions: true,
  maxFiles: 10
});

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urls = req.url.split('/');
  console.log(urls);

  if (req.method === 'GET') {
    if (urls[1] === 'uploads' && urls[2]) {
      const uploadPath = path.join(process.cwd(),'backend', 'uploads', urls[2]);
      const fileExt = path.extname(uploadPath).slice(1);
      const mimeType = MIMETYPES[fileExt] || 'application/octet-stream';

      const fileStream = fs.createReadStream(uploadPath);
      fileStream.on('error', () => {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'File not found' }));
      });

      res.writeHead(200, { 'Content-Type': mimeType });
      fileStream.pipe(res);
      return;
    }

    if (urls[1] === 'quizz') {
      const data = JSON.parse(readFileSync('./quizzes.json', 'utf-8'));
      if (Number(urls[2])) {
        const quizzId = Number(urls[2]);
        const foundedQuiz = data.find((q) => q.id === quizzId);

        if (!foundedQuiz) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: `${quizzId}-Quizz not found` }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'ok', data: foundedQuiz }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'ok', data }));
      return;
    }
  }

  if (req.method === 'POST') {
    if (urls[1] === 'quizz') {
      form.parse(req, (err, fields, files) => {
        if (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid form data' }));
          return;
        }

        const data = JSON.parse(readFileSync('./data.json', 'utf-8'));

        const newQuizz = {
          id: data.at(-1)?.id + 1 || 1,
          title: fields.title[0],
          image: files?.image[0]?.newFilename,
          answers: JSON.parse(fields.answers[0])
        };

        data.push(newQuizz);
        writeFileSync('./data.json', JSON.stringify(data, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Successfully created', data: newQuizz }));
      });
      return;
    }
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    if (urls[1] === 'quizz' && Number(urls[2])) {
      const quizzId = Number(urls[2]);

      form.parse(req, (err, fields, files) => {
        if (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid form data' }));
          return;
        }

        const data = JSON.parse(readFileSync('./data.json', 'utf-8'));
        const foundedQuiz = data.find((q) => q.id === quizzId);
        if (!foundedQuiz) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: `${quizzId}-Quizz not found` }));
          return;
        }

        foundedQuiz.title = fields.title[0] || foundedQuiz.title;
        foundedQuiz.image = files?.image[0]?.newFilename || foundedQuiz.image;
        foundedQuiz.answers = fields.answers ? JSON.parse(fields.answers[0]) : foundedQuiz.answers;

        writeFileSync('./data.json', JSON.stringify(data, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Successfully updated', data: foundedQuiz }));
      });
      return;
    }
  }

  if (req.method === 'DELETE') {
    if (urls[1] === 'quizz' && Number(urls[2])) {
      const quizzId = Number(urls[2]);

      const data = JSON.parse(readFileSync('./data.json', 'utf-8'));
      const quizzIndex = data.findIndex((q) => q.id === quizzId);

      if (quizzIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `${quizzId}-Quizz not found` }));
        return;
      }

      data.splice(quizzIndex, 1);
      writeFileSync('./data.json', JSON.stringify(data, null, 2));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Successfully deleted' }));
      return;
    }
  }

  res.writeHead(400, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Xato so`rov yubordingiz❗' }));
});

server.listen(port, host, (error) => {
  if (error) {
    console.log(`Dang: ${error}`);
  } else {
    console.log(`Server is running on port ${port}...`);
  }
});
