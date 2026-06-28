const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Generic request helper.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('eduquest_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Auth & Profile
  auth: {
    login: (usernameOrEmail, password) => 
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail, password })
      }),
    
    register: (username, email, password, character) => 
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, character })
      }),
    
    getProfile: () => request('/auth/profile'),
    
    updateAvatar: (avatarId) => 
      request('/auth/profile/avatar', {
        method: 'PUT',
        body: JSON.stringify({ avatarId })
      }),
    
    getCharacters: () => request('/auth/characters')
  },

  // Game & Levels
  game: {
    getSubjects: () => request('/game/subjects'),
    
    getLevels: (subjectId) => request(`/game/subjects/${subjectId}/levels`),
    
    getQuestions: (levelId) => request(`/game/levels/${levelId}/questions`),
    
    checkAnswer: (questionId, selectedOption) => 
      request(`/game/questions/${questionId}/check`, {
        method: 'POST',
        body: JSON.stringify({ selectedOption })
      }),
    
    completeLevel: (levelId) => 
      request(`/game/levels/${levelId}/complete`, {
        method: 'POST'
      }),
    
    getAIHint: (questionId) => 
      request(`/game/questions/${questionId}/hint`, {
        method: 'POST'
      })
  },

  // Social & Competitive
  social: {
    getLeaderboard: () => request('/social/leaderboard'),
    
    getFriends: () => request('/social/friends'),
    
    sendFriendRequest: (friendUsername) => 
      request('/social/friends/request', {
        method: 'POST',
        body: JSON.stringify({ friendUsername })
      }),
    
    acceptFriendRequest: (friendId) => 
      request('/social/friends/accept', {
        method: 'POST',
        body: JSON.stringify({ friendId })
      }),
    
    removeFriend: (friendId) => 
      request(`/social/friends/${friendId}`, {
        method: 'DELETE'
      })
  }
};
