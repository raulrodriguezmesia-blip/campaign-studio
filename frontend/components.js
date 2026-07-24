/* ============================================
   COMPONENTES REACT-LIKE
   ============================================ */

/* Hooks simulados */
function useState(initialValue) {
    let state = initialValue;
    let listeners = [];
    
    function getState() {
        return state;
    }
    
    function setState(newValue) {
        state = newValue;
        listeners.forEach(listener => listener());
    }
    
    function useStateHook() {
        return [getState(), setState];
    }
    
    return useStateHook;
}

/* Componente Navbar */
class Navbar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="header">
                <div class="search-bar">
                    <input type="text" id="search-input" placeholder="Buscar campañas...">
                    <button class="search-btn">🔍</button>
                </div>
                <div class="user-menu">
                    <button id="api-key-btn" class="btn btn-outline">Configurar API Key</button>
                    <div class="user-avatar">👤</div>
                </div>
            </header>
        `;
    }
}

/* Componente Sidebar */
class Sidebar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <aside class="sidebar" id="sidebar">
                <div class="logo">
                    <img src="assets/logo.svg" alt="Campaign Studio">
                    <h1>Campaign <span class="gradient-text">Studio</span></h1>
                </div>
                <nav class="nav-menu">
                    <a href="#dashboard" class="nav-item active" data-section="dashboard">
                        <span class="icon">📊</span>
                        <span>Dashboard</span>
                    </a>
                    <a href="#create" class="nav-item" data-section="create">
                        <span class="icon">➕</span>
                        <span>Crear Campaña</span>
                    </a>
                    <a href="#campaigns" class="nav-item" data-section="campaigns">
                        <span class="icon">📁</span>
                        <span>Mis Campañas</span>
                    </a>
                    <a href="#analytics" class="nav-item" data-section="analytics">
                        <span class="icon">📈</span>
                        <span>Analytics</span>
                    </a>
                    <a href="#settings" class="nav-item" data-section="settings">
                        <span class="icon">⚙️</span>
                        <span>Configuración</span>
                    </a>
                </nav>
                <div class="status-bar">
                    <div class="status-indicator" id="connection-status">
                        <span class="dot online"></span>
                        <span>Conectado al backend</span>
                    </div>
                </div>
            </aside>
        `;
    }
}

/* Componente Card */
class Card extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute('title') || '';
        const icon = this.getAttribute('icon') || '📊';
        
        this.innerHTML = `
            <div class="metric-card animate-fade-in">
                <div class="metric-icon">${icon}</div>
                <div class="metric-content">
                    <h3>${title}</h3>
                    <p class="metric-value"><slot name="value"></slot></p>
                    <p class="metric-change positive"><slot name="change"></slot></p>
                </div>
            </div>
        `;
    }
}

/* Componente Modal */
class Modal extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute('title') || 'Modal';
        const size = this.getAttribute('size') || 'medium';
        
        this.innerHTML = `
            <div class="modal hidden" id="${this.getAttribute('id') || 'modal'}">
                <div class="modal-content modal-${size}">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="close-btn">✕</button>
                    </div>
                    <div class="modal-body">
                        <slot></slot>
                    </div>
                </div>
            </div>
        `;
    }
}

/* Componente Button */
class Button extends HTMLElement {
    connectedCallback() {
        const variant = this.getAttribute('variant') || 'primary';
        const size = this.getAttribute('size') || 'medium';
        const disabled = this.hasAttribute('disabled') ? 'disabled' : '';
        
        this.innerHTML = `
            <button class="btn btn-${variant} btn-${size}" ${disabled}>
                <slot></slot>
            </button>
        `;
    }
}

/* Componente Input */
class Input extends HTMLElement {
    connectedCallback() {
        const type = this.getAttribute('type') || 'text';
        const label = this.getAttribute('label') || '';
        const placeholder = this.getAttribute('placeholder') || '';
        const required = this.hasAttribute('required') ? 'required' : '';
        
        this.innerHTML = `
            <div class="form-group">
                <label for="${this.getAttribute('name') || 'input'}">${label}</label>
                <input type="${type}" 
                       id="${this.getAttribute('name') || 'input'}" 
                       name="${this.getAttribute('name') || 'input'}"
                       placeholder="${placeholder}" 
                       ${required}>
            </div>
        `;
    }
}

/* Componente Chart */
class ChartComponent extends HTMLElement {
    connectedCallback() {
        const type = this.getAttribute('type') || 'bar';
        const title = this.getAttribute('title') || 'Gráfico';
        
        this.innerHTML = `
            <div class="chart-card">
                <h3>${title}</h3>
                <canvas id="${this.getAttribute('id') || 'chart'}"></canvas>
            </div>
        `;
    }
}

/* Componente Loading Spinner */
class LoadingSpinner extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="spinner-container">
                <div class="spinner"></div>
                <p id="loading-text">Cargando...</p>
            </div>
        `;
    }
}

/* Componente Metric Card */
class MetricCard extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute('title') || 'Metric';
        const value = this.getAttribute('value') || '0';
        const change = this.getAttribute('change') || '';
        const isPositive = this.getAttribute('positive') === 'true';
        const icon = this.getAttribute('icon') || '📊';
        
        this.innerHTML = `
            <div class="metric-card animate-fade-in">
                <div class="metric-icon">${icon}</div>
                <div class="metric-content">
                    <h3>${title}</h3>
                    <p class="metric-value">${value}</p>
                    <p class="metric-change ${isPositive ? 'positive' : 'negative'}">${change}</p>
                </div>
            </div>
        `;
    }
}

/* Custom Events System */
class EventBus {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
}

/* API Client */
class APIClient {
        constructor(baseURL = 'https://campaign-studio-api.onrender.com/api') {
        this.baseURL = baseURL;
        this.eventBus = new EventBus();
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error en la petición');
            }
            
            return data;
        } catch (error) {
            this.eventBus.emit('error', error);
            throw error;
        }
    }
    
    get(endpoint) {
        return this.request(endpoint);
    }
    
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

/* Campaign Store */
class CampaignStore {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.campaigns = [];
        this.listeners = [];
    }
    
    subscribe(listener) {
        this.listeners.push(listener);
    }
    
    notify() {
        this.listeners.forEach(listener => listener(this.campaigns));
    }
    
    async fetchCampaigns() {
        try {
            const data = await this.apiClient.get('/campaigns');
            this.campaigns = data.campaigns || [];
            this.notify();
            return this.campaigns;
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            return [];
        }
    }
    
    async createCampaign(campaignData) {
        try {
            const campaign = await this.apiClient.post('/campaigns', campaignData);
            this.campaigns.push(campaign);
            this.notify();
            return campaign;
        } catch (error) {
            console.error('Error creating campaign:', error);
            throw error;
        }
    }
}

/* Registro de componentes */
customElements.define('app-navbar', Navbar);
customElements.define('app-sidebar', Sidebar);
customElements.define('app-card', Card);
customElements.define('app-modal', Modal);
customElements.define('app-button', Button);
customElements.define('app-input', Input);
customElements.define('app-chart', ChartComponent);
customElements.define('app-spinner', LoadingSpinner);
customElements.define('app-metric', MetricCard);

/* Export para uso global */
window.AppComponents = {
    useState,
    EventBus,
    APIClient,
    CampaignStore
};