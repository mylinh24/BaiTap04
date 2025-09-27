import axios from './axios.customize';

const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    const data = {
        name, email, password
    };

    return axios.post(URL_API, data);
}

const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    const data = {
        email, password
    };

    return axios.post(URL_API, data);
}

const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.get(URL_API);
}

// Favorites
const addFavoriteApi = (songId) => {
    const URL_API = `/v1/api/songs/${songId}/favorite`;
    return axios.post(URL_API);
}

const removeFavoriteApi = (songId) => {
    const URL_API = `/v1/api/songs/${songId}/favorite`;
    return axios.delete(URL_API);
}

const getFavoritesApi = () => {
    const URL_API = "/v1/api/songs/favorites";
    return axios.get(URL_API);
}

const isFavoriteApi = (songId) => {
    const URL_API = `/v1/api/songs/${songId}/is-favorite`;
    return axios.get(URL_API);
}

// Listened
const addListenApi = (songId) => {
    const URL_API = `/v1/api/songs/${songId}/listen`;
    return axios.post(URL_API);
}

const getListenedApi = () => {
    const URL_API = "/v1/api/songs/listened";
    return axios.get(URL_API);
}

const getListenCountApi = (songId) => {
    const URL_API = `/v1/api/songs/${songId}/listen-count`;
    return axios.get(URL_API);
}

// Similar
const getSimilarSongsApi = (songId) => {
    const URL_API = `/v1/api/songs/${songId}/similar`;
    return axios.get(URL_API);
}

// Comments
const addCommentApi = (songId, comment) => {
    const URL_API = `/v1/api/songs/${songId}/comments`;
    const data = { comment };
    return axios.post(URL_API, data);
}

const getCommentsApi = (songId) => {
    const URL_API = `/v1/api/songs/${songId}/comments`;
    return axios.get(URL_API);
}

const deleteCommentApi = (commentId) => {
    const URL_API = `/v1/api/comments/${commentId}`;
    return axios.delete(URL_API);
}

// Search
const getSearchApi = (params) => {
    const URL_API = "/v1/api/search";
    return axios.get(URL_API, { params });
}

export {
    createUserApi, loginApi, getUserApi,
    addFavoriteApi, removeFavoriteApi, getFavoritesApi, isFavoriteApi,
    addListenApi, getListenedApi, getListenCountApi,
    getSimilarSongsApi,
    addCommentApi, getCommentsApi, deleteCommentApi,
    getSearchApi
}
