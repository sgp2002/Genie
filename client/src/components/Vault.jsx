import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Key, Server, TestTube, ArrowLeft } from 'lucide-react';

const Vault = ({ onBack, currentUser }) => {
  const [credentials, setCredentials] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    username: '',
    password: '',
    ssh_key: '',
    connection_type: 'ssh',
    port: 22
  });

  // Load credentials on mount
  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/vault/credentials', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCredentials(data);
      }
    } catch (err) {
      console.error('Error loading credentials:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `http://127.0.0.1:8000/api/vault/credentials/${editingId}`
        : 'http://127.0.0.1:8000/api/vault/credentials';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save credential');
      }

      setSuccess(editingId ? 'Credential updated successfully' : 'Credential added successfully');
      setShowAddForm(false);
      setEditingId(null);
      resetForm();
      loadCredentials();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (credential) => {
    setFormData({
      name: credential.name,
      host: credential.host,
      username: credential.username || '',
      password: '', // Don't show password
      ssh_key: '', // Don't show SSH key
      connection_type: credential.connection_type || 'ssh',
      port: credential.port || 22
    });
    setEditingId(credential.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this credential?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/vault/credentials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Credential deleted successfully');
        loadCredentials();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to delete credential');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTest = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/vault/credentials/${id}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Connection test successful!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Connection test failed');
      }
    } catch (err) {
      setError(err.message);
    }
    setTimeout(() => setSuccess(''), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      host: '',
      username: '',
      password: '',
      ssh_key: '',
      connection_type: 'ssh',
      port: 22
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-qe-bg-primary">
      {/* Header */}
      <header className="w-full bg-qe-bg-primary border-b border-qe-border shadow-lg">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-qe-text-secondary hover:text-qe-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            <div className="h-6 w-px bg-qe-border" />
            <div className="flex items-center space-x-3">
              <Key className="w-6 h-6 text-qe-accent" />
              <h1 className="text-lg font-medium text-qe-text-primary">
                Credential Vault
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Add Credential Button */}
        {!showAddForm && (
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-qe-text-primary mb-2">
                Your Credentials
              </h2>
              <p className="text-qe-text-secondary">
                Manage your server credentials securely. All credentials are encrypted.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-qe-accent hover:bg-qe-accent/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Credential
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-6 bg-qe-bg-secondary rounded-lg border border-qe-border p-6">
            <h3 className="text-xl font-semibold text-qe-text-primary mb-4">
              {editingId ? 'Edit Credential' : 'Add New Credential'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-qe-text-primary mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-qe-bg-primary border border-qe-border rounded-lg text-qe-text-primary focus:outline-none focus:ring-2 focus:ring-qe-accent"
                    placeholder="e.g., Production Server"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-qe-text-primary mb-2">
                    Host/IP *
                  </label>
                  <input
                    type="text"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-qe-bg-primary border border-qe-border rounded-lg text-qe-text-primary focus:outline-none focus:ring-2 focus:ring-qe-accent"
                    placeholder="192.168.1.100 or hostname"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-qe-text-primary mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-qe-bg-primary border border-qe-border rounded-lg text-qe-text-primary focus:outline-none focus:ring-2 focus:ring-qe-accent"
                    placeholder="admin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-qe-text-primary mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 22 })}
                    className="w-full px-4 py-2 bg-qe-bg-primary border border-qe-border rounded-lg text-qe-text-primary focus:outline-none focus:ring-2 focus:ring-qe-accent"
                    placeholder="22"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-qe-text-primary mb-2">
                  Connection Type
                </label>
                <select
                  value={formData.connection_type}
                  onChange={(e) => setFormData({ ...formData, connection_type: e.target.value })}
                  className="w-full px-4 py-2 bg-qe-bg-primary border border-qe-border rounded-lg text-qe-text-primary focus:outline-none focus:ring-2 focus:ring-qe-accent"
                >
                  <option value="ssh">SSH</option>
                  <option value="local">Local</option>
                  <option value="winrm">WinRM (Windows)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-qe-text-primary mb-2">
                  Password {formData.connection_type !== 'local' && '(optional if using SSH key)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 bg-qe-bg-primary border border-qe-border rounded-lg text-qe-text-primary focus:outline-none focus:ring-2 focus:ring-qe-accent"
                  placeholder={editingId ? 'Leave blank to keep existing' : 'Enter password'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-qe-text-primary mb-2">
                  SSH Private Key {formData.connection_type === 'ssh' && '(recommended)'}
                </label>
                <textarea
                  value={formData.ssh_key}
                  onChange={(e) => setFormData({ ...formData, ssh_key: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-qe-bg-primary border border-qe-border rounded-lg text-qe-text-primary focus:outline-none focus:ring-2 focus:ring-qe-accent font-mono text-sm"
                  placeholder={editingId ? 'Leave blank to keep existing' : '-----BEGIN RSA PRIVATE KEY-----\n...'}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-qe-accent hover:bg-qe-accent/90 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-qe-bg-primary hover:bg-qe-bg-secondary border border-qe-border text-qe-text-primary font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Credentials List */}
        {!showAddForm && (
          <div className="space-y-4">
            {credentials.length === 0 ? (
              <div className="text-center py-12 bg-qe-bg-secondary rounded-lg border border-qe-border">
                <Key className="w-12 h-12 text-qe-text-secondary mx-auto mb-4" />
                <p className="text-qe-text-secondary mb-2">No credentials yet</p>
                <p className="text-sm text-qe-text-secondary">
                  Add your first credential to get started
                </p>
              </div>
            ) : (
              credentials.map((credential) => (
                <div
                  key={credential.id}
                  className="bg-qe-bg-secondary rounded-lg border border-qe-border p-6 hover:border-qe-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Server className="w-5 h-5 text-qe-accent" />
                        <h3 className="text-lg font-semibold text-qe-text-primary">
                          {credential.name}
                        </h3>
                        <span className="px-2 py-1 text-xs bg-qe-accent/20 text-qe-accent rounded">
                          {credential.connection_type.toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-qe-text-secondary ml-8">
                        <p>
                          <span className="font-medium">Host:</span> {credential.host}
                          {credential.port && credential.port !== 22 && `:${credential.port}`}
                        </p>
                        {credential.username && (
                          <p>
                            <span className="font-medium">User:</span> {credential.username}
                          </p>
                        )}
                        {credential.last_used_at && (
                          <p>
                            <span className="font-medium">Last used:</span>{' '}
                            {new Date(credential.last_used_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTest(credential.id)}
                        className="p-2 text-qe-text-secondary hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Test Connection"
                      >
                        <TestTube className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(credential)}
                        className="p-2 text-qe-text-secondary hover:text-qe-accent hover:bg-qe-accent/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(credential.id)}
                        className="p-2 text-qe-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Vault;
