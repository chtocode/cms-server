module.exports = {
    apps: [
        {
            name: 'cms',
            script: './dist/main.js',
            watch: true,
        },
    ],

    deploy: {
        production: {
            user: 'root',
            host: 'chtoma.com',
            ref: 'origin/master',
            repo: 'git@github.com:chtocode/cms-server.git',
            path: '/cms',
            ssh_options: 'StrictHostKeyChecking=no',
            env: {
                NODE_ENV: 'production',
            },
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
        },
    },
};
