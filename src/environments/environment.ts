declare const process: any;

export const environment = {
    production: false,
    apiUrl: process.env['BACKEND_URL'] || 'http://localhost:8080',
    openaiApiKey: ''
}; 