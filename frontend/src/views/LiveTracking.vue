<template>
  <div class="live-tracking-container">
    <div class="tracking-card">
      <div class="tracking-header">
        <div class="header-info">
          <h3>Live Vehicle Tracking</h3>
          <p v-if="filterMode === 'recent' && latestLocation">Last Updated: {{ formatTime(latestLocation.time) }}</p>
          <p v-else-if="filterMode === 'date' && routeHistory.length > 0">Viewing History: {{ selectedDate }}</p>
          <p v-else>Waiting for data...</p>
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
            <span class="value">{{ filterMode === 'recent' ? 'On Route' : 'Historical View' }}</span>
          </div>
          <div class="badge">
            <span class="icon">🛣️</span>
            <span class="label">Route Points:</span>
            <span class="value">{{ routeHistory.length }}</span>
          </div>
        </div>
        <div class="footer-actions">
          <div class="filter-group">
            <label>View Mode:</label>
            <select class="select-hours" v-model="filterMode" @change="handleModeChange">
              <option value="recent">Recent Activity</option>
              <option value="date">Specific Date</option>
            </select>
          </div>

          <div class="filter-group" v-if="filterMode === 'recent'">
            <label>Timeframe:</label>
            <select class="select-hours" v-model="selectedHours" @change="fetchRouteHistory">
              <option value="1">Last 1 Hour</option>
              <option value="6">Last 6 Hours</option>
              <option value="12">Last 12 Hours</option>
              <option value="24">Last 24 Hours</option>
            </select>
          </div>

          <div class="filter-group" v-else>
            <label>Date:</label>
            <input type="date" class="date-input" v-model="selectedDate" @change="fetchRouteHistory" />
          </div>

          <div class="toggle-group">
            <label class="switch">
              <input type="checkbox" v-model="showRoute">
              <span class="slider round"></span>
            </label>
            <span class="toggle-label">Show Route</span>
          </div>

          <button class="btn-refresh" @click="refreshAll" :disabled="loading">
            {{ loading ? 'Updating...' : '🔄 Refresh' }}
          </button>
        </div>
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
      routePolyline: null,
      startMarker: null,
      latestLocation: null,
      routeHistory: [],
      loading: false,
      isLive: false,
      updateInterval: null,
      selectedHours: "24",
      selectedDate: new Date().toLocaleDateString('en-CA'),
      filterMode: "recent", // 'recent' or 'date'
      showRoute: true,
      endMarker: null,
    };
  },
  watch: {
    showRoute(newVal) {
      if (this.routePolyline) {
        this.routePolyline.setMap(newVal ? this.map : null);
      }
      if (this.startMarker) {
        this.startMarker.setMap(newVal ? this.map : null);
      }
    }
  },
  mounted() {
    this.initMap();
    this.startTracking();
    this.fetchRouteHistory();
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
      if (this.filterMode === 'date') {
        this.isLive = false;
        return;
      }
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
        
        // Only show live marker if in 'recent' mode
        if (this.filterMode === 'recent') {
          this.marker.setMap(this.map);
          this.marker.setPosition(newPos);
          this.map.panTo(newPos);
        } else {
          this.marker.setMap(null);
        }
      }
    },
    startTracking() {
      this.fetchLatestLocation();
      if (this.updateInterval) clearInterval(this.updateInterval);
      
      this.updateInterval = setInterval(() => {
        if (this.filterMode === 'recent') {
          this.fetchLatestLocation();
        }
        this.fetchRouteHistory();
      }, 5000);
    },
    async fetchRouteHistory() {
      try {
        let url = "/api/location/history";
        if (this.filterMode === 'date') {
          url += `?date=${this.selectedDate}`;
        } else {
          url += `?hours=${this.selectedHours}`;
        }

        const response = await axios.get(url);
        if (response.data.success) {
          this.routeHistory = response.data.data;
          this.drawRoute();
        }
      } catch (error) {
        console.error("Error fetching route history:", error);
      }
    },
    handleModeChange() {
      if (this.filterMode === 'recent') {
        this.fetchLatestLocation();
      } else {
        if (this.marker) this.marker.setMap(null);
        this.isLive = false;
      }
      this.fetchRouteHistory();
    },
    // Simple Haversine distance to filter noise
    calculateDistance(p1, p2) {
      const R = 6371e3; // metres
      const φ1 = p1.lat * Math.PI/180;
      const φ2 = p2.lat * Math.PI/180;
      const Δφ = (p2.lat-p1.lat) * Math.PI/180;
      const Δλ = (p2.lng-p1.lng) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c; // in metres
    },
    drawRoute() {
      if (!this.map) return;

      // ALWAYS Remove old polyline and markers first
      if (this.routePolyline) this.routePolyline.setMap(null);
      if (this.startMarker) this.startMarker.setMap(null);
      if (this.endMarker) this.endMarker.setMap(null);

      if (this.routeHistory.length < 2) return;

      // Filter noise: only keep points that are at least 5 meters apart
      let path = [];
      if (this.routeHistory.length > 0) {
        path.push({
          lat: this.routeHistory[0].latitude,
          lng: this.routeHistory[0].longitude,
        });

        for (let i = 1; i < this.routeHistory.length; i++) {
          const lastPoint = path[path.length - 1];
          const currentPoint = {
            lat: this.routeHistory[i].latitude,
            lng: this.routeHistory[i].longitude,
          };
          
          if (this.calculateDistance(lastPoint, currentPoint) > 5) {
            path.push(currentPoint);
          }
        }
      }

      // Draw the route line
      this.routePolyline = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: "#3498db",
        strokeOpacity: 0.8,
        strokeWeight: 4,
      });

      if (this.showRoute) {
        this.routePolyline.setMap(this.map);
      }

      // Mark the start point with a green dot
      const startPos = path[0];
      this.startMarker = new window.google.maps.Marker({
        position: startPos,
        map: this.showRoute ? this.map : null,
        title: "Trip Start",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#27ae60",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });

      // Mark the end point with a red dot (latest in history)
      const endPos = path[path.length - 1];
      this.endMarker = new window.google.maps.Marker({
        position: endPos,
        map: this.showRoute ? this.map : null,
        title: "Trip End",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#e74c3c",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });
    },
    refreshAll() {
      this.fetchLatestLocation();
      this.fetchRouteHistory();
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
  flex-wrap: wrap;
  gap: 12px;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 500;
}

.select-hours, .date-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #2c3e50;
  background: white;
  cursor: pointer;
  outline: none;
}

/* Toggle Switch Styles */
.toggle-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-label {
  font-size: 0.85rem;
  color: #2c3e50;
  font-weight: 500;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #3498db;
}

input:focus + .slider {
  box-shadow: 0 0 1px #3498db;
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.btn-refresh {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
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
