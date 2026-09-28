const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

const app = require("../app");

function makeRequest(method, path, body = "") {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;

      const request = http.request(
        {
          hostname: "localhost",
          port,
          path,
          method,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(body)
          }
        },
        (response) => {
          let data = "";

          response.on("data", (chunk) => {
            data += chunk;
          });

          response.on("end", () => {
            server.close();
            resolve({
              statusCode: response.statusCode,
              body: data
            });
          });
        }
      );

      request.on("error", (error) => {
        server.close();
        reject(error);
      });

      request.write(body);
      request.end();
    });
  });
}

test("GET /health returns status ok", async () => {
  const response = await makeRequest("GET", "/health");

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body, '{"status":"failed"}');
});

test("GET /api/questions returns quiz questions", async () => {
  const response = await makeRequest("GET", "/api/questions");

  assert.strictEqual(response.statusCode, 200);

  const questions = JSON.parse(response.body);

  assert.ok(Array.isArray(questions));
  assert.strictEqual(questions.length, 10);
  assert.ok(questions[0].question);
  assert.ok(questions[0].options);

  assert.strictEqual(questions[0].answer, undefined);
});

test("POST /quiz/submit accepts valid answers", async () => {
  const body = [
    "question_1=Continuous+Integration",
    "question_2=git+init",
    "question_3=Dockerfile",
    "question_4=GitHub+Actions",
    "question_5=Continuous+Delivery",
    "question_6=git+branch",
    "question_7=Packaging+an+application+with+its+dependencies",
    "question_8=POST",
    "question_9=Application+Programming+Interface",
    "question_10=git+pull"
  ].join("&");

  const response = await makeRequest("POST", "/quiz/submit", body);

  assert.strictEqual(response.statusCode, 200);
  assert.match(response.body, /10\s*\/\s*10/);
});

test("POST /quiz/submit rejects missing answers", async () => {
  const response = await makeRequest(
    "POST",
    "/quiz/submit",
    "question_1=Continuous+Integration"
  );

  assert.strictEqual(response.statusCode, 400);
  assert.match(response.body, /Please answer all questions/);
});

test("POST /quiz/submit rejects invalid answers", async () => {
  const body = [
    "question_1=Wrong+Answer",
    "question_2=git+init",
    "question_3=Dockerfile",
    "question_4=GitHub+Actions",
    "question_5=Continuous+Delivery",
    "question_6=git+branch",
    "question_7=Packaging+an+application+with+its+dependencies",
    "question_8=POST",
    "question_9=Application+Programming+Interface",
    "question_10=git+pull"
  ].join("&");

  const response = await makeRequest("POST", "/quiz/submit", body);

  assert.strictEqual(response.statusCode, 400);
  assert.match(response.body, /Invalid answer submitted/);
});