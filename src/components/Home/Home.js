// Importing required libraries and CSS
import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import './Home.css';

// Importing Image
import defaultImage from '../../assets/default_bg.jpg';

// Importing API keys
import { imgApiKey, weatherApiKey } from "../../index";

// Home Component
export default function Home() {
    // Setting initial states
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [forecastData, setForecastData] = useState(null);
    const [fontSize, setFontSize] = useState('2em');
    const [searchFontSize, setSearchFontSize] = useState('1em');

    // API Keys for Image and Weather
    const imgApi = imgApiKey;
    const weatherApi = weatherApiKey;

    // useEffect hook to adjust font size based on the length of the location
    useEffect(() => {
        if (location.length > 20) {
            setFontSize('1rem');
        } else if (location.length > 10) {
            setFontSize('2rem');
        } else {
            setFontSize('3rem');
        }
    }, [location]);

    // Create a reference to the forecast element
    const forecastRef = useRef(null);

    // useEffect hook to add an event listener for scrolling on the forecast element
    useEffect(() => {
        const forecastElement = forecastRef.current;

        const handleScroll = (e) => {
            e.preventDefault();
            forecastElement.scrollLeft += e.deltaY;
        };

        // Add the event listener if the element exists
        if (forecastElement) {
            forecastElement.addEventListener('wheel', handleScroll);
        }

        // Clean up - remove the event listener when the component unmounts
        return () => {
            if (forecastElement) {
                forecastElement.removeEventListener('wheel', handleScroll);
            }
        };
    }, []);

    // handleSubmit function for form submission - fetches image and weather data
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Fetch image from Pexels API
            const imgResponse = await axios.get(`https://api.pexels.com/v1/search?query=${location}&per_page=1`, {
                headers: {
                    Authorization: imgApi
                }
            });

            // Set the image URL if images are returned, otherwise set an error message
            if (imgResponse.data.photos.length > 0) {
                setImageUrl(imgResponse.data.photos[0].src.original);
            } else {
                setImageUrl('');
                alert('No image found for this location');
            }

            // Fetch weather from WeatherAPI
            const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=${weatherApi}&q=${location}&days=14`);
            setForecastData(weatherResponse.data.forecast.forecastday);
            console.log(forecastData);
        } catch (error) {
            console.error(error);
        }
    };

    // Styles for background image
    const divStyle = imageUrl ? { backgroundImage: `url(${imageUrl})` } : { backgroundImage: `url(${defaultImage})` };

    // Render
    return (
        <div>
            <div className="background" style={divStyle}>
                <div className="overlay">
                    <form className="form" onSubmit={handleSubmit}>
                        <input
                            className="location-input"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            size={location.length}
                            placeholder="Location"
                            style={{ fontSize }}
                        />
                        <button type="submit" style={{ searchFontSize }}><span class="material-symbols-outlined" style={{ fontSize }}>
                            search
                        </span></button>
                    </form>
                    <div className="today">
                        {forecastData ?
                            <div className="today-container">
                                <img src={forecastData[0].day.condition.icon} />
                                <div className="today-info">
                                    <h1>Today</h1>
                                    <h2>{forecastData[0].day.condition.text}</h2>
                                    <div className="today-temp-container">
                                        <p className="max-temp">{Math.round(forecastData[0].day.maxtemp_c)}</p>
                                        <p>/</p>
                                        <p className="min-temp">{Math.round(forecastData[0].day.mintemp_c)}</p>
                                        <p>°C</p>
                                    </div>
                                </div>
                            </div>
                            : <></>}
                    </div>
                    <div className="info-window">
                        <div className="info-container">
                            <div className="day-forecast" ref={forecastRef}>
                                {forecastData && forecastData.map((day, index) => (
                                    <div className="day-card" key={index}>
                                        <div className="img-container">
                                            <img src={day.day.condition.icon} />
                                            <p>{new Date(day.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <p className="condition">{day.day.condition.text}</p>
                                        <div className="temp-container">
                                            <p className="max-temp">{Math.round(day.day.maxtemp_c)}</p>
                                            <p>/</p>
                                            <p className="min-temp">{Math.round(day.day.mintemp_c)}</p>
                                            <p>°C</p>
                                        </div>
                                        <div>
                                            <div className="more-info-container">
                                                <p><span class="material-symbols-outlined">
                                                    air
                                                </span></p>
                                                <p>{day.day.maxwind_kph} km/h</p>
                                            </div>
                                            <div className="more-info-container">
                                                <p><span class="material-symbols-outlined">
                                                    water_drop
                                                </span></p>
                                                <p>{day.day.avghumidity} %</p>
                                            </div>
                                            <div className="more-info-container">
                                                <p><span class="material-symbols-outlined">
                                                    water
                                                </span></p>
                                                <p>{day.day.totalprecip_mm} mm</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
