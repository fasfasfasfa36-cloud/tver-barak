import { useState, useEffect, useRef } from 'react';
import {
  Sun, Moon, Heart, MessageCircle, MapPin, Eye,
  X, PlusCircle, Upload, UserCircle, Edit, Navigation, Flame,
  ArrowLeft, Grid, LogIn, Search, Repeat, Phone, Share2, Bell, Trash2, Send,
  ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';

const categories = ["Все", "Электроника", "Недвижимость", "Одежда", "Авто", "Услуги", "Отдам даром"];
const districts = ["Все районы", "Центральный", "Заволжский", "Пролетарский", "Московский"];

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [currentUser, setCurrentUser] = useState(null);
  const [announcements, setAnnouncements] = useState(() => JSON.parse(localStorage.getItem('announcements') || '[]'));
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites') || '[]'));
  const [chats, setChats] = useState(() => JSON.parse(localStorage.getItem('chats') || '{}'));
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('notifications') || '[]'));
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBarterModal, setShowBarterModal] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [chatAnnouncement, setChatAnnouncement] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Все районы');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [dateFilter, setDateFilter] = useState('all');
  const [savedSearches, setSavedSearches] = useState(() => JSON.parse(localStorage.getItem('savedSearches') || '[]'));
  const [newAd, setNewAd] = useState({
    title: '',
    price: '',
    phone: '',
    location: '',
    description: '',
    category: 'Другое',
    district: 'Центральный',
    isUrgent: false,
    images: [],
    status: 'active',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('Обычное');
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    district: 'Центральный',
    photoFile: null,
    photoPreview: null,
    ratings: { average: 0, count: 0, reviews: [] },
  });
  const [isOnline, setIsOnline] = useState(Math.random() > 0.4);
  const [currentImage, setCurrentImage] = useState(0);
  const [commentText, setCommentText] = useState('');
  const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_KEY || "5ab97e3a3c6c71a8c1dce30eceb8b9f3";
  const chatContainerRef = useRef(null);

  // Telegram + User
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('bg-black');
      tg.setBackgroundColor('#000000');
      document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
      document.body.style.paddingTop = 'env(safe-area-inset-top)';
      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        const user = {
          telegramId: tgUser.id.toString(),
          name: (tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '')) || 'Пользователь',
          username: tgUser.username || '',
          photoUrl: tgUser.photo_url || null,
          isTelegram: true,
          bio: '',
          district: 'Центральный',
          ratings: { average: 0, count: 0, reviews: [] },
        };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    }
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  // Сохранение
  useEffect(() => { localStorage.setItem('announcements', JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem('favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('chats', JSON.stringify(chats)); }, [chats]);
  useEffect(() => { localStorage.setItem('notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('savedSearches', JSON.stringify(savedSearches)); }, [savedSearches]);

  // Автоскролл чата
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats, showChatModal]);

  useEffect(() => {
    if (showEditProfileModal && currentUser) {
      setEditForm({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        district: currentUser.district || 'Центральный',
        photoFile: null,
        photoPreview: currentUser.photoUrl || null,
        ratings: currentUser.ratings || { average: 0, count: 0, reviews: [] },
      });
    }
  }, [showEditProfileModal, currentUser]);

  // Просмотры
  useEffect(() => {
    if (selectedAnnouncement) {
      setAnnouncements(prev => prev.map(a => 
        a.id === selectedAnnouncement.id ? { ...a, views: (a.views || 0) + 1 } : a
      ));
    }
  }, [selectedAnnouncement?.id]);

  // Фейковый онлайн
  useEffect(() => {
    const interval = setInterval(() => setIsOnline(Math.random() > 0.4), 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    if (window.Telegram?.WebApp) window.Telegram.WebApp.close();
  };

  const openAddAd = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }
    setEditingAnnouncement(null);
    setNewAd({
      title: '',
      price: '',
      phone: '',
      location: '',
      description: '',
      category: 'Другое',
      district: 'Центральный',
      isUrgent: false,
      images: [],
      status: 'active',
    });
    setSelectedFiles([]);
    setPreviews([]);
    setShowAddModal(true);
  };

  const openEditAd = (ad) => {
    setEditingAnnouncement(ad);
    setNewAd({
      title: ad.title,
      price: ad.price,
      phone: ad.phone || '',
      location: ad.location,
      description: ad.description.replace(/\n\n🔥 СРОЧНО! Отдам сегодня 🔥$/, ''),
      category: ad.category,
      district: ad.district,
      isUrgent: ad.isUrgent,
      images: ad.images || [ad.image],
      status: ad.status,
    });
    setPreviews(ad.images || [ad.image]);
    setShowAddModal(true);
  };

  const openProfile = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }
    setShowProfileModal(true);
  };

  const openEditProfile = () => {
    setShowEditProfileModal(true);
    setShowProfileModal(false);
  };

  const openBarter = () => setShowBarterModal(true);

  const openChat = (announcement) => {
    setChatAnnouncement(announcement);
    setShowChatModal(true);
  };

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const openAnnouncement = (ad) => setSelectedAnnouncement(ad);

  const closeAnnouncement = () => setSelectedAnnouncement(null);

  const getLocation = () => {
    if (!navigator.geolocation) return alert("Геолокация не поддерживается");
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          if (data?.display_name) {
            const address = data.display_name.split(', ').slice(0, 3).join(', ');
            let detectedDistrict = 'Центральный';
            const lower = address.toLowerCase();
            if (lower.includes('заволжск') || lower.includes('заволжье')) detectedDistrict = 'Заволжский';
            if (lower.includes('пролетарск') || lower.includes('пролетарий')) detectedDistrict = 'Пролетарский';
            if (lower.includes('московск') || lower.includes('москва')) detectedDistrict = 'Московский';
            setNewAd(prev => ({ ...prev, location: address, district: detectedDistrict }));
            alert(`Местоположение: ${address}`);
          } else {
            alert("Не удалось определить адрес");
          }
        } catch {
          alert("Ошибка геолокации");
        } finally {
          setGettingLocation(false);
        }
      },
      () => {
        alert("Доступ к геолокации запрещён");
        setGettingLocation(false);
      }
    );
  };

  const handleAuth = (e) => {
    e.preventDefault();
    setAuthError('');
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();
    const name = authMode === 'register' ? e.target.name?.value?.trim() : null;
    if (!email || !password) return setAuthError('Заполните email и пароль');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (authMode === 'register') {
      if (users.find(u => u.email === email)) return setAuthError('Email уже занят');
      const newUser = { email, name: name || email.split('@')[0], password, ratings: { average: 0, count: 0, reviews: [] } };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      alert('Регистрация успешна!');
      setShowAuthModal(false);
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) return setAuthError('Неверный email или пароль');
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      alert('Вход выполнен!');
      setShowAuthModal(false);
    }
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    let newPhotoUrl = currentUser.photoUrl;
    if (editForm.photoFile) {
      newPhotoUrl = await uploadToImgBB(editForm.photoFile);
      if (!newPhotoUrl) return;
    }
    const updatedUser = {
      ...currentUser,
      name: editForm.name.trim() || currentUser.name,
      bio: editForm.bio.trim(),
      district: editForm.district,
      photoUrl: newPhotoUrl,
      ratings: editForm.ratings,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    alert("Профиль обновлён!");
    setShowEditProfileModal(false);
    setShowProfileModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditForm(prev => ({ ...prev, photoFile: file }));
    const reader = new FileReader();
    reader.onloadend = () => setEditForm(prev => ({ ...prev, photoPreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleAddAdSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("Нужно войти");
    const { title, price, phone, location, description, category, district, isUrgent, images, status } = newAd;
    if (!title.trim() || !price.trim() || !location.trim()) return alert("Заполните название, цену и местоположение!");
    let imageUrls = images;
    if (selectedFiles.length > 0) {
      imageUrls = [];
      for (const file of selectedFiles) {
        const url = await uploadToImgBB(file);
        if (url) imageUrls.push(url);
      }
    }
    const finalDescription = isUrgent ? `${description}\n\n🔥 СРОЧНО! Отдам сегодня 🔥` : description;
    const announcement = {
      id: editingAnnouncement ? editingAnnouncement.id : Date.now(),
      title: title.trim(),
      price: price.trim(),
      phone: phone.trim(),
      location: location.trim(),
      description: finalDescription,
      category,
      district: district || 'Центральный',
      images: imageUrls,
      ownerTelegramId: currentUser.telegramId || currentUser.email,
      ownerName: currentUser.name || currentUser.email.split('@')[0],
      likes: editingAnnouncement ? editingAnnouncement.likes : [],
      comments: editingAnnouncement ? editingAnnouncement.comments : [],
      isUrgent,
      createdAt: new Date().toISOString(),
      views: editingAnnouncement ? editingAnnouncement.views : 0,
      status: status || 'active',
    };
    if (editingAnnouncement) {
      setAnnouncements(prev => prev.map(a => a.id === editingAnnouncement.id ? announcement : a));
      alert("Объявление обновлено!");
    } else {
      setAnnouncements(prev => [announcement, ...prev]);
      addNotification(`Ваше объявление "${title}" опубликовано!`);
      checkSavedSearches(announcement);
      alert("Объявление добавлено!");
    }
    setNewAd({
      title: '',
      price: '',
      phone: '',
      location: '',
      description: '',
      category: 'Другое',
      district: 'Центральный',
      isUrgent: false,
      images: [],
      status: 'active',
    });
    setSelectedFiles([]);
    setPreviews([]);
    setShowAddModal(false);
    setEditingAnnouncement(null);
  };

  const handleAddAdChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAd(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) return alert("Максимум 5 фото");
    setSelectedFiles(files);
    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => newPreviews.push(reader.result);
      reader.readAsDataURL(file);
    });
    setPreviews(newPreviews);
  };

  const uploadToImgBB = async (file) => {
    setUploading(true);
    setUploadProgress(0);
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
      setUploadProgress(0);
    }
  };

  const deleteAnnouncement = (id) => {
    if (window.confirm("Удалить объявление навсегда?")) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      addNotification("Объявление удалено");
    }
  };

  const markAsSold = (id) => {
    if (window.confirm("Отметить как проданное?")) {
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, status: 'sold' } : a));
    }
  };

  const addNotification = (message) => {
    const newNotif = {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim() || !chatAnnouncement || !currentUser) return;
    const chatKey = `${chatAnnouncement.id}_${currentUser.telegramId || currentUser.email}`;
    const newMsg = {
      id: Date.now(),
      text: chatMessage.trim(),
      sender: currentUser.name || 'Вы',
      time: new Date().toLocaleTimeString(),
      isMe: true,
    };
    setChats(prev => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), newMsg],
    }));
    setChatMessage('');
    if (chatAnnouncement.ownerTelegramId !== (currentUser.telegramId || currentUser.email)) {
      addNotification(`Новое сообщение в объявлении "${chatAnnouncement.title}"`);
    }
  };

  const addComment = () => {
    if (!commentText.trim() || !selectedAnnouncement || !currentUser) return;
    const newComment = {
      id: Date.now(),
      text: commentText.trim(),
      author: currentUser.name || 'Гость',
      createdAt: new Date().toISOString(),
    };
    setAnnouncements(prev => prev.map(a => 
      a.id === selectedAnnouncement.id 
        ? { ...a, comments: [...(a.comments || []), newComment] } 
        : a
    ));
    setCommentText('');
  };

  const saveSearch = () => {
    const search = { 
      id: Date.now(), 
      query: searchQuery, 
      category: selectedCategory, 
      district: selectedDistrict, 
      priceMin, 
      priceMax 
    };
    setSavedSearches(prev => [...prev, search]);
    alert("Поиск сохранён!");
  };

  const checkSavedSearches = (newAd) => {
    savedSearches.forEach(search => {
      const matches = 
        (search.query === '' || newAd.title.toLowerCase().includes(search.query.toLowerCase()) || newAd.description.toLowerCase().includes(search.query.toLowerCase())) &&
        (search.category === 'Все' || newAd.category === search.category) &&
        (search.district === 'Все районы' || newAd.district === search.district) &&
        (parseFloat(newAd.price.replace(/[^0-9.]/g, '')) >= (parseFloat(search.priceMin) || -Infinity)) &&
        (parseFloat(newAd.price.replace(/[^0-9.]/g, '')) <= (parseFloat(search.priceMax) || Infinity));
      if (matches) {
        addNotification(`Новое объявление по вашему поиску: "${newAd.title}"`);
      }
    });
  };

  const addReview = (sellerId, stars, text) => {
    if (sellerId === currentUser.telegramId || sellerId === currentUser.email) return;
    const updatedRatings = {
      ...currentUser.ratings,
      reviews: [...currentUser.ratings.reviews, { from: currentUser.name, stars, text }],
      count: currentUser.ratings.count + 1,
      average: ((currentUser.ratings.average * currentUser.ratings.count) + stars) / (currentUser.ratings.count + 1)
    };
    setCurrentUser(prev => ({ ...prev, ratings: updatedRatings }));
    localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, ratings: updatedRatings }));
  };

  const filteredAndSorted = announcements.filter(ad => {
    const matchesCategory = selectedCategory === 'Все' || ad.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === 'Все районы' || ad.district === selectedDistrict;
    const priceNum = parseFloat(ad.price.replace(/[^0-9.]/g, ''));
    const min = priceMin ? parseFloat(priceMin) : -Infinity;
    const max = priceMax ? parseFloat(priceMax) : Infinity;
    const now = new Date();
    const matchesDate = dateFilter === 'all' ||
      (dateFilter === 'today' && new Date(ad.createdAt).toDateString() === now.toDateString()) ||
      (dateFilter === 'yesterday' && new Date(ad.createdAt).toDateString() === new Date(now.setDate(now.getDate()-1)).toDateString()) ||
      (dateFilter === 'week' && new Date(ad.createdAt) > new Date(now.setDate(now.getDate()-7)));
    return matchesCategory && matchesSearch && matchesDistrict && priceNum >= min && priceNum <= max && matchesDate && ad.status === 'active';
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'priceAsc') return parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, ''));
    if (sortBy === 'priceDesc') return parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, ''));
    return 0;
  });

  const urgent = filteredAndSorted.filter(ad => ad.isUrgent);
  const myAds = announcements.filter(a => a.ownerTelegramId === currentUser?.telegramId || a.ownerTelegramId === currentUser?.email);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-[100dvh] ${theme === 'dark' ? 'bg-gradient-to-br from-gray-950 via-black to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} text-white flex flex-col transition-colors duration-300`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50 px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Тверь Маркет
        </h1>
        <div className="flex items-center gap-5">
          <button onClick={() => setShowNotificationsModal(true)} className="relative">
            <Bell size={24} />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadNotifs}
              </span>
            )}
          </button>
          <button onClick={() => setShowFavorites(true)} className="relative">
            <Heart size={24} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>
          <button onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-hidden pt-16 pb-20">
        {activeTab === 'home' ? (
          <div className="min-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6 flex flex-col items-center justify-center space-y-10">
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                Тверь Маркет
              </h1>
              <p className="text-xl md:text-2xl text-gray-300">Самая живая барахолка Твери</p>
            </div>
            <div className="w-full max-w-xl mx-auto px-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Что ищешь в Твери? iPhone, диван, работа..."
                  className="w-full p-4 pl-12 bg-black/60 border border-gray-700 rounded-2xl text-white text-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              <button onClick={() => setActiveTab('announcements')} className="group bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-gray-700 hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/20">
                <Grid className="mx-auto mb-4 text-blue-400" size={40} />
                <h3 className="text-xl font-bold">Объявления</h3>
              </button>
              <button onClick={() => setActiveTab('urgent')} className="group bg-gradient-to-br from-red-900 to-red-950 p-8 rounded-3xl border border-red-700 hover:border-red-400 transition-all hover:shadow-2xl hover:shadow-red-500/20 animate-pulse">
                <Flame className="mx-auto mb-4 text-red-400" size={40} />
                <h3 className="text-xl font-bold">Срочно</h3>
              </button>
              {currentUser ? (
                <button onClick={openProfile} className="col-span-2 bg-gradient-to-br from-indigo-900 to-purple-950 p-8 rounded-3xl border border-indigo-700 hover:border-indigo-400 transition-all hover:shadow-2xl hover:shadow-indigo-500/20">
                  <UserCircle className="mx-auto mb-4 text-indigo-400" size={40} />
                  <h3 className="text-xl font-bold">Профиль</h3>
                </button>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="col-span-2 bg-gradient-to-br from-purple-900 to-pink-950 p-8 rounded-3xl border border-purple-700 hover:border-purple-400 transition-all hover:shadow-2xl hover:shadow-purple-500/20">
                  <LogIn className="mx-auto mb-4 text-purple-400" size={40} />
                  <h3 className="text-xl font-bold">Войти</h3>
                </button>
              )}
              <button onClick={openAddAd} className="col-span-2 bg-gradient-to-r from-green-600 to-teal-600 p-9 rounded-3xl text-2xl font-bold hover:from-green-700 hover:to-teal-700 transition-all shadow-2xl flex items-center justify-center gap-4">
                <PlusCircle size={32} /> Добавить объявление
              </button>
              <button onClick={openBarter} className="col-span-2 bg-gradient-to-r from-purple-600 to-pink-600 p-9 rounded-3xl text-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl flex items-center justify-center gap-4">
                <Repeat size={32} /> Бартер-клуб
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <button
              onClick={() => setActiveTab('home')}
              className="fixed top-20 left-4 z-50 p-3 bg-black/70 backdrop-blur-xl rounded-full text-white hover:bg-gray-800 transition shadow-lg"
            >
              <ArrowLeft size={24} />
            </button>

            <div className="fixed left-0 right-0 top-16 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4">
              <div className="flex flex-wrap gap-4 max-w-5xl mx-auto">
                <input
                  type="number"
                  placeholder="Цена от"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="p-3 bg-black/60 border border-gray-700 rounded-xl text-white w-32"
                />
                <input
                  type="number"
                  placeholder="Цена до"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="p-3 bg-black/60 border border-gray-700 rounded-xl text-white w-32"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-3 bg-black/60 border border-gray-700 rounded-xl text-white"
                >
                  <option value="newest">Сначала новые</option>
                  <option value="priceAsc">Цена по возрастанию</option>
                  <option value="priceDesc">Цена по убыванию</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="p-3 bg-black/60 border border-gray-700 rounded-xl text-white"
                >
                  <option value="all">Все время</option>
                  <option value="today">Сегодня</option>
                  <option value="yesterday">Вчера</option>
                  <option value="week">За неделю</option>
                </select>
                <button onClick={saveSearch} className="p-3 bg-purple-600 rounded-xl text-white font-medium">
                  Сохранить поиск
                </button>
              </div>
            </div>

            <div className="fixed left-0 right-0 top-[11rem] z-40 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="flex gap-3 max-w-5xl mx-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex-shrink-0
                      ${selectedCategory === cat 
                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' 
                        : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 mt-[180px] overflow-y-auto pb-20 px-3 sm:px-4">
              {activeTab === 'announcements' ? (
                filteredAndSorted.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                    <Heart size={64} className="mb-6 opacity-50" />
                    <p className="text-xl font-medium">Ничего не найдено</p>
                    <p className="text-base mt-2 opacity-80">Попробуй изменить фильтры</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAndSorted.map(item => (
                      <div
                        key={item.id}
                        className="bg-gradient-to-br from-gray-900/90 to-black/90 rounded-xl overflow-hidden border border-gray-800/70 hover:border-green-600/50 transition-all duration-300 shadow-md hover:shadow-green-900/30 cursor-pointer active:scale-[0.98]"
                        onClick={() => openAnnouncement(item)}
                      >
                        <div className="flex">
                          <div className="relative w-28 h-28 flex-shrink-0">
                            <img
                              src={item.images?.[0] || item.image || "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800"}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={e => e.target.src = "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800"}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            {item.isUrgent && (
                              <div className="absolute top-1 right-1 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                                <Flame size={10} /> СРОЧНО
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-3 flex flex-col justify-between">
                            <div>
                              <h3 className="text-base font-semibold text-white line-clamp-2 mb-1">
                                {item.title}
                              </h3>
                              <p className="text-2xl font-black text-green-400 mb-1 tracking-tight">
                                {item.price}
                                {(parseFloat(item.price.replace(/[^0-9.]/g, '')) === 0 ||
                                  item.price.toLowerCase().includes('дар') ||
                                  item.price.toLowerCase().includes('бесплатно') ||
                                  item.price.trim() === '0 ₽') && (
                                  <span className="text-sm font-bold text-green-300 ml-1 animate-pulse">ДАРОМ</span>
                                )}
                              </p>
                              <div className="flex items-center gap-1.5 text-gray-300 text-xs">
                                <MapPin size={14} className="text-green-400 flex-shrink-0" />
                                <span className="truncate">{item.location} • {item.district}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1">
                                <Eye size={14} /> {item.views || 0} просмотров
                              </div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                              className="absolute bottom-3 right-3 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition active:scale-95"
                            >
                              <Heart
                                size={20}
                                fill={favorites.includes(item.id) ? "#ff3366" : "none"}
                                color={favorites.includes(item.id) ? "#ff3366" : "#ffffff"}
                                className="transition-transform hover:scale-110"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : activeTab === 'urgent' ? (
                urgent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                    <Flame size={64} className="mb-6 opacity-50" />
                    <p className="text-xl font-medium">Пока нет срочных объявлений</p>
                    <p className="text-base mt-2 opacity-80">Скоро появятся 🔥</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {urgent.map(item => (
                      <div
                        key={item.id}
                        className="bg-gradient-to-br from-gray-900/90 to-black/90 rounded-xl overflow-hidden border border-red-800/50 hover:border-red-600/60 transition-all duration-300 shadow-md hover:shadow-red-900/30 cursor-pointer active:scale-[0.98]"
                        onClick={() => openAnnouncement(item)}
                      >
                        <div className="flex">
                          <div className="relative w-28 h-28 flex-shrink-0">
                            <img
                              src={item.images?.[0] || item.image || "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800"}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={e => e.target.src = "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800"}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute top-1 right-1 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                              <Flame size={10} /> СРОЧНО
                            </div>
                          </div>
                          <div className="flex-1 p-3 flex flex-col justify-between">
                            <div>
                              <h3 className="text-base font-semibold text-white line-clamp-2 mb-1">
                                {item.title}
                              </h3>
                              <p className="text-2xl font-black text-green-400 mb-1 tracking-tight">
                                {item.price}
                                {(parseFloat(item.price.replace(/[^0-9.]/g, '')) === 0 ||
                                  item.price.toLowerCase().includes('дар') ||
                                  item.price.toLowerCase().includes('бесплатно') ||
                                  item.price.trim() === '0 ₽') && (
                                  <span className="text-sm font-bold text-green-300 ml-1 animate-pulse">ДАРОМ</span>
                                )}
                              </p>
                              <div className="flex items-center gap-1.5 text-gray-300 text-xs">
                                <MapPin size={14} className="text-green-400 flex-shrink-0" />
                                <span className="truncate">{item.location} • {item.district}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1">
                                <Eye size={14} /> {item.views || 0} просмотров
                              </div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                              className="absolute bottom-3 right-3 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition active:scale-95"
                            >
                              <Heart
                                size={20}
                                fill={favorites.includes(item.id) ? "#ff3366" : "none"}
                                color={favorites.includes(item.id) ? "#ff3366" : "#ffffff"}
                                className="transition-transform hover:scale-110"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : null}
            </div>
          </div>
        )}
      </main>

      {/* Полный просмотр объявления */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col overflow-y-auto">
          <div className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-gray-800 p-4 flex items-center justify-between z-10">
            <button onClick={closeAnnouncement} className="text-gray-300 hover:text-white">
              <ArrowLeft size={28} />
            </button>
            <h3 className="text-lg font-bold text-center flex-1 truncate px-4">
              {selectedAnnouncement.title}
            </h3>
            <div className="w-10" />
          </div>
          <div className="p-4 flex-1">
            <div className="relative rounded-2xl overflow-hidden mb-6 shadow-2xl shadow-black/50">
              <img
                src={selectedAnnouncement.images?.[currentImage] || selectedAnnouncement.image || "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800"}
                alt={selectedAnnouncement.title}
                className="w-full h-80 object-cover"
                onError={e => e.target.src = "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800"}
              />
              {selectedAnnouncement.isUrgent && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
                  <Flame size={20} /> СРОЧНО СЕГОДНЯ
                </div>
              )}
              {selectedAnnouncement.images?.length > 1 && (
                <>
                  <button onClick={() => setCurrentImage(i => Math.max(0, i-1))} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 rounded-full text-white">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={() => setCurrentImage(i => Math.min(selectedAnnouncement.images.length - 1, i+1))} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 rounded-full text-white">
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            <p className="text-5xl font-black text-green-400 mb-4 text-center tracking-tight">
              {selectedAnnouncement.price}
              {(parseFloat(selectedAnnouncement.price.replace(/[^0-9.]/g, '')) === 0 ||
                selectedAnnouncement.price.toLowerCase().includes('дар') ||
                selectedAnnouncement.price.toLowerCase().includes('бесплатно') ||
                selectedAnnouncement.price.trim() === '0 ₽') && (
                <span className="text-2xl font-bold text-green-300 ml-3 animate-pulse">ДАРОМ</span>
              )}
            </p>
            <h2 className="text-2xl font-bold text-white mb-3 text-center">
              {selectedAnnouncement.title}
            </h2>
            <div className="flex items-center justify-center gap-2 text-gray-300 mb-6">
              <MapPin size={20} className="text-green-400" />
              <span>{selectedAnnouncement.location} • {selectedAnnouncement.district}</span>
            </div>
            <div className="bg-black/50 rounded-xl p-5 mb-6">
              <p className="text-gray-200 whitespace-pre-wrap">
                {selectedAnnouncement.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => openChat(selectedAnnouncement)}
                className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg"
              >
                <MessageCircle size={24} /> Написать
              </button>
              <button
                onClick={() => window.open(`tel:${selectedAnnouncement.phone || ''}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg"
              >
                <Phone size={24} /> Позвонить
              </button>
              <button
                onClick={async () => {
                  const shareData = {
                    title: selectedAnnouncement.title,
                    text: `${selectedAnnouncement.title} — ${selectedAnnouncement.price}\n${selectedAnnouncement.description.slice(0,100)}...`,
                    url: window.location.href + `#ad-${selectedAnnouncement.id}`
                  };
                  try {
                    await navigator.share(shareData);
                  } catch (err) {
                    alert("Поделись ссылкой вручную: " + window.location.href);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg col-span-2"
              >
                <Share2 size={24} /> Поделиться
              </button>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Вопросы и комментарии</h3>
              <div className="space-y-4">
                {selectedAnnouncement.comments?.map(c => (
                  <div key={c.id} className="bg-gray-900/50 p-4 rounded-xl">
                    <p className="font-medium">{c.author}</p>
                    <p className="text-gray-300">{c.text}</p>
                    <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Задать вопрос..."
                  className="flex-1 p-4 bg-gray-800 border border-gray-700 rounded-full text-white"
                  onKeyDown={(e) => e.key === 'Enter' && addComment()}
                />
                <button onClick={addComment} className="p-4 bg-green-600 rounded-full text-white">
                  <Send size={24} />
                </button>
              </div>
            </div>
            <div className="text-center text-gray-400 text-sm mt-8">
              <p>Опубликовано: {new Date(selectedAnnouncement.createdAt).toLocaleDateString('ru-RU')}</p>
              <p>Владелец: {selectedAnnouncement.ownerName}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
                {isOnline ? 'Онлайн' : 'Оффлайн'}
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-black/90 backdrop-blur-xl border-t border-gray-800 p-4 flex justify-center">
            <button
              onClick={() => toggleFavorite(selectedAnnouncement.id)}
              className="flex items-center gap-3 bg-gray-800/80 hover:bg-gray-700 px-8 py-4 rounded-full text-white font-medium transition"
            >
              <Heart
                size={28}
                fill={favorites.includes(selectedAnnouncement.id) ? "#ff3366" : "none"}
                color={favorites.includes(selectedAnnouncement.id) ? "#ff3366" : "white"}
                className="transition-transform hover:scale-110"
              />
              <span>{favorites.includes(selectedAnnouncement.id) ? 'В избранном' : 'В избранное'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Модалка профиля */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center backdrop-blur-lg p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-950 rounded-3xl w-full max-w-2xl p-10 relative border border-indigo-500/40 shadow-2xl shadow-indigo-600/50 max-h-[92dvh] overflow-y-auto">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition">
              <X size={32} />
            </button>
            <div className="text-center mb-12">
              <div className="relative inline-block mb-8">
                {currentUser.photoUrl ? (
                  <img src={currentUser.photoUrl} alt="Аватар" className="w-48 h-48 rounded-full object-cover border-8 border-indigo-600 shadow-2xl shadow-indigo-600/40 mx-auto" />
                ) : (
                  <UserCircle size={192} className="text-indigo-500 mx-auto" strokeWidth={1.2} />
                )}
              </div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
                {currentUser.name}
              </h1>
              <div className="flex flex-wrap justify-center gap-6 text-lg text-gray-300 mb-8">
                {currentUser.username && <span>@{currentUser.username}</span>}
                <span>{currentUser.district}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-black/40 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl">
                    <Edit size={24} className="text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold">О себе</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{currentUser.bio || 'Нет описания'}</p>
              </div>
              <div className="bg-black/40 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <MapPin size={24} className="text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold">Район</h3>
                </div>
                <p className="text-gray-300">{currentUser.district}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <button onClick={openEditProfile} className="bg-gradient-to-r from-indigo-600 to-purple-600 py-6 rounded-2xl font-bold text-xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-indigo-500/30">
                <Edit size={28} /> Редактировать профиль
              </button>
              <button onClick={logout} className="bg-gradient-to-r from-red-600 to-rose-600 py-6 rounded-2xl font-bold text-xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-red-500/30">
                Выйти
              </button>
            </div>
            <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Мои объявления ({myAds.length})
            </h2>
            {myAds.length === 0 ? (
              <div className="text-center py-12 bg-black/40 rounded-3xl border border-gray-700/50">
                <p className="text-2xl text-gray-400 mb-6">У вас пока нет объявлений</p>
                <button onClick={openAddAd} className="bg-green-600 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-green-700 transition">
                  Создать объявление
                </button>
              </div>
            ) : (
              <div className="grid gap-8">
                {myAds.map(item => (
                  <div
                    key={item.id}
                    className="bg-black/50 rounded-3xl overflow-hidden border border-gray-700/50 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/20"
                  >
                    <img src={item.images?.[0] || item.image} alt={item.title} className="w-full h-64 object-cover" />
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold">{item.title}</h3>
                        <div className="flex gap-4">
                          <button onClick={() => openEditAd(item)} className="text-blue-400 hover:text-blue-300">
                            Редактировать
                          </button>
                          <button onClick={() => deleteAnnouncement(item.id)} className="text-red-400 hover:text-red-300">
                            Удалить
                          </button>
                          <button onClick={() => markAsSold(item.id)} className="text-green-400 hover:text-green-300">
                            Продан
                          </button>
                        </div>
                      </div>
                      <p className="text-4xl font-black text-green-400 mb-4">{item.price}</p>
                      <div className="flex items-center gap-3 text-gray-300 mb-6">
                        <MapPin size={20} />
                        {item.location} • {item.district}
                      </div>
                      <p className="text-gray-300 line-clamp-4">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модалка чата */}
      {showChatModal && chatAnnouncement && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col">
          <div className="bg-gradient-to-r from-gray-900 to-black p-5 border-b border-gray-700 flex items-center justify-between">
            <button onClick={() => setShowChatModal(false)} className="text-gray-300 hover:text-white">
              <ArrowLeft size={28} />
            </button>
            <div className="text-center">
              <h3 className="font-bold text-xl">{chatAnnouncement.title}</h3>
              <p className="text-sm text-gray-400">{chatAnnouncement.ownerName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
                {isOnline ? 'Онлайн' : 'Оффлайн'}
              </div>
            </div>
            <div className="w-10" />
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-black/50" ref={chatContainerRef}>
            {(chats[`${chatAnnouncement.id}_${currentUser?.telegramId || currentUser?.email}`] || []).map(msg => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-4 rounded-2xl shadow-lg ${
                  msg.isMe
                    ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-br-none'
                    : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-bl-none'
                }`}>
                  <p className="text-base">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-2 text-right">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-700 bg-black/80">
            <div className="flex gap-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-1 p-4 bg-gray-800 border border-gray-700 rounded-full text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <button
                onClick={sendChatMessage}
                className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
                disabled={!chatMessage.trim()}
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка уведомлений */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center backdrop-blur-lg p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-950 rounded-3xl w-full max-w-lg p-8 relative border border-purple-500/40 shadow-2xl shadow-purple-600/30 max-h-[92dvh] overflow-y-auto">
            <button onClick={() => setShowNotificationsModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-purple-400">
              <X size={32} />
            </button>
            <h2 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Уведомления 🔔 ({notifications.length})
            </h2>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={80} className="mx-auto mb-6 text-purple-400 opacity-50" />
                <p className="text-2xl text-gray-400">Пока уведомлений нет</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-5 rounded-2xl border ${notif.read ? 'bg-gray-900/80 border-gray-700' : 'bg-purple-900/30 border-purple-500/50 animate-pulse'}`}
                    onClick={() => markNotificationRead(notif.id)}
                  >
                    <p className="text-lg">{notif.message}</p>
                    <p className="text-sm text-gray-400 mt-2">{notif.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модалка добавления/редактирования */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-950 rounded-3xl w-full max-w-lg p-8 relative border border-green-500/40 shadow-2xl shadow-green-500/30 max-h-[92dvh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-green-400 transition">
              <X size={32} />
            </button>
            <h2 className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {editingAnnouncement ? 'Редактировать объявление' : 'Новое объявление 🔥'}
            </h2>
            <div className="mb-6">
              <label className="block mb-2 text-gray-300 text-lg">Шаблон объявления</label>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  const template = e.target.value;
                  setSelectedTemplate(template);
                  setNewAd({
                    title: '',
                    price: '',
                    phone: '',
                    location: '',
                    description: '',
                    category: 'Другое',
                    district: 'Центральный',
                    isUrgent: false,
                    images: [],
                    status: 'active',
                  });
                  if (template === 'Отдам даром') {
                    setNewAd({
                      title: 'Отдам даром',
                      price: '0 ₽',
                      phone: '',
                      location: '',
                      description: '🔥 БЕСПЛАТНО! Забирай сегодня 🔥',
                      category: 'Отдам даром',
                      district: 'Центральный',
                      isUrgent: false,
                      images: [],
                      status: 'active',
                    });
                  } else if (template === 'Срочно сегодня') {
                    setNewAd(prev => ({
                      ...prev,
                      isUrgent: true,
                      description: (prev.description || '') + '\n\n🔥 СРОЧНО! Отдам сегодня 🔥',
                    }));
                  } else if (template === 'Бартер') {
                    setNewAd(prev => ({
                      ...prev,
                      description: (prev.description || '') + '\n\nХочу получить: ',
                    }));
                  } else if (template === 'Аренда') {
                    setNewAd(prev => ({
                      ...prev,
                      price: (prev.price || '') + ' / сутки',
                      description: (prev.description || '') + '\n\nАренда: цена указана за сутки/месяц',
                    }));
                  }
                }}
                className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 transition"
              >
                <option>Обычное объявление</option>
                <option>Отдам даром</option>
                <option>Срочно сегодня</option>
                <option>Бартер</option>
                <option>Аренда</option>
              </select>
            </div>
            <form onSubmit={handleAddAdSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-gray-300 text-lg">Название *</label>
                <input
                  name="title"
                  value={newAd.title}
                  onChange={handleAddAdChange}
                  required
                  className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 transition"
                  placeholder="Например: iPhone 13 Pro"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 text-gray-300 text-lg">Цена *</label>
                  <input
                    name="price"
                    value={newAd.price}
                    onChange={handleAddAdChange}
                    required
                    className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 transition"
                    placeholder="5000 ₽"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-300 text-lg">Телефон</label>
                  <input
                    name="phone"
                    value={newAd.phone}
                    onChange={handleAddAdChange}
                    className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 transition"
                    placeholder="+7 (XXX) XXX-XX-XX"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-gray-300 text-lg">Местоположение *</label>
                <div className="relative">
                  <input
                    name="location"
                    value={newAd.location}
                    onChange={handleAddAdChange}
                    required
                    className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 transition pr-12"
                    placeholder="Улица Ленина, 10"
                  />
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={gettingLocation}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-green-600 hover:bg-green-700 rounded-full text-white transition"
                  >
                    {gettingLocation ? (
                      <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Navigation size={20} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-gray-300 text-lg">Район</label>
                <select
                  name="district"
                  value={newAd.district}
                  onChange={handleAddAdChange}
                  className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 transition"
                >
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-gray-300 text-lg">Категория</label>
                <select
                  name="category"
                  value={newAd.category}
                  onChange={handleAddAdChange}
                  className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 transition"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="isUrgent"
                  name="isUrgent"
                  checked={newAd.isUrgent}
                  onChange={handleAddAdChange}
                  className="w-6 h-6 accent-green-500"
                />
                <label htmlFor="isUrgent" className="text-xl text-green-400 font-medium cursor-pointer flex items-center gap-3">
                  <Flame size={28} className="animate-pulse" /> Срочно!
                </label>
              </div>
              <div>
                <label className="block mb-2 text-gray-300 text-lg">Описание</label>
                <textarea
                  name="description"
                  value={newAd.description}
                  onChange={handleAddAdChange}
                  rows={5}
                  className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 transition"
                  placeholder="Подробно..."
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-300 text-lg flex items-center gap-3">
                  <Upload size={24} /> Фото (опционально, до 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="w-full p-4 bg-black/60 border border-green-500/30 rounded-xl text-white text-lg file:bg-green-600 file:text-white file:border-0 file:rounded-xl file:px-6 file:py-3 file:cursor-pointer file:font-medium"
                />
                {previews.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto mt-4">
                    {previews.map((url, i) => (
                      <img key={i} src={url} alt={`Превью ${i}`} className="w-24 h-24 object-cover rounded-xl border-2 border-green-500/40" />
                    ))}
                  </div>
                )}
                {uploading && (
                  <div className="mt-4 w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white py-5 rounded-2xl font-bold text-2xl transition-all shadow-xl hover:shadow-green-500/50 disabled:opacity-50"
              >
                {uploading ? 'Загружаю...' : editingAnnouncement ? 'Сохранить изменения' : 'Опубликовать 🔥'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Модалка избранного */}
      {showFavorites && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-lg p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-950 rounded-3xl w-full max-w-4xl p-8 relative border border-pink-500/40 shadow-2xl shadow-pink-600/30 max-h-[92dvh] overflow-y-auto">
            <button onClick={() => setShowFavorites(false)} className="absolute top-5 right-5 text-gray-400 hover:text-pink-400 transition">
              <X size={32} />
            </button>
            <h2 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Избранное ❤️ ({favorites.length})
            </h2>
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-gray-400 py-20">
                <Heart size={80} className="mb-6 opacity-50" />
                <p className="text-2xl mb-4">Здесь пока пусто</p>
                <p className="text-lg">Добавляй объявления в избранное — они будут здесь!</p>
                <button
                  onClick={() => {
                    setShowFavorites(false);
                    setActiveTab('announcements');
                  }}
                  className="mt-8 bg-gradient-to-r from-pink-600 to-rose-600 px-10 py-5 rounded-2xl text-white font-bold text-xl hover:from-pink-700 hover:to-rose-700 transition shadow-xl"
                >
                  Посмотреть объявления
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {announcements.filter(ad => favorites.includes(ad.id)).map(item => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-br from-gray-900/90 to-black/90 rounded-xl overflow-hidden border border-gray-800/70 hover:border-pink-600/50 transition-all duration-300 shadow-md hover:shadow-pink-900/30 cursor-pointer active:scale-[0.98]"
                    onClick={() => openAnnouncement(item)}
                  >
                    <div className="flex">
                      <div className="relative w-28 h-28 flex-shrink-0">
                        <img
                          src={item.images?.[0] || item.image || "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={e => e.target.src = "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        {item.isUrgent && (
                          <div className="absolute top-1 right-1 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                            <Flame size={10} /> СРОЧНО
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-white line-clamp-2 mb-1">
                            {item.title}
                          </h3>
                          <p className="text-2xl font-black text-green-400 mb-1 tracking-tight">
                            {item.price}
                            {(parseFloat(item.price.replace(/[^0-9.]/g, '')) === 0 ||
                              item.price.toLowerCase().includes('дар') ||
                              item.price.toLowerCase().includes('бесплатно') ||
                              item.price.trim() === '0 ₽') && (
                              <span className="text-sm font-bold text-green-300 ml-1 animate-pulse">ДАРОМ</span>
                            )}
                          </p>
                          <div className="flex items-center gap-1.5 text-gray-300 text-xs">
                            <MapPin size={14} className="text-green-400 flex-shrink-0" />
                            <span className="truncate">{item.location} • {item.district}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1">
                            <Eye size={14} /> {item.views || 0} просмотров
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                          className="absolute bottom-3 right-3 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition active:scale-95"
                        >
                          <Heart
                            size={20}
                            fill={favorites.includes(item.id) ? "#ff3366" : "none"}
                            color={favorites.includes(item.id) ? "#ff3366" : "#ffffff"}
                            className="transition-transform hover:scale-110"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
            {authError && <p className="text-red-400 text-center mb-4">{authError}</p>}
            <form onSubmit={handleAuth} className="space-y-5">
              {authMode === 'register' && (
                <div>
                  <label className="block mb-2 text-gray-300">Имя</label>
                  <input name="name" type="text" className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white" />
                </div>
              )}
              <div>
                <label className="block mb-2 text-gray-300">Email</label>
                <input name="email" type="email" required className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white" />
              </div>
              <div>
                <label className="block mb-2 text-gray-300">Пароль</label>
                <input name="password" type="password" required className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white" />
              </div>
              <button type="submit" className="w-full bg-blue-600 py-4 rounded-xl text-white font-bold hover:bg-blue-700 transition">
                {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>
            <p className="text-center text-gray-400 mt-4">
              {authMode === 'login' ? (
                <>Нет аккаунта? <button onClick={() => setAuthMode('register')} className="text-blue-400 hover:underline">Зарегистрироваться</button></>
              ) : (
                <>Уже есть аккаунт? <button onClick={() => setAuthMode('login')} className="text-blue-400 hover:underline">Войти</button></>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Модалка бартер-клуба */}
      {showBarterModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-950 rounded-3xl w-full max-w-lg p-8 relative border border-purple-500/40 shadow-2xl shadow-purple-600/30">
            <button onClick={() => setShowBarterModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-purple-400 transition">
              <X size={32} />
            </button>
            <h2 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Бартер-клуб 🔥
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const title = e.target.title.value.trim();
              const want = e.target.want.value.trim();
              if (!title || !want) return alert("Заполните оба поля");
              alert(`Предложение добавлено!\nОтдаёшь: ${title}\nХочешь: ${want}`);
              setShowBarterModal(false);
            }} className="space-y-6">
              <div>
                <label className="block mb-2 text-gray-300 text-lg">Что отдаёшь</label>
                <input name="title" required className="w-full p-4 bg-black/60 border border-purple-500/30 rounded-xl text-white text-lg" placeholder="Например: iPhone 13 Pro" />
              </div>
              <div>
                <label className="block mb-2 text-gray-300 text-lg">Что хочешь получить</label>
                <input name="want" required className="w-full p-4 bg-black/60 border border-purple-500/30 rounded-xl text-white text-lg" placeholder="Например: ноутбук + 10 000 ₽" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-5 rounded-2xl font-bold text-2xl hover:from-purple-700 hover:to-pink-700 transition shadow-xl">
                Опубликовать обмен
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-black/90 backdrop-blur-xl border-t border-white/10 text-gray-400 py-6 text-center text-sm mt-auto">
        © 2026 Тверь Маркет • Максимальный шедевр от братана
      </footer>
    </div>
  );
}

export default App;
