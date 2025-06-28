declare const process: any;

export const environment = {
    production: true,
    apiUrl: process.env['BACKEND_URL'],
    openaiApiKey: ''
}; 