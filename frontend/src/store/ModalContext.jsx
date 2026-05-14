import React, { createContext, useContext, useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    isConfirm: false,
    variant: "primary", // primary, success, danger
  });

  const showPrompt = (message, title = "Notice", variant = "primary") => {
    setModalConfig({
      show: true,
      title,
      message,
      onConfirm: null,
      isConfirm: false,
      variant,
    });
  };

  const showConfirm = (
    message,
    onConfirm,
    title = "Are you sure?",
    variant = "danger",
  ) => {
    setModalConfig({
      show: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        closeModal();
      },
      isConfirm: true,
      variant,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, show: false }));
  };

  return (
    <ModalContext.Provider value={{ showPrompt, showConfirm, closeModal }}>
      {children}
      <Modal
        show={modalConfig.show}
        onHide={closeModal}
        centered
        className="custom-system-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title
            className={`w-100 text-center fw-bold fs-4 text-${modalConfig.variant}`}
          >
            {modalConfig.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-3 text-center fs-5">
          {modalConfig.message}
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center pb-4">
          {modalConfig.isConfirm ? (
            <>
              <Button
                variant="light"
                onClick={closeModal}
                className="px-4 rounded-pill fw-bold"
              >
                Cancel
              </Button>
              <Button
                variant={modalConfig.variant}
                onClick={modalConfig.onConfirm}
                className="px-4 rounded-pill fw-bold"
              >
                Confirm
              </Button>
            </>
          ) : (
            <Button
              variant={modalConfig.variant}
              onClick={closeModal}
              className="px-5 rounded-pill fw-bold"
            >
              OK
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
