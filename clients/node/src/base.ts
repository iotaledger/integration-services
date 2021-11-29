const axios = require('axios').default;

export class Base {

    private apiKey: string;
    private baseURL = "http://ensuresec.solutions.iota.org/";
    private apiVersion: string;

    constructor(apiKey: string, baseURL?: string, apiVersion?: string) {
        this.apiKey = apiKey;
        this.baseURL = baseURL || "http://ensuresec.solutions.iota.org/";
        this.apiVersion = apiVersion || "v1"
    }

    async post(url: string, data: any, jwtToken?: string) {
        let response = await axios.request({
            method: "post",
            url: `${this.baseURL}/api/${this.apiVersion}/${url}`,
            params: {
                "api-key": this.apiKey
            },
            data,
            headers: jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {}
        });
        return response?.data;
    }

    async get(url: string, params: any = {}, jwtToken?: string) {
        params['api-key'] = this.apiKey;
        let response = await axios.request({
            method: "get",
            url: `${this.baseURL}/api/${this.apiVersion}/${url}`,
            params,
            headers: jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {}
        });
        return response?.data;
    }

    async delete(url: string, params: any = {}, jwtToken?: string) {
        params['api-key'] = this.apiKey;
        let response = await axios.request({
            method: "delete",
            url: `${this.baseURL}/api/${this.apiVersion}/${url}`,
            params,
            headers: jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {}
        });
        return response?.data;
    }

}
