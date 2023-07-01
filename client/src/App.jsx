import { useContext, useEffect, useState } from 'react';
import './App.css';
import { LoginForm } from './components/LoginFormView';
import { BrowserRouter, Link, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { API } from './API';
import HomePageView from './components/HomePageView';
import { AppBar, Toolbar, Typography, Grid, Button, TextField, CircularProgress, Box, Container, Switch, FormControlLabel } from '@mui/material';
import { MdErrorOutline, MdHome, MdLockOpen, MdSave } from 'react-icons/md';
import PageView from './components/PageView';
import AddPageView from './components/AddPageView';
import { LoggedUserContext, LoggedUserProvider, ImagesListContext, ImagesListProvider, UsersListContext, UsersListProvider, PagesListContext, PagesListProvider } from './context/Context';
import EditPageView from './components/EditPageView';


/**
 * App function
 */
function App() {
  return (
    <BrowserRouter>
      <PagesListProvider>
        <LoggedUserProvider>
          <ImagesListProvider>
            <UsersListProvider>
              <Main />
            </UsersListProvider>
          </ImagesListProvider>
        </LoggedUserProvider>
      </PagesListProvider>
    </BrowserRouter>
  );
}

/**
 * Main function
 */
function Main() {
  const [dirtyImagesList, setDirtyImagesList] = useState(true);                         // dirty bit for images list
  const [dirtyUsersList, setDirtyUsersList] = useState(true);                           // dirty bit for users list
  const { loggedUser, setLoggedUser, handleErrors } = useContext(LoggedUserContext);    // context for logged user  
  const { setImagesList } = useContext(ImagesListContext);                              // context for images list
  const { setUsersList } = useContext(UsersListContext);                                // context for users list
  const { pagesList, setPagesList, setPagesListFrontOffice, frontOfficeSwitch, dirtyPages, setDirtyPages } = useContext(PagesListContext);

  /**
   * Load all pages from the server when it is necessary
   */
  useEffect(() => {
    API.fetchCurrentUser()                        // reload current session, it gets the user information from the server
      .then(user => setLoggedUser(user))
      .catch(err => handleErrors(
        err.map((errorMessage) => { return { message: errorMessage, status: 'error' } })));

    // load all pages
    if (dirtyPages === true) {       // only the first time or if a page is modified they will be loaded
      API.fetchPages()
        .then(pages => {
          setPagesList(pages);
          setDirtyPages(false);
        })
        .catch(err => handleErrors(
          err.map((errorMessage) => { return { message: errorMessage, status: 'error' } })));
    }

    //load all images
    if (dirtyImagesList === true) {
      API.fetchImages()
        .then(images => {
          setImagesList(images);
          setDirtyImagesList(false);
        })
        .catch(err => handleErrors(
          err.map((errorMessage) => { return { message: errorMessage, status: 'error' } })));
    }

    //load all users
    if (dirtyUsersList === true) {
      API.fetchUsers()
        .then(users => {
          setUsersList(users);
          setDirtyUsersList(false);
        })
        .catch(err => handleErrors(
          err.map((errorMessage) => { return { message: errorMessage, status: 'error' } })));
    }

    // it will filter the pages if it is in front office mode
    if (frontOfficeSwitch === true) {
      const current_date = new Date();
      setPagesListFrontOffice(pagesList.filter((page) => ((page.release_date !== null) &&
        (new Date(page.release_date) <= current_date)
      )));
    } else {  // otherwise it sets all pages for the back office mode
      setPagesListFrontOffice(pagesList);
    }

  }, [dirtyPages, dirtyImagesList, dirtyUsersList, frontOfficeSwitch]);

  return (
    <>
      {/* Navbar */}
      <NavbarComponent />

      <Routes>
        <Route path='/' element={<PageLayout />} >
          <Route index path='' element={<HomePageView />} />
          <Route path='/login' element={<LoginForm />} />
          <Route path='/pages/add' element={
            (loggedUser !== null && !frontOfficeSwitch) ? <AddPageView /> : <UnAuthorizationPage />} />
          <Route path='/pages/:id' element={<PageView />} />
          <Route path='/pages/:id/edit' element={
            (loggedUser !== null && !frontOfficeSwitch) ? <EditPageView /> : <UnAuthorizationPage />} />
        </Route>

        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

function PageLayout() {
  return (
    <Grid container spacing={0} style={{ paddingTop: '40px', minHeight: '100vh', position: 'relative', paddingBottom: '70px' }}>
      <Grid item xs={12} marginBottom='30px'>
        <Outlet />
      </Grid>
      <Grid item style={{ position: 'absolute', bottom: 0, paddingTop: '200px' }}>
        <footer style={{ padding: '20px' }}>
          <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} maxWidth='lg'>
            <Grid item paddingRight={'20px'}>
              <img src='/src/img/icon/logo.svg' alt='logo' />
            </Grid>
            <Grid item>
              <Typography variant='body2' color='textSecondary' align='center'>
                &copy; {new Date().getFullYear()} All rights reserved. Developed by Elio Magliari.
              </Typography>
            </Grid>
          </Container>
        </footer>
      </Grid>
    </Grid>
  );
}

/**
 * This is shown when the user is not allowed to access that page
 */
function UnAuthorizationPage() {
  return (
    <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
      <Grid container justify="center">
        <div style={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <MdErrorOutline fontSize="inherit" />
            {' '}
            Access Not Authorized
            {' '}
            <MdErrorOutline fontSize="inherit" />
          </Typography>
          <Typography variant="body1" paragraph>
            You are not allowed to access this page, please go back to the{' '}
            <Link to="/">home</Link>.
          </Typography>
        </div>
      </Grid>
    </div>
  );
}

/**
 * Navbar component
 */
function NavbarComponent() {
  const { loggedUser, handleErrors } = useContext(LoggedUserContext);
  const [editingWebsiteName, setEditingWebsiteName] = useState(false);
  const [websiteName, setWebsiteName] = useState('');
  const [dirtyWebsiteName, setDirtyWebsiteName] = useState(true);         // dirty bit for website name
  const { frontOfficeSwitch, setFrontOfficeSwitch } = useContext(PagesListContext);

  const navigate = useNavigate();

  // load the website name from the server
  useEffect(() => {
    if (dirtyWebsiteName === true) {
      API.fetchWebsiteName()
        .then(websitename => {
          setWebsiteName(websitename.website_name);
          setDirtyWebsiteName(false);
        })
        .catch(err => handleErrors(
          err.map((errorMessage) => { return { message: errorMessage, status: 'error' } })));
    }
  }, [dirtyWebsiteName]);

  // manage the saving of the website name 
  const handleSave = () => {
    setEditingWebsiteName(false);

    API.saveWebsiteName(websiteName)      // save the website name
      .then(() => {
        setDirtyWebsiteName(true);
      })
      .catch(err => handleErrors(
        err.map((errorMessage) => { return { message: errorMessage, status: 'error' } })));
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between', justifyItems: 'center' }}>
        {
          dirtyWebsiteName ?
            <CircularProgress color='error' size={50} style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', opacity: 0.8 }} /> :
            ((editingWebsiteName == true) && (loggedUser && loggedUser.role == 1)) ?
              <Box display='flex' alignItems='center'>
                <TextField
                  value={websiteName}
                  onChange={(event) => setWebsiteName(event.target.value)}
                  variant="outlined"
                  InputProps={{
                    style: {
                      backgroundColor: '#f6f6f6',
                      borderRadius: '4px',
                      boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                />
                <Button variant="contained" color="error" startIcon={<MdSave />} onClick={handleSave} style={{ marginLeft: '5px' }}>Save</Button>
              </Box>
              : <span onClick={() => setEditingWebsiteName(true)}><Typography variant="h6">{websiteName}</Typography></span>
        }

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {loggedUser && <FormControlLabel
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              padding: '5px'
            }}
            control={<Switch color='error' />}
            label={frontOfficeSwitch ? "Front-Office" : "Back-Office"}
            onChange={() => setFrontOfficeSwitch(!frontOfficeSwitch)}
          />}
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            <Button variant="contained" color="warning" startIcon={<MdHome />} style={{ marginRight: '10px' }}>Home</Button>
          </Link>
          {!loggedUser && (
            <Button variant="contained" color="secondary" style={{ marginLeft: 'auto' }} startIcon={<MdLockOpen />} onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </div>

      </Toolbar>
    </AppBar>
  );
}


/**
 * Informs the user that the route is not valid
 */
function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        <MdErrorOutline fontSize="inherit" />
        {' '}
        The page cannot be found
        {' '}
        <MdErrorOutline fontSize="inherit" />
      </Typography>
      <Typography variant="body1" paragraph>
        The requested page does not exist, please go back to the{' '}
        <Link to="/">home</Link>.
      </Typography>
    </div>
  );
}

export default App
