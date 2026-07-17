# ============================================
# DEPLOYMENT GUIDE - CAMPAIGN STUDIO
# ============================================

## 🚀 Quick Deployment

### 1. Prepare Kubernetes Secret (API Key)
```bash
kubectl create secret generic openai-secret \
  --from-literal=api-key='sk-proj-YOUR-API-KEY' \
  --namespace=default
```

### 2. Deploy Frontend Files as ConfigMap
```bash
kubectl create configmap campaign-studio-frontend \
  --from-file=index.html \
  --from-file=styles.css \
  --from-file=charts.css \
  --from-file=components.js \
  --from-file=app.js
```

### 3. Deploy Nginx Configuration
```bash
kubectl create configmap campaign-studio-nginx \
  --from-literal=default.conf='
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ =404;
    }
    location /api/ {
        proxy_pass http://backend-service:8000/api/;
    }
}'
```

### 4. Apply Full Deployment
```bash
kubectl apply -f k8s-deployment.yaml
```

### 5. Verify
```bash
kubectl get pods
kubectl get services
kubectl describe ingress campaign-studio-ingress
```

## 🌐 Access

- **Cluster IP**: `kubectl port-forward svc/campaign-studio-service 8000:80`
- **LoadBalancer**: Check external IP with `kubectl get svc`
- **Ingress**: Configure DNS to `campaign-studio.yourdomain.com`

## 📊 Monitoring

### Check Logs
```bash
kubectl logs -f deployment/campaign-studio
```

### Check Resources
```bash
kubectl top pods
kubectl describe pod -l app=campaign-studio
```

### Scale
```bash
kubectl scale deployment campaign-studio --replicas=3
```

## 🔧 Configuration

### Environment Variables
- `CAMPAIGN_STUDIO_PORT`: 80 (frontend) / 8000 (backend)
- `OPENAI_API_KEY`: From secret
- `API_URL`: http://backend-service:8000/api

### ConfigMaps
- `campaign-studio-frontend`: Static files
- `campaign-studio-nginx`: Server config

### Secrets
- `openai-secret`: API credentials

## 🛠️ Troubleshooting

### Backend Not Responding
```bash
# Check if backend is running
kubectl exec -it $(kubectl get pod -l app=campaign-studio -o jsonpath='{.items[0].metadata.name}') -- curl http://localhost:8000/api/health
```

### Frontend Not Loading
```bash
# Check nginx config
kubectl exec -it $(kubectl get pod -l app=campaign-studio -o jsonpath='{.items[0].metadata.name}') -- nginx -t
```

### API Key Issues
```bash
# Verify secret
kubectl get secret openai-secret -o yaml
```

## 📈 Production Checklist

- [ ] TLS/HTTPS configured (Let's Encrypt)
- [ ] API Key stored in Kubernetes Secret
- [ ] Resource limits set
- [ ] HPA configured for auto-scaling
- [ ] Monitoring with Prometheus/Grafana
- [ ] Logging with Loki/Promtail
- [ ] Backup strategy for ConfigMaps
- [ ] CI/CD pipeline configured

## 🔄 Updates

```bash
# Update frontend
kubectl create configmap campaign-studio-frontend \
  --from-file=. \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart pods
kubectl rollout restart deployment/campaign-studio
```