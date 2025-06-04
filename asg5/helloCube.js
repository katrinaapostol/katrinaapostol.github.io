import * as THREE from 'three';
import {OrbitControls} from './three.js-dev/examples/jsm/controls/OrbitControls.js';
import {OBJLoader} from './three.js-dev/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from './three.js-dev/examples/jsm/loaders/MTLLoader.js';
import { FontLoader } from './three.js-dev/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from './three.js-dev/examples/jsm/geometries/TextGeometry.js';
import { EffectComposer } from './three.js-dev/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './three.js-dev/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './three.js-dev/examples/jsm/postprocessing/UnrealBloomPass.js';

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcccccc, 5, 20);
    
	const fov = 75;
	const aspect = canvas.clientWidth / canvas.clientHeight;
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.z = 3;

    const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 0, 0 );
	controls.update();

    {

		const color = 0xFFFFFF;
		const intensity = 3;
		// Directional light – acts like sunlight

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
		directionalLight.position.set(-2, 5, 2);
		scene.add(directionalLight);
		
		// Spotlight
		const spotLight = new THREE.SpotLight(0xFFD700, 5);
		spotLight.position.set(0, 5, 5);
		scene.add(spotLight);

		// Ambient light – softens shadows, general brightness
		const ambientLight = new THREE.AmbientLight(0x404040, 2); // Light gray
		scene.add(ambientLight);

		// Point light – emits light in all directions from a position
		const pointLight = new THREE.PointLight(0xff69b4, 2, 50); // Pink, dreamy vibe
		pointLight.position.set(2, 3, 1);
		scene.add(pointLight);
		pointLight.castShadow = true;
		
		const sphereSize = 0.1;
		const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
		scene.add(pointLightHelper);
		
		directionalLight.intensity = 2.5;
		ambientLight.intensity = 0.5;
		pointLight.intensity = 4;
		directionalLight.castShadow = true;
		
		directionalLight.shadow.mapSize.width = 1024;
		directionalLight.shadow.mapSize.height = 1024;
		directionalLight.shadow.camera.near = 0.5;
		directionalLight.shadow.camera.far = 50;


	}

	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );
    
    const loadManager = new THREE.LoadingManager();
	const loader = new THREE.TextureLoader( loadManager );


	const composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));

	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		1.5, // strength
		0.4, // radius
		0.85 // threshold
	);
	composer.addPass(bloomPass);


    function makeInstance( geometry, color, x ) {
		const material = new THREE.MeshPhongMaterial( { color } );
		const cube = new THREE.Mesh( geometry, material );
		scene.add( cube );
		cube.position.x = x;
		return cube;

	}

    function makeInstanceTexture(geometry, materials, x) {
        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);
        cube.position.x = x;
        return cube;
    }

    const materials = [
		new THREE.MeshPhongMaterial( { map: loadColorTexture( './cat-1.jpg' ) } ),
		new THREE.MeshPhongMaterial( { map: loadColorTexture( './cat-2.jpg' ) } ),
		new THREE.MeshPhongMaterial( { map: loadColorTexture( './cat-3.jpg' ) } ),
		new THREE.MeshPhongMaterial( { map: loadColorTexture( './cat-4.jpg' ) } ),
		new THREE.MeshPhongMaterial( { map: loadColorTexture( './cat-5.jpg' ) } ),
		new THREE.MeshPhongMaterial( { map: loadColorTexture( './cat-6.jpg' ) } ),
	];

    const cubes = [
    	makeInstanceTexture(geometry, materials, -6),  // Cat cube, moved further left
		makeInstance(geometry, 0xD52D00, -4),   // Dark orange
		makeInstance(geometry, 0xFF9A56, -2),   // Orange
		makeInstance(geometry, 0xFFFFFF,  0),   // White
		makeInstance(geometry, 0xD362A4,  2),   // Light pink
		makeInstance(geometry, 0xA30262,  4),   // Dark pink
	];

    {

		const loader = new THREE.TextureLoader();
		const texture = loader.load(
			'./lake_with_castle.jpg',
			() => {

				texture.mapping = THREE.EquirectangularReflectionMapping;
				texture.colorSpace = THREE.SRGBColorSpace;
				scene.background = texture;

			} );

	}

    {
        const objLoader = new OBJLoader();
		const mtlLoader = new MTLLoader();
		mtlLoader.load( './public/cat/cat.mtl', ( mtl ) => {
		
			mtl.preload();
			
            for (const material of Object.values(mtl.materials)) {
                material.side = THREE.DoubleSide;
            }
			objLoader.setMaterials(mtl);
			objLoader.load( './public/cat/cat.obj', ( root ) => {
                root.position.set(6, -0.5, 0);  // move it to the right
                root.scale.set(0.05, 0.05, 0.05);  // adjust size as needed
                root.rotation.x = -Math.PI / 2;
                
                root.name = 'catModel';
				root.userData.originalY = root.position.y;
				root.userData.bobSpeed = 2;
				
				scene.add(root);
			} );

		} );

	}
	
	let particleSystem, particlePositions, particleVelocities;

	function createParticles() {
		const count = 500;
		const geometry = new THREE.BufferGeometry();
		particlePositions = new Float32Array(count * 3);
		particleVelocities = new Float32Array(count * 3);

		for (let i = 0; i < count; i++) {
			const i3 = i * 3;
			particlePositions[i3 + 0] = (Math.random() - 0.5) * 20;
			particlePositions[i3 + 1] = (Math.random() - 0.5) * 10;
			particlePositions[i3 + 2] = (Math.random() - 0.5) * 20;

			particleVelocities[i3 + 0] = (Math.random() - 0.5) * 0.01;
			particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
			particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
		}

		geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

		const material = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 0.05,
			transparent: true,
			opacity: 0.8,
		});

		particleSystem = new THREE.Points(geometry, material);
		scene.add(particleSystem);
	}

	createParticles();

    function resizeRendererToDisplaySize( renderer ) {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {
			renderer.setSize( width, height, false );
		}
		return needResize;

	}

    function loadColorTexture( path ) {
		const texture = loader.load( path );
		texture.colorSpace = THREE.SRGBColorSpace;
		return texture;
	}

    function render( time ) {
    
		time *= 0.001;

		if ( resizeRendererToDisplaySize( renderer ) ) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		cubes.forEach( ( cube, ndx ) => {
			const speed = 1 + ndx * .1;
			const rot = time * speed;
			cube.rotation.x = rot;
			cube.rotation.y = rot;
		} );

		renderer.render( scene, camera );
		requestAnimationFrame( render );
		scene.fog.color.setHSL((Math.sin(time * 0.1) + 1) / 2, 0.4, 0.9);

	}

	requestAnimationFrame( render );

	function makeFlower(x, y, color) {
		const stem = new THREE.Mesh(
			new THREE.CylinderGeometry(0.05, 0.05, 1),
			new THREE.MeshPhongMaterial({ color: 0x228B22 }) // green
		);
		stem.position.set(x, y - 0.5, -2);  // base at y

		const head = new THREE.Mesh(
			new THREE.SphereGeometry(0.2),
			new THREE.MeshPhongMaterial({ color })
		);
		head.position.set(x, y + 0.2, -2);

		scene.add(stem);
		scene.add(head);
	}
	makeFlower(-2, 0, 0xFF69B4); // pink
	makeFlower(-1, 0, 0xFFA500); // orange
	makeFlower(0, 0, 0xFFFFFF); // white
	makeFlower(1, 0, 0x7B68EE); // purple
	makeFlower(2, 0, 0x00CED1); // teal
	makeFlower(3, 0, 0xFFD700); // yellow
	
	const ring = new THREE.Mesh(
		new THREE.TorusGeometry(1.2, 0.05, 16, 100),
		new THREE.MeshPhongMaterial({ color: 0xBBBBBB })
	);
	ring.position.set(0, -1, -4);
	ring.rotation.x = Math.PI / 2;
	scene.add(ring);
	
	function makeBlock(x, y, z, color) {
		const cube = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 1),
			new THREE.MeshPhongMaterial({ color })
		);
		cube.position.set(x, y, z);
		scene.add(cube);
	}
	makeBlock(-1, 0.5, -6, 0xADD8E6); // blue
	makeBlock(0, 0.5, -6, 0xFFC0CB); // pink
	makeBlock(1, 0.5, -6, 0xFFFFE0); // yellow
	makeBlock(0, 1.5, -6, 0x8B0000); // red roof
	scene.add(new THREE.GridHelper(20, 20));
	
	function makeArch(x, y, z, color, offsetY = 0) {
		const ring = new THREE.Mesh(
			new THREE.TorusGeometry(2, 0.1, 16, 100, Math.PI), // half torus
			new THREE.MeshPhongMaterial({ color })
		);
		ring.position.set(x, y + offsetY, z);

		// Rotate the arch upright like a rainbow
		ring.rotation.x = Math.PI / 2;

		scene.add(ring);
	}

	makeArch(0, 0, -5, 0xFF0000, 0); // red
	makeArch(0, 0.2, -5, 0xFFA500, 0.2); // orange
	makeArch(0, 0.4, -5, 0xFFFF00, 0.4); // yellow
	makeArch(0, 0.6, -5, 0x228B22, 0.6); // green
	makeArch(0, 0.8, -5, 0x00008B, 0.8); // blue
	makeArch(0, 1.0, -5, 0x4B0082, 1.0); // indigo
	makeArch(0, 1.2, -5, 0x800080, 1.2); // violet
	
	
	function makeFlagSphere(x, y, z, color) {
		const sphere = new THREE.Mesh(
			new THREE.SphereGeometry(0.3, 32, 32),
			new THREE.MeshPhongMaterial({ color })
		);
		sphere.position.set(x, y, z);
		scene.add(sphere);
	}

	makeFlagSphere(5, 0.3, -2, 0x5BCEFA); // blue
	makeFlagSphere(5, 0.9, -2, 0xF5A9B8); // pink
	makeFlagSphere(5, 1.5, -2, 0xFFFFFF); // white
	makeFlagSphere(5, 2.1, -2, 0xF5A9B8); // pink
	makeFlagSphere(5, 2.7, -2, 0x5BCEFA); // blue
	
	const orbitSpheres = [];
    for (let i = 0; i < 8; i++) {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 16, 16),
            new THREE.MeshPhongMaterial({ color: new THREE.Color(`hsl(${i * 45}, 100%, 60%)`) })
        );
        sphere.position.z = -10; // Move sphere back along z-axis
        scene.add(sphere);
        orbitSpheres.push(sphere);
    }


	function render(time) {
        time *= 0.001;
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * 0.1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });

        orbitSpheres.forEach((sphere, i) => {
            const angle = time + i * (Math.PI / 4);
            sphere.position.set(-8 + Math.cos(angle) * 2, 0.5, Math.sin(angle) * 2 - 5);
        });
        

        const cat = scene.getObjectByName('catModel');
        if (cat) {
            cat.position.y = cat.userData.originalY + Math.sin(time * cat.userData.bobSpeed) * 0.1;
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
        
        for (let i = 0; i < particlePositions.length; i += 3) {
			particlePositions[i + 0] += particleVelocities[i + 0];
			particlePositions[i + 1] += particleVelocities[i + 1];
			particlePositions[i + 2] += particleVelocities[i + 2];

		// Soft bounce at bounds
		if (particlePositions[i + 1] > 5 || particlePositions[i + 1] < -5) {
			particleVelocities[i + 1] *= -1;
		}
	}

	particleSystem.geometry.attributes.position.needsUpdate = true;

    }
}

main();