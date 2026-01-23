import { useState, useEffect } from 'react';
import {
  Sun, Moon, Heart, MessageCircle, MapPin,
  X, PlusCircle, Upload,
  UserCircle, Edit, Navigation, Flame, ArrowLeft, Grid
} from 'lucide-react';

const categories = ["Все", "Электроника", "Недвижимость", "Одежда", "Авто", "Услуги", "Отдам даром"];
const districts = ["Центральный", "Заволжский", "Пролетарский", "Московский"];

const initialAnnouncements = [];

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [currentUser, setCurrentUser] = useState(null);
  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('announcements');
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_KEY || "5ab97e3a3c6c71a8c1dce30eceb8b9f3";

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
      document.body.style.paddingTop = 'env(safe-area-inset-top)';
    }

    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser) {
      const user = {
        telegramId: tgUser.id,
        name: (tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '')) || 'Пользователь',
        username: tgUser.username || '',
        photoUrl: tgUser.photo_url || null,
      };
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('announcements', JSON.stringify(announcements));
  }, [announcements]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    window.Telegram?.WebApp?.close();
  };

  const openAddAd = () => {
    if (!currentUser) return alert("Запусти из Telegram!");
    setShowAddModal(true);
  };

  const openProfile = () => {
    if (!currentUser) return alert("Запусти из Telegram!");
    setShowProfileModal(true);
  };

  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) return data.data.url;
      alert("Ошибка загрузки фото");
      return null;
    } catch {
      alert("Не удалось загрузить фото");
      return null;
    }
  };

  const addAnnouncement = (announcementData) => {
    setAnnouncements(prev => [announcementData, ...prev]);
  };

  const filteredAnnouncements = announcements.filter(ad =>
    selectedCategory === 'Все' || ad.category === selectedCategory
  );

  const urgentAnnouncements = announcements.filter(ad => ad.isUrgent);

  const myAnnouncements = announcements.filter(a => a.ownerTelegramId === currentUser?.telegramId);

  return (
    <div className={`min-h-[100dvh] ${theme === 'dark' ? 'bg-gradient-to-br from-gray-950 via-black to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} text-white flex flex-col`}>
      <main className="flex-1 overflow-hidden">
        {activeTab === 'home' ? (
          <div className="min-h-[100dvh] flex flex-col items-center justify-center text-center space-y-8 px-4">
            <div className="space-y-3">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                Тверь Маркет
              </h1>
              <p className="text-lg text-gray-400">Локальная барахолка Твери</p>
            </div>

            <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
              <button
                onClick={() => setActiveTab('announcements')}
                className="group bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-6 rounded-2xl border border-gray-700/50 hover:border-blue-500/70 transition-all hover:shadow-lg backdrop-blur-lg"
              >
                <Grid size={40} className="mx-auto mb-3 text-blue-400 group-hover:scale-110 transition" />
                <h3 className="text-xl font-bold text-white">Объявления</h3>
                <p className="text-sm text-gray-400 mt-1">Смотреть всё</p>
              </button>

              <button
                onClick={() => setActiveTab('urgent')}
                className="group bg-gradient-to-br from-red-800/90 to-red-950/90 p-6 rounded-2xl border border-red-500/60 hover:border-red-400/80 transition-all hover:shadow-lg backdrop-blur-lg animate-pulse"
              >
                <Flame size={40} className="mx-auto mb-3 text-red-400 group-hover:scale-110 transition animate-bounce" />
                <h3 className="text-xl font-bold text-white">Срочно</h3>
                <p className="text-sm text-gray-400 mt-1">{urgentAnnouncements.length} горячих</p>
              </button>

              {currentUser ? (
                <button
                  onClick={openProfile}
                  className="group bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-6 rounded-2xl border border-gray-700/50 hover:border-indigo-500/70 transition-all hover:shadow-lg backdrop-blur-lg col-span-2"
                >
                  <UserCircle size={40} className="mx-auto mb-3 text-indigo-400 group-hover:scale-110 transition" />
                  <h3 className="text-xl font-bold text-white">Профиль</h3>
                  <p className="text-sm text-gray-400 mt-1">Твои объявления</p>
                </button>
              ) : (
                <button
                  onClick={() => alert("Запусти из Telegram!")}
                  className="group bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-6 rounded-2xl border border-gray-700/50 hover:border-purple-500/70 transition-all hover:shadow-lg backdrop-blur-lg col-span-2"
                >
                  <UserCircle size={40} className="mx-auto mb-3 text-purple-400 group-hover:scale-110 transition" />
                  <h3 className="text-xl font-bold text-white">Войти</h3>
                  <p className="text-sm text-gray-400 mt-1">Через Telegram</p>
                </button>
              )}

              <button
                onClick={openAddAd}
                className="col-span-2 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 rounded-2xl text-white font-bold text-2xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all shadow-lg flex items-center justify-center gap-3 backdrop-blur-lg"
              >
                <PlusCircle size={32} />
                Добавить
              </button>

              <button
                onClick={toggleTheme}
                className="col-span-2 mt-4 p-4 bg-white/10 rounded-full hover:bg-white/20 transition w-14 h-14 mx-auto flex items-center justify-center"
              >
                {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </div>
          </div>
        ) : activeTab === 'announcements' ? (
          <div className="h-full flex">
            <div className="fixed left-0 top-0 bottom-0 w-16 bg-black/70 backdrop-blur-xl border-r border-white/10 z-40 overflow-y-auto">
              <div className="flex flex-col items-center py-4 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-[9px] font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg scale-105'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="fixed top-4 left-20 z-50 p-2.5 bg-black/70 backdrop-blur-xl rounded-full text-white hover:bg-gray-800 transition shadow-md"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex-1 ml-16 overflow-y-auto snap-y snap-mandatory scroll-smooth">
              {filteredAnnouncements.length === 0 ? (
                <div className="min-h-[100dvh] flex items-center justify-center text-gray-400 text-base px-4 text-center">
                  Пока нет объявлений...
                </div>
              ) : (
                filteredAnnouncements.map(item => (
                  <div
                    key={item.id}
                    className="relative h-[100dvh] snap-start flex flex-col bg-gradient-to-b from-gray-900 to-black"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover brightness-75"
                      onError={e => e.target.src = "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 z-10" />

                    <div className="relative z-20 mt-auto p-5 pb-[calc(2.5rem + env(safe-area-inset-bottom))]">
                      <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">{item.title}</h2>
                        <p className="text-3xl font-black text-green-400 mb-3">{item.price}</p>
                        <div className="flex items-center text-gray-300 text-base mb-3">
                          <MapPin size={18} className="mr-1.5 flex-shrink-0" />
                          <span className="truncate">{item.location} • {item.district}</span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-4 mb-4">{item.description}</p>

                        <div className="flex gap-3">
                          <button className="flex-1 bg-white/10 py-3 rounded-xl text-white font-medium hover:bg-white/20 transition flex items-center justify-center gap-2 text-sm">
                            <Heart size={20} /> Лайк
                          </button>
                          <button className="flex-1 bg-green-600 py-3 rounded-xl text-white font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm">
                            <MessageCircle size={20} /> Написать
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'urgent' ? (
          <div className="h-full flex">
            <div className="fixed left-0 top-0 bottom-0 w-16 bg-black/70 backdrop-blur-xl border-r border-white/10 z-40 overflow-y-auto">
              <div className="flex flex-col items-center py-4 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-[9px] font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg scale-105'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="fixed top-4 left-20 z-50 p-2.5 bg-black/70 backdrop-blur-xl rounded-full text-white hover:bg-gray-800 transition shadow-md"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex-1 ml-16 overflow-y-auto snap-y snap-mandatory scroll-smooth bg-gradient-to-b from-red-950 to-black">
              {urgentAnnouncements.length === 0 ? (
                <div className="min-h-[100dvh] flex items-center justify-center text-gray-300 text-base px-4 text-center">
                  Пока нет срочных...
                </div>
              ) : (
                urgentAnnouncements.map(item => (
                  <div
                    key={item.id}
                    className="relative h-[100dvh] snap-start flex flex-col"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover brightness-75"
                      onError={e => e.target.src = "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-red-900/50 z-10" />

                    <div className="relative z-20 mt-auto p-5 pb-[calc(2.5rem + env(safe-area-inset-bottom))]">
                      <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-5 border border-red-500/50 shadow-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Flame size={28} className="text-red-400 animate-bounce" />
                          <h2 className="text-2xl font-extrabold text-white">СРОЧНО</h2>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">{item.title}</h2>
                        <p className="text-3xl font-black text-green-400 mb-3">{item.price}</p>
                        <div className="flex items-center text-gray-300 text-base mb-3">
                          <MapPin size={18} className="mr-1.5 flex-shrink-0" />
                          <span className="truncate">{item.location} • {item.district}</span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-4 mb-4">{item.description}</p>

                        <div className="flex gap-3">
                          <button className="flex-1 bg-white/10 py-3 rounded-xl text-white font-medium hover:bg-white/20 transition flex items-center justify-center gap-2 text-sm">
                            <Heart size={20} /> Лайк
                          </button>
                          <button className="flex-1 bg-red-600 py-3 rounded-xl text-white font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm">
                            <MessageCircle size={20} /> Написать
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </main>

      {/* Модалка добавления */}
      {showAddModal && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-900 rounded-3xl w-full max-w-md p-8 relative">
      <button 
        onClick={() => setShowAddModal(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        <X size={28} />
      </button>

      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Новое объявление
      </h2>

      <form onSubmit={(e) => {
        e.preventDefault();
        alert("Форма отправлена! (пока просто тест)");
        setShowAddModal(false);
      }} className="space-y-5">
        <input 
          type="text" 
          placeholder="Название *" 
          required 
          className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white" 
        />
        <input 
          type="text" 
          placeholder="Цена *" 
          required 
          className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white" 
        />
        <input 
          type="text" 
          placeholder="Местоположение *" 
          required 
          className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white" 
        />
        <button 
          type="submit"
          className="w-full bg-green-600 py-4 rounded-xl text-white font-bold hover:bg-green-700"
        >
          Опубликовать 🔥
        </button>
      </form>
    </div>
  </div>
)}

              const finalDescription = isUrgent
                ? `${description}\n\n🔥 СРОЧНО! Отдам сегодня 🔥`
                : description;

              const newAnnouncement = {
                id: Date.now(),
                title,
                price,
                location,
                description: finalDescription,
                category,
                district,
                image: imageUrl,
                ownerTelegramId: currentUser.telegramId,
                ownerName: currentUser.name,
                likes: [],
                comments: [],
                isUrgent,
              };

              setAnnouncements(prev => [newAnnouncement, ...prev]);
              setShowAddModal(false);
              alert("Объявление добавлено!");
            }} className="space-y-6">
              <div>
                <label className="block mb-2 text-gray-300 text-lg">Название *</label>
                <input name="title" required className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg" placeholder="Например: iPhone 13 Pro" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 text-gray-300 text-lg">Цена *</label>
                  <input name="price" required className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg" placeholder="5000 ₽" />
                </div>
                <div>
                  <label className="block mb-2 text-gray-300 text-lg">Район *</label>
                  <select name="district" className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg">
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-300 text-lg">Категория</label>
                <select name="category" className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <input type="checkbox" id="isUrgent" name="isUrgent" className="w-6 h-6 accent-green-500" />
                <label htmlFor="isUrgent" className="text-xl text-green-400 font-medium cursor-pointer flex items-center gap-3">
                  <Flame size={28} className="animate-pulse" /> Срочно!
                </label>
              </div>

              <div>
                <label className="block mb-2 text-gray-300 text-lg">Описание</label>
                <textarea name="description" rows={5} className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg" placeholder="Подробно..." />
              </div>

              <div>
                <label className="block mb-2 text-gray-300 text-lg flex items-center gap-3">
                  <Upload size={24} /> Фото (опционально)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setPreview(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg file:bg-green-600 file:text-white file:border-0 file:rounded-xl file:px-6 file:py-3 file:cursor-pointer file:font-medium"
                />
                {preview && <img src={preview} alt="Превью" className="mt-4 max-h-40 rounded-2xl mx-auto border-2 border-green-500/40" />}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white py-5 rounded-2xl font-bold text-2xl transition-all shadow-xl hover:shadow-green-500/50"
              >
                Опубликовать 🔥
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Красивый профиль */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-950 rounded-3xl w-full max-w-4xl p-10 relative border border-purple-500/40 shadow-2xl shadow-purple-600/30 max-h-[90dvh] overflow-y-auto">
            <button 
              onClick={() => setShowProfileModal(false)} 
              className="absolute top-6 right-6 text-gray-400 hover:text-purple-400 transition duration-300"
            >
              <X size={40} />
            </button>

            <div className="flex flex-col items-center text-center mb-12">
              <div className="relative mb-8 group">
                {currentUser.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.name}
                    className="w-48 h-48 rounded-full object-cover border-4 border-purple-500 shadow-2xl"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white text-8xl font-bold shadow-2xl shadow-purple-500/50 relative overflow-hidden animate-pulse">
                    {currentUser.name[0].toUpperCase()}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-indigo-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                  </div>
                )}
                <button className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 w-14 h-14 rounded-full flex items-center justify-center border-4 border-black shadow-lg transform hover:scale-110 transition">
                  <Edit size={24} />
                </button>
              </div>

              <h2 className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-3">
                {currentUser.name}
              </h2>
              <p className="text-2xl text-gray-400 mb-2">@{currentUser.username || 'нет username'}</p>
              <p className="text-lg text-gray-500 mb-10">ID: {currentUser.telegramId}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-12">
                <div className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/30 text-center hover:border-purple-400 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30">
                  <p className="text-5xl font-bold text-purple-400 mb-2">{myAnnouncements.length}</p>
                  <p className="text-gray-400 text-lg">Мои объявления</p>
                </div>
                <div className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-green-500/30 text-center hover:border-green-400 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30">
                  <p className="text-5xl font-bold text-green-400 mb-2">0</p>
                  <p className="text-gray-400 text-lg">Лайков получено</p>
                </div>
                <div className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-yellow-500/30 text-center hover:border-yellow-400 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/30">
                  <p className="text-5xl font-bold text-yellow-400 mb-2">0</p>
                  <p className="text-gray-400 text-lg">Просмотров</p>
                </div>
              </div>

              <div className="w-full mb-12">
                <h3 className="text-3xl font-bold text-white mb-6 text-center">Мои объявления</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {myAnnouncements.slice(0, 4).map(item => (
                    <div 
                      key={item.id}
                      className="bg-gray-800/70 rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer"
                    >
                      <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                      <div className="p-5">
                        <h4 className="text-xl font-bold text-white mb-2 line-clamp-1">{item.title}</h4>
                        <p className="text-2xl font-black text-green-400 mb-2">{item.price}</p>
                        <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  ))}

                  {myAnnouncements.length === 0 && (
                    <p className="text-gray-400 text-center col-span-2 py-10 text-xl">
                      У тебя пока нет объявлений... Добавь первое!
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full space-y-6">
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-5 rounded-2xl text-white font-bold text-xl hover:from-purple-700 hover:to-pink-700 transition shadow-xl">
                  Редактировать профиль
                </button>

                <button 
                  onClick={() => {
                    if (window.confirm("Точно выйти?")) logout();
                  }}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 py-5 rounded-2xl text-white font-bold text-xl hover:from-red-700 hover:to-rose-700 transition shadow-xl"
                >
                  Выйти из аккаунта
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-black/90 backdrop-blur-xl border-t border-white/10 text-gray-400 py-6 text-center text-sm mt-auto">
        © 2026 Тверь Маркет • Сделано с ❤️ в Твери
      </footer>
    </div>
  );
}

export default App;
