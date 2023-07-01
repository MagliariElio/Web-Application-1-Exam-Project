import React, { useContext } from 'react';
import { MdHome, MdExitToApp, MdAdd } from 'react-icons/md';
import { Button, Card, CardActions, CardContent, Divider, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { LoggedUserContext, PagesListContext } from '../context/Context';

/**
 * This is component of Card showed on the left of the display
 * 
 * @param {*} loggedUser info about user logged
 * @param viewMode view mode is used to understand how to view data, in view mode or in user mode. 
 *                  When it is 0 it means user mode, while if 1 means view mode
 */
function LeftCardView({ loggedUser, viewMode }) {
    const { logout } = useContext(LoggedUserContext);
    const { frontOfficeSwitch } = useContext(PagesListContext);

    return (
        <Card sx={{
            paddingTop: '30px', paddingBottom: '30px', width: '300px',
            maxWidth: '300px', maxHeight: '550px', borderRadius: '10px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center',
            boxShadow: '0px 3px 15px rgba(0, 0, 0, 0.2)', border: '1px solid #ccc'
        }}>

            <CardContent>
                <Typography variant="h5" component="h2" style={{ paddingBottom: '20px', fontWeight: 'bold' }}>
                    {viewMode === undefined && "Welcome, "}{loggedUser && loggedUser.username}
                </Typography>
                <Divider />
                {
                    loggedUser &&
                    <>
                        <Typography color="textSecondary" gutterBottom style={{ paddingTop: '20px' }}>
                            Email: {loggedUser.email}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                            Name: {loggedUser.name}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom style={{ paddingBottom: '20px' }}>
                            Surname: {loggedUser.surname}
                        </Typography>
                    </>
                }
                <Divider />
                <Typography color="textSecondary" gutterBottom style={{ paddingTop: '20px' }}>
                    Pages Created: {loggedUser !== null ? loggedUser.number_pages_created : 0}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                    Pages Published: {loggedUser !== null ? loggedUser.number_pages_published : 0}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                    Pages Removed: {loggedUser !== null ? loggedUser.number_pages_removed : 0}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                    Pages Draft: {loggedUser !== null ? loggedUser.number_pages_draft : 0}
                </Typography>
                <Typography color="textSecondary" gutterBottom style={{ paddingBottom: '20px' }}>
                    Pages Programmed: {loggedUser !== null ? loggedUser.number_pages_programmed : 0}
                </Typography>
                <Divider />
            </CardContent>

            <CardActions style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '20px' }}>
                <Grid container spacing={2} direction={'column'}>
                    <Grid item>
                        <Button component={Link} to={'/'} variant="contained" color="warning" startIcon={<MdHome />}>
                            Home
                        </Button>
                    </Grid>
                    {
                        // in view mode and front office mode, the action is disabled
                        !viewMode && !frontOfficeSwitch &&
                        <>
                            <Grid item>
                                <Button component={Link} to={'/pages/add'} variant="contained" color="primary" startIcon={<MdAdd />}>
                                    Add Page
                                </Button>
                            </Grid>

                            <Grid item>
                                <Button onClick={logout} variant="contained" color="secondary" startIcon={<MdExitToApp />}>
                                    Logout
                                </Button>
                            </Grid>
                        </>
                    }
                </Grid>
            </CardActions>
        </Card>
    );
}

export default LeftCardView;