import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Box, Card, CardContent, CardHeader, CardMedia, CircularProgress, Container, Grid, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MdDelete, MdEdit, MdMoreHoriz } from 'react-icons/md';
import { API } from '../API';
import { LoggedUserContext, PagesListContext } from '../context/Context';

/**
 * Page Table in the Home Page
 */
function PageTable() {
    const { dirtyPages, pagesListFrontOffice } = useContext(PagesListContext);

    return (
        <Container maxWidth="lg">
            <Grid container spacing={3} justifyContent='flex-start' alignItems='center'>
                <>
                    {
                        dirtyPages ?
                            <Grid item>
                                <CircularProgress size={100} />
                            </Grid>
                            :
                            pagesListFrontOffice.map((page, index) => (
                                <Grid item xs={12} sm={7} md={7} lg={6} key={index}>
                                    <PageCard page={page} />
                                </Grid>
                            ))
                    }
                </>
                <Grid item> {/* In case of no Pages Published */}
                    {pagesListFrontOffice.length === 0 && (
                        <Typography>
                            No pages have been published yet!
                        </Typography>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
}

function PageCard(props) {
    const navigate = useNavigate();

    const [indexCurrentImage, setIndexCurrentImage] = useState(0);
    const [images, setImages] = useState(props.page.contents.filter(content => content.image !== undefined));
    const lengthContentsImage = props.page.contents.filter(content => content.image !== undefined).length;
    const { frontOfficeSwitch, setDirtyPages } = useContext(PagesListContext);

    const [anchorEl, setAnchorEl] = useState(null);                         // it is used for the menu of the page (edit, delete)
    const { loggedUser, handleErrors } = useContext(LoggedUserContext);

    // handle for previous click on image
    const handlePrevClick = () => {
        setIndexCurrentImage((indexCurrentImage - 1 + lengthContentsImage) % lengthContentsImage);
    };

    // handle for next click on image
    const handleNextClick = () => {
        setIndexCurrentImage((indexCurrentImage + 1) % lengthContentsImage);
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // it manages the click on edit from the menu
    const handleClickMenuEdit = () => {
        setAnchorEl(null);
        navigate(`pages/${props.page.id}/edit`);
    };

    /**
     * This useEffect is absolutely necessary because a very strange bug 
     * occurs when you delete a page, all subsequent pages no longer display images.
     * In this way, it will refresh the images automatically, otherwise we need to refresh the page.
     */
    useEffect(() => {
        setImages(props.page.contents.filter(content => content.image !== undefined));  //this is for the deletion bug

        // this will automatically change the images
        const timeout = Math.random() + (7000 - 5000) + 5000;       // this will set the timeout randomically
        const interval = setInterval(() => { setIndexCurrentImage((indexCurrentImage + 1) % lengthContentsImage); }, timeout);
        return () => clearInterval(interval);
    }, [props.page, indexCurrentImage, lengthContentsImage]);

    // it manages the click on delete from the menu
    const handleClickMenuDelete = () => {
        setAnchorEl(null);
        API.deletePage(props.page.id)
            .then(() => {
                setDirtyPages(true);                // dirty bit true, it will fetch all new pages from the system
                handleErrors([{ message: 'Page Removed Successfully!', status: 'warning' }]);
            })
            .catch(err => handleErrors(
                err.map((errorMessage) => { return { message: errorMessage, status: 'error' } })));
    };

    return (
        <Card
            elevation={3}
            sx={{
                width: '100%', minHeight: '200px', maxHeight: '500px',
                background: '#fff', boxShadow: '0px 3px 15px rgba(0, 0, 0, 0.2)',
                borderRadius: '20px', border: '1px solid #ccc'
            }}>

            <CardHeader
                action={
                    <div>
                        {
                            !frontOfficeSwitch && loggedUser &&
                            ((props.page.user && (loggedUser.id === props.page.user.id)) || loggedUser.role === 1) &&
                            <>
                                <IconButton aria-label="menu" onClick={handleMenuClick}>
                                    <MdMoreHoriz />
                                </IconButton>
                                <Menu
                                    id="actions-card"
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={handleClickMenuEdit} style={{ color: '#333' }}><MdEdit />Edit</MenuItem>
                                    <MenuItem onClick={handleClickMenuDelete} style={{ color: '#333' }}><MdDelete />Delete</MenuItem>
                                </Menu>
                            </>
                        }
                    </div>
                }

                style={{ cursor: 'pointer' }}
                avatar={
                    <Avatar aria-label="image-author" onClick={() => navigate(`pages/${props.page.id}`)}>
                        <MyTooltip tip={"Author Image"} data={props.page.user.username.charAt(0).toUpperCase()} />
                    </Avatar>
                }

                title={
                    <span onClick={() => navigate(`pages/${props.page.id}`)}>
                        <MyTooltip tip={"Title of the page"}
                            data={
                                <Typography>
                                    {props.page.title}
                                </Typography>
                            }
                        />
                    </span>
                }
                subheader={
                    <span onClick={() => navigate(`pages/${props.page.id}`)}>
                        <MyTooltip tip={"Creation date of the page"}
                            onClick={() => navigate(`pages/${props.page.id}`)}
                            data={format(new Date(props.page.creation_date), 'd, MMMM yyyy', { locale: enUS })} />
                    </span>}
            />

            {
                lengthContentsImage !== 0 &&
                <Grid container spacing={0} alignItems={'center'}>
                    <Grid item xs={1}>
                        <IconButton onClick={handlePrevClick} disabled={indexCurrentImage === 0}>
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </IconButton>
                    </Grid>
                    <Grid item xs={10}>
                        {
                            images && images.length > 0 && indexCurrentImage != undefined
                            && images[indexCurrentImage] && images[indexCurrentImage].image &&
                            <CardMedia
                                key={images[indexCurrentImage].image.src}
                                component="img"
                                alt={images[indexCurrentImage].image.alt}
                                height="250"
                                image={images[indexCurrentImage].image.src}
                                title={images[indexCurrentImage].image.title}
                                style={{
                                    borderRadius: '10px',
                                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                                    transition: "opacity 0.5s ease-in-out",
                                    opacity: 1,
                                    transform: 'scale(1)'
                                }}
                            />
                        }
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton onClick={handleNextClick} disabled={indexCurrentImage === (images.length - 1)}>
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                            </svg>
                        </IconButton>
                    </Grid>
                </Grid>
            }

            <CardContent
                onClick={() => navigate(`pages/${props.page.id}`)}
                style={{ margin: '16px', cursor: 'pointer' }}>
                {
                    props.page.contents.filter(content => content.paragraph != undefined).slice(0, 2).map((content, index) => (
                        <Typography variant="body2" color="text.secondary" key={index}>
                            <li key={index}>
                                <MyTooltip tip={"This is one paragraph of the page"}
                                    data={content.paragraph.split(" ").splice(0, 7).join(" ") + (content.paragraph.split(" ").length > 7 ? '...' : '')} />
                            </li>
                        </Typography>

                    ))
                }
                {
                    props.page.contents.length > 2 && (
                        <Typography variant="body2" color="text.secondary">
                            <li>
                                {"Other..."}
                            </li>
                        </Typography>
                    )
                }
                <Box mt={3} style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography variant='body2' color="text.secondary" align='left' style={{ flex: 1 }}>
                        <MyTooltip tip={"Status page"} data={props.page.status/*getReleaseDateStatus()*/} />
                    </Typography>
                    <Typography variant='body2' color="text.secondary" align='right' style={{ flex: 1 }}>
                        <MyTooltip tip={"Release date of the page"}
                            data={props.page.release_date === null ? '' : format(new Date(props.page.release_date), 'd, MMMM yyyy', { locale: enUS })} />
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

/**
 * Tool used to tip something
 */
function MyTooltip(props) {
    return (
        <OverlayTrigger
            placement="top"
            overlay={<Tooltip style={{
                position: 'absolute',
                backgroundColor: '#fff',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                transform: 'translate(-50%, -110%) rotate(-10deg)',
                padding: '10px 20px',
                fontSize: '14px',
                lineHeight: '1.5',
                textAlign: 'center',
                color: '#333'
            }}>{props.tip}</Tooltip>}>
            <span>
                {props.data}
            </span>
        </OverlayTrigger>
    );
}


export default PageTable;