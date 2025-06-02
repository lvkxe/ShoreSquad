// ShoreSquad App JavaScript

class ShoreSquadApp {
    constructor() {
        this.init();
        this.currentLocation = null;
        this.weatherData = null;
        this.events = [];
        this.map = null;
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        console.log('🌊 ShoreSquad App Initializing...');
        
        // Initialize all components
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupFormHandling();
        this.setupEventListeners();
        this.initializeWeather();
        this.initializeMap();
        this.loadEvents();
        
        // Performance monitoring
        this.setupPerformanceTracking();
        
        console.log('✅ ShoreSquad App Ready!');
    }

    // Navigation functionality
    setupNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Mobile menu toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Smooth scroll for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Scroll effects and animations
    setupScrollEffects() {
        const navbar = document.getElementById('navbar');
        let lastScrollY = window.scrollY;

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (navbar) {
                if (currentScrollY > 100) {
                    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                    navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                    navbar.style.boxShadow = 'none';
                }

                // Hide/show navbar on scroll (optional)
                if (currentScrollY > lastScrollY && currentScrollY > 200) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }

            lastScrollY = currentScrollY;
        });

        // Intersection Observer for fade-in animations
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all sections
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    }

    // Form handling
    setupFormHandling() {
        const contactForm = document.getElementById('contact-form');
        
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleFormSubmission(contactForm);
            });
        }
    }

    async handleFormSubmission(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // Simulate API call (replace with actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Success state
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            submitBtn.style.background = 'var(--success-color)';
            
            // Reset form
            form.reset();
            
            // Show success message
            this.showNotification('Thanks for reaching out! We\'ll get back to you soon. 🌊', 'success');
            
        } catch (error) {
            console.error('Form submission error:', error);
            submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Try Again';
            submitBtn.style.background = 'var(--accent-color)';
            
            this.showNotification('Oops! Something went wrong. Please try again.', 'error');
        } finally {
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        }
    }

    // Event listeners setup
    setupEventListeners() {
        // Hero buttons
        const joinCleanupBtn = document.getElementById('join-cleanup');
        const viewMapBtn = document.getElementById('view-map');
        const locateMeBtn = document.getElementById('locate-me');

        if (joinCleanupBtn) {
            joinCleanupBtn.addEventListener('click', () => {
                document.getElementById('events').scrollIntoView({ behavior: 'smooth' });
            });
        }

        if (viewMapBtn) {
            viewMapBtn.addEventListener('click', () => {
                document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
            });
        }

        if (locateMeBtn) {
            locateMeBtn.addEventListener('click', () => this.findUserLocation());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close mobile menu if open
                const navMenu = document.getElementById('nav-menu');
                const navToggle = document.getElementById('nav-toggle');
                
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    }

    // Weather functionality
    async initializeWeather() {
        const weatherInfo = document.getElementById('weather-info');
        
        try {
            // Get user location first
            await this.getCurrentLocation();
            
            if (this.currentLocation) {
                await this.fetchWeatherData();
                this.displayWeatherData();
            } else {
                this.displayDefaultWeather();
            }
        } catch (error) {
            console.error('Weather initialization error:', error);
            this.displayDefaultWeather();
        }
    }

    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(this.currentLocation);
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    // Use default location (Santa Monica as example)
                    this.currentLocation = {
                        lat: 34.0195,
                        lng: -118.4912
                    };
                    resolve(this.currentLocation);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }

    async fetchWeatherData() {
        // Note: Replace with your actual weather API key
        // For demo purposes, we'll simulate weather data
        const mockWeatherData = {
            temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
            condition: ['Sunny', 'Partly Cloudy', 'Clear'][Math.floor(Math.random() * 3)],
            windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 mph
            humidity: Math.floor(Math.random() * 30) + 60, // 60-90%
            uvIndex: Math.floor(Math.random() * 8) + 1 // 1-8
        };

        this.weatherData = mockWeatherData;
    }

    displayWeatherData() {
        const weatherInfo = document.getElementById('weather-info');
        
        if (this.weatherData && weatherInfo) {
            weatherInfo.innerHTML = `
                <div class="weather-item">
                    <i class="fas fa-thermometer-half"></i>
                    <span>${this.weatherData.temperature}°C</span>
                </div>
                <div class="weather-item">
                    <i class="fas fa-cloud-sun"></i>
                    <span>${this.weatherData.condition}</span>
                </div>
                <div class="weather-item">
                    <i class="fas fa-wind"></i>
                    <span>${this.weatherData.windSpeed} mph</span>
                </div>
                <div class="weather-item">
                    <i class="fas fa-tint"></i>
                    <span>${this.weatherData.humidity}% humidity</span>
                </div>
                <div class="weather-item">
                    <i class="fas fa-sun"></i>
                    <span>UV ${this.weatherData.uvIndex}</span>
                </div>
            `;
        }
    }

    displayDefaultWeather() {
        const weatherInfo = document.getElementById('weather-info');
        
        if (weatherInfo) {
            weatherInfo.innerHTML = `
                <div class="weather-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Enable location for local weather</span>
                </div>
                <div class="weather-item">
                    <i class="fas fa-info-circle"></i>
                    <span>Perfect day for beach cleanup!</span>
                </div>
            `;
        }
    }

    // Map functionality
    initializeMap() {
        const mapElement = document.getElementById('cleanup-map');
        
        if (mapElement) {
            // For now, display a placeholder
            // In production, integrate with Leaflet.js or Google Maps
            mapElement.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 20px;">
                    <i class="fas fa-map-marked-alt" style="font-size: 3rem; color: var(--primary-color);"></i>
                    <h3>Interactive Cleanup Map</h3>
                    <p>Coming Soon: Find cleanups and beach conditions near you!</p>
                    <button class="btn btn-primary" onclick="app.findUserLocation()">
                        <i class="fas fa-crosshairs"></i>
                        Find My Location
                    </button>
                </div>
            `;
        }
    }

    async findUserLocation() {
        const locateBtn = document.getElementById('locate-me');
        
        if (locateBtn) {
            const originalText = locateBtn.innerHTML;
            locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
            locateBtn.disabled = true;
        }

        try {
            await this.getCurrentLocation();
            
            if (this.currentLocation) {
                this.showNotification(
                    `Location found! Lat: ${this.currentLocation.lat.toFixed(4)}, Lng: ${this.currentLocation.lng.toFixed(4)}`,
                    'success'
                );
                
                // Update weather with new location
                await this.fetchWeatherData();
                this.displayWeatherData();
            }
        } catch (error) {
            console.error('Location error:', error);
            this.showNotification('Unable to get your location. Please check your browser settings.', 'error');
        } finally {
            if (locateBtn) {
                setTimeout(() => {
                    locateBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Find My Location';
                    locateBtn.disabled = false;
                }, 2000);
            }
        }
    }

    // Events management
    loadEvents() {
        // Mock events data - replace with API call
        this.events = [
            {
                id: 1,
                title: 'Santa Monica Beach Cleanup',
                date: new Date('2025-06-15'),
                time: '9:00 AM - 12:00 PM',
                location: 'Santa Monica Pier',
                volunteers: 25,
                maxVolunteers: 50
            },
            {
                id: 2,
                title: 'Venice Beach Earth Day Special',
                date: new Date('2025-06-22'),
                time: '8:00 AM - 2:00 PM',
                location: 'Venice Beach Boardwalk',
                volunteers: 42,
                maxVolunteers: 75
            },
            {
                id: 3,
                title: 'Malibu Cleanup & BBQ',
                date: new Date('2025-06-29'),
                time: '10:00 AM - 4:00 PM',
                location: 'Malibu State Beach',
                volunteers: 18,
                maxVolunteers: 40
            }
        ];

        this.displayEvents();
    }

    displayEvents() {
        const eventsGrid = document.getElementById('events-grid');
        
        if (eventsGrid && this.events.length > 0) {
            eventsGrid.innerHTML = this.events.map(event => `
                <div class="event-card" data-event-id="${event.id}">
                    <div class="event-date">
                        <span class="day">${event.date.getDate()}</span>
                        <span class="month">${event.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                    </div>
                    <div class="event-info">
                        <h3>${event.title}</h3>
                        <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                        <p><i class="fas fa-clock"></i> ${event.time}</p>
                        <p><i class="fas fa-users"></i> ${event.volunteers}/${event.maxVolunteers} volunteers</p>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="app.joinEvent(${event.id})">
                        Join Event
                    </button>
                </div>
            `).join('');
        }
    }

    joinEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        
        if (event) {
            if (event.volunteers < event.maxVolunteers) {
                event.volunteers++;
                this.displayEvents();
                this.showNotification(`Great! You've joined "${event.title}". See you there! 🌊`, 'success');
            } else {
                this.showNotification('Sorry, this event is full. Check out other events!', 'warning');
            }
        }
    }

    // Notification system
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        return colors[type] || colors.info;
    }

    // Performance tracking
    setupPerformanceTracking() {
        // Track page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                
                console.log(`📊 Page Load Performance:
                    - DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms
                    - Load Event: ${loadTime}ms
                    - Total Load Time: ${perfData.loadEventEnd - perfData.fetchStart}ms
                `);
                
                // Track Core Web Vitals (simplified)
                this.trackCoreWebVitals();
            }, 0);
        });
    }

    trackCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        new PerformanceObserver((entryList) => {
            let clsValue = 0;
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the app
const app = new ShoreSquadApp();

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for global access
window.ShoreSquadApp = ShoreSquadApp;
window.app = app;
