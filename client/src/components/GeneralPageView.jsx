import { Alert, Avatar, Button, CardActions, CardContent, CardHeader, CardMedia, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import React, { useContext, useState } from 'react';
import LeftCardView from './LeftCardView';
import { Card } from 'react-bootstrap';
import { API } from '../API';
import { useNavigate } from 'react-router-dom';
import { ImagesListContext, LoggedUserContext, PagesListContext, UsersListContext } from '../context/Context';
import { MdAdd, MdArrowCircleDown, MdArrowCircleUp } from 'react-icons/md';

function GeneralPageView({ pageFetched, userViewLeftCard, viewMode }) {
    const [title, setTitle] = useState(pageFetched.title);
    const [releaseDate, setReleaseDate] = useState(pageFetched.release_date);
    const [author, setAuthor] = useState(pageFetched.user);
    const [contents, setContents] = useState(pageFetched.contents);
    const [msgError, setMsgError] = useState('');
    const [disableConfirmBtn, setDisableConfirmBtn] = useState(true);

    const { loggedUser, handleErrors } = useContext(LoggedUserContext);
    const { usersList } = useContext(UsersListContext);
    const { setDirtyPages } = useContext(PagesListContext);

    const navigate = useNavigate();

    /**
     * This has the responsability to handle the submit form and send it to the server
     */
    const handleSubmit = (event) => {
        event.preventDefault();

        if (title === '') {
            setDisableConfirmBtn(true);
            setMsgError('The title can not be empty!');
            return;
        } else {
            let date = releaseDate === '' ? undefined : releaseDate;    // easier to manage in the server 
            const page = { id: pageFetched.id, 'title': title, 'release_date': date, 'contents': contents, 'user': author };

            if (page.id === -1) {   // add page to the system
                API.createPage(page)
                    .then(() => {
                        setDirtyPages(true);        // dirty bit setted true, it will fetch the new list 
                        handleErrors([{ message: 'Page Added Successfully!', status: 'success' }]);
                        navigate('/');
                    })
                    .catch(err => setMsgError(err));
            } else {
                API.editPage(page)
                    .then(() => {
                        setDirtyPages(true);        // dirty bit setted true, it will fetch the new list 
                        handleErrors([{ message: 'Page Edited Successfully!', status: 'success' }]);
                        navigate('/');
                    })
                    .catch((err) => setMsgError(err));
            }
        }
    }

    /**
     * It manages all contents block of the page
     * 
     * @param contents contents block to update 
     */
    const handleContents = (contents) => {
        setContents(contents);
        if (contents.length > 0 && title !== '') {
            setDisableConfirmBtn(false);
        }
    }

    /**
     * It manages the change of author from the input
     */
    const handleOptionChangeAuthor = (event) => {
        let author = event.target.value;
        for (const authorToLoad of usersList) {   // search rigth image from the title
            if (authorToLoad.username === author) {
                setAuthor(authorToLoad);
                if (contents.length > 0 && title !== '') {
                    setDisableConfirmBtn(false);
                }
                break;
            }
        }
    };

    return (
        <Grid container style={{ display: 'flex', justifyContent: 'center' }}>
            {userViewLeftCard &&
                <Grid item xs={12} md={3} paddingBottom='40px'>
                    <LeftCardView loggedUser={userViewLeftCard} viewMode={viewMode} />      { /* Left sidebar */}
                </Grid>
            }

            <Grid item xs={12} md={6}>
                <Grid container spacing={1}>
                    {
                        msgError && <Grid item xs={12} sm={12} paddingBottom={1}>
                            <Alert onClose={() => setMsgError('')} severity="error" style={{ maxWidth: '55%' }}>{msgError}</Alert>
                        </Grid>
                    }
                    <Grid item xs={12} sm={5}>
                        <TextField
                            label="Title"
                            value={title}
                            onChange={(event) => {
                                setTitle(event.target.value);
                                if (contents.length > 0 && title !== '') {
                                    setDisableConfirmBtn(false);
                                }
                            }}
                            style={{ backgroundColor: '#FFF' }}
                            variant="outlined"
                            disabled={viewMode}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            label="Release Date"
                            value={releaseDate === null ? '' : releaseDate}
                            onChange={(event) => {
                                setReleaseDate(event.target.value);
                                if (contents.length > 0 && title !== '') {
                                    setDisableConfirmBtn(false);
                                }
                            }}
                            type='date'
                            style={{ backgroundColor: '#FFF' }}
                            InputLabelProps={{ shrink: true }}
                            disabled={viewMode}
                        />
                    </Grid>
                    {
                        !viewMode && loggedUser.role === 1 &&
                        <Grid item xs={12} sm={4}>
                            <FormControl style={{ minWidth: '150px' }}>
                                <InputLabel id="select-author">Change Author</InputLabel>
                                <Select
                                    labelId="select-author"
                                    style={{ backgroundColor: '#FFF' }}
                                    value={author.username}
                                    onChange={handleOptionChangeAuthor}
                                >
                                    {
                                        usersList.map((user, index) =>
                                            <MenuItem value={user.username} key={index}>{user.username}</MenuItem>
                                        )
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                    }
                    <Grid item xs={12} sm={8}>
                        <CardPageAddList contents={contents} handleContents={handleContents} viewMode={viewMode} />
                    </Grid>
                    {
                        // when is in view mode, the edit is disabled
                        !viewMode &&
                        <Grid item xs={12}>
                            <Button type="button" variant="contained" color="success" onClick={handleSubmit} disabled={disableConfirmBtn || (title === '' || contents.length == 0)}>
                                Confirm
                            </Button>
                        </Grid>
                    }
                </Grid>
            </Grid>
        </Grid>
    );
}

function CardPageAddList({ contents, handleContents, viewMode }) {
    return (
        <>
            {!viewMode &&
                <CardPageAdd
                    contents={contents}
                    handleContents={handleContents}
                    data={{ id: -1, header: '', paragraph: '', image: '' }}
                />
            }
            {
                contents
                    .sort((a, b) => a.sort_number - b.sort_number)
                    .map(content => (
                        <CardPageAdd
                            key={content.id}
                            contents={contents}
                            handleContents={handleContents}
                            data={content}
                            viewMode={viewMode}
                        />
                    ))
            }
        </>
    );
}

function CardPageAdd(props) {
    const [header, setHeader] = useState(props.data.header);
    const [paragraph, setParagraph] = useState(props.data.paragraph);
    const [image, setImage] = useState(props.data.image);
    const [msgSuccess, setMsgSuccess] = useState('');
    const [msgError, setMsgError] = useState('');
    const [disableBtnSave, setDisableBtnSave] = useState(true);
    const { imagesList } = useContext(ImagesListContext);     // context for images list
    const { frontOfficeSwitch } = useContext(PagesListContext);

    // it manages the submit of the form
    const handleSubmit = (event) => {
        event.preventDefault(); // it will do anything, before saving btn was type submit

        if (header === '' || (paragraph === '' && image === '')) {
            setMsgError('Header, Paragraph and/or Image can not be empty!');
            return;
        } else {
            let updateContents = props.contents;
            if (props.data.id !== -1) {                                     // not to add to the list (the add content card has the id equal to -1)
                updateContents = props.contents.map(content => {
                    if (content.id === props.data.id) {
                        let parag = paragraph === '' ? undefined : paragraph;       // easier to manage in the server
                        let img = image === '' ? undefined : image;                 // easier to manage in the server
                        setMsgSuccess('Content updated successfully!');
                        return { ...content, id: content.id, header: header, paragraph: parag, image: img, sort_number: content.sort_number };
                    } else {
                        return content;
                    }
                });
            } else {                                                        // content block to add to the list
                let parag = paragraph === '' ? undefined : paragraph;       // easier to manage in the server
                let img = image === '' ? undefined : image;                 // easier to manage in the server
                updateContents = [...props.contents, { id: ((-1 * props.contents.length) - 2), header: header, paragraph: parag, image: img, sort_number: props.contents.length }];
                setMsgSuccess('Content added successfully!');
            }   // the id is negative in order to understand which contents are added to the list

            props.handleContents(updateContents);      // update the list of contents

            if (props.data.id === -1) {
                setHeader('');
                setParagraph('');
                setImage('');
                setDisableBtnSave(false);
            } else {
                setDisableBtnSave(true);
            }
            setMsgError('');
        }
    };

    /**
     * handle delete button in the page
     */
    const handleDelete = () => {
        if (props.data.id !== -1) {                 // only if it is added to the list can be deleted
            let updateContents = props.contents;    // get all contents
            updateContents = props.contents.filter((content) => { return content.id !== props.data.id; });
            props.handleContents(updateContents);
        }
    };

    /**
     * handle option change of the image in the page
     */
    const handleOptionChange = (event) => {
        let title = event.target.value;
        for (const imageToLoad of imagesList) {   // search right image from the title
            if (imageToLoad.title === title) {
                setParagraph(undefined);
                setImage(imageToLoad);
                if (header !== '') {
                    setDisableBtnSave(false);
                }
                break;
            }
        }
    };

    /**
     * it manages the change of sort number
     * 
     * @param sort it can be -1 or +1 in according to which direction it has to be moved 
     * */
    const handleChangeSortNumber = (sort) => {
        const updateContents = [...props.contents];
        const currentIndex = updateContents.findIndex((content) => content.id === props.data.id);
        const newIndex = currentIndex + sort;
        if (newIndex < 0 || newIndex >= updateContents.length) {
            return;
        }
        updateContents[currentIndex].sort_number += sort;
        updateContents[newIndex].sort_number -= sort;

        props.handleContents(updateContents);   // update the change
    };

    return (
        <Grid container style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            {
                msgSuccess && <Grid item xs={12} sm={10}>
                    <Alert onClose={() => {
                        setMsgSuccess('');
                        setMsgError('');
                    }} severity="success">{msgSuccess}</Alert>
                </Grid>
            }
            <Grid item xs={12} sm={props.viewMode ? 12 : 10}>
                <Card style={{
                    minHeight: '100px', maxHeight: '650px', margin: 'auto', marginTop: '16px',
                    marginBottom: '16px', borderRadius: '8px', boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2)', overflow: 'auto',
                    backgroundColor: 'white',
                    cursor: 'grab',
                }}
                    draggable
                >
                    {
                        props.data.id === -1 &&
                        <CardHeader title="Add New Content"
                            titleTypographyProps={{ variant: 'h6', style: { fontWeight: 'bold', color: '#333' } }}
                            avatar={<Avatar><MdAdd /></Avatar>}
                            style={{ backgroundColor: '#f6f6f6', borderBottom: '1px solid #ccc' }} />
                    }

                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            {
                                msgError && <Grid item xs={12} sm={12}>
                                    <Alert onClose={() => {
                                        setMsgError('');
                                        setMsgSuccess('');
                                    }} severity="error">{msgError}</Alert>
                                </Grid>
                            }
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    label="Header"
                                    value={header}
                                    onChange={(event) => {
                                        setHeader(event.target.value);
                                        if (header !== '' && (paragraph !== '' || image !== '')) {
                                            setDisableBtnSave(false);
                                        }
                                    }}
                                    variant="outlined"
                                    fullWidth
                                    disabled={props.viewMode}
                                />
                            </Grid>
                            {(image !== undefined && image !== '') ?
                                <Grid item xs={12} sm={12}>
                                    <CardMedia
                                        key={image.src}
                                        component="img"
                                        alt={image.alt}
                                        height="350"
                                        image={image.src}
                                        title={image.title}
                                    />
                                </Grid>
                                :
                                <Grid item xs={12} sm={12}>
                                    <TextField
                                        label="Paragraph"
                                        value={paragraph}
                                        onChange={(event) => {
                                            setImage('');
                                            setParagraph(event.target.value);
                                            if (header !== '' && (paragraph !== '' || image !== '')) {
                                                setDisableBtnSave(false);
                                            }
                                        }}
                                        multiline
                                        rows={8}
                                        disabled={props.viewMode}
                                        fullWidth
                                    />
                                </Grid>
                            }
                        </Grid>
                    </CardContent>
                    {
                        !props.viewMode &&
                        <CardActions style={{ justifyContent: 'space-between' }}>
                            <Button type="button" variant="contained" color="primary" onClick={handleSubmit} disabled={disableBtnSave}>Save</Button>
                            <Button type="button" variant="contained" color="error" onClick={handleDelete} style={{ marginRight: '10px' }} disabled={!disableBtnSave || props.data.id === -1}>Delete</Button>
                            <FormControl style={{ minWidth: '150px' }}>
                                <InputLabel style={{ color: '#333' }} id="select-label">Add Image</InputLabel>
                                <Select
                                    labelId="select-label"
                                    value={(image === undefined || image === '') ? '' : image.title}
                                    onChange={handleOptionChange}
                                    style={{ backgroundColor: '#fff' }}
                                >
                                    {
                                        imagesList.map((image, index) =>
                                            <MenuItem value={image.title} key={index}>{image.title}</MenuItem>
                                        )
                                    }
                                </Select>
                            </FormControl>
                            {
                                image && <Button type="button" variant="contained" color="warning" onClick={() => setImage('')}>Clear Image</Button>
                            }
                        </CardActions>
                    }
                </Card>
            </Grid>
            {!props.viewMode && !frontOfficeSwitch && props.data.id !== -1 &&
                <Grid item xs={12} sm={2}>
                    <Grid container>
                        <Grid item>
                            <Button
                                onClick={() => handleChangeSortNumber(-1)}
                                startIcon={<MdArrowCircleUp style={{ fontSize: '50px', margin: '10px' }} />}
                                disabled={props.data.sort_number <= 0}
                            />
                        </Grid>
                        <Grid item>
                            <Button
                                onClick={() => handleChangeSortNumber(1)}
                                startIcon={<MdArrowCircleDown style={{ fontSize: '50px', margin: '10px' }} />}
                                disabled={props.data.sort_number >= props.contents.length - 1}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            }
        </Grid>
    )
}


export default GeneralPageView;