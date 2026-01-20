import { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import {
  Sun, Moon, Heart, MessageCircle, MapPin,
  LogOut, LogIn, X, PlusCircle, Upload,
  User, Edit, Star, Navigation, Flame, Grid, UserCircle
} from 'lucide-react';

// Твои константы (без изменений)
const TVER_CENTER = { lat: 56.8587, lon: 35.9115 };

const DISTRICT_CENTERS = {
  "Центральный": { lat: 56.8587, lon: 35.9115 },
  "Заволжский": { lat: 56.880, lon: 35.920 },
  "Пролетарский": { lat: 56.835, lon: 35.895 },
  "Московский": { lat: 56.845, lon: 35.880 },
};

const initialAnnouncements = []; // Со старта пусто — будет стартовый экран

const categories = ["Все", "Электроника", "Недвижимость", "Одежда", "Авто", "Услуги", "Отдам даром"];
const districts = ["Центральный", "Заволжский", "Пролетарский", "Московский"];

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('announcements');
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home' = стартовый экран

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

  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [showMyDistrictOnly, setShowMyDistrictOnly] = useState(true);

  const IMGBB_API_KEY = "5ab97e3a3c6c71a8c1dce30eceb8b9f3";

  useEffect(() => {
    localStorage.setItem('announcements', JSON.stringify(announcements));
  }, [announcements]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleAuth = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const name = e.target.name ? e.target.name.value : '';

    if (authMode === 'register') {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.find(u => u.email === email)) {
        alert("Email уже занят!");
        return;
      }
      const hashed = bcrypt.hashSync(password, 10);
      const newUser = { email, name: name || email.split('@')[0], hashedPassword: hashed };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      alert("Регистрация прошла!");
    } else {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email);
      if (!user || !bcrypt.compareSync(password, user.hashedPassword)) {
        alert("Неверный email или пароль!");
        return;
      }
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      alert("Вход успешен!");
    }
    setShowAuthModal(false);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    alert("Вы вышли из аккаунта");
  };

  const openLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const openProfile = () => {
    if (!currentUser) {
      openLogin();
      return;
    }
    setShowProfileModal(true);
  };

  const openAddAd = () => {
    if (!currentUser) {
      openLogin();
      return;
    }
    setShowAddModal(true);
  };

  const handleAddAdSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("Нужно войти");

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
      ownerEmail: currentUser.email,
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

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-950 via-black to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} text-white flex flex-col overflow-hidden`}>
      {/* Шапка */}
      <header className="fixed top-0 left-0 right-0 bg-black/60 backdrop-blur-xl border-b border-white/10 z-50 py-4 px-6 flex justify-between items-center shadow-lg">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Тверь Маркет
        </h1>
        <div className="flex items-center gap-5">
          {currentUser ? (
            <>
              <button onClick={openAddAd} className="p-4 bg-gradient-to-r from-green-600 to-emerald-700 rounded-full hover:shadow-xl hover:shadow-green-500/50 transition transform hover:scale-110">
                <PlusCircle size={28} />
              </button>
              <button onClick={openProfile} className="p-4 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-full hover:shadow-xl hover:shadow-indigo-500/50 transition transform hover:scale-110">
                <User size={28} />
              </button>
              <button onClick={logout} className="p-4 bg-gradient-to-r from-red-600 to-rose-700 rounded-full hover:shadow-xl hover:shadow-red-500/50 transition transform hover:scale-110">
                <LogOut size={28} />
              </button>
            </>
          ) : (
            <button onClick={openLogin} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl hover:shadow-xl hover:shadow-blue-500/50 transition font-bold text-lg transform hover:scale-105">
              Войти
            </button>
          )}
          <button onClick={toggleTheme} className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition transform hover:scale-110">
            {theme === 'dark' ? <Sun size={28} /> : <Moon size={28} />}
          </button>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 mt-20 px-6 overflow-hidden">
        {activeTab === 'home' ? (
          // Красивый стартовый экран с тремя кнопками
          <div className="h-full flex flex-col items-center justify-center text-center space-y-12">
            <div className="space-y-6">
              <h1 className="text-6xl sm:text-8xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                Тверь Маркет
              </h1>
              <p className="text-2xl sm:text-3xl text-gray-400 max-w-3xl mx-auto">
                Локальная барахолка Твери — продавай, покупай, отдавай даром
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl">
              {/* Кнопка "Объявления" */}
              <button
                onClick={() => setActiveTab('announcements')}
                className="group bg-gradient-to-br from-gray-800 to-gray-900 p-12 sm:p-16 rounded-3xl border border-gray-700 hover:border-blue-500 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/40 flex flex-col items-center backdrop-blur-xl"
              >
                <Grid size={80} className="mb-8 text-blue-400 group-hover:scale-110 transition duration-300" />
                <h3 className="text-4xl font-bold text-white mb-4">Объявления</h3>
                <p className="text-gray-400 text-xl">Свайпай и смотри</p>
              </button>

              {/* Кнопка "Профиль / Войти" */}
              {currentUser ? (
                <button
                  onClick={openProfile}
                  className="group bg-gradient-to-br from-gray-800 to-gray-900 p-12 sm:p-16 rounded-3xl border border-gray-700 hover:border-indigo-500 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/40 flex flex-col items-center backdrop-blur-xl"
                >
                  <UserCircle size={80} className="mb-8 text-indigo-400 group-hover:scale-110 transition duration-300" />
                  <h3 className="text-4xl font-bold text-white mb-4">Мой профиль</h3>
                  <p className="text-gray-400 text-xl">Твои объявления и настройки</p>
                </button>
              ) : (
                <button
                  onClick={openLogin}
                  className="group bg-gradient-to-br from-gray-800 to-gray-900 p-12 sm:p-16 rounded-3xl border border-gray-700 hover:border-purple-500 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/40 flex flex-col items-center backdrop-blur-xl"
                >
                  <LogIn size={80} className="mb-8 text-purple-400 group-hover:scale-110 transition duration-300" />
                  <h3 className="text-4xl font-bold text-white mb-4">Войти</h3>
                  <p className="text-gray-400 text-xl">Чтобы добавить и смотреть</p>
                </button>
              )}

              {/* Кнопка "Добавить" */}
              <button
                onClick={openAddAd}
                className="group bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-12 sm:p-16 rounded-3xl text-white font-bold text-4xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all duration-500 shadow-2xl hover:shadow-green-500/50 flex items-center justify-center gap-6 transform hover:scale-[1.05]"
              >
                <PlusCircle size={60} />
                Добавить
              </button>
            </div>
          </div>
        ) : (
          // TikTok-style свайп объявлений
          <div className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth">
            {announcements.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-2xl">
                Пока нет объявлений... Добавь первое!
              </div>
            ) : (
              announcements.map(item => (
                <div
                  key={item.id}
                  className="h-screen snap-start relative flex flex-col bg-gradient-to-b from-gray-900 to-black"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover brightness-75"
                    onError={(e) => e.target.src = "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 z-10" />

                  <div className="relative z-20 flex-1 flex flex-col justify-end p-8">
                    <div className="bg-black/70 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                      <h2 className="text-4xl font-bold text-white mb-4">{item.title}</h2>
                      <p className="text-5xl font-black text-green-400 mb-6">{item.price}</p>
                      <div className="flex items-center text-gray-300 text-2xl mb-4">
                        <MapPin size={28} className="mr-3" />
                        {item.location} • {item.district}
                      </div>
                      <p className="text-gray-300 text-xl line-clamp-4">{item.description}</p>

                      <div className="flex gap-6 mt-8">
                        <button className="flex-1 bg-white/10 py-5 rounded-2xl text-white font-bold text-xl hover:bg-white/20 transition">
                          <Heart size={32} className="inline mr-3" />
                          Лайк
                        </button>
                        <button className="flex-1 bg-green-600 py-5 rounded-2xl text-white font-bold text-xl hover:bg-green-700 transition">
                          <MessageCircle size={32} className="inline mr-3" />
                          Написать
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Модалка авторизации */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl w-full max-w-md p-8 relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={28} />
            </button>
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              {authMode === 'login' ? 'Вход' : 'Регистрация'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-6">
              {authMode === 'register' && (
                <div>
                  <label className="block mb-2 text-gray-300">Имя</label>
                  <input name="name" type="text" className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg" />
                </div>
              )}
              <div>
                <label className="block mb-2 text-gray-300">Email</label>
                <input name="email" type="email" required className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg" />
              </div>
              <div>
                <label className="block mb-2 text-gray-300">Пароль</label>
                <input name="password" type="password" required className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700">
                {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Модалка профиля */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl w-full max-w-lg p-8 relative">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={28} />
            </button>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                {currentUser.name[0].toUpperCase()}
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">{currentUser.name}</h2>
              <p className="text-gray-400 mb-8">{currentUser.email}</p>
              <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700">
                Редактировать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка добавления */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl w-full max-w-lg p-8 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={28} />
            </button>
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Новое объявление</h2>
            <form onSubmit={handleAddAdSubmit} className="space-y-6">
              <input name="title" placeholder="Название" className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white" required />
              <input name="price" placeholder="Цена" className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white" required />
              <textarea name="description" placeholder="Описание" rows={4} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white" />
              <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700">
                Опубликовать
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
