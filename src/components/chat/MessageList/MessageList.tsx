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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const lastScrollTop = useRef(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const chatMessages = selectedChatId ? messages[selectedChatId] ?? [] : [];
  const isChatLoading = selectedChatId ? isLoading[selectedChatId] : false;

  const containerCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (node) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      });

      resizeObserverRef.current.observe(node);
    }
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
      setShowScrollButton(false);
    }
  }, [selectedChatId, fetchMessages]);

  useEffect(() => {
    if (chatMessages.length > 0 && listRef.current && dimensions.height > 0) {
      // Use setTimeout to ensure the list is fully rendered
      setTimeout(() => {
        listRef.current?.scrollToRow({
          index: chatMessages.length - 1,
          align: 'end'
        });
      }, 0);
    }
  }, [chatMessages.length, dimensions.height, selectedChatId]);

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
      <div className="flex items-center justify-center h-full ">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  if (isChatLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Spinner size="lg" />
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
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
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div ref={containerCallbackRef} className="relative h-full ">
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
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-3 cursor-pointer
            rounded-full bg-white border border-gray-200
            shadow-lg shadow-gray-400/40
            transition-all duration-300
            hover:shadow-xl hover:shadow-gray-400/50
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            active:scale-95"
          aria-label="Scroll to new messages"
        >
          <span className="text-lg text-gray-700">↓</span>
          <span className="text-sm font-medium text-gray-800">New messages</span>
        </button>
      )}
    </div>
  );
}
