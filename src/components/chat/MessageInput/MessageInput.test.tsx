import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "./MessageInput";
import { useChatStore } from "../../../store/chatStore";
import { useMessageStore } from "../../../store/messageStore";

vi.mock("../../../store/chatStore");
vi.mock("../../../store/messageStore");

describe("MessageInput", () => {
  const mockSendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMessageStore).mockReturnValue({
      sendMessage: mockSendMessage,
    } as ReturnType<typeof useMessageStore>);
  });

  it("should not render when no chat is selected", () => {
    vi.mocked(useChatStore).mockReturnValue({
      selectedChatId: null,
    } as ReturnType<typeof useChatStore>);

    const { container } = render(<MessageInput />);

    expect(container).toBeEmptyDOMElement();
  });

  it("should render input and button when chat is selected", () => {
    vi.mocked(useChatStore).mockReturnValue({
      selectedChatId: "chat-1",
    } as ReturnType<typeof useChatStore>);

    render(<MessageInput />);

    expect(screen.getByLabelText("Message input")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Отправить" })
    ).toBeInTheDocument();
  });

  it("should disable send button when input is empty", () => {
    vi.mocked(useChatStore).mockReturnValue({
      selectedChatId: "chat-1",
    } as ReturnType<typeof useChatStore>);

    render(<MessageInput />);

    const sendButton = screen.getByRole("button", { name: "Отправить" });
    expect(sendButton).toBeDisabled();
  });

  it("should enable send button when input has text", async () => {
    vi.mocked(useChatStore).mockReturnValue({
      selectedChatId: "chat-1",
    } as ReturnType<typeof useChatStore>);

    render(<MessageInput />);

    const input = screen.getByLabelText("Message input");
    await userEvent.type(input, "Hello");

    const sendButton = screen.getByRole("button", { name: "Отправить" });
    expect(sendButton).not.toBeDisabled();
  });

  it("should call sendMessage on form submit", async () => {
    vi.mocked(useChatStore).mockReturnValue({
      selectedChatId: "chat-1",
    } as ReturnType<typeof useChatStore>);

    render(<MessageInput />);

    const input = screen.getByLabelText("Message input");
    await userEvent.type(input, "Hello");

    const sendButton = screen.getByRole("button", { name: "Отправить" });
    fireEvent.click(sendButton);

    expect(mockSendMessage).toHaveBeenCalledWith("chat-1", "Hello");
  });

  it("should clear input after sending message", async () => {
    vi.mocked(useChatStore).mockReturnValue({
      selectedChatId: "chat-1",
    } as ReturnType<typeof useChatStore>);

    render(<MessageInput />);

    const input = screen.getByLabelText("Message input") as HTMLInputElement;
    await userEvent.type(input, "Hello");

    const sendButton = screen.getByRole("button", { name: "Отправить" });
    fireEvent.click(sendButton);

    expect(input.value).toBe("");
  });

  it("should send message on Enter key press", async () => {
    vi.mocked(useChatStore).mockReturnValue({
      selectedChatId: "chat-1",
    } as ReturnType<typeof useChatStore>);

    render(<MessageInput />);

    const input = screen.getByLabelText("Message input");
    await userEvent.type(input, "Hello{Enter}");

    expect(mockSendMessage).toHaveBeenCalledWith("chat-1", "Hello");
  });

  it("should not send empty or whitespace-only messages", async () => {
    vi.mocked(useChatStore).mockReturnValue({
      selectedChatId: "chat-1",
    } as ReturnType<typeof useChatStore>);

    render(<MessageInput />);

    const input = screen.getByLabelText("Message input");
    await userEvent.type(input, "   {Enter}");

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it("should trim message text before sending", async () => {
    vi.mocked(useChatStore).mockReturnValue({
      selectedChatId: "chat-1",
    } as ReturnType<typeof useChatStore>);

    render(<MessageInput />);

    const input = screen.getByLabelText("Message input");
    await userEvent.type(input, "  Hello World  ");

    const sendButton = screen.getByRole("button", { name: "Отправить" });
    fireEvent.click(sendButton);

    expect(mockSendMessage).toHaveBeenCalledWith("chat-1", "Hello World");
  });
});
