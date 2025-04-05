import './App.css';
import { useState } from 'react';
function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

  function formatDay(dateStr) {
    return new Intl.DateTimeFormat("en", {
      weekday: "short",
    }).format(new Date(dateStr));
  }
function App (){
  const [search,setSearch]=useState('')
  const [location,setLocation]=useState('Cairo')
  const [loading,setLoading]=useState(false)
  const [weather,setWeather]=useState({})
const [error,setError]=useState('')
 
 
    async function fetchWeather(){
try{
  if(!search) return;
  setLoading(true);
  setError('')
  const geoRes =  await fetch( `https://geocoding-api.open-meteo.com/v1/search?name=${search}`);
  const geoData = await geoRes.json();
  if (!geoData.results) throw new Error("Location not found please try another one!");
  const{id,name,latitude,longitude,
    country_code:countryCode , timezone}=geoData.results.at(0);
    setLocation(name);
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
    );
  const weatherData= await weatherRes.json();
  if(!weatherData.daily) throw new Error("Country not found please try again!");
  console.log(weatherData)
  setWeather(weatherData.daily)
  
}
catch(err){
console.error(err)
setError(err.message)
}finally{
  setSearch('')
  setLoading(false)
}
    }
    
  return(
  <div className="app">
<Header search={search} setSearch={setSearch} location={location} fetchWeather={fetchWeather}/>
{loading && !error ? <Loading /> : <WeatherBox weather={weather} location={location} />}
{error && <ErrorMessage message={error}/>}
  </div>
  )
}
function Header ({setSearch,search,location,fetchWeather}){
  
  return (
    <div className='header'>
      <input type="text" placeholder='Search...' className='search-bar' onChange={(e)=>setSearch(e.target.value)} value={search}></input>
      <button onClick={fetchWeather}> Search </button>
      <h1> 📍{location} </h1>
    </div>
  )
}
function WeatherBox({weather}){
  const {temperature_2m_max:max , temperature_2m_min:min,time:dates ,weathercode:codes,}=weather;
return (
  <div className='weather-box'>
  {/* <h2>Weather {location}</h2> */}
        <ul className='weather'>
          {/* {console.log(weather)} */}
{dates?.map((date,i)=> ( <Day date={date} max={max.at(i)} min={min.at(i)} code={codes.at(i)} key={date} isToday={i===0}/>))}
        </ul>
  </div>
)
}
function Day ({date,max,min,code,isToday}){
  return (
     <li className='day'>
      <span>{getWeatherIcon(code)}</span>
      <p>{isToday ? 'Today' : formatDay(date)}</p>
      <p>{Math.floor(min)}&deg;  &mdash; <strong>{Math.ceil(max)}&deg;</strong></p>
      {/* <p>{code}</p> */}
    </li>
  )
}
function Loading (){
  return(
    <div>Loading....</div>
  )
}
function ErrorMessage({message}){
  return <p className="error">
    <span>⚠️</span>{message}</p>
}
export default App;
