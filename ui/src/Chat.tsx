import * as React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Person } from "@mui/icons-material";

// const messages = [
//   { id: 1, text: "Hi there!", sender: "bot" },
//   { id: 2, text: "Hello!", sender: "user" },
//   { id: 3, text: "How can I assist you today?", sender: "bot" },
// ];
interface IMessage {
  role: string;
  content: string;
  createdAt: number;
}

interface Props {
  //   message?: string;
  //   autoSave: boolean;
  getMessages: () => Promise<any[]>;
  onSend: (message: any) => Promise<any>;
}
export const Chat = ({ getMessages, onSend }: Props) => {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<IMessage[]>([]);

  React.useEffect(() => {
    getMessages().then((response) => setMessages(response));
  }, []);

  const handleSend = async () => {
    if (input.trim() !== "") {
      const chatgptMessage = await onSend({ role: "user", content: input });
      setMessages([...messages, chatgptMessage]);
      console.log(input);
      setMessages([
        ...messages,
        { role: "user", content: input, createdAt: Date.now() },
      ]);
      setInput("");
    }
  };

  const handleInputChange = (event: any) => {
    setInput(event.target.value);
  };

  return (
    <Box
      sx={{
        // height: "100vh",
        mt: 2,
        display: "flex",
        flexDirection: "column",
        bgcolor: (theme) => theme.palette.background.paper,
      }}
    >
      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
        {messages.map((message) => (
          <Message key={message.content} message={message as any} />
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
              color="primary"
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSend}
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
      </Box>
    </Box>
  );
};
