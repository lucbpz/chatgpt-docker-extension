import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Stack, TextField, Typography } from "@mui/material";
import { MessageEditor } from "./MessageEditor";
import { Chat } from "./Chat";

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [openAIkey, setOpenAIkey] = React.useState<string>();

  const ddClient = useDockerDesktopClient();

  useEffect(() => {
    getOpenAiKey().then((response: any) => {
      console.log("getOpenAiKey", response);
      setOpenAIkey(response?.value);
    });
  }, []);

  const getOpenAiKey = async () => {
    const result = await ddClient.extension.vm?.service?.get("/apikey");
    return result;
  };

  const saveOpenAiKey = async (value: string) => {
    console.log("saveOpenAiKey", value);
    await ddClient.extension.vm?.service?.post("/apikey", { value });
  };

  const getMessages = async () => {
    const result = await ddClient.extension.vm?.service?.get("/messages");
    return result;
  };

  const postMessage = async (message: any) => {
    console.log("postMessage", message);
    await ddClient.extension.vm?.service?.post("/messages", message);
    // setOpenAIkey(JSON.stringify(result));
  };

  return (
    <>
      <Typography variant="h3">OpenAI extension demo</Typography>
      <Stack direction="row" gap={2}>
        <TextField
          label="OpenAI API key"
          // sx={{ width: 480 }}
          // disabled
          // multiline
          // variant="outlined"
          // minRows={5}
          value={openAIkey ?? ""}
          onChange={(e) => setOpenAIkey(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={() => saveOpenAiKey(openAIkey || "")}
        >
          Set API key
        </Button>
      </Stack>
      <Stack>
        <Chat getMessages={getMessages as any} onSend={postMessage} />
      </Stack>
      {/* <Stack direction="row" alignItems="start" spacing={2} sx={{ mt: 4 }}>
        <MessageEditor onSend={postMessage} />
      </Stack> */}
    </>
  );
}
