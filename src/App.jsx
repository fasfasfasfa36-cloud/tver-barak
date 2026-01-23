import { useState, useEffect } from 'react';
import {
  Sun, Moon, Heart, MessageCircle, MapPin,
  X, PlusCircle, Upload,
  UserCircle, Navigation, Flame, ArrowLeft, Grid
} from 'lucide-react';

// Константы
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

  // Telegram инициализация + фикс отступов
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Очень важно для мобильных в Telegram
      document.documentElement.style.setProperty('--sat', `${tg.viewportStableHeight}px`);
      document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
      document.body.style.paddingTop = 'env(safe-area-inset-top)';

      const tgUser = tg.initDataUnsafe?.user;

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
    } else {
      console.warn("Не в Telegram → тестовый режим");
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
    if (!currentUser) return alert("Пользователь не найден");

    // ... (весь код handleAddAdSubmit без изменений, только сократил для читаемости)

    // В конце:
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
    const file = e.target.files?.[0];
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
    } finally {
      setUploading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(ad => 
    selectedCategory === 'Все' || ad.category === selectedCategory
  );

  const urgentAnnouncements = announcements.filter(ad => ad.isUrgent);

  return (
    <div className={`min-h-[100dvh] ${theme === 'dark' ? 'bg-gradient-to-br from-gray-950 via-black to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} text-white flex flex-col`}>
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'home' ? (
          // домашняя страница — без изменений, она и так норм
          <div className="min-h-[100dvh] flex flex-col items-center justify-center text-center space-y-10 px-5">
            {/* ... твой код home ... */}
          </div>
        ) : (activeTab === 'announcements' || activeTab === 'urgent') ? (
          <div className="h-full flex">
            {/* Категории слева */}
            <div className="fixed left-0 top-0 bottom-0 w-20 bg-black/80 backdrop-blur-xl border-r border-white/10 z-40 overflow-y-auto">
              <div className="flex flex-col items-center py-6 gap-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl text-[10px] font-medium transition-all ${
                      selectedCategory === cat
                        ? activeTab === 'urgent'
                          ? 'bg-gradient-to-br from-red-600 to-rose-700 shadow-red-500/60 scale-110 text-white'
                          : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/60 scale-110 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-105'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Кнопка назад */}
            <button
              onClick={() => setActiveTab('home')}
              className="fixed top-[env(safe-area-inset-top)] left-24 z-50 mt-4 p-3 bg-black/70 backdrop-blur-xl rounded-full text-white hover:bg-gray-800 transition shadow-lg"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Свайп объявлений */}
            <div className="flex-1 ml-20 overflow-y-auto snap-y snap-mandatory scroll-smooth">
              {(activeTab === 'announcements' ? filteredAnnouncements : urgentAnnouncements).length === 0 ? (
                <div className="min-h-[100dvh] flex items-center justify-center text-gray-400 text-lg px-6 text-center">
                  {activeTab === 'urgent' ? "Нет срочных объявлений..." : "Пока нет объявлений..."}
                </div>
              ) : (
                (activeTab === 'announcements' ? filteredAnnouncements : urgentAnnouncements).map(item => (
                  <article
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

                    {/* Главный фикс — mt-auto + pb-safe */}
                    <div className="relative z-20 mt-auto p-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
                      <div className={`bg-black/85 backdrop-blur-xl rounded-3xl p-6 border ${
                        activeTab === 'urgent' ? 'border-red-500/50' : 'border-white/10'
                      } shadow-2xl`}>
                        {activeTab === 'urgent' && (
                          <div className="flex items-center gap-3 mb-4">
                            <Flame size={36} className="text-red-400 animate-bounce" />
                            <h2 className="text-3xl font-extrabold text-white">СРОЧНО СЕГОДНЯ</h2>
                          </div>
                        )}

                        <h2 className="text-3xl font-bold text-white mb-3 line-clamp-2">{item.title}</h2>
                        <p className="text-5xl font-black text-green-400 mb-5">{item.price}</p>
                        <div className="flex items-center text-gray-300 text-lg mb-4">
                          <MapPin size={20} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{item.location} • {item.district}</span>
                        </div>
                        <p className="text-base text-gray-300 line-clamp-5 mb-6">{item.description}</p>

                        <div className="flex gap-4">
                          <button className="flex-1 bg-white/10 py-4 rounded-2xl text-white font-bold hover:bg-white/20 transition flex items-center justify-center gap-2">
                            <Heart size={24} /> Лайк
                          </button>
                          <button className="flex-1 bg-green-600 py-4 rounded-2xl text-white font-bold hover:bg-green-700 transition flex items-center justify-center gap-2">
                            <MessageCircle size={24} /> Написать
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        ) : null}
      </main>

      {/* Модалки добавления и профиля — почти без изменений, только max-h-[90dvh] */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-950 rounded-3xl w-full max-w-xl p-10 relative border border-green-500/40 shadow-2xl shadow-green-500/30 max-h-[90dvh] overflow-y-auto">
            {/* ... остальной код модалки добавления без изменений ... */}
          </div>
        </div>
      )}

      {showProfileModal && currentUser && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-950 rounded-3xl w-full max-w-4xl p-10 relative border border-purple-500/40 shadow-2xl shadow-purple-600/30 max-h-[90dvh] overflow-y-auto">
            {/* ... остальной код профиля без изменений ... */}
          </div>
        </div>
      )}

      <footer className="bg-black/90 backdrop-blur-xl border-t border-white/10 text-gray-400 py-5 text-center text-sm mt-auto">
        © 2026 Тверь Маркет • Сделано с ❤️ в Твери
      </footer>
    </div>
  );
}

export default App;
