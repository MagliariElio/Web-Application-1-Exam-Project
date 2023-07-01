import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../API";

export const LoggedUserContext = createContext();       // context for logged user
export const ImagesListContext = createContext();       // context for images list
export const UsersListContext = createContext();        // context for users list
export const PagesListContext = createContext();        // context for pages list

/**
 * Context used to get the pages from the system
 */
export const PagesListProvider = ({ children }) => {
    const [pagesList, setPagesList] = useState([]);                         // list of pages
    const [pagesListFrontOffice, setPagesListFrontOffice] = useState([]);   // list of filtered pages in according the switch 
    const [frontOfficeSwitch, setFrontOfficeSwitch] = useState(false);      // front office bit (true = front office, false = back office), it allows us to understand which mode is activate (front office mode or back office mode)
    const [dirtyPages, setDirtyPages] = useState(true);                     // dirty bit for pages to load and it is used also for the spinner

    return (
        <PagesListContext.Provider value={{ pagesList, setPagesList, pagesListFrontOffice, setPagesListFrontOffice, frontOfficeSwitch, setFrontOfficeSwitch, dirtyPages, setDirtyPages }} >
            {children}
        </PagesListContext.Provider>
    );
}

/**
 * Context used to get the user logged in the system
 */
export const LoggedUserProvider = ({ children }) => {
    const navigate = useNavigate();
    const [loggedUser, setLoggedUser] = useState(null);
    const [errors, setErrors] = useState(undefined);                          // list of errors
    const { setFrontOfficeSwitch, setDirtyPages } = useContext(PagesListContext);

    /**
     * This handle has the responsability to manage all errors in the system 
     */
    const handleErrors = (error) => {
        let errorsList = error;

        if (errorsList !== undefined) {
            errorsList = errorsList.filter(e => e.message !== "Must be authenticated to make this request!");
        }

        setErrors(errorsList);
        console.clear();
    }

    /**
       * Perform the login
       * 
       * @param email email of the user
       * @param password password of the user
       * @param onFinish optional callback to be called on login success or fail
       */
    const login = async (email, password) => {
        await API.login(email, password)
            .then(user => {
                //handleErrors(undefined);
                setLoggedUser(user);
                setDirtyPages(true);
                navigate('/');
            })
            /*.catch(err => {
                //handleErrors(undefined);
                //handleErrors(err);
                throw err;
            })*/;
    };

    /**
     * Perform the logout
     */
    const logout = () => {
        API.logout()
            .then(() => {
                handleErrors(undefined);    // clean all errors
            })
            .catch(err => {
                handleErrors(undefined);
                handleErrors([err]);
            }).finally(() => {
                setLoggedUser(null);        // delete the state for the logged user
                setDirtyPages(true);        // it loads all pages
                setFrontOfficeSwitch(true); // it sets front office bit
                navigate('/');
            });
    };

    return (
        <LoggedUserContext.Provider value={{ loggedUser, logout, login, setLoggedUser, errors, handleErrors }} >
            {children}
        </LoggedUserContext.Provider>);
}

/**
 * Context used to get the images from the system
 */
export const ImagesListProvider = ({ children }) => {
    const [imagesList, setImagesList] = useState([]);

    return (
        <ImagesListContext.Provider value={{ imagesList, setImagesList }} >
            {children}
        </ImagesListContext.Provider>
    );
}

/**
 * Context used to get the users from the system 
 */
export const UsersListProvider = ({ children }) => {
    const [usersList, setUsersList] = useState([]);

    return (
        <UsersListContext.Provider value={{ usersList, setUsersList }} >
            {children}
        </UsersListContext.Provider>
    );
}