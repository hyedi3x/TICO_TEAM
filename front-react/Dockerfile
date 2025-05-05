# npm run build를 ec2 서버에서 진행시 서버가 자꾸 죽어버려서 리액트만 따로 빌드
# Serve with nginx
FROM nginx:alpine

# 정적 파일 복사
COPY ./build /usr/share/nginx/html

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# HTTPS 사용 시
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]

# # React build
# FROM node:18 AS build
# WORKDIR /app
# COPY . .
# RUN npm install
# RUN npm run build

# # Serve with nginx
# FROM nginx:alpine
# COPY --from=build /app/build /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
