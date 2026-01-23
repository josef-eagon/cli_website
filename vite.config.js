import { defineConfig } from 'vite'

export default defineConfig({
    // IMPORTANT: Replace 'cli_website' with your actual repository name on GitHub.
    // If you are deploying to https://<USERNAME>.github.io/, change this to '/'
    base: '/cli_website/',
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                tree: 'tree.html',
                projects: 'projects.html',
                fables: 'fables.html',
                title1: 'fables/title1.html',
                title2: 'fables/title2.html',
                title3: 'fables/title3.html'
            }
        }
    }
})
