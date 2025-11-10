import { ethers } from "ethers";


export const getGPSCoordinates = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          reject(new Error("Unable to retrieve your location"));
        }
      );
    }
  });
};


export const formatLocationProof = (lat, lon) => {
  
  const latFixed = lat.toFixed(4);
  const lonFixed = lon.toFixed(4);
  return `LAT:${latFixed},LON:${lonFixed}`;
};


export const hashLocationProof = (locationProof) => {
  
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(locationProof));
};