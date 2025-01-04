import './MoodDetailPage.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Slider } from 'antd';
const userData={
    eating_value:4,
    sleep_value:4,
    guilt_value:4,
    body_value:4,
    hesitation_value:4,
    mental_value:4
}
function MoodDetailPage({ clickDate, clickMood, userId }) {
  const [currentDate, setCurrentDate] = useState(new Date(clickDate));
  const [weatherData, setWeatherData] = useState(null);
  const [userDiary, setUserDiary] = useState("");
  const [userMood, setUserMood] = useState(clickMood);
  const [userOtherData, setUserOtherData] = useState(userData);
  const [cityCode, setCityCode] = useState('330100');
  const [error, setError] = useState(null);

  const API_KEY = '16b95c4e6063dee98ff96d6d45faea6f';

  // Fetch weather
  const fetchWeather = async (date) => {
    if (!cityCode) {
      setError('城市代码不能为空！');
      return;
    }
    setError(null);
    try {
      const response = await axios.get(
        `https://restapi.amap.com/v3/weather/weatherInfo`,
        {
          params: {
            city: cityCode,
            key: API_KEY,
          },
        }
      );
      const data = response.data;
      if (data.status === '1') {
        setWeatherData(data.lives[0]);
      } else {
        setError(data.info || '获取天气信息失败');
      }
    } catch (err) {
      setError('请求失败，请检查网络或接口密钥');
    }
  };

  // Fetch diary
  const fetchDiary = async (date) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/get_diaries`, {
        params: { user_id: userId, start_date: date, end_date: date },
      });
      setUserDiary(response.data[0].diary);
    } catch (error) {
      console.error("Error fetching diary data:", error);
    }
  };
  const fetchMood = async (date) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/moods/${userId}`, {
        params: { start_date: date, end_date: date },
      });
      setUserMood(response.data.moods[0].mood);
    } catch (error) {
      console.error("Error fetching diary data:", error);
    }
  };
  // Fetch other data
  const fetchOtherData = async (date) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/doctor/HAM-D6-SR-Each`, {
        params: { user_id: userId, start_date: date, end_date: date },
      });
      setUserOtherData(response.data);
    } catch (error) {
      console.error("Error fetching other data:", error);
    }
  };

  // Fetch data when the date changes
  const fetchData = (date) => {
    fetchMood(date)
    fetchWeather(date);
    fetchDiary(date);
    fetchOtherData(date);
  };

  // Handle slider change
  const handleSliderChange = (value) => {
    const newDate = new Date(clickDate);
    newDate.setDate(newDate.getDate() + value); // Each step changes by 1 day
    setCurrentDate(newDate);
    fetchData(newDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
  };

  useEffect(() => {
    fetchData(clickDate);
  }, [clickDate]);

  const marks = {
    0: clickDate,
  };
  const moodToSvg={
    happy:<svg t="1735003095009" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5153" id="mx_n_1735003095010" width="64" height="64"><path d="M512 85.333333c235.648 0 426.666667 191.018667 426.666667 426.666667s-191.018667 426.666667-426.666667 426.666667S85.333333 747.648 85.333333 512 276.352 85.333333 512 85.333333z m0 85.333334a341.333333 341.333333 0 1 0 0 682.666666 341.333333 341.333333 0 0 0 0-682.666666zM362.666667 341.333333a42.666667 42.666667 0 0 1 42.666666 42.666667v64a42.666667 42.666667 0 0 1-85.333333 0V384a42.666667 42.666667 0 0 1 42.666667-42.666667z m298.666666 0a42.666667 42.666667 0 0 1 42.666667 42.666667v64a42.666667 42.666667 0 0 1-85.333333 0V384a42.666667 42.666667 0 0 1 42.666666-42.666667z m-1.066666 250.026667a42.666667 42.666667 0 1 1 65.877333 54.186667A276.821333 276.821333 0 0 1 512 746.666667a276.821333 276.821333 0 0 1-213.845333-100.693334 42.666667 42.666667 0 1 1 65.792-54.4A191.488 191.488 0 0 0 512 661.333333a191.488 191.488 0 0 0 148.266667-69.973333z" fill="#82c8e2" p-id="5154"></path></svg>,
    angry:<svg t="1735003158530" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7528" width="64" height="64"><path d="M416.631467 323.7888c-38.365867 12.458667-45.397333 47.752533-42.9056 70.144-27.374933-36.590933-26.282667-78.677333-26.282667-139.3664-87.790933 37.6832-67.3792 146.2272-69.973333 179.2-22.1184-20.548267-26.282667-69.666133-26.282667-69.666133-23.313067 13.653333-35.0208 50.0736-35.0208 79.633066 0 71.4752 50.961067 129.4336 113.800533 129.4336C392.772267 573.166933 443.733333 515.208533 443.733333 443.733333c0-42.461867-27.409067-62.088533-27.101866-119.944533zM780.731733 323.7888c-38.365867 12.458667-45.397333 47.752533-42.939733 70.144-27.374933-36.590933-26.248533-78.677333-26.248533-139.3664-87.790933 37.6832-67.3792 146.2272-70.007467 179.2-22.084267-20.548267-26.282667-69.666133-26.282667-69.666133C592.008533 377.7536 580.266667 414.173867 580.266667 443.733333c0 71.4752 50.926933 129.4336 113.7664 129.4336 62.839467 0 113.800533-57.9584 113.800533-129.4336 0-42.461867-27.4432-62.088533-27.101867-119.944533zM653.858133 792.917333l2.4576 5.461334a34.133333 34.133333 0 0 0 63.556267-24.917334c-26.624-67.9936-111.854933-112.708267-207.872-112.708266-94.890667 0-179.336533 43.690667-206.9504 110.4896a34.133333 34.133333 0 0 0 60.996267 30.242133l2.048-4.130133c15.7696-38.0928 74.205867-68.334933 143.906133-68.334934 67.072 0 123.5968 27.989333 141.858133 63.8976z" fill="#dc3a3a" p-id="7529"></path><path d="M512 22.766933C241.800533 22.766933 22.766933 241.800533 22.766933 512S241.800533 1001.233067 512 1001.233067 1001.233067 782.199467 1001.233067 512 782.199467 22.766933 512 22.766933z m0 68.266667c232.516267 0 420.9664 188.450133 420.9664 420.9664S744.516267 932.9664 512 932.9664 91.0336 744.516267 91.0336 512 279.483733 91.0336 512 91.0336z" fill="#dc3a3a" p-id="7530"></path></svg>,
    depress:<svg t="1735003202042" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8693" width="64" height="64"><path d="M512 64c247.04 0 448 200.96 448 448S759.04 960 512 960 64 759.04 64 512 264.96 64 512 64M512 0C229.248 0 0 229.248 0 512s229.248 512 512 512 512-229.248 512-512S794.752 0 512 0z" p-id="8694" fill="#594d9c"></path><path d="M308.309333 595.754667a135.68 135.68 0 0 1-135.509333-135.509334 32 32 0 0 1 64 0c0 39.424 32.085333 71.509333 71.509333 71.509334s71.509333-32.085333 71.509334-71.509334a32 32 0 0 1 64 0 135.68 135.68 0 0 1-135.509334 135.509334zM715.733333 595.754667a135.68 135.68 0 0 1-135.509333-135.509334 32 32 0 0 1 64 0c0 39.424 32.085333 71.509333 71.509333 71.509334 39.424 0 71.509333-32.085333 71.509334-71.509334a32 32 0 0 1 64 0 135.722667 135.722667 0 0 1-135.509334 135.509334z" p-id="8695" fill="#594d9c"></path><path d="M640 776.832H384a32 32 0 0 1 0-64h256a32 32 0 0 1 0 64z" p-id="8696" fill="#594d9c"></path></svg>,
    anxiety:<svg t="1735003529400" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11723" width="64" height="64"><path d="M512 0c282.752 0 512 229.248 512 512s-229.248 512-512 512S0 794.752 0 512 229.248 0 512 0z m135.253333 624.938667a42.666667 42.666667 0 0 0-48.469333 3.797333L512 699.52l-86.784-70.784-5.504-3.797333a42.666667 42.666667 0 0 0-48.469333 3.797333l-113.792 92.842667-4.565334 4.352a42.666667 42.666667 0 0 0-1.493333 55.68l4.352 4.608a42.666667 42.666667 0 0 0 55.68 1.493333l86.784-70.826667 86.826667 70.826667 5.461333 3.754667a42.666667 42.666667 0 0 0 48.469333-3.754667l86.826667-70.826667 86.784 70.826667 5.162667 3.626667a42.666667 42.666667 0 0 0 48.810666-69.76l-113.792-92.842667z m-334.378666-340.48a85.333333 85.333333 0 1 0 0 170.666666 85.333333 85.333333 0 0 0 0-170.666666z m398.250666 0a85.333333 85.333333 0 1 0 0 170.666666 85.333333 85.333333 0 0 0 0-170.666666z" fill="#e98f36" p-id="11724"></path></svg>
  }
  const weatherToSvg={
    rain:<svg width="57" height="57" viewBox="0 0 57 57" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.45215 17.1427C6.45215 21.3725 8.13244 25.4291 11.1234 28.4201C14.1143 31.411 18.1709 33.0913 22.4007 33.0913C26.6306 33.0913 30.6872 31.411 33.6781 28.4201C36.6691 25.4291 38.3493 21.3725 38.3493 17.1427C38.3493 12.9129 36.6691 8.85627 33.6781 5.86533C30.6872 2.87439 26.6306 1.19409 22.4007 1.19409C18.1709 1.19409 14.1143 2.87439 11.1234 5.86533C8.13244 8.85627 6.45215 12.9129 6.45215 17.1427Z" fill="#9FDFFF"/>
            <path d="M26.6387 27.7533C26.6387 29.6033 27.0031 31.4352 27.711 33.1444C28.419 34.8536 29.4567 36.4066 30.7648 37.7147C32.073 39.0229 33.626 40.0606 35.3351 40.7685C37.0443 41.4765 38.8762 41.8409 40.7262 41.8409C42.5762 41.8409 44.4081 41.4765 46.1173 40.7685C47.8265 40.0606 49.3795 39.0229 50.6876 37.7147C51.9958 36.4066 53.0335 34.8536 53.7414 33.1444C54.4494 31.4352 54.8138 29.6033 54.8138 27.7533C54.8138 24.0171 53.3296 20.4338 50.6876 17.7919C48.0457 15.15 44.4625 13.6658 40.7262 13.6658C36.99 13.6658 33.4067 15.15 30.7648 17.7919C28.1229 20.4338 26.6387 24.0171 26.6387 27.7533Z" fill="#78CCFF"/>
            <path d="M2.18262 29.0815C2.18262 32.4655 3.52691 35.7109 5.91977 38.1038C8.31263 40.4966 11.558 41.8409 14.9421 41.8409C18.3261 41.8409 21.5715 40.4966 23.9644 38.1038C26.3572 35.7109 27.7015 32.4655 27.7015 29.0815C27.7015 25.6975 26.3572 22.452 23.9644 20.0592C21.5715 17.6663 18.3261 16.322 14.9421 16.322C11.558 16.322 8.31263 17.6663 5.91977 20.0592C3.52691 22.452 2.18262 25.6975 2.18262 29.0815Z" fill="#78CCFF"/>
            <path d="M14.8118 29.0813H40.5957V41.8407H14.8118V29.0813ZM12.2439 47.8628C12.2439 49.9689 10.7249 51.6732 8.85244 51.6732C6.97999 51.6732 5.46094 49.9661 5.46094 47.8628C5.46094 45.7566 8.85244 41.5871 8.85244 41.5871C8.85244 41.5871 12.2439 45.7566 12.2439 47.8628Z" fill="#78CCFF"/>
            <path d="M31.8914 47.8629C31.8914 49.969 30.3723 51.6733 28.4999 51.6733C26.6274 51.6733 25.1084 49.9662 25.1084 47.8629C25.1084 45.7567 28.4999 41.5872 28.4999 41.5872C28.4999 41.5872 31.8914 45.7567 31.8914 47.8629ZM51.5364 47.8629C51.5364 49.969 50.0174 51.6733 48.1449 51.6733C46.2725 51.6733 44.7534 49.9662 44.7534 47.8629C44.7534 45.7567 48.1449 41.5872 48.1449 41.5872C48.1449 41.5872 51.5364 45.7567 51.5364 47.8629Z" fill="#78CCFF"/>
            <path d="M22.0672 39.994C22.0672 42.1001 20.5481 43.8044 18.6757 43.8044C16.8032 43.8044 15.2842 42.0973 15.2842 39.994C15.2842 37.8907 18.6757 33.7183 18.6757 33.7183C18.6757 33.7183 22.0672 37.8907 22.0672 39.994ZM41.7122 39.994C41.7122 42.1001 40.1932 43.8044 38.3207 43.8044C36.4483 43.8044 34.9292 42.0973 34.9292 39.994C34.9292 37.8907 38.3207 33.7183 38.3207 33.7183C38.3207 33.7183 41.7122 37.8907 41.7122 39.994ZM22.0672 52.9045C22.0672 55.0106 20.5481 56.7149 18.6757 56.7149C16.8032 56.7149 15.2842 55.0078 15.2842 52.9045C15.2842 50.8012 18.6757 46.6288 18.6757 46.6288C18.6757 46.6288 22.0672 50.8012 22.0672 52.9045ZM41.7122 52.9045C41.7122 55.0106 40.1932 56.7149 38.3207 56.7149C36.4483 56.7149 34.9292 55.0078 34.9292 52.9045C34.9292 50.8012 38.3207 46.6288 38.3207 46.6288C38.3207 46.6288 41.7122 50.8012 41.7122 52.9045Z" fill="#9FDFFF"/>
            </svg>,
    cloudy:<svg t="1734571258050" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3683" width="64" height="64"><path d="M298.708076 205.838198C165.588076 205.838198 57.677643 317.786066 57.677643 455.875217c0 138.087376 107.907771 250.025484 241.025997 250.028145v0.000888h269.860381a210.168458 210.168458 0 0 0 2.591944 0h196.496194l0.825234 0.002662c77.199307 0 139.783986-62.584679 139.783987-139.783987s-62.584679-139.783986-139.783987-139.783986c-4.886627 0-9.713802 0.250232-14.469989 0.740049-29.483036-74.252423-100.822295-126.626385-184.147855-126.626385-25.55652 0-49.986107 4.927445-72.42626 13.901199-43.452562-65.540437-116.251508-108.515605-198.725213-108.515604z" fill="#B5BCC7" p-id="3684"></path><path d="M356.771716 318.09575c-133.12 0-241.030433 111.947868-241.030434 250.037019 0 138.087376 107.907771 250.025484 241.025997 250.028146h269.860381a210.168458 210.168458 0 0 0 2.591945 0h196.496194c0.275078 0.002662 0.550156 0.003549 0.825234 0.003549 77.199307 0 139.783986-62.584679 139.783986-139.783986s-62.584679-139.783986-139.783986-139.783986c-4.886627 0-9.713802 0.250232-14.46999 0.740049-29.483036-74.25331-100.822295-126.626385-184.147854-126.626385-25.555633 0-49.986107 4.927445-72.425373 13.901199-43.453449-65.541324-116.251508-108.515605-198.7261-108.515605z" fill="#98A2B1" p-id="3685"></path></svg>,
    sunny:<svg t="1734570944197" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2458" width="64" height="64"><path d="M512.91 511.8m-250 0a250 250 0 1 0 500 0 250 250 0 1 0-500 0Z" fill="#FFCE54" p-id="2459"></path><path d="M512.91 63.87v100M512.91 193.87c-16.57 0-30-13.43-30-30v-100c0-16.57 13.43-30 30-30s30 13.43 30 30v100c0 16.57-13.43 30-30 30zM195.06 195.06l70.71 70.71M265.77 295.77c-7.68 0-15.36-2.93-21.21-8.79l-70.71-70.71c-11.72-11.72-11.72-30.71 0-42.43 11.72-11.72 30.71-11.72 42.43 0l70.71 70.71c11.72 11.72 11.72 30.71 0 42.43-5.86 5.87-13.54 8.79-21.22 8.79zM512.91 859.73v100M512.91 989.73c-16.57 0-30-13.43-30-30v-100c0-16.57 13.43-30 30-30s30 13.43 30 30v100c0 16.57-13.43 30-30 30zM262.55 761.45l-70.71 70.71M191.84 862.16c-7.68 0-15.36-2.93-21.21-8.79-11.72-11.71-11.72-30.71 0-42.43l70.71-70.71c11.72-11.72 30.71-11.72 42.43 0 11.72 11.71 11.72 30.71 0 42.43l-70.71 70.71c-5.86 5.86-13.54 8.79-21.22 8.79z" fill="#FFCE54" p-id="2460"></path><path d="M164.21 513.22h-100M164.21 543.22h-100c-16.57 0-30-13.43-30-30s13.43-30 30-30h100c16.57 0 30 13.43 30 30s-13.43 30-30 30z" fill="#FFCE54" p-id="2461"></path><path d="M754.31 754.31l70.71 70.71M825.02 865.02c-10.24 0-20.47-3.91-28.28-11.72l-70.71-70.71c-15.62-15.62-15.62-40.95 0-56.57s40.95-15.62 56.57 0l70.71 70.71c15.62 15.62 15.62 40.95 0 56.57-7.81 7.82-18.05 11.72-28.29 11.72z" fill="#FFCE54" p-id="2462"></path><path d="M859.33 513.22h100M959.33 543.22h-100c-16.57 0-30-13.43-30-30s13.43-30 30-30h100c16.57 0 30 13.43 30 30s-13.43 30-30 30z" fill="#FFCE54" p-id="2463"></path><path d="M755.46 264.36l70.72-70.71M755.46 294.36c-7.68 0-15.35-2.93-21.21-8.79-11.72-11.72-11.72-30.71 0-42.43l70.71-70.71c11.71-11.72 30.71-11.72 42.43 0 11.72 11.72 11.72 30.71 0 42.43l-70.71 70.71c-5.86 5.86-13.54 8.79-21.22 8.79z" fill="#FFCE54" p-id="2464"></path></svg>
    ,fog:<svg t="1735000624230" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2608" width="64" height="64"><path d="M744.448 395.776c-27.648 0-53.248 10.24-75.264 23.04 0-3.072 0.512-5.632 0.512-8.192 0-116.224-92.16-214.528-209.92-214.528-97.28 0-181.76 68.608-206.848 158.208C176.64 372.224 120.32 440.32 120.32 522.24c0 87.04 60.416 161.28 144.896 173.056H759.808c75.264-7.168 135.168-71.68 135.168-148.992-0.512-81.92-67.584-150.528-150.528-150.528zM755.712 756.736h-501.76c-8.704 0-15.36 6.656-15.36 15.36s6.656 15.36 15.36 15.36h501.76c8.704 0 15.36-6.656 15.36-15.36s-6.656-15.36-15.36-15.36zM755.712 825.344h-501.76c-8.704 0-15.36 6.656-15.36 15.36s6.656 15.36 15.36 15.36h501.76c8.704 0 15.36-6.656 15.36-15.36s-6.656-15.36-15.36-15.36zM755.712 893.952h-501.76c-8.704 0-15.36 6.656-15.36 15.36s6.656 15.36 15.36 15.36h501.76c8.704 0 15.36-6.656 15.36-15.36s-6.656-15.36-15.36-15.36z" p-id="2609"></path></svg>
    }
    const otherDataToDescribe={
        eat:{
            0:{1:"非常差",2:"少",3:'不规律'},
            1:{1:"较少",2:"少",3:'不规律'},
            2:{1:"有时不强",2:"不稳定",3:'略不规律'},
            3:{1:"较好",2:"较正常",3:'规律'},
            4:{1:"好",2:"正常",3:"规律"}
        },
        sleep:{
            0:{1:"<4h",2:"非常差，伴随噩梦，惊醒或其他",3:'有，翻来覆去睡不着'},
            1:{1:"4-5h",2:"比较差，没有得到良好的休息",3:'有'},
            2:{1:"5-6h",2:"一般",3:'在正常入睡时间内'},
            3:{1:"6-7h",2:"较正常",3:'没有'},
            4:{1:"7-9h",2:"很好，起床后活力满满",3:"没有"}
        },
        guilt:{
            0:"非常自责和愧疚",
            1:"有些自责和愧疚",
            2:"有自责和愧疚的感觉，但不多",
            3:"几乎没有",
            4:"完全没有"
        },
        hesitation:{
            0:{1:"明显",2:"明显",3:'明显'},
            1:{1:"较明显",2:"较明显",3:'较明显'},
            2:{1:"有时不强",2:"很少",3:'很少'},
            3:{1:"几乎没有",2:"几乎没有",3:'几乎没有'},
            4:{1:"完全没有",2:"无",3:"无"}
        },
        body:{
            0:"身体不适症状明显，持续的心跳加速、呼吸困难和严重的肌肉紧张。",
            1:"频繁出现心跳加快、呼吸急促、肌肉紧张，感到明显的不适。",
            2:"有时感到一些躯体焦虑，如心跳加速、呼吸急促或身体紧张，情绪有些波动。",
            3:"偶尔感觉到一些躯体焦虑的症状，有轻微的心跳加速或轻微的肌肉紧张，但整体身体状态良好。",
            4:"今天很舒服呢，身体感到放松，心情稳定，完全没有不适感。"
        },
        mental:{
            0:"感到极度的精神焦虑，常常感到无法控制的紧张和担忧，情绪极度不安，严重影响日常生活。",
            1:"经常感到焦虑不安，常常担心未来或遇到的困难，情绪较为紧张，难以平静下来。",
            2:"有时感到焦虑，担忧加剧，情绪波动较大，难以集中注意力或放松。",
            3:"偶尔感到一些轻微的精神焦虑，但整体情绪状态良好。",
            4:"感觉很放松，心情稳定，完全没有精神上的紧张或担忧。"
        }
    }
const circleColor={
    4:'#657346',
    3:"#99AC71",
    2:"#CDDDAB",
    1:'#D97878',
    0:'#FF0000'
}
return (
    <div  style={{ width: '100%', height: '100%' }}>
      
      <div className='moodDetailBox'>
      <div className='leftBox'>
          {weatherData!==null&&<div className="weatherBox">
              <h1>{clickDate}</h1>
              <h3 style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
              {weatherData.weather==="雾"?weatherToSvg.fog:weatherData.weather=="阴"||weatherData.weather=="多云"?weatherToSvg.cloudy:weatherData.weather=="晴"?weatherToSvg.sunny:weatherToSvg.rain}{weatherData.weather}{weatherData.temperature}°C
              </h3>
              
              
          </div>}
          <div className="moodBox">
             
              <h2 style={{display:'flex',justifyContent:'flex-start',alignItems:'center'}}>
                 {userMood=="happy"?moodToSvg.happy:userMood==="depress"?moodToSvg.depress:userMood=="angry"?moodToSvg.angry:moodToSvg.anxiety} {userMood.charAt(0).toUpperCase() + userMood.slice(1)}
              </h2>
             
              <Slider
                min={-5} // Left limit: -5 days
                max={5}  // Right limit: +5 days
                step={1} // Each step is 1 day
                defaultValue={0}
                tooltip={{
                    formatter: (value) => `调整 ${value} 天`,
                }}
                style={{width:'90%'}} marks={marks} included={false}
                onChange={handleSliderChange}
                />
          </div>
          <div className="dairyBox">
              <h2>Diary</h2>
              <p  style={{fontSize:'18px',fontWeight:'bold'}}>
              {userDiary}
              </p>
          </div>
      </div>
      <div className='rightBox'>
      <div className="otherDataBox">
          <div className="circle" style={{ width: '180px', height: '180px' ,backgroundColor:circleColor[userOtherData.eating_value] }}>
              <h2>饮食：{userOtherData.eating_value}</h2>
              <h5>食欲：{otherDataToDescribe.eat[Number(userOtherData.eating_value)][1]}</h5>
              <h5>食量：{otherDataToDescribe.eat[Number(userOtherData.eating_value)][2]}</h5>
              <h5>规律性：{otherDataToDescribe.eat[Number(userOtherData.eating_value)][3]}</h5>
          </div>
          <div className="circle" style={{ marginTop:"7%",width: '190px', height: '190px',backgroundColor:circleColor[userOtherData.sleep_value] }}>
              <h2>睡眠：{userOtherData.sleep_value}</h2>
              <h5>睡眠时常：{otherDataToDescribe.sleep[Number(userOtherData.sleep_value)][1]}</h5>
              <h5>睡眠质量：{otherDataToDescribe.sleep[Number(userOtherData.sleep_value)][2]}</h5>
              <h5>是否有入睡困难：{otherDataToDescribe.sleep[Number(userOtherData.sleep_value)][3]}</h5>
          </div>
          <div className="circle" style={{marginTop:"-10%", width: '160px', height: '160px' ,backgroundColor:circleColor[userOtherData.mental_value]}}>
              <h2>精神焦虑：{userOtherData.mental_value}</h2>
              <h4>{otherDataToDescribe.mental[Number(userOtherData.mental_value)]}</h4>
          </div>
          
          <div className="circle" style={{marginTop:"-8%", width: '150px', height: '150px',backgroundColor:circleColor[userOtherData.body_value] }}>
              <h2>躯体焦虑：{userOtherData.body_value}</h2>
              <h5>{otherDataToDescribe.body[Number(userOtherData.body_value)]}</h5>
          </div>
          <div className="circle" style={{ marginTop:"-10%",width: '160px', height: '160px',backgroundColor:circleColor[userOtherData.guilt_value] }}>
              <h2>罪恶感：{userOtherData.guilt_value}</h2>
              <h3>{otherDataToDescribe.guilt[Number(userOtherData.guilt_value)]}</h3>

          </div>
          <div className="circle" style={{marginTop:"-6%", width: '200px', height: '200px',backgroundColor:circleColor[userOtherData.hesitation_value] }}>
              <h2>精神运动性迟缓：{userOtherData.hesitation_value}</h2>
              <h5>语言迟缓：{otherDataToDescribe.hesitation[Number(userOtherData.hesitation_value)][1]}</h5>
              <h5>动作迟缓：{otherDataToDescribe.hesitation[Number(userOtherData.hesitation_value)][2]}</h5>
              <h5>思维迟缓：{otherDataToDescribe.hesitation[Number(userOtherData.hesitation_value)][3]}</h5>
          </div>
      </div>

      </div>
      </div>
     
      
    </div>
  );
}


export default MoodDetailPage;
