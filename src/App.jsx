import { useState, useEffect } from 'react';
import {
  Sun, Moon, Heart, MessageCircle, MapPin,
  LogOut, X, PlusCircle, Upload,
  UserCircle, Edit, Star, Navigation, Flame, ArrowLeft, Grid
} from 'lucide-react';

// Константы
const TVER_CENTER = { lat: 56.8587, lon: 35.9115 };

const DISTRICT_CENTERS = {
  "Центральный": { lat: 56.8587, lon: 35.9115 },
  "Заволжский": { lat: 56.880, lon: 35.920 },
  "Пролетарский": { lat: 56.835, lon: 35.895 },
  "Московский": { lat: 56.845, lon: 35.880 },
};

const initialAnnouncements = [];

const categories = ["Все", "Электроника", "Недвижимость", "Одежда", "Авто", "Услуги", "Отдам даром"];
const districts = ["Центральный", "Заволжский", "Пролетарский", "Московский"];

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
  const [showMyDistrictOnly, setShowMyDistrictOnly] = useState(true);

  const [newAd, setNewAd] = useState({
    title: '',
    price: '',
    location: '',
    description: '',
    category: 'Другое',
    district: 'Центральный',
    isUrgent: false,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_KEY || "5ab97e3a3c6c71a8c1dce30eceb8b9f3";

  // Telegram + фикс мобильных отступов
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
      document.body.style.paddingTop = 'env(safe-area-inset-top)';
    } else {
      console.warn("Не в Telegram");
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

  const handleAddAdSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("Ошибка: пользователь не определён");

    const form = e.target;
    const title = form.title.value?.trim();
    const price = form.price.value?.trim();
    const location = form.location.value?.trim();
    const district = form.district.value || 'Центральный';
    const category = form.category.value;
    const description = form.description.value?.trim() || '';
    const isUrgent = form.isUrgent.checked;

    if (!title || !price || !location) {
      return alert("Заполните название, цену и местоположение!");
    }

    let imageUrl = "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800";
    if (selectedFile) {
      imageUrl = await uploadToImgBB(selectedFile);
      if (!imageUrl) return;
    }

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

    setNewAd({
      title: '',
      price: '',
      location: '',
      description: '',
      category: 'Другое',
      district: 'Центральный',
      isUrgent: false,
    });
    setSelectedFile(null);
    setPreview(null);
    setShowAddModal(false);
    alert("Объявление добавлено!");
  };

  const handleAddAdChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAd(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadToImgBB = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (data.success) return data.data.url;
      alert("Ошибка загрузки фото");
      return null;
    } catch {
      alert("Не удалось загрузить фото");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(ad => {
    const matchesCategory = selectedCategory === 'Все' || ad.category === selectedCategory;
    const matchesDistrict = !showMyDistrictOnly ||
      (currentUser && ad.district === currentUser.district) ||
      !currentUser;
    return matchesCategory && matchesDistrict;
  });

  const urgentAnnouncements = announcements.filter(ad => ad.isUrgent);

  const myAnnouncements = announcements.filter(a => a.ownerTelegramId === currentUser?.telegramId);

  return (
    <div className={`min-h-[100dvh] ${theme === 'dark' ? 'bg-gradient-to-br from-gray-950 via-black to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} text-white flex flex-col`}>
      <main className="flex-1 overflow-hidden">
        {activeTab === 'home' ? (
          <div className="min-h-[100dvh] flex flex-col items-center justify-center text-center space-y-12 px-6">
            <div className="space-y-4">
              <h1 className="text-6xl sm:text-8xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                Тверь Маркет
              </h1>
              <p className="text-xl sm:text-3xl text-gray-400">
                Локальная барахолка Твери
              </p>
            </div>

            {/* Чуть центрируем и убираем лишний сдвиг влево */}
            <div className="grid grid-cols-2 gap-8 w-full max-w-lg mx-auto">
              <button
                onClick={() => setActiveTab('announcements')}
                className="group bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-10 rounded-3xl border border-gray-700/50 hover:border-blue-500/70 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/40 backdrop-blur-lg"
              >
                <Grid size={56} className="mx-auto mb-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-bold text-white">Объявления</h3>
                <p className="text-base text-gray-400 mt-2">Смотреть всё</p>
              </button>

              <button
                onClick={() => setActiveTab('urgent')}
                className="group bg-gradient-to-br from-red-800/90 to-red-950/90 p-10 rounded-3xl border border-red-500/60 hover:border-red-400/80 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/40 backdrop-blur-lg animate-pulse"
              >
                <Flame size={56} className="mx-auto mb-5 text-red-400 group-hover:scale-110 transition-transform animate-bounce" />
                <h3 className="text-3xl font-bold text-white">Срочно сегодня</h3>
                <p className="text-base text-gray-400 mt-2">{urgentAnnouncements.length} горячих</p>
              </button>

              {currentUser ? (
                <button
                  onClick={openProfile}
                  className="group bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-10 rounded-3xl border border-gray-700/50 hover:border-indigo-500/70 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/40 backdrop-blur-lg col-span-2"
                >
                  <UserCircle size={56} className="mx-auto mb-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <h3 className="text-3xl font-bold text-white">Профиль</h3>
                  <p className="text-base text-gray-400 mt-2">Твои объявления</p>
                </button>
              ) : (
                <button
                  onClick={() => alert("Запусти из Telegram!")}
                  className="group bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-10 rounded-3xl border border-gray-700/50 hover:border-purple-500/70 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/40 backdrop-blur-lg col-span-2"
                >
                  <UserCircle size={56} className="mx-auto mb-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <h3 className="text-3xl font-bold text-white">Войти</h3>
                  <p className="text-base text-gray-400 mt-2">Через Telegram</p>
                </button>
              )}

              <button
                onClick={openAddAd}
                className="col-span-2 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-12 rounded-3xl text-white font-bold text-4xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all duration-500 shadow-2xl hover:shadow-green-600/50 flex items-center justify-center gap-5 backdrop-blur-lg"
              >
                <PlusCircle size={48} />
                Добавить
              </button>

              <button
                onClick={toggleTheme}
                className="col-span-2 mt-6 p-5 bg-white/10 rounded-full hover:bg-white/20 transition w-20 h-20 mx-auto flex items-center justify-center"
              >
                {theme === 'dark' ? <Sun size={32} /> : <Moon size={32} />}
              </button>
            </div>
          </div>
        ) : activeTab === 'announcements' ? (
          <div className="h-full flex">
            <div className="fixed left-0 top-0 bottom-0 w-20 bg-black/70 backdrop-blur-xl border-r border-white/10 z-40 overflow-y-auto">
              <div className="flex flex-col items-center py-6 gap-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl text-[10px] font-medium transition-all duration-300 ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/60 scale-110'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-105'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-24 z-50 p-3 bg-black/70 backdrop-blur-xl rounded-full text-white hover:bg-gray-800 transition shadow-lg"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex-1 ml-20 overflow-y-auto snap-y snap-mandatory scroll-smooth">
              {filteredAnnouncements.length === 0 ? (
                <div className="min-h-[100dvh] flex items-center justify-center text-gray-400 text-lg px-6 text-center">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 z-10" />

                    <div className="relative z-20 mt-auto p-6 pb-[calc(3rem + env(safe-area-inset-bottom))]">
                      <div className="bg-black/75 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
                        <h2 className="text-3xl font-bold text-white mb-3 line-clamp-2">{item.title}</h2>
                        <p className="text-5xl font-black text-green-400 mb-4">{item.price}</p>
                        <div className="flex items-center text-gray-300 text-lg mb-4">
                          <MapPin size={22} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{item.location} • {item.district}</span>
                        </div>
                        <p className="text-base text-gray-300 line-clamp-5 mb-6">{item.description}</p>

                        <div className="flex gap-4">
                          <button className="flex-1 bg-white/10 py-5 rounded-2xl text-white font-bold hover:bg-white/20 transition flex items-center justify-center gap-3">
                            <Heart size={28} className="inline" />
                            Лайк
                          </button>
                          <button className="flex-1 bg-green-600 py-5 rounded-2xl text-white font-bold hover:bg-green-700 transition flex items-center justify-center gap-3">
                            <MessageCircle size={28} className="inline" />
                            Написать
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
            <div className="fixed left-0 top-0 bottom-0 w-20 bg-black/70 backdrop-blur-xl border-r border-white/10 z-40 overflow-y-auto">
              <div className="flex flex-col items-center py-6 gap-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl text-[10px] font-medium transition-all duration-300 ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-2xl shadow-red-500/60 scale-110'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-105'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-24 z-50 p-3 bg-black/70 backdrop-blur-xl rounded-full text-white hover:bg-gray-800 transition shadow-lg"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex-1 ml-20 overflow-y-auto snap-y snap-mandatory scroll-smooth bg-gradient-to-b from-red-950 to-black">
              {urgentAnnouncements.length === 0 ? (
                <div className="min-h-[100dvh] flex items-center justify-center text-gray-300 text-lg px-6 text-center">
                  Пока нет срочных объявлений...
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

                    <div className="relative z-20 mt-auto p-6 pb-[calc(3rem + env(safe-area-inset-bottom))]">
                      <div className="bg-black/80 backdrop-blur-xl rounded-3xl p-6 border border-red-500/50 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <Flame size={40} className="text-red-400 animate-bounce" />
                          <h2 className="text-3xl font-extrabold text-white">СРОЧНО СЕГОДНЯ</h2>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3 line-clamp-2">{item.title}</h2>
                        <p className="text-5xl font-black text-green-400 mb-5">{item.price}</p>
                        <div className="flex items-center text-gray-300 text-lg mb-4">
                          <MapPin size={22} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{item.location} • {item.district}</span>
                        </div>
                        <p className="text-base text-gray-300 line-clamp-5 mb-6">{item.description}</p>

                        <div className="flex gap-4">
                          <button className="flex-1 bg-white/10 py-5 rounded-2xl text-white font-bold hover:bg-white/20 transition flex items-center justify-center gap-3">
                            <Heart size={28} className="inline" />
                            Лайк
                          </button>
                          <button className="flex-1 bg-red-600 py-5 rounded-2xl text-white font-bold hover:bg-red-700 transition flex items-center justify-center gap-3">
                            <MessageCircle size={28} className="inline" />
                            Написать
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

      {/* Модалка добавления объявления */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-950 rounded-3xl w-full max-w-xl p-12 relative border border-green-500/40 shadow-2xl shadow-green-500/30 max-h-[90dvh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-green-400 transition">
              <X size={40} />
            </button>

            <h2 className="text-5xl font-extrabold text-center mb-10 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Новое объявление 🔥
            </h2>

            <form onSubmit={handleAddAdSubmit} className="space-y-8">
              {/* Все поля как у тебя — ничего не менял */}
              <div>
                <label className="block mb-3 text-gray-300 text-xl font-medium">Название *</label>
                <input name="title" value={newAd.title} onChange={handleAddAdChange} required className="w-full p-6 bg-black/60 border border-green-500/30 rounded-2xl text-white text-xl focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-500/30 transition-all duration-300" />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block mb-3 text-gray-300 text-xl font-medium">Цена *</label>
                  <input name="price" value={newAd.price} onChange={handleAddAdChange} required className="w-full p-6 bg-black/60 border border-green-500/30 rounded-2xl text-white text-xl focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-500/30 transition-all duration-300" />
                </div>
                <div>
                  <label className="block mb-3 text-gray-300 text-xl font-medium">Район *</label>
                  <div className="flex gap-4">
                    <select name="district" value={newAd.district} onChange={handleAddAdChange} className="flex-1 p-6 bg-black/60 border border-green-500/30 rounded-2xl text-white text-xl focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-500/30 transition-all duration-300">
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button type="button" onClick={() => alert("Геолокация пока не реализована")} className="p-6 bg-green-600 hover:bg-green-700 text-white rounded-2xl flex items-center justify-center transition shadow-lg">
                      <Navigation size={32} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-3 text-gray-300 text-xl font-medium">Категория</label>
                <select name="category" value={newAd.category} onChange={handleAddAdChange} className="w-full p-6 bg-black/60 border border-green-500/30 rounded-2xl text-white text-xl focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-500/30 transition-all duration-300">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-5">
                <input type="checkbox" id="isUrgent" name="isUrgent" checked={newAd.isUrgent} onChange={handleAddAdChange} className="w-8 h-8 accent-green-500" />
                <label htmlFor="isUrgent" className="text-2xl text-green-400 font-medium cursor-pointer flex items-center gap-4">
                  <Flame size={36} className="animate-pulse" /> Срочно отдам сегодня!
                </label>
              </div>

              <div>
                <label className="block mb-3 text-gray-300 text-xl font-medium">Описание</label>
                <textarea name="description" value={newAd.description} onChange={handleAddAdChange} rows={6} className="w-full p-6 bg-black/60 border border-green-500/30 rounded-2xl text-white text-xl focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-500/30 transition-all duration-300" placeholder="Подробно опиши товар..." />
              </div>

              <div>
                <label className="block mb-3 text-gray-300 text-xl font-medium flex items-center gap-4">
                  <Upload size={32} /> Фото
                </label>
                <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="w-full p-5 bg-black/60 border border-green-500/30 rounded-2xl text-white text-xl file:bg-green-600 file:text-white file:border-0 file:rounded-xl file:px-8 file:py-4 file:cursor-pointer file:font-bold" />
                {preview && (
                  <div className="mt-6 relative">
                    <img src={preview} alt="Превью" className="max-h-64 rounded-3xl mx-auto border-4 border-green-500/30 shadow-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-3xl" />
                  </div>
                )}
              </div>

              <button type="submit" disabled={uploading} className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white py-7 rounded-2xl font-bold text-3xl transition-all duration-300 shadow-2xl hover:shadow-green-500/70 transform hover:scale-[1.02]">
                {uploading ? 'Загрузка...' : 'Опубликовать 🔥'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Красивый профиль как был */}
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
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white text-8xl font-bold shadow-2xl shadow-purple-500/50 animate-pulse">
                    {currentUser.name[0].toUpperCase()}
                  </div>
                )}
                <button className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 w-14 h-14 rounded-full flex items-center justify-center border-4 border-black shadow-lg transform hover:scale-110 transition">
                  <Edit size={24} />
                </button>
              </div>

              <h2 className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-3">
                {currentUser.name}
              </h2>
              <p className="text-2xl text-gray-400 mb-10">{currentUser.email || `@${currentUser.username || 'нет username'}`}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-12">
                <div className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/30 text-center hover:border-purple-400 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30">
                  <p className="text-5xl font-bold text-purple-400 mb-2">
                    {myAnnouncements.length}
                  </p>
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
