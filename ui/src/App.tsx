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
  const [openAIkey, setOpenAIkey] = React.useState<string>();
  const [openAIkeySaved, setOpenAIkeySaved] = React.useState<string>();

  const ddClient = useDockerDesktopClient();

  useEffect(() => {
    getOpenAiKey().then((response: any) => {
      setOpenAIkey(response?.value);
      setOpenAIkeySaved(response?.value);
    });
  }, []);

  const getOpenAiKey = async () => {
    const result = await ddClient.extension.vm?.service?.get("/apikey");
    return result;
  };

  const saveOpenAiKey = async (value: string) => {
    await ddClient.extension.vm?.service?.post("/apikey", { value });
    setOpenAIkeySaved(value);
  };

  return (
    <>
      <Typography variant="h3" sx={{ pb: 2 }}>
        OpenAI extension demo
      </Typography>
      <Stack direction="row" gap={2}>
        <TextField
          label="OpenAI API key"
          value={openAIkey ?? ""}
          onChange={(e) => setOpenAIkey(e.target.value)}
        />
        <Button
          variant="contained"
          disabled={!openAIkey || openAIkey === openAIkeySaved}
          onClick={() => saveOpenAiKey(openAIkey || "")}
        >
          Set API key
        </Button>
      </Stack>
      <Stack>
        <Chat hasKey={!!openAIkeySaved} />
      </Stack>
    </>
  );
}
