import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Button,
  Form,
  Container,
  Row,
  Col,
  Badge,
  Modal,
} from "react-bootstrap";
import { useAuth } from "../../store/AuthContext";
import { useModal } from "../../store/ModalContext";
import "./ForumPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ForumPage = () => {
  const [channels, setChannels] = useState([
    "general-discussion",
    "product-feedback",
    "support",
    "random",
    "announcements",
  ]);
  const [activeChannel, setActiveChannel] = useState("general-discussion");
  const [channelMessages, setChannelMessages] = useState({});
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newChannelInput, setNewChannelInput] = useState("");
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [replyContents, setReplyContents] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { user } = useAuth();
  const { showPrompt, showConfirm } = useModal();
  const fileInputRef = useRef(null);

  // Use local storage effect to keep channel messages when switching
  useEffect(() => {
    if (channelMessages[activeChannel]) {
      setPosts(channelMessages[activeChannel]);
    } else {
      setPosts([]);
    }
  }, [activeChannel, channelMessages]);

  const handleNewDiscussion = () => {
    if (newChannelInput && newChannelInput.trim()) {
      const newSlug = newChannelInput.trim().toLowerCase().replace(/\s+/g, "-");
      if (!channels.includes(newSlug)) {
        setChannels([...channels, newSlug]);
      }
      setActiveChannel(newSlug);
      setShowNewThreadModal(false);
      setNewChannelInput("");
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/forum/posts?channel=${activeChannel}`,
      );
      // or filtering them if the backend supported a channel_id.
      setChannelMessages((prev) => ({
        ...prev,
        [activeChannel]: res.data,
      }));
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeChannel]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user)
      return showPrompt(
        "You must be logged in to post to the community.",
        "Authentication Required",
      );
    if (!title.trim() && !file) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("user_id", user.id);
    formData.append("channel", activeChannel);
    if (file) formData.append("file", file);

    try {
      await axios.post(`${API_BASE}/api/forum/posts`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTitle("");
      setContent("");
      setFile(null);
      await fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (parentPostId) => {
    if (!user)
      return showPrompt(
        "You must be logged in to reply.",
        "Authentication Required",
      );
    const rContent = replyContents[parentPostId];
    if (!rContent) return;

    const formData = new FormData();
    formData.append("content", rContent);
    formData.append("user_id", user.id);

    try {
      // For a Slack-like experience, we keep it simple:
      // All replies currently go to the top-level thread (parentPostId)
      // If we wanted true infinite nesting, we'd need a backend change for parent_reply_id.
      // For now, we'll label who we are replying to.
      await axios.post(
        `${API_BASE}/api/forum/posts/` + parentPostId + "/reply",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setReplyContents({ ...replyContents, [parentPostId]: "" });
      setActiveReplyId(null);
      await fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const [postReactions, setPostReactions] = useState({});

  const handleReaction = (msgId, icon) => {
    setPostReactions((prev) => {
      // Create a unique key using both type (post/reply) and ID to ensure uniqueness
      const existingMsgReactions = prev[msgId];

      const currentReactions = existingMsgReactions || [
        { icon: "bi-lightning-charge", count: 2 },
        { icon: "bi-gem", count: 1 },
        { icon: "bi-rocket-takeoff", count: 5 },
        { icon: "bi-incognito", count: 3 },
      ];

      const updated = currentReactions.map((r) =>
        r.icon === icon ? { ...r, count: r.count + 1 } : r,
      );

      return { ...prev, [msgId]: updated };
    });
  };

  const handleDelete = async (msgId, isReply) => {
    showConfirm(
      "This action cannot be undone. Are you sure you want to delete this message?",
      async () => {
        try {
          const url = isReply
            ? `${API_BASE}/api/forum/replies/${msgId}`
            : `${API_BASE}/api/forum/posts/${msgId}`;
          await axios.delete(url);
          await fetchPosts();
        } catch (err) {
          console.error(err);
          showPrompt(
            "We encountered an error while trying to delete this message.",
            "Deletion Failed",
            "danger",
          );
        }
      },
      "Delete Message",
    );
  };

  // Helper to render a message unit (Post or Reply)
  const renderMessage = (msg, isReply = false, parentId = null) => {
    // Skip rendering if there's no content, no title, AND no attachment
    if (!msg.content?.trim() || msg.content === "<p></p>") {
      if (!msg.title?.trim() && !msg.attachment_url) {
        return null;
      }
    }

    const pId = parentId || msg.id;
    // Unique ID for state mapping to prevent collision between posts and replies with same DB ID
    const uniqueMsgId = isReply ? `reply-${msg.id}` : `post-${msg.id}`;

    return (
      <div className={`slack-card ${isReply ? "reply-card" : ""}`}>
        <div className="d-flex align-items-start gap-3">
          <div
            className={`avatar bg-secondary text-white rounded d-flex align-items-center justify-content-center fw-bold ${isReply ? "small-avatar" : ""}`}
          >
            {msg.user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <span className="username">{msg.user.username}</span>
              <span className="timestamp ms-2">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="message-text">
              {msg.content && msg.content !== "<p></p>" ? (
                <div
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                />
              ) : (
                msg.title && <div className="post-content"> {msg.title} </div>
              )}
            </div>

            {msg.attachment_url && (
              <div className="mt-2 attachment-preview-container">
                {/* Image Preview - Support wide range of image formats */}
                {msg.attachment_name
                  ?.toLowerCase()
                  .match(
                    /\.(jpg|jpeg|png|gif|webp|avif|bmp|svg|heic|heif|tiff)$/i,
                  ) ||
                msg.attachment_url
                  .toLowerCase()
                  .match(
                    /\.(jpg|jpeg|png|gif|webp|avif|bmp|svg|heic|heif|tiff)$/i,
                  ) ? (
                  <div className="image-attachment mb-2">
                    <img
                      src={API_BASE + msg.attachment_url}
                      alt={msg.attachment_name}
                      className="post-image border border-secondary shadow-sm cursor-pointer"
                      style={{ cursor: "zoom-in" }}
                      onClick={() => {
                        setSelectedImage(API_BASE + msg.attachment_url);
                        setShowImageModal(true);
                      }}
                      onError={(e) => {
                        // If it's a format the browser STILL can't render (like HEIC), fallback to a link
                        e.target.style.display = "none";
                        const link = document.createElement("a");
                        link.href = API_BASE + msg.attachment_url;
                        link.target = "_blank";
                        link.className =
                          "text-decoration-none bg-dark border border-secondary p-2 rounded d-inline-block text-light small";
                        link.innerHTML = `<i class="bi bi-file-earmark-image me-2"></i> View Image (${msg.attachment_name})`;
                        e.target.parentElement.appendChild(link);
                      }}
                    />
                  </div>
                ) : msg.attachment_name
                    ?.toLowerCase()
                    .match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i) ||
                  msg.attachment_url
                    .toLowerCase()
                    .match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i) ? (
                  /* Audio Preview */
                  <div className="audio-attachment mb-2">
                    <audio
                      controls
                      className="w-100"
                      style={{ maxWidth: "300px", height: "35px" }}
                    >
                      <source src={API_BASE + msg.attachment_url} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  /* Generic File Link */
                  <a
                    href={API_BASE + msg.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none bg-dark border border-secondary p-2 rounded d-inline-block text-light small shadow-sm hover-brighten"
                  >
                    <i className="bi bi-file-earmark-text me-2"></i>
                    {msg.attachment_name || "Attachment"}
                  </a>
                )}
              </div>
            )}

            {/* Actions for either post or reply */}
            <div className="message-actions mt-2 d-flex align-items-center gap-2">
              <div className="reaction-spread d-flex gap-2 align-items-center opacity-1 transform-none">
                <div
                  className="reaction-item action-icon-item"
                  onClick={() =>
                    setActiveReplyId(activeReplyId === msg.id ? null : msg.id)
                  }
                  title="Reply"
                >
                  <i className="bi bi-chat-text reaction-svg-icon"></i>
                </div>

                <div
                  className="reaction-item action-icon-item delete-action"
                  onClick={() => handleDelete(msg.id, isReply)}
                  title="Delete"
                >
                  <i className="bi bi-trash reaction-svg-icon"></i>
                </div>

                <div
                  className="mx-1"
                  style={{
                    height: "14px",
                    borderLeft: "1px solid rgba(255,255,255,0.4)",
                    alignSelf: "center",
                  }}
                ></div>

                {(
                  postReactions[uniqueMsgId] || [
                    { icon: "bi-lightning-charge", count: 2 },
                    { icon: "bi-gem", count: 1 },
                    { icon: "bi-rocket-takeoff", count: 5 },
                    { icon: "bi-incognito", count: 3 },
                  ]
                ).map((r, i) => (
                  <div
                    key={i}
                    className="reaction-item"
                    onClick={() => handleReaction(uniqueMsgId, r.icon)}
                  >
                    <i className={`bi ${r.icon} reaction-svg-icon`}></i>
                    <span className="reaction-count">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nested Reply Input */}
            {activeReplyId === msg.id && (
              <div className="mt-2 animate-fade-in nested-input-box">
                <div className="d-flex gap-2 align-items-center p-2 rounded bg-dark border border-secondary shadow-lg">
                  <Form.Control
                    size="sm"
                    autoFocus
                    className="transparent-input"
                    placeholder={`Replying to ${msg.user.username}...`}
                    value={replyContents[pId] || ""}
                    onChange={(e) =>
                      setReplyContents({
                        ...replyContents,
                        [pId]: e.target.value,
                      })
                    }
                    onKeyPress={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleReply(pId)
                    }
                  />
                  <Button
                    variant="success"
                    size="sm"
                    className="send-btn"
                    onClick={() => handleReply(pId)}
                  >
                    <i className="bi bi-send-fill"></i>
                  </Button>
                </div>
              </div>
            )}

            {!isReply && msg.replies && msg.replies.length > 0 && (
              <div className="thread-container mt-3">
                {msg.replies.map((reply) => renderMessage(reply, true, msg.id))}
              </div>
            )}
            {isReply && msg.replies && msg.replies.length > 0 && (
              <div className="thread-container mt-2">
                {msg.replies.map((reply) => renderMessage(reply, true, pId))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="forum-container pt-3 mt-md-0 bg-dark pb-5 mb-5">
      <Container fluid className="px-3 px-md-4 py-2">
        <Row className="m-0 forum-board">
          {/* Mobile Channel Selector */}
          <Col
            xs={12}
            className="d-block d-md-none p-4 bg-dark border-bottom border-secondary border-opacity-25 shadow-lg"
          >
            <Form.Group className="mx-auto" style={{ maxWidth: "400px" }}>
              <Form.Label
                className="text-secondary small fw-bold mb-3 d-block text-center"
                style={{ letterSpacing: "2px" }}
              >
                ENGAGE CHANNELS
              </Form.Label>
              <div className="dropdown w-100">
                <Button
                  variant="outline-info"
                  className="w-100 on-brand-dropdown-toggle d-flex justify-content-between align-items-center py-3 px-4"
                  onClick={(e) => {
                    const menu = e.currentTarget.nextElementSibling;
                    menu.classList.toggle("show");
                  }}
                  style={{
                    borderRadius: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(13, 202, 240, 0.4)",
                    fontSize: "1rem",
                    fontWeight: "600",
                  }}
                >
                  <span className="flex-grow-1 text-center">
                    # {activeChannel}
                  </span>
                  <i className="bi bi-chevron-down ms-2"></i>
                </Button>
                <div
                  className="dropdown-menu dropdown-menu-dark w-100 shadow-lg border-secondary anim-slide-in"
                  style={{
                    backgroundColor: "#0a0a0a",
                    borderRadius: "12px",
                    marginTop: "8px",
                    padding: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {channels.map((ch) => (
                    <div
                      key={ch}
                      className={`dropdown-item py-3 px-4 rounded-3 mb-1 d-flex align-items-center justify-content-center ${activeChannel === ch ? "active bg-info text-dark" : "text-light"}`}
                      onClick={(e) => {
                        setActiveChannel(ch);
                        e.currentTarget.parentElement.classList.remove("show");
                      }}
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                    >
                      # {ch}
                    </div>
                  ))}
                </div>
              </div>
            </Form.Group>
          </Col>

          <Col
            xs={12}
            md={3}
            lg={3}
            className="forum-sidebar p-0 border-end border-secondary border-opacity-25 d-none d-md-block"
          >
            <div className="sidebar-header p-4 pb-2">
              <h6
                className="mb-0 fw-bold text-white d-flex align-items-center gap-2"
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  color: "#636363",
                }}
              >
                CHANNELS
              </h6>
            </div>

            <div className="channels-list px-2 py-2">
              {channels.map((ch) => (
                <div
                  key={ch}
                  onClick={() => setActiveChannel(ch)}
                  className={`px-3 py-2 rounded mb-1 cursor-pointer d-flex align-items-center gap-2 ${activeChannel === ch ? "bg-secondary bg-opacity-25 text-white" : "text-secondary opacity-75"}`}
                  style={{
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <span
                    className={
                      activeChannel === ch ? "text-primary" : "text-secondary"
                    }
                  >
                    #
                  </span>
                  {ch}
                </div>
              ))}
            </div>

            <div className="px-4 mt-1">
              <Button
                variant="outline-secondary"
                size="sm"
                className="w-100 py-1 text-start d-flex align-items-center gap-2"
                style={{
                  fontSize: "0.65rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#ababad",
                }}
                onClick={() => setShowNewThreadModal(true)}
              >
                <i className="bi bi-plus-lg"></i> New Discussion
              </Button>
            </div>
            <div class="px-4 mt-4">
              <Badge
                bg="dark"
                className="border border-success text-success"
                style={{ backgroundColor: "transparent" }}
              >
                <i
                  className="bi bi-circle-fill me-1"
                  style={{ fontSize: "0.5rem" }}
                ></i>{" "}
                12 Online
              </Badge>
            </div>
          </Col>
          {/* Main Chat Area */}
          <Col
            xs={12}
            md={9}
            lg={9}
            className="p-0 position-relative d-flex flex-column border-end border-secondary border-opacity-25 forum-chat-col"
          >
            <div className="chat-area flex-grow-1 overflow-auto border-0">
              <div className="channel-header d-flex justify-content-between align-items-center mb-4">
                <div className="px-4 py-3">
                  <span
                    className="text-secondary small fw-bold uppercase"
                    style={{ letterSpacing: "0.05rem", fontSize: "0.7rem" }}
                  >
                    CHANNELS / {activeChannel}
                  </span>
                </div>
              </div>

              <div
                className="messages-list px-4"
                style={{ paddingBottom: "120px" }}
              >
                {posts.map((post) => renderMessage(post))}
              </div>
            </div>

            <div
              className={`message-input-container shadow-lg ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Form onSubmit={handleSubmit}>
                <input
                  className="message-input"
                  placeholder={`Message #${activeChannel}...`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="input-actions d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-secondary position-relative">
                  <div className="d-flex gap-3 text-muted align-items-center">
                    <div
                      className={`upload-btn-styled ${file ? "active" : ""}`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="bi bi-paperclip fw-bold"></i>
                      <span>{file ? "Attached" : "Attach"}</span>
                    </div>
                    {file && (
                      <div className="file-name-badge">
                        <div
                          className="unattach-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          title="Unattach file"
                        >
                          <i className="bi bi-x"></i>
                        </div>
                        <i className="bi bi-file-earmark-text mx-1"></i>
                        <span className="text-truncate">{file.name}</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="d-none"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </div>

                  {!file && (
                    <div
                      className="position-absolute start-50 translate-middle-x pointer-events-none d-none d-lg-flex align-items-center justify-content-center"
                      style={{
                        pointerEvents: "none",
                        height: "40px",
                        width: "calc(100% - 200px)",
                        border: "2px dashed rgba(0, 123, 255, 0.4)",
                        borderRadius: "8px",
                        backgroundColor: "rgba(0, 123, 255, 0.02)",
                      }}
                    >
                      <span
                        className="drag-drop-hint opacity-100 fw-bold"
                        style={{ fontSize: "0.8rem", color: "#007bff" }}
                      >
                        drag your file here
                      </span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="success"
                    size="sm"
                    className="send-btn-main"
                  >
                    Send <i className="bi bi-send-fill ms-1"></i>
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>

      {/* New Discussion Modal */}
      <Modal
        show={showNewThreadModal}
        onHide={() => setShowNewThreadModal(false)}
        centered
        contentClassName="bg-dark text-white border-secondary"
      >
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title style={{ fontSize: "1rem" }}>
            Start New Discussion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="small text-secondary">
              Channel Name
            </Form.Label>
            <Form.Control
              autoFocus
              className="bg-dark text-white border-secondary"
              placeholder="e.g. quarterly-planning"
              value={newChannelInput}
              onChange={(e) => setNewChannelInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleNewDiscussion()}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowNewThreadModal(false)}
          >
            Cancel
          </Button>
          <Button variant="success" size="sm" onClick={handleNewDiscussion}>
            Create Channel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Zoom Modal */}
      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        centered
        size="xl"
        contentClassName="bg-transparent border-0"
        onClick={() => setShowImageModal(false)}
      >
        <Modal.Body className="p-0 d-flex justify-content-center align-items-center">
          <img
            src={selectedImage}
            alt="Zoomed attachment"
            style={{
              maxWidth: "100%",
              maxHeight: "90vh",
              objectFit: "contain",
              cursor: "zoom-out",
            }}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ForumPage;
