import axios from 'axios';
//import { showAlert } from './alerts';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:3000/login',
            data: {
                email,
                password
            }
        });
        if (res.data.status === 'success') {
            window.location.assign("/repository")
        }
    } catch (err) {
        console.log(err.response.data.message)
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://localhost:3000/logout'
        });
        if ((res.data.status = 'success')) location.reload();
    } catch (err) {
        console.log(err.response);
    }
};