import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiUser, FiClock, FiCheck, FiX, FiEye, FiTrash2 } from 'react-icons/fi';
import { getContacts, updateContactStatus, deleteContact } from '../../../services/api';

const ContactManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateContactStatus(id, status);
      setContacts(contacts.map(contact => 
        contact.id === id ? { ...contact, status } : contact
      ));
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
      try {
        await deleteContact(id);
        setContacts(contacts.filter(contact => contact.id !== id));
        setSelectedContact(null);
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (filter === 'all') return true;
    return contact.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Kontak Kami</h2>
        <div className="flex space-x-2">
          {['all', 'new', 'read', 'replied'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Semua' : status === 'new' ? 'Baru' : status === 'read' ? 'Dibaca' : 'Dibalas'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Daftar Pesan ({filteredContacts.length})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FiMail className="mx-auto h-12 w-12 mb-4" />
                <p>Tidak ada pesan</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className={`p-4 border-b cursor-pointer ${
                    selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <FiUser className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{contact.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                      {contact.status === 'new' ? 'Baru' : contact.status === 'read' ? 'Dibaca' : 'Dibalas'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{contact.subject}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <FiClock className="h-3 w-3 mr-1" />
                    {formatDate(contact.created_at)}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Contact Detail */}
        <div className="bg-white rounded-lg shadow">
          {selectedContact ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedContact.name}</h3>
                    <p className="text-sm text-gray-600">{selectedContact.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedContact.id, 'read')}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                      title="Tandai sebagai dibaca"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedContact.id, 'replied')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Tandai sebagai dibalas"
                    >
                      <FiCheck className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedContact.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Hapus pesan"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Subjek:</h4>
                  <p className="text-gray-700">{selectedContact.subject}</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Pesan:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Dikirim pada: {formatDate(selectedContact.created_at)}</p>
                  {selectedContact.updated_at !== selectedContact.created_at && (
                    <p>Diperbarui: {formatDate(selectedContact.updated_at)}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FiMail className="mx-auto h-12 w-12 mb-4" />
                <p>Pilih pesan untuk melihat detail</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactManager;