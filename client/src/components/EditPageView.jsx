import React, { useContext, useEffect, useState } from 'react';
import { LoggedUserContext } from '../context/Context';
import { Grid } from '@mui/material';
import GeneralPageView from './GeneralPageView';
import { useParams } from 'react-router-dom';
import { API } from '../API';

function EditPageView() {
    const { id = '' } = useParams('id');                        // page id to fetch
    const [page, setPage] = useState({});                       // page fetched
    const [pageLoaded, setPageLoaded] = useState(false);        // it is used in order to call the GeneralPageView component when we already have the page fetched from the server, so we have the response 
    const { handleErrors } = useContext(LoggedUserContext);
    
    useEffect(() => {
        API.fetchPageById(id)
            .then(page => {
                setPage(page);
                setPageLoaded(true);
            })
            .catch(err => handleErrors(
                err.map((errorMessage) => { return { message: errorMessage, status: 'error' } })));

    }, [id]);

    return (
        <Grid container>
            {
                pageLoaded &&
                <GeneralPageView pageFetched={page}
                    userViewLeftCard={page.user} viewMode={false} />
            }
            {/* frontOfficeSwitch is always false because it is a back office operation  */}
        </Grid>
    );
}

export default EditPageView;