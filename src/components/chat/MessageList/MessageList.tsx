import { useEffect, useRef, useCallback, useState, type CSSProperties } from 'react';
import { List, type ListImperativeAPI } from 'react-window';
import { useMessageStore, useChatStore } from '../../../store';
import { Spinner, Button } from '../../ui';
import { MessageItem } from './MessageItem';
import type { Message } from '../../../types';

const ITEM_HEIGHT = 72;
const SCROLL_THRESHOLD = 200;

interface RowProps {
  messages: Message[];
}

function RowComponent({
  index,
  style,
  messages
}: {
  index: number;
  style: CSSProperties;
  ariaAttributes: object;
  messages: Message[];
}) {
  return <MessageItem message={messages[index]} style={style} />;
}

export function MessageList() {
  const { selectedChatId } = useChatStore();
  const { messages, isLoading, error, fetchMessages } = useMessageStore();
  const listRef = useRef<ListImperativeAPI>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const lastScrollTop = useRef(0);

  const chatMessages = selectedChatId ? messages[selectedChatId] ?? [] : [];
  const isChatLoading = selectedChatId ? isLoading[selectedChatId] : false;

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
    }
  }, [selectedChatId, fetchMessages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (chatMessages.length > 0 && listRef.current && !showScrollButton) {
      listRef.current.scrollToRow({
        index: chatMessages.length - 1,
        align: 'end'
      });
    }
  }, [chatMessages.length, showScrollButton]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const scrollTop = target.scrollTop;
      const maxScroll = chatMessages.length * ITEM_HEIGHT - dimensions.height;
      const distanceFromBottom = maxScroll - scrollTop;

      lastScrollTop.current = scrollTop;
      setShowScrollButton(distanceFromBottom > SCROLL_THRESHOLD);
    },
    [chatMessages.length, dimensions.height]
  );

  const scrollToBottom = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollToRow({
        index: chatMessages.length - 1,
        align: 'end'
      });
    }
    setShowScrollButton(false);
  }, [chatMessages.length]);

  if (!selectedChatId) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  if (isChatLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Spinner size="lg" />
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="flex flex-col items-center gap-3 p-4">
          <p className="text-red-500 text-center">{error}</p>
          <Button
            onClick={() => selectedChatId && fetchMessages(selectedChatId)}
            variant="primary"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (chatMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full bg-gray-50">
      {dimensions.height > 0 && (
        <List<RowProps>
          listRef={listRef}
          rowCount={chatMessages.length}
          rowHeight={ITEM_HEIGHT}
          overscanCount={10}
          defaultHeight={dimensions.height}
          onScroll={handleScroll}
          style={{ height: dimensions.height, width: dimensions.width }}
          rowComponent={RowComponent}
          rowProps={{ messages: chatMessages }}
        />
      )}

      {showScrollButton && (
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={scrollToBottom}
            variant="primary"
            size="sm"
            className="rounded-full shadow-lg"
          >
            ↓ New messages
          </Button>
        </div>
      )}
    </div>
  );
}
