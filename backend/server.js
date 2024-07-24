import http from "node:http";
import { SERVER_PORT } from "./constants/server.contants.js";
import { readFileCustom, writeFileCustom } from "./utils/fs.js";
import path from "node:path";
import formidable from "formidable";
import fs from "fs";
import MIMETYPES from "./constants/mime-type.contants.js";

const form = formidable({
  uploadDir: "./backend/uploads",
  keepExtensions: true,
  maxFiles: 10,
});

const serverCallback = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const method = req.method;
  const urls = req.url.split("/"); //  ["", "quizz", "delete", "1"]

  const filePath = path.join(process.cwd(), "backend", "data", "quizz.json");
  const allQuizzes = readFileCustom(filePath);

  if (method === "GET") {
    if (urls[1] == "uploads" && urls[2]) {
      // static filelarni berib yuborish
      const uploadPath = path.join(
        process.cwd(),
        "backend",
        "uploads",
        urls[2]
      );


      const fileExt = path.extname(uploadPath);

      const fileStream = fs.createReadStream(uploadPath);

      fileStream.on("error", err => {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          message: "File not found"
        }))
        return ;
      })

      res.writeHead(200, { "Content-Type": "image/jpeg" });
      fileStream.pipe(res);
      return;
    }

    if (urls[1] === "quizz") {
      if (Number(urls[2])) {
        const quizzId = Number(urls[2]);

        const foundedQuiz = allQuizzes.find((q) => q.id == quizzId);

        if (!foundedQuiz) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: `${quizzId}-Quizz not found`,
            })
          );
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "ok",
            data: foundedQuiz,
          })
        );
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "ok",
          data: allQuizzes,
        })
      );

      return;
    }
  }

  if (method === "POST") {
    if (urls[1] == "quizz") {
      const [fields, files] = await form.parse(req);
      const newQuizz = {
        id: allQuizzes.at(-1)?.id + 1 || 1,
        title: fields.title[0],
        image: files?.image[0]?.newFilename,
        answers: JSON.parse(fields.answers[0]),
      };

      allQuizzes.push(newQuizz);

      writeFileCustom(filePath, allQuizzes);

      res.writeHead(200, "Content-Type", "application/json");
      res.end(
        JSON.stringify({
          message: "Successfully created",
        })
      );
      return;
    }
  }

  if (method === "PATCH") {
  }

  if (method === "PUT") {
  }

  if (method === "DELETE") {
  }

  res.writeHead(400, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: "Xato so'rov yubording❗",
    })
  );
  return;
};

const server = http.createServer(serverCallback);

server.listen(SERVER_PORT, "localhost", () => {
  console.log(`Server ${SERVER_PORT} portda ishlamoqda`);
});
