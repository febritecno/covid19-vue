import axios from 'axios';

const API_URL = 'https://covid19.mathdro.id/api';

export class APIServiceCovid {

    constructor() {

    }

    getBaseUrl() {
        return API_URL;
    }

    getDataGlobal() {
        const url = `${API_URL}`;
        let data = axios.get(url).then(response => response.data);
        return data;
    }

    getDataConfirmedDetailGlobal() {
        const url = `${API_URL}/confirmed`;
        let data = axios.get(url).then(response => response.data);
        return data;
    }

    getDataDailyGlobal() {
        const url = `${API_URL}/daily`;
        let data = axios.get(url).then(response => response.data);
        return data;
    }

    getDataSummaryPerCountry(countryCode) {
        const url = `${API_URL}/countries/` + countryCode;
        let data = axios.get(url).then(response => response.data);
        return data;
    }

    getDataCountryCode() {
        const url = `${API_URL}/countries/`;
        let data = axios.get(url).then(response => response.data);
        return data;
    }

    getImageSummaryByCountry(countryCode) {
        const url = `${API_URL}/countries/`+countryCode+`/og`;
        let data = axios.get(url).then(response => response.data);
        return data;
    }
}