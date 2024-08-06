'use client'
import { Box, Stack, TextField, Button } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hi! Im the Headstarter support assistant. How can I help you today?' }
  ]);

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    const newMessage = message;
    setMessage('');
    setMessages((prevMessages) => [...prevMessages, { role: 'user', content: newMessage }]);
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: newMessage }])
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    
    const processText = async ({ done, value }) => {
      if (done) {
        return result;
      }
      const text = decoder.decode(value || new Uint8Array(), { stream: true });
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        const otherMessages = prevMessages.slice(0, prevMessages.length - 1);

        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text }
        ];
      });
      return reader.read().then(processText);
    };

    reader.read().then(processText);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack direction="column" width="500px" maxHeight="700px" border="1px solid black" p={2} spacing={3}>
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto" maxHeight="100%">
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box
                bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField label="Message" fullWidth value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
