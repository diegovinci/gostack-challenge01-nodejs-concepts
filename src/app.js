const express = require("express");
const cors = require("cors");
const { v4: uuid, validate: isUuid } = require("uuid");

const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: "Invalid repository id." })
  }

  return next();
}

app.use("/repositories/:id", validateRepositoryId);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };

  repositories.push(repository);

  return response.status(201).json(repository);
});

function getRepositoryIndexById(id) {
  return repositories.findIndex(repository => repository.id === id);
}

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = getRepositoryIndexById(id);

  if (repositoryIndex === -1) {
    return response.status(400).json({
      error: `Repository with id ${id} cannot be updated.`
    });
  }

  repositories[repositoryIndex].title = title;
  repositories[repositoryIndex].url = url;
  repositories[repositoryIndex].techs = techs;

  return response.json(repositories[repositoryIndex]);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = getRepositoryIndexById(id);

  if (repositoryIndex === -1) {
    return response.status(400).json({
      error: `Repository with id ${id} cannot be deleted.`
    });
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = getRepositoryIndexById(id);

  if (repositoryIndex === -1) {
    return response.status(400).json({
      error: `Repository with id ${id} cannot be liked.`
    });
  }

  repositories[repositoryIndex].likes++;

  return response.status(200).json({
    likes: repositories[repositoryIndex].likes
  });
});

module.exports = app;
