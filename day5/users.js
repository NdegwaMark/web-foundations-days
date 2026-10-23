const loadUsersButton = document.getElementById('load-users');
const filterInput = document.getElementById('filter-input');
const statusElement = document.getElementById('status');
const usersListElement = document.getElementById('users-list');

const USERS_URL = 'https://jsonplaceholder.typicode.com/users';
let users = [];

function setStatus(message) {
  statusElement.textContent = message;
}

function clearUsers() {
  usersListElement.textContent = '';
}

function createUserListItem(user) {
  const item = document.createElement('li');

  const name = document.createElement('h2');
  name.textContent = user.name;

  const email = document.createElement('p');
  email.textContent = 'Email: ' + user.email;

  const city = document.createElement('p');
  city.textContent = 'City: ' + user.address.city;

  const company = document.createElement('p');
  company.textContent = 'Company: ' + user.company.name;

  item.appendChild(name);
  item.appendChild(email);
  item.appendChild(city);
  item.appendChild(company);

  return item;
}

function renderUsers(list) {
  clearUsers();

  if (list.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No users match your filter.';
    usersListElement.appendChild(emptyItem);
    return;
  }

  list.forEach(function (user) {
    usersListElement.appendChild(createUserListItem(user));
  });
}

async function loadUsers() {
  loadUsersButton.disabled = true;
  setStatus('Loading users...');
  clearUsers();

  try {
    const response = await fetch(USERS_URL);

    if (!response.ok) {
      throw new Error('Request failed with status ' + response.status);
    }

    users = await response.json();
    renderUsers(users);
    setStatus('Loaded ' + users.length + ' users.');
  } catch (error) {
    users = [];
    clearUsers();
    setStatus('Error loading users: ' + error.message);
  } finally {
    loadUsersButton.disabled = false;
  }
}

loadUsersButton.addEventListener('click', loadUsers);

filterInput.addEventListener('input', function () {
  const query = filterInput.value.trim().toLowerCase();
  const filteredUsers = users.filter(function (user) {
    return user.name.toLowerCase().includes(query);
  });

  renderUsers(filteredUsers);
});
