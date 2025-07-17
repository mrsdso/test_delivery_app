import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import LogoutButton from "./LogoutButton";

export default function AppHeader() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Delivery Dashboard
        </Typography>
        <LogoutButton />
      </Toolbar>
    </AppBar>
  );
}