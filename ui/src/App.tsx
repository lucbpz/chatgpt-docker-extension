import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Stack, TextField, Typography } from "@mui/material";
import { Chat } from "./Chat";

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  return (
    <>
      <Typography variant="h3" sx={{ pb: 2 }}>
        OpenAI ChatGPT extension demo
      </Typography>
      <Stack>
        <Chat />
      </Stack>
    </>
  );
}
