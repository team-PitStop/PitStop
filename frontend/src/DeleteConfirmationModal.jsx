// DeleteConfirmationModal.jsx
// US-5: Delete a Vehicle
// This is a reusable popup that asks "Are you sure you want to delete this vehicle?"
// before actually deleting it. Required by the acceptance criteria.

// Props this component accepts from its parent:
//   - isOpen: whether the modal should show (true/false)
//   - onClose: function to call when user clicks Cancel
//   - onConfirm: function to call when user clicks Yes/Delete
//   - vehicleName: optional name to show in the message (e.g., "2018 Honda Civic")

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, vehicleName }) {
  // If the modal isn't supposed to be open, render nothing
  if (!isOpen) return null;

  return (
    // The dark background overlay - clicking it closes the modal
    <div className="modal-overlay" onClick={onClose}>
      {/*
        The actual modal box. e.stopPropagation() prevents clicks INSIDE the
        modal from closing it (which would happen because clicks bubble up
        to the overlay).
      */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Delete Vehicle?</h3>

        <p>
          Are you sure you want to delete{" "}
          <strong>{vehicleName || "this vehicle"}</strong>?
          <br />
          This action cannot be undone.
        </p>

        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-delete" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;