import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { api } from '../utils/api';
import { Avatar } from '../utils/avatars';
import { 
  Trophy, 
  Users, 
  UserPlus, 
  UserMinus, 
  UserCheck, 
  Search, 
  Loader2, 
  AlertCircle, 
  Flame, 
  Award,
  Zap
} from 'lucide-react';

export default function Social() {
  const { user } = useAuth();
  const { click, correct, incorrect } = useSound();

  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' or 'friends'
  const [leaderboard, setLeaderboard] = useState([]);
  const [friendsData, setFriendsData] = useState({ friends: [], incomingRequests: [], outgoingRequests: [] });
  
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState('');
  const [socialMessage, setSocialMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    loadSocialData();
  }, [activeTab]);

  async function loadSocialData() {
    setLoading(true);
    setSocialMessage({ text: '', type: '' });
    try {
      if (activeTab === 'leaderboard') {
        const data = await api.social.getLeaderboard();
        setLeaderboard(data);
      } else {
        const data = await api.social.getFriends();
        setFriendsData(data);
      }
    } catch (err) {
      console.error('Failed to load social data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleTabChange = (tab) => {
    click();
    setActiveTab(tab);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    setSubmittingRequest(true);
    setSocialMessage({ text: '', type: '' });
    click();

    try {
      const res = await api.social.sendFriendRequest(searchUsername.trim());
      correct();
      setSocialMessage({ text: res.message, type: 'success' });
      setSearchUsername('');
      // Reload friends list if we are on friends tab
      if (activeTab === 'friends') {
        const data = await api.social.getFriends();
        setFriendsData(data);
      }
    } catch (err) {
      incorrect();
      setSocialMessage({ text: err.message, type: 'error' });
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleAcceptRequest = async (friendId) => {
    click();
    try {
      await api.social.acceptFriendRequest(friendId);
      correct();
      // Reload
      const data = await api.social.getFriends();
      setFriendsData(data);
    } catch (err) {
      incorrect();
      setSocialMessage({ text: err.message, type: 'error' });
    }
  };

  const handleRemoveFriend = async (friendId) => {
    click();
    try {
      await api.social.removeFriend(friendId);
      // Reload
      const data = await api.social.getFriends();
      setFriendsData(data);
    } catch (err) {
      console.error('Remove friend error:', err);
    }
  };

  return (
    <div className="flex-1 bg-dark-bg p-6 md:p-12 text-gray-200 min-h-[calc(100vh-73px)] relative">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-brand-purple/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-brand-cyan/5 blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto z-10 relative space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex justify-between items-center flex-col sm:flex-row gap-4 border-b border-white/5 pb-4">
          <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => handleTabChange('leaderboard')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </button>
            <button
              onClick={() => handleTabChange('friends')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'friends'
                  ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              Friends Hub
            </button>
          </div>

          {/* Add Friend Form (Quick Search) */}
          <form onSubmit={handleSendRequest} className="w-full sm:w-auto flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Find hero by username..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-brand-purple/60 transition-all font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={submittingRequest || !searchUsername.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold rounded-xl text-xs transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
            >
              {submittingRequest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              Add Friend
            </button>
          </form>
        </div>

        {/* Global Feedback Notifications */}
        {socialMessage.text && (
          <div className={`p-4 rounded-2xl border flex items-start gap-2.5 text-sm animate-sparkle ${
            socialMessage.type === 'success'
              ? 'bg-game-success/10 border-game-success/20 text-green-300'
              : 'bg-game-error/10 border-game-error/25 text-red-300'
          }`}>
            <AlertCircle className={`w-5 h-5 shrink-0 ${socialMessage.type === 'success' ? 'text-game-success' : 'text-game-error'}`} />
            <span>{socialMessage.text}</span>
          </div>
        )}

        {/* Main Display panel */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-brand-purple mb-3" />
            <p className="text-sm text-gray-400 font-display">Syncing with server...</p>
          </div>
        ) : activeTab === 'leaderboard' ? (
          /* LEADERBOARD VIEW */
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="px-6 py-4 bg-white/3 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-display font-extrabold text-lg text-white">Global Standings</h3>
              <span className="text-xs text-brand-cyan font-bold font-mono">Top 50 Players</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-widest font-bold bg-white/1">
                    <th className="py-4 px-6 text-center w-16">Rank</th>
                    <th className="py-4 px-6">Hero</th>
                    <th className="py-4 px-6 text-center w-24">Level</th>
                    <th className="py-4 px-6 text-center w-24">Streak</th>
                    <th className="py-4 px-6 text-right w-32">Total XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard.map((row) => {
                    const isCurrentUser = row.id === user.id;
                    
                    let rankBadgeStyles = 'text-gray-400 font-mono';
                    if (row.rank === 1) rankBadgeStyles = 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 w-7 h-7 rounded-full flex items-center justify-center mx-auto font-black';
                    else if (row.rank === 2) rankBadgeStyles = 'bg-slate-300/15 text-slate-300 border border-slate-300/30 w-7 h-7 rounded-full flex items-center justify-center mx-auto font-black';
                    else if (row.rank === 3) rankBadgeStyles = 'bg-amber-700/15 text-amber-700 border border-amber-700/30 w-7 h-7 rounded-full flex items-center justify-center mx-auto font-black';

                    return (
                      <tr 
                        key={row.id}
                        className={`transition-colors hover:bg-white/2 ${
                          isCurrentUser 
                            ? 'bg-brand-purple/10 border-y border-brand-purple/20' 
                            : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-6 text-center">
                          <span className={`${rankBadgeStyles}`}>
                            {row.rank}
                          </span>
                        </td>

                        {/* Player / Hero */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar avatarId={row.character} className="w-9 h-9" />
                            <div>
                              <div className="font-bold text-sm text-gray-200 flex items-center gap-1.5">
                                <span>{row.username}</span>
                                {isCurrentUser && (
                                  <span className="text-[9px] bg-brand-cyan/25 border border-brand-cyan/35 text-brand-cyan font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-500 font-medium">Player ID: #{row.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Level */}
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-1 text-brand-cyan font-bold font-mono text-sm">
                            <Award className="w-3.5 h-3.5" />
                            <span>{row.level}</span>
                          </div>
                        </td>

                        {/* Streak */}
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-1 text-orange-400 font-bold font-mono text-sm">
                            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                            <span>{row.streak}d</span>
                          </div>
                        </td>

                        {/* Total XP */}
                        <td className="py-4 px-6 text-right">
                          <span className="font-display font-extrabold text-sm text-brand-purple">
                            {row.totalXP.toLocaleString()} XP
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500 text-sm">
                        No competitors registered in the standings yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* FRIENDS HUB VIEW */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Friends list (Main block) */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-cyan" />
                Active Friends ({friendsData.friends.length})
              </h4>
              
              <div className="space-y-3">
                {friendsData.friends.map((friend) => (
                  <div 
                    key={friend.id}
                    className="glass-panel rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar avatarId={friend.character} className="w-11 h-11" />
                      <div>
                        <div className="font-bold text-sm text-gray-200">{friend.username}</div>
                        <div className="flex items-center gap-2.5 mt-1 text-[10px] text-gray-400 font-medium">
                          <span className="flex items-center gap-0.5 text-brand-cyan font-bold font-mono">
                            <Award className="w-3 h-3" />
                            LVL {friend.level}
                          </span>
                          <span className="h-2 w-[1px] bg-white/10" />
                          <span className="flex items-center gap-0.5 text-orange-400 font-bold font-mono">
                            <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                            {friend.streak}d
                          </span>
                          <span className="h-2 w-[1px] bg-white/10" />
                          <span className="font-bold text-brand-purple">{friend.totalXP} XP</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-red-500/15"
                      title="Unfriend player"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span className="hidden sm:inline">Unfriend</span>
                    </button>
                  </div>
                ))}

                {friendsData.friends.length === 0 && (
                  <div className="glass-panel rounded-2xl p-8 border border-white/5 text-center text-gray-500 text-sm">
                    Your friend circle is currently empty. Find other players above to issue friend requests!
                  </div>
                )}
              </div>
            </div>

            {/* Friend Requests Side blocks */}
            <div className="space-y-6">
              
              {/* Incoming Requests */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-brand-purple" />
                  Invitations ({friendsData.incomingRequests.length})
                </h4>

                <div className="space-y-3">
                  {friendsData.incomingRequests.map((req) => (
                    <div 
                      key={req.id} 
                      className="bg-black/30 rounded-2xl p-3.5 border border-white/5 flex flex-col gap-3.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar avatarId={req.character} className="w-8 h-8" />
                        <div>
                          <div className="font-bold text-xs text-gray-200">{req.username}</div>
                          <span className="text-[10px] text-gray-500">Level {req.level} Explorer</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRemoveFriend(req.id)}
                          className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-lg text-[10px] transition"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          className="flex-1 py-1.5 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold rounded-lg text-[10px] transition shadow-md shadow-brand-purple/15"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}

                  {friendsData.incomingRequests.length === 0 && (
                    <div className="text-center text-xs text-gray-500 py-4 bg-white/1 rounded-2xl border border-white/2">
                      No pending invitations.
                    </div>
                  )}
                </div>
              </div>

              {/* Outgoing Requests */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-base text-gray-400 flex items-center gap-2">
                  <UserPlus className="w-4.5 h-4.5 text-gray-500" />
                  Sent Requests ({friendsData.outgoingRequests.length})
                </h4>

                <div className="space-y-2">
                  {friendsData.outgoingRequests.map((req) => (
                    <div 
                      key={req.id}
                      className="bg-white/2 rounded-2xl p-3 border border-white/2 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar avatarId={req.character} className="w-7 h-7" />
                        <span className="font-bold text-xs text-gray-300">{req.username}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(req.id)}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                        title="Cancel Request"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                  {friendsData.outgoingRequests.length === 0 && (
                    <div className="text-center text-xs text-gray-500 py-4">
                      No active pending requests.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
