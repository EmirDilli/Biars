function ImageModal({ src, onClose }) {
    if (!src) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <img src={src} alt="Zoomed" />
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default ImageModal;