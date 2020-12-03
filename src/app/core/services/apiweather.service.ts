import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASEURL_API_WEATHER, WEATHER, AIRPOLLUTION } from 'src/app/shared/constants/app.constants';
@Injectable({ providedIn: 'root' })
export class ApiWeatherService {

    urlEndPoint: string = BASEURL_API_WEATHER;
    weather: string = WEATHER;
    airPollution: string = AIRPOLLUTION;
    APIKey: string = '03bef4811b435ea3c4352a402d20e675';
    lon: string = 'lon';
    lat: string = 'lat';

    constructor(private http: HttpClient) {

    }

    getCurrentWeather() {
        let lon = localStorage.getItem(this.lon);
        let lat = localStorage.getItem(this.lat);

        let url = `${this.urlEndPoint}/${this.weather}?lat=${lat}&lon=${lon}&appid=${this.APIKey}&units=metric`;
        return this.http.get(url);
    }

    getCurrentAirPollution() {
        let lon = localStorage.getItem(this.lon);
        let lat = localStorage.getItem(this.lat);

        let url = `${this.urlEndPoint}/${this.airPollution}?lat=${lat}&lon=${lon}&appid=${this.APIKey}&units=metric`;
        return this.http.get(url);
    }

    getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.showPosition);
        } else {
            console.log("No geolocalization supported");
        }
    }

    showPosition(position) {
        /*this.lat = position.coords.latitude;
        this.lon = position.coords.longitude;
        console.log(`Lat: ${this.lat} -- Lon: ${this.lon}`);*/
        localStorage.setItem('lat', position.coords.latitude);
        localStorage.setItem('lon', position.coords.longitude);
    }
}