import { useState, Suspense, useRef, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

/* Mesh name to organelle ID mapping */
function meshNameToOrganelleId(name: string): string | null {
  if (name === 'CellWall') return 'cell-wall';
  if (name === 'CellMembrane') return 'membrane';
  if (name === 'Cytoplasm') return 'cytoplasm';
  if (name === 'Nucleus' || name === 'Nucleolus' || name === 'NuclearEnvelope') return 'nucleus';
  if (name.startsWith('Mitochondria_')) return 'mitochondria';
  if (name.startsWith('RoughER_') || name.startsWith('RER_Ribosome_')) return 'er-rough';
  if (name.startsWith('SmoothER_')) return 'er-smooth';
  if (name.startsWith('Golgi_') || name.startsWith('GolgiVesicle_')) return 'golgi';
  if (name.startsWith('Lysosome_')) return 'lysosome';
  if (name.startsWith('Centriole_')) return 'centriole';
  if (name.startsWith('FreeRibosome_')) return 'ribosome';
  if (name.startsWith('Chloroplast_')) return 'chloroplast';
  if (name === 'Vacuole') return 'vacuole';
  return null;
}

/* Label config */
type LabelConfig = Record<string, { name: string; offset: [number, number, number] }>;

const ANIMAL_LABEL_CONFIG: LabelConfig = {
  membrane: { name: 'Membrana', offset: [0, 3.5, 0] },
  nucleus: { name: 'Nucleo', offset: [-1.5, 2.2, 0] },
  mitochondria: { name: 'Mitocondria', offset: [2.5, 2.0, 0] },
  'er-rough': { name: 'R.E. Rugoso', offset: [1.5, 1.8, 0] },
  'er-smooth': { name: 'R.E. Liso', offset: [-2.5, 1.5, 0] },
  golgi: { name: 'Golgi', offset: [1.0, 1.5, 0] },
  lysosome: { name: 'Lisosoma', offset: [-2.0, 2.2, 0] },
  centriole: { name: 'Centriolo', offset: [2.0, 1.2, 0] },
};

const PLANT_LABEL_CONFIG: LabelConfig = {
  'cell-wall': { name: 'Pared Celular', offset: [0, 3.8, 0] },
  membrane: { name: 'Membrana', offset: [3.5, 2.8, 0] },
  vacuole: { name: 'Vacuola', offset: [0, 2.2, 0] },
  nucleus: { name: 'Nucleo', offset: [-3.0, 2.5, 0] },
  chloroplast: { name: 'Cloroplasto', offset: [3.0, 1.8, 0] },
  mitochondria: { name: 'Mitocondria', offset: [-2.5, 1.5, 0] },
  'er-rough': { name: 'R.E. Rugoso', offset: [1.8, -2.0, 0] },
  'er-smooth': { name: 'R.E. Liso', offset: [-1.5, -2.2, 0] },
  golgi: { name: 'Golgi', offset: [-2.0, -1.5, 0] },
};

/* Leader line helper */
function LeaderLine({ start, end, color = '#888888', opacity = 0.4 }: {
  start: THREE.Vector3; end: THREE.Vector3; color?: string; opacity?: number;
}) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([start.x, start.y, start.z, end.x, end.y, end.z], 3));
    return g;
  }, [start, end]);
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthTest: false }), [color, opacity]);
  return <primitive object={new THREE.Line(geo, mat)} />;
}

/* Cell 3D Model */
interface CellModel3DProps {
  modelPath: string;
  cellType: 'animal' | 'plant';
  onSelectOrganelle: (id: string, point: THREE.Vector3) => void;
  selectedOrganelleId?: string;
  selectedPoint?: THREE.Vector3 | null;
  showLabels: boolean;
}

function CellModel3D({ modelPath, cellType, onSelectOrganelle, selectedOrganelleId, selectedPoint, showLabels }: CellModel3DProps) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const shellClipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), cellType === 'plant' ? 0.8 : 1.2),
    [cellType],
  );

  const shellNames = useMemo(() => {
    if (cellType === 'plant') return new Set(['CellWall', 'CellMembrane', 'Cytoplasm']);
    return new Set(['CellMembrane', 'Cytoplasm']);
  }, [cellType]);

  const shellStyles = useMemo((): Record<string, { color: string; opacity: number; roughness: number }> => {
    if (cellType === 'plant') return {
      CellWall: { color: '#6b8a3a', opacity: 0.3, roughness: 0.5 },
      CellMembrane: { color: '#8aad55', opacity: 0.2, roughness: 0.4 },
      Cytoplasm: { color: '#d4e8b8', opacity: 0.12, roughness: 0.6 },
      Vacuole: { color: '#4488cc', opacity: 0.18, roughness: 0.3 },
    };
    return {
      CellMembrane: { color: '#4a3a6a', opacity: 0.35, roughness: 0.3 },
      Cytoplasm: { color: '#c8bfdf', opacity: 0.15, roughness: 0.6 },
    };
  }, [cellType]);

  useMemo(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const style = shellStyles[mesh.name];

        // Apply shell styles to configured meshes
        if (style) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (let i = 0; i < materials.length; i++) {
            const mat = materials[i];
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              const cloned = mat.clone();
              cloned.clippingPlanes = [shellClipPlane];
              cloned.clipShadows = true;
              cloned.side = THREE.DoubleSide;
              cloned.transparent = true;
              cloned.color.set(style.color);
              cloned.opacity = style.opacity;
              cloned.roughness = style.roughness;
              materials[i] = cloned;
            }
          }
          mesh.material = Array.isArray(mesh.material) ? materials : materials[0];
        }

        // Only disable raycast for non-selectable shells
        if (shellNames.has(mesh.name)) {
          mesh.raycast = () => {};
        }
      }
    });
  }, [clonedScene, shellClipPlane, shellNames, shellStyles]);

  const labelConfig = cellType === 'plant' ? PLANT_LABEL_CONFIG : ANIMAL_LABEL_CONFIG;

  const organelleCenters = useMemo(() => {
    const positions: Record<string, THREE.Vector3> = {};
    const counts: Record<string, number> = {};
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const id = meshNameToOrganelleId(child.name);
        if (id && id in labelConfig) {
          const box = new THREE.Box3().setFromObject(child);
          const center = box.getCenter(new THREE.Vector3());
          if (!positions[id]) {
            positions[id] = center.clone();
            counts[id] = 1;
          } else {
            positions[id].add(center);
            counts[id]++;
          }
        }
      }
    });
    for (const id of Object.keys(positions)) {
      positions[id].divideScalar(counts[id]);
    }
    return positions;
  }, [clonedScene, labelConfig]);

  const materialMaps = useMemo(() => {
    const originals = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
    const selected = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
    const hovered = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
    const dimmed = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();

    clonedScene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const id = meshNameToOrganelleId(mesh.name);
      if (!id) return;

      originals.set(mesh, mesh.material);

      const makeVariant = (color: string, emissiveColor: string, emissiveStrength: number, opacity?: number) => {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const variant = mats.map((m) => {
          const c = (m as THREE.MeshStandardMaterial).clone();
          c.color.set(color);
          c.emissive.set(emissiveColor);
          c.emissiveIntensity = emissiveStrength;
          if (opacity !== undefined) {
            c.transparent = true;
            c.opacity = opacity;
          } else {
            c.transparent = false;
            c.opacity = 1;
          }
          return c;
        });
        return Array.isArray(mesh.material) ? variant : variant[0];
      };

      selected.set(mesh, makeVariant('#22cc55', '#11aa33', 0.7));
      hovered.set(mesh, makeVariant('#22aadd', '#1188aa', 0.5));

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const dimmedMats = mats.map((m) => {
        const c = (m as THREE.MeshStandardMaterial).clone();
        const hsl = { h: 0, s: 0, l: 0 };
        c.color.getHSL(hsl);
        c.color.setHSL(hsl.h, hsl.s * 0.2, hsl.l * 0.6);
        c.transparent = true;
        c.opacity = 0.25;
        return c;
      });
      dimmed.set(mesh, Array.isArray(mesh.material) ? dimmedMats : dimmedMats[0]);
    });

    return { originals, selected, hovered, dimmed };
  }, [clonedScene]);

  useFrame(() => {
    clonedScene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const id = meshNameToOrganelleId(mesh.name);
      if (!id) return;

      if (id === selectedOrganelleId && materialMaps.selected.has(mesh)) {
        mesh.material = materialMaps.selected.get(mesh)!;
      } else if (id === hoveredId && materialMaps.hovered.has(mesh)) {
        mesh.material = materialMaps.hovered.get(mesh)!;
      } else if (selectedOrganelleId && materialMaps.dimmed.has(mesh)) {
        mesh.material = materialMaps.dimmed.get(mesh)!;
      } else if (materialMaps.originals.has(mesh)) {
        mesh.material = materialMaps.originals.get(mesh)!;
      }
    });
  });

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const { camera, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const getHitInfo = useCallback(
    (event: MouseEvent): { id: string; center: THREE.Vector3 } | null => {
      if (!groupRef.current) return null;
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(groupRef.current.children, true);
      for (const hit of hits) {
        const id = meshNameToOrganelleId(hit.object.name);
        if (id) {
          const box = new THREE.Box3().setFromObject(hit.object);
          const center = box.getCenter(new THREE.Vector3());
          groupRef.current!.worldToLocal(center);
          return { id, center };
        }
      }
      return null;
    },
    [camera, gl],
  );

  useEffect(() => {
    const canvas = gl.domElement;

    const onClick = (e: MouseEvent) => {
      const info = getHitInfo(e);
      if (info) onSelectOrganelle(info.id, info.center);
    };

    const onPointerMove = (e: MouseEvent) => {
      const info = getHitInfo(e);
      setHoveredId(info?.id ?? null);
      canvas.style.cursor = info ? 'pointer' : 'auto';
    };

    canvas.addEventListener('click', onClick);
    canvas.addEventListener('pointermove', onPointerMove);
    return () => {
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.style.cursor = 'auto';
    };
  }, [gl, getHitInfo, onSelectOrganelle]);

  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2;
      ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });

  const selectedCenter = selectedPoint ?? (selectedOrganelleId ? organelleCenters[selectedOrganelleId] ?? null : null);

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />

      {selectedCenter && (
        <group position={[selectedCenter.x, selectedCenter.y, selectedCenter.z]}>
          <mesh ref={ringRef}>
            <ringGeometry args={[0.7, 0.85, 32]} />
            <meshBasicMaterial color="#22cc55" transparent opacity={0.8} side={THREE.DoubleSide} depthTest={false} />
          </mesh>
          <LeaderLine
            start={new THREE.Vector3(0, 0, 0)}
            end={new THREE.Vector3(0, 1.8, 0)}
            color="#22cc55"
            opacity={1}
          />
          <mesh position={[0, 1.9, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.12, 0.3, 8]} />
            <meshBasicMaterial color="#22cc55" depthTest={false} />
          </mesh>
          <Html position={[0, 2.3, 0]} center style={{ pointerEvents: 'none' }}>
            <div className="bg-emerald-500 text-white text-[11px] px-2 py-1 rounded-lg whitespace-nowrap font-bold shadow-lg">
              {labelConfig[selectedOrganelleId!]?.name ?? selectedOrganelleId}
            </div>
          </Html>
        </group>
      )}

      {showLabels && !selectedOrganelleId &&
        Object.entries(organelleCenters).map(([id, center]) => {
          const cfg = labelConfig[id];
          if (!cfg) return null;
          const labelPos = new THREE.Vector3(
            center.x + cfg.offset[0],
            center.y + cfg.offset[1],
            center.z + cfg.offset[2],
          );
          return (
            <group key={id}>
              <LeaderLine start={center} end={labelPos} />
              <Html
                position={[labelPos.x, labelPos.y, labelPos.z]}
                center
                zIndexRange={[10, 0]}
                style={{ pointerEvents: 'none' }}
              >
                <div className="bg-slate-800/90 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap font-medium shadow">
                  {cfg.name}
                </div>
              </Html>
            </group>
          );
        })}
    </group>
  );
}

// Preload models
useGLTF.preload('/models/cells/animal_cell.glb');
useGLTF.preload('/models/cells/plant_cell.glb');

/* Organelle data */
interface Organelle {
  id: string;
  name: string;
  function: string;
  details: string;
  inAnimal: boolean;
  inPlant: boolean;
  color: string;
}

const organelles: Organelle[] = [
  { id: 'nucleus', name: 'Nucleo', function: 'Centro de control de la celula', details: 'Contiene el material genetico (ADN). Controla las actividades celulares y la reproduccion.', inAnimal: true, inPlant: true, color: '#8b5cf6' },
  { id: 'mitochondria', name: 'Mitocondria', function: 'Produccion de energia (ATP)', details: 'Central energetica de la celula. Realiza la respiracion celular para producir ATP.', inAnimal: true, inPlant: true, color: '#f97316' },
  { id: 'ribosome', name: 'Ribosoma', function: 'Sintesis de proteinas', details: 'Fabrica de proteinas. Puede estar libre en el citoplasma o adherido al reticulo endoplasmatico.', inAnimal: true, inPlant: true, color: '#ec4899' },
  { id: 'er-rough', name: 'R.E. Rugoso', function: 'Sintesis de proteinas', details: 'Red de membranas con ribosomas. Modifica y transporta proteinas recien sintetizadas.', inAnimal: true, inPlant: true, color: '#3b82f6' },
  { id: 'er-smooth', name: 'R.E. Liso', function: 'Sintesis de lipidos', details: 'Red de membranas sin ribosomas. Sintetiza lipidos y desintoxica sustancias.', inAnimal: true, inPlant: true, color: '#06b6d4' },
  { id: 'golgi', name: 'Aparato de Golgi', function: 'Empaquetamiento', details: 'Centro de procesamiento. Modifica, empaqueta y distribuye proteinas y lipidos.', inAnimal: true, inPlant: true, color: '#eab308' },
  { id: 'lysosome', name: 'Lisosoma', function: 'Digestion celular', details: 'Contiene enzimas digestivas. Degrada materiales de desecho y organelos danados.', inAnimal: true, inPlant: false, color: '#ef4444' },
  { id: 'vacuole', name: 'Vacuola', function: 'Almacenamiento', details: 'En plantas es grande y central, almacena agua y nutrientes.', inAnimal: true, inPlant: true, color: '#22c55e' },
  { id: 'chloroplast', name: 'Cloroplasto', function: 'Fotosintesis', details: 'Solo en plantas. Contiene clorofila para producir glucosa y oxigeno.', inAnimal: false, inPlant: true, color: '#16a34a' },
  { id: 'cell-wall', name: 'Pared Celular', function: 'Soporte', details: 'Solo en plantas. Hecha de celulosa, da rigidez y forma.', inAnimal: false, inPlant: true, color: '#84cc16' },
  { id: 'membrane', name: 'Membrana', function: 'Barrera selectiva', details: 'Rodea a todas las celulas. Controla lo que entra y sale.', inAnimal: true, inPlant: true, color: '#a855f7' },
  { id: 'centriole', name: 'Centriolo', function: 'Division celular', details: 'Solo en animales. Organiza los microtubulos durante la division.', inAnimal: true, inPlant: false, color: '#f472b6' },
];

/* Main Component */
export function CellViewer3D() {
  const [cellType, setCellType] = useState<'animal' | 'plant'>('animal');
  const [selectedOrganelle, setSelectedOrganelle] = useState<Organelle | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<THREE.Vector3 | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  const visibleOrganelles = organelles.filter((o) =>
    cellType === 'animal' ? o.inAnimal : o.inPlant
  );

  const handleSelectOrganelle = (organelle: Organelle) => {
    setSelectedOrganelle(organelle);
    setSelectedPoint(null);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full min-h-[500px] lg:min-h-[600px]">
      {/* 3D Viewer */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-100 via-white to-slate-50">
        {/* Cell type toggle */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={() => { setCellType('animal'); setSelectedOrganelle(null); setSelectedPoint(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              cellType === 'animal'
                ? 'bg-emerald-500 text-white shadow'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Celula Animal
          </button>
          <button
            onClick={() => { setCellType('plant'); setSelectedOrganelle(null); setSelectedPoint(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              cellType === 'plant'
                ? 'bg-emerald-500 text-white shadow'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Celula Vegetal
          </button>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
          >
            {showLabels ? 'Ocultar' : 'Mostrar'} etiquetas
          </button>
          {selectedOrganelle && (
            <button
              onClick={() => { setSelectedOrganelle(null); setSelectedPoint(null); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-all"
            >
              Quitar seleccion
            </button>
          )}
        </div>

        {/* Canvas */}
        <Canvas shadows gl={{ localClippingEnabled: true, toneMapping: THREE.NoToneMapping }}>
          <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={45} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-3, 2, -4]} intensity={0.4} />
          <OrbitControls enablePan={false} minDistance={5} maxDistance={18} />
          <Suspense fallback={null}>
            <CellModel3D
              key={cellType}
              modelPath={cellType === 'plant' ? '/models/cells/plant_cell.glb' : '/models/cells/animal_cell.glb'}
              cellType={cellType}
              onSelectOrganelle={(id, point) => {
                const org = organelles.find((o) => o.id === id) || null;
                setSelectedOrganelle(org);
                setSelectedPoint(point);
              }}
              selectedOrganelleId={selectedOrganelle?.id}
              selectedPoint={selectedPoint}
              showLabels={showLabels}
            />
            <Environment preset="studio" environmentIntensity={0.3} />
          </Suspense>
        </Canvas>

        {/* Help text */}
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-500 pointer-events-none">
          Haz clic en un organelo · Arrastra para rotar
        </p>
      </div>

      {/* Side Panel */}
      <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-700/50 bg-slate-800/50 p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-white">Celula {cellType === 'animal' ? 'Animal' : 'Vegetal'}</h3>
              <p className="text-xs text-white/60">Modelo 3D interactivo</p>
            </div>
          </div>

          {/* Selected organelle info */}
          {selectedOrganelle ? (
            <div className="bg-emerald-500/20 rounded-xl p-4 border border-emerald-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: selectedOrganelle.color }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">{selectedOrganelle.name}</h4>
                  <p className="text-xs text-white/60">{selectedOrganelle.function}</p>
                </div>
              </div>
              <p className="text-sm text-white/80">{selectedOrganelle.details}</p>
              <div className="flex gap-1.5 mt-3">
                {selectedOrganelle.inAnimal && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500 text-white">Animal</span>
                )}
                {selectedOrganelle.inPlant && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">Vegetal</span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/70">
              Haz clic en cualquier organelo del modelo 3D para ver sus propiedades y funcion.
            </p>
          )}

          {/* Organelle list */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Organelos</p>
            {visibleOrganelles.map((organelle) => (
              <button
                key={organelle.id}
                onClick={() => handleSelectOrganelle(organelle)}
                className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all text-left ${
                  selectedOrganelle?.id === organelle.id
                    ? 'bg-white/20'
                    : 'hover:bg-white/10'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0 shadow-md"
                  style={{ backgroundColor: organelle.color }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{organelle.name}</p>
                </div>
              </button>
            ))}
          </div>

          {/* CTA */}
          <a
            href={`${(typeof window !== 'undefined' && (window as unknown as { __TLACU_PLATFORM_URL__?: string }).__TLACU_PLATFORM_URL__) || 'https://tlacu.mx'}/auth/register`}
            className="block w-full mt-4 px-4 py-3 bg-orange-500 text-white text-center font-semibold rounded-xl hover:bg-orange-600 transition-colors"
          >
            Ver modelo completo →
          </a>
        </div>
      </div>
    </div>
  );
}

export default CellViewer3D;
