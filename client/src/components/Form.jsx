import { useState } from 'react';
import Button from './Button';
import Notification from './Notification';
import '../styles/forms.css';

export default function DynamicForm({ fields, onSubmit, title, subtitle, message, clearMessage }) {
  // Inicializamos el estado dinámicamente según los campos recibidos
  const initialState = fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});

  const [formData, setFormData] = useState(initialState);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Enviamos los datos al servidor
    onSubmit(formData);
    // Limpiamos el formulario tras el envío
    setFormData(initialState);
  };

  return (
    <div className="form_container">
      <form onSubmit={handleSubmit} className="form">
        {title && <h2>{title}</h2>}
        {subtitle && <p>{subtitle}</p>}
        
        {fields.map((field) => {
          
          if (field.showIf) {
            const valorDelCampoDependiente = formData[field.showIf.field];
            if (valorDelCampoDependiente !== field.showIf.value) {
              return null; 
            }
          }

          return (
            <div key={field.name} className="input-group">
              <label htmlFor={field.name}>{field.label}</label>
              
              {/* RENDERIZADO SEGÚN EL TIPO (SELECT O INPUT) */}
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="custom-select"
                >
                  <option value="" disabled>Seleccione una opción...</option>
                  {field.options && field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  // Manejo especial para archivos vs texto
                  {...(field.type !== 'file' 
                    ? { value: formData[field.name] || '' } 
                    : {}
                  )}
                  onChange={(e) => {
                    const val = field.type === 'file' ? e.target.files[0] : e.target.value;
                    handleChange(field.name, val);
                  }}
                />
              )}
            </div>
          );
        })}
        
              
      <div className="form-actions">
        <Button type="submit" variant="primary">
          Guardar Cambios
        </Button>
      </div>
        {/* Notificación de éxito o error */}
        {message && message.text && (
          <Notification 
            text={message.text} 
            type={message.type} 
            onClose={clearMessage} 
            location={message.target} 
            currentTarget="form"
          />
        )}
      </form>
    </div>
  );
}