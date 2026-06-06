const express = require("express");

require("./config/db");
const { getGitHubProfile } = require("./services/githubServices");
const db = require("./config/db");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "GitHub Profile Analyzer API is running"
  });
});

const PORT = 3000;

app.get("/analyze/:username", async (req, res) => {
  try {
    const username = req.params.username;

    const data = await getGitHubProfile(username);

    const user = data.user;
    const repos = data.repos;

    let totalStars = 0;
    let totalForks = 0;

    const languages = {};

    repos.forEach((repo) => {
      totalStars += repo.stargazers_count;
      totalForks += repo.forks_count;

      if (repo.language) {
        languages[repo.language] =
          (languages[repo.language] || 0) + 1;
      }
    });

    let mostUsedLanguage = "Unknown";

    if (Object.keys(languages).length > 0) {
      mostUsedLanguage = Object.keys(languages).reduce((a, b) =>
        languages[a] > languages[b] ? a : b
      );
    }

    const sql = `
      INSERT INTO github_profiles
      (username, name, followers, following, public_repos,
       total_stars, total_forks, most_used_language)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      followers = VALUES(followers),
      following = VALUES(following),
      public_repos = VALUES(public_repos),
      total_stars = VALUES(total_stars),
      total_forks = VALUES(total_forks),
      most_used_language = VALUES(most_used_language)
    `;

    db.query(
      sql,
      [
        user.login,
        user.name,
        user.followers,
        user.following,
        user.public_repos,
        totalStars,
        totalForks,
        mostUsedLanguage,
      ],
      (err) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          username: user.login,
          followers: user.followers,
          publicRepos: user.public_repos,
          totalStars,
          totalForks,
          mostUsedLanguage,
        });
      }
    );
  } catch (error) {
    res.status(404).json({
      message: "GitHub user not found",
    });
  }
});

app.get("/profiles", (req, res) => {
  db.query(
    "SELECT * FROM github_profiles",
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(results);
    }
  );
});

app.get("/profiles/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM github_profiles WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Profile not found"
        });
      }

      res.json(results[0]);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});