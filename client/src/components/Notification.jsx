import { useEffect } from "react";

export default function Notification({ text, type, onClose, location, currentTarget }) {
  useEffect(() => {
    // Solo activamos el timer si el mensaje es para esta ubicación específica
    if (text && location === currentTarget) {
      const timer = setTimeout(() => {
        onClose(); 
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [text, onClose, location, currentTarget]);

  // Si no hay texto O la ubicación no coincide, no renderizamos nada
  if (!text || location !== currentTarget) return null;

  return (
    <div className={`message-box ${type}`}>
      <p className="message-text">{text}</p>
    </div>
  );
}