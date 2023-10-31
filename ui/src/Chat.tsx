import * as React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Person } from "@mui/icons-material";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import { formatDistance } from "date-fns";

const ddClient = createDockerDesktopClient();

interface IMessage {
  role: string;
  content: string;
  createdAt: number;
}

interface Props {
  hasKey: boolean;
}
export const Chat = ({ hasKey }: Props) => {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const getMessages = async () => {
    const result = await ddClient.extension.vm?.service?.get("/messages");
    return result as IMessage[];
  };

  const sendMessage = async (message: any) => {
    const chat = await ddClient.extension.vm?.service?.post(
      "/messages",
      message
    );
    return chat as IMessage[];
  };

  React.useEffect(() => {
    getMessages().then((response) => setMessages(response));
  }, []);

  const handleSend = async () => {
    if (input.trim() !== "") {
      try {
        setLoading(true);
        setMessages((messages) => [
          ...messages,
          { role: "user", content: input, createdAt: Date.now() },
        ]);
        const chat = await sendMessage({ role: "user", content: input });
        setMessages(chat);
        setLoading(false);
        setInput("");
      } catch (err: any) {
        console.error(err);
        ddClient.desktopUI.toast.error(err.message);
        setLoading(false);
      }
    }
  };

  const handleInputChange = (event: any) => {
    setInput(event.target.value);
  };

  return (
    <Box
      sx={{
        mt: 2,
        display: "flex",
        flexDirection: "column",
        bgcolor: (theme) => theme.palette.background.paper,
      }}
    >
      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
        {(messages || []).map((message) => (
          <Message key={message.createdAt} message={message as any} />
        ))}
      </Box>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={10}>
            <TextField
              size="small"
              fullWidth
              placeholder="Type a message"
              variant="outlined"
              value={input}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              fullWidth
              endIcon={loading ? <CircularProgress size={24} /> : <SendIcon />}
              onClick={handleSend}
              disabled={!hasKey || loading}
            >
              Send
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

const Message = ({
  message,
}: {
  message: { role: string; content: string; createdAt: number };
}) => {
  const isBot = message.role !== "user";

  const relativeDate = formatDistance(new Date(message.createdAt), new Date(), {
    addSuffix: true,
  });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isBot ? "row" : "row-reverse",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ bgcolor: isBot ? "primary.main" : "secondary.main" }}>
          {isBot ? <SmartToyIcon /> : <Person />}
        </Avatar>
        <Stack direction="column">
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              ml: isBot ? 1 : 0,
              mr: isBot ? 0 : 1,
              backgroundColor: isBot ? "primary.light" : "secondary.light",
              borderRadius: isBot ? "20px 20px 20px 5px" : "20px 20px 5px 20px",
            }}
          >
            <Typography variant="body1">{message.content}</Typography>
          </Paper>
          <Typography variant="caption">{relativeDate}</Typography>
        </Stack>
      </Box>
    </Box>
  );
};
