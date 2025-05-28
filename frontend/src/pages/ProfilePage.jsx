import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { fetchProfile, updateProfile } from '../services/api';

const styles = {
  container:      { maxWidth: 600, margin: '2rem auto', padding: '1rem', fontFamily: 'Arial, sans-serif' },
  heading:        { textAlign: 'center', marginBottom: '2rem' },
  avatarSection:  { textAlign: 'center', marginBottom: '2rem' },
  avatarDrop:     { display: 'inline-block', width: 120, height: 120, border: '2px dashed #ccc', borderRadius: '50%', lineHeight: '120px', fontSize: '2rem', color: '#888', cursor: 'pointer', overflow: 'hidden' },
  avatarImg:      { width: '100%', height: '100%', objectFit: 'cover' },
  emailText:      { marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' },
  bioText:        { marginTop: '1rem', fontStyle: 'italic', color: '#666' },
  sectionList:    { listStyle: 'none', padding: 0, margin: '1rem 0' },
  sectionItem:    { padding: '0.75rem 1rem', border: '1px solid #ddd', borderRadius: 4, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  field:          { marginBottom: '1.5rem' },
  label:          { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' },
  input:          { width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: 4, border: '1px solid #ccc' },
  textarea:       { width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: 4, border: '1px solid #ccc', minHeight: 80 },
  buttonGroup:    { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' },
  button:         { padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: 4, border: 'none', cursor: 'pointer' },
  saveButton:     { backgroundColor: '#007bff', color: '#fff' },
  cancelButton:   { backgroundColor: '#6c757d', color: '#fff' }
};

export default function ProfilePage() {
  const { updateUserProfile } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const navigate = useNavigate();

  // Carga inicial
  useEffect(() => {
    fetchProfile()
      .then(({ data }) => {
        const safe = { ...data, ratings: Array.isArray(data.ratings) ? data.ratings : [] };
        setProfile(safe);
        if (safe.avatar) setPreview(safe.avatar);
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  }, [navigate]);

  // Selección de nuevo avatar
  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    setProfile(p => ({ ...p, avatar: file }));
    setPreview(URL.createObjectURL(file));
  };

  // Función para guardar solo avatar
  const saveAvatar = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('avatar', profile.avatar);
      const { data } = await updateProfile(form);
      updateUserProfile(form);
      setProfile(prev => ({ ...prev, avatar: data.avatar }));
      setPreview(data.avatar);
    } catch {
      alert('Error guardando avatar.');
    } finally {
      setLoading(false);
    }
  };

  // Inline edit handlers
  const startEdit = field => {
    setEditMode(field);
    setTempValue(profile[field] || '');
  };
  const cancelEdit = () => {
    setEditMode(null);
    setTempValue('');
  };
  const saveEdit = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append(editMode, tempValue);
      if (profile.avatar instanceof File) {
        form.append('avatar', profile.avatar);
      }
      const { data } = await updateProfile(form);
      updateUserProfile(form);
      setProfile(prev => ({ ...prev, [editMode]: tempValue }));
      setEditMode(null);
      setTempValue('');
    } catch {
      alert('Error guardando cambios.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <p>Cargando perfil…</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Mi Perfil</h1>

      <div style={styles.avatarSection}>
        <label>
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          <div style={styles.avatarDrop}>
            {preview ? <img src={preview} alt="avatar" style={styles.avatarImg} /> : '📷'}
          </div>
        </label>
        <div style={styles.emailText}>{profile.email}</div>
        {profile.bio && <p style={styles.bioText}>{profile.bio}</p>}
        {profile.avatar instanceof File && (
          <button
            onClick={saveAvatar}
            style={{ ...styles.button, ...styles.saveButton, marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Guardando avatar…' : 'Guardar avatar'}
          </button>
        )}
      </div>

      <ul style={styles.sectionList}>
        <li style={styles.sectionItem} onClick={() => startEdit('username')}>
          <span>Cambiar usuario</span><span>›</span>
        </li>
        <li style={styles.sectionItem} onClick={() => navigate('/cambiar-contraseña')}>
          <span>Cambiar contraseña</span><span>›</span>
        </li>
        <li style={styles.sectionItem} onClick={() => startEdit('bio')}>
          <span>Editar biografía</span><span>›</span>
        </li>
      </ul>

      {editMode && (
        <div style={styles.field}>
          <label style={styles.label}>{editMode === 'username' ? 'Nuevo usuario' : 'Biografía'}</label>
          {editMode === 'username' ? (
            <input value={tempValue} onChange={e => setTempValue(e.target.value)} style={styles.input} />
          ) : (
            <textarea value={tempValue} onChange={e => setTempValue(e.target.value)} style={styles.textarea} />
          )}
          <div style={styles.buttonGroup}>
            <button onClick={cancelEdit} style={{ ...styles.button, ...styles.cancelButton }} disabled={loading}>
              Cancelar
            </button>
            <button onClick={saveEdit} style={{ ...styles.button, ...styles.saveButton }} disabled={loading}>
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      <div style={styles.field}>
        <h2>Valoraciones</h2>
        {(profile.ratings?.length ?? 0) === 0 ? (
          <p>Aún no tienes valoraciones.</p>
        ) : (
          <ul>
            {profile.ratings.map((r, i) => (
              <li key={i}>
                <strong>{r.author}:</strong> {r.score} ★ — “{r.comment}”
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
