import { Box, Button, TextField, Alert, Snackbar, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import { useNavigate } from "react-router-dom";
import React from "react";
import axios from 'axios';

export const RegisterPage = ({ setToken }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [redOutline, setRedOutline] = React.useState(false);
  const [errorAlert, setErrorAlert] = React.useState("");
  const navigate = useNavigate();

  const handleRegister = async (email, password, confirmPassword, firstName, lastName) => {
    if (password !== confirmPassword) {
      setRedOutline(true);
      setErrorAlert("Passwords don't match");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5500/register', {
        nameFirst: firstName,
        nameLast: lastName,
        email,
        password,
      });

      const data = res.data;

      if (data.error) {
        setRedOutline(true);
        setErrorAlert(data.error);
      } else {
        setRedOutline(false);
        setErrorAlert("");
        setToken(data.token);       // saves to localStorage via handleSetToken
        navigate("/dashboard");     // then redirect
      }

    } catch (err) {
      const serverError = err.response?.data?.error;
      setRedOutline(true);
      setErrorAlert(serverError || "Something went wrong. Please try again");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleRegister(email, password, confirmPassword, firstName, lastName);
  };

  const clearError = () => {
    setRedOutline(false);
    setErrorAlert("");
  };

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

            <Box sx={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%" }}>
              <TextField
                error={redOutline}
                label="First Name"
                variant="outlined"
                type="text"
                value={firstName}
                onChange={e => { setFirstName(e.target.value); clearError(); }}
                slotProps={{ htmlInput: { "data-testid": "register-firstname" } }}
                fullWidth
              />
              <TextField
                error={redOutline}
                label="Last Name"
                variant="outlined"
                type="text"
                value={lastName}
                onChange={e => { setLastName(e.target.value); clearError(); }}
                slotProps={{ htmlInput: { "data-testid": "register-lastname" } }}
                fullWidth
              />
              <TextField
                error={redOutline}
                label="Email"
                variant="outlined"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError(); }}
                slotProps={{ htmlInput: { "data-testid": "register-email" } }}
                fullWidth
              />
              <TextField
                error={redOutline}
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); clearError(); }}
                slotProps={{ htmlInput: { "data-testid": "register-password" } }}
                fullWidth
              />
              <TextField
                error={redOutline}
                label="Confirm Password"
                variant="outlined"
                type="password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); clearError(); }}
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
};