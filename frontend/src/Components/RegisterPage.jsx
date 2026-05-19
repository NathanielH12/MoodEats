import { Box, Button, TextField, Alert, Snackbar, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import { useNavigate } from "react-router-dom";
import React from "react";
// import MoodEatsLogo from '../assets/MoodEatsLogo.png';
// import { registerUser } from "../../api";

/**
 * RegisterPage component that displays the register form for a user to register.
 */
export const RegisterPage = ({ setToken }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [redOutline, setRedOutline] = React.useState(false);
  const [errorAlert, setErrorAlert] = React.useState("");
  const navigate = useNavigate();

  /**
   * Function called when the register info is to be sent to the backend.
   */
  const handleRegister = async (email, password, confirmPassword, name) => {

    if (password !== confirmPassword) {
      setRedOutline(true);
      setErrorAlert("Passwords don't match");
      return; 
    }

    try {
      const data = await registerUser(email, password, name);

      if (data.error) {
        setRedOutline(true);
        setErrorAlert(data.error);
      } else {
        setRedOutline(false);
        setErrorAlert("");
        setToken(data.token);
      }
    } catch {
      setErrorAlert("Something went wrong. Please try again");
    }
  }

  /**
   * Function called when the register button is clicked.
   * registers the user or alerts an error.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    handleRegister(email, password, confirmPassword, name);
  };

  /**
   * Function called when the email input box changes.
   */
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setRedOutline(false);
    setErrorAlert("");
  }
  
  /**
   * Function called when the name input box changes.
   */
  const handleNameChange = (event) => {
    setName(event.target.value);
    setRedOutline(false);
    setErrorAlert("");
  }

  /**
   * Function called when the password input box changes.
   */
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setRedOutline(false);
    setErrorAlert("");
  }

  /**
   * Function called when the confirm password input box changes.
   */
  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    setRedOutline(false);
    setErrorAlert("");
  }

  return (
    <>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: 'column',
          gap: '50px'
        }}
      >
        {/* <img
          src={MoodEatsLogo}
          alt="MoodEats Logo"
          style={{ width: '15em', borderRadius: '50%' }}
        /> */}
        <Box
          sx={{
            backgroundColor: "rgb(255, 255, 255)", // dark card, lighter than background
            borderRadius: "12px",
            padding: "40px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0px",
          }}
        >
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                marginBottom: "24px",
                textAlign: "center",
                color: 'rgb(199, 121, 19)'
              }}
            >
              Register
            </Typography>

            {errorAlert !== "" && (
              <Snackbar
                open={errorAlert !== ""}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                onClose={() => setErrorAlert("")}
              >
                <Alert
                  icon={<ErrorIcon fontSize="inherit" />}
                  severity="error"
                  onClose={() => setErrorAlert("")}
                >
                  {errorAlert}
                </Alert>
              </Snackbar>
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                width: "100%",
              }}
            >
              <TextField
                error={redOutline}
                label="Name"
                variant="outlined"
                type="text"
                value={name}
                onChange={e => handleNameChange(e)}
                slotProps={{ htmlInput: { "data-testid": "register-name" } }}
                fullWidth
              />
              <TextField
                error={redOutline}
                label="Email"
                variant="outlined"
                value={email}
                onChange={e => handleEmailChange(e)}
                slotProps={{ htmlInput: { "data-testid": "register-email" } }}
                fullWidth
              />
              <TextField
                error={redOutline}
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={e => handlePasswordChange(e)}
                slotProps={{ htmlInput: { "data-testid": "register-password" } }}
                fullWidth
              />
              <TextField
                error={redOutline}
                label="Confirm password"
                variant="outlined"
                type="password"
                value={confirmPassword}
                onChange={e => handleConfirmPasswordChange(e)}
                slotProps={{ htmlInput: { "data-testid": "register-confirm" } }}
                fullWidth
              />
              <Button
                variant="contained"
                type="submit"
                data-testid="register-submit"
                fullWidth
                sx={{ backgroundColor: 'rgb(199, 121, 19)' }}
                >
                Register
              </Button>
              <Button
                variant="outlined"
                type="button"
                onClick={() => navigate("/login")}
                fullWidth
                sx={{ borderColor: 'rgb(199, 121, 19)', color: 'rgb(199, 121, 19)' }}
              >
                Login
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </>
  );
}