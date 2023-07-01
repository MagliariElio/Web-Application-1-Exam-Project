import { Alert, Button, Card, CardHeader, CircularProgress, Container, Grid, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import validator from "validator";
import { LoggedUserContext } from "../context/Context";

/**
 * The login page
 * 
 */
function LoginFormView() {
  const [email, setEmail] = useState("elio@studenti.polito.it");
  const [password, setPassword] = useState("password_1");
  const [generalError, setGeneralError] = useState(undefined);
  const [passwordValid, setPasswordValid] = useState(true);
  const [waiting, setWaiting] = useState(false);

  const { login } = useContext(LoggedUserContext);    // context for login

  const handleSubmit = async event => {
    event.preventDefault();

    // Validate form
    const trimmedEmail = email.trim();
    const emailError = validator.isEmpty(trimmedEmail) ? ["Email must not be empty"] : (!validator.isEmail(trimmedEmail) ? ["Not a valid email"] : undefined);
    const passwordValid = !validator.isEmpty(password);

    if (!emailError && passwordValid) {
      setWaiting(true);
      try {
        await login(email, password)
      } catch (err) {
        setGeneralError(err);
      } finally {
        setWaiting(false);
      }

    } else {
      setGeneralError(emailError);
      setPasswordValid(passwordValid);
    }
  };

  return (
    <Container maxWidth="md" sx={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={6}>
          {generalError ? (
            <Alert severity="error" onClose={() => setGeneralError(undefined)} sx={{ marginBottom: '1.5rem' }}>
              {generalError.map((error, index) =>
                <Typography key={index} variant="subtitle1" component="div" gutterBottom>
                  {error}
                </Typography>
              )}
            </Alert>
          ) : null}
          <Card sx={{ padding: '1rem' }}>
            <CardHeader title="Login" sx={{ textAlign: 'center' }} />
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} sx={{ marginTop: '1.5rem' }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    error={Boolean(generalError)}
                    helperText={generalError}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setGeneralError(undefined);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    variant="outlined"
                    type="password"
                    error={!passwordValid}
                    helperText={!passwordValid ? 'Password must not be empty' : null}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setPasswordValid(true);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={waiting}
                    startIcon={
                      waiting ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                    sx={{ width: '100%' }}
                  >
                    Login
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export { LoginFormView as LoginForm };
