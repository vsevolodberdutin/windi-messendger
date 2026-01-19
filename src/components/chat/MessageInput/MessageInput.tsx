import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { useChatStore, useMessageStore } from '../../../store';
import { Button, Input } from '../../ui';

export function MessageInput() {
  const [text, setText] = useState('');
  const { selectedChatId } = useChatStore();
  const { sendMessage } = useMessageStore();

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      const trimmedText = text.trim();
      if (!trimmedText || !selectedChatId) return;

      sendMessage(selectedChatId, trimmedText);
      setText('');
    },
    [text, selectedChatId, sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as FormEvent);
      }
    },
    [handleSubmit]
  );

  if (!selectedChatId) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 p-4
        border-t border-gray-200 bg-white"
    >
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        aria-label="Message input"
      />
      <Button
        type="submit"
        disabled={!text.trim()}
        className="shrink-0"
      >
        Send
      </Button>
    </form>
  );
}
