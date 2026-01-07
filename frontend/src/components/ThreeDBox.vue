<template>
  <div ref="container" class="three-container"></div>
</template>

<script>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default {
  name: "ThreeDBox",
  props: {
    image: {
      type: String,
      required: false,
    },
    imageFront: {
      type: String,
      required: false,
    },
    imageSide: {
      type: String,
      required: false,
    },
    imageBack: {
      type: String,
      required: false,
    },
    imageTop: {
      type: String,
      required: false,
    },
    imageBottom: {
      type: String,
      required: false,
    },
    model3D: {
      type: String,
      required: false,
    },
    shape: {
      type: String,
      default: "box", // box, pillow, cylinder
    },
  },
  data() {
    return {
      // We don't want Vue to make these reactive because Three.js objects are complex
      // and Vue's proxying can interfere with internal properties like modelViewMatrix
    };
  },
  mounted() {
    // Store Three.js objects as non-reactive properties on the instance
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cube = null;
    this.model = null;
    this.controls = null;
    this.animationId = null;

    this.initThree();
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    this.cleanup();
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    initThree() {
      const container = this.$refs.container;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf0f0f0);

      // Camera
      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      this.camera.position.z = 2;

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(width, height);
      container.appendChild(this.renderer.domElement);

      // Controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 2.0;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      this.scene.add(directionalLight);

      const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
      backLight.position.set(-5, -5, -5);
      this.scene.add(backLight);

      const textureLoader = new THREE.TextureLoader();

      if (this.model3D) {
        this.loadModel();
      } else {
        // Check if we have front+back images (new format) or single image (legacy format)
        const has2Images = this.imageFront && this.imageBack;

        if (has2Images) {
          if (this.shape === "cylinder") {
            this.createCylinder(textureLoader);
          } else if (this.shape === "pillow") {
            this.createPillow(textureLoader);
          } else if (this.shape === "exact") {
            this.createExactShape(textureLoader);
          } else {
            this.loadAndCreateCubeWith3Images(textureLoader);
          }
        } else if (this.image) {
          this.loadAndCreateCubeWithSingleImage(textureLoader);
        } else {
          console.error("No image or model provided");
        }
      }

      this.animate();
    },

    loadModel() {
      const loader = new GLTFLoader();
      loader.load(
        this.model3D,
        (gltf) => {
          this.model = gltf.scene;

          // Center the model
          const box = new THREE.Box3().setFromObject(this.model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.5 / maxDim;
          this.model.scale.setScalar(scale);

          this.model.position.sub(center.multiplyScalar(scale));

          this.scene.add(this.model);
        },
        () => {
          // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error("An error happened loading the model:", error);
        }
      );
    },

    loadAndCreateCubeWithSingleImage(textureLoader) {
      textureLoader.load(
        this.image,
        (texture) => {
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshStandardMaterial({ map: texture });
          this.cube = new THREE.Mesh(geometry, material);
          this.scene.add(this.cube);
        },
        undefined,
        (err) => {
          console.error("Error loading texture:", err);
        }
      );
    },

    createCylinder(textureLoader) {
      const texturePromises = [
        this.loadTexture(textureLoader, this.imageFront),
        this.loadTexture(textureLoader, this.imageBack),
      ];

      Promise.all(texturePromises).then(([frontTexture, backTexture]) => {
        // CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
        const geometry = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 32);

        // We need to map front texture to one half and back texture to the other half
        // This is tricky with standard Cylinder mapping.
        // A simpler approach is to use two half-cylinders or just map front to the whole thing if back is not critical for rotation continuity.
        // Better approach: Create a canvas, draw front and back side-by-side, and use that as texture.

        // For now, let's use a simple approach: Front texture wraps around.
        // Or better: Use a Box but with cylinder-like smoothing? No.

        // Let's try the Canvas approach to merge images
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        const img1 = frontTexture.image;
        const img2 = backTexture.image;

        // Draw front on left half, back on right half
        ctx.drawImage(img1, 0, 0, 512, 512);
        ctx.drawImage(img2, 512, 0, 512, 512);

        const mergedTexture = new THREE.CanvasTexture(canvas);
        mergedTexture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.MeshStandardMaterial({ map: mergedTexture });
        this.cube = new THREE.Mesh(geometry, material);

        // Rotate to show front first
        this.cube.rotation.y = -Math.PI / 2;

        this.scene.add(this.cube);
      });
    },

    createPillow(textureLoader) {
      const texturePromises = [
        this.loadTexture(textureLoader, this.imageFront),
        this.loadTexture(textureLoader, this.imageBack),
      ];

      Promise.all(texturePromises).then(([frontTexture, backTexture]) => {
        // Create a box with many segments to manipulate vertices
        const geometry = new THREE.BoxGeometry(0.7, 1.0, 0.2, 10, 10, 2);

        // Access position attribute
        const positionAttribute = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < positionAttribute.count; i++) {
          vertex.fromBufferAttribute(positionAttribute, i);

          // Logic to "pinch" the edges (z-axis)
          // If x is near edge or y is near edge, reduce z
          const xFactor = Math.abs(vertex.x) / 0.35; // 0 to 1
          const yFactor = Math.abs(vertex.y) / 0.5; // 0 to 1

          // Pinch edges: reduce Z thickness as we get closer to edges
          // Simple formula: z *= (1 - x^2) * (1 - y^2)
          // But we want the center to be puffy.

          // Only modify Z if it's not 0 (to keep center plane if any)
          if (Math.abs(vertex.z) > 0.01) {
            // Puffiness factor
            const puff =
              Math.cos(xFactor * Math.PI * 0.4) *
              Math.cos(yFactor * Math.PI * 0.4);
            vertex.z *= 0.2 + 1.5 * puff;
          }

          positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        geometry.computeVertexNormals();

        // Create a combined texture for sides by blending front and back
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        // Draw front image
        const frontImg = frontTexture.image;
        ctx.drawImage(frontImg, 0, 0, 256, 512);

        // Draw back image blended or side by side
        const backImg = backTexture.image;
        ctx.globalAlpha = 0.5; // Blend back with front for sides
        ctx.drawImage(backImg, 0, 0, 256, 512);
        ctx.globalAlpha = 1.0;

        // Draw back on the right half for wrapping effect
        ctx.drawImage(backImg, 256, 0, 256, 512);

        const sideTexture = new THREE.CanvasTexture(canvas);
        sideTexture.colorSpace = THREE.SRGBColorSpace;
        sideTexture.wrapS = THREE.RepeatWrapping;
        sideTexture.wrapT = THREE.RepeatWrapping;

        // Create a top/bottom texture by averaging front and back colors
        const topBottomCanvas = document.createElement("canvas");
        topBottomCanvas.width = 256;
        topBottomCanvas.height = 256;
        const topCtx = topBottomCanvas.getContext("2d");

        // Draw front and back blended for top/bottom
        topCtx.globalAlpha = 0.5;
        topCtx.drawImage(frontImg, 0, 0, 256, 256);
        topCtx.drawImage(backImg, 0, 0, 256, 256);
        topCtx.globalAlpha = 1.0;

        const topBottomTexture = new THREE.CanvasTexture(topBottomCanvas);
        topBottomTexture.colorSpace = THREE.SRGBColorSpace;

        const materials = [
          new THREE.MeshStandardMaterial({ map: sideTexture }), // Right
          new THREE.MeshStandardMaterial({ map: sideTexture }), // Left
          new THREE.MeshStandardMaterial({ map: topBottomTexture }), // Top
          new THREE.MeshStandardMaterial({ map: topBottomTexture }), // Bottom
          new THREE.MeshStandardMaterial({ map: frontTexture }), // Front
          new THREE.MeshStandardMaterial({ map: backTexture }), // Back
        ];

        this.cube = new THREE.Mesh(geometry, materials);
        this.scene.add(this.cube);
      });
    },

    createExactShape(textureLoader) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = this.imageFront || this.image;

      img.onload = () => {
        // 1. Draw image to canvas to analyze alpha
        const canvas = document.createElement("canvas");
        const size = 256; // Resolution for shape analysis
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        // 2. Find contour points
        const points = this.getContour(data, size, size);

        if (points.length < 3) {
          console.warn("Could not determine shape, falling back to box");
          this.loadAndCreateCubeWith3Images(textureLoader);
          return;
        }

        // 3. Create Shape
        const shape = new THREE.Shape(points);

        // 4. Extrude
        const extrudeSettings = {
          depth: 0.2, // Thickness
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.01,
          bevelSegments: 3,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // 5. Fix UV Mapping
        // The default UVs for ExtrudeGeometry are planar on Z, but we need to map 0..1 based on bounding box
        geometry.computeBoundingBox();
        const min = geometry.boundingBox.min;
        const max = geometry.boundingBox.max;
        const range = new THREE.Vector3().subVectors(max, min);

        const uvAttribute = geometry.attributes.uv;
        const posAttribute = geometry.attributes.position;

        for (let i = 0; i < posAttribute.count; i++) {
          const x = posAttribute.getX(i);
          const y = posAttribute.getY(i);
          // Map x,y to 0..1
          const u = (x - min.x) / range.x;
          const v = (y - min.y) / range.y;
          uvAttribute.setXY(i, u, v);
        }

        // 6. Load Textures
        const texturePromises = [
          this.loadTexture(textureLoader, this.imageFront),
          this.loadTexture(textureLoader, this.imageBack),
        ];

        Promise.all(texturePromises).then(([frontTexture]) => {
          const materials = [
            new THREE.MeshStandardMaterial({ color: 0xcccccc }), // Side
            new THREE.MeshStandardMaterial({ map: frontTexture }), // Front
          ];

          // ExtrudeGeometry materials: [side, front/back]
          // But wait, ExtrudeGeometry usually has 2 groups: 0 for sides, 1 for caps (front/back)
          // We want front to have frontTexture, back to have backTexture.
          // This is hard with single ExtrudeGeometry.
          // Workaround: Use 2 materials, but front and back will share the same material (index 1).
          // So we might see front image on back (mirrored).
          // To fix this properly, we'd need to split the geometry or use MultiMaterial with custom face groups.
          // For now, let's just use the front texture for both caps.

          this.cube = new THREE.Mesh(geometry, materials);

          // Center the mesh
          geometry.center();

          this.scene.add(this.cube);
        });
      };
    },

    getContour(data, width, height) {
      // Simple Moore-Neighbor Tracing or just scanning
      // Since we want a robust shape, let's do a "Convex Hull" style scan first
      // Scan each row, find min X and max X

      const leftProfile = [];
      const rightProfile = [];

      for (let y = 0; y < height; y++) {
        let minX = -1;
        let maxX = -1;

        for (let x = 0; x < width; x++) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha > 50) {
            if (minX === -1) minX = x;
            maxX = x;
          }
        }

        if (minX !== -1) {
          // Normalize coordinates to -0.5 to 0.5 range (approx)
          // Y is inverted in canvas (0 at top), Three.js (0 at bottom usually, but Shape uses 2D)
          // Let's map 0..size to -1..1
          const ny = 1 - (y / height) * 2;
          const nxMin = (minX / width) * 2 - 1;
          const nxMax = (maxX / width) * 2 - 1;

          // Simplify: only add point if it changes significantly?
          // For now, add all (or skip every N)
          if (y % 2 === 0) {
            leftProfile.push(new THREE.Vector2(nxMin, ny));
            rightProfile.push(new THREE.Vector2(nxMax, ny));
          }
        }
      }

      // Combine profiles: Left (top to bottom) -> Right (bottom to top)
      // leftProfile is ordered top-to-bottom (y=1 to y=-1)
      // rightProfile is ordered top-to-bottom

      // We want counter-clockwise order
      // Start top-left, go down left side, cross to bottom-right, go up right side, close top

      const points = [];

      // Add left profile
      points.push(...leftProfile);

      // Add right profile in reverse (bottom to top)
      for (let i = rightProfile.length - 1; i >= 0; i--) {
        points.push(rightProfile[i]);
      }

      // Close shape
      if (points.length > 0) {
        points.push(points[0]);
      }

      return points;
    },

    loadAndCreateCubeWith3Images(textureLoader) {
      // Load front and back images (required), side, top, and bottom optional
      const texturePromises = [
        this.loadTexture(textureLoader, this.imageFront),
        this.loadTexture(textureLoader, this.imageBack),
        this.imageSide
          ? this.loadTexture(textureLoader, this.imageSide)
          : Promise.resolve(null),
        this.imageTop
          ? this.loadTexture(textureLoader, this.imageTop)
          : Promise.resolve(null),
        this.imageBottom
          ? this.loadTexture(textureLoader, this.imageBottom)
          : Promise.resolve(null),
      ];

      Promise.all(texturePromises)
        .then(
          ([
            frontTexture,
            backTexture,
            sideTexture,
            topTexture,
            bottomTexture,
          ]) => {
            // Realistic packet dimensions: width x height x depth
            // Typically product packets are taller than wide
            const geometry = new THREE.BoxGeometry(0.6, 1.2, 0.3);

            // Gray material for edges (top, bottom, left, right if no side image)
            const grayMaterial = new THREE.MeshStandardMaterial({
              color: 0xd0d0d0,
              roughness: 0.7,
            });

            // Create material array for 6 faces:
            // [right(0), left(1), top(2), bottom(3), front(4), back(5)]
            const materials = [];

            // Left and right faces (use side image if available, else gray)
            if (sideTexture) {
              materials.push(
                new THREE.MeshStandardMaterial({ map: sideTexture })
              ); // right (0)
              materials.push(
                new THREE.MeshStandardMaterial({ map: sideTexture })
              ); // left (1)
            } else {
              materials.push(grayMaterial.clone()); // right (0)
              materials.push(grayMaterial.clone()); // left (1)
            }

            // Top and bottom faces (use separate images if available, else gray)
            if (topTexture) {
              materials.push(
                new THREE.MeshStandardMaterial({ map: topTexture })
              ); // top (2)
            } else {
              materials.push(grayMaterial.clone()); // top (2)
            }

            if (bottomTexture) {
              materials.push(
                new THREE.MeshStandardMaterial({ map: bottomTexture })
              ); // bottom (3)
            } else {
              materials.push(grayMaterial.clone()); // bottom (3)
            }

            // Front and back faces (required)
            materials.push(
              new THREE.MeshStandardMaterial({ map: frontTexture })
            ); // front (4)
            materials.push(
              new THREE.MeshStandardMaterial({ map: backTexture })
            ); // back (5)

            this.cube = new THREE.Mesh(geometry, materials);
            this.scene.add(this.cube);
          }
        )
        .catch((err) => {
          console.error("Error loading textures:", err);
        });
    },

    loadTexture(textureLoader, imagePath) {
      return new Promise((resolve, reject) => {
        textureLoader.load(
          imagePath,
          (texture) => resolve(texture),
          undefined,
          (err) => reject(err)
        );
      });
    },
    animate() {
      this.animationId = requestAnimationFrame(this.animate);

      if (this.controls) {
        this.controls.update();
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    },
    handleResize() {
      if (!this.$refs.container) return;
      const width = this.$refs.container.clientWidth;
      const height = this.$refs.container.clientHeight;

      if (this.camera) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }

      if (this.renderer) {
        this.renderer.setSize(width, height);
      }
    },
    cleanup() {
      if (this.animationId) cancelAnimationFrame(this.animationId);
      if (this.renderer) {
        this.renderer.dispose();
        if (this.$refs.container && this.renderer.domElement) {
          this.$refs.container.removeChild(this.renderer.domElement);
        }
      }
      if (this.cube) {
        this.cube.geometry.dispose();
        if (Array.isArray(this.cube.material)) {
          this.cube.material.forEach((m) => m.dispose());
        } else {
          this.cube.material.dispose();
        }
      }
      if (this.model) {
        this.scene.remove(this.model);
      }
      if (this.controls) {
        this.controls.dispose();
      }
    },
  },
};
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
