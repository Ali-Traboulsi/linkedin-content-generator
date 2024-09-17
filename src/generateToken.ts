// import axios from 'axios';

// export const generateAccessToken = async (authCode: string) => {
//     const params = new URLSearchParams();
//     params.append('grant_type', 'authorization_code');
//     params.append('code', authCode);
//     params.append('redirect_uri', 'http://localhost:5000/api');
//     params.append('client_id', '77c390pw5dz0kp');

//     try {
//         const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params);
//         console.log('Access Token:', response.data.access_token);
//     } catch (error) {
//         console.error('Error fetching access token:', error);
//     }
// };

// generateAccessToken('Auth')
