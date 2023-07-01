import React, { useContext } from 'react';
import PageTable from './PageTable';
import { Alert, Container, Grid } from '@mui/material';
import LeftCardView from './LeftCardView';
import { LoggedUserContext } from '../context/Context';

function HomePageView() {
    const { loggedUser, errors, handleErrors } = useContext(LoggedUserContext);

    return (
        <Grid container>
            {loggedUser &&
                <Grid item xs={12} md={3} style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
                    <LeftCardView loggedUser={loggedUser} viewMode={undefined} />   { /* Left sidebar */}
                </Grid>
            }

            <Grid item xs={loggedUser ? 9 : 12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <main>
                    <Container maxWidth="lg" style={{ maxWidth: '100%', overflow: 'auto' }}>
                        <Grid container style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {
                                errors &&
                                errors.map((error, index) => {
                                    return (
                                        <Grid item xs={12} key={index} style={{ maxWidth: '85%', marginBottom: '20px' }}>
                                            <Alert onClose={() => handleErrors(undefined)} severity={error.status} style={{ borderRadius: '20px' }}>{error.message}</Alert>
                                        </Grid>
                                    );
                                })
                            }
                            <Grid item xs={12}>
                                <PageTable />   {/* Pages List */}
                            </Grid>
                        </Grid>
                    </Container>
                </main>
            </Grid>
        </Grid>
    );
}

export default HomePageView;