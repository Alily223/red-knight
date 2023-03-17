import React, { createContext , useContext, useState, useEffect} from 'react';

const AppContext = createContext();

export default function AppWrapper({children}) {
    // --------------------------------
    // States
    // --------------------------------

    // --------------------------------
    // Variables
    // --------------------------------
    const directory = 'http://127.0.0.1:5000';


    // --------------------------------
    // custom functions
    // --------------------------------


    // --------------------------------
    // Function Listeners
    // --------------------------------


    // --------------------------------
    // Shared Exports
    // --------------------------------
    let sharedState = {
        // --------------------------------
        // Shared Function Exports
        // --------------------------------
        // setUserName: value => setUserName(value),
        // setUserFirstName: value => setUserFirstName(value),
        // setUserLastName: value => setUserLastName(value),
        // setUsersCredits: value => setUsersCredits(value),
        // setUserLoggedIn: value => setUserLoggedIn(value),


        // --------------------------------
        // Shared Variable Exports
        // --------------------------------
        directory: directory,
        // userName: userName,
        // userFirstName: userFirstName,
        // userLastName: userLastName,
        // usersCredits: usersCredits,
        // userLoggedIn: userLoggedIn,
    }

    return  <AppContext.Provider value={sharedState}>{children}</AppContext.Provider>
}

export function useAppContext() {
    return useContext(AppContext);
}