import axios, { CanceledError } from 'axios';

export default axios.create({
    baseURL: 'https://api.linktree.portfolio.mannyserrano.com'
})

export { CanceledError };