module.exports = {
  apps: [{
    name: "betforbes-backend",
    cwd: "/opt/betforbes/backend",
    script: "dist/index.js",
    node_args: "--enable-source-maps",
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "300M",
    watch: false,
    env: {
      NODE_ENV: "production"
      // Se quiser forçar variáveis aqui, adicione-as (ou confie no .env carregado pelo app)
    },
    out_file: "/root/.pm2/logs/bf-backend-out.log",
    error_file: "/root/.pm2/logs/bf-backend-error.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss"
  }]
}
