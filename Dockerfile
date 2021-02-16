FROM ubuntu:groovy as nodebuilder
#RUN apk add --no-cache util-linux # for lscpu needed by parcel
RUN apt-get -y update
RUN apt-get -y install nodejs npm
WORKDIR /js
COPY fluidsignalr/ClientApp/package*.json /js/
RUN npm ci
COPY fluidsignalr/ClientApp/src /js/src
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /app

# copy csproj and restore as distinct layers
COPY *.sln .
COPY fluidsignalr/*.csproj ./fluidsignalr/
RUN dotnet restore

# copy source files and build app
COPY fluidsignalr/*.cs ./fluidsignalr/
COPY fluidsignalr/*.json ./fluidsignalr/
WORKDIR /app/fluidsignalr

# Copy the js dist from the nodebuilder stage; the csproj has a target to copy it over to the out dir
COPY --from=nodebuilder /js/dist /app/fluidsignalr/ClientApp/dist
RUN dotnet publish -c Release -o out

###
### Final runtime image
###
FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS runtime
WORKDIR /app
COPY --from=build /app/fluidsignalr/out ./
EXPOSE 5000
ENTRYPOINT ["dotnet", "fluidsignalr.dll"]
