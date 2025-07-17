import axios from 'axios';

const API_URL = 'http://192.168.50.116:8000/api/token/';

export async function login(username: string, password: string) {
  return axios.post(API_URL, { username, password });
}