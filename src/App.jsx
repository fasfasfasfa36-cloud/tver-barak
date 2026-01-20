import { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import {
  Sun, Moon, Heart, MessageCircle, MapPin,
  LogOut, LogIn, X, PlusCircle, Upload,
  User, Edit, Trash2, Star, Filter, Navigation, Flame
} from 'lucide-react';

// Центр Твери и центры районов
const TVER_CENTER = { lat: 56.8587, lon: 35.9115 };

const DISTRICT_CENTERS = {
  "Центральный": { lat: 56.8587, lon: 35.9115 },
  "Заволжский": { lat: 56.880, lon: 35.920 },
  "Пролетарский": { lat: 56.835, lon: 35.895 },
  "Московский": { lat: 56.845, lon: 35.880 },
};

const initialAnnouncements = [
  {
    id: 1,
    title: "iPhone 16 Pro 256GB",
    price: "119 990 ₽",
    location: "Центральный район",
    description: "Новый, запечатанный, гарантия 1 год",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800",
    category: "Электроника",
    ownerEmail: "admin@example.com",
    likes: [],
    comments: [],
    district: "Центральный",
  },
  {
    id: 2,
    title: "Диван отдам сегодня бесплатно",
    price: "0 ₽",
    location: "Пролетарский район",
    description: "Срочно, отдам сегодня вечером",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    category: "Отдам даром",
    ownerEmail: "admin@example.com",
    likes: [],
    comments: [],
    district: "Пролетарский",
  },
];

const categories = ["Все", "Электроника", "Недвижимость", "Одежда", "Авто", "Услуги", "Отдам даром"];
const districts = ["Центральный", "Заволжский", "Пролетарский", "Московский"];

const news = [
  { id: 1, title: "ДТП на Октябрьском пр.", time: "15:40", text: "Пробка 2 км в сторону центра..." },
  { id: 2, title: "Отключение горячей воды", time: "Сегодня", text: "Заволжский район..." },
  { id: 3, title: "Скидки до 70% в ТЦ Рубин", time: "Весь день", text: "Зимняя коллекция..." },
];

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('announcements');
    const data = saved ? JSON.parse(saved) : initialAnnouncements;
    return data.map(ad => ({
      ...ad,
      likes: Array.isArray(ad.likes) ? ad.likes : [],
      comments: Array.isArray(ad.comments) ? ad.comments : [],
    }));
  });

  const [newsComments, setNewsComments] = useState(() => {
    const saved = localStorage.getItem('newsComments');
    return saved ? JSON.parse(saved) : {};
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMyAds, setShowMyAds] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  const [viewedUser, setViewedUser] = useState(null);
  const [showViewedProfile, setShowViewedProfile] = useState(false);

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
  const [commentText, setCommentText] = useState({});

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '' });

  const [reviews, setReviews] = useState([
    { id: 1, user: "Алексей", rating: 5, text: "Отличный продавец! Всё быстро.", date: "12.01.2026" },
    { id: 2, user: "Марина", rating: 4, text: "Товар соответствует, но доставка задержалась.", date: "08.01.2026" },
  ]);

  const [newReviewText, setNewReviewText] = useState('');

  const [activeTab, setActiveTab] = useState('announcements');
  const [forceOpenAuth, setForceOpenAuth] = useState(false);

  const [showMyDistrictOnly, setShowMyDistrictOnly] = useState(true);

  const IMGBB_API_KEY = "5ab97e3a3c6c71a8c1dce30eceb8b9f3";

  useEffect(() => {
    if (forceOpenAuth) {
      setAuthMode('login');
      setShowAuthModal(true);
      setForceOpenAuth(false);
    }
  }, [forceOpenAuth]);

  useEffect(() => {
    localStorage.setItem('announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('newsComments', JSON.stringify(newsComments));
  }, [newsComments]);

  useEffect(() => {
    if (currentUser) {
      setProfileData({ name: currentUser.name, email: currentUser.email });
    }
  }, [currentUser]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
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
    setShowAuthModal(false);
    setShowProfileModal(false);
    setShowAddModal(false);
    setShowNewsModal(false);
    setShowViewedProfile(false);
    alert("Вы вышли из аккаунта");
  };

  const openLogin = () => {
    setForceOpenAuth(true);
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

  const openNews = (n) => {
    if (!n) return;
    setSelectedNews(n);
    setShowNewsModal(true);
  };

  const openViewedProfile = (userName, userEmail = `${userName.toLowerCase()}@example.com`) => {
    setViewedUser({ name: userName, email: userEmail });
    setShowViewedProfile(true);
  };

  const handleNewsComment = (e) => {
    e.preventDefault();
    if (!currentUser || !commentText[selectedNews?.id] || !selectedNews) return;

    const newComment = {
      user: currentUser.name,
      userEmail: currentUser.email,
      text: commentText[selectedNews.id].trim()
    };

    setNewsComments(prev => ({
      ...prev,
      [selectedNews.id]: [...(prev[selectedNews.id] || []), newComment]
    }));

    setCommentText(prev => ({ ...prev, [selectedNews.id]: '' }));
  };

  const filteredAnnouncements = announcements.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ad.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || ad.category === selectedCategory;
    const matchesMyAds = showMyAds ? ad.ownerEmail === currentUser?.email : true;

    const matchesDistrict = !showMyDistrictOnly ||
                           (currentUser && ad.district === currentUser.district) ||
                           !currentUser;

    return matchesSearch && matchesCategory && matchesMyAds && matchesDistrict;
  });

  const urgentFreeToday = filteredAnnouncements.filter(ad =>
    ad.price === "0 ₽" ||
    ad.category === "Отдам даром" ||
    /сегодня|срочно|вечером|сейчас/i.test(ad.description || '')
  );

  const handleLike = (adId) => {
    if (!currentUser) return alert("Войдите чтобы лайкать");
    setAnnouncements(prev => prev.map(ad =>
      ad.id === adId
        ? {
            ...ad,
            likes: ad.likes.includes(currentUser.email)
              ? ad.likes.filter(e => e !== currentUser.email)
              : [...ad.likes, currentUser.email]
          }
        : ad
    ));
  };

  const handleDeleteAd = (adId) => {
    if (!window.confirm("Удалить объявление?")) return;
    setAnnouncements(prev => prev.filter(ad => ad.id !== adId));
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
      throw new Error(data.error?.message || "Ошибка загрузки");
    } catch (err) {
      alert("Не удалось загрузить фото");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const detectDistrict = (lat, lon) => {
    let closest = "Центральный";
    let minDist = Infinity;

    for (const [district, center] of Object.entries(DISTRICT_CENTERS)) {
      const dist = Math.hypot(lat - center.lat, lon - center.lon);
      if (dist < minDist) {
        minDist = dist;
        closest = district;
      }
    }
    return closest;
  };

  const handleDetectDistrict = () => {
    if (!navigator.geolocation) {
      alert("Геолокация не поддерживается браузером");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const district = detectDistrict(position.coords.latitude, position.coords.longitude);
        setNewAd(prev => ({ ...prev, district }));
        alert(`Район определён: ${district}!`);
      },
      () => alert("Не удалось определить местоположение. Выбери район вручную."),
      { enableHighAccuracy: true }
    );
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
    alert("Объявление опубликовано! 🔥");
  };

  const handleAddAdChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAd(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditProfile = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u =>
      u.email === currentUser.email ? { ...u, name: profileData.name } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setCurrentUser(prev => ({ ...prev, name: profileData.name }));
    localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, name: profileData.name }));
    setEditingProfile(false);
    alert("Профиль обновлён!");
  };

  const addReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const newReview = {
      id: Date.now(),
      user: currentUser.name,
      rating: 5,
      text: newReviewText,
      date: new Date().toLocaleDateString('ru-RU')
    };

    setReviews(prev => [newReview, ...prev]);
    setNewReviewText('');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-950' : 'bg-gray-50'} text-gray-900 dark:text-gray-100 transition-colors flex flex-col overflow-hidden`}>
      {/* Фиксированные категории слева */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 bg-gray-900/95 z-30 overflow-y-auto">
        <div className="flex flex-col items-center py-16 gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-14 h-14 flex items-center justify-center rounded-full text-[10px] font-medium transition ${
                selectedCategory === cat ? 'bg-white text-blue-600 shadow-lg' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </aside>

      {/* Фиксированная шапка */}
      <header className="fixed top-0 left-20 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 shadow-lg z-40">
        <div className="px-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">Тверь Маркет</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <>
                <button onClick={openAddAd} className="p-2 sm:p-3 bg-white/20 rounded-full hover:bg-white/30 transition">
                  <PlusCircle size={20} className="sm:size-6" />
                </button>
                <button onClick={() => setShowMyAds(!showMyAds)} className={`p-2 sm:p-3 rounded-full transition ${showMyAds ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30'}`}>
                  <User size={20} className="sm:size-6" />
                </button>
                <button onClick={openProfile} className="p-2 sm:p-3 bg-white/20 rounded-full hover:bg-white/30 transition">
                  <User size={20} className="sm:size-6" />
                </button>
                <button onClick={logout} className="p-2 sm:p-3 bg-white/20 rounded-full hover:bg-white/30 transition">
                  <LogOut size={20} className="sm:size-6" />
                </button>
              </>
            ) : (
              <button onClick={openLogin} className="p-2 sm:p-3 bg-white/20 rounded-full hover:bg-white/30 transition">
                <LogIn size={20} className="sm:size-6" />
              </button>
            )}
            <button onClick={toggleTheme} className="p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/30 transition">
              {theme === 'dark' ? <Sun size={20} className="sm:size-6" /> : <Moon size={20} className="sm:size-6" />}
            </button>
          </div>
        </div>

        {/* Переключатель "Мой район / Весь город" */}
        <div className="px-4 mt-1 flex justify-center">
          <div className="bg-gray-800/80 rounded-full p-1 flex border border-gray-700/50 text-sm">
            <button
              onClick={() => setShowMyDistrictOnly(true)}
              className={`px-4 py-1.5 rounded-l-full transition ${showMyDistrictOnly ? 'bg-white text-blue-600' : 'text-gray-300 hover:bg-gray-700/50'}`}
            >
              Мой район
            </button>
            <button
              onClick={() => setShowMyDistrictOnly(false)}
              className={`px-4 py-1.5 rounded-r-full transition ${!showMyDistrictOnly ? 'bg-white text-blue-600' : 'text-gray-300 hover:bg-gray-700/50'}`}
            >
              Весь город
            </button>
          </div>
        </div>

        {/* Вкладки */}
        <div className="px-4 mt-1 flex justify-center">
          <div className="bg-gray-800/80 rounded-full p-1 flex border border-gray-700/50 text-sm">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-1.5 rounded-l-full transition ${activeTab === 'announcements' ? 'bg-white text-blue-600' : 'text-gray-300 hover:bg-gray-700/50'}`}
            >
              Объявления
            </button>
            <button
              onClick={() => setActiveTab('urgent')}
              className={`px-4 py-1.5 transition ${activeTab === 'urgent' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
            >
              <Flame size={16} className="inline mr-1" /> Отдам даром сегодня
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-4 py-1.5 rounded-r-full transition ${activeTab === 'news' ? 'bg-white text-blue-600' : 'text-gray-300 hover:bg-gray-700/50'}`}
            >
              Новости
            </button>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 mt-28 sm:mt-32 ml-20 overflow-hidden">
        <div className="h-full">
          {activeTab === 'announcements' ? (
            <div className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth">
              {filteredAnnouncements.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-base sm:text-lg">
                  Ничего не найдено в твоём районе
                </div>
              ) : (
                filteredAnnouncements.map((item) => (
                  <div
                    key={item.id}
                    className="h-screen snap-start flex flex-col bg-gradient-to-b from-gray-900 to-black"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-1/3 sm:h-2/5 object-cover brightness-90"
                      onError={(e) => e.target.src = "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800"}
                    />
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h2 className="text-lg sm:text-2xl font-bold">{item.title}</h2>
                          {(item.isUrgent || item.price === "0 ₽" || item.category === "Отдам даром") && (
                            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                              🔥 СРОЧНО
                            </span>
                          )}
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-green-400 mb-2">{item.price}</p>
                        <div className="flex items-center text-gray-300 text-sm sm:text-base mb-2">
                          <MapPin size={16} className="mr-1" />
                          {item.location} • {item.district}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 mb-2">{item.category}</p>
                        <p className="text-sm sm:text-base text-gray-300 line-clamp-3 sm:line-clamp-4">{item.description}</p>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleLike(item.id)}
                          className={`flex-1 bg-white/10 text-white py-3 sm:py-4 rounded-xl font-bold hover:bg-white/20 transition flex items-center justify-center gap-2 text-sm sm:text-lg ${
                            item.likes.includes(currentUser?.email) ? 'text-red-500' : ''
                          }`}
                        >
                          <Heart size={20} fill={item.likes.includes(currentUser?.email) ? "currentColor" : "none"} />
                          {item.likes.length}
                        </button>
                        <button className="flex-1 bg-green-600 text-white py-3 sm:py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm sm:text-lg">
                          <MessageCircle size={20} /> Написать
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'urgent' ? (
            <div className="h-full overflow-y-auto p-3 sm:p-4 bg-gradient-to-b from-red-950 to-black">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 flex items-center gap-2 sticky top-0 z-10 bg-gradient-to-r from-red-600 to-orange-600 p-3 sm:p-4 rounded-xl shadow-lg">
                <Flame size={24} className="animate-bounce" /> Отдам даром сегодня!
              </h2>
              {urgentFreeToday.length === 0 ? (
                <div className="text-center text-gray-300 py-16 text-base sm:text-xl">
                  Пока ничего срочного... Добавь своё объявление! 🔥
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {urgentFreeToday.map(item => (
                    <div key={item.id} className="bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-red-500/30 hover:border-red-400 transition">
                      <img src={item.image} alt={item.title} className="w-full h-40 sm:h-48 object-cover" />
                      <div className="p-4">
                        <h3 className="text-lg sm:text-xl font-bold text-white">{item.title}</h3>
                        <p className="text-green-400 text-2xl sm:text-3xl font-black my-2">БЕСПЛАТНО</p>
                        <p className="text-sm sm:text-base text-gray-300 line-clamp-3">{item.description}</p>
                        <div className="flex items-center text-gray-400 text-xs sm:text-sm mt-2">
                          <MapPin size={14} className="mr-1" />
                          {item.location} • {item.district}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-4">
                {news.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => openNews(n)}
                    className="bg-gray-800 p-5 rounded-xl cursor-pointer hover:bg-gray-700 transition"
                  >
                    <p className="text-sm text-gray-400">{n.time}</p>
                    <h3 className="font-semibold text-lg">{n.title}</h3>
                    <p className="text-sm text-gray-300 line-clamp-3 mt-1">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Модалки */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg p-6 relative border border-green-500/30 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={28} />
            </button>

            <h2 className="text-3xl font-bold text-white mb-6 text-center">Новое объявление</h2>

            <form onSubmit={handleAddAdSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-gray-300 font-medium">Название *</label>
                <input name="title" className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:border-green-500" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-gray-300 font-medium">Цена *</label>
                  <input name="price" className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:border-green-500" required />
                </div>
                <div>
                  <label className="block mb-2 text-gray-300 font-medium">Район *</label>
                  <div className="flex gap-2">
                    <select name="district" className="flex-1 p-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:border-green-500">
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button type="button" onClick={handleDetectDistrict} className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center" title="Определить автоматически">
                      <Navigation size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-300 font-medium">Категория</label>
                <select name="category" className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:border-green-500">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="isUrgent" name="isUrgent" className="w-6 h-6 accent-green-500" />
                <label htmlFor="isUrgent" className="text-lg text-green-400 font-medium cursor-pointer flex items-center gap-2">
                  <Flame size={20} /> Срочно отдам сегодня!
                </label>
              </div>

              <div>
                <label className="block mb-2 text-gray-300 font-medium">Описание</label>
                <textarea name="description" rows={5} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:border-green-500" placeholder="Подробно опиши товар..." />
              </div>

              <div>
                <label className="block mb-2 text-gray-300 font-medium flex items-center gap-2">
                  <Upload size={18} /> Фото
                </label>
                <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white" />
                {preview && <img src={preview} alt="Превью" className="mt-4 max-h-48 rounded-xl mx-auto border-2 border-green-500/30" />}
              </div>

              <button type="submit" disabled={uploading} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-5 rounded-xl font-bold text-xl transition-all shadow-lg">
                {uploading ? 'Загрузка...' : 'Опубликовать 🔥'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Модалка авторизации */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-8 relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-500">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">
              {authMode === 'login' ? 'Вход' : 'Регистрация'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-5">
              {authMode === 'register' && (
                <div>
                  <label className="block mb-2 dark:text-gray-300">Имя</label>
                  <input name="name" type="text" className="w-full p-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg" />
                </div>
              )}
              <div>
                <label className="block mb-2 dark:text-gray-300">Email</label>
                <input name="email" type="email" required className="w-full p-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg" />
              </div>
              <div>
                <label className="block mb-2 dark:text-gray-300">Пароль</label>
                <input name="password" type="password" required className="w-full p-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 text-lg">
                {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>
            <p className="mt-6 text-center text-base">
              {authMode === 'login' ? (
                <button onClick={() => setAuthMode('register')} className="text-blue-600 hover:underline">
                  Нет аккаунта? Регистрация
                </button>
              ) : (
                <button onClick={() => setAuthMode('login')} className="text-blue-600 hover:underline">
                  Уже есть аккаунт? Вход
                </button>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Модалка профиля */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative border border-indigo-500/30">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={28} />
            </button>

            <div className="flex flex-col items-center mt-8 mb-8">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-lg">
                {currentUser.name[0].toUpperCase()}
              </div>
              <h2 className="text-3xl font-bold text-white">{currentUser.name}</h2>
              <p className="text-gray-400 mt-1">{currentUser.email}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800/50 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-indigo-400">
                  {announcements.filter(a => a.ownerEmail === currentUser.email).length}
                </p>
                <p className="text-sm text-gray-400">Объявлений</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-400">
                  {announcements.reduce((sum, a) => sum + (a.likes?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-400">Лайков</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {announcements.reduce((sum, a) => sum + (a.comments?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-400">Комментариев</p>
              </div>
            </div>

            {!editingProfile ? (
              <button
                onClick={() => setEditingProfile(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl mb-8 flex items-center justify-center gap-2"
              >
                <Edit size={18} /> Редактировать
              </button>
            ) : (
              <form onSubmit={handleEditProfile} className="mb-8 space-y-4">
                <div>
                  <label className="block mb-2 text-gray-300">Имя</label>
                  <input
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-green-600 py-3 rounded-xl">
                    Сохранить
                  </button>
                  <button type="button" onClick={() => setEditingProfile(false)} className="flex-1 bg-gray-700 py-3 rounded-xl">
                    Отмена
                  </button>
                </div>
              </form>
            )}

            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star size={20} className="text-yellow-400" fill="currentColor" /> Отзывы
              </h3>

              <div className="space-y-4 mb-6">
                {reviews.map(r => (
                  <div key={r.id} className="bg-gray-800 p-4 rounded-xl">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{r.user}</span>
                      <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{r.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{r.date}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={addReview} className="flex flex-col gap-3">
                <textarea
                  value={newReviewText}
                  onChange={e => setNewReviewText(e.target.value)}
                  placeholder="Напишите отзыв..."
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white min-h-[80px]"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl"
                  disabled={!newReviewText.trim()}
                >
                  Добавить отзыв
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Просмотр чужого профиля */}
      {showViewedProfile && viewedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative border border-purple-500/30">
            <button 
              onClick={() => setShowViewedProfile(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={28} />
            </button>

            <div className="flex flex-col items-center mt-8 mb-8">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-lg">
                {viewedUser.name[0].toUpperCase()}
              </div>
              <h2 className="text-3xl font-bold text-white">{viewedUser.name}</h2>
              <p className="text-gray-400 mt-1">{viewedUser.email}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800/50 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-indigo-400">
                  {announcements.filter(a => a.ownerEmail === viewedUser.email).length}
                </p>
                <p className="text-sm text-gray-400">Объявлений</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-400">
                  {announcements.reduce((sum, a) => sum + (a.likes?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-400">Лайков</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {announcements.reduce((sum, a) => sum + (a.comments?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-400">Комментариев</p>
              </div>
            </div>

            <p className="text-center text-gray-400 py-4 mt-4">
              Это профиль другого пользователя
            </p>
          </div>
        </div>
      )}

      {/* Модалка новости */}
      {showNewsModal && selectedNews && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative border border-gray-700">
            <button onClick={() => setShowNewsModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={28} />
            </button>

            <h2 className="text-2xl font-bold mb-3 text-white">{selectedNews.title}</h2>
            <p className="text-sm text-gray-400 mb-4">{selectedNews.time}</p>
            <p className="text-gray-300 mb-6">{selectedNews.text}</p>

            <div className="space-y-4 mb-6">
              {(newsComments[selectedNews.id] ?? []).map((comm, idx) => (
                <div key={idx} className="bg-gray-800 p-4 rounded-xl">
                  <p 
                    className="font-semibold text-indigo-300 cursor-pointer hover:underline"
                    onClick={() => openViewedProfile(comm.user, comm.userEmail)}
                  >
                    {comm.user}
                  </p>
                  <p className="text-gray-300 mt-1">{comm.text}</p>
                </div>
              ))}
              {(newsComments[selectedNews.id] ?? []).length === 0 && (
                <p className="text-gray-500 text-center italic">Пока нет комментариев</p>
              )}
            </div>

            {currentUser ? (
              <form onSubmit={handleNewsComment} className="flex gap-3 sticky bottom-0 bg-gray-900 pt-4">
                <input
                  type="text"
                  placeholder="Напишите комментарий..."
                  value={commentText[selectedNews.id] || ''}
                  onChange={(e) => setCommentText(prev => ({ ...prev, [selectedNews.id]: e.target.value }))}
                  className="flex-1 p-4 rounded-xl bg-gray-800 border border-gray-700 text-white text-base"
                />
                <button type="submit" className="bg-blue-600 px-6 py-4 rounded-xl hover:bg-blue-700">
                  <MessageCircle size={24} />
                </button>
              </form>
            ) : (
              <p className="text-center text-gray-400 py-4">Войдите, чтобы комментировать</p>
            )}
          </div>
        </div>
      )}

      <footer className="bg-gray-900 dark:bg-black text-white py-6 text-center mt-auto text-sm">
        © 2026 Тверь Маркет • Сделано с ❤️ в Твери
      </footer>
    </div>
  );
}

export default App;
