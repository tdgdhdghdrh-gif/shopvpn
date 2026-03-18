module.exports = {
  apps: [{
    name: 'shop',
    script: 'node_modules/.bin/next',
    args: 'start -p 3003',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    restart_delay: 3000,
    max_restarts: 10,
    min_uptime: '10s',
    log_file: '/tmp/shop.log',
    out_file: '/tmp/shop-out.log',
    error_file: '/tmp/shop-error.log',
    merge_logs: true,
    time: true,
    kill_timeout: 5000,
    listen_timeout: 10000
  }]
}
