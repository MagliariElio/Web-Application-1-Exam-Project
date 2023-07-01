import { Grid } from '@mui/material';
import React, { useContext } from 'react';
import GeneralPageView from './GeneralPageView';
import { LoggedUserContext } from '../context/Context';

function AddPageView() {
    const { loggedUser } = useContext(LoggedUserContext);
    return (
        <Grid container>
            <GeneralPageView pageFetched={{ id: -1, title: '', release_date: '', contents: [], user: loggedUser }}
                userViewLeftCard={loggedUser} viewMode={false} />
        </Grid>
    );
}

export default AddPageView;