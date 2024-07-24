import http from 'http';
import fs from 'fs';
import url from 'url';

function readFile(pathName) {
    try {
        return fs.readFileSync(pathName, 'utf8');
    } catch (error) {
        console.error("Error reading file:", error);
        return null;
    }
}

function writeFile(pathName, data) {
    try {
        fs.writeFileSync(pathName, data, 'utf8');
    } catch (error) {
        console.error("Error writing file:", error);
    }
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (method === 'GET' && path === '/tasks') {
        const jsonData = readFile("../frontend/tasks.json");

        if (jsonData) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(jsonData);
        } else {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Error reading tasks file" }));
        }

    } else if (method === 'GET' && path.startsWith('/tasks/')) {
        const taskId = path.split('/')[2];
        const dataJSON = readFile("../frontend/tasks.json");

        if (dataJSON) {
            const tasks = JSON.parse(dataJSON);
            const task = tasks.find(t => t.id === parseInt(taskId));

            if (task) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(task));
            } else {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Task Not Found" }));
            }
        } else {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Error reading tasks file" }));
        }
    } else if (method === 'POST' && path === '/tasks') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const newTask = JSON.parse(body);
            const dataJSON = readFile("../frontend/tasks.json");

            if (dataJSON) {
                const tasks = JSON.parse(dataJSON);
                newTask.id = tasks.length ? tasks[tasks.length - 1].id + 1 : 1;
                tasks.push(newTask);
                writeFile("../frontend/tasks.json", JSON.stringify(tasks, null, 2));
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify(newTask));
            } else {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Error reading tasks file" }));
            }
        });
    } else if (method === 'PUT' && path.startsWith('/task/update/')) {
        const taskId = path.split('/')[3];
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const updatedTask = JSON.parse(body);
            const dataJSON = readFile("../frontend/tasks.json");

            if (dataJSON) {
                let tasks = JSON.parse(dataJSON);
                const taskIndex = tasks.findIndex(t => t.id === parseInt(taskId));

                if (taskIndex !== -1) {
                    tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
                    writeFile("../frontend/tasks.json", JSON.stringify(tasks, null, 2));
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(tasks[taskIndex]));
                } else {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Task Not Found" }));
                }
            } else {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Error reading tasks file" }));
            }
        });
    } else if (method === 'DELETE' && path.startsWith('/tasks/')) {
        const taskId = path.split('/')[2];
        const dataJSON = readFile("../frontend/tasks.json");

        if (dataJSON) {
            let tasks = JSON.parse(dataJSON);
            const tasLength = tasks.length;
            tasks = tasks.filter(t => t.id !== parseInt(taskId));

            if (tasks.length < tasLength) {
                writeFile("../frontend/tasks.json", JSON.stringify(tasks, null, 2));
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Task deleted successfully" }));
            } else {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Task Not Found" }));
            }
        } else {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Error reading tasks file" }));
        }
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not Found" }));
    }
});

server.listen(3000, () => {
    console.log("Listening on port 3000...");
});
