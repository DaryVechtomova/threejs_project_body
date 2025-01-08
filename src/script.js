import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Основні налаштування Three.js
const sizes = {
	width: document.getElementById('viewer').clientWidth,
	height: window.innerHeight
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 2, 5); // Камера знаходиться зверху

const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('viewer').appendChild(renderer.domElement);

// Освітлення
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Завантаження GLTF-моделі
const loader = new GLTFLoader();
let model = null;

loader.load('/models/woman_12.gltf', (gltf) => {
	model = gltf.scene;
	model.position.set(0, -1, 0); // Розташувати модель на підлозі (коригуємо ось Y)
	scene.add(model);
});

// Контролери для обертання
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Плавність рухів
controls.target.set(0, 1, 0); // Фокус на моделі (висота близько центру моделі)

const minMaxValues = {
	waist: { min: 50, max: 110 },
	crotch: { min: 25, max: 40 },
	chest: { min: 50, max: 120 },
};

// Оновлення вимірів на екрані
const updateMeasurementsDisplay = (waistValue, crotchValue, chestValue) => {
	const waistCm = (minMaxValues.waist.min + (minMaxValues.waist.max - minMaxValues.waist.min) * waistValue).toFixed(2);
	const crotchCm = (minMaxValues.crotch.min + (minMaxValues.crotch.max - minMaxValues.crotch.min) * crotchValue).toFixed(2);
	const chestCm = (minMaxValues.chest.min + (minMaxValues.chest.max - minMaxValues.chest.min) * chestValue).toFixed(2);

	document.getElementById('waistDisplay').textContent = waistCm;
	document.getElementById('crotchDisplay').textContent = crotchCm;
	document.getElementById('chestDisplay').textContent = chestCm;
};

// Оновлення параметрів моделі
const updateModel = () => {
	if (!model) return;

	// Отримуємо значення в сантиметрах
	const waistCm = parseFloat(document.getElementById('waistWidthCm').value);
	const chestCm = parseFloat(document.getElementById('chestWidthCm').value);
	const waistToCrotchLengthCm = parseFloat(document.getElementById('waistToCrotchLengthCm').value);
	const scale = parseFloat(document.getElementById('scale').value);
	const color = document.getElementById('color').value;

	// Конвертуємо сантиметри в відносні значення (0 - 1)
	const waistValue = (waistCm - minMaxValues.waist.min) / (minMaxValues.waist.max - minMaxValues.waist.min);
	//const waistValue = ((minMaxValues.waist.max - minMaxValues.waist.min) * (waistCm + 0.666667)) / (1 + 0.666667) + minMaxValues.waist.min;
	const chestValue = (chestCm - minMaxValues.chest.min) / (minMaxValues.chest.max - minMaxValues.chest.min);
	const crotchValue = (waistToCrotchLengthCm - minMaxValues.crotch.min) / (minMaxValues.crotch.max - minMaxValues.crotch.min);

	// Оновлюємо відображення значень
	updateMeasurementsDisplay(waistValue, crotchValue, chestValue);

	document.getElementById('scaleValue').textContent = scale.toFixed(2);
	document.getElementById('waistWidthValue').textContent = waistCm.toFixed(2);
	document.getElementById('chestWidthValue').textContent = chestCm.toFixed(2);
	document.getElementById('waistToCrotchLengthValue').textContent = waistToCrotchLengthCm.toFixed(2);

	// Зміна масштабу
	model.scale.set(scale, scale, scale);

	// Налаштування шейп-кейсів
	model.traverse((child) => {
		if (child.isMesh && child.morphTargetInfluences) {
			child.morphTargetInfluences[0] = waistValue || 0;
			child.morphTargetInfluences[1] = chestValue || 0;
			child.morphTargetInfluences[2] = crotchValue || 0;

			// Зміна кольору
			child.material.color.set(color);
		}
	});
};

// Слухачі подій для введення значень
document.getElementById('scale').addEventListener('input', updateModel);
document.getElementById('waistWidthCm').addEventListener('input', updateModel);
document.getElementById('chestWidthCm').addEventListener('input', updateModel);
document.getElementById('waistToCrotchLengthCm').addEventListener('input', updateModel);
document.getElementById('color').addEventListener('input', updateModel);

// Анімаційний цикл
const animate = () => {
	requestAnimationFrame(animate);
	controls.update(); // Оновлення OrbitControls
	renderer.render(scene, camera);
};
animate();

// Ресайз
window.addEventListener('resize', () => {
	sizes.width = document.getElementById('viewer').clientWidth;
	sizes.height = window.innerHeight;
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();
	renderer.setSize(sizes.width, sizes.height);
});
