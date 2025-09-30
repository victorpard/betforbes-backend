module.exports = {
  apps: [
    {
      name: 'betforbes-backend',
      script: 'dist/server.js',
      cwd: '/opt/betforbes/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Segredos efetivos (persistentes)
        JWT_SECRET: '239bb6908b9e1cd17b6ae79974051aadea6f6e01e99e5a401a358f19a9f6b30f',
        JWT_REFRESH_SECRET: '033372735086a490e163ccec493da0e085603a66064e62e80d9ee85439457ac5',
        ACCESS_TOKEN_EXPIRES_IN: '1h',
        REFRESH_TOKEN_EXPIRES_IN: '7d'
      }
    }
  ]
}
