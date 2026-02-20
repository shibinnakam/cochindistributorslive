<template>
  <div class="live-tracking-container">
    <div class="tracking-card">
      <div class="tracking-header">
        <div class="header-info">
          <h3>Live Vehicle Tracking</h3>
          <p v-if="latestLocation">Last Updated: {{ formatTime(latestLocation.time) }}</p>
          <p v-else>Waiting for location data...</p>
        </div>
        <div class="status-indicator" :class="{ active: isLive }">
          <span class="pulse"></span>
          {{ isLive ? 'Live Tracking Active' : 'Connecting...' }}
        </div>
      </div>

      <div class="map-wrapper">
        <div id="map" ref="mapElement"></div>
        
        <div class="coordinates-overlay" v-if="latestLocation">
          <div class="coord-item">
            <span class="label">Latitude</span>
            <span class="value">{{ latestLocation.latitude.toFixed(6) }}</span>
          </div>
          <div class="coord-item">
            <span class="label">Longitude</span>
            <span class="value">{{ latestLocation.longitude.toFixed(6) }}</span>
          </div>
        </div>
      </div>

      <div class="tracking-footer">
        <div class="info-badges">
          <div class="badge">
            <span class="icon">🚗</span>
            <span class="label">Vehicle:</span>
            <span class="value">Delivery Van 01</span>
          </div>
          <div class="badge">
            <span class="icon">📍</span>
            <span class="label">Current Status:</span>
            <span class="value">On Route</span>
          </div>
        </div>
        <button class="btn-refresh" @click="fetchLatestLocation" :disabled="loading">
          {{ loading ? 'Updating...' : 'Refresh Map' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/utils/axios";

export default {
  name: "LiveTracking",
  data() {
    return {
      map: null,
      marker: null,
      latestLocation: null,
      loading: false,
      isLive: false,
      updateInterval: null,
    };
  },
  mounted() {
    this.initMap();
    this.startTracking();
  },
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  },
  methods: {
    initMap() {
      // Default center (can be changed to a more relevant default)
      const defaultPos = { lat: 10.8505, lng: 76.2711 }; // Kerala coordinates

      if (window.google && window.google.maps) {
        this.map = new window.google.maps.Map(this.$refs.mapElement, {
          zoom: 15,
          center: defaultPos,
          mapId: 'TRACKING_MAP_ID', // Optional: styling via Google Cloud Console
          styles: [
            {
              "featureType": "poi",
              "stylers": [{ "visibility": "off" }]
            }
          ]
        });

        this.marker = new window.google.maps.Marker({
          position: defaultPos,
          map: this.map,
          title: "Vehicle Location",
          icon: {
            url: "https://maps.google.com/mapfiles/kml/shapes/truck.png",
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });
      } else {
        console.error("Google Maps API not loaded");
      }
    },
    async fetchLatestLocation() {
      this.loading = true;
      try {
        const response = await axios.get("/api/location/latest");
        if (response.data.success) {
          this.latestLocation = response.data.data;
          this.updateMapPosition();
          this.isLive = true;
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        this.isLive = false;
      } finally {
        this.loading = false;
      }
    },
    updateMapPosition() {
      if (this.latestLocation && this.marker && this.map) {
        const newPos = {
          lat: this.latestLocation.latitude,
          lng: this.latestLocation.longitude,
        };
        this.marker.setPosition(newPos);
        this.map.panTo(newPos);
      }
    },
    startTracking() {
      this.fetchLatestLocation();
      this.updateInterval = setInterval(this.fetchLatestLocation, 5000);
    },
    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString();
    }
  }
};
</script>

<style scoped>
.live-tracking-container {
  padding: 20px;
  background: #f4f7fa;
  min-height: calc(100vh - 100px);
}

.tracking-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tracking-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.header-info h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.header-info p {
  margin: 5px 0 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #95a5a6;
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 20px;
}

.status-indicator.active {
  color: #27ae60;
  background: #ebfaf0;
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #bdc3c7;
}

.active .pulse {
  background: #27ae60;
  box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(39, 174, 96, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
}

.map-wrapper {
  position: relative;
  height: 500px;
  width: 100%;
}

#map {
  height: 100%;
  width: 100%;
}

.coordinates-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
}

.coord-item {
  display: flex;
  flex-direction: column;
}

.coord-item .label {
  font-size: 0.75rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.coord-item .value {
  font-family: monospace;
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.tracking-footer {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.info-badges {
  display: flex;
  gap: 20px;
}

.badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.badge .icon {
  font-size: 1.1rem;
}

.badge .label {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.badge .value {
  font-size: 0.85rem;
  color: #2c3e50;
  font-weight: 600;
}

.btn-refresh {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border:封装 none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-refresh:hover {
  background: #2980b9;
}

.btn-refresh:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}
</style>
