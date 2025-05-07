"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CloudIcon,
  MapPinIcon,
  ThermometerIcon,
  RefreshCwIcon,
} from "lucide-react";

interface WeatherData {
  temperatureC: number;
  temperatureF: number;
  description: string;
  location: string;
  iconUrl: string;
  isDay: boolean;
}

export default function WeatherWidget() {
  const [location, setLocation] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [useCelsius, setUseCelsius] = useState<boolean>(true);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedLocation = location.trim();
    if (trimmedLocation === "") {
      setError("Please enter a valid location.");
      setWeather(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${trimmedLocation}`
      );

      if (!response.ok) {
        throw new Error("City not found");
      }

      const data = await response.json();

      const weatherData: WeatherData = {
        temperatureC: data.current.temp_c,
        temperatureF: data.current.temp_f,
        description: data.current.condition.text,
        location: data.location.name,
        iconUrl: `https:${data.current.condition.icon}`,
        isDay: data.current.is_day === 1,
      };

      setWeather(weatherData);
    } catch (error) {
      setError("City not found. Please try again.");
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  function getTemperatureMessage(tempC: number, tempF: number): string {
    const temp = useCelsius ? tempC : tempF;
    const unit = useCelsius ? "°C" : "°F";

    if (useCelsius) {
      if (temp < 0) return `It is freezing at ${temp}${unit}! Bundle up!`;
      if (temp < 10) return `It's quite cold at ${temp}${unit}. Wear warm clothes.`;
      if (temp < 20) return `The temperature is ${temp}${unit}. Light jacket is enough.`;
      if (temp < 30) return `It's a pleasant ${temp}${unit}. Enjoy the day!`;
      return `It's hot at ${temp}${unit}. Stay hydrated!`;
    } else {
      if (temp < 32) return `It is freezing at ${temp}${unit}! Bundle up!`;
      if (temp < 50) return `It's quite cold at ${temp}${unit}. Wear warm clothes.`;
      if (temp < 68) return `The temperature is ${temp}${unit}. Light jacket is enough.`;
      if (temp < 86) return `It's a pleasant ${temp}${unit}. Enjoy the day!`;
      return `It's hot at ${temp}${unit}. Stay hydrated!`;
    }
  }

  function getWeatherMessage(description: string): string {
    switch (description.toLowerCase()) {
      case "sunny":
        return "It's a beautiful sunny day.";
      case "partly cloudy":
        return "Expect some clouds and sunshine.";
      case "cloudy":
        return "It's cloudy today.";
      case "overcast":
        return "The sky is overcast.";
      case "rain":
        return "Don't forget your umbrella — it's raining.";
      case "thunderstorm":
        return "Thunderstorms are expected today.";
      case "snow":
        return "Bundle up! It's snowing.";
      case "mist":
        return "It's misty outside.";
      case "fog":
        return "Be careful — there's fog outside.";
      default:
        return description;
    }
  }

  function getLocationMessage(location: string, isDay: boolean): string {
    return `${location} ${isDay ? "during the day" : "at night"}`;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle>Weather Widget</CardTitle>
          <CardDescription>
            Search for the current weather condition in your city.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Enter a city name"
              value={location}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLocation(e.target.value)
              }
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Search"}
            </Button>
          </form>

          {error && <div className="mt-4 text-red-500">{error}</div>}

          {weather && (
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-center gap-2">
                <img
                  src={weather.iconUrl}
                  alt={weather.description}
                  className="w-8 h-8"
                />
                <span>{getWeatherMessage(weather.description)}</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <ThermometerIcon className="w-6 h-6" />
                <span>
                  {getTemperatureMessage(
                    weather.temperatureC,
                    weather.temperatureF
                  )}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <MapPinIcon className="w-6 h-6" />
                <span>{getLocationMessage(weather.location, weather.isDay)}</span>
              </div>

              <div className="flex justify-center mt-2">
                <Button
                  variant="outline"
                  onClick={() => setUseCelsius(!useCelsius)}
                  className="text-xs px-3 py-1"
                >
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Switch to {useCelsius ? "°F" : "°C"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
