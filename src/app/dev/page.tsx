'use client';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Edges, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

// --- TYPES ---
type Unit = 'cm' | 'm';

interface DrawerItem {
    id: string;
    name: string;
    color: string;
    position: [number, number, number];
}

interface Drawer {
    id: string;
    position: [number, number, number]; // Position relative to furniture CENTER
    size: [number, number, number]; // width, height, depth
    isOpen: boolean;
    items: DrawerItem[];
}

interface FurnitureObject {
    id: string;
    position: [number, number, number];
    size: [number, number, number]; // width, height, depth
    drawers: Drawer[];
}

// --- WASD CAMERA CONTROLLER (WORLD-SPACE FIXED) ---
const WASDCameraController = () => {
    const { camera } = useThree();
    const keysPressed = useRef<{ [key: string]: boolean }>({});
    const moveSpeed = 0.05;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keysPressed.current[e.key.toLowerCase()] = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current[e.key.toLowerCase()] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useFrame(() => {
        // FIXED WORLD-SPACE MOVEMENT (không xoay theo camera)
        if (keysPressed.current['w']) {
            camera.position.z -= moveSpeed; // Move forward (negative Z)
        }
        if (keysPressed.current['s']) {
            camera.position.z += moveSpeed; // Move backward (positive Z)
        }
        if (keysPressed.current['a']) {
            camera.position.x -= moveSpeed; // Move left (negative X)
        }
        if (keysPressed.current['d']) {
            camera.position.x += moveSpeed; // Move right (positive X)
        }
    });

    return null;
};

// --- GRID OVERLAY FOR DRAWER PLACEMENT ---
const DrawerPlacementGrid = ({
                                 furnitureSize,
                                 furniturePos,
                                 onGridClick,
                                 existingDrawers,
                             }: {
    furnitureSize: [number, number, number];
    furniturePos: [number, number, number];
    onGridClick: (y: number, x: number) => void;
    existingDrawers: Drawer[];
}) => {
    const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
    const gridDivisions = { horizontal: 10, vertical: 3 }; // 10 rows, 3 columns
    const stepY = furnitureSize[1] / gridDivisions.horizontal;
    const stepX = furnitureSize[0] / gridDivisions.vertical;

    const gridLines: [number, number, number][][] = [];
    const clickCells: { y: number; x: number; yWorld: number; xWorld: number }[] = [];

    // Create horizontal grid lines
    for (let i = 0; i <= gridDivisions.horizontal; i++) {
        const yLocal = -furnitureSize[1] / 2 + i * stepY;
        const yWorld = furniturePos[1] + yLocal;

        gridLines.push([
            [furniturePos[0] - furnitureSize[0] / 2, yWorld, furniturePos[2]],
            [furniturePos[0] + furnitureSize[0] / 2, yWorld, furniturePos[2]],
        ]);

        // Create columns for this row
        for (let j = 0; j < gridDivisions.vertical; j++) {
            const xLocal = -furnitureSize[0] / 2 + stepX / 2 + j * stepX;
            const xWorld = furniturePos[0] + xLocal;

            if (i < gridDivisions.horizontal) {
                clickCells.push({ y: yLocal, x: xLocal, yWorld, xWorld });
            }
        }
    }

    // Vertical lines
    for (let j = 0; j <= gridDivisions.vertical; j++) {
        const xLocal = -furnitureSize[0] / 2 + j * stepX;
        const xWorld = furniturePos[0] + xLocal;

        gridLines.push([
            [xWorld, furniturePos[1] - furnitureSize[1] / 2, furniturePos[2]],
            [xWorld, furniturePos[1] + furnitureSize[1] / 2, furniturePos[2]],
        ]);
    }

    return (
        <group>
            {/* Grid Lines */}
            {gridLines.map((line, i) => (
                <Line
                    key={i}
                    points={line}
                    color="#60a5fa"
                    lineWidth={1.5}
                />
            ))}

            {/* Clickable grid cells */}
            {clickCells.map((cell, i) => {
                const cellKey = `${cell.x.toFixed(2)}_${cell.y.toFixed(2)}`;
                const isHovered = hoveredCell?.x === cell.x && hoveredCell?.y === cell.y;

                return (
                    <mesh
                        key={i}
                        position={[cell.xWorld, cell.yWorld + stepY / 2, furniturePos[2]]}
                        onClick={(e) => {
                            e.stopPropagation();
                            onGridClick(cell.y, cell.x);
                        }}
                        onPointerOver={(e) => {
                            e.stopPropagation();
                            setHoveredCell({ x: cell.x, y: cell.y });
                        }}
                        onPointerOut={() => setHoveredCell(null)}
                    >
                        <boxGeometry args={[stepX * 0.95, stepY * 0.95, 0.01]} />
                        <meshBasicMaterial
                            color={isHovered ? '#fbbf24' : '#3b82f6'}
                            transparent
                            opacity={isHovered ? 0.3 : 0.1}
                        />
                    </mesh>
                );
            })}

            {/* Show existing drawer positions */}
            {existingDrawers.map((drawer) => {
                const yWorld = furniturePos[1] + drawer.position[1];
                const xWorld = furniturePos[0] + drawer.position[0];
                return (
                    <mesh
                        key={drawer.id}
                        position={[xWorld, yWorld, furniturePos[2]]}
                    >
                        <boxGeometry args={[drawer.size[0], drawer.size[1], 0.01]} />
                        <meshBasicMaterial color="#22c55e" transparent opacity={0.4} />
                    </mesh>
                );
            })}
        </group>
    );
};

// --- DRAWER MESH COMPONENT (FULLY INSIDE FURNITURE) ---
const DrawerMesh = ({
                        drawer,
                        furniturePos,
                        furnitureSize,
                        onDrawerClick,
                        isHighlighted,
                        isSelected,
                    }: {
    drawer: Drawer;
    furniturePos: [number, number, number];
    furnitureSize: [number, number, number];
    onDrawerClick: () => void;
    isHighlighted: boolean;
    isSelected: boolean;
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto';
    }, [hovered]);

    // Drawer stays INSIDE when closed, slides OUT when open
    const openOffset = drawer.isOpen ? drawer.size[2] * 1.2 : 0;

    // Position drawer INSIDE furniture
    // Z position: start from back of furniture, move forward by drawer depth
    const zPosInside = -furnitureSize[2] / 2 + drawer.size[2] / 2;

    const worldPos: [number, number, number] = [
        furniturePos[0] + drawer.position[0],
        furniturePos[1] + drawer.position[1],
        furniturePos[2] + zPosInside + openOffset,
    ];

    const drawerColor = isHighlighted
        ? '#fbbf24'
        : isSelected
            ? '#a855f7'
            : hovered
                ? '#60a5fa'
                : '#94a3b8';

    return (
        <group position={worldPos}>
            {/* Drawer body */}
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onDrawerClick();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={() => setHovered(false)}
            >
                <boxGeometry args={drawer.size} />
                <meshStandardMaterial color={drawerColor} transparent opacity={0.9} />
                <Edges color="#1e293b" linewidth={2} />
            </mesh>

            {/* Drawer handle (front face) */}
            <mesh position={[0, 0, drawer.size[2] / 2 + 0.01]}>
                <cylinderGeometry args={[0.01, 0.01, drawer.size[0] * 0.3, 16]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>

            {/* Items inside drawer (only visible when open) */}
            {drawer.isOpen &&
                drawer.items.map((item) => (
                    <group key={item.id} position={item.position}>
                        <mesh>
                            <boxGeometry args={[0.04, 0.04, 0.04]} />
                            <meshStandardMaterial color={item.color} />
                            <Edges color="#000" linewidth={1} />
                        </mesh>
                        <Html position={[0, 0.03, 0]} center>
                            <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                                {item.name}
                            </div>
                        </Html>
                    </group>
                ))}
        </group>
    );
};

// --- FURNITURE MESH COMPONENT ---
const FurnitureMesh = ({
                           furniture,
                           isSelected,
                           isAddingDrawer,
                           onFurnitureClick,
                           onDrawerClick,
                           onAddDrawerAtPosition,
                           highlightedDrawerId,
                           selectedDrawerId,
                       }: {
    furniture: FurnitureObject;
    isSelected: boolean;
    isAddingDrawer: boolean;
    onFurnitureClick: () => void;
    onDrawerClick: (drawerId: string) => void;
    onAddDrawerAtPosition: (y: number, x: number) => void;
    highlightedDrawerId: string | null;
    selectedDrawerId: string | null;
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    const handleClick = (e: any) => {
        e.stopPropagation();
        onFurnitureClick();
    };

    const furnitureColor = isSelected ? '#dbeafe' : hovered ? '#f1f5f9' : '#e2e8f0';

    return (
        <group position={furniture.position}>
            {/* Main furniture body - semi-transparent to see drawers inside */}
            <mesh
                ref={meshRef}
                onClick={handleClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <boxGeometry args={furniture.size} />
                <meshStandardMaterial
                    color={furnitureColor}
                    transparent
                    opacity={0.25}
                    side={THREE.DoubleSide}
                />
                <Edges color={isSelected ? '#3b82f6' : '#334155'} linewidth={isSelected ? 3 : 2} />
            </mesh>

            {/* Grid overlay when adding drawer */}
            {isSelected && isAddingDrawer && (
                <DrawerPlacementGrid
                    furnitureSize={furniture.size}
                    furniturePos={furniture.position}
                    onGridClick={onAddDrawerAtPosition}
                    existingDrawers={furniture.drawers}
                />
            )}

            {/* Drawers */}
            {furniture.drawers.map((drawer) => (
                <DrawerMesh
                    key={drawer.id}
                    drawer={drawer}
                    furniturePos={furniture.position}
                    furnitureSize={furniture.size}
                    onDrawerClick={() => onDrawerClick(drawer.id)}
                    isHighlighted={drawer.id === highlightedDrawerId}
                    isSelected={drawer.id === selectedDrawerId}
                />
            ))}
        </group>
    );
};

// --- MAIN COMPONENT ---
export default function FurnitureBuilderAdvanced() {
    const [unit, setUnit] = useState<Unit>('cm');
    const [furniture, setFurniture] = useState<FurnitureObject[]>([
        {
            id: uuidv4(),
            position: [0, 0.375, 0],
            size: [1.2, 0.75, 0.6],
            drawers: [],
        },
    ]);

    const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(
        furniture[0]?.id || null
    );
    const [isAddingDrawer, setIsAddingDrawer] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedDrawerId, setHighlightedDrawerId] = useState<string | null>(null);
    const [selectedDrawerId, setSelectedDrawerId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Drawer size controls
    const [drawerWidth, setDrawerWidth] = useState(30); // % of furniture width
    const [drawerHeight, setDrawerHeight] = useState(8); // cm
    const [drawerDepth, setDrawerDepth] = useState(80); // % of furniture depth

    // New furniture form
    const [newFurnitureSize, setNewFurnitureSize] = useState({ w: 100, h: 60, d: 40 });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const selectedFurniture = furniture.find((f) => f.id === selectedFurnitureId);
    const selectedDrawer = selectedFurniture?.drawers.find((d) => d.id === selectedDrawerId);

    const convertToMeters = (val: number) => (unit === 'cm' ? val / 100 : val);
    const displayValue = (valInMeter: number) =>
        unit === 'cm' ? parseFloat((valInMeter * 100).toFixed(1)) : parseFloat(valInMeter.toFixed(3));

    // Add new furniture
    const addNewFurniture = () => {
        const newId = uuidv4();
        const size: [number, number, number] = [
            convertToMeters(newFurnitureSize.w),
            convertToMeters(newFurnitureSize.h),
            convertToMeters(newFurnitureSize.d),
        ];

        setFurniture([
            ...furniture,
            {
                id: newId,
                position: [furniture.length * 1.5, size[1] / 2, 0],
                size,
                drawers: [],
            },
        ]);
        setSelectedFurnitureId(newId);
    };

    // Add drawer at grid position (y, x)
    const handleAddDrawerAtPosition = (yLocal: number, xLocal: number) => {
        if (!selectedFurniture) return;

        const drawerSizeCalc: [number, number, number] = [
            selectedFurniture.size[0] * (drawerWidth / 100),
            convertToMeters(drawerHeight),
            selectedFurniture.size[2] * (drawerDepth / 100),
        ];

        // Check if adding drawer would exceed furniture width
        const totalWidthAtY = selectedFurniture.drawers
            .filter((d) => Math.abs(d.position[1] - yLocal) < 0.01)
            .reduce((sum, d) => sum + d.size[0], 0);

        if (totalWidthAtY + drawerSizeCalc[0] > selectedFurniture.size[0]) {
            alert('Không thể thêm ngăn: vượt quá chiều rộng vật thể!');
            return;
        }

        const newDrawer: Drawer = {
            id: uuidv4(),
            position: [xLocal, yLocal, 0],
            size: drawerSizeCalc,
            isOpen: false,
            items: [],
        };

        setFurniture(
            furniture.map((f) =>
                f.id === selectedFurniture.id ? { ...f, drawers: [...f.drawers, newDrawer] } : f
            )
        );
    };

    // Toggle drawer open/close
    const handleDrawerClick = (furnitureId: string, drawerId: string) => {
        setFurniture(
            furniture.map((f) =>
                f.id === furnitureId
                    ? {
                        ...f,
                        drawers: f.drawers.map((d) =>
                            d.id === drawerId ? { ...d, isOpen: !d.isOpen } : d
                        ),
                    }
                    : f
            )
        );
        setSelectedDrawerId(drawerId);
    };

    // Update drawer size
    const updateDrawerSize = () => {
        if (!selectedFurniture || !selectedDrawerId) return;

        const drawerSizeCalc: [number, number, number] = [
            selectedFurniture.size[0] * (drawerWidth / 100),
            convertToMeters(drawerHeight),
            selectedFurniture.size[2] * (drawerDepth / 100),
        ];

        setFurniture(
            furniture.map((f) =>
                f.id === selectedFurniture.id
                    ? {
                        ...f,
                        drawers: f.drawers.map((d) =>
                            d.id === selectedDrawerId ? { ...d, size: drawerSizeCalc } : d
                        ),
                    }
                    : f
            )
        );
    };

    // Delete drawer
    const deleteDrawer = (furnitureId: string, drawerId: string) => {
        setFurniture(
            furniture.map((f) =>
                f.id === furnitureId
                    ? { ...f, drawers: f.drawers.filter((d) => d.id !== drawerId) }
                    : f
            )
        );
        if (selectedDrawerId === drawerId) {
            setSelectedDrawerId(null);
        }
    };

    // Add item to drawer
    const addItemToDrawer = (furnitureId: string, drawerId: string) => {
        const itemName = prompt('Tên món đồ:');
        if (!itemName) return;

        const newItem: DrawerItem = {
            id: uuidv4(),
            name: itemName,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            position: [
                (Math.random() - 0.5) * 0.15,
                (Math.random() - 0.5) * 0.03,
                (Math.random() - 0.5) * 0.15,
            ],
        };

        setFurniture(
            furniture.map((f) =>
                f.id === furnitureId
                    ? {
                        ...f,
                        drawers: f.drawers.map((d) =>
                            d.id === drawerId ? { ...d, items: [...d.items, newItem] } : d
                        ),
                    }
                    : f
            )
        );
    };

    // Search items
    const handleSearch = () => {
        if (!searchQuery.trim()) return;

        const query = searchQuery.toLowerCase();

        for (const furn of furniture) {
            for (const drawer of furn.drawers) {
                const foundItem = drawer.items.find((item) => item.name.toLowerCase().includes(query));

                if (foundItem) {
                    setSelectedFurnitureId(furn.id);
                    setHighlightedDrawerId(drawer.id);
                    setSelectedDrawerId(drawer.id);

                    // Open drawer if not already open
                    if (!drawer.isOpen) {
                        setFurniture(
                            furniture.map((f) =>
                                f.id === furn.id
                                    ? {
                                        ...f,
                                        drawers: f.drawers.map((d) =>
                                            d.id === drawer.id ? { ...d, isOpen: true } : d
                                        ),
                                    }
                                    : f
                            )
                        );
                    }

                    setTimeout(() => setHighlightedDrawerId(null), 3000);
                    return;
                }
            }
        }

        alert('Không tìm thấy món đồ!');
    };

    if (!isMounted) return null;

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex overflow-hidden">
            {/* 3D VIEWPORT (LEFT) */}
            <div className="flex-1 relative">
                <Canvas
                    camera={{ position: [3, 2, 3], fov: 50 }}
                    gl={{ preserveDrawingBuffer: true }}
                    style={{ width: '100%', height: '100%' }}
                >
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[10, 10, 5]} intensity={1} />
                        <pointLight position={[-10, 10, -10]} intensity={0.5} />

                        <Grid args={[20, 20]} cellColor="#475569" sectionColor="#64748b" fadeDistance={30} />

                        {furniture.map((f) => (
                            <FurnitureMesh
                                key={f.id}
                                furniture={f}
                                isSelected={f.id === selectedFurnitureId}
                                isAddingDrawer={isAddingDrawer}
                                onFurnitureClick={() => setSelectedFurnitureId(f.id)}
                                onDrawerClick={(drawerId) => handleDrawerClick(f.id, drawerId)}
                                onAddDrawerAtPosition={handleAddDrawerAtPosition}
                                highlightedDrawerId={highlightedDrawerId}
                                selectedDrawerId={selectedDrawerId}
                            />
                        ))}

                        <WASDCameraController />
                        <OrbitControls enableDamping dampingFactor={0.05} />
                    </Suspense>
                </Canvas>

                {/* Controls Guide */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs p-3 rounded-lg space-y-1 backdrop-blur-sm">
                    <div>
                        ⌨️ <strong>W</strong>: Tiến (Z-)
                    </div>
                    <div>
                        ⌨️ <strong>S</strong>: Lùi (Z+)
                    </div>
                    <div>
                        ⌨️ <strong>A</strong>: Trái (X-)
                    </div>
                    <div>
                        ⌨️ <strong>D</strong>: Phải (X+)
                    </div>
                    <div>
                        🖱️ <strong>Chuột trái</strong>: Xoay
                    </div>
                    <div>
                        🖱️ <strong>Chuột phải</strong>: Pan
                    </div>
                    <div>
                        🖱️ <strong>Con lăn</strong>: Zoom
                    </div>
                </div>

                {/* Warning moved to BOTTOM */}
                {isAddingDrawer && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold shadow-lg">
                        👆 Click vào ô lưới để đặt ngăn kéo
                    </div>
                )}
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="w-96 bg-slate-800/50 backdrop-blur-sm border-l border-slate-700 overflow-y-auto flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-2xl font-bold text-white mb-2">🛋️ Furniture Builder Pro</h1>
                    <p className="text-sm text-slate-400">Thiết kế 3D với ngăn kéo thông minh</p>
                </div>

                {/* Unit Toggle */}
                <div className="p-4 border-b border-slate-700">
                    <div className="flex gap-2">
                        {(['cm', 'm'] as Unit[]).map((u) => (
                            <button
                                key={u}
                                onClick={() => setUnit(u)}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                    unit === u
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                }`}
                            >
                                {u.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-slate-700">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        🔍 Tìm Kiếm Món Đồ
                    </h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Nhập tên món đồ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1 p-2 bg-slate-700 text-white border border-slate-600 rounded outline-none focus:ring-2 ring-blue-500"
                        />
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all"
                        >
                            Tìm
                        </button>
                    </div>
                </div>

                {/* Furniture List */}
                <div className="p-4 border-b border-slate-700">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        📦 Danh Sách Vật Thể ({furniture.length})
                    </h3>

                    {/* Add New Furniture */}
                    <div className="space-y-2 mb-4">
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                type="number"
                                placeholder="Rộng"
                                value={newFurnitureSize.w}
                                onChange={(e) =>
                                    setNewFurnitureSize({ ...newFurnitureSize, w: parseFloat(e.target.value) || 0 })
                                }
                                className="p-2 bg-slate-700 text-white text-sm border border-slate-600 rounded outline-none focus:ring-2 ring-blue-500"
                            />
                            <input
                                type="number"
                                placeholder="Cao"
                                value={newFurnitureSize.h}
                                onChange={(e) =>
                                    setNewFurnitureSize({ ...newFurnitureSize, h: parseFloat(e.target.value) || 0 })
                                }
                                className="p-2 bg-slate-700 text-white text-sm border border-slate-600 rounded outline-none focus:ring-2 ring-blue-500"
                            />
                            <input
                                type="number"
                                placeholder="Sâu"
                                value={newFurnitureSize.d}
                                onChange={(e) =>
                                    setNewFurnitureSize({ ...newFurnitureSize, d: parseFloat(e.target.value) || 0 })
                                }
                                className="p-2 bg-slate-700 text-white text-sm border border-slate-600 rounded outline-none focus:ring-2 ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={addNewFurniture}
                            className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
                        >
                            + Tạo Vật Thể
                        </button>
                    </div>

                    <div className="space-y-2">
                        {furniture.map((f, idx) => (
                            <div
                                key={f.id}
                                onClick={() => setSelectedFurnitureId(f.id)}
                                className={`p-3 rounded-lg cursor-pointer transition-all ${
                                    f.id === selectedFurnitureId
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                <div className="font-semibold">Vật thể {idx + 1}</div>
                                <div className="text-xs opacity-75">
                                    {displayValue(f.size[0])} × {displayValue(f.size[1])} × {displayValue(f.size[2])}{' '}
                                    {unit}
                                </div>
                                <div className="text-xs opacity-75">{f.drawers.length} ngăn kéo</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Drawer Management */}
                {selectedFurniture && (
                    <div className="p-4 border-b border-slate-700">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            🗄️ Quản Lý Ngăn Kéo
                        </h3>

                        {/* Drawer Size Controls */}
                        <div className="bg-slate-700/50 p-3 rounded-lg mb-3 space-y-2">
                            <div className="text-sm text-slate-300 font-semibold mb-2">Kích thước ngăn mới:</div>
                            <div>
                                <label className="text-xs text-slate-400">Rộng ({drawerWidth}%)</label>
                                <input
                                    type="range"
                                    min="20"
                                    max="100"
                                    value={drawerWidth}
                                    onChange={(e) => setDrawerWidth(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Cao ({drawerHeight} cm)</label>
                                <input
                                    type="range"
                                    min="5"
                                    max="20"
                                    value={drawerHeight}
                                    onChange={(e) => setDrawerHeight(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Sâu ({drawerDepth}%)</label>
                                <input
                                    type="range"
                                    min="30"
                                    max="95"
                                    value={drawerDepth}
                                    onChange={(e) => setDrawerDepth(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setIsAddingDrawer(!isAddingDrawer)}
                            className={`w-full py-2 rounded-lg font-semibold transition-all mb-3 ${
                                isAddingDrawer
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                        >
                            {isAddingDrawer ? '❌ Hủy Thêm Ngăn' : '➕ Thêm Ngăn Kéo'}
                        </button>

                        {/* Update Selected Drawer Size */}
                        {selectedDrawerId && (
                            <button
                                onClick={updateDrawerSize}
                                className="w-full py-2 mb-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all"
                            >
                                ✏️ Cập nhật kích thước ngăn
                            </button>
                        )}

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {selectedFurniture.drawers.map((drawer, idx) => (
                                <div
                                    key={drawer.id}
                                    onClick={() => setSelectedDrawerId(drawer.id)}
                                    className={`p-3 rounded-lg transition-all cursor-pointer ${
                                        drawer.id === selectedDrawerId
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-semibold">Ngăn {idx + 1}</div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addItemToDrawer(selectedFurniture.id, drawer.id);
                                                }}
                                                className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                                            >
                                                + Đồ
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDrawerClick(selectedFurniture.id, drawer.id);
                                                }}
                                                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                                            >
                                                {drawer.isOpen ? 'Đóng' : 'Mở'}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteDrawer(selectedFurniture.id, drawer.id);
                                                }}
                                                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-xs opacity-75">
                                        Vị trí: X={displayValue(drawer.position[0])}, Y={displayValue(drawer.position[1])} {unit}
                                    </div>
                                    <div className="text-xs opacity-75">{drawer.items.length} món đồ</div>
                                    {drawer.items.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {drawer.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="text-xs bg-slate-800 p-1 rounded flex items-center gap-2"
                                                >
                                                    <div
                                                        className="w-3 h-3 rounded"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="text-slate-300">{item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}