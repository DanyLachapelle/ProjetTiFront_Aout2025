FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production --output-hashing=all

FROM nginx:alpine

# Suppression complète de la configuration par défaut et du cache
RUN rm -rf /etc/nginx/conf.d/* && \
    rm -rf /usr/share/nginx/html/* && \
    rm -rf /var/cache/nginx/*

# Copie des fichiers Angular avec les bonnes permissions
COPY --from=build /app/dist/groupe7-ti-front-aout2025/browser /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# Configuration Nginx optimisée
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    
    # Désactivation du cache pour les fichiers HTML
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Cache long pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Blocage des fichiers sensibles
    location ~* \.(json|env|htaccess)$ {
        deny all;
    }
}
EOF

# Santé check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]