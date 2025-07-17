import React from "react";
import { Button } from "@mui/material";
import { logout } from "../auth/logout";

export default function LogoutButton() {
  return (
    <Button color="inherit" onClick={logout}>
      Выйти
    </Button>
  );
}