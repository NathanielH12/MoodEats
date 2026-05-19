import { Button, Box, TextField, Alert, Snackbar, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import React from "react";
import { useNavigate } from "react-router-dom";
import MoodEatsLogo from '../assets/MoodEatsLogo.png';
// import { loginUser } from "../../api";

/**
 * LoginPage components which displays the login form for a user to login.
 */
export const LoginPage = ({ setToken }) => {  
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [redOutline, setRedOutline] = React.useState(false);
  const [errorAlert, setErrorAlert] = React.useState("");
  const navigate = useNavigate();

  /**
   * Function called when the login info is to be sent to the backend.
   * Logs in the user or alerts an error.
   */
  const handleLogin = async (email, password) => {
    try {
      // const data = await loginUser(email, password);
      console.log

      if (data.error) {
        setRedOutline(true);
        setErrorAlert(data.error);
      } else {
        setRedOutline(false);
        setErrorAlert("");
        setToken(data.token);
      }
    } catch {
      setErrorAlert("Something went wrong. Please try again.")
    };
  };

  /**
   * Function called when the login submit button is pressed.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    handleLogin(email, password);
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
   * Function called when the password input box changes.
   */
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
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
        }}
      >
        <Box
          sx={{
            backgroundColor: "rgb(255, 255, 255)",
            borderRadius: "12px",
            padding: "40px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                marginBottom: "24px",
                textAlign: "center",
                color: "rgb(199, 121, 19)",
              }}
            >
              Login
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
                label="Email"
                variant="outlined"
                value={email}
                onChange={e => handleEmailChange(e)}
                slotProps={{ htmlInput: { "data-testid": "login-email" } }}
                fullWidth
              />
              <TextField
                error={redOutline}
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={e => handlePasswordChange(e)}
                slotProps={{ htmlInput: { "data-testid": "login-password" } }}
                fullWidth
              />
              <Button
                variant="contained"
                type="submit"
                data-testid="login-submit"
                fullWidth
                sx={{ backgroundColor: "rgb(199, 121, 19)" }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                type="button"
                onClick={() => navigate("/register")}
                fullWidth
                sx={{ borderColor: "rgb(199, 121, 19)", color: "rgb(199, 121, 19)" }}
              >
                Register
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </>
  );
}