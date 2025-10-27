module.exports = {
  apps: [{
    name: 'betforbes-backend',
    cwd: '/opt/betforbes/backend',
    script: 'dist/index.js',
    node_args: '-r dotenv/config -r tsconfig-paths/register',
    interpreter: process.env.NODE_BIN || 'node',
    instances: 1,
    exec_mode: 'fork',
    restart_delay: 200,
    env: {
      DOTENV_CONFIG_PATH: '/opt/betforbes/backend/.env'
      // PORT: '3001', // só use se quiser forçar aqui; já está no .env
    }
  }]
}
