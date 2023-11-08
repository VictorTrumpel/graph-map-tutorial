container_name="map_container"
image_name="map_image"

docker stop $container_name
docker rmi $image_name

docker build -t $image_name .
docker run -d -p 4000:80 --rm --name $container_name $image_name

echo "Запущено на \033[32mhttp://localhost:4000/\033[0m"