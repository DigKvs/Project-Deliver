import * as THREE from 'three';
import gsap from 'https://cdn.skypack.dev/gsap';

// ==========================================
// 1. CONFIGURAÇÃO (CENA, CÂMERA, LUZES)
// ==========================================
const container = document.querySelector('.pinHolder');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 10, 14);
camera.lookAt(0, 2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const lightAmb = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(lightAmb);
const lightDir = new THREE.DirectionalLight(0xffffff, 1.2);
lightDir.position.set(5, 10, 5);
lightDir.castShadow = true;
lightDir.shadow.mapSize.width = 1024;
lightDir.shadow.mapSize.height = 1024;
scene.add(lightDir);
const lightBack = new THREE.DirectionalLight(0xffffff, 0.8);
lightBack.position.set(-5, 5, -5);
scene.add(lightBack);

// ==========================================
// 2. CONSTANTES E ESTADO GLOBAL
// ==========================================
const ALTURA_BASE = 1.8;
const ALTURA_PECA = 1.4;
const RAIO_HASTE = 0.75;
const RAIO_FURO = 0.85; 
const GAP = 0.08; 

const materialLinhaPreta = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });

const selPeca1 = document.getElementById('peca1');
const selPeca2 = document.getElementById('peca2');
const selPeca3 = document.getElementById('peca3');
const btnLimpar = document.getElementById('btnLimpar');
const btnPedido = document.getElementById('buttonPedido');
const switchFilter = document.getElementById('filter');
const tituloPino = document.getElementById('tituloPino');

let pinoAtivo = 1;
let modoDoisPinos = false;

export const pedidoFinal = {
    pino1: { slot1: "", slot2: "", slot3: "" },
    pino2: { slot1: "", slot2: "", slot3: "" }
};

// ==========================================
// 3. CRIAÇÃO DOS OBJETOS 3D
// ==========================================

function criarEstruturaPino() {
    const grupoPai = new THREE.Group();

    // Material Pino
    const materialPino = new THREE.MeshStandardMaterial({ color: 0x1abc9c, metalness: 0.6, roughness: 0.4 });

    // Base
    const geoBase = new THREE.CylinderGeometry(2.8, 2.8, ALTURA_BASE, 64);
    const meshBase = new THREE.Mesh(geoBase, materialPino);
    meshBase.position.y = ALTURA_BASE / 2;
    meshBase.receiveShadow = true;
    meshBase.add(new THREE.LineSegments(new THREE.EdgesGeometry(geoBase), materialLinhaPreta));
    grupoPai.add(meshBase);

    // Haste
    const alturaHaste = ALTURA_BASE + (ALTURA_PECA * 3) + 1.5;
    const geoHaste = new THREE.CylinderGeometry(RAIO_HASTE, RAIO_HASTE, alturaHaste, 64);
    const meshHaste = new THREE.Mesh(geoHaste, materialPino);
    meshHaste.position.y = alturaHaste / 2;
    meshHaste.castShadow = true;
    meshHaste.add(new THREE.LineSegments(new THREE.EdgesGeometry(geoHaste, 10), materialLinhaPreta));
    grupoPai.add(meshHaste);

    // Topo
    const geoTopo = new THREE.CylinderGeometry(RAIO_HASTE * 0.7, RAIO_HASTE, 0.3, 64);
    const meshTopo = new THREE.Mesh(geoTopo, materialPino);
    meshTopo.position.y = alturaHaste + 0.15;
    meshTopo.add(new THREE.LineSegments(new THREE.EdgesGeometry(geoTopo), materialLinhaPreta));
    grupoPai.add(meshTopo);

    // Slots
    const s1 = new THREE.Group(); 
    s1.position.y = ALTURA_BASE + GAP; 
    s1.name = "slot1";

    const s2 = new THREE.Group(); 
    s2.position.y = ALTURA_BASE + ALTURA_PECA + (GAP * 2); 
    s2.name = "slot2";

    const s3 = new THREE.Group(); 
    s3.position.y = ALTURA_BASE + (ALTURA_PECA * 2) + (GAP * 3); 
    s3.name = "slot3";

    grupoPai.add(s1, s2, s3);

    // Hitbox
    const geoHitbox = new THREE.CylinderGeometry(3, 3, alturaHaste, 16);
    const matHitbox = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(geoHitbox, matHitbox);
    hitbox.position.y = alturaHaste / 2;
    hitbox.userData = { ehPino: true };
    grupoPai.add(hitbox);

    return grupoPai;
}

const pino1 = criarEstruturaPino();
pino1.userData = { id: 1 };
scene.add(pino1);

const pino2 = criarEstruturaPino();
pino2.userData = { id: 2 };
pino2.visible = false;
scene.add(pino2);

// SELETOR
const geoSeletor = new THREE.RingGeometry(3.5, 4, 32);
geoSeletor.rotateX(-Math.PI / 2);
const matSeletor = new THREE.MeshBasicMaterial({ color: 0xa3e4d7, side: THREE.DoubleSide });
const seletorAtivo = new THREE.Mesh(geoSeletor, matSeletor);
seletorAtivo.position.y = 0.05;
scene.add(seletorAtivo);

// ==========================================
// 4. LÓGICA DAS PEÇAS
// ==========================================

function criarPecaProcedural(tipo) {
    let shape = new THREE.Shape();
    let corPeca;

    switch (tipo) {
        case 'Circulo':
            corPeca = 0xff7f50; 
            shape.absarc(0, 0, 2.2, 0, Math.PI * 2, false);
            break;
        case 'Quadrado':
            corPeca = 0x9b59b6; 
            const tam = 2.1; 
            shape.moveTo(-tam, -tam);
            shape.lineTo(tam, -tam);
            shape.lineTo(tam, tam);
            shape.lineTo(-tam, tam);
            shape.lineTo(-tam, -tam);
            break;
        case 'Hexagono':
            corPeca = 0xf1c40f; 
            const radius = 2.4;
            for (let i = 0; i < 6; i++) {
                const angle = (i * 60) * (Math.PI / 180);
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                if (i === 0) shape.moveTo(x, y);
                else shape.lineTo(x, y);
            }
            shape.closePath();
            break;
        default: return null;
    }

    const furo = new THREE.Path();
    furo.absarc(0, 0, RAIO_FURO, 0, Math.PI * 2, true); 
    shape.holes.push(furo); 

    const extrudeSettings = {
        depth: ALTURA_PECA,
        bevelEnabled: false,
        curveSegments: 32
    };

    const geometria = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometria.center(); 

    const mat = new THREE.MeshStandardMaterial({ color: corPeca, metalness: 0.5, roughness: 0.5 });
    const mesh = new THREE.Mesh(geometria, mat);
    
    mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = true; 
    mesh.receiveShadow = true;
    mesh.position.y = ALTURA_PECA / 2;

    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometria, 30), materialLinhaPreta));

    return mesh;
}

function renderizarPeca3D(idPino, nomeSlot, tipoPeca) {
    const pinoAlvo = (idPino === 1) ? pino1 : pino2;
    const slotAlvo = pinoAlvo.getObjectByName(nomeSlot);
    if (!slotAlvo) return;

    while (slotAlvo.children.length > 0) {
        gsap.killTweensOf(slotAlvo.children[0].position);
        if (slotAlvo.children[0].geometry) slotAlvo.children[0].geometry.dispose();
        slotAlvo.remove(slotAlvo.children[0]);
    }

    if (tipoPeca && tipoPeca !== "") {
        const novaPeca = criarPecaProcedural(tipoPeca);
        const yFinal = novaPeca.position.y;
        
        novaPeca.position.y = yFinal + 6; 
        
        slotAlvo.add(novaPeca);

        gsap.to(novaPeca.position, {
            y: yFinal, 
            duration: 2.2, 
            ease: "back.out(0.15)", 
            delay: 0.05
        });
    }
}

// ==========================================
// 5. GESTÃO DE ESTADO E INTERFACE
// ==========================================

function resetarEstadoVisualDropdowns() {
    [selPeca1, selPeca2, selPeca3].forEach(sel => {
        for (let i = 0; i < sel.options.length; i++) {
            if (sel.options[i].value !== "") sel.options[i].disabled = false;
        }
        sel.disabled = true;
    });
}

function atualizarInterfaceUsuario() {
    if (tituloPino) tituloPino.innerText = `Pino ${pinoAtivo}`;
    
    const dados = (pinoAtivo === 1) ? pedidoFinal.pino1 : pedidoFinal.pino2;
    resetarEstadoVisualDropdowns();

    selPeca1.value = dados.slot1;
    selPeca2.value = dados.slot2;
    selPeca3.value = dados.slot3;

    if (dados.slot1 === "") {
        selPeca1.disabled = false;
        selPeca2.disabled = true;
        selPeca3.disabled = true;
    } else {
        selPeca1.disabled = true;
        desabilitarOpcaoVisual(selPeca2, dados.slot1);
        desabilitarOpcaoVisual(selPeca3, dados.slot1);

        if (dados.slot2 === "") {
            selPeca2.disabled = false;
        } else {
            selPeca2.disabled = true;
            desabilitarOpcaoVisual(selPeca3, dados.slot2);

            if (dados.slot3 === "") {
                selPeca3.disabled = false;
            } else {
                selPeca3.disabled = true;
            }
        }
    }
}

function desabilitarOpcaoVisual(select, valor) {
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === valor) {
            select.options[i].disabled = true;
        }
    }
}

function manipularMudancaInput(nomeSlot, valor) {
    const chavePino = (pinoAtivo === 1) ? 'pino1' : 'pino2';
    pedidoFinal[chavePino][nomeSlot] = valor;
    renderizarPeca3D(pinoAtivo, nomeSlot, valor);
    atualizarInterfaceUsuario();
}

// ==========================================
// 6. EVENTOS (CLIQUES E BOTÕES)
// ==========================================

selPeca1.addEventListener('change', (e) => manipularMudancaInput('slot1', e.target.value));
selPeca2.addEventListener('change', (e) => manipularMudancaInput('slot2', e.target.value));
selPeca3.addEventListener('change', (e) => manipularMudancaInput('slot3', e.target.value));

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    // Só permite clicar se tiver 2 pinos E se não estiver animando troca de pinos
    // (switchFilter.disabled é nossa flag de "animando")
    if (!modoDoisPinos || (switchFilter && switchFilter.disabled)) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([pino1, pino2], true);

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.id) obj = obj.parent;
        
        if (obj.userData.id && obj.userData.id !== pinoAtivo) {
            pinoAtivo = obj.userData.id;
            const alvoX = (pinoAtivo === 1) ? pino1.position.x : pino2.position.x;
            gsap.to(seletorAtivo.position, { x: alvoX, duration: 0.5 });
            atualizarInterfaceUsuario();
        }
    }
});

// ==========================================
// CORREÇÃO DO BUG: TRAVA NO BOTÃO DE TROCA
// ==========================================
if (switchFilter) {
    switchFilter.addEventListener('change', (e) => {
        // 1. TRAVA IMEDIATAMENTE PARA NÃO CLICAR DE NOVO
        switchFilter.disabled = true;
        
        modoDoisPinos = e.target.checked;
        
        if (modoDoisPinos) {
            // --- INDO PARA 2 PINOS ---
            gsap.to(pino1.position, { x: -4, duration: 1, ease: "power2.inOut" });
            gsap.to(seletorAtivo.position, { x: -4, duration: 1, ease: "power2.inOut" });
            
            pino2.visible = true;
            pino2.position.set(4, 15, 0); 
            
            gsap.to(pino2.position, { 
                y: 0, 
                duration: 2.0, 
                ease: "back.out(0.2)", 
                delay: 0.2,
                // DESTRAVA SÓ NO FINAL DA ANIMAÇÃO
                onComplete: () => { switchFilter.disabled = false; }
            });

        } else {
            // --- VOLTANDO PARA 1 PINO ---
            pinoAtivo = 1;
            atualizarInterfaceUsuario();
            
            gsap.to(seletorAtivo.position, { x: 0, duration: 1, ease: "power2.inOut", delay: 0.2 });
            gsap.to(pino1.position, { x: 0, duration: 1, ease: "power2.inOut", delay: 0.2 });
            
            gsap.to(pino2.position, { 
                y: 20, 
                x: 8, 
                duration: 1.2, 
                ease: "power2.in",
                onComplete: () => { 
                    pino2.visible = false; 
                    pino2.position.x = 4;
                    // DESTRAVA SÓ NO FINAL DA ANIMAÇÃO
                    switchFilter.disabled = false;
                } 
            });
        }
    });
}

if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
        const chavePino = (pinoAtivo === 1) ? 'pino1' : 'pino2';
        pedidoFinal[chavePino] = { slot1: "", slot2: "", slot3: "" };
        
        const pinoAtual = (pinoAtivo === 1) ? pino1 : pino2;
        const slotsParaLimpar = ['slot1', 'slot2', 'slot3'];

        slotsParaLimpar.forEach(nomeSlot => {
            const slotObj = pinoAtual.getObjectByName(nomeSlot);
            if (slotObj && slotObj.children.length > 0) {
                const peca = slotObj.children[0];
                gsap.killTweensOf(peca.position);

                gsap.to(peca.position, {
                    y: peca.position.y + 15, 
                    duration: 1.2, 
                    ease: "power2.in"
                });

                gsap.to(peca.scale, {
                    x: 0, y: 0, z: 0,
                    duration: 1.2, 
                    ease: "power2.in",
                    onComplete: () => {
                        if (peca.geometry) peca.geometry.dispose();
                        slotObj.remove(peca);
                    }
                });
            }
        });

        atualizarInterfaceUsuario();
    });
}

if (btnPedido) {
    btnPedido.addEventListener('click', (e) => {
        e.preventDefault();
        const p1Cheio = pedidoFinal.pino1.slot1 !== "";
        const p2Cheio = pedidoFinal.pino2.slot1 !== "";

        if (!p1Cheio) {
            alert("⚠️ O Pino 1 está vazio! Selecione pelo menos uma peça.");
            return;
        }
        if (modoDoisPinos && !p2Cheio) {
            alert("⚠️ Você ativou o modo de 2 pinos, mas o Pino 2 está vazio!");
            return;
        }
        console.log("✅ PEDIDO REALIZADO:", pedidoFinal);
        const textoOriginal = btnPedido.innerText;
        btnPedido.innerText = "Pedido Enviado! ✔";
        btnPedido.style.backgroundColor = "#2ecc71";
        setTimeout(() => {
            btnPedido.innerText = textoOriginal;
            btnPedido.style.backgroundColor = "";
        }, 3000);
    });
}

atualizarInterfaceUsuario();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();