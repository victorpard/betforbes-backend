module.exports = {
  apps: [{
    name: "betforbes-backend",
    script: "dist/index.js",
    cwd: "/opt/betforbes/backend",
    interpreter: "node",
    node_args: ["--env-file", ".env"],
    env: { NODE_ENV: "production" }
  }]
};
