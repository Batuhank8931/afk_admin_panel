import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import './Users.css'; // Import a CSS file for custom styles

const fetchUsers = async () => {
  try {
    const response = await fetch('https://direct.afkmotorsfinans.com/get_user.php');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

const updatePassword = async (id, newPassword) => {
  try {
    const response = await fetch('https://direct.afkmotorsfinans.com/add_password.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, sifre: newPassword })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating password:', error);
    return null;
  }
};

const downloadUserData = (userData) => {
  const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `user_${userData.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function Users() {
  const [users, setUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    };
    loadUsers();
  }, []);

  const sortData = (key) => {
    let sortedUsers = [...users];
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      sortedUsers.reverse();
      setSortConfig({ key, direction: 'descending' });
    } else {
      sortedUsers.sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
      });
      setSortConfig({ key, direction: 'ascending' });
    }
    setUsers(sortedUsers);
  };

  const filteredUsers = users.filter(user =>
    Object.values(user).some(val => val.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderHeader = (key, displayName) => (
    <th key={key}>
      <div className="d-flex align-items-center">
        {displayName}
        <button className="btn btn-link p-0 ms-1 d-flex align-items-center" onClick={() => sortData(key)}>
          <img src="/sort.png" alt="sort icon" style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    </th>
  );

  const handleResetClick = (user) => {
    setSelectedUser(user);
    setNewPassword('');
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handlePasswordSubmit = async () => {
    const updatedUser = await updatePassword(selectedUser.id, newPassword);
    if (updatedUser) {
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, sifre: newPassword } : user
      ));
      setSelectedUser(null);
    }
  };

  return (
    <div>
      <Header title="Kullanıcılar" />
      <div className="container mt-5">
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search for users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="table-container">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                {renderHeader('id', 'ID')}
                {renderHeader('tarih', 'Tarih')}
                {renderHeader('isim', 'İsim')}
                {renderHeader('soyisim', 'Soyisim')}
                {renderHeader('telefon', 'Telefon')}
                {renderHeader('email', 'E-posta')}
                {renderHeader('sifre', 'Şifre')}
                <th>Reset</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.tarih}</td>
                  <td>{user.isim}</td>
                  <td>{user.soyisim}</td>
                  <td>{user.telefon}</td>
                  <td>{user.email}</td>
                  <td>{user.sifre}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleResetClick(user)}>Reset</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reset Password for {selectedUser.isim} {selectedUser.soyisim}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedUser(null)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handlePasswordSubmit}>Save changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
