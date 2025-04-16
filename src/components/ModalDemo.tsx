import React, { useState } from "react";
import Button from "./Button";
import Modal from "./Modal";
import Typography from "./Typography";

const ModalDemo: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <div>
      <Button variant="primary" onClick={() => setModalOpen(true)}>
        Open Modal
      </Button>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <Typography variant="h3" className="mb-4">
          Modal Title
        </Typography>
        <p>This is the modal content.</p>
        <Button variant="secondary" onClick={() => setModalOpen(false)}>
          Close
        </Button>
      </Modal>
    </div>
  );
};

export default ModalDemo;
