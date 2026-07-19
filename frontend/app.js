/* ============================================
   CAMPAIGN STUDIO - APP.JS (COMPLETO CON MEJORAS)
   Lógica principal con integración API
   ============================================ */

class CampaignStudio {
    constructor() {
        // API base URL is provided by frontend/config.js (generated at build time
        // from the VITE_API_URL env var). Falls back to local simulator.
        const apiBase =
            (window.APP_CONFIG && window.APP_CONFIG.apiBase) ||
            'http://localhost:8000/api';
        this.apiClient = new AppComponents.APIClient(apiBase);
        this.campaignStore = new AppComponents.CampaignStore(this.apiClient);
        this.charts = {};
        this.campaigns = [];
        this.apiKey = localStorage.getItem('openai_api_key') || '';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.renderMetrics();
        this.loadCampaigns(); // Cargar campañas desde localStorage
        this.setupDemoMode(); // Configurar modo demo
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // Form submission
        const form = document.getElementById('campaign-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // API Key modal
        const apiKeyBtn = document.getElementById('api-key-btn');
        const closeModal = document.getElementById('close-modal');
        const saveApiKey = document.getElementById('save-api-key');
        
        if (apiKeyBtn) apiKeyBtn.addEventListener('click', () => this.openApiKeyModal());
        if (closeModal) closeModal.addEventListener('click', () => this.closeApiKeyModal());
        if (saveApiKey) saveApiKey.addEventListener('click', () => this.saveApiKey());
        
        // Copy button
        const copyBtn = document.getElementById('copy-result');
        if (copyBtn) copyBtn.addEventListener('click', () => this.copyResult());
    }
    
    handleNavigation(e) {
        e.preventDefault();
        const section = e.target.getAttribute('data-section');
        
        // Update active class
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        e.target.classList.add('active');
        
        // Show/hide sections
        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(section)?.classList.add('active');
        
        // Load section data
        if (section === 'campaigns') {
            this.loadCampaigns();
        }
    }
    
    async loadInitialData() {
        try {
            const health = await this.apiClient.get('/health');
            console.log('Backend status:', health);
            
            // Start real-time metrics polling
            this.startMetricsPolling();
        } catch (error) {
            console.error('Backend not available:', error);
            this.showNotification('Conectando al backend...', 'info');
        }
    }
    
    async loadCampaigns() {
        // Cargar desde localStorage
        const savedCampaigns = localStorage.getItem('campaigns');
        if (savedCampaigns) {
            this.campaigns = JSON.parse(savedCampaigns);
        }
        this.renderCampaigns();
    }
    
    saveCampaign(campaign) {
        const campaigns = [...this.campaigns];
        const newCampaign = {
            id: Date.now().toString(),
            ...campaign,
            createdAt: new Date().toISOString(),
            status: 'completed'
        };
        campaigns.push(newCampaign);
        this.campaigns = campaigns;
        localStorage.setItem('campaigns', JSON.stringify(campaigns));
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        const btnText = btn.querySelector('#btn-text');
        const loadingText = btn.querySelector('#loading-text');
        
        // Show loading state
        btn.disabled = true;
        btnText.classList.add('hidden');
        loadingText.classList.remove('hidden');
        
        try {
            const formData = new FormData(form);
            const campaignData = {
                campaign_brief: formData.get('campaign_brief'),
                target_audience: formData.get('target_audience'),
                product_details: formData.get('product_details'),
                tone: formData.get('tone'),
                channels: formData.get('channels')
            };
            
            // Validación
            if (!this.validateCampaignData(campaignData)) {
                throw new Error('Por favor completa todos los campos obligatorios');
            }
            
            // Intentar con API, fallback al simulador
            let result;
            try {
                result = await this.apiClient.post('/generate-campaign', campaignData);
            } catch (apiError) {
                console.log('API no disponible, usando simulador:', apiError);
                result = this.createSimulatorCampaign(campaignData);
            }
            
            // Mostrar resultado
            this.displayResult(result);
            this.saveCampaign(result);
            this.showNotification('Campaña generada exitosamente', 'success');
            
            // Actualizar métricas
            this.updateMetrics(result);
            
        } catch (error) {
            console.error('Error generating campaign:', error);
            this.showNotification(error.message || 'Error al generar campaña', 'error');
        } finally {
            // Reset button
            btn.disabled = false;
            btnText.classList.remove('hidden');
            loadingText.classList.add('hidden');
        }
    }
    
    createSimulatorCampaign(data) {
        return {
            campaignConcept: `Campaña integral para "${data.campaign_brief}" dirigida a ${data.target_audience}.`,
            variants: [
                { headline: `Transforma ${data.product_details}`, body: `Descubre cómo un enfoque ${data.tone.toLowerCase()} puede impulsar tu negocio a través de ${data.channels.split(',')[0].trim()}.` },
                { headline: "Tu visión, nuestro enfoque", body: `Soluciones ${data.tone.toLowerCase()} para ${data.channels}. ${data.product_details} diseñado especialmente para ${data.target_audience}.` },
                { headline: "Innovación que conecta", body: `Campaña estratégica para ${data.target_audience}. Enfoque ${data.tone.toLowerCase()} en ${data.product_details}.` }
            ],
            checklist: [
                "Definir objetivos SMART de la campaña",
                "Crear contenido visual atractivo",
                "Configurar canales de distribución",
                "Establecer métricas de éxito (KPIs)",
                "Ejecutar prueba piloto con audiencia objetivo",
                "Monitorear resultados y engagement",
                "Optimizar según datos en tiempo real"
            ],
            imagePrompts: [
                `Bing Image Creator: ${data.campaign_brief}, estilo ${data.tone.toLowerCase()}`,
                `Diseño visual para ${data.product_details}, estilo ${data.tone.toLowerCase()}`,
                `Concepto creativo de marketing para ${data.campaign_brief}, colores vibrantes`
            ]
        };
    }
    
    validateCampaignData(data) {
        return Object.values(data).every(value => value && value.trim().length > 0);
    }
    
    displayResult(result) {
        const resultCard = document.getElementById('result-card');
        if (!resultCard) return;
        
        // Mostrar tarjeta
        resultCard.classList.remove('hidden');
        
        // Rellenar contenido
        document.getElementById('campaign-concept').textContent = result.campaignConcept || 'Concepto no disponible';
        
        // Variantes
        const variantsContainer = document.getElementById('variants-container');
        variantsContainer.innerHTML = '';
        const variants = result.variants || ['Sin variantes'];
        variants.forEach(variant => {
            const div = document.createElement('div');
            div.className = 'variant-item';
            const headline = variant.headline || variant;
            const body = variant.body || variant;
            div.innerHTML = `<strong>${headline}</strong><br><span>${body}</span>`;
            variantsContainer.appendChild(div);
        });
        
        // Checklist
        const checklistContainer = document.getElementById('checklist-container');
        checklistContainer.innerHTML = '';
        const checklist = result.checklist || [];
        checklist.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            checklistContainer.appendChild(li);
        });
        
        // Prompts
        const promptsContainer = document.getElementById('prompts-container');
        promptsContainer.innerHTML = '';
        const prompts = result.imagePrompts || [];
        
        if (prompts.length > 0) {
            prompts.forEach((prompt, index) => {
                const div = document.createElement('div');
                div.className = 'prompt-item';
                div.innerHTML = `
                    <code class="prompt-code">${prompt}</code>
                    <button class="copy-prompt" data-prompt="${prompt}">📋</button>
                `;
                promptsContainer.appendChild(div);
                
                div.querySelector('.copy-prompt').addEventListener('click', (e) => {
                    this.copyToClipboard(e.target.dataset.prompt);
                });
            });
        }

        // Generated images
        const imagesContainer = document.getElementById('images-container');
        if (imagesContainer) {
            imagesContainer.innerHTML = '';
            const images = result.images || [];
            if (images.length === 0) {
                imagesContainer.innerHTML = '<p class="note-text">No hay imágenes generadas para esta campaña.</p>';
            } else {
                images.forEach(img => {
                    const div = document.createElement('div');
                    div.className = 'image-item';
                    if (img.url) {
                        div.innerHTML = `<img src="${img.url}" alt="${img.prompt || ''}" loading="lazy">`;
                    } else {
                        div.innerHTML = `<p class="note-text">Imagen no disponible: ${img.error || img.note || 'sin datos'}</p>`;
                    }
                    imagesContainer.appendChild(div);
                });
            }
        }
        
        // Scroll to result
        resultCard.scrollIntoView({ behavior: 'smooth' });
    }
    
    updateMetrics(result) {
        // Incrementar contadores
        const totalCampaigns = document.getElementById('total-campaigns');
        if (totalCampaigns) {
            totalCampaigns.textContent = parseInt(totalCampaigns.textContent || '0') + 1;
        }
        
        const totalImages = document.getElementById('total-images');
        if (totalImages && result.images) {
            const realImages = result.images.filter(img => img && img.url).length;
            totalImages.textContent = parseInt(totalImages.textContent || '0') + realImages;
        }
        
        // Actualizar costos
        const totalCost = document.getElementById('total-cost');
        if (totalCost) {
            const currentCost = parseFloat(totalCost.textContent.replace('$', '')) || 0;
            const newCost = currentCost + 0.02; // Estimado
            totalCost.textContent = `$${newCost.toFixed(2)}`;
        }
    }
    
    renderCampaigns(campaigns = []) {
        const grid = document.getElementById('campaigns-grid');
        if (!grid) return;
        
        if (this.campaigns.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>No hay campañas</h3>
                    <p>Crea tu primera campaña usando el botón "Ver Demo" o el formulario</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = this.campaigns.map(campaign => `
            <div class="campaign-card animate-fade-in" data-id="${campaign.id}">
                <h4>${campaign.campaignConcept?.substring(0, 50) || 'Campaña'}</h4>
                <p>${campaign.campaignConcept?.substring(0, 100) || ''}...</p>
                <small class="text-muted">${new Date(campaign.createdAt).toLocaleDateString()}</small>
            </div>
        `).join('');
    }
    
    renderMetrics() {
        this.initCharts();
    }
    
    initCharts() {
        // Campaigns Bar Chart
        const campaignsCtx = document.getElementById('campaigns-chart');
        if (campaignsCtx) {
            this.charts.campaigns = new Chart(campaignsCtx, {
                type: 'bar',
                data: {
                    labels: ['Instagram', 'Facebook', 'Email', 'TikTok', 'LinkedIn'],
                    datasets: [{
                        label: 'Campañas Activas',
                        data: [12, 8, 15, 6, 4],
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        }
                    }
                }
            });
        }
        
        // Conversion Line Chart
        const conversionCtx = document.getElementById('conversion-chart');
        if (conversionCtx) {
            this.charts.conversion = new Chart(conversionCtx, {
                type: 'line',
                data: {
                    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                    datasets: [{
                        label: 'Conversión %',
                        data: [2.1, 3.4, 2.8, 4.2, 3.9, 5.1, 4.5],
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'ROI',
                        data: [1.2, 1.8, 2.1, 2.5, 2.3, 3.1, 2.9],
                        borderColor: 'rgba(156, 186, 230, 1)',
                        backgroundColor: 'rgba(156, 186, 230, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: { position: 'bottom' }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        }
                    }
                }
            });
        }
        
        // Cost Pie Chart
        const costCtx = document.getElementById('cost-chart');
        if (costCtx) {
            this.charts.cost = new Chart(costCtx, {
                type: 'doughnut',
                data: {
                    labels: ['OpenAI API', 'Image Generation', 'Hosting', 'Tools'],
                    datasets: [{
                        data: [45, 30, 15, 10],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(156, 186, 230, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)'
                        ],
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }
    }
    
    startMetricsPolling() {
        // Poll every 30 seconds for real-time updates
        setInterval(async () => {
            try {
                const metrics = await this.apiClient.get('/metrics');
                if (metrics && this.charts.campaigns) {
                    this.charts.campaigns.data.datasets[0].data = metrics.campaigns_by_channel || [12, 8, 15, 6, 4];
                    this.charts.campaigns.update();
                }
            } catch (error) {
                console.log('Metrics polling error (expected if endpoint not available)');
            }
        }, 30000);
    }
    
    setupDemoMode() {
        // Agregar botón demo si existe
        const demoBtn = document.getElementById('demo-btn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                const demoData = {
                    campaignConcept: "Campaña de lanzamiento para producto X - Demo",
                    variants: [
                        { headline: "✨ ¡Nuevo!", body: "Descubre el producto que transformará tu rutina profesional" },
                        { headline: "🚀 Innovación", body: "La solución perfecta para profesionales modernos que buscan eficiencia" },
                        { headline: "💪 Calidad Premium", body: "100% vegano, natural y respaldado por científicos" }
                    ],
                    checklist: [
                        "✅ Definir objetivos SMART de la campaña",
                        "✅ Crear contenido visual atractivo",
                        "✅ Configurar canales de distribución",
                        "✅ Establecer métricas de éxito (KPIs)",
                        "✅ Ejecutar prueba piloto con audiencia objetivo",
                        "✅ Monitorear resultados y engagement",
                        "✅ Optimizar según datos en tiempo real"
                    ],
                    imagePrompts: [
                        "Producto X en ambiente de oficina moderno, luz natural, estilo profesional",
                        "Close-up del suplemento vegano con etiquetas visibles, fondo blanco limpio",
                        "Joven profesional usando el producto en escritorio, ambiente productivo"
                    ]
                };
                this.displayResult(demoData);
                this.saveCampaign(demoData);
                this.showNotification('✅ Campaña demo generada', 'success');
            });
        }
    }
    
    openApiKeyModal() {
        const modal = document.getElementById('api-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('api-key-input').value = this.apiKey;
        }
    }
    
    closeApiKeyModal() {
        const modal = document.getElementById('api-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    saveApiKey() {
        const input = document.getElementById('api-key-input');
        this.apiKey = input.value.trim();
        
        if (this.apiKey) {
            localStorage.setItem('openai_api_key', this.apiKey);
            this.showNotification('API Key guardada localmente', 'info');
            this.closeApiKeyModal();
        }
    }
    
    copyResult() {
        const concept = document.getElementById('campaign-concept').textContent;
        this.copyToClipboard(concept);
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copiado al portapapeles', 'success');
        }).catch(err => {
            console.error('Error copying:', err);
            this.showNotification('Error al copiar', 'error');
        });
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            animation: fadeIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

/* Initialize when DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
    window.campaignStudio = new CampaignStudio();
});

/* Utility functions */
window.utils = {
    formatCurrency: (amount) => `$${amount.toFixed(2)}`,
    formatDate: (date) => new Date(date).toLocaleDateString('es-ES'),
    truncate: (text, length = 100) => text.length > length ? text.substring(0, length) + '...' : text,
    debounce: (fn, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    }
};