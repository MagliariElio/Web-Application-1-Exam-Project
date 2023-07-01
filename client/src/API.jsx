const SERVER_HOST = "http://localhost";
const SERVER_PORT = 3001;

const SERVER_URL = `${SERVER_HOST}:${SERVER_PORT}/api/`;

/**
 * Generic API call
 *
 * @param endpoint API endpoint string to fetch
 * @param method HTTP method
 * @param body HTTP request body string
 * @param headers additional HTTP headers to be passed to 'fetch'
 * @param expectResponse wheter to expect a non-empty response body
 * 
 * @returns whatever the specified API endpoint returns
 */
const APICall = async (endpoint, method = "GET", body = undefined, headers = undefined, expectResponse = true) => {
    let errors = [];

    try {
        const response = await fetch(new URL(endpoint, SERVER_URL), {
            method,
            body,
            headers,
            credentials: "include"
        });

        if (response.ok) {
            if (expectResponse) {
                return await response.json();
            }
        }
        else errors = (await response.json()).errors;
    } catch (errs) {
        const err = ["Failed to contact the server"];
        throw err;
    }

    if (errors && errors.length !== 0)
        throw errors;
};

/**
 * Attempts to login the user
 * 
 * @param email email of the user
 * @param password password of the user
 */
const login = async (email, password) => await APICall(
    "session",
    "POST",
    JSON.stringify({ 'username': email, password }),
    { "Content-Type": "application/json" }
);

/**
* Logout.
* This function can return a "Not authenticated" error if the student wasn't authenticated beforehand
*/
const logout = async () => await APICall("session", "DELETE", undefined, undefined, false);

/**
 * Load all pages from the server
 * 
 * @returns list of pages
 */
const fetchPages = async () => {
    return await APICall("pages");
};

/**
 * Load all image paths from the server
 * 
 * @returns list of image paths
 */
const fetchImages = async () => {
    return await APICall("images");
};

/**
 * Fetch page with specified id
 * 
 * @param id page id to fetch
 */
const fetchPageById = async (id) => {
    return await APICall(`pages/${id}`);
}

/**
 * Create a new Page
 * 
 * @param page obj with information to add to the system
 */
const createPage = async (page) => {
    return await APICall("pages", "POST", JSON.stringify(page), { "Content-Type": "application/json" }, false);
}

/**
 * Get the user info if he is logged in
 */
const fetchCurrentUser = async () => {
    return await APICall("session/current");
}

/**
 * Delete the page with the specified id
 * 
 * @param page_id page id to remove
 */
const deletePage = async (page_id) => {
    return await APICall(`pages/${page_id}`, "DELETE", undefined, undefined, false);
}

/**
 * Edit the page with new information
 * 
 * @param page obj with new information 
 */
const editPage = async (page) => {
    return await APICall(`pages/${page.id}`, "PUT", JSON.stringify(page), { 'Content-Type': 'application/json' }, false);
}

/**
 * Update the new website name
 * 
 * @param website_name website name
 */
const saveWebsiteName = async (website_name) => {
    return await APICall('websitename', 'PUT', JSON.stringify({ website_name }), { 'Content-Type': 'application/json' }, false);
}

/**
 * Get the website name from the server
 */
const fetchWebsiteName = async () => {
    return await APICall('websitename');
}

/**
 * Get all users
 */
const fetchUsers = async () => {
    return await APICall('users');
}

const API = {
    login,
    logout,
    fetchPages,
    fetchImages,
    fetchPageById,
    createPage,
    fetchCurrentUser,
    deletePage,
    editPage,
    saveWebsiteName,
    fetchWebsiteName,
    fetchUsers
}

export { API };