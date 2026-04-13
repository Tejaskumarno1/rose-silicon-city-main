import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { powerState } from './powerState';

// Cached world position vector
const _worldPos = new THREE.Vector3();

export const PowerWrapper = ({ children }: { children: React.ReactNode }) => {
    const groupRef = useRef<THREE.Group>(null);
    const initDone = useRef(false);
    const fullyPowered = useRef(false);

    useFrame((state, delta) => {
        if (powerState.active) {
            powerState.waveZ -= delta * 40;
        }

        // Once all objects are powered, skip the expensive traverse
        if (fullyPowered.current) return;

        if (groupRef.current) {
            let allPowered = true;

            groupRef.current.traverse((child) => {
                const isMesh = (child as THREE.Mesh).isMesh;
                const isLine = (child as any).isLineSegments;
                const isPoints = (child as any).isPoints;

                if (isMesh || isLine || isPoints) {
                    const mesh = child as THREE.Mesh;
                    const mat = mesh.material as any;
                    if (!mat) return;

                    if (mesh.userData.worldZ === undefined) {
                        mesh.getWorldPosition(_worldPos);
                        mesh.userData.worldZ = _worldPos.z;
                    }
                    const worldZ = mesh.userData.worldZ;

                    const isPowered = worldZ > powerState.waveZ;
                    const isFlickeringZone = worldZ < powerState.waveZ + 15 && worldZ > powerState.waveZ;
                    let finalPowered = isPowered;
                    if (isFlickeringZone && powerState.active) {
                        finalPowered = Math.random() > 0.3;
                        allPowered = false; // still flickering
                    }

                    if (!isPowered) allPowered = false;

                    if (!mesh.userData.originalEmissiveInit) {
                        mesh.userData.originalEmissive = mat.emissiveIntensity !== undefined ? mat.emissiveIntensity : 0;
                        mesh.userData.originalOpacity = mat.opacity !== undefined ? mat.opacity : 1;
                        if (mat.type === 'LineBasicMaterial') {
                            mesh.userData.isEdges = true;
                        }
                        if (isPoints) {
                            mesh.userData.isPoints = true;
                        }
                        mesh.userData.originalEmissiveInit = true;
                    }

                    if (mesh.userData.isEdges) {
                        mat.transparent = true;
                        mat.opacity = finalPowered ? mesh.userData.originalOpacity : 0.01;
                    } else if (mesh.userData.isPoints) {
                        mat.transparent = true;
                        mat.opacity = finalPowered ? mesh.userData.originalOpacity : 0;
                    } else {
                        if (mesh.userData.originalEmissive > 0) {
                            mat.emissiveIntensity = finalPowered ? mesh.userData.originalEmissive : 0;
                        }
                        if (mat.blending === THREE.AdditiveBlending) {
                            mat.transparent = true;
                            mat.opacity = finalPowered ? mesh.userData.originalOpacity : 0;
                        }
                        if (mesh.userData.originalEmissive === 0 && !mesh.userData.isEdges && mat.blending !== THREE.AdditiveBlending) {
                            mesh.visible = finalPowered;
                        }
                    }
                }
            });

            // If all objects are now powered, stop traversing forever
            if (allPowered && powerState.active) {
                fullyPowered.current = true;
            }
        }
    });

    return <group ref={groupRef}>{children}</group>;
};
