import SendIcon from "@mui/icons-material/Send";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { useEffect, useState } from "react";

interface Props {
  //   message?: string;
  //   autoSave: boolean;
  onSend: (message: any) => void;
}

export function MessageEditor({ onSend }: Props) {
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (content.trim().length === 0) {
      return;
    }

    onSend({ role: "user", content });
    setContent("");
  };

  return (
    <>
      <FormControl fullWidth>
        <InputLabel htmlFor="message">Message</InputLabel>
        <OutlinedInput
          id="message"
          label="Message"
          multiline
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                color="primary"
                disabled={content.length === 0}
                onClick={handleSend}
              >
                <SendIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    </>
  );
}
