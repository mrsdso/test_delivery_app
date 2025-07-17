import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import { useDeliveryData } from '../context/DeliveryDataContext';

export default function DeliveryMapScreen() {
  const { getCachedData, refreshData } = useDeliveryData();
  const [mapHtml, setMapHtml] = useState('');

  // Обновляем данные при фокусе на экране
  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [])
  );

  useEffect(() => {
    const { deliveries } = getCachedData();
    
    // Фильтруем доставки с валидными координатами
    const deliveriesWithCoords = deliveries.filter(delivery => {
      const fromCoords = parseCoordinates(delivery.from_address);
      const toCoords = parseCoordinates(delivery.to_address);
      return fromCoords || toCoords;
    });

    // Создаем HTML с картой
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    
    const markers = deliveriesWithCoords.map((delivery, index) => {
      const fromCoords = parseCoordinates(delivery.from_address);
      const toCoords = parseCoordinates(delivery.to_address);
      const color = colors[index % colors.length];
      
      let markersHTML = '';
      
      if (fromCoords) {
        markersHTML += `
          var fromIcon${index} = L.divIcon({
            className: 'custom-div-icon',
            html: '<div style="background-color:${color};width:20px;height:20px;border-radius:50%;border:2px solid white;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          var fromMarker${index} = L.marker([${fromCoords.lat}, ${fromCoords.lng}], {icon: fromIcon${index}})
            .addTo(map)
            .bindPopup('<b>Доставка №${delivery.id}</b><br>Откуда: ${delivery.from_address}');
        `;
      }
      
      if (toCoords) {
        markersHTML += `
          var toIcon${index} = L.divIcon({
            className: 'custom-div-icon',
            html: '<div style="background-color:${color};width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow: 0 0 0 3px ${color}33;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          var toMarker${index} = L.marker([${toCoords.lat}, ${toCoords.lng}], {icon: toIcon${index}})
            .addTo(map)
            .bindPopup('<b>Доставка №${delivery.id}</b><br>Куда: ${delivery.to_address}');
        `;
      }
      
      if (fromCoords && toCoords) {
        markersHTML += `
          // Используем OSRM для построения маршрута
          fetch('https://router.project-osrm.org/route/v1/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}?overview=full&geometries=geojson')
            .then(response => response.json())
            .then(data => {
              if (data.routes && data.routes[0]) {
                var route = data.routes[0];
                var routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                var polyline${index} = L.polyline(routeCoordinates, {
                  color: '${color}', 
                  weight: 4,
                  opacity: 0.8
                }).addTo(map);
                
                // Показываем дистанцию по дороге
                var distance = (route.distance / 1000).toFixed(2);
                var duration = Math.round(route.duration / 60);
                polyline${index}.bindPopup('Доставка №${delivery.id}<br>Дистанция: ' + distance + ' км<br>Время: ' + duration + ' мин');
              } else {
                // Fallback к прямой линии если OSRM не доступен
                var polyline${index} = L.polyline([
                  [${fromCoords.lat}, ${fromCoords.lng}],
                  [${toCoords.lat}, ${toCoords.lng}]
                ], {color: '${color}', weight: 3, opacity: 0.6}).addTo(map);
              }
            })
            .catch(error => {
              console.log('OSRM routing failed, using straight line');
              var polyline${index} = L.polyline([
                [${fromCoords.lat}, ${fromCoords.lng}],
                [${toCoords.lat}, ${toCoords.lng}]
              ], {color: '${color}', weight: 3, opacity: 0.6}).addTo(map);
            });
        `;
      }
      
      return markersHTML;
    }).join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          #map { height: 100vh; margin: 0; padding: 0; }
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([55.7558, 37.6176], 10); // Москва по умолчанию
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          ${markers}
          
          // Если есть маркеры, центрируем карту по ним
          if (${deliveriesWithCoords.length > 0}) {
            var group = new L.featureGroup([]);
            map.eachLayer(function(layer) {
              if (layer instanceof L.Marker) {
                group.addLayer(layer);
              }
            });
            if (group.getLayers().length > 0) {
              map.fitBounds(group.getBounds().pad(0.1));
            }
          }
        </script>
      </body>
      </html>
    `;
    
    setMapHtml(html);
  }, []);

  // Функция для парсинга координат из строки
  const parseCoordinates = (address: string) => {
    if (!address) return null;
    
    // Проверяем, является ли адрес координатами (два числа через запятую)
    const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
    if (coordPattern.test(address.trim())) {
      const [lat, lng] = address.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    
    return null;
  };

  return (
    <View style={{ flex: 1 }}>
      {mapHtml ? (
        <WebView
          source={{ html: mapHtml }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <WebView
          source={{ uri: 'https://www.openstreetmap.org' }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
    </View>
  );
}