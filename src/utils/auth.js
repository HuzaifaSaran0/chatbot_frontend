export function saveToken(token) {
    localStorage.setItem("authToken", token);
}

export function getToken() {
    return localStorage.getItem("authToken");
}

export function removeToken() {
    localStorage.removeItem("authToken");
}

export function isAuthenticated() {
    return !!getToken();
}

// import { getToken } from './auth';

export async function fetchUserProfile() {
    const token = getToken();
    if (!token) return null;

    const res = await fetch("https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/auth/user/", {


        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        },
    });
    if (res.ok) {
        return await res.json(); // contains email, etc.
    } else {
        return null;
    }
}

