# Servidor web leve (Nginx) para servir a interface estática (HTML, CSS e JS)
FROM nginx:1.27-alpine

# Remove a página padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos da interface
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# Porta onde a interface fica disponível
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
